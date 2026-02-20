import { logger } from '../../utils/logger'
import { 
  sendSuccess, 
  sendError, 
  sendValidationError, 
  sendNotFound, 
  sendMethodNotAllowed, 
  asyncHandler,
  HTTP_STATUS 
} from '../../utils/apiResponse'

// Usar o pool centralizado do databaseService
const { pool } = require('../../lib/database')

// GET - Listar ocorrências com filtros
async function handleGet(req, res) {
  const { animalId, tipo, dataInicio, dataFim, ano, mes } = req.query
  
  let query = `
    SELECT 
      h.*,
      a.serie,
      a.rg,
      a.raca,
      a.sexo
    FROM historia_ocorrencias h
    INNER JOIN animais a ON h.animal_id = a.id
    WHERE 1=1
  `
  
  const params = []
  let paramCount = 0
  
  if (animalId) {
    paramCount++
    query += ` AND h.animal_id = $${paramCount}`
    params.push(animalId)
  }
  
  if (tipo) {
    paramCount++
    query += ` AND h.tipo = $${paramCount}`
    params.push(tipo)
  }
  
  if (dataInicio) {
    paramCount++
    query += ` AND h.data >= $${paramCount}`
    params.push(dataInicio)
  }
  
  if (dataFim) {
    paramCount++
    query += ` AND h.data <= $${paramCount}`
    params.push(dataFim)
  }
  
  if (ano) {
    paramCount++
    query += ` AND EXTRACT(YEAR FROM h.data) = $${paramCount}`
    params.push(ano)
  }
  
  if (mes) {
    paramCount++
    query += ` AND EXTRACT(MONTH FROM h.data) = $${paramCount}`
    params.push(mes)
  }
  
  query += ` ORDER BY h.data DESC, h.created_at DESC`
  
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    
    // Formatar resposta
    const ocorrencias = result.rows.map(row => ({
      id: row.id,
      animalId: row.animal_id,
      animal: {
        serie: row.serie,
        rg: row.rg,
        raca: row.raca,
        sexo: row.sexo
      },
      tipo: row.tipo,
      data: row.data,
      descricao: row.descricao,
      observacoes: row.observacoes,
      peso: row.peso,
      valor: row.valor,
      veterinario: row.veterinario,
      medicamento: row.medicamento,
      dosagem: row.dosagem,
      proximaAplicacao: row.proxima_aplicacao,
      local: row.local,
      responsavel: row.responsavel,
      createdAt: row.created_at,
      createdBy: row.created_by
    }))
    
    logger.info(`Listando ${ocorrencias.length} ocorrências`)
    return sendSuccess(res, ocorrencias, 'Ocorrências recuperadas com sucesso')
  } finally {
    client.release()
  }
}

// POST - Criar nova ocorrência
async function handlePost(req, res) {
  const {
    animalId,
    tipo,
    data,
    descricao,
    observacoes,
    peso,
    valor,
    veterinario,
    medicamento,
    dosagem,
    proximaAplicacao,
    local,
    responsavel
  } = req.body
  
  // Validações
  if (!animalId || !tipo || !data) {
    return sendValidationError(res, 'Campos obrigatórios: animalId, tipo e data')
  }
  
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Verificar se o animal existe
    const animalCheck = await client.query(
      'SELECT id FROM animais WHERE id = $1',
      [animalId]
    )
    
    if (animalCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      return sendNotFound(res, 'Animal')
    }
    
    // Inserir ocorrência
    const insertQuery = `
      INSERT INTO historia_ocorrencias (
        animal_id, tipo, data, descricao, observacoes, peso, valor,
        veterinario, medicamento, dosagem, proxima_aplicacao, local, responsavel
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `
    
    const values = [
      animalId,
      tipo,
      data,
      descricao || null,
      observacoes || null,
      peso || null,
      valor || null,
      veterinario || null,
      medicamento || null,
      dosagem || null,
      proximaAplicacao || null,
      local || null,
      responsavel || null
    ]
    
    const result = await client.query(insertQuery, values)
    
    await client.query('COMMIT')
    
    const ocorrencia = result.rows[0]
    
    logger.info(`Ocorrência criada: ${ocorrencia.id} - ${tipo} - Animal ${animalId}`)
    
    return sendSuccess(res, {
      id: ocorrencia.id,
      animalId: ocorrencia.animal_id,
      tipo: ocorrencia.tipo,
      data: ocorrencia.data,
      createdAt: ocorrencia.created_at
    }, 'Ocorrência criada com sucesso', HTTP_STATUS.CREATED)
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// PUT - Atualizar ocorrência
async function handlePut(req, res) {
  const { id, ...updateData } = req.body
  
  if (!id) {
    return sendValidationError(res, 'ID é obrigatório')
  }
  
  const allowedFields = [
    'tipo', 'data', 'descricao', 'observacoes', 'peso', 'valor',
    'veterinario', 'medicamento', 'dosagem', 'proximaAplicacao', 'local', 'responsavel'
  ]
  
  const updates = []
  const params = []
  let paramCount = 1
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field === 'proximaAplicacao' ? 'proxima_aplicacao' : field
      updates.push(`${dbField} = $${paramCount}`)
      params.push(updateData[field])
      paramCount++
    }
  }
  
  if (updates.length === 0) {
    return sendValidationError(res, 'Nenhum campo para atualizar')
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  params.push(id)
  
  const query = `
    UPDATE historia_ocorrencias 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `
  
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Ocorrência')
    }
    
    logger.info(`Ocorrência atualizada: ${id}`)
    
    return sendSuccess(res, result.rows[0], 'Ocorrência atualizada com sucesso')
    
  } finally {
    client.release()
  }
}

// DELETE - Excluir ocorrência
async function handleDelete(req, res) {
  const { id } = req.query
  
  if (!id) {
    return sendValidationError(res, 'ID é obrigatório')
  }
  
  const client = await pool.connect()
  try {
    const result = await client.query(
      'DELETE FROM historia_ocorrencias WHERE id = $1 RETURNING id',
      [id]
    )
    
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Ocorrência')
    }
    
    logger.info(`Ocorrência excluída: ${id}`)
    
    return sendSuccess(res, { id: result.rows[0].id }, 'Ocorrência excluída com sucesso')
    
  } finally {
    client.release()
  }
}

async function historiaOcorrenciasHandler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res)
  } else if (req.method === 'POST') {
    return await handlePost(req, res)
  } else if (req.method === 'PUT') {
    return await handlePut(req, res)
  } else if (req.method === 'DELETE') {
    return await handleDelete(req, res)
  } else {
    return sendMethodNotAllowed(res, req.method)
  }
}

export default asyncHandler(historiaOcorrenciasHandler)