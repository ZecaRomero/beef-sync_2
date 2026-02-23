import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// Hooks customizados
import useContabilidade from '../../hooks/useContabilidade'
import useRecipients from '../../hooks/useRecipients'

// Utilitários
import {
  downloadBoletimGado,
  enviarPorEmail,
  enviarPorWhatsApp,
  downloadNotasFiscais,
  sendAllReports
} from '../../utils/contabilidadeUtils'

// Componentes UI
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  TableCellsIcon,
  PencilIcon,
  TrashIcon
} from '../../components/ui/Icons'
import Button from '../../components/ui/Button'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ModernLayout from '../../components/ui/ModernLayout'
import StatsCard from '../../components/ui/StatsCard'
import ModernCard, { ModernCardHeader, ModernCardBody } from '../../components/ui/ModernCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Toast from '../../components/ui/SimpleToast'

// Componentes específicos da contabilidade
import ReportCard from '../../components/contabilidade/ReportCard'
import RecipientsList from '../../components/contabilidade/RecipientsList'
import ResumoBoletim from '../../components/contabilidade/ResumoBoletim'

export default function Contabilidade() {
  const router = useRouter()
  
  // Estados básicos
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Estados de dados
  const [reportStats, setReportStats] = useState({
    totalAnimals: 0,
    nfsEntradas: 0,
    nfsSaidas: 0,
    movimentacoes: 0
  })
  
  const [animaisData, setAnimaisData] = useState([])
  const [nfsEntradasData, setNfsEntradasData] = useState([])
  const [nfsSaidasData, setNfsSaidasData] = useState([])
  const [resumosBoletins, setResumosBoletins] = useState({
    santAnna: null,
    pardinho: null
  })
  
  // Estados de UI
  const [showAddRecipient, setShowAddRecipient] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState(null)
  const [showGraficos, setShowGraficos] = useState(false)
  const [graficosData, setGraficosData] = useState(null)
  
  // Estados de formulários
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    // Usar primeiro dia do ano até o último dia do mês atual para incluir todas as NFs do ano
    const firstDay = new Date(now.getFullYear(), 0, 1) // 1º de janeiro
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Último dia do mês atual
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    }
  })
  
  const [recipients, setRecipients] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [selectedReports, setSelectedReports] = useState(['boletim', 'notasFiscais', 'movimentacoes']) // Padrão: principais relatórios
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    whatsapp: '',
    role: 'Contador'
  })
  
  // Relatórios disponíveis
  const availableReports = [
    { id: 'boletim', name: 'Boletim de Gado', description: 'Relatório detalhado do rebanho' },
    { id: 'notasFiscais', name: 'Notas Fiscais', description: 'Entradas e saídas do período' },
    { id: 'movimentacoes', name: 'Movimentações', description: 'Movimentações do mês' },
    { id: 'nascimentos', name: 'Nascimentos', description: 'Registro de nascimentos do período' },
    { id: 'mortes', name: 'Mortes', description: 'Registro de mortes do período' }
  ]

  // Carregar dados na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadStats()
        loadRecipients()
        await loadResumosBoletins()
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
        setError('Erro ao carregar dados do sistema')
      }
    }
    
    loadData()
  }, [])

  // Carregar resumos quando o período mudar
  useEffect(() => {
    if (period?.startDate && period?.endDate) {
      loadResumosBoletins()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period?.startDate, period?.endDate])

  // Função auxiliar para fazer requisições com timeout e retry
  const fetchWithTimeout = async (url, options = {}, timeout = 10000, retries = 2) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (retries > 0 && (error.name === 'AbortError' || error.message.includes('500'))) {
        console.log(`Tentando novamente... (${retries} tentativas restantes)`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar 1 segundo
        return fetchWithTimeout(url, options, timeout, retries - 1)
      }
      throw error
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null) // Limpar erros anteriores
      
      // Carregar animais com timeout e retry
      try {
        const animalsResponse = await fetchWithTimeout('/api/animals')
        if (animalsResponse.ok) {
          const animalsData = await animalsResponse.json()
          const animals = Array.isArray(animalsData) ? animalsData : (animalsData.data || [])
          setAnimaisData(animals)
          
          setReportStats(prev => ({
            ...prev,
            totalAnimals: animals.length
          }))
        } else {
          console.warn('Erro ao carregar animais:', animalsResponse.status)
        }
      } catch (animalError) {
        console.error('Erro ao carregar animais:', animalError)
        // Não falhar completamente, apenas logar o erro
      }
      
      // Carregar notas fiscais com timeout e retry
      try {
        const nfsResponse = await fetchWithTimeout('/api/notas-fiscais')
        if (nfsResponse.ok) {
          const nfsData = await nfsResponse.json()
          const entradas = nfsData.data?.filter(nf => nf.tipo === 'entrada') || []
          const saidas = nfsData.data?.filter(nf => nf.tipo === 'saida') || []
          
          setNfsEntradasData(entradas)
          setNfsSaidasData(saidas)
          
          setReportStats(prev => ({
            ...prev,
            nfsEntradas: entradas.length,
            nfsSaidas: saidas.length,
            movimentacoes: entradas.length + saidas.length
          }))
        } else {
          console.warn('Erro ao carregar notas fiscais:', nfsResponse.status)
        }
      } catch (nfError) {
        console.error('Erro ao carregar notas fiscais:', nfError)
        // Não falhar completamente, apenas logar o erro
      }
      
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error)
      setError('Erro ao carregar dados do sistema. Tente recarregar a página.')
    } finally {
      setLoading(false)
    }
  }

  // Carregar resumos dos boletins
  const loadResumosBoletins = async () => {
    try {
      const periodParam = `${period.startDate},${period.endDate}`
      const response = await fetchWithTimeout(`/api/contabilidade/resumo-boletins?period=${periodParam}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Resumos recebidos da API:', {
          santAnna: data.santAnna,
          pardinho: data.pardinho
        })
        
        // Log detalhado do resumo Pardinho
        if (data.pardinho) {
          console.log('🎯 Resumo Pardinho detalhado:', {
            total: data.pardinho.total,
            porSexo: data.pardinho.porSexo,
            porEra: data.pardinho.porEra,
            porRaca: data.pardinho.porRaca
          })
          
          // Verificar se há dados mas total é 0
          const temFemeas = data.pardinho.porSexo?.femeas > 0
          const temMachos = data.pardinho.porSexo?.machos > 0
          const temEras = data.pardinho.porEra && Object.values(data.pardinho.porEra).some(v => v > 0)
          
          console.log('🔍 Validação Pardinho:', {
            total: data.pardinho.total,
            temFemeas,
            temMachos,
            temEras,
            porSexo: data.pardinho.porSexo,
            porEra: data.pardinho.porEra
          })
          
          if ((temFemeas || temMachos || temEras) && data.pardinho.total === 0) {
            console.warn('⚠️ PROBLEMA DETECTADO: Há animais mas total é 0! Corrigindo...')
            // Corrigir o total se necessário
            if (!data.pardinho.total && (temFemeas || temMachos)) {
              data.pardinho.total = (data.pardinho.porSexo?.femeas || 0) + (data.pardinho.porSexo?.machos || 0)
              console.log('✅ Total corrigido para:', data.pardinho.total)
            }
          }
        } else {
          console.error('❌ Resumo Pardinho está null ou undefined!')
        }
        
        setResumosBoletins({
          santAnna: data.santAnna || null,
          pardinho: data.pardinho || null
        })
      } else {
        console.error('❌ Erro na resposta da API:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Detalhes do erro:', errorText)
        setError(`Erro ao carregar resumos: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar resumos dos boletins:', error)
      setError('Erro ao carregar resumos dos boletins. Tente novamente.')
    }
  }

  // Gerenciar destinatários
  const loadRecipients = () => {
    const saved = localStorage.getItem('contabilidadeRecipients')
    if (saved) {
      setRecipients(JSON.parse(saved))
    }
  }

  const saveRecipients = (newRecipients) => {
    localStorage.setItem('contabilidadeRecipients', JSON.stringify(newRecipients))
    setRecipients(newRecipients)
  }

  const addRecipient = () => {
    if (!newRecipient.name || (!newRecipient.email && !newRecipient.whatsapp)) {
      alert('⚠️ Nome e Email ou WhatsApp são obrigatórios')
      return
    }

    const recipient = {
      id: Date.now().toString(),
      ...newRecipient
    }

    const updatedRecipients = [...recipients, recipient]
    saveRecipients(updatedRecipients)
    setNewRecipient({ name: '', email: '', whatsapp: '', role: 'Contador' })
    setShowAddRecipient(false)
    alert('✅ Destinatário adicionado com sucesso!')
  }

  const removeRecipient = (recipientId) => {
    const updatedRecipients = recipients.filter(r => r.id !== recipientId)
    saveRecipients(updatedRecipients)
    setSelectedRecipients(prev => prev.filter(id => id !== recipientId))
    alert('✅ Destinatário removido com sucesso!')
  }

  const handleRecipientToggle = (recipientId) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  const handleReportToggle = (reportId) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  // Função auxiliar compartilhada para garantir dados primitivos limpos
  const cleanPeriodData = () => {
    const cleanData = (data) => {
      if (data === null || data === undefined) return null
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return data
      }
      if (data instanceof Date) {
        return data.toISOString().split('T')[0]
      }
      return String(data)
    }
    
    const startDate = cleanData(period?.startDate) || ''
    const endDate = cleanData(period?.endDate) || ''
    
    return {
      startDate: String(startDate),
      endDate: String(endDate)
    }
  }

  // Handlers para relatórios
  const handleDownloadBoletim = (sendToAccounting = false) => {
    downloadBoletimGado(period, animaisData, sendToAccounting, setLoading)
  }

  const handleDownloadBoletimPardinho = async (sendToAccounting = false) => {
    try {
      setLoading(true)
      
      // Criar objeto limpo apenas com os dados necessários (garantir que são strings primitivas)
      const periodData = cleanPeriodData()
      
      // Garantir que sendToAccounting seja um booleano primitivo
      const sendToAccountingValue = Boolean(sendToAccounting)
      
      // Validar dados antes de enviar
      if (!periodData.startDate || !periodData.endDate) {
        throw new Error('Período inválido. Por favor, selecione as datas corretamente.')
      }
      
      const requestBody = { 
        period: periodData, 
        sendToAccounting: sendToAccountingValue 
      }
      
      // Verificar se o JSON pode ser serializado antes de enviar
      try {
        JSON.stringify(requestBody)
      } catch (jsonError) {
        console.error('Erro ao serializar dados:', jsonError)
        throw new Error('Erro ao preparar dados para envio. Por favor, tente novamente.')
      }
      
      const response = await fetch('/api/contabilidade/boletim-pardinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao gerar boletim'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // Se não conseguir parsear o JSON, usar o status
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boletim-agropecuaria-pardinho-${periodData.startDate}-${periodData.endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      if (sendToAccounting) {
        Toast.success('✅ Boletim da AGROPECUÁRIA PARDINHO enviado para contabilidade!')
      } else {
        Toast.success('✅ Boletim da AGROPECUÁRIA PARDINHO gerado com sucesso!')
      }
    } catch (error) {
      console.error('Erro:', error)
      Toast.error(`❌ Erro: ${error.message || 'Não foi possível gerar o boletim'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarEmailPardinho = async () => {
    try {
      setLoading(true)
      
      // Criar objeto limpo apenas com os dados necessários (garantir que são strings primitivas)
      const periodData = cleanPeriodData()
      
      // Validar dados antes de enviar
      if (!periodData.startDate || !periodData.endDate) {
        throw new Error('Período inválido. Por favor, selecione as datas corretamente.')
      }
      
      // Buscar resumo do boletim Pardinho
      const periodParam = `${periodData.startDate},${periodData.endDate}`
      const resumoResponse = await fetch(`/api/contabilidade/resumo-boletins?period=${periodParam}`)
      
      let resumoText = ''
      if (resumoResponse.ok) {
        const resumos = await resumoResponse.json()
        const pardinho = resumos.pardinho || {}
        
        if (pardinho.total > 0) {
          resumoText = `
📊 RESUMO:
• Total: ${pardinho.total} animais
• Fêmeas: ${pardinho.porSexo?.femeas || 0}
• Machos: ${pardinho.porSexo?.machos || 0}

`
          
          // Adicionar detalhes por idade se houver
          const porEra = pardinho.porEra || {}
          const detalhesIdade = []
          
          if (porEra['femea_0-7'] > 0) detalhesIdade.push(`Fêmeas 0-7m: ${porEra['femea_0-7']}`)
          if (porEra['femea_7-12'] > 0) detalhesIdade.push(`Fêmeas 7-12m: ${porEra['femea_7-12']}`)
          if (porEra['femea_12-18'] > 0) detalhesIdade.push(`Fêmeas 12-18m: ${porEra['femea_12-18']}`)
          if (porEra['femea_18-24'] > 0) detalhesIdade.push(`Fêmeas 18-24m: ${porEra['femea_18-24']}`)
          if (porEra['femea_24+'] > 0) detalhesIdade.push(`Fêmeas 24+m: ${porEra['femea_24+']}`)
          
          if (porEra['macho_0-7'] > 0) detalhesIdade.push(`Machos 0-7m: ${porEra['macho_0-7']}`)
          if (porEra['macho_7-15'] > 0) detalhesIdade.push(`Machos 7-15m: ${porEra['macho_7-15']}`)
          if (porEra['macho_15-18'] > 0) detalhesIdade.push(`Machos 15-18m: ${porEra['macho_15-18']}`)
          if (porEra['macho_18-22'] > 0) detalhesIdade.push(`Machos 18-22m: ${porEra['macho_18-22']}`)
          if (porEra['macho_36+'] > 0) detalhesIdade.push(`Machos 36+m: ${porEra['macho_36+']}`)
          
          if (detalhesIdade.length > 0) {
            resumoText += `📋 Por Idade:
${detalhesIdade.map(d => `• ${d}`).join('\n')}

`
          }
        } else {
          resumoText = `
⚠️ Nenhum animal encontrado para este período.

`
        }
      }
      
      // Criar link de email usando dados limpos
      const assunto = encodeURIComponent(`Boletim AGROPECUÁRIA PARDINHO - ${periodData.startDate} até ${periodData.endDate}`)
      const corpo = encodeURIComponent(`🐄 BOLETIM AGROPECUÁRIA PARDINHO - BEEF SYNC

📅 Período: ${periodData.startDate} até ${periodData.endDate}
📊 Localidade: AGROPECUÁRIA PARDINHO LTDA

${resumoText}📎 Acesse o sistema para visualizar o relatório completo em Excel.

Gerado em: ${new Date().toLocaleString('pt-BR')}

Sistema Beef-Sync`)
      
      // Abrir cliente de email
      window.location.href = `mailto:?subject=${assunto}&body=${corpo}`
      
      Toast.success('✅ Email preparado! Preencha o destinatário e envie.')
    } catch (error) {
      console.error('Erro ao enviar por email:', error)
      Toast.error('❌ Erro ao preparar email')
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarWhatsAppPardinho = async () => {
    try {
      setLoading(true)
      
      // Criar objeto limpo apenas com os dados necessários (garantir que são strings primitivas)
      const periodData = cleanPeriodData()
      
      // Validar dados antes de enviar
      if (!periodData.startDate || !periodData.endDate) {
        throw new Error('Período inválido. Por favor, selecione as datas corretamente.')
      }
      
      // Buscar resumo do boletim Pardinho
      const periodParam = `${periodData.startDate},${periodData.endDate}`
      const resumoResponse = await fetch(`/api/contabilidade/resumo-boletins?period=${periodParam}`)
      
      let resumoText = ''
      if (resumoResponse.ok) {
        const resumos = await resumoResponse.json()
        const pardinho = resumos.pardinho || {}
        
        if (pardinho.total > 0) {
          resumoText = `📊 *Resumo:*
• Total: ${pardinho.total} animais
• Fêmeas: ${pardinho.porSexo?.femeas || 0}
• Machos: ${pardinho.porSexo?.machos || 0}

`
          
          // Adicionar detalhes por idade se houver
          const porEra = pardinho.porEra || {}
          const detalhesIdade = []
          
          if (porEra['femea_0-7'] > 0) detalhesIdade.push(`Fêmeas 0-7m: ${porEra['femea_0-7']}`)
          if (porEra['femea_7-12'] > 0) detalhesIdade.push(`Fêmeas 7-12m: ${porEra['femea_7-12']}`)
          if (porEra['femea_12-18'] > 0) detalhesIdade.push(`Fêmeas 12-18m: ${porEra['femea_12-18']}`)
          if (porEra['femea_18-24'] > 0) detalhesIdade.push(`Fêmeas 18-24m: ${porEra['femea_18-24']}`)
          if (porEra['femea_24+'] > 0) detalhesIdade.push(`Fêmeas 24+m: ${porEra['femea_24+']}`)
          
          if (porEra['macho_0-7'] > 0) detalhesIdade.push(`Machos 0-7m: ${porEra['macho_0-7']}`)
          if (porEra['macho_7-15'] > 0) detalhesIdade.push(`Machos 7-15m: ${porEra['macho_7-15']}`)
          if (porEra['macho_15-18'] > 0) detalhesIdade.push(`Machos 15-18m: ${porEra['macho_15-18']}`)
          if (porEra['macho_18-22'] > 0) detalhesIdade.push(`Machos 18-22m: ${porEra['macho_18-22']}`)
          if (porEra['macho_36+'] > 0) detalhesIdade.push(`Machos 36+m: ${porEra['macho_36+']}`)
          
          if (detalhesIdade.length > 0) {
            resumoText += `📋 *Por Idade:*
${detalhesIdade.map(d => `• ${d}`).join('\n')}

`
          }
        } else {
          resumoText = `⚠️ Nenhum animal encontrado para este período.

`
        }
      }

      // Criar mensagem para WhatsApp usando dados limpos
      const mensagem = `🐄 *BOLETIM AGROPECUÁRIA PARDINHO - BEEF SYNC*

📅 *Período:* ${periodData.startDate} até ${periodData.endDate}
📊 *Localidade:* AGROPECUÁRIA PARDINHO LTDA

${resumoText}📎 *Acesse o sistema para visualizar o relatório completo em Excel.*

Gerado em: ${new Date().toLocaleString('pt-BR')}

_Sistema Beef-Sync_`

      const mensagemEncoded = encodeURIComponent(mensagem)
      window.open(`https://wa.me/?text=${mensagemEncoded}`, '_blank')
      
      Toast.success('✅ WhatsApp aberto! Envie a mensagem.')
    } catch (error) {
      console.error('Erro ao enviar por WhatsApp:', error)
      Toast.error('❌ Erro ao preparar WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarEmail = () => {
    enviarPorEmail(period, animaisData, setLoading)
  }

  const handleEnviarWhatsApp = () => {
    enviarPorWhatsApp(period, animaisData, setLoading)
  }

  const handleDownloadNFs = () => {
    downloadNotasFiscais(period, setLoading)
  }

  const handleSendAllReports = () => {
    if (selectedReports.length === 0) {
      alert('⚠️ Selecione pelo menos um relatório para enviar')
      return
    }
    sendAllReports(period, selectedRecipients, recipients, setLoading, selectedReports)
  }

  // Gerar gráficos
  const gerarGraficos = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Gerando gráficos (API buscará animais do banco)...')
      
      const response = await fetchWithTimeout('/api/contabilidade/graficos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          period
          // Não enviar animais - API buscará diretamente do banco para evitar limite de 1MB
        })
      }, 30000) // Timeout maior para gráficos (30 segundos)
      
      if (response.ok) {
        const data = await response.json()
        setGraficosData(data)
        setShowGraficos(true)
        console.log('✅ Gráficos gerados com sucesso')
      } else {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', response.status, errorText)
        alert(`❌ Erro ao gerar gráficos: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erro ao gerar gráficos:', error)
      alert(`❌ Erro ao gerar gráficos: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading
  if (loading && !reportStats.totalAnimals) {
    return (
      <ModernLayout
        title="Relatórios para Contabilidade"
        subtitle="Carregando dados..."
        icon="📊"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando dados da contabilidade..." />
        </div>
      </ModernLayout>
    )
  }

  // Mostrar erro
  if (error) {
    return (
      <ModernLayout
        title="Relatórios para Contabilidade"
        subtitle="Erro no sistema"
        icon="📊"
      >
        <ModernCard variant="glass" className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20">
          <ModernCardBody>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-xl text-white">
                <span>⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Erro no Sistema
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                <button 
                  onClick={() => {
                    setError(null)
                    window.location.reload()
                  }}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          </ModernCardBody>
        </ModernCard>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout
      title="Relatórios para Contabilidade"
      subtitle="Gere e envie relatórios completos para sua equipe contábil"
      icon="📊"
    >
      <div className="space-y-8">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Animais"
            value={reportStats.totalAnimals}
            subtitle="Rebanho cadastrado"
            icon={<UserGroupIcon className="h-6 w-6" />}
            color="blue"
            onClick={() => setShowCardDetails('total-animais')}
          />
          <StatsCard
            title="NFs Entrada"
            value={reportStats.nfsEntradas}
            subtitle="Notas fiscais de entrada"
            icon={<DocumentTextIcon className="h-6 w-6" />}
            color="green"
            onClick={() => setShowCardDetails('nfs-entradas')}
          />
          <StatsCard
            title="NFs Saída"
            value={reportStats.nfsSaidas}
            subtitle="Notas fiscais de saída"
            icon={<DocumentTextIcon className="h-6 w-6" />}
            color="red"
            onClick={() => setShowCardDetails('nfs-saidas')}
          />
          <StatsCard
            title="Total Movimentações"
            value={reportStats.movimentacoes}
            subtitle="Entradas + Saídas"
            icon={<ChartBarIcon className="h-6 w-6" />}
            color="purple"
            onClick={() => setShowCardDetails('total-movimentacoes')}
          />
        </div>

        {/* Seleção de Período */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">📅 Período dos Relatórios</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Data Inicial"
                type="date"
                value={period.startDate}
                onChange={(e) => setPeriod(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="Data Final"
                type="date"
                value={period.endDate}
                onChange={(e) => setPeriod(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Os relatórios incluirão todas as movimentações e dados 
                referentes ao período selecionado.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Gráficos Visuais */}
        <ModernCard variant="gradient" className="mb-8">
          <ModernCardHeader
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="Gráficos Visuais do Rebanho"
            subtitle="Visualize dados do rebanho em gráficos interativos"
          />
          <ModernCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button
                variant="primary"
                onClick={gerarGraficos}
                loading={loading}
                className="w-full"
              >
                {showGraficos ? 'Atualizar Gráficos' : 'Gerar Gráficos'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowGraficos(!showGraficos)}
                className="w-full"
              >
                {showGraficos ? 'Ocultar Gráficos' : 'Visualizar Gráficos'}
              </Button>
            </div>

            {showGraficos && graficosData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    🐄 Distribuição por Raça
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porRaca}`} 
                      alt="Gráfico por Raça"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    👥 Distribuição por Sexo
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porSexo}`} 
                      alt="Gráfico por Sexo"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    📊 Distribuição por Classificação Etária
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porIdade}`} 
                      alt="Gráfico por Idade"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    📈 Distribuição por ERA
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porEra}`} 
                      alt="Gráfico por ERA"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    🎯 Distribuição por Situação
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porSituacao}`} 
                      alt="Gráfico por Situação"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    👨 Top 10 - Distribuição por Pai
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porPai}`} 
                      alt="Gráfico por Pai"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">
                    👩 Top 10 - Distribuição por Mãe
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${graficosData.graficos.porMae}`} 
                      alt="Gráfico por Mãe"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </ModernCardBody>
        </ModernCard>

        {/* Relatórios Disponíveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard modern={true} hover={true}>
            <ModernCardHeader
              icon={<DocumentTextIcon className="h-6 w-6" />}
              title="Relatórios Disponíveis"
              subtitle="Gere e compartilhe relatórios profissionais"
            />
            <ModernCardBody>
              <div className="space-y-6">
                <ReportCard
                  title="Boletim SANT ANNA - RANCHARIA"
                  description="Relatório detalhado do rebanho por raça e faixas de idade"
                  icon={<TableCellsIcon className="h-5 w-5" />}
                  iconColor="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  onSendToAccounting={() => handleDownloadBoletim(true)}
                  onEmail={handleEnviarEmail}
                  onWhatsApp={handleEnviarWhatsApp}
                  loading={loading}
                >
                  <ResumoBoletim resumo={resumosBoletins.santAnna} />
                </ReportCard>
                
                <ReportCard
                  title="Boletim AGROPECUÁRIA PARDINHO"
                  description="Relatório específico de entradas da AGROPECUÁRIA PARDINHO LTDA"
                  icon={<TableCellsIcon className="h-5 w-5" />}
                  iconColor="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                  onSendToAccounting={() => handleDownloadBoletimPardinho(true)}
                  onEmail={handleEnviarEmailPardinho}
                  onWhatsApp={handleEnviarWhatsAppPardinho}
                  loading={loading}
                >
                  <ResumoBoletim resumo={resumosBoletins.pardinho} />
                </ReportCard>
                
                <ReportCard
                  title="Notas Fiscais"
                  description="Relatório completo de entradas e saídas"
                  icon={<DocumentTextIcon className="h-5 w-5" />}
                  iconColor="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                  onSendToAccounting={handleDownloadNFs}
                  loading={loading}
                />
              </div>
            </ModernCardBody>
          </ModernCard>

          {/* Painel de Destinatários */}
          <div className="space-y-6">
            <RecipientsList
              recipients={recipients}
              selectedRecipients={selectedRecipients}
              onToggleRecipient={handleRecipientToggle}
              onRemoveRecipient={removeRecipient}
              onAddRecipient={() => setShowAddRecipient(true)}
            />

            {/* Ações */}
            <ModernCard variant="premium" modern={true} hover={true} glow={true}>
              <ModernCardHeader
                icon={<PaperAirplaneIcon className="h-6 w-6" />}
                title="Enviar Relatórios"
                subtitle="Selecione os relatórios e destinatários"
              />
              <ModernCardBody>
                <div className="space-y-4">
                  {/* Seleção de Relatórios */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📊 Relatórios Disponíveis
                    </label>
                    <div className="space-y-2">
                      {availableReports.map((report) => (
                        <label
                          key={report.id}
                          className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={() => handleReportToggle(report.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {report.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {report.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    leftIcon={<PaperAirplaneIcon className="h-5 w-5" />}
                    onClick={handleSendAllReports}
                    loading={loading}
                    disabled={selectedRecipients.length === 0 || selectedReports.length === 0}
                    modern={true}
                    glow={true}
                  >
                    Enviar {selectedReports.length} Relatório(s)
                  </Button>
                  
                  <div className="space-y-2">
                    {selectedRecipients.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✓ {selectedRecipients.length} destinatário(s) selecionado(s)
                        </p>
                      </div>
                    )}
                    {selectedReports.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          ✓ {selectedReports.length} relatório(s) selecionado(s)
                        </p>
                      </div>
                    )}
                    {(selectedRecipients.length === 0 || selectedReports.length === 0) && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ Selecione pelo menos um relatório e um destinatário
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ModernCardBody>
            </ModernCard>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Destinatário */}
      <Modal
        isOpen={showAddRecipient}
        onClose={() => {
          setShowAddRecipient(false)
          setNewRecipient({ name: '', email: '', whatsapp: '', role: 'Contador' })
        }}
        title="Adicionar Destinatário"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="📝 Nome Completo"
            value={newRecipient.name}
            onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: João Silva"
            required
          />
          
          <Input
            label="📧 Email"
            type="email"
            value={newRecipient.email}
            onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Ex: joao@empresa.com"
          />
          
          <Input
            label="📱 WhatsApp"
            value={newRecipient.whatsapp}
            onChange={(e) => setNewRecipient(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="Ex: (11) 99999-9999"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={addRecipient}
              className="flex-1"
              variant="primary"
            >
              ✅ Adicionar
            </Button>
            <Button
              onClick={() => setShowAddRecipient(false)}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalhes dos Cards */}
      {showCardDetails && (
        <Modal
          isOpen={true}
          onClose={() => setShowCardDetails(null)}
          title={getCardDetailsTitle(showCardDetails)}
          size="lg"
        >
          <div>
            {getCardDetailsContent(showCardDetails, {
              nfsEntradasData,
              nfsSaidasData,
              reportStats,
              animaisData
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowCardDetails(null)}
            >
              Fechar
            </Button>
          </div>
        </Modal>
      )}
    </ModernLayout>
  )
}

function getCardDetailsTitle(cardType) {
  switch (cardType) {
    case 'total-animais':
      return '📊 Total de Animais - Detalhes'
    case 'nfs-entradas':
      return '📥 Notas Fiscais de Entrada'
    case 'nfs-saidas':
      return '📤 Notas Fiscais de Saída'
    case 'total-movimentacoes':
      return '🔄 Total de Movimentações'
    default:
      return 'Detalhes'
  }
}

function getCardDetailsContent(cardType, data = {}) {
  const { nfsEntradasData = [], nfsSaidasData = [], reportStats = {}, animaisData = [] } = data
  
  switch (cardType) {
    case 'total-animais':
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Total de {animaisData.length} animais</strong> cadastrados no sistema.
            </p>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lista de Animais:</h4>
            {animaisData.length > 0 ? (
              animaisData.slice(0, 10).map((animal) => (
                <div 
                  key={animal.id} 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {animal.nome || animal.serie || 'Sem nome'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {animal.raca} • {animal.sexo}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cadastrado em: {formatDate(animal.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum animal cadastrado
              </div>
            )}
            {animaisData.length > 10 && (
              <div className="text-center text-sm text-gray-500">
                ... e mais {animaisData.length - 10} animais
              </div>
            )}
          </div>
        </div>
      )

    case 'nfs-entradas':
      return (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Definição:</strong> Notas fiscais de entrada registradas no período selecionado.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Notas Fiscais de Entrada:</h4>
            {nfsEntradasData.length > 0 ? (
              nfsEntradasData.map((nf, index) => (
                <div 
                  key={index} 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    NF: {nf.numero_nf || nf.numero || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {nf.data || 'Data não informada'} • {nf.fornecedor || 'Fornecedor não informado'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma nota fiscal de entrada registrada
              </div>
            )}
          </div>
        </div>
      )

    case 'nfs-saidas':
      return (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Definição:</strong> Notas fiscais de saída registradas no período selecionado.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Notas Fiscais de Saída:</h4>
            {nfsSaidasData.length > 0 ? (
              nfsSaidasData.map((nf, index) => (
                <div 
                  key={index} 
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    NF: {nf.numero_nf || nf.numero || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {nf.data || 'Data não informada'} • {nf.destino || nf.cliente || 'Cliente não informado'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma nota fiscal de saída registrada
              </div>
            )}
          </div>
        </div>
      )

    case 'total-movimentacoes':
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>Definição:</strong> Total de movimentações (entradas + saídas) registradas no período selecionado.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reportStats.nfsEntradas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Entradas
              </div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reportStats.nfsSaidas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Saídas
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return <div>Detalhes não disponíveis</div>
  }
}
