import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const result = await query(
      `SELECT 
        de.*,
        COUNT(da.animal_id) as quantidade_animais_real
      FROM dna_envios de
      LEFT JOIN dna_animais da ON da.envio_id = de.id
      GROUP BY de.id
      ORDER BY de.data_envio DESC, de.created_at DESC
      LIMIT 1000`
    )

    // Buscar animais de cada envio
    const envios = await Promise.all(
      result.rows.map(async (envio) => {
        const animaisResult = await query(
          `SELECT a.id, a.serie, a.rg, a.nome 
           FROM animais a
           INNER JOIN dna_animais da ON da.animal_id = a.id
           WHERE da.envio_id = $1`,
          [envio.id]
        )
        return {
          ...envio,
          animais: animaisResult.rows
        }
      })
    )

    res.status(200).json({
      success: true,
      data: envios
    })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    res.status(500).json({ 
      message: 'Erro ao buscar histórico', 
      error: error.message 
    })
  }
}
