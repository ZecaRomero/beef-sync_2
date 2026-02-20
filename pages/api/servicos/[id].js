import { query } from '../../../lib/database'
import { sendSuccess, sendValidationError, sendNotFound, sendMethodNotAllowed, HTTP_STATUS, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

async function handleGet(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID é obrigatório')
  }

  const result = await query('SELECT * FROM tipos_servicos WHERE id = $1', [id])
  
  if (result.rows.length === 0) {
    return sendNotFound(res, 'Serviço não encontrado')
  }

  return sendSuccess(res, 'Serviço encontrado com sucesso', result.rows[0])
}

async function handlePut(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID é obrigatório')
  }

  const {
    nome,
    categoria,
    valor_padrao,
    aplicavel_macho,
    aplicavel_femea,
    descricao,
    ativo
  } = req.body

  const queryText = `
    UPDATE tipos_servicos SET
      nome = $1,
      categoria = $2,
      valor_padrao = $3,
      aplicavel_macho = $4,
      aplicavel_femea = $5,
      descricao = $6,
      ativo = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `

  const params = [
    nome,
    categoria,
    parseFloat(valor_padrao),
    aplicavel_macho,
    aplicavel_femea,
    descricao,
    ativo,
    id
  ]

  const result = await query(queryText, params)

  if (result.rows.length === 0) {
    return sendNotFound(res, 'Serviço não encontrado')
  }

  return sendSuccess(res, 'Serviço atualizado com sucesso', result.rows[0])
}

async function handleDelete(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID é obrigatório')
  }

  const result = await query('DELETE FROM tipos_servicos WHERE id = $1 RETURNING *', [id])

  if (result.rows.length === 0) {
    return sendNotFound(res, 'Serviço não encontrado')
  }

  return sendSuccess(res, 'Serviço excluído com sucesso', result.rows[0])
}

async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        return sendMethodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
    }
  } catch (error) {
    logger.error('Erro na API de serviços:', error)
    throw error
  }
}

export default asyncHandler(handler)

