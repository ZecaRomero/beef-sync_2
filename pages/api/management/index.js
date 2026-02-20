import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getManagementData(req, res);
      case 'POST':
        return await createManagementRecord(req, res);
      case 'PUT':
        return await updateManagementRecord(req, res);
      case 'DELETE':
        return await deleteManagementRecord(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de manejo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getManagementData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas de manejo
    const statsQuery = `
      SELECT 
        COUNT(*) as total_animals,
        COUNT(CASE WHEN peso IS NOT NULL THEN 1 END) as recent_weighings,
        COUNT(DISTINCT l.piquete) as active_lots,
        COUNT(CASE WHEN situacao = 'Ativo' THEN 1 END) as active_animals
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Atividades diárias (baseado em registros recentes)
    const activitiesQuery = `
      SELECT 
        'Pesagem' as activity_type,
        a.serie || '-' || a.rg as animal_name,
        a.peso as current_weight,
        a.updated_at as activity_date,
        l.piquete as lote_name,
        'Concluída' as status
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      WHERE a.updated_at >= CURRENT_DATE - INTERVAL '7 days'
        AND a.peso IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'Movimentação' as activity_type,
        a.serie || '-' || a.rg as animal_name,
        NULL as current_weight,
        a.created_at as activity_date,
        l.piquete as lote_name,
        'Concluída' as status
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      WHERE a.created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      ORDER BY activity_date DESC
      LIMIT 20
    `;
    
    const activitiesResult = await client.query(activitiesQuery);
    
    // Movimentações recentes (mudanças de lote)
    const movementsQuery = `
      SELECT 
        a.id,
        a.serie || '-' || a.rg as animal_name,
        l_anterior.piquete as from_location,
        l_atual.piquete as to_location,
        l_atual.data_entrada as movement_date,
        'Transferência entre piquetes' as movement_type
      FROM animais a
      LEFT JOIN localizacoes_animais l_atual ON a.id = l_atual.animal_id AND l_atual.data_saida IS NULL
      LEFT JOIN localizacoes_animais l_anterior ON a.id = l_anterior.animal_id 
        AND l_anterior.data_entrada < l_atual.data_entrada
        AND l_anterior.data_saida IS NOT NULL
      WHERE l_atual.data_entrada >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY l_atual.data_entrada DESC
      LIMIT 15
    `;
    
    const movementsResult = await client.query(movementsQuery);
    
    // Pesagens pendentes (animais sem pesagem recente)
    const pendingWeighingsQuery = `
      SELECT 
        a.serie || '-' || a.rg as animal_name,
        a.peso as last_weight,
        a.updated_at as last_weighing_date,
        l.piquete as lote_name,
        CASE 
          WHEN a.peso IS NULL THEN 'Nunca pesado'
          WHEN a.updated_at < CURRENT_DATE - INTERVAL '90 days' THEN 'Pesagem atrasada'
          ELSE 'Pesagem em dia'
        END as status
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      WHERE a.situacao = 'Ativo'
        AND (a.peso IS NULL OR a.updated_at < CURRENT_DATE - INTERVAL '60 days')
      ORDER BY a.updated_at ASC NULLS FIRST
      LIMIT 20
    `;
    
    const pendingWeighingsResult = await client.query(pendingWeighingsQuery);
    
    // Trabalhadores ativos (baseado em piquetes ativos)
    const workersQuery = `
      SELECT 
        l.piquete as id,
        l.piquete as worker_name,
        COUNT(a.id) as animals_managed,
        'Ativo' as status,
        MIN(l.data_entrada) as assignment_date
      FROM localizacoes_animais l
      LEFT JOIN animais a ON l.animal_id = a.id AND a.situacao = 'Ativo' AND l.data_saida IS NULL
      WHERE l.data_saida IS NULL
      GROUP BY l.piquete
      ORDER BY COUNT(a.id) DESC
      LIMIT 10
    `;
    
    const workersResult = await client.query(workersQuery);

    const response = {
      stats: {
        scheduled_activities: activitiesResult.rows.length,
        completed_activities: activitiesResult.rows.filter(a => a.status === 'Concluída').length,
        pending_weighing: pendingWeighingsResult.rows.length,
        animal_movements: movementsResult.rows.length,
        active_workers: workersResult.rows.length
      },
      daily_activities: activitiesResult.rows,
      recent_movements: movementsResult.rows,
      pending_weighings: pendingWeighingsResult.rows,
      workers: workersResult.rows
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}

async function createManagementRecord(req, res) {
  const client = await pool.connect();
  try {
    const { type, animal_id, data, notes } = req.body;
    
    if (type === 'weighing') {
      // Atualizar peso do animal
      const updateQuery = `
        UPDATE animais 
        SET peso = $1, data_pesagem = CURRENT_DATE
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [data.weight, animal_id]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Pesagem registrada com sucesso'
      });
    } else if (type === 'movement') {
      // Mover animal para novo lote
      const updateQuery = `
        UPDATE animais 
        SET lote_id = $1
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [data.new_lote_id, animal_id]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Movimentação registrada com sucesso'
      });
    } else if (type === 'activity') {
      // Registrar atividade como custo de manejo
      const insertQuery = `
        INSERT INTO custos (animal_id, descricao, valor, data_registro, categoria)
        VALUES ($1, $2, $3, CURRENT_DATE, 'Manejo')
        RETURNING *
      `;
      
      const description = `${data.activity_name} - ${notes || 'Atividade de manejo'}`;
      const result = await client.query(insertQuery, [animal_id, description, data.cost || 0]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Atividade registrada com sucesso'
      });
    }
    
    return res.status(400).json({ error: 'Tipo de registro não reconhecido' });
  } finally {
    client.release();
  }
}

async function updateManagementRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { peso, lote_id, descricao, valor } = req.body;
    
    if (peso !== undefined) {
      // Atualizar peso do animal
      const updateQuery = `
        UPDATE animais 
        SET peso = $1, data_pesagem = CURRENT_DATE
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [peso, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Peso atualizado com sucesso'
      });
    } else if (lote_id !== undefined) {
      // Atualizar lote do animal
      const updateQuery = `
        UPDATE animais 
        SET lote_id = $1
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [lote_id, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Lote atualizado com sucesso'
      });
    } else {
      // Atualizar registro de custo de manejo
      const updateQuery = `
        UPDATE custos 
        SET descricao = $1, valor = $2
        WHERE id = $3 AND categoria = 'Manejo'
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [descricao, valor, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Registro de manejo não encontrado' });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0],
        message: 'Registro de manejo atualizado com sucesso'
      });
    }
  } finally {
    client.release();
  }
}

async function deleteManagementRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    
    const deleteQuery = `
      DELETE FROM custos 
      WHERE id = $1 AND categoria = 'Manejo'
      RETURNING *
    `;
    
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de manejo não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Registro de manejo excluído com sucesso'
    });
  } finally {
    client.release();
  }
}