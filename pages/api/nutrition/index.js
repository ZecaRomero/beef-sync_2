import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getNutritionData(req, res);
      case 'POST':
        return await createNutritionRecord(req, res);
      case 'PUT':
        return await updateNutritionRecord(req, res);
      case 'DELETE':
        return await deleteNutritionRecord(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de nutrição:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getNutritionData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas nutricionais
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN tipo = 'Alimentação' OR subtipo = 'Alimentação' THEN 1 END) as total_feedings,
        SUM(CASE WHEN tipo = 'Alimentação' OR subtipo = 'Alimentação' THEN valor ELSE 0 END) as total_cost,
        AVG(CASE WHEN tipo = 'Alimentação' OR subtipo = 'Alimentação' THEN valor ELSE NULL END) as avg_cost_per_feeding,
        COUNT(DISTINCT animal_id) as animals_with_nutrition_records
      FROM custos 
      WHERE tipo = 'Alimentação' OR subtipo = 'Alimentação' OR observacoes ILIKE '%alimentação%' OR observacoes ILIKE '%ração%'
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Alimentações programadas para hoje
    const todayFeedingsQuery = `
      SELECT 
        c.id,
        a.serie || '-' || a.rg as animal_brinco,
        a.serie || '-' || a.rg as animal_name,
        c.tipo as feed_type,
        c.valor as cost,
        c.data as scheduled_date,
        c.observacoes as notes,
        'Programada' as status
      FROM custos c
      JOIN animais a ON c.animal_id = a.id
      WHERE c.data = CURRENT_DATE 
        AND (c.tipo = 'Alimentação' OR c.subtipo = 'Alimentação' OR c.observacoes ILIKE '%alimentação%')
      ORDER BY c.data DESC
      LIMIT 20
    `;
    
    const todayFeedingsResult = await client.query(todayFeedingsQuery);
    
    // Histórico de alimentação
    const feedingHistoryQuery = `
      SELECT 
        c.id,
        a.serie || '-' || a.rg as animal_brinco,
        a.serie || '-' || a.rg as animal_name,
        c.tipo as feed_type,
        c.valor as cost,
        c.data as feeding_date,
        c.observacoes as notes,
        'Concluída' as status
      FROM custos c
      JOIN animais a ON c.animal_id = a.id
      WHERE c.tipo = 'Alimentação' OR c.subtipo = 'Alimentação' OR c.observacoes ILIKE '%alimentação%'
      ORDER BY c.data DESC
      LIMIT 30
    `;
    
    const feedingHistoryResult = await client.query(feedingHistoryQuery);
    
    // Alertas nutricionais (baseado em animais sem registros recentes)
    const alertsQuery = `
      SELECT 
        a.serie || '-' || a.rg as animal_brinco,
        a.serie || '-' || a.rg as animal_name,
        CASE 
          WHEN a.peso < 300 THEN 'Animal com peso baixo - verificar nutrição'
          WHEN NOT EXISTS (
            SELECT 1 FROM custos c 
            WHERE c.animal_id = a.id 
              AND (c.tipo = 'Alimentação' OR c.subtipo = 'Alimentação')
              AND c.data >= CURRENT_DATE - INTERVAL '30 days'
          ) THEN 'Animal sem registro nutricional nos últimos 30 dias'
          ELSE 'Verificar condição nutricional'
        END as alert_message,
        CASE 
          WHEN a.peso < 300 THEN 'high'
          ELSE 'medium'
        END as priority,
        CURRENT_TIMESTAMP as alert_time
      FROM animais a
      WHERE a.situacao = 'Ativo'
        AND (a.peso < 300 OR NOT EXISTS (
          SELECT 1 FROM custos c 
          WHERE c.animal_id = a.id 
            AND (c.tipo = 'Alimentação' OR c.subtipo = 'Alimentação')
            AND c.data >= CURRENT_DATE - INTERVAL '30 days'
        ))
      ORDER BY a.peso ASC NULLS LAST
      LIMIT 15
    `;
    
    const alertsResult = await client.query(alertsQuery);
    
    // Suplementos disponíveis (baseado em custos de suplementação)
    const supplementsQuery = `
      SELECT 
        c.id,
        c.subtipo as supplement_name,
        COUNT(*) as usage_count,
        AVG(c.valor) as avg_cost,
        MAX(c.data) as last_used,
        'Disponível' as status
      FROM custos c
      WHERE c.tipo = 'Alimentação' 
        AND c.subtipo IS NOT NULL 
        AND c.subtipo != 'Alimentação'
      GROUP BY c.id, c.subtipo
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `;
    
    const supplementsResult = await client.query(supplementsQuery);

    const response = {
      stats: {
        total_feedings: parseInt(statsResult.rows[0]?.total_feedings || 0),
        total_cost: parseFloat(statsResult.rows[0]?.total_cost || 0),
        avg_cost_per_feeding: parseFloat(statsResult.rows[0]?.avg_cost_per_feeding || 0),
        animals_with_nutrition_records: parseInt(statsResult.rows[0]?.animals_with_nutrition_records || 0)
      },
      today_feedings: todayFeedingsResult.rows,
      feeding_history: feedingHistoryResult.rows,
      supplements: supplementsResult.rows,
      nutrition_alerts: alertsResult.rows
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}

async function createNutritionRecord(req, res) {
  const client = await pool.connect();
  try {
    const { animal_id, feed_type, quantity, cost, notes } = req.body;
    
    // Inserir registro nutricional (usando tabela de custos como base)
    const insertQuery = `
      INSERT INTO custos (animal_id, descricao, valor, data_registro, categoria)
      VALUES ($1, $2, $3, CURRENT_DATE, 'Nutrição')
      RETURNING *
    `;
    
    const description = `${feed_type} - ${quantity}kg${notes ? ' - ' + notes : ''}`;
    const result = await client.query(insertQuery, [animal_id, description, cost]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Registro nutricional criado com sucesso'
    });
  } finally {
    client.release();
  }
}

async function updateNutritionRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { descricao, valor, categoria } = req.body;
    
    const updateQuery = `
      UPDATE custos 
      SET descricao = $1, valor = $2, categoria = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND categoria = 'Nutrição'
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [descricao, valor, categoria, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro nutricional não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Registro nutricional atualizado com sucesso'
    });
  } finally {
    client.release();
  }
}

async function deleteNutritionRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    
    const deleteQuery = `
      DELETE FROM custos 
      WHERE id = $1 AND categoria = 'Nutrição'
      RETURNING *
    `;
    
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro nutricional não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Registro nutricional excluído com sucesso'
    });
  } finally {
    client.release();
  }
}