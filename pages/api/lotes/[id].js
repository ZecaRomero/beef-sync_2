import { 
  sendSuccess, 
  sendValidationError, 
  sendMethodNotAllowed, 
  sendNotFound,
  asyncHandler, 
  HTTP_STATUS 
} from '../../../utils/apiResponse'

const { pool } = require('../../../lib/database')
const { logger } = require('../../../utils/logger')

export default asyncHandler(async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar lote específico
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID do lote é obrigatório')
    }

    try {
      logger.info(`[API Lotes] Buscando lote ID: ${id}`)
      
      const query = `
        SELECT 
          id, numero_lote, tipo_operacao, descricao, detalhes,
          usuario, quantidade_registros, modulo, ip_origem, user_agent,
          status, data_criacao, updated_at
        FROM lotes_operacoes 
        WHERE id = $1
      `

      const result = await pool.query(query, [id])

      if (result.rows.length === 0) {
        logger.warn(`[API Lotes] Lote não encontrado: ${id}`)
        return sendNotFound(res, 'Lote não encontrado')
      }

      logger.debug(`[API Lotes] Lote encontrado: ${result.rows[0].numero_lote}`)
      return sendSuccess(res, result.rows[0])

    } catch (error) {
      logger.error('[API Lotes] Erro ao buscar lote:', { error: error.message, id })
      throw error
    }

  } else if (req.method === 'PUT') {
    // Editar lote
    const { id } = req.query
    const { 
      tipo_operacao, 
      descricao, 
      detalhes, 
      usuario, 
      quantidade_registros, 
      modulo, 
      status 
    } = req.body

    if (!id) {
      return sendValidationError(res, 'ID do lote é obrigatório')
    }

    // Validar campos obrigatórios
    if (!tipo_operacao || !descricao || !modulo) {
      return sendValidationError(res, 'Tipo de operação, descrição e módulo são obrigatórios')
    }

    try {
      logger.info(`[API Lotes] Atualizando lote ID: ${id}`)
      
      // Verificar se o lote existe
      const checkQuery = 'SELECT id FROM lotes_operacoes WHERE id = $1'
      const checkResult = await pool.query(checkQuery, [id])

      if (checkResult.rows.length === 0) {
        return sendNotFound(res, 'Lote não encontrado')
      }

      // Atualizar o lote
      const updateQuery = `
        UPDATE lotes_operacoes 
        SET 
          tipo_operacao = $1,
          descricao = $2,
          detalhes = $3,
          usuario = $4,
          quantidade_registros = $5,
          modulo = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `

      const values = [
        tipo_operacao,
        descricao,
        detalhes ? JSON.stringify(detalhes) : null,
        usuario,
        quantidade_registros || 1,
        modulo,
        status || 'concluido',
        id
      ]

      const result = await pool.query(updateQuery, values)
      const loteAtualizado = result.rows[0]

      logger.info(`[API Lotes] Lote ${loteAtualizado.numero_lote} atualizado com sucesso`)

      return sendSuccess(res, loteAtualizado, 'Lote atualizado com sucesso')

    } catch (error) {
      logger.error('[API Lotes] Erro ao atualizar lote:', { error: error.message, id })
      throw error
    }

  } else {
    return sendMethodNotAllowed(res, ['GET', 'PUT'])
  }
})
