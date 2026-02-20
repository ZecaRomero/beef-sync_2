import React, { useState, useEffect } from 'react'
import { ChartBarIcon, PlusIcon, PencilIcon, XMarkIcon } from '../../components/ui/Icons'

export default function AnalisNutricional() {
  const [mounted, setMounted] = useState(false)
  const [analisisData, setAnalisisData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadAnalisisData()
    }
  }, [mounted])

  const loadAnalisisData = () => {
    try {
      setIsLoading(true)
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const savedData = localStorage.getItem('analisNutricional')
      if (savedData) {
        setAnalisisData(JSON.parse(savedData))
      } else {
        setAnalisisData([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setAnalisisData([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveAnalisisData = (newData) => {
    setAnalisisData(newData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('analisNutricional', JSON.stringify(newData))
    }
  }

  const handleDelete = (id) => {
    const updatedData = analisisData.filter(item => item.id !== id)
    saveAnalisisData(updatedData)
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
              <ChartBarIcon className="w-8 h-8 text-lime-600" />
              Análise Nutricional
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Análise de alimentos e nutrientes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Análise
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : analisisData.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma análise registrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece adicionando a primeira análise nutricional
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Análise
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Alimento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Proteína (%)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fibra (%)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Energia (Mcal)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {analisisData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.alimento || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.proteina || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.fibra || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.energia || '-'}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
