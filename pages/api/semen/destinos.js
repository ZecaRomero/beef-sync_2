import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../../utils/apiResponse'

// Função para garantir que a tabela existe
async function ensureTableExists() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS destinos_semen (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT true,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_destinos_semen_nome ON destinos_semen(nome)
    `)
  } catch (error) {
    console.error('Erro ao criar tabela destinos_semen:', error)
    throw error
  }
}

async function destinosHandler(req, res) {
  // Garantir que a tabela existe antes de qualquer operação
  try {
    await ensureTableExists()
  } catch (error) {
    console.error('Erro ao garantir tabela destinos_semen:', error)
    return sendError(res, 'Erro ao inicializar tabela de destinos', 500, error.message)
  }

  if (req.method === 'GET') {
    try {
      const { busca, apenas_ativos } = req.query
      
      let queryText = 'SELECT * FROM destinos_semen WHERE 1=1'
      const params = []
      
      if (apenas_ativos === 'true') {
        queryText += ' AND ativo = true'
      }
      
      if (busca) {
        queryText += ' AND nome ILIKE $' + (params.length + 1)
        params.push(`%${busca}%`)
      }
      
      queryText += ' ORDER BY nome ASC'
      
      const result = await query(queryText, params)
      
      return sendSuccess(res, result.rows, 'Destinos carregados com sucesso')
    } catch (error) {
      console.error('Erro ao buscar destinos:', error)
      return sendError(res, 'Erro ao buscar destinos', 500, error.message)
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { nome, observacoes } = req.body
      
      if (!nome || !nome.trim()) {
        return sendError(res, 'Nome do destino é obrigatório', 400)
      }
      
      // Verificar se já existe
      const existing = await query(
        'SELECT id FROM destinos_semen WHERE LOWER(nome) = LOWER($1)',
        [nome.trim()]
      )
      
      if (existing.rows.length > 0) {
        return sendError(res, 'Destino já existe', 409)
      }
      
      // Inserir novo destino
      const result = await query(
        'INSERT INTO destinos_semen (nome, observacoes, ativo) VALUES ($1, $2, true) RETURNING *',
        [nome.trim(), observacoes || null]
      )
      
      return sendSuccess(res, result.rows[0], 'Destino criado com sucesso', 201)
    } catch (error) {
      console.error('Erro ao criar destino:', error)
      if (error.code === '23505') { // Unique violation
        return sendError(res, 'Destino já existe', 409)
      }
      return sendError(res, 'Erro ao criar destino', 500, error.message)
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, nome, observacoes, ativo } = req.body
      
      if (!id) {
        return sendError(res, 'ID do destino é obrigatório', 400)
      }
      
      if (!nome || !nome.trim()) {
        return sendError(res, 'Nome do destino é obrigatório', 400)
      }
      
      // Verificar se já existe outro destino com o mesmo nome
      const existing = await query(
        'SELECT id FROM destinos_semen WHERE LOWER(nome) = LOWER($1) AND id != $2',
        [nome.trim(), id]
      )
      
      if (existing.rows.length > 0) {
        return sendError(res, 'Já existe outro destino com este nome', 409)
      }
      
      // Atualizar destino
      const result = await query(
        'UPDATE destinos_semen SET nome = $1, observacoes = $2, ativo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [nome.trim(), observacoes || null, ativo !== false, id]
      )
      
      if (result.rows.length === 0) {
        return sendError(res, 'Destino não encontrado', 404)
      }
      
      return sendSuccess(res, result.rows[0], 'Destino atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar destino:', error)
      if (error.code === '23505') { // Unique violation
        return sendError(res, 'Já existe outro destino com este nome', 409)
      }
      return sendError(res, 'Erro ao atualizar destino', 500, error.message)
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      
      if (!id) {
        return sendError(res, 'ID do destino é obrigatório', 400)
      }
      
      // Verificar se existe
      const existing = await query('SELECT id FROM destinos_semen WHERE id = $1', [id])
      
      if (existing.rows.length === 0) {
        return sendError(res, 'Destino não encontrado', 404)
      }
      
      // Deletar destino
      await query('DELETE FROM destinos_semen WHERE id = $1', [id])
      
      return sendSuccess(res, null, 'Destino excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir destino:', error)
      return sendError(res, 'Erro ao excluir destino', 500, error.message)
    }
  }
  
  return sendMethodNotAllowed(res, req.method)
}

export default asyncHandler(destinosHandler)

