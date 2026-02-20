import React, { useState, useEffect } from 'react'
import { CalendarIcon, CurrencyDollarIcon, BeakerIcon } from './ui/Icons'
import LoadingSpinner from './ui/LoadingSpinner'

export default function DNAHistorySection({ animalId }) {
  const [envios, setEnvios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (animalId) {
      loadEnvios()
    }
  }, [animalId])

  const loadEnvios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/dna/animal/${animalId}`)
      
      if (response.ok) {
        const data = await response.json()
        setEnvios(data.data?.envios || [])
      } else {
        setError('Erro ao carregar histórico de DNA')
      }
    } catch (error) {
      console.error('Erro ao carregar envios de DNA:', error)
      setError('Erro ao carregar histórico de DNA')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (envios.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Histórico de Envios ({envios.length})
      </h3>
      
      <div className="space-y-3">
        {envios.map((envio, index) => (
          <div 
            key={envio.envio_id || index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Laboratório */}
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-gray-400" />
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  envio.laboratorio === 'VRGEN' 
                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {envio.laboratorio}
                </span>
              </div>

              {/* Data */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(envio.data_envio).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Observações */}
              {envio.observacoes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {envio.observacoes}
                </div>
              )}
            </div>

            {/* Custo */}
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                R$ {parseFloat(envio.custo_por_animal).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
