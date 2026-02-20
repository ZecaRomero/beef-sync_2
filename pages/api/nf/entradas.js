import { sendSuccess, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

// API simplificada para NFs de entrada (sem PostgreSQL por enquanto)
async function handler(req, res) {
  if (req.method === 'GET') {
    // Por enquanto, retorna array vazio
    // Em produção, isso seria conectado ao PostgreSQL
    const nfs = []
    return sendSuccess(res, nfs)
  } else {
    return sendMethodNotAllowed(res, 'GET')
  }
}

export default asyncHandler(handler)