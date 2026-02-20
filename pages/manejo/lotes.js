import React, { useState, useEffect } from 'react'
import { UserGroupIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function Lotes() {
  const [mounted, setMounted] = useState(false)
  const [lotes, setLotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [animais, setAnimais] = useState([])
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    animais_selecionados: [],
    data_criacao: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadLotes()
      loadAnimais()
    }
  }, [mounted])

  const loadLotes = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('lotes')
      if (savedData) {
        setLotes(JSON.parse(savedData))
      } else {
        setLotes([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveLotes = (newData) => {
    setLotes(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lotes', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
      const updatedData = lotes.filter(item => item.id !== id)
      saveLotes(updatedData)
    }
  }

  const loadAnimais = async () => {
    try {
      const response = await fetch('/api/animals')
      if (response.ok) {
        const data = await response.json()
        setAnimais(data.animals || [])
      } else {
        const savedAnimals = localStorage.getItem('animals')
        if (savedAnimals) {
          setAnimais(JSON.parse(savedAnimals))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error)
      const savedAnimals = localStorage.getItem('animals')
      if (savedAnimals) {
        setAnimais(JSON.parse(savedAnimals))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nome) {
      alert('Por favor, preencha o nome do lote')
      return
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      nome: formData.nome,
      descricao: formData.descricao,
      animais_selecionados: formData.animais_selecionados,
      quantidade_animais: formData.animais_selecionados.length,
      data_criacao: formData.data_criacao,
      observacoes: formData.observacoes,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedData
    if (editingItem) {
      updatedData = lotes.map(item => 
        item.id === editingItem.id ? newItem : item
      )
    } else {
      updatedData = [...lotes, newItem]
    }

    saveLotes(updatedData)
    handleCloseForm()
    
    const action = editingItem ? 'atualizado' : 'criado'
    alert(`Lote ${action} com sucesso!`)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome || '',
      descricao: item.descricao || '',
      animais_selecionados: item.animais_selecionados || [],
      data_criacao: item.data_criacao || new Date().toISOString().split('T')[0],
      observacoes: item.observacoes || ''
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      nome: '',
      descricao: '',
      animais_selecionados: [],
      data_criacao: new Date().toISOString().split('T')[0],
      observacoes: ''
    })
  }

  const handleAnimalToggle = (animalId) => {
    setFormData(prev => ({
      ...prev,
      animais_selecionados: prev.animais_selecionados.includes(animalId)
        ? prev.animais_selecionados.filter(id => id !== animalId)
        : [...prev.animais_selecionados, animalId]
    }))
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
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
            <UserGroupIcon className="w-8 h-8 text-amber-600" />
            Organização em Lotes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Gerenciar grupos de animais</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Lote
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      ) : lotes.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum lote criado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece criando o primeiro lote
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            <PlusIcon className="w-5 h-5" />
            Criar Lote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lotes.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.nome || '-'}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    title="Editar lote"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.quantidadeAnimais || 0} animais
              </p>
              {item.descricao && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{item.descricao}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal do Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Editar Lote' : 'Novo Lote'}
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
                    Nome do Lote *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Lote Desmama 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Criação
                  </label>
                  <input
                    type="date"
                    value={formData.data_criacao}
                    onChange={(e) => setFormData({...formData, data_criacao: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Animais para desmama em janeiro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar Animais ({formData.animais_selecionados.length} selecionados)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {animais.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum animal disponível</p>
                  ) : (
                    <div className="space-y-2">
                      {animais.map((animal) => (
                        <label key={animal.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.animais_selecionados.includes(animal.id)}
                            onChange={() => handleAnimalToggle(animal.id)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {animal.serie} - {animal.rg} ({animal.sexo}) - {animal.raca}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="Informações adicionais sobre o lote..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Criar Lote'}
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

