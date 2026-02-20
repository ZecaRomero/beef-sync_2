import { query } from '../../../lib/database'

// GET /api/contabilidade/debug-movimentacoes?numero_nf=XXXX
// Lista movimentações contábeis vinculadas a um número de NF via dados_extras
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { numero_nf } = req.query || {}
    if (!numero_nf) {
      return res.status(400).json({ message: 'Parâmetro numero_nf é obrigatório' })
    }

    const result = await query(
      `
        SELECT 
          mc.id,
          mc.tipo,
          mc.subtipo,
          mc.data_movimento,
          mc.localidade,
          mc.valor,
          mc.descricao,
          mc.dados_extras
        FROM movimentacoes_contabeis mc
        WHERE mc.tipo = 'entrada'
          AND COALESCE(mc.localidade, '') ILIKE '%pardinho%'
          AND (mc.dados_extras ->> 'numero_nf') = $1
        ORDER BY mc.data_movimento DESC, mc.id DESC
      `,
      [String(numero_nf)]
    )

    return res.status(200).json({ total: result.rows.length, movimentacoes: result.rows })
  } catch (error) {
    console.error('Erro ao consultar movimentações por NF:', error)
    return res.status(500).json({ message: 'Erro ao consultar movimentações', error: error.message })
  }
}