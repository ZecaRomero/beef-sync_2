import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'estoque_semen',
  password: process.env.DB_PASSWORD || 'jcromero85',
  port: process.env.DB_PORT || 5432,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const result = await pool.query(`
      SELECT DISTINCT motorista
      FROM abastecimento_nitrogenio 
      WHERE motorista IS NOT NULL AND motorista != ''
      ORDER BY motorista
    `)
    
    const motoristas = result.rows.map(row => row.motorista)
    
    return res.status(200).json({
      success: true,
      data: motoristas,
      message: 'Motoristas recuperados com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar motoristas',
      message: error.message
    })
  }
}
