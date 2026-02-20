import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { period = 'month', type = 'all' } = req.query

    // Definir período de consulta
    let dateFilter = ''
    const now = new Date()
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = `AND g.data_cobertura >= '${weekAgo.toISOString().split('T')[0]}'`
        break
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        dateFilter = `AND g.data_cobertura >= '${monthAgo.toISOString().split('T')[0]}'`
        break
      case 'quarter':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        dateFilter = `AND g.data_cobertura >= '${quarterAgo.toISOString().split('T')[0]}'`
        break
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        dateFilter = `AND g.data_cobertura >= '${yearAgo.toISOString().split('T')[0]}'`
        break
      default:
        dateFilter = `AND g.data_cobertura >= '${now.getFullYear()}-01-01'`
    }

    // Filtro por tipo
    let typeFilter = ''
    if (type !== 'all') {
      typeFilter = `AND g.tipo_cobertura = '${type}'`
    }

    // 1. Totais por tipo
    const totalsQuery = `
      SELECT 
        g.tipo_cobertura,
        COUNT(*) as total
      FROM gestacoes g
      WHERE g.tipo_cobertura IS NOT NULL
      ${dateFilter}
      ${typeFilter}
      GROUP BY g.tipo_cobertura
      ORDER BY g.tipo_cobertura
    `
    
    const totalsResult = await query(totalsQuery)
    
    let totalIA = 0
    let totalFIV = 0
    
    totalsResult.rows.forEach(row => {
      if (row.tipo_cobertura === 'IA') {
        totalIA = parseInt(row.total)
      } else if (row.tipo_cobertura === 'FIV') {
        totalFIV = parseInt(row.total)
      }
    })

    // 2. Dados mensais para gráfico
    const monthlyQuery = `
      SELECT 
        TO_CHAR(g.data_cobertura, 'YYYY-MM') as month,
        g.tipo_cobertura,
        COUNT(*) as count
      FROM gestacoes g
      WHERE g.tipo_cobertura IS NOT NULL
      AND g.data_cobertura >= '2025-01-01'
      ${typeFilter}
      GROUP BY TO_CHAR(g.data_cobertura, 'YYYY-MM'), g.tipo_cobertura
      ORDER BY month DESC
      LIMIT 12
    `
    
    const monthlyResult = await query(monthlyQuery)
    
    // Processar dados mensais
    const monthlyMap = {}
    monthlyResult.rows.forEach(row => {
      if (!monthlyMap[row.month]) {
        monthlyMap[row.month] = { month: row.month, ia: 0, fiv: 0, total: 0 }
      }
      
      if (row.tipo_cobertura === 'IA') {
        monthlyMap[row.month].ia = parseInt(row.count)
      } else if (row.tipo_cobertura === 'FIV') {
        monthlyMap[row.month].fiv = parseInt(row.count)
      }
      
      monthlyMap[row.month].total += parseInt(row.count)
    })
    
    const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))

    // 3. Coberturas recentes
    const recentQuery = `
      SELECT 
        g.id,
        g.tipo_cobertura,
        g.receptora_serie || ' ' || g.receptora_rg as animal,
        g.pai_rg as bull,
        g.data_cobertura,
        g.situacao as status,
        'PIQ ' || COALESCE(la.piquete, 'N/A') as location
      FROM gestacoes g
      LEFT JOIN animais a ON (a.serie = g.receptora_serie AND a.rg = g.receptora_rg)
      LEFT JOIN localizacoes_animais la ON a.id = la.animal_id
      WHERE g.tipo_cobertura IS NOT NULL
      ${dateFilter}
      ${typeFilter}
      ORDER BY g.data_cobertura DESC, g.created_at DESC
      LIMIT 10
    `
    
    const recentResult = await query(recentQuery)
    
    const recentCoverages = recentResult.rows.map(row => ({
      id: row.id,
      type: row.tipo_cobertura,
      animal: row.animal,
      bull: row.bull || 'Touro não informado',
      date: row.data_cobertura,
      status: row.status === 'Em Gestação' ? 'Prenha' : row.status,
      location: row.location
    }))

    // 4. Estatísticas adicionais
    const statsQuery = `
      SELECT 
        COUNT(*) as total_gestacoes,
        COUNT(CASE WHEN g.situacao = 'Em Gestação' THEN 1 END) as gestacoes_ativas,
        COUNT(CASE WHEN g.situacao = 'Nascido' THEN 1 END) as nascimentos,
        ROUND(
          COUNT(CASE WHEN g.situacao = 'Em Gestação' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 1
        ) as taxa_sucesso
      FROM gestacoes g
      WHERE g.tipo_cobertura IS NOT NULL
      ${dateFilter}
      ${typeFilter}
    `
    
    const statsResult = await query(statsQuery)
    const stats = statsResult.rows[0] || {}

    // Resposta final
    const response = {
      totalIA,
      totalFIV,
      monthlyData,
      recentCoverages,
      stats: {
        totalGestacoes: parseInt(stats.total_gestacoes || 0),
        gestacaoesAtivas: parseInt(stats.gestacoes_ativas || 0),
        nascimentos: parseInt(stats.nascimentos || 0),
        taxaSucesso: parseFloat(stats.taxa_sucesso || 0)
      },
      period,
      type,
      generatedAt: new Date().toISOString()
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Erro ao buscar dados de cobertura:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}