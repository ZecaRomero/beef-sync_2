import { query } from '../../lib/database'
import logger from '../../utils/logger'
import { 
  sendSuccess, 
  sendValidationError, 
  sendNotFound, 
  sendMethodNotAllowed,
  asyncHandler
} from '../../utils/apiResponse'

async function genealogiaHandler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      await handleGet(req, res)
      break
    case 'POST':
      await handlePost(req, res)
      break
    case 'PUT':
      await handlePut(req, res)
      break
    case 'DELETE':
      await handleDelete(req, res)
      break
    default:
      return sendMethodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

async function handleGet(req, res) {
  const { id, animal, pai, mae, raca, limit = 50, offset = 0 } = req.query

  try {
    if (id) {
      const result = await query(
        `SELECT g.*, 
                a.serie as animal_serie, a.rg as animal_rg,
                p.serie as pai_serie, p.rg as pai_rg,
                m.serie as mae_serie, m.rg as mae_rg
         FROM genealogia g
         LEFT JOIN animais a ON g.animal_id = a.id
         LEFT JOIN animais p ON g.pai_id = p.id
         LEFT JOIN animais m ON g.mae_id = m.id
         WHERE g.id = $1`,
        [id]
      )

      if (result.rows.length === 0) {
        return sendNotFound(res, 'Registro genealógico não encontrado')
      }

      return sendSuccess(res, result.rows[0])
    }

    let sql = `
      SELECT g.*, 
             a.serie as animal_serie, a.rg as animal_rg, a.raca as animal_raca,
             p.serie as pai_serie, p.rg as pai_rg,
             m.serie as mae_serie, m.rg as mae_rg
      FROM genealogia g
      LEFT JOIN animais a ON g.animal_id = a.id
      LEFT JOIN animais p ON g.pai_id = p.id
      LEFT JOIN animais m ON g.mae_id = m.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (animal) {
      paramCount++
      sql += ` AND (a.serie ILIKE $${paramCount} OR a.rg ILIKE $${paramCount})`
      params.push(`%${animal}%`)
    }

    if (pai) {
      paramCount++
      sql += ` AND (p.serie ILIKE $${paramCount} OR p.rg ILIKE $${paramCount})`
      params.push(`%${pai}%`)
    }

    if (mae) {
      paramCount++
      sql += ` AND (m.serie ILIKE $${paramCount} OR m.rg ILIKE $${paramCount})`
      params.push(`%${mae}%`)
    }

    if (raca) {
      paramCount++
      sql += ` AND a.raca ILIKE $${paramCount}`
      params.push(`%${raca}%`)
    }

    sql += ` ORDER BY g.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(limit, offset)

    const result = await query(sql, params)
    return sendSuccess(res, result.rows)

  } catch (error) {
    logger.error('Erro ao buscar registros genealógicos:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    })
  }
}

async function handlePost(req, res) {
  const { 
    animal_id, 
    pai_id, 
    mae_id, 
    data_nascimento, 
    registro, 
    observacoes 
  } = req.body

  if (!animal_id) {
    return sendValidationError(res, 'ID do animal é obrigatório')
  }

  try {
    // Verificar se já existe registro para este animal
    const existingResult = await query(
      'SELECT id FROM genealogia WHERE animal_id = $1',
      [animal_id]
    )

    if (existingResult.rows.length > 0) {
      return sendValidationError(res, 'Já existe registro genealógico para este animal')
    }

    const result = await query(
      `INSERT INTO genealogia 
       (animal_id, pai_id, mae_id, data_nascimento, registro, observacoes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [animal_id, pai_id, mae_id, data_nascimento, registro, observacoes]
    )

    logger.info(`Registro genealógico criado para animal ID: ${animal_id}`)
    return sendSuccess(res, result.rows[0], 'Registro genealógico criado com sucesso', 201)

  } catch (error) {
    logger.error('Erro ao criar registro genealógico:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar registro genealógico',
      error: error.message 
    })
  }
}

async function handlePut(req, res) {
  const { id } = req.query
  const { animal_id, pai_id, mae_id, data_nascimento, registro, observacoes } = req.body

  if (!id) {
    return sendValidationError(res, 'ID do registro é obrigatório')
  }

  try {
    let sql = 'UPDATE genealogia SET updated_at = CURRENT_TIMESTAMP'
    const params = []
    let paramCount = 0

    if (animal_id !== undefined) {
      paramCount++
      sql += `, animal_id = $${paramCount}`
      params.push(animal_id)
    }

    if (pai_id !== undefined) {
      paramCount++
      sql += `, pai_id = $${paramCount}`
      params.push(pai_id)
    }

    if (mae_id !== undefined) {
      paramCount++
      sql += `, mae_id = $${paramCount}`
      params.push(mae_id)
    }

    if (data_nascimento !== undefined) {
      paramCount++
      sql += `, data_nascimento = $${paramCount}`
      params.push(data_nascimento)
    }

    if (registro !== undefined) {
      paramCount++
      sql += `, registro = $${paramCount}`
      params.push(registro)
    }

    if (observacoes !== undefined) {
      paramCount++
      sql += `, observacoes = $${paramCount}`
      params.push(observacoes)
    }

    sql += ` WHERE id = $${paramCount + 1} RETURNING *`
    params.push(id)

    const result = await query(sql, params)

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Registro genealógico não encontrado')
    }

    logger.info(`Registro genealógico atualizado: ID ${id}`)
    return sendSuccess(res, result.rows[0], 'Registro genealógico atualizado com sucesso')

  } catch (error) {
    logger.error('Erro ao atualizar registro genealógico:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar registro genealógico',
      error: error.message 
    })
  }
}

async function handleDelete(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID do registro é obrigatório')
  }

  try {
    const result = await query(
      'DELETE FROM genealogia WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Registro genealógico não encontrado')
    }

    logger.info(`Registro genealógico excluído: ID ${id}`)
    return sendSuccess(res, result.rows[0], 'Registro genealógico excluído com sucesso')

  } catch (error) {
    logger.error('Erro ao excluir registro genealógico:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir registro genealógico',
      error: error.message 
    })
  }
}

export default asyncHandler(genealogiaHandler)