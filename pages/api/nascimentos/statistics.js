import { pool } from '../../../lib/database'
import { asyncHandler, sendSuccess, sendValidationError } from '../../../utils/apiResponse'
import logger from '../../../utils/logger'

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
        dateFilter = "AND data_nascimento >= DATE_TRUNC('month', CURRENT_DATE)"
      } else if (period === 'quarter') {
        dateFilter = "AND data_nascimento >= DATE_TRUNC('quarter', CURRENT_DATE)"
      } else if (period === 'year') {
        dateFilter = "AND data_nascimento >= DATE_TRUNC('year', CURRENT_DATE)"
      }

      // Total de nascimentos
      const totalResult = await client.query(
        `SELECT COUNT(*) as total FROM animais WHERE data_nascimento IS NOT NULL ${dateFilter}`
      )
      const total_nascimentos = parseInt(totalResult.rows[0].total) || 0

      // Machos e Fêmeas
      const sexoResult = await client.query(
        `SELECT 
          sexo,
          COUNT(*) as total
        FROM animais
        WHERE data_nascimento IS NOT NULL ${dateFilter}
        GROUP BY sexo`
      )

      let total_machos = 0
      let total_femeas = 0
      sexoResult.rows.forEach(row => {
        const sexo = (row.sexo || '').toString().toLowerCase()
        if (sexo.includes('macho') || sexo === 'm') {
          total_machos = parseInt(row.total) || 0
        } else if (sexo.includes('fêmea') || sexo.includes('femea') || sexo === 'f') {
          total_femeas = parseInt(row.total) || 0
        }
      })

      // Peso médio
      const pesoResult = await client.query(
        `SELECT AVG(peso) as peso_medio 
         FROM animais 
         WHERE peso IS NOT NULL AND peso > 0 ${dateFilter}`
      )
      const peso_medio = parseFloat(pesoResult.rows[0].peso_medio) || 0

      // Por tipo de nascimento
      const tipoResult = await client.query(
        `SELECT 
          CASE 
            WHEN is_fiv = true THEN 'FIV'
            WHEN tipo_nascimento LIKE '%IA%' OR tipo_nascimento LIKE '%Inseminação%' THEN 'IA'
            ELSE 'Natural'
          END as tipo,
          COUNT(*) as total
        FROM animais
        WHERE data_nascimento IS NOT NULL ${dateFilter}
        GROUP BY tipo`
      )

      let total_fiv = 0
      let total_ia = 0
      let total_natural = 0
      tipoResult.rows.forEach(row => {
        const tipo = (row.tipo || '').toString()
        const total = parseInt(row.total) || 0
        if (tipo === 'FIV') total_fiv = total
        else if (tipo === 'IA') total_ia = total
        else total_natural = total
      })

      // Top mães
      const maesResult = await client.query(
        `SELECT 
          mae,
          COUNT(*) as total_nascimentos,
          COUNT(CASE WHEN sexo LIKE '%Macho%' OR sexo = 'M' THEN 1 END) as total_machos,
          COUNT(CASE WHEN sexo LIKE '%Fêmea%' OR sexo LIKE '%Femea%' OR sexo = 'F' THEN 1 END) as total_femeas
        FROM animais
        WHERE mae IS NOT NULL AND mae != '' AND data_nascimento IS NOT NULL ${dateFilter}
        GROUP BY mae
        ORDER BY total_nascimentos DESC
        LIMIT 10`
      )

      const top_maes = maesResult.rows.map(row => {
        const mae = row.mae || ''
        const parts = mae.split(/\s+/)
        return {
          identificacao: mae,
          serie: parts[0] || '',
          rg: parts[1] || '',
          total_nascimentos: parseInt(row.total_nascimentos) || 0,
          total_machos: parseInt(row.total_machos) || 0,
          total_femeas: parseInt(row.total_femeas) || 0
        }
      })

      // Tendência mensal
      const tendenciaResult = await client.query(
        `SELECT 
          TO_CHAR(data_nascimento, 'YYYY-MM') as mes,
          COUNT(*) as total
        FROM animais
        WHERE data_nascimento IS NOT NULL ${dateFilter}
        GROUP BY TO_CHAR(data_nascimento, 'YYYY-MM')
        ORDER BY mes DESC
        LIMIT 12`
      )

      const tendencia_mensal = tendenciaResult.rows.map(row => ({
        mes: row.mes,
        total: parseInt(row.total) || 0
      }))

      const max_mensal = Math.max(...tendencia_mensal.map(m => m.total), 1)

      return sendSuccess(res, {
        total_nascimentos,
        total_machos,
        total_femeas,
        peso_medio,
        total_fiv,
        total_ia,
        total_natural,
        top_maes,
        tendencia_mensal,
        max_mensal
      }, 'Estatísticas de nascimentos carregadas com sucesso')
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error('Erro ao carregar estatísticas de nascimentos:', error)
    return sendValidationError(res, `Erro ao carregar estatísticas: ${error.message}`)
  }
})
