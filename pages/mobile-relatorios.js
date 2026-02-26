/**
 * Relatórios visíveis no mobile.
 * Gráficos, KPI cards, animações e visual aprimorado.
 */
import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  HeartIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  SparklesIcon,
  LightBulbIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend)

function formatDate(d) {
  if (!d) return '-'
  // Strings YYYY-MM-DD são interpretadas como UTC pelo JS, causando dia errado no Brasil.
  // Parse como data local para exibir corretamente.
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, day] = d.split(/[-T]/).map(Number)
    if (y && m && day) {
      const dt = new Date(y, m - 1, day)
      return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('pt-BR')
    }
  }
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('pt-BR')
}

const CORES_PIQUETE = [
  'rgba(245, 158, 11, 0.85)',   // amber
  'rgba(34, 197, 94, 0.85)',    // green
  'rgba(59, 130, 246, 0.85)',   // blue
  'rgba(168, 85, 247, 0.85)',   // purple
  'rgba(236, 72, 153, 0.85)',   // pink
  'rgba(20, 184, 166, 0.85)',   // teal
  'rgba(249, 115, 22, 0.85)',   // orange
]

const ICONE_POR_CATEGORIA = {
  Manejo: ScaleIcon,
  Reprodução: HeartIcon,
  Sanidade: UserGroupIcon,
  Estoque: DocumentTextIcon,
  Localização: MapPinIcon,
  Financeiro: CurrencyDollarIcon,
  Gestão: ChartBarIcon,
  Documentos: DocumentTextIcon,
  Outros: ChartBarIcon
}

