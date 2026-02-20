import databaseService from '../../services/databaseService'
import logger from '../../utils/logger'
import { sendSuccess, sendError, sendValidationError, sendConflict, sendMethodNotAllowed, asyncHandler, HTTP_STATUS } from '../../utils/apiResponse'

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const causas = await databaseService.buscarCausasMorte()
      
      return sendSuccess(res, causas, 'Causas de morte obtidas com sucesso', HTTP_STATUS.OK, {
        count: causas.length
      })
      
    } else if (req.method === 'POST') {
      const { causa } = req.body
      
      if (!causa || causa.trim() === '') {
        return sendValidationError(res, [{ field: 'causa', message: 'Causa de morte é obrigatória' }])
      }
      
      // Verificar se a causa já existe
      const causasExistentes = await databaseService.buscarCausasMorte()
      const causaExistente = causasExistentes.find(c => 
        c.causa.toLowerCase() === causa.toLowerCase()
      )
      
      if (causaExistente) {
        return sendConflict(res, 'Causa de morte')
      }
      
      const novaCausa = await databaseService.adicionarCausaMorte(causa.trim())
      
      return sendSuccess(res, novaCausa, 'Causa de morte adicionada com sucesso', HTTP_STATUS.CREATED)
      
    } else if (req.method === 'DELETE') {
      const { id } = req.query
      
      if (!id) {
        return sendValidationError(res, [{ field: 'id', message: 'ID da causa é obrigatório' }])
      }
      
      await databaseService.removerCausaMorte(id)
      
      return sendSuccess(res, null, 'Causa de morte removida com sucesso')
      
    } else {
      return sendMethodNotAllowed(res, req.method)
    }
    
  } catch (error) {
    logger.error('Erro na API de causas de morte:', error)
    return sendError(res, 'Erro interno do servidor', HTTP_STATUS.INTERNAL_SERVER_ERROR, 
      process.env.NODE_ENV === 'development' ? error.message : undefined)
  }
}

export default asyncHandler(handler)
