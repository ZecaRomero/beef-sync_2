import React, { useState, useEffect } from 'react'
import { ChartBarIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function Genealogia() {
  const [mounted, setMounted] = useState(false)
  const [arvore, setArvore] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadArvore()
    }
  }, [mounted])

  const loadArvore = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('genealogia')
      if (savedData) {
        setArvore(JSON.parse(savedData))
      } else {
        setArvore([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setArvore([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveArvore = (newData) => {
    setArvore(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('genealogia', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    const updatedData = arvore.filter(item => item.id !== id)
    saveArvore(updatedData)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
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
            <ChartBarIcon className="w-8 h-8 text-pink-600" />
            Genealogia
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Árvore genealógica</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Registro
        </button>
      </div>

      {/* Formulário de Novo Registro Genealógico */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Novo Registro Genealógico
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Animal (Filho) *
                </label>
                <input
                  type="text"
                  placeholder="Identificação do animal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pai *
                </label>
                <input
                  type="text"
                  placeholder="Identificação do pai"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mãe *
                </label>
                <input
                  type="text"
                  placeholder="Identificação da mãe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Raça
                </label>
                <input
                  type="text"
                  placeholder="Raça do animal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registro
                </label>
                <input
                  type="text"
                  placeholder="Número de registro"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  placeholder="Informações adicionais sobre a genealogia..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Registrar Genealogia
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      ) : arvore.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum registro genealógico
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece registrando relações genealógicas
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Animal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Pai</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Mãe</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {arvore.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.animal || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.pai || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.mae || '-'}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
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
    </div>
  )
}

