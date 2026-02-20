import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  TrendingUpIcon,
  SparklesIcon,
  BeakerIcon
} from '../ui/Icons'

export default function NascimentosStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    loadStatistics()
  }, [period])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nascimentos/statistics?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de nascimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex gap-2">
        {['all', 'month', 'quarter', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {p === 'all' ? 'Todos' : p === 'month' ? 'Este Mês' : p === 'quarter' ? 'Trimestre' : 'Ano'}
          </button>
        ))}
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Nascimentos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total_nascimentos || 0}
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Machos</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.total_machos || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total_nascimentos > 0 ? ((stats.total_machos / stats.total_nascimentos) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fêmeas</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">
                {stats.total_femeas || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total_nascimentos > 0 ? ((stats.total_femeas / stats.total_nascimentos) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-pink-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peso Médio</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.peso_medio ? parseFloat(stats.peso_medio).toFixed(1) : '0.0'}kg
              </p>
            </div>
            <TrendingUpIcon className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Estatísticas por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            Por Tipo de Nascimento
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">FIV</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.total_fiv || 0} nascimentos
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-purple-600">
                  {stats.total_nascimentos > 0 ? ((stats.total_fiv / stats.total_nascimentos) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">IA</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.total_ia || 0} nascimentos
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">
                  {stats.total_nascimentos > 0 ? ((stats.total_ia / stats.total_nascimentos) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Natural</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.total_natural || 0} nascimentos
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {stats.total_nascimentos > 0 ? ((stats.total_natural / stats.total_nascimentos) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Mães */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-pink-600" />
            Top Mães
          </h3>
          <div className="space-y-3">
            {stats.top_maes && stats.top_maes.length > 0 ? (
              stats.top_maes.slice(0, 5).map((mae, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {mae.identificacao || `${mae.serie}${mae.rg}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mae.total_nascimentos || 0} nascimentos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mae.total_machos || 0}M / {mae.total_femeas || 0}F
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhum dado disponível
              </p>
            )}
          </div>
        </Card>

        {/* Tendência Mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Tendência Mensal
          </h3>
          <div className="space-y-3">
            {stats.tendencia_mensal && stats.tendencia_mensal.length > 0 ? (
              stats.tendencia_mensal.slice(-6).map((mes, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mes.mes}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {mes.total || 0} nascimentos
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${((mes.total || 0) / (stats.max_mensal || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhum dado disponível
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
