
import React, { useEffect, useState } from 'react'

import { useApp } from '../contexts/AppContext'
import AdvancedReports from '../components/reports/AdvancedReports'

export default function Reports() {
  const { animals, costs } = useApp()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar dados de vendas da API
    const loadSales = async () => {
      try {
        const response = await fetch('/api/sales')
        if (response.ok) {
          const data = await response.json()
          setSales(data)
        }
      } catch (error) {
        console.error('Erro ao carregar vendas:', error)
        setSales([])
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            📊 Relatórios Avançados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análises detalhadas do seu rebanho e operações
          </p>
        </div>
      </div>

      {/* Relatórios */}
      <AdvancedReports 
        animals={animals} 
        costs={costs} 
        sales={sales} 
      />
    </div>
  )
}