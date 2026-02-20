import pool from '../../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    const { dataDG, veterinario, resultadoDG, observacoes } = req.body

    // Atualizar dados do DG
    const query = `
      UPDATE animais 
      SET 
        data_dg = $1,
        veterinario_dg = $2,
        resultado_dg = $3,
        observacoes_dg = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `

    const values = [
      dataDG || null,
      veterinario || null,
      resultadoDG || null,
      observacoes || null,
      id
    ]

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Receptora não encontrada' })
    }

    res.status(200).json({
      success: true,
      message: 'Dados do DG atualizados com sucesso',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Erro ao atualizar DG:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar dados do DG',
      error: error.message 
    })
  }
}
