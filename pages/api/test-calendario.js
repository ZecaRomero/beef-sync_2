import { query } from '../../lib/database'

export default async function handler(req, res) {
  const start = '2026-01-01'
  const end = '2026-12-31'

  try {
    console.log('Testando calendário reprodutivo...')

    // Testar eventos manuais
    console.log('1. Buscando eventos manuais...')
    const manuais = await query(`
      SELECT COUNT(*) as total FROM calendario_reprodutivo
      WHERE data_evento >= $1 AND data_evento <= $2
    `, [start, end])
    console.log('Eventos manuais:', manuais.rows[0].total)

    // Testar previsões de parto
    console.log('2. Buscando previsões de parto...')
    const previsoes = await query(`
      SELECT COUNT(*) as total FROM previsoes_parto
      WHERE data_prevista_parto >= $1 AND data_prevista_parto <= $2
    `, [start, end])
    console.log('Previsões de parto:', previsoes.rows[0].total)

    // Testar receptoras
    console.log('3. Buscando receptoras...')
    const receptoras = await query(`
      SELECT COUNT(*) as total
      FROM notas_fiscais nf
      WHERE nf.eh_receptoras = true
        AND nf.tipo = 'entrada'
        AND nf.data_compra IS NOT NULL
    `)
    console.log('Receptoras totais:', receptoras.rows[0].total)

    // Buscar alguns exemplos
    const exemplos = await query(`
      SELECT data_prevista_parto, status
      FROM previsoes_parto
      WHERE data_prevista_parto >= $1 AND data_prevista_parto <= $2
      LIMIT 5
    `, [start, end])

    return res.status(200).json({
      success: true,
      totais: {
        manuais: manuais.rows[0].total,
        previsoes: previsoes.rows[0].total,
        receptoras: receptoras.rows[0].total
      },
      exemplos_previsoes: exemplos.rows
    })
  } catch (error) {
    console.error('Erro:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
