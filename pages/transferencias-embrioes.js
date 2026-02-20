
import React, { useEffect, useState } from 'react'

import { 
  PlusIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '../components/ui/Icons'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Toast from '../components/ui/SimpleToast'

export default function TransferenciasEmbrioes() {
  const [transferencias, setTransferencias] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [editingTE, setEditingTE] = useState(null)
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    status: '',
    resultado: '',
    raca: ''
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 0
  })

  // Estados para formulário
  const [formData, setFormData] = useState({
    numeroTE: '',
    dataTE: '',
    receptoraId: '',
    doadoraId: '',
    touroId: '',
    localTE: '',
    dataFIV: '',
    raca: '',
    tecnicoResponsavel: '',
    observacoes: '',
    status: 'realizada'
  })

  // Estados para formulário em lote
  const [batchData, setBatchData] = useState({
    dataTE: '',
    localTE: '',
    tecnicoResponsavel: '',
    raca: '',
    transferencias: []
  })

  const [animais, setAnimais] = useState([])

  useEffect(() => {
    loadTransferencias()
    loadAnimais()
  }, [filtros, pagination.offset])

  const loadTransferencias = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      })

      if (Object.values(filtros).some(f => f)) {
        queryParams.append('filtros', JSON.stringify(filtros))
      }

      const response = await fetch(`/api/transferencias-embrioes?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setTransferencias(data.transferencias)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar transferências:', error)
      Toast.error('Erro ao carregar transferências')
    } finally {
      setLoading(false)
    }
  }

  const loadAnimais = async () => {
    try {
      const response = await fetch('/api/animals')
      if (response.ok) {
        const data = await response.json()
        setAnimais(data)
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const url = editingTE 
        ? `/api/transferencias-embrioes?id=${editingTE.id}`
        : '/api/transferencias-embrioes'
      
      const method = editingTE ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        Toast.success(editingTE ? 'Transferência atualizada!' : 'Transferência criada!')
        setShowModal(false)
        setEditingTE(null)
        resetForm()
        loadTransferencias()
      } else {
        const error = await response.json()
        Toast.error(error.message || 'Erro ao salvar transferência')
      }
    } catch (error) {
      console.error('Erro ao salvar transferência:', error)
      Toast.error('Erro ao salvar transferência')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Criar múltiplas transferências
      const promises = batchData.transferencias.map(te => 
        fetch('/api/transferencias-embrioes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...te,
            dataTE: batchData.dataTE,
            localTE: batchData.localTE,
            tecnicoResponsavel: batchData.tecnicoResponsavel,
            raca: batchData.raca
          })
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length
      
      Toast.success(`${successCount} transferências criadas!`)
      setShowBatchModal(false)
      resetBatchForm()
      loadTransferencias()
    } catch (error) {
      console.error('Erro ao criar transferências em lote:', error)
      Toast.error('Erro ao criar transferências em lote')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta transferência?')) return

    try {
      const response = await fetch(`/api/transferencias-embrioes?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        Toast.success('Transferência excluída!')
        loadTransferencias()
      } else {
        Toast.error('Erro ao excluir transferência')
      }
    } catch (error) {
      console.error('Erro ao excluir transferência:', error)
      Toast.error('Erro ao excluir transferência')
    }
  }

  const resetForm = () => {
    setFormData({
      numeroTE: '',
      dataTE: '',
      receptoraId: '',
      doadoraId: '',
      touroId: '',
      localTE: '',
      dataFIV: '',
      raca: '',
      tecnicoResponsavel: '',
      observacoes: '',
      status: 'realizada'
    })
  }

  const resetBatchForm = () => {
    setBatchData({
      dataTE: '',
      localTE: '',
      tecnicoResponsavel: '',
      raca: '',
      transferencias: []
    })
  }

  const addBatchRow = () => {
    setBatchData(prev => ({
      ...prev,
      transferencias: [...prev.transferencias, {
        numeroTE: '',
        receptoraId: '',
        doadoraId: '',
        touroId: ''
      }]
    }))
  }

  const removeBatchRow = (index) => {
    setBatchData(prev => ({
      ...prev,
      transferencias: prev.transferencias.filter((_, i) => i !== index)
    }))
  }

  const updateBatchRow = (index, field, value) => {
    setBatchData(prev => ({
      ...prev,
      transferencias: prev.transferencias.map((te, i) => 
        i === index ? { ...te, [field]: value } : te
      )
    }))
  }

  const getAnimalName = (animalId) => {
    const animal = animais.find(a => a.id === animalId)
    return animal ? `${animal.serie}-${animal.rg}` : 'N/A'
  }

  const getStatusColor = (status) => {
    const colors = {
      'realizada': 'bg-green-100 text-green-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'cancelada': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getResultadoColor = (resultado) => {
    const colors = {
      'gestante': 'bg-green-100 text-green-800',
      'vazia': 'bg-red-100 text-red-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aborto': 'bg-orange-100 text-orange-800'
    }
    return colors[resultado] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transferências de Embriões (TE)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerenciamento de transferências de embriões
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowBatchModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>Cadastro em Lote</span>
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nova TE</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Início
            </label>
            <Input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Fim
            </label>
            <Input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="realizada">Realizada</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resultado
            </label>
            <select
              value={filtros.resultado}
              onChange={(e) => setFiltros(prev => ({ ...prev, resultado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="gestante">Gestante</option>
              <option value="vazia">Vazia</option>
              <option value="pendente">Pendente</option>
              <option value="aborto">Aborto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raça
            </label>
            <Input
              value={filtros.raca}
              onChange={(e) => setFiltros(prev => ({ ...prev, raca: e.target.value }))}
              placeholder="Filtrar por raça"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nº TE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data TE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Receptora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Doadora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Touro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Raça
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transferencias.map((te) => (
                    <tr key={te.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {te.numero_te}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(te.data_te).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {te.receptora_serie && te.receptora_rg ? `${te.receptora_serie}-${te.receptora_rg}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {te.doadora_serie && te.doadora_rg ? `${te.doadora_serie}-${te.doadora_rg}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {te.touro_serie && te.touro_rg ? `${te.touro_serie}-${te.touro_rg}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {te.raca || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(te.status)}`}>
                          {te.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {te.resultado ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultadoColor(te.resultado)}`}>
                            {te.resultado}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTE(te)
                              setFormData({
                                numeroTE: te.numero_te,
                                dataTE: te.data_te,
                                receptoraId: te.receptora_id || '',
                                doadoraId: te.doadora_id || '',
                                touroId: te.touro_id || '',
                                localTE: te.local_te || '',
                                dataFIV: te.data_fiv || '',
                                raca: te.raca || '',
                                tecnicoResponsavel: te.tecnico_responsavel || '',
                                observacoes: te.observacoes || '',
                                status: te.status
                              })
                              setShowModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(te.id)}
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

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                    disabled={pagination.offset === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando{' '}
                      <span className="font-medium">{pagination.offset + 1}</span>
                      {' '}até{' '}
                      <span className="font-medium">
                        {Math.min(pagination.offset + pagination.limit, pagination.total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                        disabled={pagination.offset === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = Math.floor(pagination.offset / pagination.limit) + i + 1
                        if (page > pagination.pages) return null
                        return (
                          <button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, offset: (page - 1) * prev.limit }))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === Math.floor(pagination.offset / pagination.limit) + 1
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                        disabled={pagination.offset + pagination.limit >= pagination.total}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        Próximo
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Cadastro Individual */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingTE ? 'Editar Transferência' : 'Nova Transferência de Embrião'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingTE(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número da TE *
                    </label>
                    <Input
                      value={formData.numeroTE}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroTE: e.target.value }))}
                      placeholder="Ex: TE-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da TE *
                    </label>
                    <Input
                      type="date"
                      value={formData.dataTE}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataTE: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Receptora
                    </label>
                    <select
                      value={formData.receptoraId}
                      onChange={(e) => setFormData(prev => ({ ...prev, receptoraId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecionar receptora</option>
                      {animais.map(animal => (
                        <option key={animal.id} value={animal.id}>
                          {animal.serie}-{animal.rg} ({animal.raca})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Doadora
                    </label>
                    <select
                      value={formData.doadoraId}
                      onChange={(e) => setFormData(prev => ({ ...prev, doadoraId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecionar doadora</option>
                      {animais.map(animal => (
                        <option key={animal.id} value={animal.id}>
                          {animal.serie}-{animal.rg} ({animal.raca})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Touro
                    </label>
                    <select
                      value={formData.touroId}
                      onChange={(e) => setFormData(prev => ({ ...prev, touroId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecionar touro</option>
                      {animais.map(animal => (
                        <option key={animal.id} value={animal.id}>
                          {animal.serie}-{animal.rg} ({animal.raca})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Local da TE
                    </label>
                    <Input
                      value={formData.localTE}
                      onChange={(e) => setFormData(prev => ({ ...prev, localTE: e.target.value }))}
                      placeholder="Ex: Fazenda ABC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da FIV
                    </label>
                    <Input
                      type="date"
                      value={formData.dataFIV}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataFIV: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Raça
                    </label>
                    <Input
                      value={formData.raca}
                      onChange={(e) => setFormData(prev => ({ ...prev, raca: e.target.value }))}
                      placeholder="Ex: Nelore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Técnico Responsável
                    </label>
                    <Input
                      value={formData.tecnicoResponsavel}
                      onChange={(e) => setFormData(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                      placeholder="Nome do técnico"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTE(null)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : (editingTE ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro em Lote */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cadastro de Transferências em Lote
                </h3>
                <button
                  onClick={() => {
                    setShowBatchModal(false)
                    resetBatchForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleBatchSubmit} className="space-y-6">
                {/* Dados comuns */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Dados Comuns
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data da TE *
                      </label>
                      <Input
                        type="date"
                        value={batchData.dataTE}
                        onChange={(e) => setBatchData(prev => ({ ...prev, dataTE: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Local da TE
                      </label>
                      <Input
                        value={batchData.localTE}
                        onChange={(e) => setBatchData(prev => ({ ...prev, localTE: e.target.value }))}
                        placeholder="Ex: Fazenda ABC"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Técnico Responsável
                      </label>
                      <Input
                        value={batchData.tecnicoResponsavel}
                        onChange={(e) => setBatchData(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                        placeholder="Nome do técnico"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Raça
                      </label>
                      <Input
                        value={batchData.raca}
                        onChange={(e) => setBatchData(prev => ({ ...prev, raca: e.target.value }))}
                        placeholder="Ex: Nelore"
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de transferências */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Transferências
                    </h4>
                    <Button
                      type="button"
                      onClick={addBatchRow}
                      variant="outline"
                      size="sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Adicionar Linha
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nº TE
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Receptora
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Doadora
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Touro
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {batchData.transferencias.map((te, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">
                              <Input
                                value={te.numeroTE}
                                onChange={(e) => updateBatchRow(index, 'numeroTE', e.target.value)}
                                placeholder="TE-2024-001"
                                size="sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={te.receptoraId}
                                onChange={(e) => updateBatchRow(index, 'receptoraId', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Selecionar</option>
                                {animais.map(animal => (
                                  <option key={animal.id} value={animal.id}>
                                    {animal.serie}-{animal.rg}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={te.doadoraId}
                                onChange={(e) => updateBatchRow(index, 'doadoraId', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Selecionar</option>
                                {animais.map(animal => (
                                  <option key={animal.id} value={animal.id}>
                                    {animal.serie}-{animal.rg}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={te.touroId}
                                onChange={(e) => updateBatchRow(index, 'touroId', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Selecionar</option>
                                {animais.map(animal => (
                                  <option key={animal.id} value={animal.id}>
                                    {animal.serie}-{animal.rg}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeBatchRow(index)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {batchData.transferencias.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Nenhuma transferência adicionada</p>
                      <p className="text-sm">Clique em "Adicionar Linha" para começar</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBatchModal(false)
                      resetBatchForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || batchData.transferencias.length === 0}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Criar Transferências'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
