import { pool } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getCommercialData(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API comercial:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getCommercialData(req, res) {
  const client = await pool.connect();
  try {
    // Estatísticas de vendas baseadas na tabela custos
    const salesQuery = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(CASE WHEN tipo = 'Venda' THEN valor ELSE 0 END) as total_revenue,
        AVG(CASE WHEN tipo = 'Venda' THEN valor ELSE NULL END) as avg_sale_value
      FROM custos 
      WHERE tipo = 'Venda' OR observacoes ILIKE '%venda%'
    `;
    
    const salesResult = await client.query(salesQuery);
    
    // Vendas recentes
    const recentSalesQuery = `
      SELECT 
        c.id,
        a.serie || '-' || a.rg as animal_name,
        c.valor as sale_value,
        c.data as sale_date,
        c.observacoes as notes
      FROM custos c
      LEFT JOIN animais a ON c.animal_id = a.id
      WHERE c.tipo = 'Venda' OR c.observacoes ILIKE '%venda%'
      ORDER BY c.data DESC
      LIMIT 10
    `;
    
    const recentSalesResult = await client.query(recentSalesQuery);
    
    // Preços de mercado simulados
    const marketPricesQuery = `
      SELECT 
        'Boi Gordo' as product,
        180.50 as price_per_kg,
        'R$/kg' as unit,
        CURRENT_DATE as last_update,
        'Estável' as trend
      UNION ALL
      SELECT 
        'Bezerro Desmamado' as product,
        2800.00 as price_per_kg,
        'R$/cabeça' as unit,
        CURRENT_DATE as last_update,
        'Alta' as trend
    `;
    
    const marketPricesResult = await client.query(marketPricesQuery);
    
    const response = {
      stats: salesResult.rows[0],
      sales: recentSalesResult.rows,
      market_prices: marketPricesResult.rows,
      contracts: []
    };

    return res.status(200).json(response);
  } finally {
    client.release();
  }
}