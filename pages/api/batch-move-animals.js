const { query } = require('../../lib/database')
const logger = require('../../utils/logger.cjs')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Método ${req.method} não permitido` })
  }

  const {
    animal_ids,
    piquete_destino,
    data_movimentacao,
    motivo_movimentacao,
    observacoes,
    usuario_responsavel
  } = req.body

  // Validações
  if (!animal_ids || !Array.isArray(animal_ids) || animal_ids.length === 0) {
    return res.status(400).json({
      error: 'Lista de IDs dos animais é obrigatória'
    })
  }

  if (!piquete_destino || !data_movimentacao) {
    return res.status(400).json({
      error: 'Piquete de destino e data de movimentação são obrigatórios'
    })
  }

  try {
    const results = []
    const errors = []

    // Processar cada animal
    for (const animal_id of animal_ids) {
      try {
        // Verificar se o animal existe
        const animalResult = await query(
          'SELECT id, serie, rg FROM animais WHERE id = $1',
          [animal_id]
        )

        if (animalResult.rows.length === 0) {
          errors.push(`Animal com ID ${animal_id} não encontrado`)
          continue
        }

        const animal = animalResult.rows[0]

        // Finalizar localização anterior (se existir)
        await query(`
          UPDATE localizacoes_animais 
          SET data_saida = $1, updated_at = CURRENT_TIMESTAMP
          WHERE animal_id = $2 AND data_saida IS NULL
        `, [data_movimentacao, animal_id])

        // Criar nova localização
        const localizacaoResult = await query(`
          INSERT INTO localizacoes_animais (
            animal_id, piquete, data_entrada, motivo_movimentacao, 
            observacoes, usuario_responsavel
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          animal_id,
          piquete_destino,
          data_movimentacao,
          motivo_movimentacao || 'Movimentação em lote',
          observacoes || null,
          usuario_responsavel || 'Sistema'
        ])

        results.push({
          animal_id,
          animal_info: `${animal.serie}${animal.rg}`,
          localizacao: localizacaoResult.rows[0],
          success: true
        })

        logger.info(`Animal ${animal.serie}${animal.rg} movido para ${piquete_destino}`)

      } catch (error) {
        logger.error(`Erro ao mover animal ${animal_id}:`, error)
        errors.push(`Erro ao mover animal ${animal_id}: ${error.message}`)
      }
    }

    // Resposta consolidada
    const response = {
      success: errors.length === 0,
      total_processed: animal_ids.length,
      successful_moves: results.length,
      failed_moves: errors.length,
      results,
      errors
    }

    if (errors.length > 0) {
      response.message = `${results.length} animais movidos com sucesso, ${errors.length} falharam`
    } else {
      response.message = `Todos os ${results.length} animais foram movidos com sucesso para ${piquete_destino}`
    }

    const statusCode = errors.length === 0 ? 200 : 207 // 207 = Multi-Status
    res.status(statusCode).json(response)

  } catch (error) {
    logger.error('Erro na movimentação em lote:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}