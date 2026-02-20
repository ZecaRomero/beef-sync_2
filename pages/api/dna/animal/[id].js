import { query } from '../../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'ID do animal é obrigatório' })
  }

  if (req.method === 'GET') {
    try {
      // Buscar todos os envios deste animal
      const result = await query(
        `SELECT 
          de.id as envio_id,
          de.laboratorio,
          de.data_envio,
          de.custo_por_animal,
          de.observacoes,
          de.created_at
        FROM dna_envios de
        INNER JOIN dna_animais da ON da.envio_id = de.id
        WHERE da.animal_id = $1
        ORDER BY de.data_envio DESC, de.created_at DESC`,
        [id]
      )

      // Buscar informações do animal
      const animalResult = await query(
        `SELECT 
          id,
          serie,
          rg,
          nome,
          laboratorio_dna,
          data_envio_dna,
          custo_dna
        FROM animais
        WHERE id = $1`,
        [id]
      )

      if (animalResult.rows.length === 0) {
        return res.status(404).json({ message: 'Animal não encontrado' })
      }

      const animal = animalResult.rows[0]
      const envios = result.rows

      // Calcular total de custos
      const custoTotal = envios.reduce((sum, envio) => sum + parseFloat(envio.custo_por_animal), 0)

      res.status(200).json({
        success: true,
        data: {
          animal: {
            id: animal.id,
            serie: animal.serie,
            rg: animal.rg,
            nome: animal.nome,
            laboratorio_dna: animal.laboratorio_dna,
            data_envio_dna: animal.data_envio_dna,
            custo_dna: animal.custo_dna
          },
          envios: envios,
          total_envios: envios.length,
          custo_total: custoTotal
        }
      })
    } catch (error) {
      console.error('Erro ao buscar envios do animal:', error)
      res.status(500).json({ 
        message: 'Erro ao buscar envios do animal', 
        error: error.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
