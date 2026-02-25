/**
 * API para relatórios visíveis no mobile.
 * GET sem params: retorna config (enabled + allTypes)
 * GET ?tipo=X&startDate=&endDate=: retorna dados do relatório
 */
import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed } from '../../../utils/apiResponse'

const TIPOS_RELATORIOS = [
  { key: 'pesagens', label: 'Pesagens', category: 'Manejo' },
  { key: 'resumo_pesagens', label: 'Resumo de Pesagens', category: 'Manejo' },
  { key: 'femeas_ia', label: 'Fêmeas que Fizeram IA', category: 'Reprodução' },
  { key: 'resumo_femeas_ia', label: 'Resumo de Fêmeas IA', category: 'Reprodução' },
  { key: 'inseminacoes', label: 'Inseminações', category: 'Reprodução' },
  { key: 'gestacoes', label: 'Gestações', category: 'Reprodução' },
  { key: 'nascimentos', label: 'Nascimentos', category: 'Reprodução' },
  { key: 'previsoes_parto', label: 'Previsões de Parto', category: 'Reprodução' },
  { key: 'exames_andrologicos', label: 'Exames Andrológicos', category: 'Reprodução' },
  { key: 'transferencias_embrioes', label: 'Transferências de Embriões', category: 'Reprodução' },
  { key: 'calendario_reprodutivo', label: '📅 Calendário Reprodutivo', category: 'Reprodução' },
  { key: 'mortes', label: 'Mortes', category: 'Sanidade' },
  { key: 'vacinacoes', label: 'Vacinações', category: 'Sanidade' },
  { key: 'estoque_semen', label: 'Estoque de Sêmen', category: 'Estoque' },
  { key: 'abastecimento_nitrogenio', label: 'Abastecimento de Nitrogênio', category: 'Estoque' },
  { key: 'animais_piquetes', label: 'Animais por Piquete', category: 'Localização' },
  { key: 'movimentacoes_financeiras', label: 'Movimentações Financeiras', category: 'Financeiro' },
  { key: 'ranking_animais_avaliados', label: 'Ranking dos Animais Avaliados', category: 'Gestão' },
  { key: 'ranking_pmgz', label: '🏆 Ranking de animais', category: 'Gestão' }
]

async function getEnabled() {
  const r = await query('SELECT value FROM system_settings WHERE key = $1', ['mobile_reports_enabled'])
  const val = r.rows[0]?.value
  if (!val) return []
  try {
    const arr = JSON.parse(val)
    return Array.isArray(arr) ? arr : []
  } catch (_) {
    return []
  }
}

function toDateStr(v) {
  if (!v) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.split('T')[0]
  if (v instanceof Date) return v.toISOString().split('T')[0]
  return String(v)
}

// Filtrar nomes de touros (LANDROVER, MALCOM SANT ANNA, etc.) que foram cadastrados como piquete por engano.
// Só retorna true para locais reais: PIQUETE 1-99, PROJETO X, CONFINA, etc.
function ehPiqueteValido(nome) {
  if (!nome || typeof nome !== 'string') return false
  const n = nome.trim()
  if (!n || /^(VAZIO|NÃO INFORMADO|NAO INFORMADO|-)$/i.test(n)) return false
  if (/^PIQUETE\s+(\d+|CABANHA|CONF|GUARITA|PISTA)$/i.test(n)) return true
  if (/^PROJETO\s+[\dA-Za-z\-]+$/i.test(n)) return true
  if (/^CONFINA$/i.test(n)) return true
  if (/^PIQ\s+\d+$/i.test(n)) return true
  if (/^(CABANHA|GUARITA|PISTA|CONF)$/i.test(n)) return true
  return false
}

function piqueteOuNaoInformado(val) {
  return (val && ehPiqueteValido(val)) ? val : 'Não informado'
}

