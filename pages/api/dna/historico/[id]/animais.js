import { query } from '../../../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'ID do envio é obrigatório' })
  }

  if (req.method === 'GET') {
    try {
      // Buscar os animais vinculados ao envio
      const result = await query(
        `SELECT animal_id 
         FROM dna_animais 
         WHERE envio_id = $1
         ORDER BY animal_id`,
        [id]
      )

      const animaisIds = result.rows.map(row => row.animal_id)

      res.status(200).json({
        success: true,
        animais: animaisIds,
        total: animaisIds.length
      })
    } catch (error) {
      console.error('Erro ao buscar animais do envio:', error)
      res.status(500).json({ 
        message: 'Erro ao buscar animais do envio', 
        error: error.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
