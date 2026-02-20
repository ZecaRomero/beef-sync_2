import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSupplements(req, res);
      case 'POST':
        return await createSupplement(req, res);
      case 'PUT':
        return await updateSupplement(req, res);
      case 'DELETE':
        return await deleteSupplement(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de suplementos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getSupplements(req, res) {
  const client = await pool.connect();
  try {
    // Buscar suplementos baseado nos custos de nutrição
    const supplementsQuery = `
      SELECT 
        c.id,
        c.descricao as name,
        c.valor as cost_per_unit,
        c.data_registro as start_date,
        a.brinco as animal_brinco,
        a.nome as animal_name,
        l.nome as lote_name,
        'Ativo' as status
      FROM custos c
      LEFT JOIN animais a ON c.animal_id = a.id
      LEFT JOIN lotes l ON a.lote_id = l.id
      WHERE c.categoria = 'Nutrição'
        OR c.descricao ILIKE '%suplemento%'
        OR c.descricao ILIKE '%sal%'
        OR c.descricao ILIKE '%ração%'
        OR c.descricao ILIKE '%mineral%'
      ORDER BY c.data_registro DESC
      LIMIT 50
    `;
    
    const result = await client.query(supplementsQuery);
    
    // Estatísticas de suplementos
    const statsQuery = `
      SELECT 
        COUNT(*) as total_supplements,
        SUM(valor) as total_cost,
        COUNT(DISTINCT animal_id) as animals_receiving_supplements
      FROM custos 
      WHERE categoria = 'Nutrição'
        OR descricao ILIKE '%suplemento%'
        OR descricao ILIKE '%sal%'
        OR descricao ILIKE '%ração%'
        OR descricao ILIKE '%mineral%'
    `;
    
    const statsResult = await client.query(statsQuery);
    
    return res.status(200).json({
      supplements: result.rows,
      stats: statsResult.rows[0]
    });
  } finally {
    client.release();
  }
}

async function createSupplement(req, res) {
  const client = await pool.connect();
  try {
    const { animal_id, supplement_name, dosage, cost, frequency, notes } = req.body;
    
    const insertQuery = `
      INSERT INTO custos (animal_id, descricao, valor, data_registro, categoria)
      VALUES ($1, $2, $3, CURRENT_DATE, 'Nutrição')
      RETURNING *
    `;
    
    const description = `Suplemento: ${supplement_name} - ${dosage} - ${frequency}${notes ? ' - ' + notes : ''}`;
    const result = await client.query(insertQuery, [animal_id, description, cost]);
    
    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Suplemento adicionado com sucesso'
    });
  } finally {
    client.release();
  }
}

async function updateSupplement(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.query;
    const { descricao, valor } = req.body;
    
    const updateQuery = `
      UPDATE custos 
      SET descricao = $1, valor = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND categoria = 'Nutrição'
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [descricao, valor, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suplemento não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Suplemento atualizado com sucesso'
    });
  } finally {
    client.release();
  }
}

async function deleteSupplement(req, res) {
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
      return res.status(404).json({ error: 'Suplemento não encontrado' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Suplemento removido com sucesso'
    });
  } finally {
    client.release();
  }
}