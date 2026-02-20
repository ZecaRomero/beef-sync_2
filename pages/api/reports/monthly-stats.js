import { query } from '../../../lib/database'
import { sendSuccess, sendMethodNotAllowed, sendError, asyncHandler } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

// GET /api/reports/monthly-stats?year=YYYY
// Retorna estatísticas mensais reais: nascimentos, vendas, mortes, receita
async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendMethodNotAllowed(res, 'GET')
  }

  try {
    const now = new Date()
    const year = parseInt(req.query.year || now.getFullYear(), 10)

    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]

    const stats = {}

    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1)
      const end = new Date(year, m + 1, 1)

      // Consultas reais no banco
      const [
        nascResult,
        vendasResult,
        mortesResult
      ] = await Promise.all([
        query(
          `SELECT COUNT(*) AS count
           FROM nascimentos
           WHERE data_nascimento >= $1 AND data_nascimento < $2`,
          [start, end]
        ),
        query(
          `SELECT COUNT(*) AS count, COALESCE(SUM(valor_venda), 0) AS receita
           FROM animais
           WHERE situacao = 'Vendido'
             AND updated_at >= $1 AND updated_at < $2`,
          [start, end]
        ),
        query(
          `SELECT COUNT(*) AS count
           FROM animais
           WHERE situacao = 'Morto'
             AND updated_at >= $1 AND updated_at < $2`,
          [start, end]
        )
      ])

      const key = `${months[m]}/${String(year).slice(-2)}`
      stats[key] = {
        nascimentos: parseInt(nascResult.rows[0]?.count || 0, 10),
        vendas: parseInt(vendasResult.rows[0]?.count || 0, 10),
        mortes: parseInt(mortesResult.rows[0]?.count || 0, 10),
        receita: parseFloat(vendasResult.rows[0]?.receita || 0)
      }
    }

    return sendSuccess(res, {
      year,
      months: Object.keys(stats),
      data: stats
    })
  } catch (error) {
    logger.error('Erro ao obter estatísticas mensais:', error)
    return sendError(res, 'Erro interno do servidor', 500, { 
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

export default asyncHandler(handler)