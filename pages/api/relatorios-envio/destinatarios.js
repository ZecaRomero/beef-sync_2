import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed, sendValidationError } from '../../../utils/apiResponse'

async function ensureSchema() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS destinatarios_relatorios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(20),
        cargo VARCHAR(100),
        ativo BOOLEAN DEFAULT true,
        recebe_email BOOLEAN DEFAULT true,
        recebe_whatsapp BOOLEAN DEFAULT false,
        tipos_relatorios JSONB DEFAULT '[]',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS agendamento_ativo BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS proximo_envio TIMESTAMP`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS ultimo_envio TIMESTAMP`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS ultimos_relatorios JSONB DEFAULT '[]'`)
  } catch (e) {
    console.warn('Schema destinatarios_relatorios:', e.message)
  }
}

export default async function handler(req, res) {
  await ensureSchema()
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM destinatarios_relatorios 
        WHERE COALESCE(ativo, true) = true 
        ORDER BY nome ASC
      `)
      
      return sendSuccess(res, result.rows)
    } catch (error) {
      console.error('Erro ao buscar destinatários:', error)
      return sendError(res, 'Erro ao buscar destinatários', 500)
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        nome, email, whatsapp, cargo, recebe_email, recebe_whatsapp, 
        tipos_relatorios, observacoes, agendamento_ativo, intervalo_dias 
      } = req.body

      if (!nome || !email || !cargo) {
        return sendValidationError(res, 'Nome, email e cargo são obrigatórios')
      }

      // Calcular próxima data de envio se agendamento estiver ativo
      let proximo_envio = null
      if (agendamento_ativo && intervalo_dias) {
        const proximaData = new Date()
        proximaData.setDate(proximaData.getDate() + intervalo_dias)
        proximo_envio = proximaData.toISOString()
      }

      const result = await query(`
        INSERT INTO destinatarios_relatorios 
        (nome, email, whatsapp, cargo, recebe_email, recebe_whatsapp, tipos_relatorios, observacoes, 
         agendamento_ativo, intervalo_dias, proximo_envio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        nome,
        email,
        whatsapp || null,
        cargo,
        recebe_email !== false,
        recebe_whatsapp === true,
        JSON.stringify(tipos_relatorios || []),
        observacoes || null,
        agendamento_ativo === true,
        intervalo_dias || null,
        proximo_envio
      ])

      return sendSuccess(res, result.rows[0], 'Destinatário cadastrado com sucesso')
    } catch (error) {
      console.error('Erro ao criar destinatário:', error)
      if (error.code === '23505') { // Unique violation
        return sendValidationError(res, 'Este email já está cadastrado')
      }
      return sendError(res, 'Erro ao criar destinatário', 500)
    }
  }

  return sendMethodNotAllowed(res, 'GET, POST')
}
