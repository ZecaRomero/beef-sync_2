/**
 * GET /api/notas-fiscais/receptoras?numero=2141
 * Retorna lista de receptoras (animais) vinculadas à NF, com links para a tela de detalhes.
 */
import { query } from '../../../lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { numero } = req.query
  if (!numero) {
    return res.status(400).json({ error: 'Parâmetro numero é obrigatório' })
  }

  try {
    const nf = await query(`
      SELECT id, numero_nf, eh_receptoras, data_te, fornecedor
      FROM notas_fiscais WHERE numero_nf = $1 AND tipo = 'entrada'
    `, [numero])

    if (nf.rows.length === 0) {
      return res.status(404).json({ success: false, receptoras: [], message: 'NF não encontrada' })
    }

    // Buscar receptoras: 1) pelos itens da NF + match em animais, 2) por TE com observacoes da NF
    const itens = await query(`
      SELECT dados_item FROM notas_fiscais_itens
      WHERE nota_fiscal_id = $1 AND (tipo_produto = 'bovino' OR tipo_produto IS NULL)
      ORDER BY id
    `, [nf.rows[0].id])

    const receptoras = []
    const processados = new Set()

    for (const row of itens.rows) {
      const d = row.dados_item || {}
      const tatuagem = (d.tatuagem || d.brinco || '').toString().trim().replace(/\s+/g, ' ')
      if (!tatuagem) continue

      const match = tatuagem.match(/^(\D*)\s*(\d+)$/)
      const parteNum = match ? match[2] : tatuagem.replace(/\D/g, '')
      // Série deve ser só letras (M, não M9775) para evitar duplicatas
      let serie = match ? (match[1] || 'M').trim().replace(/\d+$/, '') : 'M'
      if (!serie) serie = 'M'
      const rg = parteNum
      const chave = `${serie}-${rg}`

      if (processados.has(chave)) continue
      processados.add(chave)

      const animal = (await query(`
        SELECT id, serie, rg, nome FROM animais
        WHERE (serie = $1 AND rg = $2) OR (REPLACE(serie, ' ', '') = $3 AND rg = $2)
        LIMIT 1
      `, [serie, rg, serie.replace(/\s/g, '')]))?.rows[0]

      receptoras.push({
        tatuagem,
        serie: animal?.serie || serie,
        rg: animal?.rg || rg,
        animal_id: animal?.id || null,
        link: animal?.id ? `/animals/${animal.id}` : null
      })
    }

    return res.status(200).json({
      success: true,
      numero_nf: numero,
      data_te: nf.rows[0].data_te,
      fornecedor: nf.rows[0].fornecedor,
      total: receptoras.length,
      receptoras
    })
  } catch (err) {
    console.error('Erro ao buscar receptoras:', err)
    return res.status(500).json({ error: err.message })
  }
}