export default function MobileRelatorios() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTipo, setSelectedTipo] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('charts') // 'charts' | 'table'
  const [period, setPeriod] = useState(() => {
    const today = new Date()
    const start = new Date(today)
    start.setFullYear(start.getFullYear() - 10)
    const end = new Date(today)
    end.setFullYear(end.getFullYear() + 2)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  })
  const [sexoFilter, setSexoFilter] = useState('todos')
  const [tipoFiltroCalendario, setTipoFiltroCalendario] = useState('')
  const [sharing, setSharing] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('mobile-relatorios-recent') : null
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  useEffect(() => {
    fetch('/api/mobile-reports')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setConfig(d.data)
        } else if (d.enabled && d.allTypes) {
          setConfig({ enabled: d.enabled, allTypes: d.allTypes })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Carregar dashboard (resumo geral) na entrada
  useEffect(() => {
    if (!config?.enabled?.includes('resumo_geral')) return
    const params = new URLSearchParams({
      tipo: 'resumo_geral',
      startDate: period.startDate,
      endDate: period.endDate
    })
    fetch(`/api/mobile-reports?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setDashboardData(d.data)
      })
      .catch(() => {})
  }, [config?.enabled])

  useEffect(() => {
    if (!selectedTipo) {
      setReportData(null)
      setSearchQuery('')
      return
    }
    setLoadingData(true)
    const params = new URLSearchParams({
      tipo: selectedTipo,
      startDate: period.startDate,
      endDate: period.endDate
    })
    fetch(`/api/mobile-reports?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setReportData(d.data)
          saveRecent(selectedTipo)
        }
        else setReportData(null)
      })
      .catch(() => setReportData(null))
      .finally(() => setLoadingData(false))
  }, [selectedTipo, period.startDate, period.endDate])

  useEffect(() => {
    if (selectedTipo === 'calendario_reprodutivo') {
      setViewMode('calendar')
    }
  }, [selectedTipo])

  const enabledReports = config?.enabled || []
  const allTypes = config?.allTypes || []
  const tiposHabilitados = allTypes.filter(t => enabledReports.includes(t.key))
  const porCategoria = tiposHabilitados.reduce((acc, t) => {
    const cat = t.category || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(t)
    return acc
  }, {})
  const showRanking = enabledReports.includes('ranking_animais_avaliados') || enabledReports.includes('ranking_pmgz')
  const ehRanking = selectedTipo === 'ranking_pmgz' || selectedTipo === 'ranking_animais_avaliados'
  const LABELS_RANKING = {
    ranking: 'Ranking',
    posicao: 'Posição',
    animal: 'Animal',
    valor: 'Valor',
    raca: 'Raça',
    sexo: 'Sexo',
    piquete: 'Piquete',
    iABCZ: 'iABCZ',
    deca: 'DECA'
  }

  const filteredData = reportData?.data?.filter(d => {
    if (d._resumo) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    return Object.values(d).some(v => v != null && String(v).toLowerCase().includes(q))
  }) || []
  const hasSexo = (reportData?.data || []).some(r => r.sexo != null)
  const filteredBySexo = filteredData.filter(r => {
    if (!hasSexo || sexoFilter === 'todos') return true
    const s = String(r.sexo || '').toUpperCase()
    if (sexoFilter === 'M') return s.startsWith('M')
    if (sexoFilter === 'F') return s.startsWith('F')
    return true
  })

  const filteredCalendario = selectedTipo === 'calendario_reprodutivo' && tipoFiltroCalendario
    ? filteredBySexo.filter(r => (r.tipo || '') === tipoFiltroCalendario)
    : filteredBySexo

  const saveRecent = useCallback((id) => {
    if (!id) return
    setRecentIds(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, 2)
      try { localStorage.setItem('mobile-relatorios-recent', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // Dados para gráficos (resumo_pesagens)
  const dadosGraficoPiquete = reportData?.data?.filter(d => !d._resumo) || []
  const chartBarPiquete = selectedTipo === 'resumo_pesagens' && dadosGraficoPiquete.length > 0 ? {
    labels: dadosGraficoPiquete.map(r => (r.Piquete || r.piquete || '').replace(/PROJETO\s*/i, 'P')),
    datasets: [{
      label: 'Animais',
      data: dadosGraficoPiquete.map(r => r.Animais ?? r.animais ?? 0),
      backgroundColor: CORES_PIQUETE.slice(0, dadosGraficoPiquete.length),
      borderColor: CORES_PIQUETE.map(c => c.replace('0.85', '1')),
      borderWidth: 1
    }]
  } : null

  const chartPesoPiquete = selectedTipo === 'resumo_pesagens' && dadosGraficoPiquete.length > 0 ? {
    labels: dadosGraficoPiquete.map(r => (r.Piquete || r.piquete || '').replace(/PROJETO\s*/i, 'P')),
    datasets: [{
      label: 'Média Peso (kg)',
      data: dadosGraficoPiquete.map(r => {
        const v = r['Média Peso (kg)'] ?? r.mediaPeso
        return typeof v === 'number' ? v : (parseFloat(String(v).replace(',', '.')) || 0)
      }),
      backgroundColor: 'rgba(245, 158, 11, 0.7)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1
    }]
  } : null

  const resumo = reportData?.resumo || {}
  let machos = Number(resumo.Machos ?? resumo.machos ?? 0)
  let femeas = Number(resumo.Fêmeas ?? resumo.femeas ?? 0)
  if (selectedTipo === 'nascimentos' && (machos === 0 && femeas === 0) && filteredData.length > 0) {
    machos = filteredData.filter(r => (r.sexo || '').toUpperCase().startsWith('M')).length
    femeas = filteredData.filter(r => (r.sexo || '').toUpperCase().startsWith('F')).length
  }
  const chartSexo = (selectedTipo === 'resumo_pesagens' || selectedTipo === 'nascimentos') && (machos > 0 || femeas > 0) ? {
    labels: ['Machos', 'Fêmeas'],
    datasets: [{
      data: [machos, femeas],
      backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(236, 72, 153, 0.85)'],
      borderColor: ['rgba(59, 130, 246, 1)', 'rgba(236, 72, 153, 1)'],
      borderWidth: 2
    }]
  } : null

  const prenhas = Number(resumo.prenhas ?? 0)
  const totalIA = Number(resumo.total ?? 0)
  const naoPrenhas = totalIA - prenhas
  const chartPrenhez = selectedTipo === 'resumo_femeas_ia' && totalIA > 0 ? {
    labels: ['Prenhas', 'Não prenhas'],
    datasets: [{
      data: [prenhas, naoPrenhas],
      backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)'],
      borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 2
    }]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  // Gráfico de pesagens por data (evolução temporal)
  const pesagensPorData = selectedTipo === 'pesagens' && filteredData.length > 0 ? (() => {
    const porData = {}
    filteredData.forEach(r => {
      const d = r.data || ''
      if (d) porData[d] = (porData[d] || 0) + 1
    })
    const entries = Object.entries(porData).sort(([a], [b]) => a.localeCompare(b))
    if (entries.length === 0) return null
    return {
      labels: entries.map(([d]) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
      datasets: [{
        label: 'Pesagens',
        data: entries.map(([, c]) => c),
        fill: true,
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.3
      }]
    }
  })() : null

  // Gráfico de inseminações por touro
  const inseminacoesPorTouro = (selectedTipo === 'inseminacoes' || selectedTipo === 'femeas_ia') && filteredData.length > 0 ? (() => {
    const porTouro = {}
    filteredData.forEach(r => {
      const t = (r.touro || 'Não informado').trim() || 'Não informado'
      porTouro[t] = (porTouro[t] || 0) + 1
    })
    const entries = Object.entries(porTouro).sort(([, a], [, b]) => b - a).slice(0, 8)
    if (entries.length === 0) return null
    return {
      labels: entries.map(([t]) => t.length > 15 ? t.slice(0, 12) + '...' : t),
      datasets: [{
        label: 'Inseminações',
        data: entries.map(([, c]) => c),
        backgroundColor: CORES_PIQUETE.slice(0, entries.length),
        borderWidth: 1
      }]
    }
  })() : null

  // Gráfico de estoque de sêmen por touro
  const estoquePorTouro = selectedTipo === 'estoque_semen' && filteredData.length > 0 ? (() => {
    const porTouro = {}
    filteredData.forEach(r => {
      const t = (r.touro || 'Não informado').trim() || 'Não informado'
      const q = Number(r.quantidade) || 0
      porTouro[t] = (porTouro[t] || 0) + q
    })
    const entries = Object.entries(porTouro).sort(([, a], [, b]) => b - a).slice(0, 8)
    if (entries.length === 0) return null
    return {
      labels: entries.map(([t]) => t.length > 15 ? t.slice(0, 12) + '...' : t),
      datasets: [{
        label: 'Doses',
        data: entries.map(([, c]) => c),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1
      }]
    }
  })() : null

  // Gráfico de nascimentos por mês
  const nascimentosPorMes = selectedTipo === 'nascimentos' && filteredData.length > 0 ? (() => {
    const porMes = {}
    filteredData.forEach(r => {
      const d = r.data || ''
      if (!d) return
      const mes = new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      porMes[mes] = (porMes[mes] || 0) + 1
    })
    const mesesOrd = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const entries = Object.entries(porMes).sort(([a], [b]) => {
      const ai = mesesOrd.findIndex(m => a.toLowerCase().startsWith(m))
      const bi = mesesOrd.findIndex(m => b.toLowerCase().startsWith(m))
      return (ai >= 0 ? ai : 99) - (bi >= 0 ? bi : 99)
    }).slice(0, 12)
    if (entries.length === 0) return null
    return {
      labels: entries.map(([m]) => m),
      datasets: [{
        label: 'Nascimentos',
        data: entries.map(([, c]) => c),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }]
    }
  })() : null

  // Gráfico de abastecimento de nitrogênio por data
  const nitrogenioEvolution = selectedTipo === 'abastecimento_nitrogenio' && filteredData.length > 0 ? (() => {
    const porData = {}
    filteredData.forEach(r => {
      const d = r.data || ''
      if (!d) return
      const litros = parseFloat(String(r.quantidade || '0').replace(' L', '')) || 0
      porData[d] = (porData[d] || 0) + litros
    })
    const entries = Object.entries(porData).sort(([a], [b]) => a.localeCompare(b))
    if (entries.length === 0) return null
    return {
      labels: entries.map(([d]) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
      datasets: [{
        label: 'Litros',
        data: entries.map(([, l]) => l),
        fill: true,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3
      }]
    }
  })() : null

  // Gráfico de abastecimento por motorista
  const nitrogenioByDriver = selectedTipo === 'abastecimento_nitrogenio' && filteredData.length > 0 ? (() => {
    const porMotorista = {}
    filteredData.forEach(r => {
      const m = (r.motorista || 'Não informado').trim() || 'Não informado'
      const litros = parseFloat(String(r.quantidade || '0').replace(' L', '')) || 0
      porMotorista[m] = (porMotorista[m] || 0) + litros
    })
    const entries = Object.entries(porMotorista).sort(([, a], [, b]) => b - a).slice(0, 6)
    if (entries.length === 0) return null
    return {
      labels: entries.map(([m]) => m.length > 15 ? m.slice(0, 12) + '...' : m),
      datasets: [{
        label: 'Litros',
        data: entries.map(([, l]) => l),
        backgroundColor: CORES_PIQUETE.slice(0, entries.length),
        borderWidth: 1
      }]
    }
  })() : null

  const temGraficos = chartBarPiquete || chartPesoPiquete || chartSexo || chartPrenhez ||
    pesagensPorData || inseminacoesPorTouro || estoquePorTouro || nascimentosPorMes ||
    nitrogenioEvolution || nitrogenioByDriver

  const ehResumoGeral = selectedTipo === 'resumo_geral'
  const graficosResumo = ehResumoGeral ? (reportData?.resumo?.graficos || []) : []
  
  const chartResumoIdade = ehResumoGeral && graficosResumo.length > 0 ? {
    labels: graficosResumo.filter(d => d.categoria === 'Idade').map(d => d.label),
    datasets: [{
      data: graficosResumo.filter(d => d.categoria === 'Idade').map(d => d.valor),
      backgroundColor: ['rgba(245, 158, 11, 0.85)', 'rgba(34, 197, 94, 0.85)', 'rgba(59, 130, 246, 0.85)'],
      borderColor: ['rgba(245, 158, 11, 1)', 'rgba(34, 197, 94, 1)', 'rgba(59, 130, 246, 1)'],
      borderWidth: 1
    }]
  } : null

  const chartResumoSexo = ehResumoGeral && graficosResumo.length > 0 ? {
    labels: graficosResumo.filter(d => d.categoria === 'Sexo').map(d => d.label),
    datasets: [{
      data: graficosResumo.filter(d => d.categoria === 'Sexo').map(d => d.valor),
      backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(236, 72, 153, 0.85)'],
      borderColor: ['rgba(59, 130, 246, 1)', 'rgba(236, 72, 153, 1)'],
      borderWidth: 1
    }]
  } : null

  const temCalendario = selectedTipo === 'calendario_reprodutivo'

  const eventosPorDia = temCalendario && filteredCalendario.length > 0 ? (() => {
    const map = {}
    filteredCalendario.forEach(ev => {
      const d = ev.data
      if (!d) return
      const key = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.split('T')[0] : new Date(d).toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  })() : {}

  const contagemTiposCalendario = temCalendario && filteredBySexo.length > 0 ? {
    chegadas: filteredBySexo.filter(r => (r.tipo || '') === 'Chegada de Receptora').length,
    dg: filteredBySexo.filter(r => (r.tipo || '') === 'Diagnóstico de Gestação').length,
    partos: filteredBySexo.filter(r => (r.tipo || '') === 'Parto Previsto').length,
    andrologico: filteredBySexo.filter(r => (r.tipo || '') === 'Refazer Exame Andrológico').length,
    total: filteredBySexo.length
  } : null

  const getMonthDays = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startWeekday = firstDay.getDay()
    const days = []
    for (let i = 0; i < startWeekday; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  }

  const refetch = useCallback(() => {
    if (!selectedTipo) return
    setLoadingData(true)
    const params = new URLSearchParams({ tipo: selectedTipo, startDate: period.startDate, endDate: period.endDate })
    fetch(`/api/mobile-reports?${params}`)
      .then(r => r.json())
      .then(d => { 
        if (d.success && d.data) {
          setReportData(d.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [selectedTipo, period.startDate, period.endDate])

  const dadosParaExibir = temCalendario ? filteredCalendario : filteredBySexo
  const totalRegistros = searchQuery.trim() || (temCalendario && tipoFiltroCalendario) ? dadosParaExibir.length : (reportData?.total ?? filteredBySexo.length)

  // Insights inteligentes gerados dos dados
  const insights = (() => {
    const list = []
    const r = resumo
    const dados = dadosParaExibir

    if (selectedTipo === 'resumo_pesagens' && dadosGraficoPiquete.length > 0) {
      const comPeso = dadosGraficoPiquete.map(r => ({
        nome: (r.Piquete || r.piquete || '').replace(/PROJETO\s*/i, 'P'),
        media: parseFloat(String(r['Média Peso (kg)'] ?? r.mediaPeso ?? 0).replace(',', '.')) || 0,
        animais: r.Animais ?? r.animais ?? 0
      })).filter(x => x.media > 0)
      if (comPeso.length > 0) {
        const maior = comPeso.reduce((a, b) => a.media > b.media ? a : b)
        const menor = comPeso.reduce((a, b) => a.media < b.media ? a : b)
        list.push({ icon: '📈', text: `Maior média: ${maior.nome} com ${maior.media.toFixed(1)} kg` })
        if (maior.nome !== menor.nome) list.push({ icon: '📉', text: `Menor média: ${menor.nome} com ${menor.media.toFixed(1)} kg` })
        const totalAnimais = comPeso.reduce((s, x) => s + x.animais, 0)
        if (totalAnimais > 0) list.push({ icon: '🐄', text: `${totalAnimais} animais distribuídos em ${comPeso.length} piquete(s)` })
      }
    }

    if (selectedTipo === 'resumo_femeas_ia' && totalIA > 0) {
      const taxa = (prenhas / totalIA) * 100
      if (taxa >= 50) list.push({ icon: '🎉', text: `Taxa de prenhez em destaque: ${taxa.toFixed(1)}%` })
      else if (taxa < 30) list.push({ icon: '💡', text: `Considere revisar estratégia de IA: ${taxa.toFixed(1)}% de prenhez` })
      list.push({ icon: '📊', text: `${prenhas} de ${totalIA} fêmeas prenhas no período` })
    }

    if (selectedTipo === 'nascimentos' && dados.length > 0) {
      const total = machos + femeas
      if (total > 0) {
        const pctM = ((machos / total) * 100).toFixed(0)
        list.push({ icon: '📋', text: `${total} nascimento(s): ${machos} machos (${pctM}%) e ${femeas} fêmeas` })
      }
    }

    if (selectedTipo === 'pesagens' && dados.length > 0) {
      const total = dados.length
      const comPeso = dados.filter(r => r.peso != null && parseFloat(r.peso) > 0)
      if (comPeso.length > 0) {
        const media = comPeso.reduce((s, r) => s + parseFloat(r.peso), 0) / comPeso.length
        list.push({ icon: '⚖️', text: `${total} pesagem(s) registrada(s) no período` })
        list.push({ icon: '📊', text: `Peso médio geral: ${media.toFixed(1)} kg` })
      }
    }

    if ((selectedTipo === 'inseminacoes' || selectedTipo === 'femeas_ia') && dados.length > 0) {
      const porTouro = {}
      dados.forEach(r => {
        const t = (r.touro || 'Não informado').trim() || 'Não informado'
        porTouro[t] = (porTouro[t] || 0) + 1
      })
      const top = Object.entries(porTouro).sort(([, a], [, b]) => b - a)[0]
      if (top) list.push({ icon: '🐂', text: `Touro mais usado: ${top[0]} com ${top[1]} IA(s)` })
    }

    if (selectedTipo === 'estoque_semen' && dados.length > 0) {
      const totalDoses = dados.reduce((s, r) => s + (Number(r.quantidade) || 0), 0)
      list.push({ icon: '📦', text: `${totalDoses} dose(s) em estoque total` })
      const touros = new Set(dados.map(r => (r.touro || '').trim()).filter(Boolean)).size
      list.push({ icon: '🐂', text: `${touros} touro(s) no catálogo` })
    }

    if (selectedTipo === 'calendario_reprodutivo' && dados.length > 0) {
      const porTipo = {}
      const porMes = {}
      dados.forEach(r => {
        const t = (r.tipo || 'Outros').trim() || 'Outros'
        porTipo[t] = (porTipo[t] || 0) + 1
        const d = r.data || ''
        if (d) {
          const mesAno = d.substring(0, 7)
          porMes[mesAno] = (porMes[mesAno] || 0) + 1
        }
      })
      const top = Object.entries(porTipo).sort(([, a], [, b]) => b - a)[0]
      const partos = porTipo['Parto Previsto'] || contagemTiposCalendario?.partos || 0
      list.push({ icon: '📅', text: `${dados.length} evento(s) no calendário` })
      if (partos > 0) list.push({ icon: '🐄', text: `${partos} parto(s) previsto(s) no período` })
      if (Object.keys(porMes).length > 0) {
        const mesesComEventos = Object.keys(porMes).length
        list.push({ icon: '📆', text: `${mesesComEventos} mês(es) com eventos` })
      }
      if (top) list.push({ icon: '📌', text: `${top[0]}: ${top[1]} evento(s)` })
    }

    if (selectedTipo === 'previsoes_parto' && dados.length > 0) {
      const res = reportData?.resumo || {}
      const total = res['Total de previsões'] ?? dados.length
      if (total > 0) list.push({ icon: '🤰', text: `${total} previsão(ões) de parto no período` })
      const porTouro = res['Prenhas por touro']
      if (porTouro && porTouro !== '-') list.push({ icon: '🐂', text: `Por touro: ${String(porTouro).substring(0, 80)}${String(porTouro).length > 80 ? '...' : ''}` })
    }

    return list
  })()

  const DICAS_POR_TIPO = {
    resumo_pesagens: 'Compare a média entre piquetes para identificar lotes que precisam de atenção.',
    pesagens: 'Use o gráfico de evolução para acompanhar a frequência de pesagens.',
    resumo_femeas_ia: 'Taxa acima de 50% indica boa eficiência reprodutiva.',
    inseminacoes: 'O touro mais usado pode indicar preferência ou disponibilidade.',
    nascimentos: 'A proporção macho/fêmea ajuda no planejamento do rebanho.',
    estoque_semen: 'Mantenha estoque para os touros mais utilizados.',
    gestacoes: 'Acompanhe gestações atrasadas para intervenções.',
    previsoes_parto: 'Resumo por touro: quantas prenhas cada touro gerou. Ajuste as datas para ver partos previstos no período.',
    mortes: 'Analise causas para prevenir futuras perdas.',
    calendario_reprodutivo: 'Eventos manuais, receptoras, partos previstos e refazer andrológico. Veja meses com eventos e quantidade de parições.'
  }
  const dicaAtual = selectedTipo ? DICAS_POR_TIPO[selectedTipo] : null

  const handleShareSummary = async () => {
    try {
      setSharing(true)
      const titulo = `Relatório: ${selectedTipo || 'Geral'}`
      const resumoTxt = reportData?.resumo && typeof reportData.resumo === 'object'
        ? Object.entries(reportData.resumo).map(([k, v]) => `${k}: ${v}`).join('\n')
        : null
      const texto = [
        titulo,
        `Período: ${period.startDate} a ${period.endDate}`,
        `Registros: ${totalRegistros}`,
        resumoTxt ? `Resumo:\n${resumoTxt}` : null
      ].filter(Boolean).join('\n')
      if (navigator.share) {
        await navigator.share({ title: titulo, text: texto })
      } else {
        await navigator.clipboard.writeText(texto)
        alert('Resumo copiado')
      }
    } catch (e) {
    } finally {
      setSharing(false)
    }
  }
  const exportCSV = () => {
    const rows = dadosParaExibir
    if (!rows.length) return
    const cols = Object.keys(rows[0]).filter(k => k !== '_resumo')
    const csv = [
      cols.join(';'),
      ...rows.map(r => cols.map(k => {
        const v = r[k]
        const s = k.toLowerCase().includes('data') && v ? formatDate(v) : String(v ?? '')
        return `"${s.replace(/"/g, '""')}"`
      }).join(';'))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${selectedTipo || 'geral'}-${period.startDate}_a_${period.endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head>
        <title>Relatórios | Beef-Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pb-24">
        <div className="sticky top-0 z-10 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700 shadow-sm px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            {selectedTipo ? (
              <button
                onClick={() => setSelectedTipo(null)}
                className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium"
              >
                <ArrowLeftIcon className="h-6 w-6" />
                Voltar
              </button>
            ) : (
              <Link
                href="/a"
                className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium"
              >
                <ArrowLeftIcon className="h-6 w-6" />
                Voltar
              </Link>
            )}
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-amber-500" />
              {selectedTipo ? (
                <span className="truncate max-w-[180px]">
                  {allTypes.find(t => t.key === selectedTipo)?.label || 'Relatório'}
                </span>
              ) : (
                <span>Relatórios</span>
              )}
            </h1>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : !selectedTipo ? (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-2"
              >
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent">
                  Beef-Sync Relatórios
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Gestão completa do rebanho na palma da mão
                </p>
              </motion.div>

              {/* Dashboard / Visão Geral - KPIs rápidos */}
              {dashboardData?.data?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Visão Geral</span>
                    <button
                      onClick={() => setSelectedTipo('resumo_geral')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Ver completo →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {dashboardData.data.slice(0, 4).map((mod, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * i }}
                        onClick={() => setSelectedTipo('resumo_geral')}
                        className="p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{mod.modulo}</p>
                        <div className="space-y-1">
                          {Object.entries(mod.dados || {}).slice(0, 2).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-baseline gap-2">
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{k}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              {tiposHabilitados.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                  <p className="text-amber-800 dark:text-amber-200">
                    Nenhum relatório habilitado para mobile. Configure em Monitoramento &gt; Acessos.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Acesso Rápido - Relatórios mais usados */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <SparklesIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acesso Rápido</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['resumo_geral', 'previsoes_parto', 'calendario_reprodutivo', 'ranking_pmgz'].filter(k => enabledReports.includes(k)).map((id, i) => {
                        const tipo = allTypes.find(t => t.key === id)
                        if (!tipo) return null
                        const Icon = ICONE_POR_CATEGORIA[tipo.category] || ChartBarIcon
                        return (
                          <motion.button
                            key={id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedTipo(id)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-900/10 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md transition-all text-left"
                          >
                            <div className="p-2 rounded-lg bg-amber-200/50 dark:bg-amber-800/50">
                              <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{tipo.label.replace(/^[📊📅🏆]\s*/, '')}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card especial para Boletim Defesa */}
                  <Link href="/boletim-defesa/mobile">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 dark:from-teal-600 dark:to-teal-800 border-2 border-teal-400 dark:border-teal-500 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-white/20 backdrop-blur shadow-inner">
                            <DocumentTextIcon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">Boletim Defesa</p>
                            <p className="text-teal-100 text-sm">Quantidades de gado por faixa etária</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-6 w-6 text-white opacity-90" />
                      </div>
                    </motion.div>
                  </Link>

                  {recentIds.filter(id => !['resumo_geral', 'previsoes_parto', 'calendario_reprodutivo', 'ranking_pmgz'].includes(id)).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Acessados recentemente</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentIds.filter(id => !['resumo_geral', 'previsoes_parto', 'calendario_reprodutivo', 'ranking_pmgz'].includes(id)).map(id => {
                          const tipo = allTypes.find(t => t.key === id)
                          if (!tipo || !enabledReports.includes(id)) return null
                          const Icon = ICONE_POR_CATEGORIA[tipo.category] || DocumentTextIcon
                          return (
                            <motion.button
                              key={id}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedTipo(id)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium"
                            >
                              <Icon className="h-4 w-4" />
                              {tipo.label}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <ChartBarIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Todos os Relatórios</span>
                    </div>
                  {Object.entries(porCategoria).map(([cat, tipos]) => {
                    const CatIcon = ICONE_POR_CATEGORIA[cat] || DocumentTextIcon
                    const ACESSO_RAPIDO_KEYS = ['resumo_geral', 'previsoes_parto', 'calendario_reprodutivo', 'ranking_pmgz']
                    const tiposFiltrados = tipos.filter(t => !ACESSO_RAPIDO_KEYS.includes(t.key))
                    if (tiposFiltrados.length === 0) return null
                    return (
                      <div key={cat} className="mb-6">
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <CatIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{cat}</span>
                        </div>
                        <div className="space-y-2">
                          {tiposFiltrados.map((tipo, i) => {
                            const Icon = ICONE_POR_CATEGORIA[tipo.category] || DocumentTextIcon
                            return (
                              <motion.button
                                key={tipo.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectedTipo(tipo.key)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg shadow-sm transition-all text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                                    <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{tipo.label}</p>
                                </div>
                                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  </div>

                  {/* Rodapé */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
                  >
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Beef-Sync • Gestão inteligente de rebanho
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 opacity-75">
                      Exporte relatórios em CSV ou compartilhe com sua equipe
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTipo(null)}
                    className="text-sm text-amber-600 dark:text-amber-400 font-medium"
                  >
                    ← Voltar
                  </button>
                  {reportData && totalRegistros >= 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={refetch}
                    disabled={loadingData}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Atualizar"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {hasSexo && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <FunnelIcon className="h-4 w-4" /> Sexo
                  </span>
                  <button
                    onClick={() => setSexoFilter('todos')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${sexoFilter === 'todos' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSexoFilter('M')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${sexoFilter === 'M' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Machos
                  </button>
                  <button
                    onClick={() => setSexoFilter('F')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${sexoFilter === 'F' ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    Fêmeas
                  </button>
                </div>
              )}

              {loadingData && (
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              )}
              {!loadingData && reportData && (
                <div className="space-y-4">
                  {(temGraficos || temCalendario) && (
                    <div className="flex gap-2 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-inner">
                      {temCalendario ? (
                        <>
                          <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'calendar' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                          >
                            📅 Calendário
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'table' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                          >
                            📋 Tabela
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setViewMode('charts')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'charts' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                          >
                            📊 Gráficos
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'table' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                          >
                            📋 Tabela
                          </button>
                        </>
                      )}
                    </div>
                  )}


                  {ehResumoGeral && (
                    <div className="space-y-4">
                      {reportData?.data?.map((mod, i) => {
                         const ModIcon = mod.modulo === 'Rebanho' ? UserGroupIcon :
                           mod.modulo === 'Reprodução' ? HeartIcon :
                           mod.modulo === 'Peso' ? ScaleIcon :
                           mod.modulo === 'Financeiro' ? BanknotesIcon :
                           mod.modulo === 'Custos' ? BanknotesIcon :
                           mod.modulo === 'Vendas' ? CurrencyDollarIcon :
                           mod.modulo === 'Sanidade' ? SparklesIcon :
                           ChartBarIcon
                         return (
                           <motion.div
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                           >
                             <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                 <ModIcon className="h-6 w-6" />
                               </div>
                               <h3 className="font-bold text-lg text-gray-900 dark:text-white">{mod.modulo}</h3>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                               {Object.entries(mod.dados || {}).map(([label, val], j) => (
                                 <div key={j} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                   <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mb-1">{label}</p>
                                   <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{val}</p>
                       </div>
                     ))}
                   </div>
                 </motion.div>
               )
            })}
            
            {(chartResumoIdade || chartResumoSexo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {chartResumoIdade && chartResumoIdade.datasets[0].data.some(v => v > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                     <div className="flex items-center gap-2 mb-4">
                       <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                         <ChartBarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                       </div>
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white">Distribuição por Idade</h3>
                     </div>
                     <div className="h-64 relative">
                       <Doughnut data={chartResumoIdade} options={pieOptions} />
                     </div>
                  </motion.div>
                )}
                
                {chartResumoSexo && chartResumoSexo.datasets[0].data.some(v => v > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                     <div className="flex items-center gap-2 mb-4">
                       <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                         <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                       </div>
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white">Distribuição por Sexo</h3>
                     </div>
                     <div className="h-64 relative">
                       <Doughnut data={chartResumoSexo} options={pieOptions} />
                     </div>
                  </motion.div>
                )}
              </div>
            )}

            {reportData?.resumo?.erro && (
                         <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl text-center text-sm font-medium border border-red-100 dark:border-red-800">
                           {reportData.resumo.erro}
                         </div>
                      )}
                    </div>
                  )}

                  {temCalendario && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <FunnelIcon className="h-4 w-4" /> Tipo
                      </span>
                      <select
                        value={tipoFiltroCalendario || ''}
                        onChange={e => setTipoFiltroCalendario(e.target.value || '')}
                        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="Chegada de Receptora">Chegada de Receptora</option>
                        <option value="Diagnóstico de Gestação">DG Agendado</option>
                        <option value="Parto Previsto">Parto Previsto</option>
                        <option value="Refazer Exame Andrológico">Refazer Andrológico</option>
                      </select>
                    </div>
                  )}

                  {temCalendario && contagemTiposCalendario && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <button
                        onClick={() => {
                          setTipoFiltroCalendario(tipoFiltroCalendario === 'Chegada de Receptora' ? '' : 'Chegada de Receptora')
                          setViewMode('table')
                        }}
                        className={`p-3 rounded-xl border transition-all active:scale-95 ${
                          tipoFiltroCalendario === 'Chegada de Receptora'
                            ? 'bg-blue-100 dark:bg-blue-800/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30'
                        }`}
                      >
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Chegadas</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{contagemTiposCalendario.chegadas}</p>
                      </button>
                      <button
                        onClick={() => {
                          setTipoFiltroCalendario(tipoFiltroCalendario === 'Diagnóstico de Gestação' ? '' : 'Diagnóstico de Gestação')
                          setViewMode('table')
                        }}
                        className={`p-3 rounded-xl border transition-all active:scale-95 ${
                          tipoFiltroCalendario === 'Diagnóstico de Gestação'
                            ? 'bg-yellow-100 dark:bg-yellow-800/40 border-yellow-400 dark:border-yellow-600 ring-2 ring-yellow-400'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
                        }`}
                      >
                        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">DG Agendados</p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{contagemTiposCalendario.dg}</p>
                      </button>
                      <button
                        onClick={() => {
                          setTipoFiltroCalendario(tipoFiltroCalendario === 'Parto Previsto' ? '' : 'Parto Previsto')
                          setViewMode('table')
                        }}
                        className={`p-3 rounded-xl border transition-all active:scale-95 ${
                          tipoFiltroCalendario === 'Parto Previsto'
                            ? 'bg-green-100 dark:bg-green-800/40 border-green-400 dark:border-green-600 ring-2 ring-green-400'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30'
                        }`}
                      >
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Partos Previstos</p>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">{contagemTiposCalendario.partos}</p>
                      </button>
                      <button
                        onClick={() => {
                          setTipoFiltroCalendario(tipoFiltroCalendario === 'Refazer Exame Andrológico' ? '' : 'Refazer Exame Andrológico')
                          setViewMode('table')
                        }}
                        className={`p-3 rounded-xl border transition-all active:scale-95 ${
                          tipoFiltroCalendario === 'Refazer Exame Andrológico'
                            ? 'bg-orange-100 dark:bg-orange-800/40 border-orange-400 dark:border-orange-600 ring-2 ring-orange-400'
                            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-800/30'
                        }`}
                      >
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Refazer Andrológico</p>
                        <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{contagemTiposCalendario.andrologico}</p>
                      </button>
                      <button
                        onClick={() => setTipoFiltroCalendario('')}
                        className={`p-3 rounded-xl border transition-all col-span-2 sm:col-span-1 active:scale-95 ${
                          !tipoFiltroCalendario
                            ? 'bg-purple-100 dark:bg-purple-800/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400'
                            : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30'
                        }`}
                      >
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Total</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{contagemTiposCalendario.total}</p>
                      </button>
                    </div>
                  )}

                  {insights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-gradient-to-br from-violet-50 to-amber-50 dark:from-violet-900/20 dark:to-amber-900/20 border border-violet-200 dark:border-violet-800 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="h-5 w-5 text-violet-500" />
                        <span className="text-sm font-semibold text-violet-800 dark:text-violet-300">Resumo Inteligente</span>
                      </div>
                      <ul className="space-y-2">
                        {insights.map((ins, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-lg">{ins.icon}</span>
                            <span>{ins.text}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {dicaAtual && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    >
                      <LightBulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">{dicaAtual}</p>
                    </motion.div>
                  )}

                  {reportData.resumo && typeof reportData.resumo === 'object' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <AnimatePresence>
                        {Object.entries(reportData.resumo).slice(0, 6).map(([k, v], i) => {
                          const isPeso = /peso|kg/i.test(k)
                          const isAnimais = /animais|machos|fêmeas|total|piquetes/i.test(k)
                          const isTaxa = /taxa|prenhez/i.test(k)
                          const cardCls = isPeso ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800' :
                            isAnimais ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800' :
                            isTaxa ? 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800' :
                            'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-gray-200 dark:border-gray-700'
                          const valCls = isPeso ? 'text-amber-700 dark:text-amber-300' :
                            isAnimais ? 'text-blue-700 dark:text-blue-300' :
                            isTaxa ? 'text-green-700 dark:text-green-300' :
                            'text-gray-900 dark:text-white'
                          const icon = isPeso ? '⚖️' : isAnimais ? '🐄' : isTaxa ? '✅' : '📊'
                          const taxaNum = /taxa|prenhez/i.test(k) ? parseFloat(String(v).replace('%', '')) : null
                          const isDestaque = taxaNum != null && taxaNum >= 50
                          return (
                            <motion.div
                              key={k}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`p-4 rounded-xl border-2 shadow-sm relative overflow-hidden ${cardCls}`}
                            >
                              {isDestaque && (
                                <span className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-700 dark:text-green-400">
                                  ✓ Destaque
                                </span>
                              )}
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate flex-1">{k}</p>
                                <span className="text-base ml-1">{icon}</span>
                              </div>
                              <p className={`text-xl font-bold truncate ${valCls}`}>{String(v)}</p>
                              {taxaNum != null && (
                                <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, taxaNum)}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${taxaNum >= 50 ? 'bg-green-500' : taxaNum >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  />
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  {viewMode === 'calendar' && temCalendario && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                          </button>
                          <span className="text-base font-semibold text-gray-900 dark:text-white min-w-[140px] text-center capitalize">
                            {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <ChevronRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const today = new Date()
                            today.setDate(1)
                            setCalendarMonth(today)
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Hoje
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
                          <div key={d} className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase text-center py-1">
                            {d}
                          </div>
                        ))}
                        {getMonthDays(calendarMonth).map((d, idx) => {
                          if (!d) {
                            return <div key={`empty-${idx}`} className="aspect-square" />
                          }
                          const key = d.toISOString().split('T')[0]
                          const list = eventosPorDia[key] || []
                          const isSelected = selectedDate === key
                          const isToday = key === new Date().toISOString().split('T')[0]
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedDate(key)}
                              className={`aspect-square p-1 rounded-lg border text-left transition-colors flex flex-col ${
                                isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500' :
                                isToday ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' :
                                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className={`text-xs font-medium ${isSelected || isToday ? 'text-amber-700 dark:text-amber-300' : 'text-gray-900 dark:text-white'}`}>
                                {d.getDate()}
                              </span>
                              {list.length > 0 && (
                                <span className="mt-auto text-[10px] px-1 py-0.5 rounded-full bg-amber-500/80 text-white font-medium">
                                  {list.length}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {selectedDate && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <CalendarIcon className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(selectedDate)} — {(eventosPorDia[selectedDate] || []).length} evento(s)
                            </span>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(eventosPorDia[selectedDate] || []).map((ev, i) => {
                              const status = ev.status || 'Agendado'
                              const borderCls =
                                status === 'Concluído' || status === 'Prenha' ? 'border-l-green-500' :
                                status === 'Vazia' ? 'border-l-red-500' :
                                'border-l-amber-500'
                              return (
                                <div
                                  key={i}
                                  className={`pl-3 py-2 rounded-r-lg border-l-4 bg-gray-50 dark:bg-gray-700/50 ${borderCls}`}
                                >
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {ev.titulo || ev.tipo || 'Evento'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {ev.tipo} {ev.animal ? `• ${ev.animal}` : ''}
                                  </p>
                                  {(ev.numero_nf || ev.fornecedor) && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                      {ev.numero_nf ? `NF ${ev.numero_nf}` : ''} {ev.fornecedor ? `• ${ev.fornecedor}` : ''}
                                    </p>
                                  )}
                                  {ev.descricao && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ev.descricao}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {viewMode === 'charts' && temGraficos && (
                    <div className="space-y-4">
                      {chartPrenhez && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Taxa de Prenhez</p>
                          <div className="h-48">
                            <Doughnut data={chartPrenhez} options={pieOptions} />
                          </div>
                        </motion.div>
                      )}
                      {chartSexo && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribuição por Sexo</p>
                          <div className="h-48">
                            <Doughnut data={chartSexo} options={pieOptions} />
                          </div>
                        </motion.div>
                      )}

                      {chartBarPiquete && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Animais por Piquete</p>
                          <div className="h-56">
                            <Bar data={chartBarPiquete} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {chartPesoPiquete && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Peso Médio por Piquete (kg)</p>
                          <div className="h-56">
                            <Bar data={chartPesoPiquete} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {pesagensPorData && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pesagens ao longo do tempo</p>
                          <div className="h-48">
                            <Line data={pesagensPorData} options={lineChartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {inseminacoesPorTouro && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Inseminações por Touro</p>
                          <div className="h-56">
                            <Bar data={inseminacoesPorTouro} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {estoquePorTouro && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Estoque de Sêmen por Touro</p>
                          <div className="h-56">
                            <Bar data={estoquePorTouro} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {nascimentosPorMes && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nascimentos por Mês</p>
                          <div className="h-56">
                            <Bar data={nascimentosPorMes} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {nitrogenioEvolution && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Evolução de Abastecimento</p>
                          <div className="h-48">
                            <Line data={nitrogenioEvolution} options={lineChartOptions} />
                          </div>
                        </motion.div>
                      )}

                      {nitrogenioByDriver && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🚚 Abastecimento por Motorista</p>
                          <div className="h-56">
                            <Bar data={nitrogenioByDriver} options={chartOptions} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {(viewMode === 'table' || (!temGraficos && !temCalendario && !ehResumoGeral)) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                    >
                      <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
                        {dadosParaExibir.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                              <tr>
                                {reportData.data?.find(d => !d._resumo) && Object.keys(reportData.data.find(d => !d._resumo)).filter(c => c !== '_resumo' && c !== 'animal_id').map(col => (
                                  <th key={col} className="px-3 py-2.5 text-left text-gray-600 dark:text-gray-400 font-medium">
                                    {ehRanking ? (LABELS_RANKING[col] || col) : col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dadosParaExibir.map((row, i) => (
                                <tr 
                                  key={i} 
                                  onClick={() => {
                                    if (row.animal_id) {
                                      router.push(`/animals/${row.animal_id}`)
                                    }
                                  }}
                                  className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${row.animal_id ? 'cursor-pointer' : ''}`}
                                >
                                  {Object.entries(row).filter(([k]) => k !== '_resumo' && k !== 'animal_id').map(([k, v]) => {
                                    let display = k.toLowerCase().includes('data') && v ? formatDate(v) : String(v ?? '-')
                                    if (ehRanking && k === 'posicao' && [1, 2, 3].includes(Number(v))) {
                                      const trofeus = { 1: '🥇', 2: '🥈', 3: '🥉' }
                                      display = `${trofeus[Number(v)]} ${v}º`
                                    }
                                    return (
                                      <td key={k} className="px-3 py-2 text-gray-900 dark:text-white">
                                        {display}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-12 text-center">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4"
                            >
                              <span className="text-4xl">📋</span>
                            </motion.div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              {searchQuery.trim() ? 'Nenhum registro encontrado' : 'Nenhum registro no período'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {searchQuery.trim() ? 'Tente outro termo de busca' : 'Ajuste as datas ou selecione outro relatório'}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              {!loadingData && !reportData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center"
                >
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-red-700 dark:text-red-300 font-medium">Erro ao carregar relatório</p>
                  <button
                    onClick={refetch}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {selectedTipo && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
              <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedTipo(null)}
                  className="flex items-center justify-center gap-1 py-3 rounded-xl bg-amber-600 dark:bg-amber-500 text-white font-semibold text-sm"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Voltar
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center justify-center gap-1 py-3 rounded-xl bg-gray-600 dark:bg-gray-500 text-white font-semibold text-sm"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Exportar
                </button>
                <button
                  onClick={handleShareSummary}
                  disabled={sharing}
                  className="flex items-center justify-center gap-1 py-3 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sharing ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Compartilhando
                    </>
                  ) : (
                    <>
                      <ShareIcon className="h-5 w-5" />
                      Compartilhar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
