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

async function gestacoesHandler(req, res) {
  if (req.method === 'GET') {
    const { situacao, paiSerie, paiRg, maeSerie, maeRg, receptoraNome, startDate, endDate } = req.query
    
    const filtros = {}
    if (situacao) filtros.situacao = situacao
    if (paiSerie) filtros.paiSerie = paiSerie
    if (paiRg) filtros.paiRg = paiRg
    if (maeSerie) filtros.maeSerie = maeSerie
    if (maeRg) filtros.maeRg = maeRg
    if (receptoraNome) filtros.receptoraNome = receptoraNome
    if (startDate) filtros.startDate = startDate
    if (endDate) filtros.endDate = endDate
    
    const gestacoes = await databaseService.buscarGestacoes(filtros)
    
    return sendSuccess(res, gestacoes, `${gestacoes.length} gestações encontradas`, HTTP_STATUS.OK, {
      count: gestacoes.length,
      filters: filtros
    })
    
  } else if (req.method === 'POST') {
    // Validar dados obrigatórios
    const { data_cobertura } = req.body
    
    if (!data_cobertura) {
      return sendValidationError(res, 'Data de cobertura é obrigatória', {
        required: ['data_cobertura'],
        provided: { data_cobertura: !!data_cobertura }
      })
    }
    
    // Criar gestação
    const gestacaoData = {
      pai_serie: req.body.paiSerie || null,
      pai_rg: req.body.paiRg || null,
      mae_serie: req.body.maeSerie || null,
      mae_rg: req.body.maeRg || null,
      receptora_nome: req.body.receptoraNome || null,
      receptora_serie: req.body.receptoraSerie || null,
      receptora_rg: req.body.receptoraRg || null,
      data_cobertura: req.body.data_cobertura,
      custo_acumulado: req.body.custoAcumulado ? parseFloat(req.body.custoAcumulado) : 0,
      situacao: req.body.situacao || 'Ativa',
      observacoes: req.body.observacoes || null
    }
    
    try {
      const gestacao = await databaseService.criarGestacao(gestacaoData)
      
      return sendSuccess(res, gestacao, 'Gestação registrada com sucesso', HTTP_STATUS.CREATED)
      
    } catch (error) {
      // Tratar erros específicos do banco de dados
      if (error.code === '23505') {
        return sendConflict(res, 'Gestação duplicada', {
          data_cobertura: req.body.data_cobertura
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
      return sendValidationError(res, 'ID da gestação é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Atualização de gestação não implementada ainda
    return sendNotImplemented(res, 'Atualização de gestação não implementada ainda')
    
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID da gestação é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Exclusão de gestação não implementada ainda
    return sendNotImplemented(res, 'Exclusão de gestação não implementada ainda')
    
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

// Determinar configuração de lote baseado no método
function getGestacaoLoteConfig(req) {
  switch (req.method) {
    case 'POST':
      return LOTE_CONFIGS.CADASTRO_GESTACAO
    case 'PUT':
      return LOTE_CONFIGS.ATUALIZACAO_GESTACAO
    case 'DELETE':
      return LOTE_CONFIGS.EXCLUSAO_GESTACAO
    default:
      return null
  }
}

export default asyncHandler(withLoteTracking(gestacoesHandler, getGestacaoLoteConfig))
