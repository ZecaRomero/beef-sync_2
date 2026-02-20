import databaseService from '../../../services/databaseService'
import { logger } from '../../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler 
} from '../../../utils/apiResponse'

export default asyncHandler(async (req, res) => {
  const { method } = req

  switch (method) {
    case 'POST':
      return await handleBulkCreate(req, res)
    case 'PUT':
      return await handleBulkUpdate(req, res)
    case 'DELETE':
      return await handleBulkDelete(req, res)
    default:
      return sendMethodNotAllowed(res, ['POST', 'DELETE'])
  }
})

async function handleBulkCreate(req, res) {
  try {
    const { animals } = req.body

    if (!Array.isArray(animals) || animals.length === 0) {
      return sendValidationError(res, 'Lista de animais é obrigatória e deve conter pelo menos um animal')
    }

    // Validar cada animal
    for (const animal of animals) {
      if (!animal.serie || !animal.raca || !animal.sexo) {
        return sendValidationError(res, 'Cada animal deve ter série, raça e sexo')
      }
    }

    const createdAnimals = []
    const errors = []

    // Criar cada animal individualmente para melhor controle de erros
    for (const animalData of animals) {
      try {
        const animal = await databaseService.criarAnimal(animalData)
        createdAnimals.push(animal)
        logger.info('Animal criado em lote:', { id: animal.id, serie: animal.serie })
      } catch (error) {
        logger.error('Erro ao criar animal em lote:', error)
        errors.push({
          animal: animalData.serie || 'Sem série',
          error: error.message
        })
      }
    }

    return sendSuccess(res, {
      created: createdAnimals,
      errors: errors,
      summary: {
        total: animals.length,
        successful: createdAnimals.length,
        failed: errors.length
      }
    }, `${createdAnimals.length} animais criados com sucesso`)

  } catch (error) {
    logger.error('Erro na criação em lote de animais:', error)
    return sendError(res, 'Erro interno do servidor ao criar animais em lote')
  }
}

async function handleBulkUpdate(req, res) {
  try {
    const { ids, updates } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendValidationError(res, 'Lista de IDs é obrigatória')
    }
    
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
       return sendValidationError(res, 'Dados para atualização são obrigatórios')
    }

    // Campos permitidos para atualização em massa
    const allowedFields = ['sexo', 'raca', 'situacao', 'pai', 'mae', 'observacoes', 'peso', 'meses']
    const fieldsToUpdate = Object.keys(updates).filter(field => allowedFields.includes(field))
    
    if (fieldsToUpdate.length === 0) {
        return sendValidationError(res, 'Nenhum campo válido para atualização fornecido')
    }

    const updatedAnimals = []
    const errors = []

    // Atualizar cada animal
    for (const id of ids) {
      try {
        // Construir query dinâmica
        const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ')
        const values = [id, ...fieldsToUpdate.map(field => updates[field])]
        
        const result = await databaseService.query(
            `UPDATE animais SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            values
        )

        if (result.rows.length > 0) {
            updatedAnimals.push(result.rows[0])
            logger.info('Animal atualizado em lote:', { id, updates })
        } else {
             errors.push({ id, error: 'Animal não encontrado' })
        }
      } catch (error) {
        logger.error('Erro ao atualizar animal em lote:', error)
        errors.push({ id, error: error.message })
      }
    }

    return sendSuccess(res, {
      updated: updatedAnimals,
      errors: errors,
      summary: {
        total: ids.length,
        successful: updatedAnimals.length,
        failed: errors.length
      }
    }, `${updatedAnimals.length} animais atualizados com sucesso`)

  } catch (error) {
    logger.error('Erro na atualização em lote de animais:', error)
    return sendError(res, 'Erro interno do servidor ao atualizar animais em lote')
  }
}

async function handleBulkDelete(req, res) {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendValidationError(res, 'Lista de IDs é obrigatória')
    }

    const deletedAnimals = []
    const errors = []

    // Deletar cada animal individualmente
    for (const id of ids) {
      try {
        const animal = await databaseService.buscarAnimalPorId(id)
        if (animal) {
          await databaseService.deletarAnimal(id)
          deletedAnimals.push({ id, serie: animal.serie })
          logger.info('Animal deletado em lote:', { id, serie: animal.serie })
        } else {
          errors.push({
            id,
            error: 'Animal não encontrado'
          })
        }
      } catch (error) {
        logger.error('Erro ao deletar animal em lote:', error)
        errors.push({
          id,
          error: error.message
        })
      }
    }

    return sendSuccess(res, {
      deleted: deletedAnimals,
      errors: errors,
      summary: {
        total: ids.length,
        successful: deletedAnimals.length,
        failed: errors.length
      }
    }, `${deletedAnimals.length} animais removidos com sucesso`)

  } catch (error) {
    logger.error('Erro na remoção em lote de animais:', error)
    return sendError(res, 'Erro interno do servidor ao remover animais em lote')
  }
}