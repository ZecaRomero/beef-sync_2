import React, { useState, useEffect } from 'react'
import { 
  ServerIcon, 
  DatabaseIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import ApiHealthMonitor from './ApiHealthMonitor'

const SystemDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    database: { status: 'loading', connections: 0, queries: 0 },
    performance: { responseTime: 0, uptime: 0, memory: 0 },
    errors: { count: 0, recent: [] },
    alerts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
    
    // Atualizar stats a cada 30 segundos
    const interval = setInterval(fetchSystemStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      
      // Buscar stats do sistema
      const [dbResponse, healthResponse, statsResponse] = await Promise.all([
        fetch('/api/database/test'),
        fetch('/api/healthz'),
        fetch('/api/system-check')
      ])

      const dbData = await dbResponse.json()
      const healthData = await healthResponse.json()
      const statsData = await statsResponse.json()

      setSystemStats({
        database: {
          status: dbData.success ? 'healthy' : 'error',
          connections: dbData.poolInfo?.totalCount || 0,
          queries: dbData.poolInfo?.idleCount || 0,
          version: dbData.version || 'N/A'
        },
        performance: {
          responseTime: healthData.responseTime || 0,
          uptime: healthData.uptime || 0,
          memory: healthData.memory || 0
        },
        errors: {
          count: statsData.errors?.length || 0,
          recent: statsData.errors?.slice(0, 5) || []
        },
        alerts: statsData.alerts || []
      })
    } catch (error) {
      console.error('Erro ao buscar stats do sistema:', error)
      setSystemStats(prev => ({
        ...prev,
        database: { ...prev.database, status: 'error' }
      }))
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatMemory = (bytes) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard do Sistema
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Monitoramento e status geral do Beef Sync
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Sistema Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DatabaseIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Banco de Dados
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {systemStats.database.status === 'healthy' ? 'OK' : 'ERRO'}
                </p>
                {systemStats.database.status === 'healthy' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {systemStats.database.connections} conexões ativas
              </p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Performance
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {systemStats.performance.responseTime}ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tempo de resposta médio
              </p>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Uptime
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatUptime(systemStats.performance.uptime)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tempo online
              </p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <CpuChipIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Memória
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatMemory(systemStats.performance.memory)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Uso atual
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Health Monitor */}
      <ApiHealthMonitor />

      {/* Alerts & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertas do Sistema
          </h3>
          
          {systemStats.alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum alerta ativo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemStats.alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {alert.title}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Errors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Erros Recentes
          </h3>
          
          {systemStats.errors.recent.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum erro recente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemStats.errors.recent.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error.message}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informações do Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Versão do Sistema
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Beef Sync v3.0.0
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Banco de Dados
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {systemStats.database.version}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Ambiente
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {process.env.NODE_ENV || 'development'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemDashboard