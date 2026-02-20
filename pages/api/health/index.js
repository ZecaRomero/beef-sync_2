import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getHealthData(req, res);
      case 'POST':
        return await createHealthRecord(req, res);
      case 'PUT':
        return await updateHealthRecord(req, res);
      case 'DELETE':
        return await deleteHealthRecord(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de saúde:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getHealthData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas de saúde
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN situacao = 'Ativo' THEN 1 END) as total_active_animals,
        COUNT(CASE WHEN situacao != 'Ativo' THEN 1 END) as animals_in_quarantine,
        0 as pending_vaccinations,
        0 as recent_exams,
        ROUND(
          (COUNT(CASE WHEN situacao != 'Ativo' THEN 1 END)::numeric / 
           NULLIF(COUNT(*)::numeric, 0)) * 100, 2
        ) as mortality_rate
      FROM animais
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Vacinações programadas (usando custos como proxy)
    const vaccinationsQuery = `
      SELECT 
        c.id,
        c.data as vaccination_date,
        a.serie || '-' || a.rg as animal_name,
        c.tipo as protocol_name,
        c.observacoes as notes,
        'Programada' as status
      FROM custos c
      LEFT JOIN animais a ON c.animal_id = a.id
      WHERE c.tipo = 'Veterinário' 
        AND c.data >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY c.data DESC
      LIMIT 20
    `;
    
    const vaccinationsResult = await client.query(vaccinationsQuery);
    
    // Alertas de saúde (baseado em animais inativos e custos veterinários)
    const alertsQuery = `
      SELECT 
        a.serie || '-' || a.rg as animal_name,
        CASE 
          WHEN a.situacao != 'Ativo' THEN 'Animal inativo - verificar saúde'
          WHEN c.valor > 500 THEN 'Alto custo veterinário - acompanhar'
          WHEN a.peso < 100 THEN 'Peso baixo - possível problema de saúde'
          ELSE 'Monitoramento de rotina'
        END as alert_message,
        CASE 
          WHEN a.situacao != 'Ativo' THEN 'high'
          WHEN c.valor > 500 THEN 'medium'
          ELSE 'low'
        END as priority,
        c.data as alert_date
      FROM animais a
      LEFT JOIN custos c ON a.id = c.animal_id AND c.tipo = 'Veterinário'
      WHERE a.situacao != 'Ativo' 
        OR c.valor > 500 
        OR a.peso < 100
      ORDER BY 
        CASE WHEN a.situacao != 'Ativo' THEN 1 
             WHEN c.valor > 500 THEN 2 
             ELSE 3 END,
        c.data DESC
      LIMIT 15
    `;
    
    const alertsResult = await client.query(alertsQuery);
    
    // Exames recentes (usando custos veterinários)
    const examsQuery = `
      SELECT 
        c.id,
        c.data as exam_date,
        a.serie || '-' || a.rg as animal_name,
        c.subtipo as exam_type,
        c.valor as cost,
        'Concluído' as status
      FROM custos c
      LEFT JOIN animais a ON c.animal_id = a.id
      WHERE c.tipo = 'Veterinário'
        AND c.data >= CURRENT_DATE - INTERVAL '60 days'
      ORDER BY c.data DESC
      LIMIT 15
    `;
    
    const examsResult = await client.query(examsQuery);
    
    // Medicamentos (baseado em custos de medicamentos)
    const medicationsQuery = `
      SELECT 
        c.id,
        c.subtipo as medication_name,
        a.serie || '-' || a.rg as animal_name,
        c.valor as cost,
        c.data as application_date,
        'Aplicado' as status
      FROM custos c
      LEFT JOIN animais a ON c.animal_id = a.id
      WHERE c.observacoes ILIKE '%medicamento%'
        OR c.observacoes ILIKE '%vacina%'
        OR c.observacoes ILIKE '%antibiótico%'
        OR c.observacoes ILIKE '%vermífugo%'
        OR c.subtipo ILIKE '%medicamento%'
        OR c.subtipo ILIKE '%vacina%'
      ORDER BY c.data DESC
      LIMIT 20
    `;
    
    const medicationsResult = await client.query(medicationsQuery);

    const response = {
      stats: {
        animals_in_quarantine: parseInt(statsResult.rows[0]?.animals_in_quarantine || 0),
        pending_vaccinations: vaccinationsResult.rows.length,
        recent_exams: examsResult.rows.length,
        health_alerts: alertsResult.rows.length,
        mortality_rate: parseFloat(statsResult.rows[0]?.mortality_rate || 0)
      },
      vaccinations: vaccinationsResult.rows,
      alerts: alertsResult.rows,
      recent_exams: examsResult.rows,
      medications: medicationsResult.rows
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}

async function createHealthRecord(req, res) {
  const client = await pool.connect();
  try {
    const { animal_id, type, description, cost, date, notes } = req.body;
    
    if (type === 'vaccination') {
      // Criar registro de protocolo aplicado
      const insertQuery = `
        INSERT INTO protocolos_aplicados (animal_id, protocolo_id, data_aplicacao, observacoes)
        VALUES ($1, 1, $2, $3)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [animal_id, date, `${description} - ${notes || ''}`]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Vacinação registrada com sucesso'
      });
    } else if (type === 'exam' || type === 'medication') {
      // Criar registro de custo veterinário
      const insertQuery = `
        INSERT INTO custos (animal_id, descricao, valor, data_registro, categoria)
        VALUES ($1, $2, $3, $4, 'Veterinário')
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [animal_id, description, cost || 0, date]);
      
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: `${type === 'exam' ? 'Exame' : 'Medicamento'} registrado com sucesso`
      });
    }
    
    return res.status(400).json({ error: 'Tipo de registro não reconhecido' });
  } finally {
    client.release();
  }
}

async function updateHealthRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { descricao, valor, observacoes } = req.body;
    
    // Tentar atualizar em custos primeiro
    const updateCostQuery = `
      UPDATE custos 
      SET descricao = $1, valor = $2
      WHERE id = $3 AND categoria = 'Veterinário'
      RETURNING *
    `;
    
    let result = await client.query(updateCostQuery, [descricao, valor, id]);
    
    if (result.rows.length === 0) {
      // Tentar atualizar em protocolos aplicados
      const updateProtocolQuery = `
        UPDATE protocolos_aplicados 
        SET observacoes = $1
        WHERE id = $2
        RETURNING *
      `;
      
      result = await client.query(updateProtocolQuery, [observacoes, id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de saúde não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Registro de saúde atualizado com sucesso'
    });
  } finally {
    client.release();
  }
}

async function deleteHealthRecord(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    
    // Tentar deletar de custos primeiro
    let deleteQuery = `
      DELETE FROM custos 
      WHERE id = $1 AND categoria = 'Veterinário'
      RETURNING *
    `;
    
    let result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      // Tentar deletar de protocolos aplicados
      deleteQuery = `
        DELETE FROM protocolos_aplicados 
        WHERE id = $1
        RETURNING *
      `;
      
      result = await client.query(deleteQuery, [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de saúde não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Registro de saúde excluído com sucesso'
    });
  } finally {
    client.release();
  }
}