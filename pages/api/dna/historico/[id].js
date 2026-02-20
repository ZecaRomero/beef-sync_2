import { query } from '../../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'ID do envio é obrigatório' })
  }

  if (req.method === 'DELETE') {
    try {
      // Buscar informações do envio antes de excluir
      const envioResult = await query(
        'SELECT * FROM dna_envios WHERE id = $1',
        [id]
      )

      if (envioResult.rows.length === 0) {
        return res.status(404).json({ message: 'Envio não encontrado' })
      }

      const envio = envioResult.rows[0]

      // Buscar os animais vinculados ao envio
      const animaisResult = await query(
        'SELECT animal_id FROM dna_animais WHERE envio_id = $1',
        [id]
      )

      const animalIds = animaisResult.rows.map(row => row.animal_id)

      // Limpar informações de DNA dos animais
      if (animalIds.length > 0) {
        // Para cada animal, recalcular os custos e laboratórios após a exclusão
        for (const animalId of animalIds) {
          // Buscar outros envios deste animal (exceto o que está sendo excluído)
          const outrosEnviosResult = await query(
            `SELECT de.laboratorio, de.custo_por_animal
             FROM dna_envios de
             INNER JOIN dna_animais da ON da.envio_id = de.id
             WHERE da.animal_id = $1 AND de.id != $2
             ORDER BY de.data_envio DESC`,
            [animalId, id]
          )

          if (outrosEnviosResult.rows.length === 0) {
            // Não há outros envios, limpar tudo
            await query(
              `UPDATE animais
               SET 
                 laboratorio_dna = NULL,
                 data_envio_dna = NULL,
                 custo_dna = NULL,
                 updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [animalId]
            )
          } else {
            // Recalcular custos e laboratórios
            const custoTotal = outrosEnviosResult.rows.reduce((sum, e) => sum + parseFloat(e.custo_por_animal), 0)
            const labs = [...new Set(outrosEnviosResult.rows.map(e => e.laboratorio))].join(', ')
            
            await query(
              `UPDATE animais
               SET 
                 laboratorio_dna = $1,
                 custo_dna = $2,
                 updated_at = CURRENT_TIMESTAMP
               WHERE id = $3`,
              [labs, custoTotal, animalId]
            )
          }
        }
      }

      // Excluir os custos de DNA associados aos animais deste envio
      // Filtramos pela data e laboratório para garantir que estamos excluindo os custos corretos
      if (animalIds.length > 0) {
        await query(
          `DELETE FROM custos 
           WHERE animal_id = ANY($1) 
           AND tipo = 'DNA' 
           AND subtipo = 'Análise Genética'
           AND data = $2
           AND observacoes LIKE $3`,
          [animalIds, envio.data_envio, `%${envio.laboratorio}%`]
        )
      }

      // Excluir os registros relacionados na tabela dna_animais
      await query(
        'DELETE FROM dna_animais WHERE envio_id = $1',
        [id]
      )

      // Excluir o envio
      const result = await query(
        'DELETE FROM dna_envios WHERE id = $1 RETURNING *',
        [id]
      )

      res.status(200).json({
        success: true,
        message: 'Envio e custos excluídos com sucesso',
        data: {
          envio: result.rows[0],
          animaisAfetados: animalIds.length,
          custosRemovidos: animalIds.length
        }
      })
    } catch (error) {
      console.error('Erro ao excluir envio:', error)
      res.status(500).json({ 
        message: 'Erro ao excluir envio', 
        error: error.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
