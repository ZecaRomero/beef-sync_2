/**
 * API para recomendações de IA
 * GET /api/animals/ai-recommendations?animal_id=123
 */

import aiIntelligenceService from '../../../services/aiIntelligenceService'
import { pool } from '../../../lib/database'
import { asyncHandler, sendSuccess, sendValidationError } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  const { animal_id } = req.query

  if (!animal_id) {
    return sendValidationError(res, 'ID do animal é obrigatório')
  }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 
          id, serie, rg, sexo, raca, peso, 
          data_nascimento, situacao, custo_total,
          observacoes
        FROM animais
        WHERE id = $1
      `, [animal_id])

      if (result.rows.length === 0) {
        return sendValidationError(res, 'Animal não encontrado')
      }

      const animal = {
        id: result.rows[0].id,
        serie: result.rows[0].serie,
        rg: result.rows[0].rg,
        sexo: result.rows[0].sexo,
        raca: result.rows[0].raca,
        peso: result.rows[0].peso,
        dataNascimento: result.rows[0].data_nascimento,
        data_nascimento: result.rows[0].data_nascimento,
        situacao: result.rows[0].situacao,
        custoTotal: parseFloat(result.rows[0].custo_total) || 0,
        custo_total: parseFloat(result.rows[0].custo_total) || 0,
        observacoes: result.rows[0].observacoes
      }

      const recommendations = await aiIntelligenceService.generateAnimalRecommendations(animal)

      return sendSuccess(res, recommendations, 'Recomendações geradas com sucesso')
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error('Erro ao gerar recomendações:', error)
    return sendValidationError(res, `Erro ao gerar recomendações: ${error.message}`)
  }
})
