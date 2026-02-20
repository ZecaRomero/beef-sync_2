const NFService = require('@/lib/NFService')
import { sendSuccess, sendValidationError, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

// API para gerenciar NFs (POST, PUT, DELETE)
async function handler(req, res) {
  const { method } = req
  
  switch (method) {
    case 'POST':
      // Criar nova NF
      const novaNF = await NFService.createNotaFiscal(req.body)
      return sendSuccess(res, novaNF, 'NF criada com sucesso', 201)
      
    case 'PUT':
      // Atualizar NF existente
      const { id } = req.query
      if (!id) {
        return sendValidationError(res, 'ID da NF é obrigatório')
      }
      
      const nfAtualizada = await NFService.updateNotaFiscal(id, req.body)
      return sendSuccess(res, nfAtualizada, 'NF atualizada com sucesso')
      
    case 'DELETE':
      // Deletar NF
      const { id: deleteId } = req.query
      if (!deleteId) {
        return sendValidationError(res, 'ID da NF é obrigatório')
      }
      
      await NFService.deleteNotaFiscal(deleteId)
      return sendSuccess(res, null, 'NF excluída com sucesso')
      
    default:
      return sendMethodNotAllowed(res, 'POST, PUT, DELETE')
  }
}

export default asyncHandler(handler)