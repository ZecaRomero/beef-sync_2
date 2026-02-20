import { query } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Verificar estrutura da tabela animais
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'animais' 
      ORDER BY ordinal_position
    `)

    res.status(200).json({
      success: true,
      columns: result.rows
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}