import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getPlanningData(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de planejamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getPlanningData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas de planejamento
    const statsQuery = `
      SELECT 
        COUNT(*) as total_animals,
        COUNT(CASE WHEN situacao = 'Ativo' THEN 1 END) as active_animals,
        COUNT(DISTINCT l.piquete) as active_pastures
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
    `;
    
    // Planos de manejo
    const plansQuery = `
      SELECT 
        'Rotação de Pasto' as plan_name,
        'Em Andamento' as status,
        CURRENT_DATE as start_date,
        CURRENT_DATE + INTERVAL '30 days' as end_date,
        'Rotacionar animais entre piquetes para otimizar pastagem' as description
      UNION ALL
      SELECT 
        'Vacinação Anual' as plan_name,
        'Planejado' as status,
        CURRENT_DATE + INTERVAL '60 days' as start_date,
        CURRENT_DATE + INTERVAL '90 days' as end_date,
        'Programa de vacinação preventiva do rebanho' as description
    `;
    
    // Cronogramas
    const schedulesQuery = `
      SELECT 
        'Pesagem Mensal' as activity,
        CURRENT_DATE + INTERVAL '7 days' as scheduled_date,
        'Pesagem de controle do rebanho' as description,
        'Pendente' as status
      UNION ALL
      SELECT 
        'Vermifugação' as activity,
        CURRENT_DATE + INTERVAL '15 days' as scheduled_date,
        'Aplicação de vermífugo no rebanho' as description,
        'Agendado' as status
    `;
    
    const statsResult = await client.query(statsQuery);
    const plansResult = await client.query(plansQuery);
    const schedulesResult = await client.query(schedulesQuery);
    
    const response = {
      stats: {
        total_animals: statsResult.rows[0].total_animals,
        active_animals: statsResult.rows[0].active_animals,
        active_pastures: statsResult.rows[0].active_pastures,
        pending_activities: schedulesResult.rows.length
      },
      plans: plansResult.rows,
      schedules: schedulesResult.rows,
      forecasts: [
        {
          metric: 'Peso Médio Esperado',
          current_value: 350,
          projected_value: 450,
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          confidence: 85
        },
        {
          metric: 'Taxa de Crescimento',
          current_value: 0.8,
          projected_value: 1.2,
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          confidence: 78
        }
      ]
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}