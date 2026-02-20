import React, { useState, useEffect } from 'react'
import { ScaleIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function ConsumoRacao() {
  const [mounted, setMounted] = useState(false)
  const [consumoData, setConsumoData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    lote: '',
    racao: '',
    consumo: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadConsumoData()
    }
  }, [mounted])

  const loadConsumoData = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('consumoRacao')
      if (savedData) {
        setConsumoData(JSON.parse(savedData))
      } else {
        setConsumoData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setConsumoData([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveConsumoData = (newData) => {
    setConsumoData(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('consumoRacao', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      const updatedData = consumoData.filter(item => item.id !== id)
      saveConsumoData(updatedData)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      lote: item.lote || '',
      racao: item.racao || '',
      consumo: item.consumo || '',
      data: item.data || new Date().toISOString().split('T')[0],
      observacoes: item.observacoes || ''
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.lote || !formData.racao || !formData.consumo) {
      alert('Por favor, preencha os campos obrigatórios (Lote, Ração e Consumo)')
      return
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      lote: formData.lote,
      racao: formData.racao,
      consumo: parseFloat(formData.consumo),
      data: formData.data,
      observacoes: formData.observacoes,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedData
    if (editingItem) {
      updatedData = consumoData.map(item =>
        item.id === editingItem.id ? newItem : item
      )
    } else {
      updatedData = [...consumoData, newItem]
    }

    saveConsumoData(updatedData)
    handleCloseForm()

    const action = editingItem ? 'atualizado' : 'adicionado'
    alert(`Registro ${action} com sucesso!`)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      lote: '',
      racao: '',
      consumo: '',
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
              <ScaleIcon className="w-8 h-8 text-lime-600" />
              Consumo de Ração
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Monitorar e registrar consumo de ração</p>
          </div>
          <button
            onClick={() => {
              console.log('Botão Novo Registro clicado!', { showForm, mounted })
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Registro
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : consumoData.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
            <ScaleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum registro de consumo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece adicionando o primeiro registro de consumo de ração
            </p>
            <button
              onClick={() => {
                console.log('Botão Adicionar Registro clicado!', { showForm, mounted })
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Registro
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Lote</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ração</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Consumo (kg)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {consumoData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold text-lime-600">{item.lote || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.racao || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.consumo ? (
                        <span className="font-semibold text-blue-600">{item.consumo} kg</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar registro"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir registro"
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
                {editingItem ? 'Editar Registro' : 'Novo Registro'}
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
                  Lote *
                </label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Lote A1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Ração *
                </label>
                <select
                  value={formData.racao}
                  onChange={(e) => setFormData({ ...formData, racao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Selecione o tipo de ração...</option>
                  <option value="Ração de Crescimento">Ração de Crescimento</option>
                  <option value="Ração de Engorda">Ração de Engorda</option>
                  <option value="Ração de Manutenção">Ração de Manutenção</option>
                  <option value="Ração de Reprodução">Ração de Reprodução</option>
                  <option value="Ração de Lactação">Ração de Lactação</option>
                  <option value="Ração de Terminação">Ração de Terminação</option>
                  <option value="Concentrado">Concentrado</option>
                  <option value="Volumoso">Volumoso</option>
                  <option value="Suplemento Mineral">Suplemento Mineral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Consumo (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.consumo}
                  onChange={(e) => setFormData({ ...formData, consumo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 25.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data do Registro
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                />
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
                  placeholder="Observações sobre o consumo, qualidade da ração, comportamento dos animais..."
                />
              </div>

              <div className="bg-lime-50 dark:bg-lime-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-lime-900 dark:text-lime-200 mb-2">
                  📊 Dicas de Consumo
                </h3>
                <ul className="text-sm text-lime-800 dark:text-lime-300 space-y-1">
                  <li>• Bovinos: 2-3% do peso vivo em matéria seca</li>
                  <li>• Suínos: 3-4% do peso vivo</li>
                  <li>• Aves: 8-12% do peso vivo</li>
                  <li>• Monitore variações no consumo diário</li>
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
