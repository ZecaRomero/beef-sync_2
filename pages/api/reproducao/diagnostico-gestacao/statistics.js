import { pool } from '../../../../lib/database'
import { asyncHandler, sendSuccess, sendValidationError } from '../../../../utils/apiResponse'
import logger from '../../../../utils/logger'

export default asyncHandler(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  const { period = 'all' } = req.query

  try {
    const client = await pool.connect()
    try {
      let dateFilter = ''
      
      if (period === 'month') {
        dateFilter = "AND data_diagnostico >= DATE_TRUNC('month', CURRENT_DATE)"
      } else if (period === 'quarter') {
        dateFilter = "AND data_diagnostico >= DATE_TRUNC('quarter', CURRENT_DATE)"
      } else if (period === 'year') {
        dateFilter = "AND data_diagnostico >= DATE_TRUNC('year', CURRENT_DATE)"
      }

      // Total de DGs
      const totalResult = await client.query(
        `SELECT COUNT(*) as total FROM gestacoes WHERE data_diagnostico IS NOT NULL ${dateFilter}`
      )
      const total_dgs = parseInt(totalResult.rows[0].total) || 0

      // Positivas e Negativas
      const positivasResult = await client.query(
        `SELECT COUNT(*) as total FROM gestacoes 
         WHERE resultado_diagnostico IS NOT NULL 
         AND (UPPER(resultado_diagnostico) LIKE '%P%' OR UPPER(resultado_diagnostico) LIKE '%POSITIVO%')
         ${dateFilter}`
      )
      const total_positivas = parseInt(positivasResult.rows[0].total) || 0

      const negativasResult = await client.query(
        `SELECT COUNT(*) as total FROM gestacoes 
         WHERE resultado_diagnostico IS NOT NULL 
         AND (UPPER(resultado_diagnostico) LIKE '%N%' OR UPPER(resultado_diagnostico) LIKE '%NEGATIVO%')
         ${dateFilter}`
      )
      const total_negativas = parseInt(negativasResult.rows[0].total) || 0

      // Total de animais únicos
      const animaisResult = await client.query(
        `SELECT COUNT(DISTINCT animal_id) as total FROM gestacoes WHERE data_diagnostico IS NOT NULL ${dateFilter}`
      )
      const total_animais = parseInt(animaisResult.rows[0].total) || 0

      // Tendência mensal
      const tendenciaResult = await client.query(
        `SELECT 
          TO_CHAR(data_diagnostico, 'YYYY-MM') as mes,
          COUNT(*) as total,
          COUNT(CASE WHEN resultado_diagnostico IS NOT NULL AND (UPPER(resultado_diagnostico) LIKE '%P%' OR UPPER(resultado_diagnostico) LIKE '%POSITIVO%') THEN 1 END) as positivas,
          COUNT(CASE WHEN resultado_diagnostico IS NOT NULL AND (UPPER(resultado_diagnostico) LIKE '%N%' OR UPPER(resultado_diagnostico) LIKE '%NEGATIVO%') THEN 1 END) as negativas
        FROM gestacoes
        WHERE data_diagnostico IS NOT NULL ${dateFilter}
        GROUP BY TO_CHAR(data_diagnostico, 'YYYY-MM')
        ORDER BY mes DESC
        LIMIT 12`
      )

      const tendencia_mensal = tendenciaResult.rows.map(row => ({
        mes: row.mes,
        total: parseInt(row.total) || 0,
        positivas: parseInt(row.positivas) || 0,
        negativas: parseInt(row.negativas) || 0
      }))

      const max_mensal = Math.max(...tendencia_mensal.map(m => m.total), 1)

      // Por raça
      const racaResult = await client.query(
        `SELECT 
          a.raca,
          COUNT(g.id) as total,
          COUNT(CASE WHEN g.resultado_diagnostico IS NOT NULL AND (UPPER(g.resultado_diagnostico) LIKE '%P%' OR UPPER(g.resultado_diagnostico) LIKE '%POSITIVO%') THEN 1 END) as positivas
        FROM gestacoes g
        JOIN animais a ON g.animal_id = a.id
        WHERE a.raca IS NOT NULL AND g.data_diagnostico IS NOT NULL ${dateFilter}
        GROUP BY a.raca
        ORDER BY total DESC`
      )

      const por_raca = racaResult.rows.map(row => ({
        raca: row.raca,
        total: parseInt(row.total) || 0,
        positivas: parseInt(row.positivas) || 0,
        taxa_positiva: row.total > 0
          ? ((parseInt(row.positivas) / parseInt(row.total)) * 100).toFixed(1)
          : 0
      }))

      return sendSuccess(res, {
        total_dgs,
        total_positivas,
        total_negativas,
        total_animais,
        tendencia_mensal,
        max_mensal,
        por_raca
      }, 'Estatísticas de DG carregadas com sucesso')
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error('Erro ao carregar estatísticas de DG:', error)
    return sendValidationError(res, `Erro ao carregar estatísticas: ${error.message}`)
  }
})
