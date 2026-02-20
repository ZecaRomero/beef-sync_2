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
      // Construir filtro de data baseado no período
      let dateFilter = ''
      const params = []
      
      if (period === 'month') {
        dateFilter = "AND data_ia >= DATE_TRUNC('month', CURRENT_DATE)"
      } else if (period === 'quarter') {
        dateFilter = "AND data_ia >= DATE_TRUNC('quarter', CURRENT_DATE)"
      } else if (period === 'year') {
        dateFilter = "AND data_ia >= DATE_TRUNC('year', CURRENT_DATE)"
      }

      // Total de inseminações
      const totalResult = await client.query(
        `SELECT COUNT(*) as total FROM inseminacoes WHERE 1=1 ${dateFilter}`
      )
      const total_inseminacoes = parseInt(totalResult.rows[0].total) || 0

      // Total positivas
      const positivasResult = await client.query(
        `SELECT COUNT(*) as total FROM inseminacoes 
         WHERE resultado_dg IS NOT NULL 
         AND (UPPER(resultado_dg) LIKE '%P%' OR UPPER(resultado_dg) LIKE '%POSITIVO%')
         ${dateFilter}`
      )
      const total_positivas = parseInt(positivasResult.rows[0].total) || 0

      // Total negativas
      const negativasResult = await client.query(
        `SELECT COUNT(*) as total FROM inseminacoes 
         WHERE resultado_dg IS NOT NULL 
         AND (UPPER(resultado_dg) LIKE '%N%' OR UPPER(resultado_dg) LIKE '%NEGATIVO%')
         ${dateFilter}`
      )
      const total_negativas = parseInt(negativasResult.rows[0].total) || 0

      // Total de animais únicos
      const animaisResult = await client.query(
        `SELECT COUNT(DISTINCT animal_id) as total FROM inseminacoes WHERE 1=1 ${dateFilter}`
      )
      const total_animais = parseInt(animaisResult.rows[0].total) || 0

      // Top touros
      const tourosResult = await client.query(
        `SELECT 
          touro,
          serie_touro,
          rg_touro,
          COUNT(*) as total_ias,
          COUNT(CASE WHEN resultado_dg IS NOT NULL AND (UPPER(resultado_dg) LIKE '%P%' OR UPPER(resultado_dg) LIKE '%POSITIVO%') THEN 1 END) as total_positivas
        FROM inseminacoes
        WHERE touro IS NOT NULL AND touro != ''
        ${dateFilter}
        GROUP BY touro, serie_touro, rg_touro
        ORDER BY total_ias DESC
        LIMIT 10`
      )

      const top_touros = tourosResult.rows.map(row => ({
        nome: row.touro,
        serie: row.serie_touro,
        rg: row.rg_touro,
        total_ias: parseInt(row.total_ias) || 0,
        total_positivas: parseInt(row.total_positivas) || 0,
        taxa_sucesso: row.total_ias > 0 
          ? ((parseInt(row.total_positivas) / parseInt(row.total_ias)) * 100).toFixed(1)
          : 0
      }))

      // Tendência mensal
      const tendenciaResult = await client.query(
        `SELECT 
          TO_CHAR(data_ia, 'YYYY-MM') as mes,
          COUNT(*) as total,
          COUNT(CASE WHEN resultado_dg IS NOT NULL AND (UPPER(resultado_dg) LIKE '%P%' OR UPPER(resultado_dg) LIKE '%POSITIVO%') THEN 1 END) as positivas,
          COUNT(CASE WHEN resultado_dg IS NOT NULL AND (UPPER(resultado_dg) LIKE '%N%' OR UPPER(resultado_dg) LIKE '%NEGATIVO%') THEN 1 END) as negativas
        FROM inseminacoes
        WHERE data_ia IS NOT NULL ${dateFilter}
        GROUP BY TO_CHAR(data_ia, 'YYYY-MM')
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

      // Estatísticas por raça
      const racaResult = await client.query(
        `SELECT 
          a.raca,
          COUNT(i.id) as total,
          COUNT(CASE WHEN i.resultado_dg IS NOT NULL AND (UPPER(i.resultado_dg) LIKE '%P%' OR UPPER(i.resultado_dg) LIKE '%POSITIVO%') THEN 1 END) as positivas
        FROM inseminacoes i
        JOIN animais a ON i.animal_id = a.id
        WHERE a.raca IS NOT NULL ${dateFilter}
        GROUP BY a.raca
        ORDER BY total DESC`
      )

      const por_raca = racaResult.rows.map(row => ({
        raca: row.raca,
        total: parseInt(row.total) || 0,
        positivas: parseInt(row.positivas) || 0,
        taxa_sucesso: row.total > 0
          ? ((parseInt(row.positivas) / parseInt(row.total)) * 100).toFixed(1)
          : 0
      }))

      return sendSuccess(res, {
        total_inseminacoes,
        total_positivas,
        total_negativas,
        total_animais,
        top_touros,
        tendencia_mensal,
        max_mensal,
        por_raca
      }, 'Estatísticas de IA carregadas com sucesso')
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error('Erro ao carregar estatísticas de IA:', error)
    return sendValidationError(res, `Erro ao carregar estatísticas: ${error.message}`)
  }
})
