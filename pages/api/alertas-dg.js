import { pool } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Buscar animais com DG próximo (próximos 7 dias)
      const result = await pool.query(`
        SELECT 
          a.id,
          a.serie,
          a.rg,
          a.nome,
          a.data_chegada,
          a.data_dg_prevista,
          a.data_dg,
          a.resultado_dg,
          (a.data_dg_prevista - CURRENT_DATE) as dias_restantes
        FROM animais a
        WHERE a.data_dg_prevista IS NOT NULL
          AND a.data_dg IS NULL
          AND a.data_dg_prevista BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ORDER BY a.data_dg_prevista ASC
      `)

      // Buscar animais atrasados (DG já passou)
      const atrasados = await pool.query(`
        SELECT 
          a.id,
          a.serie,
          a.rg,
          a.nome,
          a.data_chegada,
          a.data_dg_prevista,
          a.data_dg,
          a.resultado_dg,
          (CURRENT_DATE - a.data_dg_prevista) as dias_atraso
        FROM animais a
        WHERE a.data_dg_prevista IS NOT NULL
          AND a.data_dg IS NULL
          AND a.data_dg_prevista < CURRENT_DATE
        ORDER BY a.data_dg_prevista ASC
      `)

      res.status(200).json({
        success: true,
        data: {
          proximos: result.rows,
          atrasados: atrasados.rows,
          total_proximos: result.rows.length,
          total_atrasados: atrasados.rows.length
        }
      })
    } catch (error) {
      console.error('Erro ao buscar alertas DG:', error)
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar alertas de DG',
        error: error.message
      })
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' })
  }
}
