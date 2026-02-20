
import React, { useEffect, useState } from 'react'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
} from './ui/Icons'
// ExcelJS será importado dinamicamente na função de exportação
import DatabaseSync from './DatabaseSync'
import { ViewSemenModal, EditSemenModal } from './SemenModals'
import { AddEntradaModal, AddSaidaModal } from './SemenEntradaSaidaModals'

export default function SemenStock() {
  const [semenStock, setSemenStock] = useState([])
  const [showAddEntradaModal, setShowAddEntradaModal] = useState(false)
  const [showAddSaidaModal, setShowAddSaidaModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSemen, setSelectedSemen] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState('complete') // 'complete' ou 'current_view'
  const [activeTab, setActiveTab] = useState('entradas') // 'entradas', 'saidas' ou 'estoque'
  const [exportPeriod, setExportPeriod] = useState({
    startDate: '',
    endDate: '',
    usePeriod: false
  })
  const [filters, setFilters] = useState({
    touro: '',
    fornecedor: '',
    localizacao: '',
    status: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [newSemen, setNewSemen] = useState({
    nomeTouro: '',
    rgTouro: '',
    raca: '',
    localizacao: '',
    rackTouro: '',
    botijao: '',
    caneca: '',
    tipoOperacao: 'entrada', // entrada ou saida
    fornecedor: '',
    destino: '',
    numeroNF: '',
    valorCompra: '',
    dataCompra: new Date().toISOString().split('T')[0],
    quantidadeDoses: '',
    dosesDisponiveis: '',
    observacoes: '',
    certificado: '',
    dataValidade: '',
    origem: '',
    linhagem: ''
  })

  // Carregar dados
  useEffect(() => {
    loadSemenStock()
  }, [])

  const loadSemenStock = async () => {
    try {
      console.log('🔄 Iniciando carregamento dos dados...')
      const response = await fetch('/api/semen')
      console.log('📡 Response status:', response.status)
      if (response.ok) {
        const responseData = await response.json()
        console.log('📊 Resposta completa da API:', responseData)
        console.log('📊 Tipo da resposta:', typeof responseData)
        console.log('📊 É array?', Array.isArray(responseData))
        
        // A API retorna um objeto com { success, message, data, timestamp }
        // Os dados estão na propriedade 'data'
        const data = responseData.data || responseData
        console.log('📊 Dados extraídos:', data)
        console.log('📊 Tipo dos dados:', typeof data)
        console.log('📊 É array?', Array.isArray(data))
        console.log('📊 Quantidade de itens:', data?.length || 'N/A')
        
        setSemenStock(data || [])
      } else {
        console.error('Erro ao carregar estoque de sêmen - Status:', response.status)
        setSemenStock([])
      }
    } catch (error) {
      console.error('Erro ao carregar estoque de sêmen:', error)
      setSemenStock([])
    }
  }

  const handleAddSemen = async (dadosRecebidos = null) => {
    // Se recebeu dados dos modais, usar eles; senão usar newSemen
    const semenData = dadosRecebidos || { ...newSemen }
    const tipoOperacao = semenData.tipoOperacao || (activeTab === 'entradas' ? 'entrada' : 'saida')
    
    console.log('🔍 Debug handleAddSemen - Dados recebidos:', dadosRecebidos)
    console.log('🔍 Debug handleAddSemen - semenData final:', semenData)
    console.log('🔍 Debug handleAddSemen - tipoOperacao:', tipoOperacao)

    // Validação específica para saída
    if (tipoOperacao === 'saida') {
      if (!semenData.entradaId) {
        alert('Selecione um sêmen disponível para registrar a saída')
        return
      }
      if (!semenData.quantidadeDoses || parseInt(semenData.quantidadeDoses) <= 0) {
        alert('Informe a quantidade de doses para saída')
        return
      }
      if (parseInt(semenData.quantidadeDoses) > parseInt(semenData.maxDoses)) {
        alert(`Quantidade não pode ser maior que ${semenData.maxDoses} doses disponíveis`)
        return
      }
      if (!semenData.destino) {
        alert('Informe o destino da saída')
        return
      }
    }

    // Validação para entrada - verificar se campos estão preenchidos (não vazios e não apenas espaços)
    const camposObrigatorios = []
    
    // Função auxiliar para verificar se um campo está realmente preenchido
    const isFieldEmpty = (value) => {
      return !value || (typeof value === 'string' && value.trim() === '')
    }
    
    if (isFieldEmpty(semenData.nomeTouro)) camposObrigatorios.push('Nome do Touro')
    if (isFieldEmpty(semenData.localizacao)) camposObrigatorios.push('Localização')
    if (isFieldEmpty(semenData.quantidadeDoses) || parseInt(semenData.quantidadeDoses) <= 0) {
      camposObrigatorios.push('Quantidade de Doses')
    }
    
    if (tipoOperacao === 'entrada') {
      if (isFieldEmpty(semenData.fornecedor)) camposObrigatorios.push('Fornecedor')
      if (isFieldEmpty(semenData.valorCompra) || parseFloat(semenData.valorCompra) <= 0) {
        camposObrigatorios.push('Valor da Compra')
      }
    }
    
    // Debug para ajudar a identificar o problema
    console.log('🔍 Debug validação:', {
      nomeTouro: semenData.nomeTouro,
      localizacao: semenData.localizacao,
      quantidadeDoses: semenData.quantidadeDoses,
      fornecedor: semenData.fornecedor,
      valorCompra: semenData.valorCompra,
      tipoOperacao,
      camposObrigatorios
    })
    
    if (camposObrigatorios.length > 0) {
      alert(`Preencha os campos obrigatórios: ${camposObrigatorios.join(', ')}`)
      return
    }

    try {
      const response = await fetch('/api/semen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...semenData,
          dosesDisponiveis: tipoOperacao === 'entrada' ? semenData.quantidadeDoses : undefined,
          // Garantir que campos vazios sejam null ou valores padrão
          rgTouro: semenData.rgTouro || null,
          raca: semenData.raca || null,
          rackTouro: semenData.rackTouro || null,
          botijao: semenData.botijao || null,
          caneca: semenData.caneca || null,
          destino: semenData.destino || null,
          numeroNF: semenData.numeroNF || null,
          certificado: semenData.certificado || null,
          dataValidade: semenData.dataValidade && semenData.dataValidade.trim() !== '' ? semenData.dataValidade : null,
          origem: semenData.origem || null,
          linhagem: semenData.linhagem || null,
          observacoes: semenData.observacoes || null
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        const newSemenData = responseData.data || responseData
        setSemenStock(prev => Array.isArray(prev) ? [newSemenData, ...prev] : [newSemenData])
        resetForm()
        setShowAddEntradaModal(false)
        setShowAddSaidaModal(false)
        alert(`${tipoOperacao === 'entrada' ? 'Sêmen adicionado ao estoque' : 'Saída de sêmen registrada'} com sucesso!`)
        
        // Recarregar dados para atualizar doses disponíveis
        loadSemenStock()
      } else {
        const errorData = await response.json()
        console.error('Erro detalhado:', errorData)
        
        // Melhorar mensagem de erro para o usuário
        let errorMessage = errorData.message || 'Erro desconhecido'
        
        // Tratar erro específico de doses excedidas
        if (errorMessage.includes('excede doses disponíveis')) {
          const match = errorMessage.match(/Quantidade solicitada \((\d+)\) excede doses disponíveis \((\d+)\)/)
          if (match) {
            const [, solicitada, disponivel] = match
            errorMessage = `Não é possível registrar saída de ${solicitada} doses.\nApenas ${disponivel} doses estão disponíveis para este sêmen.`
          }
        }
        
        alert(`Erro ao ${tipoOperacao === 'entrada' ? 'adicionar' : 'registrar saída de'} sêmen:\n\n${errorMessage}`)
      }
    } catch (error) {
      console.error('Erro ao processar sêmen:', error)
      alert('Erro ao processar sêmen. Tente novamente.')
    }
  }

  const resetForm = () => {
    console.log('🔄 Resetando formulário...')
    setNewSemen({
      nomeTouro: '',
      rgTouro: '',
      raca: '',
      localizacao: '',
      rackTouro: '',
      botijao: '',
      caneca: '',
      tipoOperacao: activeTab === 'entradas' ? 'entrada' : 'saida',
      fornecedor: '',
      destino: '',
      numeroNF: '',
      valorCompra: '',
      dataCompra: new Date().toISOString().split('T')[0],
      quantidadeDoses: '',
      dosesDisponiveis: '',
      observacoes: '',
      certificado: '',
      dataValidade: '',
      origem: '',
      linhagem: '',
      entradaId: null,
      maxDoses: 0
    })
  }

  const handleDeleteSemen = async (semenId) => {
    if (confirm('Tem certeza que deseja excluir este sêmen do estoque?')) {
      try {
        const response = await fetch(`/api/semen/${semenId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setSemenStock(prev => prev.filter(s => s.id !== semenId))
          alert('Sêmen excluído com sucesso!')
        } else {
          const errorData = await response.json()
          alert(`Erro ao excluir sêmen: ${errorData.message}`)
        }
      } catch (error) {
        console.error('Erro ao excluir sêmen:', error)
        alert('Erro ao excluir sêmen. Tente novamente.')
      }
    }
  }

  // Funções para exclusão múltipla
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(paginatedStock.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    const confirmMessage = `Tem certeza que deseja excluir ${selectedItems.length} item(s) do estoque?\n\nEsta ação não pode ser desfeita.`
    
    if (confirm(confirmMessage)) {
      try {
        let successCount = 0
        let errorCount = 0

        for (const id of selectedItems) {
          try {
            const response = await fetch(`/api/semen/${id}`, {
              method: 'DELETE'
            })

            if (response.ok) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        }

        // Atualizar a lista removendo os itens excluídos
        setSemenStock(prev => prev.filter(s => !selectedItems.includes(s.id)))
        setSelectedItems([])
        setShowBulkDeleteModal(false)

        if (errorCount === 0) {
          alert(`✅ ${successCount} item(s) excluído(s) com sucesso!`)
        } else {
          alert(`⚠️ ${successCount} item(s) excluído(s), ${errorCount} erro(s) encontrado(s).`)
        }
      } catch (error) {
        console.error('Erro na exclusão múltipla:', error)
        alert('❌ Erro na exclusão múltipla. Tente novamente.')
      }
    }
  }

  const handleUseDose = async (semenId, quantidadeUsada = 1) => {
    try {
      const response = await fetch(`/api/semen/${semenId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidadeUsada })
      })

      if (response.ok) {
        const updatedSemen = await response.json()
        setSemenStock(prev => 
          prev.map(s => s.id === semenId ? updatedSemen : s)
        )
        alert('Dose utilizada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao usar dose: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erro ao usar dose:', error)
      alert('Erro ao usar dose. Tente novamente.')
    }
  }

  const handleEditSemen = async (updatedData) => {
    try {
      const response = await fetch(`/api/semen/${selectedSemen.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        const updatedSemen = await response.json()
        setSemenStock(prev => 
          prev.map(s => s.id === selectedSemen.id ? updatedSemen : s)
        )
        setShowEditModal(false)
        setSelectedSemen(null)
        alert('Sêmen atualizado com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao atualizar sêmen: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar sêmen:', error)
      alert('Erro ao atualizar sêmen. Tente novamente.')
    }
  }

  // Filtrar estoque por aba ativa
  const filteredStock = (Array.isArray(semenStock) ? semenStock : []).filter(semen => {
    if (!semen) return false;
    
    // Debug: Log dos dados para verificar
    if (activeTab === 'saidas') {
      console.log('🔍 Debug filtro saídas - Item:', {
        id: semen.id,
        nome_touro: semen.nome_touro,
        tipo_operacao: semen.tipo_operacao,
        tipoOperacao: semen.tipoOperacao,
        destino: semen.destino
      });
    }
    
    // Filtrar por tipo de operação baseado na aba ativa
    let matchesTab = false;
    if (activeTab === 'entradas') {
      // Entradas: apenas entradas que ainda têm doses disponíveis (não esgotadas)
      const dosesDisponiveis = semen.dosesDisponiveis || semen.doses_disponiveis || 0;
      matchesTab = (semen.tipoOperacao === 'entrada' || semen.tipo_operacao === 'entrada') && dosesDisponiveis > 0;
    } else if (activeTab === 'saidas') {
      matchesTab = semen.tipoOperacao === 'saida' || semen.tipo_operacao === 'saida';
    } else if (activeTab === 'estoque') {
      // Estoque Real: apenas entradas com doses disponíveis > 0
      const dosesDisponiveis = semen.dosesDisponiveis || semen.doses_disponiveis || 0;
      matchesTab = (semen.tipoOperacao === 'entrada' || semen.tipo_operacao === 'entrada') && dosesDisponiveis > 0;
    }
    
    const matchesSearch = 
      (semen.nomeTouro && semen.nomeTouro.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (semen.nome_touro && semen.nome_touro.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (semen.rgTouro && semen.rgTouro.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (semen.rg_touro && semen.rg_touro.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (semen.fornecedor && semen.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (semen.serie && semen.serie.toLowerCase().includes(searchTerm.toLowerCase())) // Para compatibilidade com estrutura antiga

    const matchesFilters =
      (!filters.touro || (semen.nomeTouro && semen.nomeTouro.toLowerCase().includes(filters.touro.toLowerCase())) || (semen.nome_touro && semen.nome_touro.toLowerCase().includes(filters.touro.toLowerCase())) || (semen.serie && semen.serie.toLowerCase().includes(filters.touro.toLowerCase()))) &&
      (!filters.fornecedor || (semen.fornecedor && semen.fornecedor.toLowerCase().includes(filters.fornecedor.toLowerCase()))) &&
      (!filters.localizacao || (semen.localizacao && semen.localizacao.toLowerCase().includes(filters.localizacao.toLowerCase()))) &&
      (!filters.status || semen.status === filters.status)

    const result = matchesTab && matchesSearch && matchesFilters;
    
    if (activeTab === 'saidas' && result) {
      console.log('✅ Item passou no filtro de saídas:', semen.id);
    }
    
    return result;
  });
  
  // Debug: Log do resultado final
  if (activeTab === 'saidas') {
    console.log(`🔍 Debug - Total de saídas filtradas: ${filteredStock.length}`);
    console.log('🔍 Debug - IDs das saídas filtradas:', filteredStock.map(s => s.id));
  }

  // Paginação
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStock = filteredStock.slice(startIndex, startIndex + itemsPerPage)

  // Estatísticas
  // Filtrar apenas entradas (touros) para o cálculo do total
  const entradas = (Array.isArray(semenStock) ? semenStock : []).filter(s => 
    s.tipoOperacao === 'entrada' || s.tipo_operacao === 'entrada'
  )
  
  const stats = {
    total: entradas.length,
    disponivel: entradas.filter(s => s.status === 'disponivel').length,
    esgotado: entradas.filter(s => s.status === 'esgotado').length,
    totalDoses: (Array.isArray(semenStock) ? semenStock : []).reduce((acc, s) => acc + parseInt(s.quantidadeDoses || 0), 0),
    dosesDisponiveis: (Array.isArray(semenStock) ? semenStock : []).reduce((acc, s) => acc + parseInt(s.dosesDisponiveis || 0), 0),
    dosesUsadas: (Array.isArray(semenStock) ? semenStock : []).reduce((acc, s) => acc + parseInt(s.dosesUsadas || 0), 0),
    valorTotal: (Array.isArray(semenStock) ? semenStock : []).reduce((acc, s) => acc + parseFloat(s.valorCompra || 0), 0),
    fornecedores: [...new Set((Array.isArray(semenStock) ? semenStock : []).map(s => s.fornecedor))].length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'esgotado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'vencido': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'disponivel': return 'Disponível'
      case 'esgotado': return 'Esgotado'
      case 'vencido': return 'Vencido'
      default: return status
    }
  }

  // Filtrar dados por período se necessário
  const filterByPeriod = (data, startDate, endDate) => {
    if (!startDate || !endDate) return data;
    
    return data.filter(s => {
      const rawDate = s.dataCompra || s.data_compra || s.created_at;
      if (!rawDate) return false;
      
      // Converter para string YYYY-MM-DD para comparação segura independente de fuso horário
      let dateStr = '';
      if (typeof rawDate === 'string') {
        dateStr = rawDate.split('T')[0].substring(0, 10);
      } else if (rawDate instanceof Date) {
        try {
          dateStr = rawDate.toISOString().split('T')[0];
        } catch (e) {
          return false;
        }
      }
      
      return dateStr >= startDate && dateStr <= endDate;
    });
  }

  // Exportar para Excel com formatação profissional
  const exportToExcel = async (periodData = null) => {
    try {
      const { exportSemenToExcel } = await import('../utils/simpleExcelExporter');
      
      let stockToExport;
      
      // Decidir qual conjunto de dados exportar
      if (exportType === 'current_view') {
        // Exportar EXATAMENTE o que está sendo visto (filtrado)
        stockToExport = filteredStock;
        console.log('📊 Exportando visualização atual:', stockToExport.length, 'registros');
      } else {
        // Exportar TUDO (padrão)
        stockToExport = semenStock;
        
        // Aplicar filtro de período se fornecido (apenas se não for visualização atual)
        if (periodData && periodData.usePeriod && periodData.startDate && periodData.endDate) {
          stockToExport = filterByPeriod(semenStock, periodData.startDate, periodData.endDate);
        }
        console.log('📊 Exportando completo:', stockToExport.length, 'registros');
      }
      
      // Separar dados por tipo para exportação
      // Entradas: apenas entradas que ainda têm doses disponíveis (não esgotadas)
      const entradas = (Array.isArray(stockToExport) ? stockToExport : []).filter(s => {
        const dosesDisponiveis = s.dosesDisponiveis || s.doses_disponiveis || 0;
        return (s.tipoOperacao === 'entrada' || s.tipo_operacao === 'entrada') && dosesDisponiveis > 0;
      });
      const saidas = (Array.isArray(stockToExport) ? stockToExport : []).filter(s => 
        s.tipoOperacao === 'saida' || s.tipo_operacao === 'saida'
      );
      const estoqueReal = (Array.isArray(stockToExport) ? stockToExport : []).filter(s => {
        const dosesDisponiveis = s.dosesDisponiveis || s.doses_disponiveis || 0;
        return (s.tipoOperacao === 'entrada' || s.tipo_operacao === 'entrada') && dosesDisponiveis > 0;
      });
      
      await exportSemenToExcel(stockToExport, { entradas, saidas, estoqueReal }, periodData);
      
      const tipoMsg = exportType === 'current_view' ? '\n🔍 Filtro: Visualização Atual (Filtros da Tela)' : '';
      const periodoMsg = periodData && periodData.usePeriod 
        ? `\n📅 Período: ${new Date(periodData.startDate).toLocaleDateString('pt-BR')} até ${new Date(periodData.endDate).toLocaleDateString('pt-BR')}`
        : '';
      
      alert(`✅ Estoque de sêmen exportado com sucesso!${periodoMsg}\n\n📊 Arquivo gerado com 3 abas separadas:\n• Entradas (apenas com doses disponíveis)\n• Saídas\n• Estoque Real`);
      
      // Fechar modal se estiver aberto
      setShowExportModal(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('❌ Erro ao exportar estoque: ' + error.message);
    }
  }

  // Abrir modal de exportação
  const handleExportClick = () => {
    // Inicializar período com mês atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setExportType('complete'); // Resetar para completo por padrão
    setExportPeriod({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      usePeriod: false
    });
    setShowExportModal(true);
  }

  return (
    <div className="space-y-6">
      {/* Sincronização de Dados */}
      <DatabaseSync />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            🧬 Estoque de Sêmen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle completo do material genético do rebanho
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExportClick}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar Excel
          </button>
        {/* Abas de Entrada, Saída e Estoque Real */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('entradas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'entradas'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📥 Entradas
          </button>
          <button
            onClick={() => setActiveTab('saidas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'saidas'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📤 Saídas
          </button>
          <button
            onClick={() => setActiveTab('estoque')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'estoque'
                ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📦 Estoque Real
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-3">
          {activeTab === 'entradas' && (
            <button
              onClick={() => setShowAddEntradaModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Adicionar Entrada
            </button>
          )}
          {activeTab === 'saidas' && (
            <button
              onClick={() => setShowAddSaidaModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Registrar Saída
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Touros</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.disponivel}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Disponíveis</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.esgotado}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Esgotados</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalDoses}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Doses</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.dosesDisponiveis}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Disponíveis</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.dosesUsadas}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Usadas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            R$ {stats.valorTotal.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Investido</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.fornecedores}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Fornecedores</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔍 Filtros de Pesquisa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nome do touro, RG, fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Touro
            </label>
            <input
              type="text"
              placeholder="Nome do touro"
              value={filters.touro}
              onChange={(e) => setFilters({ ...filters, touro: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fornecedor
            </label>
            <input
              type="text"
              placeholder="Nome do fornecedor"
              value={filters.fornecedor}
              onChange={(e) => setFilters({ ...filters, fornecedor: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Localização
            </label>
            <input
              type="text"
              placeholder="Localização"
              value={filters.localizacao}
              onChange={(e) => setFilters({ ...filters, localizacao: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="disponivel">Disponível</option>
              <option value="esgotado">Esgotado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estoque de Sêmen ({filteredStock.length} registros)
            </h3>
            <button 
              onClick={() => {
                console.log('🔍 Debug - semenStock completo:', semenStock);
                console.log('🔍 Debug - filteredStock:', filteredStock);
                console.log('🔍 Debug - activeTab:', activeTab);
              }}
              className="btn-secondary text-xs"
            >
              Debug
            </button>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.length} item(s) selecionado(s)
                </span>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="btn-danger flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Excluir Selecionados
                </button>
              </div>
            )}
          </div>
        </div>
        
        {filteredStock.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🧬</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum sêmen encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {semenStock.length === 0 
                ? 'Comece adicionando sêmen ao seu estoque'
                : 'Tente ajustar os filtros de pesquisa'
              }
            </p>
            <button
              onClick={() => setShowAddEntradaModal(true)}
              className="btn-primary"
            >
              Adicionar Primeiro Sêmen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedStock.length && paginatedStock.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Touro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Doses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedStock.map((semen) => (
                  <tr key={semen.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(semen.id)}
                        onChange={(e) => handleSelectItem(semen.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {semen.nomeTouro || semen.nome_touro || semen.serie || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          RG: {semen.rgTouro || semen.rg_touro || semen.rg || 'N/A'} • {semen.raca || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Para saídas, mostrar destino ao invés de localização física */}
                      {(semen.tipoOperacao === 'saida' || semen.tipo_operacao === 'saida') ? (
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            <span className="text-orange-600 dark:text-orange-400 font-medium">📤 Saída</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Destino: {semen.destino || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {semen.localizacao || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {(semen.rackTouro || semen.rack_touro) && `Rack: ${semen.rackTouro || semen.rack_touro}`}
                            {(semen.rackTouro || semen.rack_touro) && semen.botijao && ' • '}
                            {semen.botijao && `Botijão: ${semen.botijao}`}
                            {((semen.rackTouro || semen.rack_touro) || semen.botijao) && semen.caneca && ' • '}
                            {semen.caneca && `Caneca: ${semen.caneca}`}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {activeTab === 'saidas' 
                          ? `${semen.quantidade_doses || semen.quantidadeDoses} doses` 
                          : `${semen.doses_disponiveis || semen.dosesDisponiveis} / ${semen.quantidade_doses || semen.quantidadeDoses}`
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activeTab === 'saidas' 
                          ? `Destino: ${semen.destino || 'N/A'}`
                          : `Usadas: ${semen.doses_usadas || semen.dosesUsadas}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(semen.status)}`}>
                        {getStatusLabel(semen.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      R$ {parseFloat(semen.valorCompra || semen.valor_compra || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSemen(semen)
                            setShowViewModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSemen(semen)
                            setShowEditModal(true)
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSemen(semen.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredStock.length)} de {filteredStock.length} registros
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais de Entrada e Saída */}
      <AddEntradaModal
        showModal={showAddEntradaModal}
        setShowModal={setShowAddEntradaModal}
        newSemen={newSemen}
        setNewSemen={setNewSemen}
        handleAddSemen={handleAddSemen}
      />

      <AddSaidaModal
        showModal={showAddSaidaModal}
        setShowModal={setShowAddSaidaModal}
        newSemen={newSemen}
        setNewSemen={setNewSemen}
        handleAddSemen={handleAddSemen}
        semenStock={semenStock}
      />

      {/* Modal de Exportação com Período */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  📊 Exportar para Excel
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Seleção do Tipo de Relatório */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Relatório
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="complete"
                        checked={exportType === 'complete'}
                        onChange={() => setExportType('complete')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Relatório Completo
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Exporta todos os registros do banco de dados (permite filtro por data)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="current_view"
                        checked={exportType === 'current_view'}
                        onChange={() => setExportType('current_view')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          Visualização Atual
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Exporta apenas o que você está vendo agora ({filteredStock.length} registros), respeitando filtros de busca, touro, etc.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Opções de Período (apenas para relatório completo) */}
                <div className={`transition-opacity duration-300 ${exportType === 'current_view' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="usePeriod"
                      checked={exportPeriod.usePeriod}
                      onChange={(e) => setExportPeriod({ ...exportPeriod, usePeriod: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      disabled={exportType === 'current_view'}
                    />
                    <label htmlFor="usePeriod" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filtrar por período (Data de Compra/Entrada)
                    </label>
                  </div>

                  {exportPeriod.usePeriod && (
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Inicial
                        </label>
                        <input
                          type="date"
                          value={exportPeriod.startDate}
                          onChange={(e) => setExportPeriod({ ...exportPeriod, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Final
                        </label>
                        <input
                          type="date"
                          value={exportPeriod.endDate}
                          onChange={(e) => setExportPeriod({ ...exportPeriod, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  {exportType === 'current_view'
                    ? `📋 Exportando ${filteredStock.length} registros filtrados na tela`
                    : exportPeriod.usePeriod 
                      ? `📅 Exportando registros de ${exportPeriod.startDate ? new Date(exportPeriod.startDate).toLocaleDateString('pt-BR') : '...'} até ${exportPeriod.endDate ? new Date(exportPeriod.endDate).toLocaleDateString('pt-BR') : '...'}`
                      : '📚 Exportando base completa de sêmen'
                  }
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (exportPeriod.usePeriod && (!exportPeriod.startDate || !exportPeriod.endDate)) {
                      alert('⚠️ Por favor, selecione ambas as datas para filtrar por período.');
                      return;
                    }
                    if (exportPeriod.usePeriod && new Date(exportPeriod.startDate) > new Date(exportPeriod.endDate)) {
                      alert('⚠️ A data inicial não pode ser maior que a data final.');
                      return;
                    }
                    exportToExcel(exportPeriod.usePeriod ? exportPeriod : null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      <ViewSemenModal
        showModal={showViewModal}
        setShowModal={setShowViewModal}
        selectedSemen={selectedSemen}
      />

      {/* Modal de Edição */}
      <EditSemenModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        selectedSemen={selectedSemen}
        handleEditSemen={handleEditSemen}
      />

      {/* Modal de Confirmação para Exclusão Múltipla */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrashIcon className="h-6 w-6 mr-3 text-red-600" />
                Confirmar Exclusão Múltipla
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Você está prestes a excluir <strong>{selectedItems.length}</strong> item(s) do estoque de sêmen.
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  ⚠️ Esta ação não pode ser desfeita!
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Itens selecionados:</strong>
                </p>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {selectedItems.map(id => {
                    const item = (Array.isArray(semenStock) ? semenStock : []).find(s => s.id === id)
                    return (
                      <div key={id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                        • {item?.nomeTouro || item?.nome_touro || item?.serie || 'Sem nome'} ({item?.raca || 'N/A'})
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn-danger flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir {selectedItems.length} Item(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}