import { query } from '../../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed, sendValidationError } from '../../../../utils/apiResponse'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM destinatarios_relatorios WHERE id = $1
      `, [id])

      if (result.rows.length === 0) {
        return sendError(res, 'Destinatário não encontrado', 404)
      }

      return sendSuccess(res, result.rows[0])
    } catch (error) {
      console.error('Erro ao buscar destinatário:', error)
      return sendError(res, 'Erro ao buscar destinatário', 500)
    }
  }

  if (req.method === 'PUT') {
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
        // Se já tem último envio, calcular a partir dele, senão calcular a partir de hoje
        const ultimoEnvioResult = await query(`
          SELECT ultimo_envio FROM destinatarios_relatorios WHERE id = $1
        `, [id])
        
        if (ultimoEnvioResult.rows[0]?.ultimo_envio) {
          const ultimaData = new Date(ultimoEnvioResult.rows[0].ultimo_envio)
          ultimaData.setDate(ultimaData.getDate() + intervalo_dias)
          proximo_envio = ultimaData.toISOString()
        } else {
          const proximaData = new Date()
          proximaData.setDate(proximaData.getDate() + intervalo_dias)
          proximo_envio = proximaData.toISOString()
        }
      }

      const result = await query(`
        UPDATE destinatarios_relatorios 
        SET nome = $1, email = $2, whatsapp = $3, cargo = $4, 
            recebe_email = $5, recebe_whatsapp = $6, tipos_relatorios = $7, 
            observacoes = $8, agendamento_ativo = $9, intervalo_dias = $10,
            proximo_envio = $11, updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
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
        proximo_envio,
        id
      ])

      if (result.rows.length === 0) {
        return sendError(res, 'Destinatário não encontrado', 404)
      }

      return sendSuccess(res, result.rows[0], 'Destinatário atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar destinatário:', error)
      if (error.code === '23505') {
        return sendValidationError(res, 'Este email já está cadastrado')
      }
      return sendError(res, 'Erro ao atualizar destinatário', 500)
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await query(`
        UPDATE destinatarios_relatorios 
        SET ativo = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id])

      if (result.rows.length === 0) {
        return sendError(res, 'Destinatário não encontrado', 404)
      }

      return sendSuccess(res, result.rows[0], 'Destinatário excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir destinatário:', error)
      return sendError(res, 'Erro ao excluir destinatário', 500)
    }
  }

  return sendMethodNotAllowed(res, 'GET, PUT, DELETE')
}
