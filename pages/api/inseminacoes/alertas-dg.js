import { query } from '../../../lib/database'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    // Buscar inseminações que precisam de DG (30 dias após IA)
    // Considerar apenas inseminações sem status_gestacao definido ou com status 'pendente'
    const hoje = new Date()
    const dataLimite = new Date(hoje)
    dataLimite.setDate(dataLimite.getDate() - 30)

    const result = await query(`
      SELECT 
        i.*,
        a.serie as animal_serie,
        a.rg as animal_rg,
        a.nome as animal_nome,
        a.tatuagem as animal_tatuagem,
        i.touro,
        i.data_ia,
        CURRENT_DATE - i.data_ia::date as dias_apos_ia
      FROM inseminacoes i
      LEFT JOIN animais a ON i.animal_id = a.id
      WHERE i.data_ia::date <= $1
        AND (i.status_gestacao IS NULL OR i.status_gestacao NOT IN ('prenha', 'Prenha', 'não prenha', 'Não Prenha'))
        AND a.sexo IN ('Fêmea', 'F')
      ORDER BY i.data_ia ASC
    `, [dataLimite.toISOString().split('T')[0]])

    const alertas = result.rows.map(row => ({
      ...row,
      dias_apos_ia: parseInt(row.dias_apos_ia || 0),
      precisa_dg: parseInt(row.dias_apos_ia || 0) >= 30
    }))

    return res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length
    })
  } catch (error) {
    console.error('Erro ao buscar alertas de DG:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar alertas',
      details: error.message
    })
  }
}
