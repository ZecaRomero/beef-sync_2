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

async function mortesHandler(req, res) {
  if (req.method === 'GET') {
    const { animalId, causa, startDate, endDate, limit = 100 } = req.query
    
    const filtros = {}
    if (animalId) filtros.animalId = parseInt(animalId)
    if (causa) filtros.causa = causa
    if (startDate) filtros.startDate = startDate
    if (endDate) filtros.endDate = endDate
    if (limit) filtros.limit = parseInt(limit)
    
    const mortes = await databaseService.buscarMortes(filtros)
    
    return sendSuccess(res, mortes, `${mortes.length} mortes encontradas`, HTTP_STATUS.OK, {
      count: mortes.length,
      filters: filtros
    })
    
  } else if (req.method === 'POST') {
    // Validar dados obrigatórios
    const { animalId, data_morte, causa_morte } = req.body
    
    if (!animalId || !data_morte || !causa_morte) {
      return sendValidationError(res, 'Dados obrigatórios não fornecidos', {
        required: ['animalId', 'data_morte', 'causa_morte'],
        provided: { 
          animalId: !!animalId, 
          data_morte: !!data_morte, 
          causa_morte: !!causa_morte 
        }
      })
    }
    
    // Verificar se o animal existe
    const animal = await databaseService.buscarAnimalPorId(parseInt(animalId))
    if (!animal) {
      return sendNotFound(res, 'Animal não encontrado', {
        animalId: parseInt(animalId)
      })
    }
    
    // Verificar se já existe uma morte registrada para este animal
    const mortesExistentes = await databaseService.buscarMortes({ animalId: parseInt(animalId) })
    if (mortesExistentes.length > 0) {
      return sendConflict(res, 'Morte já registrada para este animal', {
        animalId: parseInt(animalId),
        existingCount: mortesExistentes.length
      })
    }
    
    // Registrar morte
    const morteData = {
      animal_id: parseInt(animalId),
      data_morte: req.body.data_morte,
      causa_morte: req.body.causa_morte,
      observacoes: req.body.observacoes || null,
      valor_perda: req.body.valorPerda ? parseFloat(req.body.valorPerda) : 0
    }
    
    try {
      const morte = await databaseService.registrarMorte(morteData)
      
      // Atualizar situação do animal para "Morto"
      await databaseService.atualizarSituacaoAnimal(parseInt(animalId), 'Morto')
      
      // SINCRONIZAR: Registrar também na tabela historia_ocorrencias
      try {
        const { pool } = require('../../lib/database')
        const client = await pool.connect()
        
        // Verificar se a tabela historia_ocorrencias existe
        const checkTable = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'historia_ocorrencias'
          )
        `)
        
        if (checkTable.rows[0].exists) {
          // Inserir na historia_ocorrencias
          const historiaQuery = `
            INSERT INTO historia_ocorrencias (
              animal_id, tipo, data, descricao, observacoes, valor
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `
          
          await client.query(historiaQuery, [
            parseInt(animalId),
            'morte',
            req.body.data_morte,
            `Morte: ${req.body.causa_morte}`,
            req.body.observacoes || null,
            req.body.valorPerda ? parseFloat(req.body.valorPerda) : null
          ])
          
          logger.info('Morte sincronizada com historia_ocorrencias')
        }
        
        client.release()
      } catch (historiaError) {
        logger.warn('Erro ao sincronizar morte com historia_ocorrencias:', historiaError)
        // Não bloquear a operação principal
      }
      
      return sendSuccess(res, morte, 'Morte registrada com sucesso', HTTP_STATUS.CREATED)
      
    } catch (error) {
      // Tratar erros específicos do banco de dados
      if (error.code === '23505') {
        return sendConflict(res, 'Morte duplicada', {
          animalId: parseInt(animalId)
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
      return sendValidationError(res, 'ID da morte é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Atualização de morte não implementada ainda
    return sendNotImplemented(res, 'Atualização de morte não implementada ainda')
    
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    
    if (!id) {
      return sendValidationError(res, 'ID da morte é obrigatório', {
        required: ['id'],
        provided: { id: !!id }
      })
    }
    
    // Exclusão de morte não implementada ainda
    return sendNotImplemented(res, 'Exclusão de morte não implementada ainda')
    
  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

function getMorteLoteConfig(req) {
  switch (req.method) {
    case 'POST':
      return LOTE_CONFIGS.REGISTRO_MORTE
    default:
      return null
  }
}

export default asyncHandler(withLoteTracking(mortesHandler, getMorteLoteConfig))
