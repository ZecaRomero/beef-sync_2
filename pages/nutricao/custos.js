import React, { useState, useEffect } from 'react'
import { CurrencyDollarIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function CustosNutricionais() {
  const [mounted, setMounted] = useState(false)
  const [custosData, setCustosData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    alimento: '',
    fornecedor: '',
    valor: '',
    quantidade: '',
    unidade: 'kg',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadCustosData()
    }
  }, [mounted])

  const loadCustosData = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('custosNutricionais')
      if (savedData) {
        setCustosData(JSON.parse(savedData))
      } else {
        setCustosData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setCustosData([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveCustosData = (newData) => {
    setCustosData(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('custosNutricionais', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este custo?')) {
      const updatedData = custosData.filter(item => item.id !== id)
      saveCustosData(updatedData)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      alimento: item.alimento || '',
      fornecedor: item.fornecedor || '',
      valor: item.valor || '',
      quantidade: item.quantidade || '',
      unidade: item.unidade || 'kg',
      data: item.data || new Date().toISOString().split('T')[0],
      observacoes: item.observacoes || ''
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.alimento || !formData.valor) {
      alert('Por favor, preencha os campos obrigatórios (Alimento e Valor)')
      return
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      alimento: formData.alimento,
      fornecedor: formData.fornecedor,
      valor: parseFloat(formData.valor),
      quantidade: parseFloat(formData.quantidade) || 0,
      unidade: formData.unidade,
      data: formData.data,
      observacoes: formData.observacoes,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedData
    if (editingItem) {
      updatedData = custosData.map(item =>
        item.id === editingItem.id ? newItem : item
      )
    } else {
      updatedData = [...custosData, newItem]
    }

    saveCustosData(updatedData)
    handleCloseForm()

    const action = editingItem ? 'atualizado' : 'adicionado'
    alert(`Custo ${action} com sucesso!`)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      alimento: '',
      fornecedor: '',
      valor: '',
      quantidade: '',
      unidade: 'kg',
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    })
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CurrencyDollarIcon className="w-8 h-8 text-lime-600" />
              Custos Nutricionais
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Controle de custos com alimentação</p>
          </div>
          <button
            onClick={() => {
              console.log('Botão Novo Custo clicado!', { showForm, mounted })
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Custo
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : custosData.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
            <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum custo registrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece adicionando o primeiro custo nutricional
            </p>
            <button
              onClick={() => {
                console.log('Botão Adicionar Custo clicado!', { showForm, mounted })
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Custo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Alimento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Valor (R$)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {custosData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.alimento || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.fornecedor || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold text-green-600">
                        R$ {typeof item.valor === 'number' ? item.valor.toFixed(2) : (item.valor || '0.00')}
                      </span>
                      {item.quantidade && (
                        <div className="text-xs text-gray-500">
                          {item.quantidade} {item.unidade}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar custo"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir custo"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Modal do Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Editar Custo' : 'Novo Custo'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alimento/Insumo *
                </label>
                <input
                  type="text"
                  value={formData.alimento}
                  onChange={(e) => setFormData({ ...formData, alimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Ração de Crescimento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Agropecuária Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 85.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unidade
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="ton">Tonelada</option>
                    <option value="saco">Saco</option>
                    <option value="litro">Litro</option>
                    <option value="unidade">Unidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="Observações sobre a compra, qualidade, condições de pagamento..."
                />
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">
                  💰 Dicas de Controle de Custos
                </h3>
                <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  <li>• Compare preços entre fornecedores</li>
                  <li>• Considere compras em maior volume</li>
                  <li>• Monitore a qualidade dos insumos</li>
                  <li>• Registre todos os custos para análise</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-lime-600 text-white py-2 px-4 rounded-lg hover:bg-lime-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
