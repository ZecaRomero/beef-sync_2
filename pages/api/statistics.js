import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'
import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../utils/apiResponse'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const statistics = await databaseService.obterEstatisticas()
      return sendSuccess(res, statistics, 'Estatísticas obtidas com sucesso')
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error)
      return sendError(res, 'Erro ao obter estatísticas', 500, error.message)
    }
  } else {
    return sendMethodNotAllowed(res, req.method)
  }
}

export default asyncHandler(handler)
