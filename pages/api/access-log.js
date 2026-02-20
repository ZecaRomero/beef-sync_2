const { query } = require('../../lib/database')
import { sendSuccess, sendError, sendMethodNotAllowed, asyncHandler } from '../../utils/apiResponse'

async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar logs de acesso
    try {
      // Criar tabela se não existir antes de fazer SELECT
      await query(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id SERIAL PRIMARY KEY,
          user_name VARCHAR(100) NOT NULL,
          user_type VARCHAR(50) NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          hostname VARCHAR(255),
          user_agent TEXT,
          action VARCHAR(100) DEFAULT 'Login',
          access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      const result = await query(`
        SELECT 
          id,
          user_name,
          user_type,
          ip_address,
          hostname,
          user_agent,
          access_time,
          action,
          created_at
        FROM access_logs 
        ORDER BY created_at DESC 
        LIMIT 50
      `)

      return sendSuccess(res, result.rows, 'Logs de acesso recuperados com sucesso')
    } catch (error) {
      console.error('Erro ao buscar logs de acesso:', error)
      return sendError(res, 'Erro ao buscar logs de acesso', 500, error.message)
    }

  } else if (req.method === 'POST') {
    // Registrar novo acesso
    const { 
      userName, 
      userType, 
      ipAddress, 
      hostname, 
      userAgent, 
      action = 'Login' 
    } = req.body

    try {
      // Criar tabela se não existir
      await query(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id SERIAL PRIMARY KEY,
          user_name VARCHAR(100) NOT NULL,
          user_type VARCHAR(50) NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          hostname VARCHAR(255),
          user_agent TEXT,
          action VARCHAR(100) DEFAULT 'Login',
          access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Inserir log de acesso
      const result = await query(`
        INSERT INTO access_logs (
          user_name, user_type, ip_address, hostname, user_agent, action
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [userName, userType, ipAddress, hostname, userAgent, action])

      return sendSuccess(res, result.rows[0], 'Acesso registrado com sucesso')
    } catch (error) {
      console.error('Erro ao registrar acesso:', error)
      return sendError(res, 'Erro ao registrar acesso')
    }

  } else {
    return sendMethodNotAllowed(res, ['GET', 'POST'])
  }
}

export default asyncHandler(handler)