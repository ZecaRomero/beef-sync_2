import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendValidationError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return sendMethodNotAllowed(res, 'DELETE')
  }

  const { ids } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return sendValidationError(res, 'IDs são obrigatórios e devem ser um array')
  }

  try {
    // Verificar se os lotes existem antes de excluir
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ')
    const checkQuery = `SELECT id, numero_lote FROM lotes_operacoes WHERE id IN (${placeholders})`
    
    const existingLotes = await query(checkQuery, ids)
    
    if (existingLotes.rows.length === 0) {
      return sendValidationError(res, 'Nenhum lote encontrado com os IDs fornecidos')
    }

    // Excluir os lotes
    const deleteQuery = `DELETE FROM lotes_operacoes WHERE id IN (${placeholders}) RETURNING id, numero_lote`
    const result = await query(deleteQuery, ids)

    logger.info('Lotes excluídos em massa', {
      quantidade: result.rows.length,
      lotes: result.rows.map(row => row.numero_lote),
      ids: result.rows.map(row => row.id)
    })

    return sendSuccess(res, {
      deletedCount: result.rows.length,
      deletedLotes: result.rows
    }, `${result.rows.length} lote(s) excluído(s) com sucesso`)

  } catch (error) {
    logger.error('Erro ao excluir lotes em massa:', error)
    return sendError(res, 'Erro interno do servidor ao excluir lotes')
  }
}

export default asyncHandler(handler)