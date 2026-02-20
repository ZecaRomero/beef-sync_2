import React, { useState, useEffect } from 'react'
import { BeakerIcon, ClockIcon, ExclamationTriangleIcon } from '../ui/Icons'

export default function ExamesAndrologicosNotifications() {
  const [examesPendentes, setExamesPendentes] = useState([])
  const [examesVencidos, setExamesVencidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExamesNotifications()
  }, [])

  const loadExamesNotifications = async () => {
    try {
      const response = await fetch('/api/reproducao/exames-andrologicos')
      if (response.ok) {
        const exames = await response.json()
        
        const hoje = new Date()
        const pendentes = exames.filter(e => 
          e.resultado === 'Pendente' && 
          e.status === 'Ativo'
        )
        
        const vencidos = pendentes.filter(e => {
          const dataExame = new Date(e.data_exame)
          return dataExame < hoje
        })

        setExamesPendentes(pendentes)
        setExamesVencidos(vencidos)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações de exames:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDiasAtraso = (dataExame) => {
    const hoje = new Date()
    const data = new Date(dataExame)
    const diffTime = hoje - data
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (examesPendentes.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Exames Vencidos - Prioridade Alta */}
      {examesVencidos.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Exames Andrológicos Vencidos ({examesVencidos.length})
            </h3>
          </div>
          <div className="space-y-2">
            {examesVencidos.slice(0, 3).map((exame) => (
              <div key={exame.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-red-700 dark:text-red-300">
                    {exame.touro} (RG: {exame.rg})
                  </span>
                  <div className="text-red-600 dark:text-red-400">
                    Previsto para: {formatDate(exame.data_exame)}
                  </div>
                </div>
                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs">
                  {getDiasAtraso(exame.data_exame)} dias de atraso
                </span>
              </div>
            ))}
            {examesVencidos.length > 3 && (
              <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                E mais {examesVencidos.length - 3} exames vencidos...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exames Pendentes - Próximos */}
      {examesPendentes.length > examesVencidos.length && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Exames Andrológicos Pendentes ({examesPendentes.length - examesVencidos.length})
            </h3>
          </div>
          <div className="space-y-2">
            {examesPendentes
              .filter(e => !examesVencidos.includes(e))
              .slice(0, 3)
              .map((exame) => (
                <div key={exame.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">
                      {exame.touro} (RG: {exame.rg})
                    </span>
                    <div className="text-yellow-600 dark:text-yellow-400">
                      Agendado para: {formatDate(exame.data_exame)}
                    </div>
                  </div>
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                    Reagendado
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Informação sobre reagendamento automático */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <BeakerIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Exames com resultado "Inapto" são automaticamente reagendados para 30 dias depois.
          </span>
        </div>
      </div>
    </div>
  )
}