import databaseService from '../../services/databaseService'
import { logger } from '../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendConflict, 
  sendMethodNotAllowed, 
  sendNotImplemented,
  asyncHandler, 
  HTTP_STATUS 
} from '../../utils/apiResponse'
import { withLoteTracking, LOTE_CONFIGS } from '../../utils/loteMiddleware'

async function nascimentosHandler(req, res) {
  if (req.method === 'GET') {
    const { limit = 50, gestacaoId, serie, rg, sexo, startDate, endDate } = req.query
    
    const filtros = {}
    if (gestacaoId) filtros.gestacaoId = parseInt(gestacaoId)
    if (serie) filtros.serie = serie
    if (rg) filtros.rg = rg
    if (sexo) filtros.sexo = sexo
    if (startDate) filtros.startDate = startDate
    if (endDate) filtros.endDate = endDate
    if (limit) filtros.limit = parseInt(limit)
    
    const nascimentos = await databaseService.buscarNascimentos(filtros)
    
    return sendSuccess(res, nascimentos, `${nascimentos.length} nascimentos encontrados`, HTTP_STATUS.OK, {
      count: nascimentos.length,
      filters: filtros
    })
    
  } else if (req.method === 'POST') {
    // Validar dados obrigatórios
    const { serie, rg, sexo, data_nascimento } = req.body
    
    if (!serie || !rg || !sexo || !data_nascimento) {
      return sendValidationError(res, 'Dados obrigatórios não fornecidos', {
        required: ['serie', 'rg', 'sexo', 'data_nascimento'],
        provided: { 
          serie: !!serie, 
          rg: !!rg, 
          sexo: !!sexo, 
          data_nascimento: !!data_nascimento 
        }
      })
    }
    
    // Verificar se já existe um nascimento com este RG
    const nascimentosExistentes = await databaseService.buscarNascimentos({ rg })
    if (nascimentosExistentes.length > 0) {
      return sendConflict(res, 'RG já existe nos nascimentos', {
        rg: req.body.rg,
        existingCount: nascimentosExistentes.length
      })
    }
    
    // Criar nascimento
    const nascimentoData = {
      gestacao_id: req.body.gestacaoId || null,
      serie: req.body.serie,
      rg: req.body.rg,
      sexo: req.body.sexo,
      data_nascimento: req.body.data_nascimento,
      hora_nascimento: req.body.hora_nascimento || null,
      peso: req.body.peso ? parseFloat(req.body.peso) : null,
      cor: req.body.cor || null,
      tipo_nascimento: req.body.tipo_nascimento || null,
      dificuldade_parto: req.body.dificuldade_parto || null,
      custo_nascimento: req.body.custo_nascimento ? parseFloat(req.body.custo_nascimento) : 0,
      veterinario: req.body.veterinario || null,
      observacoes: req.body.observacoes || null
    }
    
    try {
      const nascimento = await databaseService.registrarNascimento(nascimentoData)
      
      return sendSuccess(res, nascimento, 'Nascimento registrado com sucesso', HTTP_STATUS.CREATED)
      
    } catch (error) {
      // Tratar erros específicos do banco de dados
      if (error.code === '23505') {
        return sendConflict(res, 'Nascimento duplicado', {
          serie: req.body.serie,
          rg: req.body.rg
        })
      } else if (error.code === '23502') {
        return sendValidationError(res, 'Dados obrigatórios não fornecidos', {
          field: error.column,
          constraint: 'NOT NULL'
        })
      } else if (error.code === '23514') {
        return sendValidationError(res, 'Valor inválido fornecido', {
          constraint: 'CHECK',
          detail: error.detail
        })
      }
      
      throw error // Re-throw para ser capturado pelo asyncHandler
    }
    
  } else if (req.method === 'PUT') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID do nascimento é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Atualização de nascimento não implementada ainda
    return sendNotImplemented(res, 'Atualização de nascimento não implementada ainda')
    
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID do nascimento é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Exclusão de nascimento não implementada ainda
    return sendNotImplemented(res, 'Exclusão de nascimento não implementada ainda')
    
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

function getNascimentoLoteConfig(req) {
  switch (req.method) {
    case 'POST':
      return LOTE_CONFIGS.REGISTRO_NASCIMENTO
    case 'DELETE':
      return LOTE_CONFIGS.EXCLUSAO_NASCIMENTO
    default:
      return null
  }
}

export default asyncHandler(withLoteTracking(nascimentosHandler, getNascimentoLoteConfig))
