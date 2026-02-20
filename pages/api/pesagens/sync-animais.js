const { query } = require('../../../lib/database')

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const result = await query(`
      UPDATE animais a SET
        peso = sub.peso,
        updated_at = NOW()
      FROM (
        SELECT DISTINCT ON (animal_id) animal_id, peso
        FROM pesagens
        ORDER BY animal_id, data DESC NULLS LAST
      ) sub
      WHERE a.id = sub.animal_id
    `)

    return res.status(200).json({
      success: true,
      message: 'Pesos dos animais sincronizados com a última pesagem',
      atualizados: result.rowCount || 0
    })
  } catch (error) {
    console.error('Erro ao sincronizar pesos:', error)
    return res.status(500).json({ error: 'Erro: ' + (error.message || 'Erro interno') })
  }
}
