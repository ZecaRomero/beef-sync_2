import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '../../components/ui/Icons'

export default function SmartAlerts() {
  const [mounted, setMounted] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    loadAlerts()
    const interval = setInterval(loadAlerts, 20000)
    return () => clearInterval(interval)
  }, [mounted])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const animals = JSON.parse(localStorage.getItem('animals') || '[]')
      const births = JSON.parse(localStorage.getItem('birthData') || '[]')
      const newAlerts = []

      // Verificar receptoras atrasadas
      const atrasadas = births.filter(b => b.status === 'gestante_atrasada')
      if (atrasadas.length > 0) {
        newAlerts.push({
          id: 'receptoras-atrasadas',
          type: 'warning',
          title: 'Receptoras Atrasadas',
          message: `${atrasadas.length} receptora(s) com atraso na gestação`,
          priority: 'high',
          timestamp: new Date()
        })
      }

      // Verificar animais com custos elevados
      const custosElevados = animals.filter(a => (a.custoTotal || 0) > 5000)
      if (custosElevados.length > 0) {
        newAlerts.push({
          id: 'custos-elevados',
          type: 'info',
          title: 'Custos Elevados Detectados',
          message: `${custosElevados.length} animal(is) com custo acima de R$ 5.000`,
          priority: 'medium',
          timestamp: new Date()
        })
      }

      // Verificar perdas
      const perdas = animals.filter(a => a.situacao === 'Morto')
      if (perdas.length > 0) {
        newAlerts.push({
          id: 'perdas-registradas',
          type: 'error',
          title: 'Perdas no Rebanho',
          message: `${perdas.length} animal(is) com óbito registrado`,
          priority: 'high',
          timestamp: new Date()
        })
      }

      // Verificar nascimentos recentes
      const nascimentosRecentes = births.filter(b => {
        if (b.status !== 'nascido' || !b.data) return false
        const dias = Math.floor((new Date() - new Date(b.data)) / (1000 * 60 * 60 * 24))
        return dias <= 7 && dias >= 0
      })
      if (nascimentosRecentes.length > 0) {
        newAlerts.push({
          id: 'nascimentos-recentes',
          type: 'success',
          title: 'Nascimentos Recentes',
          message: `${nascimentosRecentes.length} nascimento(s) registrado(s) na última semana`,
          priority: 'low',
          timestamp: new Date()
        })
      }

      setAlerts(newAlerts)
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />
      default:
        return <BellIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-500'
    }
  }

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filterType)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BellIcon className="h-8 w-8 text-blue-600" />
            Alertas Inteligentes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Notificações automáticas e eventos importantes
          </p>
        </div>
        <Button onClick={loadAlerts} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({alerts.length})
        </button>
        <button
          onClick={() => setFilterType('error')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Críticos
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Avisos
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Nenhum alerta no momento
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Tudo está funcionando normalmente em seu rebanho
            </p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`p-4 flex items-start justify-between ${getAlertColor(alert.type)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {alert.timestamp.toLocaleTimeString('pt-BR')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}>
                      Prioridade: {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
