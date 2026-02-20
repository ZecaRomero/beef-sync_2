import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMonitoringData(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de monitoramento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getMonitoringData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas gerais do rebanho
    const statsQuery = `
      SELECT 
        COUNT(*) as total_animals,
        COUNT(CASE WHEN situacao = 'Ativo' THEN 1 END) as active_animals,
        AVG(peso) as avg_weight,
        COUNT(CASE WHEN situacao = 'Morto' THEN 1 END) as deceased_animals
      FROM animais
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Alertas de saúde e monitoramento
    const alertsQuery = `
      SELECT 
        'health' as alert_type,
        a.serie || '-' || a.rg as animal_name,
        'Animal sem pesagem recente' as message,
        'medium' as priority,
        CURRENT_TIMESTAMP as alert_time
      FROM animais a
      WHERE a.situacao = 'Ativo' 
        AND (a.peso IS NULL OR a.updated_at < CURRENT_DATE - INTERVAL '30 days')
      LIMIT 10
    `;
    
    const alertsResult = await client.query(alertsQuery);
    
    // Métricas de performance
    const performanceQuery = `
      SELECT 
        'weight_gain' as metric_name,
        AVG(peso) as current_value,
        450.0 as target_value,
        'kg' as unit,
        CASE 
          WHEN AVG(peso) >= 450 THEN 'good'
          WHEN AVG(peso) >= 350 THEN 'warning'
          ELSE 'critical'
        END as status
      FROM animais 
      WHERE situacao = 'Ativo' AND peso IS NOT NULL
      UNION ALL
      SELECT 
        'mortality_rate' as metric_name,
        ROUND((COUNT(CASE WHEN situacao = 'Morto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) as current_value,
        5.0 as target_value,
        '%' as unit,
        CASE 
          WHEN ROUND((COUNT(CASE WHEN situacao = 'Morto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) <= 5 THEN 'good'
          WHEN ROUND((COUNT(CASE WHEN situacao = 'Morto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2) <= 10 THEN 'warning'
          ELSE 'critical'
        END as status
      FROM animais
    `;
    
    const performanceResult = await client.query(performanceQuery);
    
    const response = {
      stats: statsResult.rows[0],
      alerts: alertsResult.rows,
      performance_metrics: performanceResult.rows,
      system_status: 'Online'
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}