import React, { useState, useEffect } from 'react'
import { ScaleIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function Dietas() {
  const [mounted, setMounted] = useState(false)
  const [dietasData, setDietasData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    energia: '',
    proteina: '',
    fibra: '',
    gordura: '',
    minerais: '',
    observacoes: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadDietasData()
    }
  }, [mounted])

  const loadDietasData = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('dietas')
      if (savedData) {
        setDietasData(JSON.parse(savedData))
      } else {
        setDietasData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setDietasData([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveDietasData = (newData) => {
    setDietasData(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dietas', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta dieta?')) {
      const updatedData = dietasData.filter(item => item.id !== id)
      saveDietasData(updatedData)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome || '',
      tipo: item.tipo || '',
      energia: item.energia || '',
      proteina: item.proteina || '',
      fibra: item.fibra || '',
      gordura: item.gordura || '',
      minerais: item.minerais || '',
      observacoes: item.observacoes || ''
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.nome || !formData.tipo) {
      alert('Por favor, preencha os campos obrigatórios (Nome e Tipo)')
      return
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      nome: formData.nome,
      tipo: formData.tipo,
      energia: formData.energia,
      proteina: formData.proteina,
      fibra: formData.fibra,
      gordura: formData.gordura,
      minerais: formData.minerais,
      observacoes: formData.observacoes,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedData
    if (editingItem) {
      updatedData = dietasData.map(item =>
        item.id === editingItem.id ? newItem : item
      )
    } else {
      updatedData = [...dietasData, newItem]
    }

    saveDietasData(updatedData)
    handleCloseForm()

    const action = editingItem ? 'atualizada' : 'criada'
    alert(`Dieta ${action} com sucesso!`)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      nome: '',
      tipo: '',
      energia: '',
      proteina: '',
      fibra: '',
      gordura: '',
      minerais: '',
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
              Planos Nutricionais
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Gerenciar dietas e planos nutricionais</p>
          </div>
          <button
            onClick={() => {
              console.log('Botão Nova Dieta clicado!', { showForm, mounted })
              setShowForm(!showForm)
            }}
            className="flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Dieta
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : dietasData.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
            <ScaleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma dieta criada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece criando o primeiro plano nutricional
            </p>
            <button
              onClick={() => {
                console.log('Botão Criar Dieta clicado!', { showForm, mounted })
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
            >
              <PlusIcon className="w-5 h-5" />
              Criar Dieta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Energia</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Proteína</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fibra</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dietasData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.nome || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tipo === 'Crescimento' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.tipo === 'Engorda' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        item.tipo === 'Manutenção' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        item.tipo === 'Reprodução' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                        item.tipo === 'Lactação' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {item.tipo || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.energia ? (
                        <span className="font-semibold text-lime-600">{item.energia} Mcal/kg</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.proteina ? (
                        <span className="font-semibold text-blue-600">{item.proteina}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.fibra ? (
                        <span className="font-semibold text-amber-600">{item.fibra}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar dieta"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir dieta"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Editar Dieta' : 'Nova Dieta'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Dieta *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Dieta de Crescimento"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecione o tipo...</option>
                    <option value="Crescimento">Crescimento</option>
                    <option value="Engorda">Engorda</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Reprodução">Reprodução</option>
                    <option value="Lactação">Lactação</option>
                    <option value="Terminação">Terminação</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Energia (Mcal/kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.energia}
                    onChange={(e) => setFormData({ ...formData, energia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 2.8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proteína (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.proteina}
                    onChange={(e) => setFormData({ ...formData, proteina: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 14.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fibra (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fibra}
                    onChange={(e) => setFormData({ ...formData, fibra: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 25.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gordura (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.gordura}
                    onChange={(e) => setFormData({ ...formData, gordura: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 3.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minerais (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.minerais}
                  onChange={(e) => setFormData({ ...formData, minerais: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 8.0"
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
                  placeholder="Observações sobre a dieta, ingredientes, recomendações..."
                />
              </div>

              <div className="bg-lime-50 dark:bg-lime-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-lime-900 dark:text-lime-200 mb-2">
                  💡 Dicas Nutricionais
                </h3>
                <ul className="text-sm text-lime-800 dark:text-lime-300 space-y-1">
                  <li>• Dietas de crescimento: 16-18% proteína, 2.8-3.0 Mcal/kg</li>
                  <li>• Dietas de engorda: 12-14% proteína, 2.6-2.8 Mcal/kg</li>
                  <li>• Manutenção: 8-10% proteína, 2.2-2.4 Mcal/kg</li>
                  <li>• Fibra: 20-30% para ruminantes, 5-15% para monogástricos</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-lime-600 text-white py-2 px-4 rounded-lg hover:bg-lime-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Criar Dieta'}
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
