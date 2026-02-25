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
    await ensureLocalizacoesIndex()

    // 1. Verificar quais animais existem (uma única query)
    const animaisExistentes = await query(
      'SELECT id, serie, rg FROM animais WHERE id = ANY($1)',
      [animal_ids]
    )
    const idsExistentes = new Set(animaisExistentes.rows.map(a => a.id))
    const mapaAnimais = Object.fromEntries(animaisExistentes.rows.map(a => [a.id, a]))

    const errors = []
    for (const id of animal_ids) {
      if (!idsExistentes.has(id)) errors.push(`Animal com ID ${id} não encontrado`)
    }

    const idsParaProcessar = animal_ids.filter(id => idsExistentes.has(id))
    if (idsParaProcessar.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum animal válido para processar',
        errors
      })
    }

    // 2. Finalizar localizações anteriores em lote (uma única query)
    await query(`
      UPDATE localizacoes_animais 
      SET data_saida = $1, updated_at = CURRENT_TIMESTAMP
      WHERE animal_id = ANY($2) AND data_saida IS NULL
    `, [data_movimentacao, idsParaProcessar])

    // 3. Inserir novas localizações em lote (usando unnest para bulk insert)
    const motivo = motivo_movimentacao || 'Movimentação em lote'
    const obs = observacoes || null
    const usuario = usuario_responsavel || 'Sistema'

    const insertResult = await query(`
      INSERT INTO localizacoes_animais (animal_id, piquete, data_entrada, motivo_movimentacao, observacoes, usuario_responsavel)
      SELECT unnest($1::int[]), $2, $3, $4, $5, $6
      RETURNING id, animal_id, piquete, data_entrada
    `, [idsParaProcessar, piquete_destino, data_movimentacao, motivo, obs, usuario])

    const results = insertResult.rows.map(row => ({
      animal_id: row.animal_id,
      animal_info: mapaAnimais[row.animal_id] ? `${mapaAnimais[row.animal_id].serie}${mapaAnimais[row.animal_id].rg}` : String(row.animal_id),
      localizacao: row,
      success: true
    }))

    logger.info(`${results.length} animais movidos para ${piquete_destino} em lote`)

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

async function ensureLocalizacoesIndex() {
  try {
    await query(`
      ALTER TABLE localizacoes_animais
      DROP CONSTRAINT IF EXISTS localizacoes_animais_animal_id_key
    `)
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_localizacoes_animais_animal_id_ativa
      ON localizacoes_animais (animal_id) WHERE data_saida IS NULL
    `)
  } catch (e) {
    logger.error('Falha ao garantir índice de localizações:', e)
  }
}
