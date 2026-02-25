import { query } from '../../lib/database'

/**
 * API de Insights com IA para análise de dados do rebanho
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { tipo, data, period } = req.body

    let insights = []
    let recommendations = []
    let alerts = []

    switch (tipo) {
      case 'resumo_pesagens':
        insights = await analyzeWeightData(data)
        break
      case 'pesagens':
        insights = await analyzeWeightTrends(data, period)
        break
      case 'inseminacoes':
      case 'femeas_ia':
        insights = await analyzeInseminationData(data)
        break
      case 'resumo_femeas_ia':
        insights = await analyzePregnancyRate(data)
        break
      case 'nascimentos':
        insights = await analyzeBirthData(data)
        break
      case 'estoque_semen':
        insights = await analyzeSemenStock(data)
        break
      default:
        insights = await analyzeGenericData(data)
    }

    return res.status(200).json({
      success: true,
      insights,
      recommendations,
      alerts
    })
  } catch (error) {
    console.error('Erro ao gerar insights:', error)
    return res.status(500).json({ error: 'Erro ao gerar insights' })
  }
}

// Análise de dados de pesagem
async function analyzeWeightData(data) {
  const insights = []
  
  if (!data || data.length === 0) return insights

  // Calcular médias e variações
  const pesos = data.map(d => parseFloat(d['Média Peso (kg)'] || d.mediaPeso || 0)).filter(p => p > 0)
  if (pesos.length === 0) return insights

  const mediaPeso = pesos.reduce((a, b) => a + b, 0) / pesos.length
  const maxPeso = Math.max(...pesos)
  const minPeso = Math.min(...pesos)
  const variacao = ((maxPeso - minPeso) / mediaPeso * 100).toFixed(1)

  insights.push({
    type: 'info',
    icon: '📊',
    title: 'Análise de Peso Médio',
    description: `Peso médio do rebanho: ${mediaPeso.toFixed(1)} kg`,
    detail: `Variação entre piquetes: ${variacao}%`
  })

  // Identificar piquetes com desempenho excepcional
  const melhorPiquete = data.find(d => parseFloat(d['Média Peso (kg)'] || d.mediaPeso) === maxPeso)
  if (melhorPiquete && maxPeso > mediaPeso * 1.1) {
    insights.push({
      type: 'success',
      icon: '🏆',
      title: 'Destaque Positivo',
      description: `${melhorPiquete.Piquete || melhorPiquete.piquete} apresenta peso ${((maxPeso/mediaPeso - 1) * 100).toFixed(0)}% acima da média`,
      detail: 'Considere replicar as práticas de manejo deste piquete'
    })
  }

  // Identificar piquetes que precisam atenção
  const piorPiquete = data.find(d => parseFloat(d['Média Peso (kg)'] || d.mediaPeso) === minPeso)
  if (piorPiquete && minPeso < mediaPeso * 0.85) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Atenção Necessária',
      description: `${piorPiquete.Piquete || piorPiquete.piquete} está ${((1 - minPeso/mediaPeso) * 100).toFixed(0)}% abaixo da média`,
      detail: 'Recomenda-se avaliar nutrição e sanidade deste lote'
    })
  }

  // Análise de distribuição por sexo
  const totalAnimais = data.reduce((sum, d) => sum + (parseInt(d.Animais || d.animais) || 0), 0)
  if (totalAnimais > 0) {
    insights.push({
      type: 'info',
      icon: '🐄',
      title: 'Distribuição do Rebanho',
      description: `Total de ${totalAnimais} animais pesados`,
      detail: `Distribuídos em ${data.length} piquetes`
    })
  }

  return insights
}

// Análise de tendências de pesagem ao longo do tempo
async function analyzeWeightTrends(data, period) {
  const insights = []
  
  if (!data || data.length < 2) return insights

  // Agrupar por data
  const porData = {}
  data.forEach(r => {
    const d = r.data
    if (d) {
      if (!porData[d]) porData[d] = []
      porData[d].push(parseFloat(r.peso) || 0)
    }
  })

  const datas = Object.keys(porData).sort()
  if (datas.length < 2) return insights

  // Calcular ganho médio diário
  const pesosMedias = datas.map(d => {
    const pesos = porData[d]
    return pesos.reduce((a, b) => a + b, 0) / pesos.length
  })

  const primeirosPesos = pesosMedias.slice(0, Math.ceil(pesosMedias.length / 3))
  const ultimosPesos = pesosMedias.slice(-Math.ceil(pesosMedias.length / 3))
  
  const mediaPrimeiros = primeirosPesos.reduce((a, b) => a + b, 0) / primeirosPesos.length
  const mediaUltimos = ultimosPesos.reduce((a, b) => a + b, 0) / ultimosPesos.length

  const ganhoTotal = mediaUltimos - mediaPrimeiros
  const diasPeriodo = (new Date(datas[datas.length - 1]) - new Date(datas[0])) / (1000 * 60 * 60 * 24)
  const gmd = diasPeriodo > 0 ? (ganhoTotal / diasPeriodo) : 0

  if (gmd > 0) {
    insights.push({
      type: gmd > 0.8 ? 'success' : 'info',
      icon: gmd > 0.8 ? '📈' : '📊',
      title: 'Ganho Médio Diário',
      description: `GMD estimado: ${gmd.toFixed(3)} kg/dia`,
      detail: gmd > 1.0 ? 'Excelente desempenho!' : gmd > 0.8 ? 'Bom desempenho' : 'Considere revisar estratégia nutricional'
    })
  }

  // Tendência
  if (ganhoTotal > 0) {
    insights.push({
      type: 'success',
      icon: '✅',
      title: 'Tendência Positiva',
      description: `Ganho de ${ganhoTotal.toFixed(1)} kg no período`,
      detail: 'Rebanho apresenta evolução consistente'
    })
  }

  return insights
}

// Análise de dados de inseminação
async function analyzeInseminationData(data) {
  const insights = []
  
  if (!data || data.length === 0) return insights

  // Análise por touro
  const porTouro = {}
  data.forEach(r => {
    const touro = r.touro || 'Não informado'
    porTouro[touro] = (porTouro[touro] || 0) + 1
  })

  const touros = Object.entries(porTouro).sort(([, a], [, b]) => b - a)
  const totalIA = data.length

  insights.push({
    type: 'info',
    icon: '💉',
    title: 'Resumo de Inseminações',
    description: `${totalIA} inseminações realizadas`,
    detail: `Utilizando ${touros.length} touros diferentes`
  })

  // Touro mais utilizado
  if (touros.length > 0) {
    const [touroTop, qtd] = touros[0]
    const percentual = ((qtd / totalIA) * 100).toFixed(0)
    
    insights.push({
      type: 'info',
      icon: '🏆',
      title: 'Touro Mais Utilizado',
      description: `${touroTop}: ${qtd} IAs (${percentual}%)`,
      detail: percentual > 50 ? 'Considere diversificar genética' : 'Boa diversificação genética'
    })
  }

  // Concentração genética
  const top3 = touros.slice(0, 3).reduce((sum, [, qtd]) => sum + qtd, 0)
  const concentracao = ((top3 / totalIA) * 100).toFixed(0)
  
  if (concentracao > 70) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Concentração Genética',
      description: `${concentracao}% das IAs concentradas em 3 touros`,
      detail: 'Recomenda-se maior diversificação para reduzir consanguinidade'
    })
  }

  return insights
}

// Análise de taxa de prenhez
async function analyzePregnancyRate(data) {
  const insights = []
  
  if (!data || !data.resumo) return insights

  const prenhas = parseInt(data.resumo.prenhas || 0)
  const total = parseInt(data.resumo.total || 0)
  
  if (total === 0) return insights

  const taxa = ((prenhas / total) * 100).toFixed(1)
  
  insights.push({
    type: taxa >= 50 ? 'success' : taxa >= 40 ? 'info' : 'warning',
    icon: taxa >= 50 ? '🎯' : taxa >= 40 ? '📊' : '⚠️',
    title: 'Taxa de Prenhez',
    description: `${taxa}% de prenhez (${prenhas}/${total})`,
    detail: taxa >= 50 ? 'Excelente resultado!' : 
            taxa >= 40 ? 'Resultado dentro da média' : 
            'Abaixo do esperado - revisar protocolo'
  })

  // Análise de não prenhas
  const naoPrenhas = total - prenhas
  if (naoPrenhas > 0) {
    insights.push({
      type: 'info',
      icon: '🔄',
      title: 'Oportunidade de Ressincronização',
      description: `${naoPrenhas} fêmeas disponíveis para novo protocolo`,
      detail: 'Planeje próximo lote de IA'
    })
  }

  return insights
}

// Análise de nascimentos
async function analyzeBirthData(data) {
  const insights = []
  
  if (!data || data.length === 0) return insights

  const machos = data.filter(r => (r.sexo || '').toUpperCase().startsWith('M')).length
  const femeas = data.filter(r => (r.sexo || '').toUpperCase().startsWith('F')).length
  const total = machos + femeas

  if (total === 0) return insights

  const proporcaoMachos = ((machos / total) * 100).toFixed(0)
  
  insights.push({
    type: 'info',
    icon: '🐮',
    title: 'Nascimentos Registrados',
    description: `${total} nascimentos no período`,
    detail: `${machos} machos (${proporcaoMachos}%) e ${femeas} fêmeas`
  })

  // Análise de proporção sexual
  if (Math.abs(machos - femeas) / total > 0.3) {
    insights.push({
      type: 'info',
      icon: '⚖️',
      title: 'Proporção Sexual',
      description: `Predominância de ${machos > femeas ? 'machos' : 'fêmeas'}`,
      detail: 'Variação natural esperada em lotes pequenos'
    })
  }

  // Análise temporal
  const porMes = {}
  data.forEach(r => {
    if (r.data) {
      const mes = new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      porMes[mes] = (porMes[mes] || 0) + 1
    }
  })

  const meses = Object.entries(porMes).sort(([, a], [, b]) => b - a)
  if (meses.length > 0) {
    const [mesTop, qtd] = meses[0]
    insights.push({
      type: 'info',
      icon: '📅',
      title: 'Pico de Nascimentos',
      description: `${mesTop}: ${qtd} nascimentos`,
      detail: 'Concentração de partos indica boa sincronização'
    })
  }

  return insights
}

// Análise de estoque de sêmen
async function analyzeSemenStock(data) {
  const insights = []
  
  if (!data || data.length === 0) return insights

  const totalDoses = data.reduce((sum, r) => sum + (parseInt(r.quantidade) || 0), 0)
  const touros = data.length

  insights.push({
    type: 'info',
    icon: '🧪',
    title: 'Estoque de Sêmen',
    description: `${totalDoses} doses disponíveis`,
    detail: `${touros} touros em estoque`
  })

  // Identificar touros com estoque baixo
  const estoqueBaixo = data.filter(r => (parseInt(r.quantidade) || 0) < 10)
  if (estoqueBaixo.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Estoque Baixo',
      description: `${estoqueBaixo.length} touro(s) com menos de 10 doses`,
      detail: 'Considere reposição de estoque'
    })
  }

  // Touros com maior estoque
  const maisEstoque = data.sort((a, b) => (parseInt(b.quantidade) || 0) - (parseInt(a.quantidade) || 0))[0]
  if (maisEstoque) {
    insights.push({
      type: 'info',
      icon: '📦',
      title: 'Maior Estoque',
      description: `${maisEstoque.touro}: ${maisEstoque.quantidade} doses`,
      detail: 'Touro com maior disponibilidade'
    })
  }

  return insights
}

// Análise genérica de dados
async function analyzeGenericData(data) {
  const insights = []
  const dataArray = Array.isArray(data) ? data : (data?.data || [])
  const total = dataArray.length

  if (!dataArray.length) {
    insights.push({
      type: 'info',
      icon: 'ℹ️',
      title: 'Sem Dados',
      description: 'Nenhum registro encontrado no período selecionado',
      detail: 'Ajuste o período ou verifique os filtros'
    })
    return insights
  }

  insights.push({
    type: 'info',
    icon: '📊',
    title: 'Dados Disponíveis',
    description: `${total} registros encontrados`,
    detail: 'Utilize os filtros para análise detalhada'
  })

  return insights
}