function formatarSexo(sexo) {
  if (!sexo) return '-'
  const s = String(sexo).trim().toUpperCase()
  if (s.startsWith('M') || s === 'M') return 'Macho'
  if (s.startsWith('F') || s === 'F') return 'Fêmea'
  return sexo
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendMethodNotAllowed(res, ['GET'])

  try {
    const { tipo, startDate, endDate } = req.query
    const enabled = await getEnabled()

    // GET sem tipo: retorna config
    if (!tipo) {
      return sendSuccess(res, {
        enabled,
        allTypes: TIPOS_RELATORIOS
      })
    }

    // Verificar se o tipo está habilitado
    if (!enabled.includes(tipo)) {
      return sendError(res, 'Relatório não disponível para mobile', 403)
    }

    const start = toDateStr(startDate) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const end = toDateStr(endDate) || new Date().toISOString().split('T')[0]

    let data = []
    let resumo = null

    switch (tipo) {
      case 'pesagens': {
        const r = await query(`
          SELECT p.id, p.animal_id, p.peso, p.ce, p.data, p.observacoes,
                 a.serie, a.rg, a.nome as animal_nome, a.sexo as animal_sexo
          FROM pesagens p
          JOIN animais a ON a.id = p.animal_id
          WHERE p.data >= $1 AND p.data <= $2
          ORDER BY p.data DESC, p.created_at DESC
          LIMIT 500
        `, [start, end])
        data = (r.rows || []).map(row => ({
          animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
          peso: row.peso,
          ce: row.ce,
          data: toDateStr(row.data),
          sexo: row.animal_sexo,
          observacoes: row.observacoes
        }))
        break
      }

      case 'resumo_pesagens': {
        function extrairLocal(obs) {
          if (!obs || typeof obs !== 'string') return null
          const s = obs.trim().replace(/CONFINAÇÃO/gi, 'CONFINA').replace(/CONFINACAO/gi, 'CONFINA')
          const m = s.match(/(PIQUETE\s*\d+|PROJETO\s*[\dA-Za-z\-]+|LOTE\s*\d+|CONFINA\w*|GUARITA|CABANHA|PISTA\s*\d*)/i)
          if (m) {
            let loc = m[1].trim().toUpperCase().replace(/\s+/g, ' ')
            if (/^CONFINA/.test(loc)) loc = 'CONFINA'
            return loc
          }
          return s.length <= 35 ? s.toUpperCase() : s.substring(0, 35).toUpperCase()
        }
        function normalizarPiquete(p) {
          if (!p || p === 'Não informado') return p || 'Não informado'
          const s = String(p).trim().toUpperCase()
          const mPiq = s.match(/^PIQUETE\s*(\d+)$/i)
          const mProj = s.match(/^PROJETO\s*([\dA-Za-z\-]+)$/i)
          if (mPiq) return `PROJETO ${mPiq[1]}`
          if (mProj) return `PROJETO ${mProj[1]}`
          return s
        }

        let r
        try {
          r = await query(`
            SELECT p.id, p.animal_id, p.peso, p.ce, p.data, p.observacoes, a.sexo,
                   la.piquete as piquete_loc,
                   a.piquete_atual, a.pasto_atual
            FROM pesagens p
            JOIN animais a ON a.id = p.animal_id
            LEFT JOIN LATERAL (
              SELECT l.piquete FROM localizacoes_animais l
              WHERE l.animal_id = p.animal_id AND (l.data_saida IS NULL OR l.data_saida >= p.data)
              ORDER BY l.data_entrada DESC LIMIT 1
            ) la ON TRUE
            WHERE p.data >= $1 AND p.data <= $2
            ORDER BY p.data DESC
          `, [start, end])
        } catch (colErr) {
          if (/column.*does not exist/i.test(colErr?.message || '')) {
            r = await query(`
              SELECT p.id, p.animal_id, p.peso, p.ce, p.data, p.observacoes, a.sexo,
                     la.piquete as piquete_loc,
                     a.pasto_atual as piquete_atual,
                     a.pasto_atual
              FROM pesagens p
              JOIN animais a ON a.id = p.animal_id
              LEFT JOIN LATERAL (
                SELECT l.piquete FROM localizacoes_animais l
                WHERE l.animal_id = p.animal_id AND (l.data_saida IS NULL OR l.data_saida >= p.data)
                ORDER BY l.data_entrada DESC LIMIT 1
              ) la ON TRUE
              WHERE p.data >= $1 AND p.data <= $2
              ORDER BY p.data DESC
            `, [start, end])
          } else throw colErr
        }
        const rows = r.rows || []

        // Última pesagem por animal (para médias por animal)
        const porAnimal = {}
        rows.forEach(x => {
          const aid = x.animal_id
          if (!aid) return
          const d = x.data || ''
          const prev = porAnimal[aid]
          if (!prev || (d > (prev.data || '')) || (d === (prev.data || '') && (x.id || 0) > (prev.id || 0))) {
            porAnimal[aid] = x
          }
        })
        const ultimasPesagens = Object.values(porAnimal)

        const pesos = rows.map(x => parseFloat(x.peso)).filter(n => !isNaN(n))
        const ces = rows.map(x => parseFloat(x.ce)).filter(n => !isNaN(n) && n > 0)
        const machos = ultimasPesagens.filter(x => (x.sexo || '').toLowerCase().startsWith('m'))
        const femeas = ultimasPesagens.filter(x => (x.sexo || '').toLowerCase().startsWith('f'))
        const pesosUltima = ultimasPesagens.map(x => parseFloat(x.peso)).filter(n => !isNaN(n))
        const mediaPorAnimal = pesosUltima.length ? (pesosUltima.reduce((a, b) => a + b, 0) / pesosUltima.length).toFixed(1) : '-'

        // Por piquete (fallback: localizacoes_animais -> piquete_atual/pasto_atual do cadastro -> observações)
        // Filtrar nomes de touros (ex: LANDROVER, MALCOM SANT ANNA) que não são locais
        const porPiquete = {}
        ultimasPesagens.forEach(x => {
          const pBruto = x.piquete_loc || x.piquete_atual || x.pasto_atual || extrairLocal(x.observacoes) || 'Não informado'
          const pValidado = piqueteOuNaoInformado(pBruto)
          const p = normalizarPiquete(pValidado)
          if (!porPiquete[p]) porPiquete[p] = { total: 0, machos: 0, femeas: 0, pesos: [], ces: [] }
          porPiquete[p].total++
          if ((x.sexo || '').toLowerCase().startsWith('m')) porPiquete[p].machos++
          else if ((x.sexo || '').toLowerCase().startsWith('f')) porPiquete[p].femeas++
          const pv = parseFloat(x.peso)
          if (!isNaN(pv)) porPiquete[p].pesos.push(pv)
          const cv = parseFloat(x.ce)
          if (!isNaN(cv) && cv > 0) porPiquete[p].ces.push(cv)
        })

        resumo = {
          'Total de pesagens': rows.length,
          'Animais únicos': ultimasPesagens.length,
          'Machos': machos.length,
          'Fêmeas': femeas.length,
          'Piquetes': Object.keys(porPiquete).length,
          'Peso médio geral (kg)': pesos.length ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1) : '-',
          'Média por animal (kg)': mediaPorAnimal,
          'Peso mínimo (kg)': pesos.length ? Math.min(...pesos).toFixed(1) : '-',
          'Peso máximo (kg)': pesos.length ? Math.max(...pesos).toFixed(1) : '-',
          'CE média (cm)': ces.length ? (ces.reduce((a, b) => a + b, 0) / ces.length).toFixed(1) : '-'
        }

        data = Object.keys(porPiquete).sort().map(p => {
          const s = porPiquete[p]
          const mediaPeso = s.pesos.length ? (s.pesos.reduce((a, b) => a + b, 0) / s.pesos.length).toFixed(1) : '-'
          const pesoMinP = s.pesos.length ? Math.min(...s.pesos).toFixed(1) : '-'
          const pesoMaxP = s.pesos.length ? Math.max(...s.pesos).toFixed(1) : '-'
          const mediaCE = s.ces.length ? (s.ces.reduce((a, b) => a + b, 0) / s.ces.length).toFixed(1) : '-'
          return {
            Piquete: p,
            Animais: s.total,
            Machos: s.machos,
            Fêmeas: s.femeas,
            'Média Peso (kg)': mediaPeso,
            'Peso Min (kg)': pesoMinP,
            'Peso Max (kg)': pesoMaxP,
            'Média CE (cm)': mediaCE
          }
        })
        break
      }

      case 'femeas_ia':
      case 'inseminacoes': {
        const col = await query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'inseminacoes' AND column_name IN ('data_ia', 'data_inseminacao', 'data')
        `)
        const dateCol = col.rows?.find(r => r.column_name === 'data_ia') ? 'data_ia'
          : col.rows?.find(r => r.column_name === 'data_inseminacao') ? 'data_inseminacao' : 'data'

        const r = await query(`
          SELECT i.*, a.serie, a.rg, a.nome as animal_nome
          FROM inseminacoes i
          LEFT JOIN animais a ON a.id = i.animal_id
          WHERE i.${dateCol} >= $1 AND i.${dateCol} <= $2
          ORDER BY i.${dateCol} DESC
          LIMIT 500
        `, [start, end])
        data = (r.rows || []).map(row => {
          const dataVal = row.data_ia || row.data_inseminacao || row.data
          return {
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
            data: toDateStr(dataVal),
            touro: row.touro_nome || row.touro,
            resultado: row.resultado_dg || row.status_gestacao,
            tecnico: row.tecnico
          }
        })
        break
      }

      case 'resumo_femeas_ia': {
        const col = await query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'inseminacoes' AND column_name IN ('data_ia', 'data_inseminacao', 'data')
        `)
        const dateCol = col.rows?.find(r => r.column_name === 'data_ia') ? 'data_ia'
          : col.rows?.find(r => r.column_name === 'data_inseminacao') ? 'data_inseminacao' : 'data'

        const r = await query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN resultado_dg = 'Prenha' OR status_gestacao = 'Prenha' OR LOWER(COALESCE(resultado_dg,'') || COALESCE(status_gestacao,'')) LIKE '%prenha%' THEN 1 END) as prenhas
          FROM inseminacoes
          WHERE ${dateCol} >= $1 AND ${dateCol} <= $2
        `, [start, end])
        const row = r.rows?.[0]
        const total = parseInt(row?.total || 0, 10)
        const prenhas = parseInt(row?.prenhas || 0, 10)
        resumo = { total, prenhas, taxaPrenhez: total > 0 ? ((prenhas / total) * 100).toFixed(1) + '%' : '0%' }
        data = [{ _resumo: resumo }]
        break
      }

      case 'gestacoes': {
        try {
          const r = await query(`
            SELECT g.*, a.serie, a.rg, a.nome as animal_nome
            FROM gestacoes g
            LEFT JOIN animais a ON a.id = g.animal_id
            WHERE (g.data_cobertura >= $1 AND g.data_cobertura <= $2)
               OR (g.data_gestacao >= $1 AND g.data_gestacao <= $2)
            ORDER BY COALESCE(g.data_cobertura, g.data_gestacao) DESC
            LIMIT 300
          `, [start, end])
          data = (r.rows || []).map(row => ({
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome || row.receptora_nome,
            data: toDateStr(row.data_cobertura || row.data_gestacao),
            situacao: row.situacao
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'nascimentos': {
        try {
          const r = await query(`
            SELECT n.*, a.serie, a.rg, a.nome as animal_nome
            FROM nascimentos n
            LEFT JOIN animais a ON CONCAT(a.serie, a.rg) = CONCAT(COALESCE(n.serie,''), COALESCE(n.rg,''))
            WHERE n.data_nascimento >= $1 AND n.data_nascimento <= $2
            ORDER BY n.data_nascimento DESC
            LIMIT 300
          `, [start, end])
          data = (r.rows || []).map(row => ({
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
            data: toDateStr(row.data_nascimento),
            sexo: row.sexo,
            peso: row.peso
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'mortes': {
        try {
          const r = await query(`
            SELECT m.*, a.serie, a.rg, a.nome as animal_nome
            FROM mortes m
            LEFT JOIN animais a ON a.id = m.animal_id
            WHERE m.data_morte >= $1 AND m.data_morte <= $2
            ORDER BY m.data_morte DESC
            LIMIT 200
          `, [start, end])
          data = (r.rows || []).map(row => ({
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
            data: toDateStr(row.data_morte),
            causa: row.causa_morte || row.causa
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'estoque_semen': {
        const r = await query(`
          SELECT id, nome_touro, raca, quantidade, created_at
          FROM estoque_semen
          ORDER BY nome_touro
          LIMIT 200
        `)
        data = (r.rows || []).map(row => ({
          touro: row.nome_touro,
          raca: row.raca,
          quantidade: row.quantidade,
          atualizado: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : null
        }))
        break
      }

      case 'abastecimento_nitrogenio': {
        try {
          const r = await query(`
            SELECT 
              id, 
              data_abastecimento, 
              quantidade_litros, 
              motorista, 
              valor_unitario, 
              valor_total, 
              observacoes,
              proximo_abastecimento,
              created_at
            FROM abastecimento_nitrogenio
            WHERE data_abastecimento >= $1 AND data_abastecimento <= $2
            ORDER BY data_abastecimento DESC
            LIMIT 200
          `, [start, end])
          
          const rows = r.rows || []
          const totalLitros = rows.reduce((sum, row) => sum + (parseFloat(row.quantidade_litros) || 0), 0)
          const totalValor = rows.reduce((sum, row) => sum + (parseFloat(row.valor_total) || 0), 0)
          const mediaValorUnitario = rows.length > 0 
            ? rows.reduce((sum, row) => sum + (parseFloat(row.valor_unitario) || 0), 0) / rows.length 
            : 0
          
          resumo = {
            'Total de abastecimentos': rows.length,
            'Total de litros': totalLitros.toFixed(1) + ' L',
            'Valor total': 'R$ ' + totalValor.toFixed(2),
            'Média valor/litro': 'R$ ' + mediaValorUnitario.toFixed(2)
          }
          
          data = rows.map(row => ({
            data: toDateStr(row.data_abastecimento),
            quantidade: row.quantidade_litros + ' L',
            motorista: row.motorista,
            valor_unitario: row.valor_unitario ? 'R$ ' + parseFloat(row.valor_unitario).toFixed(2) : '-',
            valor_total: row.valor_total ? 'R$ ' + parseFloat(row.valor_total).toFixed(2) : '-',
            proximo: row.proximo_abastecimento ? toDateStr(row.proximo_abastecimento) : '-',
            observacoes: row.observacoes
          }))
        } catch (e) {
          console.error('Erro ao buscar abastecimento de nitrogênio:', e)
          data = []
        }
        break
      }

      case 'exames_andrologicos': {
        try {
          const r = await query(`
            SELECT id, touro, rg, data_exame, resultado, ce, defeitos, observacoes
            FROM exames_andrologicos
            WHERE data_exame >= $1 AND data_exame <= $2
            ORDER BY data_exame DESC
            LIMIT 300
          `, [start, end])
          data = (r.rows || []).map(row => ({
            touro: row.touro,
            rg: row.rg,
            data: toDateStr(row.data_exame),
            resultado: row.resultado,
            ce: row.ce,
            defeitos: row.defeitos,
            observacoes: row.observacoes
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'previsoes_parto': {
        try {
          const r = await query(`
            SELECT g.id, g.receptora_nome, g.receptora_serie, g.receptora_rg,
                   g.data_cobertura, g.situacao,
                   (g.data_cobertura::date + INTERVAL '285 days')::date as previsao
            FROM gestacoes g
            WHERE (g.situacao = 'Em Gestação' OR g.situacao = 'Ativa' OR g.situacao IS NULL)
              AND g.data_cobertura >= $1 AND g.data_cobertura <= $2
            ORDER BY previsao ASC
            LIMIT 200
          `, [start, end])
          data = (r.rows || []).map(row => ({
            receptora: row.receptora_nome || `${row.receptora_serie || ''} ${row.receptora_rg || ''}`.trim(),
            data_cobertura: toDateStr(row.data_cobertura),
            previsao_parto: toDateStr(row.previsao),
            situacao: row.situacao
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'transferencias_embrioes': {
        try {
          const colCheck = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'transferencias_embrioes' AND column_name IN ('data_te', 'data_transferencia')
          `)
          const dateCol = colCheck.rows?.find(r => r.column_name === 'data_te') ? 'data_te' : 'data_transferencia'
          const r = await query(`
            SELECT te.*
            FROM transferencias_embrioes te
            WHERE te.${dateCol} >= $1 AND te.${dateCol} <= $2
            ORDER BY te.${dateCol} DESC
            LIMIT 200
          `, [start, end])
          data = (r.rows || []).map(row => ({
            receptora: row.receptora_nome || row.receptora_id,
            doadora: row.doadora_nome || row.doadora_id,
            data: toDateStr(row.data_te || row.data_transferencia),
            touro: row.touro,
            status: row.status
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'calendario_reprodutivo': {
        try {
          // Usar a mesma API do desktop (eventos manuais, receptoras, partos previstos, refazer andrológico)
          const protocol = req.headers['x-forwarded-proto'] || (req.connection?.encrypted ? 'https' : 'http')
          const host = req.headers.host || 'localhost:3000'
          const baseUrl = `${protocol}://${host}`
          const resCal = await fetch(`${baseUrl}/api/calendario-reprodutivo?data_inicio=${start}&data_fim=${end}&limit=5000`)
          const jsonCal = resCal.ok ? await resCal.json() : {}
          const eventos = Array.isArray(jsonCal?.data) ? jsonCal.data : (jsonCal?.eventos || [])
          data = eventos.map(row => ({
            animal_id: row.animal_id,
            animal: row.animal_id ? `${row.animal_serie || ''} ${row.animal_rg || ''}`.trim() || row.animal_nome || '-' : (row.titulo || '-'),
            data: toDateStr(row.data_evento),
            tipo: row.tipo_evento || row.tipo || 'Evento',
            titulo: row.titulo || 'Sem título',
            descricao: row.descricao || '',
            status: row.status || 'pendente',
            origem: row.origem,
            numero_nf: row.numero_nf,
            fornecedor: row.fornecedor,
            data_te: row.data_te ? toDateStr(row.data_te) : null
          }))
        } catch (e) {
          console.error('Erro ao buscar calendário reprodutivo:', e)
          data = []
        }
        break
      }

      case 'vacinacoes': {
        try {
          const r = await query(`
            SELECT h.id, h.animal_id, h.tipo, h.data, h.descricao, h.medicamento, h.dosagem,
                   a.serie, a.rg, a.nome as animal_nome
            FROM historia_ocorrencias h
            LEFT JOIN animais a ON a.id = h.animal_id
            WHERE (h.tipo ILIKE '%vacina%' OR h.tipo ILIKE '%tratamento%' OR h.tipo ILIKE '%medic%')
              AND h.data >= $1 AND h.data <= $2
            ORDER BY h.data DESC
            LIMIT 200
          `, [start, end])
          data = (r.rows || []).map(row => ({
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
            data: toDateStr(row.data),
            tipo: row.tipo,
            medicamento: row.medicamento,
            descricao: row.descricao
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'animais_piquetes': {
        try {
          // Inclui animais de localizacoes_animais OU com piquete_atual/pasto_atual no cadastro (igual ao desktop)
          let r
          try {
            r = await query(`
              SELECT
                COALESCE(l.piquete, a.piquete_atual, a.pasto_atual) as piquete,
                COALESCE(l.data_entrada, a.data_entrada_piquete, a.created_at)::date as data_entrada,
                a.serie, a.rg, a.nome as animal_nome
              FROM animais a
              LEFT JOIN LATERAL (
                SELECT l2.piquete, l2.data_entrada FROM localizacoes_animais l2
                WHERE l2.animal_id = a.id AND l2.data_saida IS NULL
                ORDER BY l2.data_entrada DESC LIMIT 1
              ) l ON TRUE
              WHERE COALESCE(l.piquete, a.piquete_atual, a.pasto_atual) IS NOT NULL
                AND TRIM(COALESCE(l.piquete, a.piquete_atual, a.pasto_atual)) != ''
              ORDER BY piquete, a.serie, a.rg
              LIMIT 500
            `)
          } catch (colErr) {
            // Fallback se piquete_atual/data_entrada_piquete não existirem (bancos antigos)
            if (/column.*does not exist/i.test(colErr?.message || '')) {
              r = await query(`
                SELECT
                  COALESCE(l.piquete, a.pasto_atual) as piquete,
                  COALESCE(l.data_entrada, a.created_at)::date as data_entrada,
                  a.serie, a.rg, a.nome as animal_nome
                FROM animais a
                LEFT JOIN LATERAL (
                  SELECT l2.piquete, l2.data_entrada FROM localizacoes_animais l2
                  WHERE l2.animal_id = a.id AND l2.data_saida IS NULL
                  ORDER BY l2.data_entrada DESC LIMIT 1
                ) l ON TRUE
                WHERE COALESCE(l.piquete, a.pasto_atual) IS NOT NULL
                  AND TRIM(COALESCE(l.piquete, a.pasto_atual)) != ''
                ORDER BY piquete, a.serie, a.rg
                LIMIT 500
              `)
            } else throw colErr
          }
          data = (r.rows || []).map(row => ({
            piquete: piqueteOuNaoInformado(row.piquete),
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.animal_nome,
            data_entrada: toDateStr(row.data_entrada)
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'movimentacoes_financeiras': {
        try {
          const r = await query(`
            SELECT c.id, c.data, c.tipo, c.valor, c.descricao, a.serie, a.rg
            FROM custos c
            LEFT JOIN animais a ON a.id = c.animal_id
            WHERE c.data >= $1 AND c.data <= $2
            ORDER BY c.data DESC
            LIMIT 300
          `, [start, end])
          data = (r.rows || []).map(row => ({
            data: toDateStr(row.data),
            tipo: row.tipo,
            valor: row.valor,
            animal: row.serie && row.rg ? `${row.serie} ${row.rg}` : null,
            descricao: row.descricao
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'ranking_animais_avaliados': {
        try {
          let r
          try {
            r = await query(`
              SELECT a.id, a.serie, a.rg, a.nome, a.abczg, a.deca, a.raca, a.sexo,
                COALESCE(l.piquete, a.piquete_atual, a.pasto_atual) as piquete
              FROM animais a
              LEFT JOIN LATERAL (
                SELECT l2.piquete FROM localizacoes_animais l2
                WHERE l2.animal_id = a.id AND l2.data_saida IS NULL
                ORDER BY l2.data_entrada DESC LIMIT 1
              ) l ON TRUE
              WHERE a.situacao = 'Ativo' AND a.abczg IS NOT NULL AND TRIM(a.abczg) != ''
              ORDER BY
                CASE
                  WHEN a.abczg ~ '^[0-9]+[.,]?[0-9]*$'
                  THEN (REPLACE(REPLACE(TRIM(a.abczg), ',', '.'), ' ', '')::numeric)
                  ELSE NULL
                END DESC NULLS LAST
              LIMIT 100
            `)
          } catch (colErr) {
            if (/column.*does not exist/i.test(colErr?.message || '')) {
              r = await query(`
                SELECT a.id, a.serie, a.rg, a.nome, a.abczg, a.deca, a.raca, a.sexo,
                  COALESCE(l.piquete, a.pasto_atual) as piquete
                FROM animais a
                LEFT JOIN LATERAL (
                  SELECT l2.piquete FROM localizacoes_animais l2
                  WHERE l2.animal_id = a.id AND l2.data_saida IS NULL
                  ORDER BY l2.data_entrada DESC LIMIT 1
                ) l ON TRUE
                WHERE a.situacao = 'Ativo' AND a.abczg IS NOT NULL AND TRIM(a.abczg) != ''
                ORDER BY
                  CASE
                    WHEN a.abczg ~ '^[0-9]+[.,]?[0-9]*$'
                    THEN (REPLACE(REPLACE(TRIM(a.abczg), ',', '.'), ' ', '')::numeric)
                    ELSE NULL
                  END DESC NULLS LAST
                LIMIT 100
              `)
            } else throw colErr
          }
          data = (r.rows || []).map((row, i) => ({
            posicao: i + 1,
            animal_id: row.id,
            animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.nome,
            iABCZ: row.abczg,
            deca: row.deca,
            raca: row.raca,
            sexo: formatarSexo(row.sexo),
            piquete: piqueteOuNaoInformado(row.piquete) || '-'
          }))
        } catch (e) {
          data = []
        }
        break
      }

      case 'ranking_pmgz': {
        try {
          const sqlPiquete = `
            COALESCE(l.piquete, a.piquete_atual, a.pasto_atual) as piquete
          `
          const joinLateral = `
            LEFT JOIN LATERAL (
              SELECT l2.piquete FROM localizacoes_animais l2
              WHERE l2.animal_id = a.id AND l2.data_saida IS NULL
              ORDER BY l2.data_entrada DESC LIMIT 1
            ) l ON TRUE
          `
          let rankingIABCZ, rankingPeso, rankingCE
          try {
            rankingIABCZ = await query(`
              SELECT a.id, a.serie, a.rg, a.nome, a.abczg, a.raca, a.sexo, ${sqlPiquete}
              FROM animais a ${joinLateral}
              WHERE a.situacao = 'Ativo' AND a.abczg IS NOT NULL AND TRIM(a.abczg) != ''
              ORDER BY
                CASE
                  WHEN a.abczg ~ '^[0-9]+[.,]?[0-9]*$'
                  THEN (REPLACE(REPLACE(TRIM(a.abczg), ',', '.'), ' ', '')::numeric)
                  ELSE NULL
                END DESC NULLS LAST
              LIMIT 10
            `)
            rankingPeso = await query(`
              SELECT a.id, a.serie, a.rg, a.nome, a.peso, a.raca, a.sexo, ${sqlPiquete}
              FROM animais a ${joinLateral}
              WHERE a.situacao = 'Ativo' AND a.peso IS NOT NULL AND a.peso > 0
              ORDER BY a.peso DESC
              LIMIT 10
            `)
            rankingCE = await query(`
              SELECT a.id, a.serie, a.rg, a.nome, p.ce, a.raca, a.sexo, ${sqlPiquete}
              FROM animais a
              JOIN (
                SELECT DISTINCT ON (animal_id) animal_id, ce
                FROM pesagens
                WHERE ce IS NOT NULL AND ce > 0
                ORDER BY animal_id, data DESC
              ) p ON a.id = p.animal_id
              ${joinLateral}
              WHERE a.situacao = 'Ativo' AND (a.sexo ILIKE 'M%' OR a.sexo = 'M')
              ORDER BY p.ce DESC
              LIMIT 10
            `)
          } catch (colErr) {
            if (/column.*does not exist/i.test(colErr?.message || '')) {
              const sqlPiqueteAlt = `COALESCE(l.piquete, a.pasto_atual) as piquete`
              rankingIABCZ = await query(`
                SELECT a.id, a.serie, a.rg, a.nome, a.abczg, a.raca, a.sexo, ${sqlPiqueteAlt}
                FROM animais a ${joinLateral}
                WHERE a.situacao = 'Ativo' AND a.abczg IS NOT NULL AND TRIM(a.abczg) != ''
                ORDER BY
                  CASE WHEN a.abczg ~ '^[0-9]+[.,]?[0-9]*$'
                  THEN (REPLACE(REPLACE(TRIM(a.abczg), ',', '.'), ' ', '')::numeric)
                  ELSE NULL END DESC NULLS LAST
                LIMIT 10
              `)
              rankingPeso = await query(`
                SELECT a.id, a.serie, a.rg, a.nome, a.peso, a.raca, a.sexo, ${sqlPiqueteAlt}
                FROM animais a ${joinLateral}
                WHERE a.situacao = 'Ativo' AND a.peso IS NOT NULL AND a.peso > 0
                ORDER BY a.peso DESC LIMIT 10
              `)
              rankingCE = await query(`
                SELECT a.id, a.serie, a.rg, a.nome, p.ce, a.raca, a.sexo, ${sqlPiqueteAlt}
                FROM animais a
                JOIN (SELECT DISTINCT ON (animal_id) animal_id, ce FROM pesagens
                  WHERE ce IS NOT NULL AND ce > 0 ORDER BY animal_id, data DESC) p ON a.id = p.animal_id
                ${joinLateral}
                WHERE a.situacao = 'Ativo' AND (a.sexo ILIKE 'M%' OR a.sexo = 'M')
                ORDER BY p.ce DESC LIMIT 10
              `)
            } else throw colErr
          }

          data = [
            { _resumo: true, tipo: 'iABCZ', titulo: 'Top 10 iABCZ', descricao: 'Quanto maior o iABCZ, melhor o animal' },
            ...rankingIABCZ.rows.map((row, i) => ({
              ranking: 'iABCZ',
              posicao: i + 1,
              animal_id: row.id,
              animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.nome,
              valor: row.abczg,
              raca: row.raca,
              sexo: formatarSexo(row.sexo),
              piquete: piqueteOuNaoInformado(row.piquete) || '-'
            })),
            { _resumo: true, tipo: 'peso', titulo: 'Top 10 Peso', descricao: 'Maiores pesos registrados' },
            ...rankingPeso.rows.map((row, i) => ({
              ranking: 'Peso',
              posicao: i + 1,
              animal_id: row.id,
              animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.nome,
              valor: `${row.peso} kg`,
              raca: row.raca,
              sexo: formatarSexo(row.sexo),
              piquete: piqueteOuNaoInformado(row.piquete) || '-'
            })),
            { _resumo: true, tipo: 'ce', titulo: 'Top 10 CE', descricao: 'Maiores circunferências escrotais (machos)' },
            ...rankingCE.rows.map((row, i) => ({
              ranking: 'CE',
              posicao: i + 1,
              animal_id: row.id,
              animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.nome,
              valor: `${row.ce} cm`,
              raca: row.raca,
              sexo: formatarSexo(row.sexo),
              piquete: piqueteOuNaoInformado(row.piquete) || '-'
            }))
          ]
        } catch (e) {
          console.error('Erro ao buscar ranking PMGZ:', e)
          data = []
        }
        break
      }

      default:
        return sendError(res, 'Tipo de relatório não implementado para mobile', 400)
    }

    return sendSuccess(res, {
      tipo,
      periodo: { startDate: start, endDate: end },
      data,
      resumo,
      total: data.filter(d => !d._resumo).length
    })
  } catch (err) {
    console.error('Erro mobile-reports:', err)
    return sendError(res, err.message || 'Erro ao buscar relatório', 500)
  }
}
