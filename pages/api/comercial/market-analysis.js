/**
 * API para análise de mercado e recomendação de vendas
 * GET /api/comercial/market-analysis - Analisa todos os animais
 * POST /api/comercial/market-analysis - Analisa animal específico
 */

import marketAnalysisService from '../../../services/marketAnalysisService'
import { pool } from '../../../lib/database'
import { asyncHandler, sendSuccess, sendValidationError } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

export default asyncHandler(async function handler(req, res) {
  if (req.method === 'GET') {
    // Analisar todos os animais
    try {
      const client = await pool.connect()
      try {
        const result = await client.query(`
          SELECT 
            id, serie, rg, sexo, raca, peso, 
            data_nascimento, situacao, custo_total,
            observacoes
          FROM animais
          WHERE situacao = 'Ativo'
          ORDER BY serie, rg
        `)

        const animais = result.rows.map(row => ({
          id: row.id,
          serie: row.serie,
          rg: row.rg,
          sexo: row.sexo,
          raca: row.raca,
          peso: row.peso,
          dataNascimento: row.data_nascimento,
          data_nascimento: row.data_nascimento,
          situacao: row.situacao,
          custoTotal: parseFloat(row.custo_total) || 0,
          custo_total: parseFloat(row.custo_total) || 0,
          observacoes: row.observacoes
        }))

        const analysis = await marketAnalysisService.analyzeMultipleAnimals(animais)

        return sendSuccess(res, analysis, 'Análise de mercado concluída')
      } finally {
        client.release()
      }
    } catch (error) {
      logger.error('Erro ao analisar mercado:', error)
      return sendValidationError(res, `Erro ao analisar: ${error.message}`)
    }
  } else if (req.method === 'POST') {
    // Analisar animal específico
    const { animal_id } = req.body

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

        const analysis = await marketAnalysisService.analyzeSaleReadiness(animal)

        return sendSuccess(res, analysis, 'Análise concluída')
      } finally {
        client.release()
      }
    } catch (error) {
      logger.error('Erro ao analisar animal:', error)
      return sendValidationError(res, `Erro ao analisar: ${error.message}`)
    }
  } else {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }
})
