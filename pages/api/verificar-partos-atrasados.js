import { query } from '../../lib/database'
import { sendSuccess, sendError } from '../../utils/apiResponse'

/**
 * API para verificar partos atrasados de transferências de embriões
 * Calcula data esperada (9 meses após TE) e verifica se já passou sem nascimento
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Buscar todas as transferências de embriões realizadas
    const transferencias = await query(`
      SELECT 
        te.id,
        te.numero_te,
        te.data_te,
        te.receptora_nome,
        te.doadora_nome,
        te.touro,
        te.status,
        te.sexo_prenhez,
        g.id as gestacao_id,
        g.situacao as gestacao_situacao
      FROM transferencias_embrioes te
      LEFT JOIN gestacoes g ON (
        g.receptora_nome = te.receptora_nome 
        AND g.data_cobertura = te.data_te::date
      )
      WHERE te.status = 'realizada' OR te.status = 'Realizada'
      ORDER BY te.data_te DESC
    `)

    const partosAtrasados = []
    const partosProximos = []

    for (const te of transferencias.rows) {
      // Calcular data esperada de parto (9 meses = 276 dias após a TE)
      const dataTE = new Date(te.data_te)
      const dataEsperadaParto = new Date(dataTE)
      dataEsperadaParto.setDate(dataEsperadaParto.getDate() + 276)
      dataEsperadaParto.setHours(0, 0, 0, 0)

      const diasDiferenca = Math.floor((hoje - dataEsperadaParto) / (1000 * 60 * 60 * 24))

      // Verificar se existe nascimento vinculado à gestação
      let temNascimento = false
      if (te.gestacao_id) {
        const nascimento = await query(`
          SELECT id FROM nascimentos 
          WHERE gestacao_id = $1
          LIMIT 1
        `, [te.gestacao_id])
        temNascimento = nascimento.rows.length > 0
      }

      // Se a data esperada já passou e não tem nascimento
      if (diasDiferenca > 0 && !temNascimento) {
        partosAtrasados.push({
          te_id: te.id,
          numero_te: te.numero_te,
          receptora_nome: te.receptora_nome,
          doadora_nome: te.doadora_nome,
          touro: te.touro,
          data_te: te.data_te,
          data_esperada_parto: dataEsperadaParto.toISOString().split('T')[0],
          dias_atraso: diasDiferenca,
          gestacao_id: te.gestacao_id,
          gestacao_situacao: te.gestacao_situacao
        })
      } 
      // Se está próximo (até 30 dias antes ou depois)
      else if (diasDiferenca >= -30 && diasDiferenca <= 30 && !temNascimento) {
        partosProximos.push({
          te_id: te.id,
          numero_te: te.numero_te,
          receptora_nome: te.receptora_nome,
          doadora_nome: te.doadora_nome,
          touro: te.touro,
          data_te: te.data_te,
          data_esperada_parto: dataEsperadaParto.toISOString().split('T')[0],
          dias_restantes: -diasDiferenca,
          gestacao_id: te.gestacao_id
        })
      }
    }

    return sendSuccess(res, {
      partosAtrasados,
      partosProximos,
      totalAtrasados: partosAtrasados.length,
      totalProximos: partosProximos.length
    })

  } catch (error) {
    console.error('Erro ao verificar partos atrasados:', error)
    return sendError(res, 'Erro ao verificar partos atrasados', 500)
  }
}
