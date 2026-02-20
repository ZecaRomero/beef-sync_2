import { query } from '../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Verificar constraints da tabela transferencias_embrioes
    const result = await query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'transferencias_embrioes'::regclass
    `)

    res.status(200).json({
      success: true,
      constraints: result.rows
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}