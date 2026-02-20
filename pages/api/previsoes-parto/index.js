/**
 * API para obter previsões de parto (FIV e IA)
 * Usado pela página Nascimentos e pelo envio de relatórios
 */
import { query } from '../../../lib/database'
import { sendSuccess, sendError } from '../../../utils/apiResponse'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)
    const hojeStr = hoje.toISOString().split('T')[0]

    const previsoesFIV = []
    const previsoesIA = []

    // 1. Nascimentos com data futura (vêm do batch DG - FIV)
    const nascimentosFuturos = await query(`
      SELECT n.*
      FROM nascimentos n
      WHERE n.data_nascimento::date > $1::date
      ORDER BY n.data_nascimento ASC
    `, [hojeStr])

    nascimentosFuturos.rows.forEach(n => {
      previsoesFIV.push({
        serie: n.serie || '-',
        rg: n.rg ? String(n.rg) : '-',
        receptora: n.receptora || (n.serie && n.rg ? `${n.serie} ${n.rg}` : '-'),
        data_nascimento: n.data_nascimento || n.data,
        sexo: n.sexo || '-',
        origem: 'FIV'
      })
    })

    // 2. Gestações ativas sem nascimento (FIV se tem doadora, IA se não)
    const idsComNascimento = new Set(
      (await query('SELECT gestacao_id FROM nascimentos WHERE gestacao_id IS NOT NULL')).rows.map(r => r.gestacao_id)
    )

    const gestacoes = await query(`
      SELECT * FROM gestacoes
      WHERE (situacao = 'Em Gestação' OR situacao = 'Ativa')
      ORDER BY data_cobertura ASC
    `)

    gestacoes.rows.forEach(g => {
      if (idsComNascimento.has(g.id)) return
      const dataCobertura = new Date(g.data_cobertura)
      const dataParto = new Date(dataCobertura)
      dataParto.setDate(dataParto.getDate() + 276)
      if (dataParto <= hoje) return

      const ehFIV = !!(g.mae_serie || g.mae_rg)
      const receptora = g.receptora_nome || (g.receptora_serie && g.receptora_rg ? `${g.receptora_serie} ${g.receptora_rg}` : '-')
      const item = {
        serie: g.receptora_serie || '-',
        rg: g.receptora_rg || '-',
        receptora,
        data_nascimento: dataParto.toISOString().split('T')[0],
        sexo: g.sexo_prenhez || '-',
        origem: ehFIV ? 'FIV' : 'IA'
      }
      if (ehFIV) previsoesFIV.push(item)
      else previsoesIA.push(item)
    })

    // 3. Inseminações prenhas (IA)
    const inseminacoes = await query(`
      SELECT i.*, a.serie, a.rg, a.nome as animal_nome
      FROM inseminacoes i
      LEFT JOIN animais a ON a.id = i.animal_id
      WHERE LOWER(COALESCE(i.status_gestacao, '')) IN ('prenha', 'prenhez')
      ORDER BY i.data_ia ASC
    `)

    inseminacoes.rows.forEach(ia => {
      const dataIA = new Date(ia.data_ia || ia.data_inseminacao)
      if (isNaN(dataIA.getTime())) return
      const dataParto = new Date(dataIA)
      dataParto.setDate(dataParto.getDate() + 285)
      if (dataParto <= hoje) return

      previsoesIA.push({
        serie: ia.serie || '-',
        rg: ia.rg ? String(ia.rg) : '-',
        receptora: ia.animal_nome || (ia.serie && ia.rg ? `${ia.serie} ${ia.rg}` : '-'),
        data_nascimento: dataParto.toISOString().split('T')[0],
        sexo: '-',
        origem: 'IA',
        touro: ia.touro_nome || '-'
      })
    })

    return sendSuccess(res, {
      previsoesFIV,
      previsoesIA,
      totalFIV: previsoesFIV.length,
      totalIA: previsoesIA.length,
      total: previsoesFIV.length + previsoesIA.length
    })
  } catch (error) {
    console.error('Erro ao buscar previsões de parto:', error)
    return sendError(res, 'Erro ao buscar previsões de parto', 500)
  }
}
