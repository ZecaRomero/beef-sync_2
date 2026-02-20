const NFService = require('@/lib/NFService')
import { sendSuccess, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

// GET /api/nf/saidas - Buscar NFs de saída
async function handler(req, res) {
  if (req.method === 'GET') {
    const { tipo, status, dataInicio, dataFim, fornecedor } = req.query
    
    const filtros = {
      tipo: tipo || 'saida',
      status,
      dataInicio,
      dataFim,
      fornecedor
    }
    
    const nfs = await NFService.getNotasFiscais(filtros)
    return sendSuccess(res, nfs)
  } else {
    return sendMethodNotAllowed(res, 'GET')
  }
}

export default asyncHandler(handler)