/**
 * API para relatórios visíveis no mobile.
 * GET sem params: retorna config (enabled + allTypes)
 * GET ?tipo=X&startDate=&endDate=: retorna dados do relatório
 */
import { query } from '../../../lib/database'
import { sendSuccess, sendError, sendMethodNotAllowed } from '../../../utils/apiResponse'

const TIPOS_RELATORIOS = [
  { key: 'resumo_geral', label: '📊 Visão Geral', category: 'Gestão' },
  { key: 'pesagens', label: 'Pesagens', category: 'Manejo' },
  { key: 'resumo_pesagens', label: 'Resumo de Pesagens', category: 'Manejo' },
  { key: 'inseminacoes', label: 'Inseminações', category: 'Reprodução' },
  { key: 'resumo_femeas_ia', label: 'Resumo de Fêmeas IA', category: 'Reprodução' },
  { key: 'gestacoes', label: 'Gestações', category: 'Reprodução' },
  { key: 'nascimentos', label: 'Nascimentos', category: 'Reprodução' },
  { key: 'resumo_nascimentos', label: 'Resumo de Nascimentos', category: 'Reprodução' },
  { key: 'previsoes_parto', label: 'Previsões de Parto', category: 'Reprodução' },
  { key: 'exames_andrologicos', label: 'Exames Andrológicos', category: 'Reprodução' },
  { key: 'transferencias_embrioes', label: 'Transferências de Embriões', category: 'Reprodução' },
  { key: 'coleta_fiv', label: 'Coleta FIV', category: 'Reprodução' },
  { key: 'receptoras_chegaram', label: 'Receptoras que Chegaram', category: 'Reprodução' },
  { key: 'receptoras_faltam_parir', label: 'Receptoras que Faltam Parir', category: 'Reprodução' },
  { key: 'receptoras_faltam_diagnostico', label: 'Receptoras que Faltam Diagnóstico', category: 'Reprodução' },
  { key: 'calendario_reprodutivo', label: '📅 Calendário Reprodutivo', category: 'Reprodução' },
  { key: 'mortes', label: 'Mortes', category: 'Sanidade' },
  { key: 'vacinacoes', label: 'Vacinações', category: 'Sanidade' },
  { key: 'ocorrencias', label: 'Ocorrências', category: 'Sanidade' },
  { key: 'estoque_semen', label: 'Estoque de Sêmen', category: 'Estoque' },
  { key: 'abastecimento_nitrogenio', label: 'Abastecimento de Nitrogênio', category: 'Estoque' },
  { key: 'animais_piquetes', label: 'Animais por Piquete', category: 'Localização' },
  { key: 'notas_fiscais', label: 'Notas Fiscais', category: 'Documentos' },
  { key: 'movimentacoes_financeiras', label: 'Movimentações Financeiras', category: 'Financeiro' },
  { key: 'custos', label: 'Custos', category: 'Financeiro' },
  { key: 'ranking_animais_avaliados', label: 'Ranking dos Animais Avaliados', category: 'Gestão' },
  { key: 'ranking_pmgz', label: '🏆 Ranking de animais', category: 'Gestão' },
  { key: 'boletim_rebanho', label: 'Boletim do Rebanho', category: 'Gestão' }
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

function validarDataRange(str) {
  if (!str || typeof str !== 'string') return null
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const y = parseInt(m[1], 10)
  if (y < 1900 || y > 2100) return null
  return str.split('T')[0]
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

    // GET sem tipo: retorna config (quando enabled vazio, retorna todos como habilitados)
    if (!tipo) {
      const allKeys = TIPOS_RELATORIOS.map(t => t.key)
      // Garantir que resumo_geral esteja sempre habilitado
      const enabledOut = enabled.length > 0 ? [...new Set([...enabled, 'resumo_geral'])] : allKeys
      return sendSuccess(res, {
        enabled: enabledOut,
        allTypes: TIPOS_RELATORIOS
      })
    }

    // Verificar se o tipo está habilitado (quando vazio, permite todos)
    const allKeys = TIPOS_RELATORIOS.map(t => t.key)
    const enabledEffective = enabled.length > 0 ? [...new Set([...enabled, 'resumo_geral'])] : allKeys
    if (!enabledEffective.includes(tipo)) {
      return sendError(res, 'Relatório não disponível para mobile', 403)
    }

    const hoje = new Date()
    const start = validarDataRange(startDate) || validarDataRange(toDateStr(startDate)) || new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    const end = validarDataRange(endDate) || validarDataRange(toDateStr(endDate)) || hoje.toISOString().split('T')[0]

    let data = []
    let resumo = null

    switch (tipo) {
      case 'resumo_geral': {
        try {
          // 1. Totais do Rebanho (Ativos)
          const qRebanho = await query(`
            SELECT 
              COUNT(*) as total,
              COUNT(CASE WHEN sexo = 'Macho' THEN 1 END) as machos,
              COUNT(CASE WHEN sexo = 'Fêmea' THEN 1 END) as femeas,
              COUNT(CASE WHEN data_nascimento > NOW() - INTERVAL '12 months' THEN 1 END) as bezerros,
              COUNT(CASE WHEN data_nascimento <= NOW() - INTERVAL '12 months' AND data_nascimento > NOW() - INTERVAL '24 months' THEN 1 END) as novilhas,
              COUNT(CASE WHEN data_nascimento <= NOW() - INTERVAL '24 months' THEN 1 END) as adultos
            FROM animais 
            WHERE situacao = 'Ativo'
          `)
          const statsRebanho = qRebanho.rows[0]

          // 2. Reprodução (Gestações Ativas) - gestacoes + inseminacoes prenhas
          let gestacoesAtivas = 0
          try {
            const qGestacoes = await query(`
              SELECT COUNT(*) as total FROM gestacoes WHERE situacao IN ('Ativa', 'Em Gestação')
            `)
            gestacoesAtivas = parseInt(qGestacoes.rows[0]?.total || 0, 10)
          } catch (_) {}
          let prenhasIA = 0
          try {
            const colIA = await query(`
              SELECT column_name FROM information_schema.columns
              WHERE table_name = 'inseminacoes' AND column_name IN ('resultado_dg', 'status_gestacao')
            `)
            const temRd = colIA.rows?.some(r => r.column_name === 'resultado_dg')
            const temSg = colIA.rows?.some(r => r.column_name === 'status_gestacao')
            if (temRd || temSg) {
              const prenhaCond = [
                temRd && "(TRIM(COALESCE(i.resultado_dg,'')) = 'P' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%pren%' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%positivo%')",
                temSg && "(TRIM(COALESCE(i.status_gestacao,'')) = 'P' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%pren%' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%positivo%')"
              ].filter(Boolean).join(' OR ')
              const qPrenhas = await query(`
                SELECT COUNT(DISTINCT i.animal_id) as total
                FROM inseminacoes i
                JOIN animais a ON a.id = i.animal_id AND a.situacao = 'Ativo'
                WHERE (${prenhaCond})
              `)
              prenhasIA = parseInt(qPrenhas.rows[0]?.total || 0, 10)
            }
          } catch (_) {}
          const totalGestacoesAtivas = gestacoesAtivas + prenhasIA
          
          // 3. Nascimentos (no período)
          const qNascimentos = await query(`
            SELECT COUNT(*) as total
            FROM nascimentos
            WHERE data_nascimento >= $1 AND data_nascimento <= $2
          `, [start, end])

          // 4. Peso Médio (Última pesagem de animais ativos)
          // Aproximação: média das últimas pesagens dos últimos 90 dias
          const qPeso = await query(`
            SELECT AVG(p.peso) as media
            FROM pesagens p
            JOIN animais a ON a.id = p.animal_id
            WHERE a.situacao = 'Ativo'
              AND p.data >= NOW() - INTERVAL '90 days'
          `)

          // 5. Financeiro (Custos e Vendas no período)
          // Custos
          const qCustos = await query(`
            SELECT SUM(valor) as total
            FROM custos
            WHERE data >= $1 AND data <= $2
          `, [start, end])
          
          // Vendas (Animais vendidos ou notas de saída)
          // Tentando pegar de animais vendidos primeiro
          const qVendasAnimais = await query(`
            SELECT SUM(valor_venda) as total
            FROM animais
            WHERE situacao = 'Vendido' AND updated_at >= $1 AND updated_at <= $2
          `, [start, end])

          // 6. Sanidade (Vacinas no período)
          let vacinasTotal = 0
          try {
            const qVacinas = await query(`
              SELECT COUNT(*) as total FROM vacinacoes WHERE data_vacinacao >= $1 AND data_vacinacao <= $2
            `, [start, end])
            vacinasTotal = parseInt(qVacinas.rows[0]?.total || 0)
          } catch (e) { console.log('Sem tabela vacinacoes ou erro', e.message) }

          // 7. Mortes (no período)
          let mortesTotal = 0
          try {
             const qMortes = await query(`
               SELECT COUNT(*) as total FROM mortes WHERE data_morte >= $1 AND data_morte <= $2
             `, [start, end])
             mortesTotal = parseInt(qMortes.rows[0]?.total || 0)
          } catch (e) { console.log('Sem tabela mortes ou erro', e.message) }

          // 8. Top Piquetes (Ocupação Atual)
          let topPiquetes = []
          try {
            const qPiquetes = await query(`
              SELECT piquete_atual, COUNT(*) as qtd 
              FROM animais 
              WHERE situacao = 'Ativo' AND piquete_atual IS NOT NULL 
              GROUP BY piquete_atual 
              ORDER BY qtd DESC 
              LIMIT 5
            `)
            topPiquetes = qPiquetes.rows.map(r => ({ label: r.piquete_atual, valor: parseInt(r.qtd) }))
          } catch (e) { console.log('Erro top piquetes', e.message) }

          // 9. Previsão de Partos (Próximos 30 dias)
          let partosPrevistos = 0
          try {
             // Gestação bovina ~290 dias (ou 9 meses e meio). 
             // Buscamos gestações ativas onde (data_cobertura + 290 dias) está entre hoje e hoje+30
             const qPartos = await query(`
               SELECT COUNT(*) as total 
               FROM gestacoes 
               WHERE situacao = 'Ativa' 
               AND (data_cobertura + INTERVAL '290 days') BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
             `)
             partosPrevistos = parseInt(qPartos.rows[0]?.total || 0)
          } catch (e) { console.log('Erro previsao partos', e.message) }

          // 10. Feed de Últimas Atividades (Recentes)
          let ultimasAtividades = []
          try {
            // Union de Pesagens, Nascimentos, Vacinações (Serviços se tiver, ou vacinacoes tab)
            // Assumindo tabelas: pesagens, nascimentos, vacinacoes
            const qFeed = await query(`
              SELECT * FROM (
                SELECT 'Pesagem' as tipo, 'Animal ID ' || animal_id || ': ' || peso || 'kg' as detalhe, data as data_evento FROM pesagens
                UNION ALL
                SELECT 'Nascimento' as tipo, 'Série ' || serie || ' (' || sexo || ')' as detalhe, data_nascimento as data_evento FROM nascimentos
                UNION ALL
                SELECT 'Vacinação' as tipo, 'Animal ID ' || animal_id as detalhe, data_vacinacao as data_evento FROM vacinacoes
              ) as combined
              ORDER BY data_evento DESC
              LIMIT 7
            `)
            ultimasAtividades = qFeed.rows
          } catch (e) { console.log('Erro feed atividades', e.message) }

          resumo = {
            rebanho: {
              total: parseInt(statsRebanho.total || 0),
              machos: parseInt(statsRebanho.machos || 0),
              femeas: parseInt(statsRebanho.femeas || 0),
              bezerros: parseInt(statsRebanho.bezerros || 0),
              novilhas: parseInt(statsRebanho.novilhas || 0),
              adultos: parseInt(statsRebanho.adultos || 0)
            },
            reproducao: {
              gestacoes_ativas: totalGestacoesAtivas,
              nascimentos_periodo: parseInt(qNascimentos.rows[0]?.total || 0),
              partos_previstos_30d: partosPrevistos
            },
            peso: {
              media_recente: parseFloat(qPeso.rows[0]?.media || 0).toFixed(1)
            },
            financeiro: {
              custos: parseFloat(qCustos.rows[0]?.total || 0),
              vendas: parseFloat(qVendasAnimais.rows[0]?.total || 0)
            },
            extras: {
               top_piquetes: topPiquetes,
               ultimas_atividades: ultimasAtividades
            }
          }

          // Dados estruturados em Módulos para os Cards do Mobile
          const modules = [
            {
              modulo: 'Rebanho',
              dados: {
                'Total': statsRebanho.total || 0,
                'Machos': statsRebanho.machos || 0,
                'Fêmeas': statsRebanho.femeas || 0,
                'Bezerros': statsRebanho.bezerros || 0,
                'Novilhas': statsRebanho.novilhas || 0,
                'Adultos': statsRebanho.adultos || 0
              }
            },
            {
              modulo: 'Reprodução',
              dados: {
                'Gestações Ativas': totalGestacoesAtivas,
                'Nascimentos': parseInt(qNascimentos.rows[0]?.total || 0),
                'Partos (30d)': partosPrevistos
              }
            },
            {
              modulo: 'Peso',
              dados: {
                'Média Recente': (parseFloat(qPeso.rows[0]?.media || 0).toFixed(1)) + ' kg'
              }
            },
            {
              modulo: 'Financeiro',
              dados: {
                'Custos': 'R$ ' + (parseFloat(qCustos.rows[0]?.total || 0).toFixed(2)),
                'Vendas': 'R$ ' + (parseFloat(qVendasAnimais.rows[0]?.total || 0).toFixed(2))
              }
            }
          ]
          
          if (vacinasTotal > 0 || mortesTotal > 0) {
            modules.push({
              modulo: 'Sanidade',
              dados: {
                'Vacinações': vacinasTotal,
                'Mortes': mortesTotal
              }
            })
          }

          // Dados para gráficos
          const chartData = [
            { label: 'Bezerros (0-12m)', valor: statsRebanho.bezerros, categoria: 'Idade' },
            { label: 'Novilhas/os (12-24m)', valor: statsRebanho.novilhas, categoria: 'Idade' },
            { label: 'Adultos (>24m)', valor: statsRebanho.adultos, categoria: 'Idade' },
            { label: 'Machos', valor: statsRebanho.machos, categoria: 'Sexo' },
            { label: 'Fêmeas', valor: statsRebanho.femeas, categoria: 'Sexo' }
          ]
          
          // Retornar modules em data (para os cards) e chartData em graficos
          // Hack: Atribuir modules a data para compatibilidade com o frontend atual
          data = modules
          // Adicionar propriedade extra ao objeto data se fosse array, mas JS arrays são objetos
          // Melhor retornar um objeto wrapper no json final, mas a estrutura espera { data: ... }
          // Vou injetar 'graficos' no json final modificando a logica de retorno lá embaixo ou aqui
          
          // A estrutura de retorno padrão é res.json({ data: data, resumo: resumo })
          // Vou retornar data = modules. E vou adicionar graficos no resumo ou em um campo extra se eu puder alterar o handler
          
          // Workaround: Anexar graficos ao primeiro item de data ou usar um campo especial
          // Mas o ideal é retornar { data: modules, graficos: chartData }
          // O handler lá embaixo faz: return sendSuccess(res, { data, resumo }) -> que vira { success: true, data: { data, resumo } } ??
          // Não, sendSuccess(res, payload) -> { success: true, data: payload } se payload for array?
          // Ver utils/apiResponse.js se possível. Mas geralmente é res.json({ success: true, data: ... })
          
          // O handler atual faz:
          // return sendSuccess(res, { data, resumo }) se eu mudar a variavel data para ser os modulos.
          // Vou adicionar a propriedade graficos ao objeto de retorno.
          
          // Mas 'data' é declarado como let data = [].
          // Se eu atribuir data = modules, o retorno será { data: modules, resumo: ... }
          // Eu preciso passar 'graficos' também.
          
          // Vou monkey-patch o objeto de resposta dentro deste bloco se possível, mas o return está no fim da função.
          // Vou adicionar 'graficos' ao objeto 'resumo' por enquanto, ou melhor:
          resumo.graficos = chartData


        } catch (e) {
          console.error('Erro no Resumo Geral:', e)
          data = []
          resumo = { erro: 'Falha ao carregar resumo geral' }
        }
        break
      }

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
          WHERE table_name = 'inseminacoes' AND column_name IN ('data_ia', 'data_inseminacao', 'data', 'resultado_dg', 'status_gestacao', 'touro_nome', 'touro')
        `)
        const dateCol = col.rows?.find(r => r.column_name === 'data_ia') ? 'data_ia'
          : col.rows?.find(r => r.column_name === 'data_inseminacao') ? 'data_inseminacao' : 'data'
        const colsExtras = ['i.id', 'i.animal_id', `i.${dateCol}`, 'i.tecnico', 'a.serie', 'a.rg', 'a.nome as animal_nome']
        if (col.rows?.some(r => r.column_name === 'resultado_dg')) colsExtras.push('i.resultado_dg')
        if (col.rows?.some(r => r.column_name === 'status_gestacao')) colsExtras.push('i.status_gestacao')
        if (col.rows?.some(r => r.column_name === 'touro_nome')) colsExtras.push('i.touro_nome')
        if (col.rows?.some(r => r.column_name === 'touro')) colsExtras.push('i.touro')

        const r = await query(`
          SELECT ${colsExtras.join(', ')}
          FROM inseminacoes i
          LEFT JOIN animais a ON a.id = i.animal_id
          WHERE i.${dateCol} >= $1 AND i.${dateCol} <= $2
          ORDER BY i.${dateCol} DESC
          LIMIT 1500
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
          WHERE table_name = 'inseminacoes' AND column_name IN ('data_ia', 'data_inseminacao', 'data', 'resultado_dg', 'status_gestacao')
        `)
        const dateCol = col.rows?.find(r => r.column_name === 'data_ia') ? 'data_ia'
          : col.rows?.find(r => r.column_name === 'data_inseminacao') ? 'data_inseminacao' : 'data'
        const temResultadoDg = col.rows?.some(r => r.column_name === 'resultado_dg')
        const temStatusGestacao = col.rows?.some(r => r.column_name === 'status_gestacao')

        let r
        if (temResultadoDg || temStatusGestacao) {
          // P, Prenha, Prenhez, Positivo e variações (DG costuma usar P ou Positivo)
          const prenhaCond = [
            temResultadoDg && "(TRIM(COALESCE(resultado_dg,'')) = 'P' OR LOWER(COALESCE(resultado_dg,'')) LIKE '%pren%' OR LOWER(COALESCE(resultado_dg,'')) LIKE '%positivo%')",
            temStatusGestacao && "(TRIM(COALESCE(status_gestacao,'')) = 'P' OR LOWER(COALESCE(status_gestacao,'')) LIKE '%pren%' OR LOWER(COALESCE(status_gestacao,'')) LIKE '%positivo%')"
          ].filter(Boolean).join(' OR ')
          r = await query(`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN ${prenhaCond} THEN 1 END) as prenhas
            FROM inseminacoes
            WHERE ${dateCol} >= $1 AND ${dateCol} <= $2
          `, [start, end])
        } else {
          r = await query(`
            SELECT COUNT(*) as total, 0 as prenhas
            FROM inseminacoes
            WHERE ${dateCol} >= $1 AND ${dateCol} <= $2
          `, [start, end])
        }
        const row = r.rows?.[0]
        const total = parseInt(row?.total || 0, 10)
        const prenhas = parseInt(row?.prenhas || 0, 10)
        resumo = { total, prenhas, taxaPrenhez: total > 0 ? ((prenhas / total) * 100).toFixed(1) + '%' : '0%' }
        data = [{ _resumo: resumo }]
        if (prenhas > 0 && (temResultadoDg || temStatusGestacao)) {
          const prenhaCondList = [
            temResultadoDg && "(TRIM(COALESCE(i.resultado_dg,'')) = 'P' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%pren%' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%positivo%')",
            temStatusGestacao && "(TRIM(COALESCE(i.status_gestacao,'')) = 'P' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%pren%' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%positivo%')"
          ].filter(Boolean).join(' OR ')
          const colsList = ['i.id', 'i.animal_id', `i.${dateCol}`, 'a.serie', 'a.rg', 'a.nome']
          if (col.rows?.some(r => r.column_name === 'touro_nome')) colsList.push('i.touro_nome')
          else if (col.rows?.some(r => r.column_name === 'touro')) colsList.push('i.touro')
          const rList = await query(`
            SELECT ${colsList.join(', ')}
            FROM inseminacoes i
            JOIN animais a ON a.id = i.animal_id
            WHERE i.${dateCol} >= $1 AND i.${dateCol} <= $2 AND (${prenhaCondList})
            ORDER BY i.${dateCol} DESC
            LIMIT 1000
          `, [start, end])
          const listaPrenhas = (rList.rows || []).map(row => ({
            animal: row.nome || `${row.serie || ''} ${row.rg || ''}`.trim(),
            data: toDateStr(row.data_ia || row.data_inseminacao || row.data),
            touro: row.touro_nome || row.touro
          }))
          data = [{ _resumo: resumo }, ...listaPrenhas]
        }
        break
      }

      case 'gestacoes': {
        try {
          const colCheck = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'gestacoes' AND column_name IN ('data_gestacao', 'data_cobertura')
          `)
          const temDataGestacao = colCheck.rows?.some(r => r.column_name === 'data_gestacao')
          const whereExtra = temDataGestacao ? ' OR (g.data_gestacao >= $1 AND g.data_gestacao <= $2)' : ''
          const orderCol = temDataGestacao ? 'COALESCE(g.data_cobertura, g.data_gestacao)' : 'g.data_cobertura'

          const r = await query(`
            SELECT g.*
            FROM gestacoes g
            WHERE (g.data_cobertura >= $1 AND g.data_cobertura <= $2)${whereExtra}
            ORDER BY ${orderCol} DESC
            LIMIT 1000
          `, [start, end])
          data = (r.rows || []).map(row => ({
            animal: row.receptora_nome || `${row.receptora_serie || ''} ${row.receptora_rg || ''}`.trim() || `${row.mae_serie || ''} ${row.mae_rg || ''}`.trim(),
            data: toDateStr(row.data_cobertura || row.data_gestacao),
            situacao: row.situacao,
            origem: 'TE'
          }))

          // Incluir inseminações prenhas (IA) quando tabela gestacoes vazia ou para complementar
          const colIA = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'inseminacoes' AND column_name IN ('data_ia', 'data_inseminacao', 'data', 'resultado_dg', 'status_gestacao')
          `)
          const dateColIA = colIA.rows?.find(r => r.column_name === 'data_ia') ? 'data_ia'
            : colIA.rows?.find(r => r.column_name === 'data_inseminacao') ? 'data_inseminacao' : 'data'
          const temResultadoIA = colIA.rows?.some(r => r.column_name === 'resultado_dg') || colIA.rows?.some(r => r.column_name === 'status_gestacao')
          if (temResultadoIA) {
            const temRd = colIA.rows?.some(r => r.column_name === 'resultado_dg')
            const temSg = colIA.rows?.some(r => r.column_name === 'status_gestacao')
            const prenhaCondIA = [
              temRd && "(TRIM(COALESCE(i.resultado_dg,'')) = 'P' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%pren%' OR LOWER(COALESCE(i.resultado_dg,'')) LIKE '%positivo%')",
              temSg && "(TRIM(COALESCE(i.status_gestacao,'')) = 'P' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%pren%' OR LOWER(COALESCE(i.status_gestacao,'')) LIKE '%positivo%')"
            ].filter(Boolean).join(' OR ')
            const ri = await query(`
              SELECT i.${dateColIA} as data_gest, a.serie, a.rg, a.nome
              FROM inseminacoes i
              JOIN animais a ON a.id = i.animal_id
              WHERE i.${dateColIA} >= $1 AND i.${dateColIA} <= $2
                AND (${prenhaCondIA})
              ORDER BY i.${dateColIA} DESC
              LIMIT 1000
            `, [start, end])
            ;(ri.rows || []).forEach(row => {
              data.push({
                animal: row.nome || `${row.serie || ''} ${row.rg || ''}`.trim(),
                data: toDateStr(row.data_gest),
                situacao: 'Prenha',
                origem: 'IA'
              })
            })
            data.sort((a, b) => (b.data || '').localeCompare(a.data || ''))
          }
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
            LIMIT 500
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
          const todas = []
          // 1. Gestações ativas - filtrar por previsão no período (parto previsto)
          try {
            const rg = await query(`
              SELECT g.id, g.receptora_nome, g.receptora_serie, g.receptora_rg,
                     g.data_cobertura, g.situacao, g.pai_serie, g.pai_rg,
                     (g.data_cobertura::date + INTERVAL '285 days')::date as previsao
              FROM gestacoes g
              WHERE (g.situacao = 'Em Gestação' OR g.situacao = 'Ativa' OR g.situacao IS NULL)
                AND (g.data_cobertura::date + INTERVAL '285 days')::date >= $1
                AND (g.data_cobertura::date + INTERVAL '285 days')::date <= $2
              ORDER BY previsao ASC
              LIMIT 500
            `, [start, end])
            ;(rg.rows || []).forEach(row => {
              const touro = row.pai_serie && row.pai_rg ? `${row.pai_serie} ${row.pai_rg}` : null
              todas.push({
                animal: row.receptora_nome || `${row.receptora_serie || ''} ${row.receptora_rg || ''}`.trim(),
                data_cobertura: toDateStr(row.data_cobertura),
                previsao_parto: toDateStr(row.previsao),
                touro,
                origem: 'gestacao'
              })
            })
          } catch (_) {}

          // 2. Inseminações prenhas (data_ia + 285 dias)
          try {
            const colCheck = await query(`
              SELECT column_name FROM information_schema.columns
              WHERE table_name = 'inseminacoes' AND column_name IN ('resultado_dg', 'status_gestacao')
            `)
            const temPrenha = colCheck.rows?.length > 0
            if (temPrenha) {
              const ri = await query(`
                SELECT i.data_ia, i.touro_nome, i.touro, a.serie, a.rg, a.nome,
                       (i.data_ia::date + INTERVAL '285 days')::date as previsao
                FROM inseminacoes i
                JOIN animais a ON a.id = i.animal_id
                WHERE (i.data_ia::date + INTERVAL '285 days')::date >= $1
                  AND (i.data_ia::date + INTERVAL '285 days')::date <= $2
                  AND (TRIM(COALESCE(i.resultado_dg,'') || COALESCE(i.status_gestacao,'')) = 'P'
                    OR LOWER(COALESCE(i.resultado_dg,'') || COALESCE(i.status_gestacao,'')) LIKE '%pren%'
                    OR LOWER(COALESCE(i.resultado_dg,'') || COALESCE(i.status_gestacao,'')) LIKE '%positivo%')
                ORDER BY previsao ASC
                LIMIT 500
              `, [start, end])
              ;(ri.rows || []).forEach(row => {
                todas.push({
                  animal: row.nome || `${row.serie || ''} ${row.rg || ''}`.trim(),
                  data_cobertura: toDateStr(row.data_ia),
                  previsao_parto: toDateStr(row.previsao),
                  touro: row.touro_nome || row.touro,
                  origem: 'IA'
                })
              })
            }
          } catch (_) {}

          // Ordenar por previsão e limitar
          data = todas
            .sort((a, b) => (a.previsao_parto || '').localeCompare(b.previsao_parto || ''))
            .slice(0, 200)

          // Resumo: total e por touro
          const porTouro = {}
          data.forEach(d => {
            const t = (d.touro || 'Não informado').trim() || 'Não informado'
            porTouro[t] = (porTouro[t] || 0) + 1
          })
          const totaisTouro = Object.entries(porTouro)
            .sort((a, b) => b[1] - a[1])
            .map(([nome, qtd]) => `${nome}: ${qtd}`)
          resumo = {
            'Total de previsões': data.length,
            'Prenhas por touro': totaisTouro.slice(0, 10).join(' | ') || '-'
          }
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
            LIMIT 500
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

      case 'coleta_fiv': {
        try {
          const r = await query(`
            SELECT cf.id, cf.data_fiv, cf.data_transferencia, cf.doadora_nome, cf.quantidade_oocitos, cf.touro, cf.laboratorio, cf.veterinario, cf.observacoes
            FROM coleta_fiv cf
            WHERE cf.data_fiv >= $1 AND cf.data_fiv <= $2
            ORDER BY cf.data_fiv DESC
            LIMIT 500
          `, [start, end])
          data = (r.rows || []).map(row => ({
            data: toDateStr(row.data_fiv),
            doadora: row.doadora_nome,
            oocitos: row.quantidade_oocitos,
            touro: row.touro,
            data_transferencia: toDateStr(row.data_transferencia),
            laboratorio: row.laboratorio
          }))
          const totalOocitos = data.reduce((s, d) => s + (parseInt(d.oocitos) || 0), 0)
          resumo = { 'Total de coletas': data.length, 'Total de oócitos': totalOocitos }
        } catch (e) {
          data = []
        }
        break
      }

      case 'receptoras_chegaram': {
        try {
          const colCheck = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'notas_fiscais' AND column_name IN ('eh_receptoras', 'data_chegada_animais', 'data_compra')
          `)
          const temEhReceptoras = colCheck.rows?.some(r => r.column_name === 'eh_receptoras')
          const dataCol = colCheck.rows?.some(r => r.column_name === 'data_chegada_animais') ? 'COALESCE(nf.data_chegada_animais, nf.data_compra)' : 'nf.data_compra'
          if (temEhReceptoras) {
            const r = await query(`
              SELECT nf.id, nf.numero_nf, nf.fornecedor, nf.quantidade_receptoras, ${dataCol}::date as data_chegada
              FROM notas_fiscais nf
              WHERE nf.eh_receptoras = true AND nf.tipo = 'entrada'
                AND ${dataCol}::date >= $1 AND ${dataCol}::date <= $2
              ORDER BY ${dataCol} DESC
              LIMIT 100
            `, [start, end])
            data = (r.rows || []).map(row => ({
              nf: row.numero_nf,
              fornecedor: row.fornecedor,
              quantidade: row.quantidade_receptoras,
              data: toDateStr(row.data_chegada)
            }))
            resumo = { 'NFs de receptoras': data.length, 'Total receptoras': data.reduce((s, d) => s + (parseInt(d.quantidade) || 0), 0) }
          } else {
            data = []
            resumo = { info: 'Tabela notas_fiscais sem coluna eh_receptoras' }
          }
        } catch (e) {
          data = []
        }
        break
      }

      case 'receptoras_faltam_parir': {
        try {
          const r = await query(`
            WITH gestacoes_ativas AS (
              SELECT g.id, g.receptora_nome, g.receptora_serie, g.receptora_rg, g.data_cobertura, g.situacao
              FROM gestacoes g
              WHERE COALESCE(g.situacao, 'Ativa') NOT IN ('Nasceu', 'Nascido', 'Cancelada', 'Cancelado', 'Perdeu', 'Aborto')
            )
            SELECT ga.*, (ga.data_cobertura::date + INTERVAL '285 days')::date as previsao_parto
            FROM gestacoes_ativas ga
            WHERE NOT EXISTS (SELECT 1 FROM nascimentos n WHERE n.gestacao_id = ga.id)
            ORDER BY ga.data_cobertura DESC
            LIMIT 500
          `)
          data = (r.rows || []).map(row => ({
            receptora: row.receptora_nome || `${row.receptora_serie || ''} ${row.receptora_rg || ''}`.trim(),
            data_cobertura: toDateStr(row.data_cobertura),
            previsao_parto: toDateStr(row.previsao_parto)
          }))
          resumo = { 'Receptoras aguardando parto': data.length }
        } catch (e) {
          data = []
        }
        break
      }

      case 'receptoras_faltam_diagnostico': {
        try {
          const colCheck = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'animais' AND column_name IN ('data_chegada', 'data_dg_prevista', 'resultado_dg', 'data_dg', 'categoria', 'raca')
          `)
          const cols = colCheck.rows?.map(r => r.column_name) || []
          const temDataChegada = cols.includes('data_chegada')
          const temDataDgPrevista = cols.includes('data_dg_prevista')
          const temResultadoDg = cols.includes('resultado_dg')
          const temCategoria = cols.includes('categoria')
          const temRaca = cols.includes('raca')
          if (temDataChegada || temDataDgPrevista) {
            const whereData = temDataDgPrevista
              ? `(a.data_dg_prevista >= $1 AND a.data_dg_prevista <= $2)`
              : `(a.data_chegada >= $1 AND a.data_chegada <= $2)`
            const whereReceptora = temCategoria
              ? `(a.categoria = 'Receptora' OR (${temRaca ? "a.raca ILIKE '%receptora%'" : 'false'}))`
              : (temRaca ? `a.raca ILIKE '%receptora%'` : '1=1')
            const whereDg = temResultadoDg
              ? `AND (a.resultado_dg IS NULL OR TRIM(COALESCE(a.resultado_dg,'')) = '' OR LOWER(a.resultado_dg) NOT IN ('prenha', 'p', 'positivo', 'vazia', 'vazio'))`
              : ''
            const r = await query(`
              SELECT a.id, a.serie, a.rg, a.nome, a.data_chegada, a.data_dg_prevista, a.data_dg, a.resultado_dg
              FROM animais a
              WHERE a.situacao = 'Ativo' AND ${whereReceptora} ${whereDg}
                AND ${whereData}
              ORDER BY a.data_chegada DESC NULLS LAST
              LIMIT 500
            `, [start, end])
            data = (r.rows || []).map(row => ({
              animal: `${row.serie || ''} ${row.rg || ''}`.trim() || row.nome,
              data_chegada: toDateStr(row.data_chegada),
              data_dg_prevista: toDateStr(row.data_dg_prevista),
              data_dg: toDateStr(row.data_dg)
            }))
            resumo = { 'Receptoras aguardando DG': data.length }
          } else {
            data = []
            resumo = { info: 'Colunas data_chegada/data_dg_prevista não encontradas' }
          }
        } catch (e) {
          data = []
        }
        break
      }

      case 'resumo_nascimentos': {
        try {
          const r = await query(`
            SELECT
              COUNT(*) as total,
              COUNT(CASE WHEN LOWER(sexo) LIKE 'm%' OR sexo = 'M' THEN 1 END) as machos,
              COUNT(CASE WHEN LOWER(sexo) LIKE 'f%' OR sexo = 'F' THEN 1 END) as femeas,
              ROUND(AVG(peso::numeric), 2) as peso_medio
            FROM nascimentos
            WHERE data_nascimento >= $1 AND data_nascimento <= $2
          `, [start, end])
          const row = r.rows?.[0]
          resumo = {
            total: parseInt(row?.total || 0),
            machos: parseInt(row?.machos || 0),
            femeas: parseInt(row?.femeas || 0),
            peso_medio: row?.peso_medio ? `${parseFloat(row.peso_medio).toFixed(1)} kg` : '-'
          }
          data = [{ _resumo: resumo }]
        } catch (e) {
          data = []
        }
        break
      }

      case 'ocorrencias': {
        try {
          const r = await query(`
            SELECT h.id, h.animal_id, h.tipo, h.data, h.descricao, h.medicamento, h.dosagem,
                   a.serie, a.rg, a.nome as animal_nome
            FROM historia_ocorrencias h
            LEFT JOIN animais a ON a.id = h.animal_id
            WHERE h.data >= $1 AND h.data <= $2
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

      case 'notas_fiscais': {
        try {
          const colCheck = await query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'notas_fiscais' AND column_name IN ('data_compra', 'data_saida')
          `)
          const temDataSaida = colCheck.rows?.some(r => r.column_name === 'data_saida')
          const dataCol = temDataSaida
            ? `COALESCE(CASE WHEN nf.tipo = 'saida' THEN nf.data_saida END, nf.data_compra)`
            : 'nf.data_compra'
          const r = await query(`
            SELECT nf.id, nf.numero_nf, nf.tipo, nf.fornecedor, nf.destino, nf.valor_total, nf.data_compra, nf.data_saida
            FROM notas_fiscais nf
            WHERE ${dataCol}::date >= $1 AND ${dataCol}::date <= $2
            ORDER BY ${dataCol} DESC
            LIMIT 200
          `, [start, end])
          data = (r.rows || []).map(row => ({
            nf: row.numero_nf,
            tipo: row.tipo,
            fornecedor: row.fornecedor || row.destino,
            valor: row.valor_total,
            data: toDateStr(row.tipo === 'saida' && row.data_saida ? row.data_saida : row.data_compra)
          }))
          const entradas = data.filter(d => d.tipo === 'entrada').length
          const saidas = data.filter(d => d.tipo === 'saida').length
          resumo = { 'Entradas': entradas, 'Saídas': saidas, 'Total NFs': data.length }
        } catch (e) {
          data = []
        }
        break
      }

      case 'custos': {
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
          const total = data.reduce((s, d) => s + (parseFloat(d.valor) || 0), 0)
          resumo = { 'Total de custos': data.length, 'Valor total': `R$ ${total.toFixed(2)}` }
        } catch (e) {
          data = []
        }
        break
      }

      case 'boletim_rebanho': {
        try {
          const r = await query(`
            SELECT raca, sexo, COUNT(*) as total
            FROM animais
            WHERE situacao = 'Ativo'
            GROUP BY raca, sexo
            ORDER BY raca, sexo
            LIMIT 100
          `)
          data = (r.rows || []).map(row => ({
            raca: row.raca || 'Não informado',
            sexo: formatarSexo(row.sexo),
            total: parseInt(row.total || 0)
          }))
          const totalAnimais = data.reduce((s, d) => s + (d.total || 0), 0)
          resumo = { 'Total de animais ativos': totalAnimais, 'Racas': [...new Set(data.map(d => d.raca))].length }
        } catch (e) {
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
