const { query } = require('../../lib/database')

export default async function handler(req, res) {
  try {
    const result = await query('SELECT COUNT(*) as count FROM abastecimento_nitrogenio')
    return res.status(200).json({ 
      message: 'API funcionando',
      count: result.rows[0].count 
    })
  } catch (error) {
    console.error('Erro na API de teste:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}
