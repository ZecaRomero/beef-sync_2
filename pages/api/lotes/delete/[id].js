import { 
  sendSuccess, 
  sendValidationError, 
  sendMethodNotAllowed, 
  sendNotFound,
  asyncHandler, 
  HTTP_STATUS 
} from '../../../../utils/apiResponse'

const { pool } = require('../../../../lib/database')
const { logger } = require('../../../../utils/logger')

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return sendMethodNotAllowed(res, ['DELETE'])
  }

  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID do lote é obrigatório')
  }

  try {
    logger.info(`[API Lotes Delete] Excluindo lote ID: ${id}`)
    
    // Verificar se o lote existe
    const checkQuery = 'SELECT numero_lote FROM lotes_operacoes WHERE id = $1'
    const checkResult = await pool.query(checkQuery, [id])

    if (checkResult.rows.length === 0) {
      logger.warn(`[API Lotes Delete] Lote não encontrado: ${id}`)
      return sendNotFound(res, 'Lote não encontrado')
    }

    const numeroLote = checkResult.rows[0].numero_lote

    // Excluir o lote
    const deleteQuery = 'DELETE FROM lotes_operacoes WHERE id = $1'
    await pool.query(deleteQuery, [id])

    logger.info(`[API Lotes Delete] Lote ${numeroLote} excluído com sucesso`)

    return sendSuccess(res, { 
      id: parseInt(id), 
      numero_lote: numeroLote 
    }, `Lote ${numeroLote} excluído com sucesso`)

  } catch (error) {
    logger.error('[API Lotes Delete] Erro ao excluir lote:', { error: error.message, id })
    throw error
  }
})
