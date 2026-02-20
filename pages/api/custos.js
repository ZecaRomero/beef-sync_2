import databaseService from '../../services/databaseService'
import { logger } from '../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendConflict, 
  sendNotFound,
  sendMethodNotAllowed, 
  sendNotImplemented,
  asyncHandler, 
  HTTP_STATUS 
} from '../../utils/apiResponse'
import { withLoteTracking, LOTE_CONFIGS } from '../../utils/loteMiddleware'

async function custosHandler(req, res) {
  if (req.method === 'GET') {
    const { animalId, tipo, subtipo, startDate, endDate, limit = 100 } = req.query
    
    let custos = []
    
    if (animalId) {
      // Buscar custos de um animal específico
      custos = await databaseService.buscarCustosAnimal(parseInt(animalId))
    } else {
      // Buscar todos os custos com filtros
      const filtros = {}
      if (tipo) filtros.tipo = tipo
      if (subtipo) filtros.subtipo = subtipo
      if (startDate) filtros.startDate = startDate
      if (endDate) filtros.endDate = endDate
      
      custos = await databaseService.buscarTodosCustos(parseInt(limit))
    }
    
    return sendSuccess(res, custos, `${custos.length} custos encontrados`, HTTP_STATUS.OK, {
      count: custos.length,
      filters: { animalId, tipo, subtipo, startDate, endDate, limit }
    })
    
  } else if (req.method === 'POST') {
    // Validar dados obrigatórios
    const { animalId, tipo, valor, data } = req.body
    
    if (!animalId || !tipo || !valor || !data) {
      return sendValidationError(res, {
        required: ['animalId', 'tipo', 'valor', 'data'],
        provided: { 
          animalId: !!animalId, 
          tipo: !!tipo, 
          valor: !!valor, 
          data: !!data 
        }
      }, 'Dados obrigatórios não fornecidos')
    }
    
    // Verificar se o animal existe
    const animal = await databaseService.buscarAnimalPorId(parseInt(animalId))
    if (!animal) {
      return sendNotFound(res, 'Animal')
    }
    
    // Criar custo
    const custoData = {
      animal_id: parseInt(animalId),
      tipo: req.body.tipo,
      subtipo: req.body.subtipo || null,
      valor: parseFloat(req.body.valor),
      data: req.body.data,
      observacoes: req.body.observacoes || null,
      detalhes: req.body.detalhes ? JSON.stringify(req.body.detalhes) : null
    }
    
    try {
      const custo = await databaseService.adicionarCusto(parseInt(animalId), custoData)
      
      // Atualizar custo total do animal
      await databaseService.atualizarCustoTotalAnimal(parseInt(animalId))
      
      return sendSuccess(res, custo, 'Custo adicionado com sucesso', HTTP_STATUS.CREATED)
      
    } catch (error) {
      // Tratar erros específicos do banco de dados
      if (error.code === '23505') {
        return sendConflict(res, 'Custo duplicado', {
          animalId: parseInt(animalId),
          tipo: req.body.tipo
        })
      } else if (error.code === '23502') {
        return sendValidationError(res, {
          field: error.column,
          constraint: 'NOT NULL'
        }, 'Dados obrigatórios não fornecidos')
      } else if (error.code === '23514') {
        return sendValidationError(res, {
          constraint: 'CHECK',
          detail: error.detail
        }, 'Valor inválido fornecido')
      }
      
      throw error // Re-throw para ser capturado pelo asyncHandler
    }
    
  } else if (req.method === 'PUT') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, {
        required: ['id'],
        provided: { id: !!id }
      }, 'ID do custo é obrigatório')
    }
    
    // Atualização de custo não implementada ainda
    return sendNotImplemented(res, 'Atualização de custo não implementada ainda')
    
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, {
        required: ['id'],
        provided: { id: !!id }
      }, 'ID do custo é obrigatório')
    }
    
    // Exclusão de custo não implementada ainda
    return sendNotImplemented(res, 'Exclusão de custo não implementada ainda')
    
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

// Determinar configuração de lote baseado no método
function getCustoLoteConfig(req) {
  switch (req.method) {
    case 'POST':
      return LOTE_CONFIGS.LANCAMENTO_CUSTO
    case 'PUT':
      return LOTE_CONFIGS.ATUALIZACAO_CUSTO
    case 'DELETE':
      return LOTE_CONFIGS.EXCLUSAO_CUSTO
    default:
      return null
  }
}

export default asyncHandler(withLoteTracking(custosHandler, getCustoLoteConfig))
