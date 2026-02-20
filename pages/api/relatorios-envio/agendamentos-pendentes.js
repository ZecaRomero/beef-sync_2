import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed } from '../../../utils/apiResponse'

async function ensureSchema() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS destinatarios_relatorios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT true
      )
    `)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS agendamento_ativo BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS proximo_envio TIMESTAMP`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS ultimo_envio TIMESTAMP`)
    await query(`ALTER TABLE destinatarios_relatorios ADD COLUMN IF NOT EXISTS ultimos_relatorios JSONB DEFAULT '[]'`)
  } catch (e) {
    console.warn('Schema agendamentos:', e.message)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, 'GET')
  }
  await ensureSchema()
  try {
    // Buscar destinatários com agendamento ativo e próximo envio no passado ou hoje
    const result = await query(`
      SELECT 
        id,
        nome,
        email,
        whatsapp,
        cargo,
        recebe_email,
        recebe_whatsapp,
        intervalo_dias,
        ultimo_envio,
        proximo_envio,
        ultimos_relatorios,
        CASE 
          WHEN proximo_envio IS NULL THEN NULL
          WHEN proximo_envio::date <= CURRENT_DATE THEN true
          ELSE false
        END as pendente
      FROM destinatarios_relatorios
      WHERE agendamento_ativo = true
        AND ativo = true
        AND proximo_envio IS NOT NULL
        AND proximo_envio::date <= CURRENT_DATE
      ORDER BY proximo_envio ASC
    `)

    return sendSuccess(res, result.rows)
  } catch (error) {
    console.error('Erro ao buscar agendamentos pendentes:', error)
    return sendError(res, 'Erro ao buscar agendamentos pendentes', 500)
  }
}
