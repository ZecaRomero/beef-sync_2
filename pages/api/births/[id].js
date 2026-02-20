import { query } from '../../../lib/database'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'ID é obrigatório' })
  }

  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM nascimentos WHERE id = $1', [id])
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Nascimento não encontrado' })
      }

      res.status(200).json(result.rows[0])

    } else if (req.method === 'PUT') {
      const {
        receptora,
        doador,
        rg,
        prevParto,
        nascimento,
        tatuagem,
        cc,
        ps1,
        ps2,
        sexo,
        status,
        touro,
        data,
        observacao,
        tipoCobertura,
        custoDNA,
        descarte,
        morte
      } = req.body

      const queryText = `
        UPDATE nascimentos SET
          receptora = $1,
          doador = $2,
          rg = $3,
          prev_parto = $4,
          nascimento = $5,
          tatuagem = $6,
          cc = $7,
          ps1 = $8,
          ps2 = $9,
          sexo = $10,
          status = $11,
          touro = $12,
          data = $13,
          observacao = $14,
          tipo_cobertura = $15,
          custo_dna = $16,
          descarte = $17,
          morte = $18,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $19
        RETURNING *
      `

      const params = [
        receptora,
        doador,
        rg,
        prevParto,
        nascimento,
        tatuagem,
        cc,
        ps1,
        ps2,
        sexo,
        status,
        touro,
        data,
        observacao,
        tipoCobertura,
        custoDNA || 0,
        descarte || false,
        morte,
        id
      ]

      const result = await query(queryText, params)

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Nascimento não encontrado' })
      }

      res.status(200).json(result.rows[0])

    } else if (req.method === 'DELETE') {
      const result = await query('DELETE FROM nascimentos WHERE id = $1 RETURNING *', [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Nascimento não encontrado' })
      }

      res.status(200).json({
        success: true,
        message: 'Nascimento excluído com sucesso',
        data: result.rows[0]
      })

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).json({ message: 'Método não permitido' })
    }

  } catch (error) {
    console.error('Erro na API de nascimentos:', error)
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

