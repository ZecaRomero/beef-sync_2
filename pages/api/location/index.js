import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getLocationData(req, res);
      case 'POST':
        return await createLocationRecord(req, res);
      case 'PUT':
        return await updateLocationRecord(req, res);
      case 'DELETE':
        return await deleteLocationRecord(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de localização:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getLocationData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas de localização
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT a.id) as total_animals,
        COUNT(CASE WHEN a.situacao = 'Ativo' AND l.id IS NOT NULL THEN 1 END) as tracked_animals,
        COUNT(DISTINCT l.piquete) as active_pastures,
        0 as location_alerts
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Localizações dos animais (baseado em localizacoes_animais)
    const locationsQuery = `
      SELECT 
        a.id,
        a.serie || '-' || a.rg as animal_name,
        l.piquete as current_location,
        l.id as pasture_id,
        l.data_entrada as last_update,
        CASE 
          WHEN a.situacao = 'Ativo' THEN 'Ativo'
          ELSE 'Inativo'
        END as status,
        'GPS' as tracking_method
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      WHERE l.id IS NOT NULL
      ORDER BY l.data_entrada DESC
      LIMIT 30
    `;
    
    const locationsResult = await client.query(locationsQuery);
    
    // Status dos pastos (baseado em localizacoes_animais)
    const pasturesQuery = `
      SELECT 
        l.piquete as id,
        l.piquete as pasture_name,
        COUNT(a.id) as animal_count,
        CASE 
          WHEN COUNT(a.id) = 0 THEN 'Vazio'
          WHEN COUNT(a.id) < 50 THEN 'Baixa lotação'
          WHEN COUNT(a.id) < 100 THEN 'Lotação adequada'
          ELSE 'Alta lotação'
        END as capacity_status,
        AVG(a.peso) as average_weight,
        'Ativo' as status
      FROM (SELECT DISTINCT piquete FROM localizacoes_animais WHERE data_saida IS NULL) l
      LEFT JOIN localizacoes_animais loc ON l.piquete = loc.piquete AND loc.data_saida IS NULL
      LEFT JOIN animais a ON loc.animal_id = a.id AND a.situacao = 'Ativo'
      GROUP BY l.piquete
      ORDER BY COUNT(a.id) DESC
      LIMIT 20
    `;
    
    const pasturesResult = await client.query(pasturesQuery);
    
    // Alertas de localização
    const alertsQuery = `
      WITH pasture_counts AS (
        SELECT 
          l.piquete,
          COUNT(a.id) as animal_count
        FROM localizacoes_animais l
        LEFT JOIN animais a ON l.animal_id = a.id AND a.situacao = 'Ativo'
        WHERE l.data_saida IS NULL
        GROUP BY l.piquete
      )
      SELECT 
        a.serie || '-' || a.rg as animal_name,
        l.piquete as current_location,
        CASE 
          WHEN l.id IS NULL THEN 'Animal sem localização definida'
          WHEN pc.animal_count > 150 THEN 'Superlotação no pasto'
          WHEN pc.animal_count = 1 THEN 'Animal isolado no pasto'
          ELSE 'Localização normal'
        END as alert_message,
        CASE 
          WHEN l.id IS NULL THEN 'high'
          WHEN pc.animal_count > 150 THEN 'medium'
          ELSE 'low'
        END as priority,
        CURRENT_TIMESTAMP as alert_time
      FROM animais a
      LEFT JOIN localizacoes_animais l ON a.id = l.animal_id AND l.data_saida IS NULL
      LEFT JOIN pasture_counts pc ON l.piquete = pc.piquete
      WHERE a.situacao = 'Ativo'
        AND (l.id IS NULL OR pc.animal_count > 150 OR pc.animal_count = 1)
      ORDER BY 
        CASE WHEN l.id IS NULL THEN 1 
             WHEN pc.animal_count > 150 THEN 2 
             ELSE 3 END
      LIMIT 15
    `;
    
    const alertsResult = await client.query(alertsQuery);
    
    // Dispositivos de rastreamento (simulado baseado em animais ativos)
    const devicesQuery = `
      SELECT 
        a.id as device_id,
        CONCAT('GPS-', a.serie, '-', a.rg) as device_name,
        a.serie || '-' || a.rg as animal_brinco,
        a.serie || '-' || a.rg as animal_name,
        CASE 
          WHEN a.situacao = 'Ativo' THEN 'Online'
          ELSE 'Offline'
        END as status,
        95 + (RANDOM() * 5)::int as battery_level,
        a.created_at as last_signal
      FROM animais a
      WHERE a.situacao = 'Ativo'
      ORDER BY a.created_at DESC
      LIMIT 25
    `;
    
    const devicesResult = await client.query(devicesQuery);

    const response = {
      stats: {
        total_animals: parseInt(statsResult.rows[0]?.total_animals || 0),
        tracked_animals: parseInt(statsResult.rows[0]?.tracked_animals || 0),
        active_pastures: parseInt(statsResult.rows[0]?.active_pastures || 0),
        location_alerts: alertsResult.rows.length
      },
      animal_locations: locationsResult.rows,
      pasture_status: pasturesResult.rows,
      alerts: alertsResult.rows,
      tracking_devices: devicesResult.rows
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}

async function createLocationRecord(req, res) {
  const client = await pool.connect();
  try {
    const { animal_id, pasture_id, coordinates, notes } = req.body;
    
    // Atualizar localização do animal (mover para novo lote/pasto)
    const updateQuery = `
      UPDATE animais 
      SET lote_id = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [pasture_id, animal_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    
    // Registrar movimentação como custo de localização
    if (notes) {
      const insertQuery = `
        INSERT INTO custos (animal_id, descricao, valor, data_registro, categoria)
        VALUES ($1, $2, 0, CURRENT_DATE, 'Localização')
        RETURNING *
      `;
      
      await client.query(insertQuery, [animal_id, `Movimentação: ${notes}`]);
    }
    
    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Localização atualizada com sucesso'
    });
  } finally {
    client.release();
  }
}

async function updateLocationRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { lote_id, coordinates, notes } = req.body;
    
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
      message: 'Localização atualizada com sucesso'
    });
  } finally {
    client.release();
  }
}

async function deleteLocationRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    
    // Remover localização (definir lote como null)
    const updateQuery = `
      UPDATE animais 
      SET lote_id = NULL
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Localização removida com sucesso'
    });
  } finally {
    client.release();
  }
}