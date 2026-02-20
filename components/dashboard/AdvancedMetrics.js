
import React, { useEffect, useState } from 'react'

import { Card, CardBody, CardHeader } from '../ui/Card'
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '../ui/Icons'
import logger from '../../utils/logger'

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'blue', trend = null }) => {
  const colorConfigs = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  }

  const bgColor = colorConfigs[color] || colorConfigs.blue

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0">
      <CardBody className={`bg-gradient-to-br ${bgColor} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/90 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold mb-2">{value}</p>
            {change && (
              <div className="flex items-center">
                {changeType === 'increase' ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-300 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-300 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {change}
                </span>
                <span className="text-white/70 text-sm ml-2">vs período anterior</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

const TrendChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Sem dados para exibir
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  return (
    <div className="h-32 relative">
      <svg className="w-full h-full" viewBox="0 0 400 120">
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="400"
            y2={y}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth="1"
          />
        ))}
        
        {/* Trend line */}
        <polyline
          points={data.map((d, i) => 
            `${(i / (data.length - 1)) * 400},${100 - ((d.value - minValue) / (maxValue - minValue)) * 80}`
          ).join(' ')}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
        />
        
        {/* Area under curve */}
        <polygon
          points={`
            0,100
            ${data.map((d, i) => 
              `${(i / (data.length - 1)) * 400},${100 - ((d.value - minValue) / (maxValue - minValue)) * 80}`
            ).join(' ')}
            400,100
          `}
          fill="url(#trendGradient)"
        />
      </svg>
    </div>
  )
}

export default function AdvancedMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState({})

  useEffect(() => {
    loadMetrics()
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard/advanced-metrics')
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar métricas: ${response.status}`)
      }
      
      const data = await response.json()
      setMetrics(data)
      
      // Simular dados de tendência (em produção, viriam da API)
      setTrends({
        animals: [
          { date: '2024-01', value: 45 },
          { date: '2024-02', value: 52 },
          { date: '2024-03', value: 48 },
          { date: '2024-04', value: 61 },
          { date: '2024-05', value: 58 },
          { date: '2024-06', value: 67 }
        ],
        revenue: [
          { date: '2024-01', value: 12500 },
          { date: '2024-02', value: 14200 },
          { date: '2024-03', value: 13800 },
          { date: '2024-04', value: 16500 },
          { date: '2024-05', value: 15200 },
          { date: '2024-06', value: 18900 }
        ]
      })
      
      logger.info('Métricas avançadas carregadas com sucesso')
    } catch (error) {
      logger.error('Erro ao carregar métricas avançadas:', error)
      
      // Dados padrão em caso de erro
      setMetrics({
        totalAnimals: 0,
        activeAnimals: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalCosts: 0,
        monthlyCosts: 0,
        profitability: 0,
        animalsPerMonth: 0,
        revenueGrowth: 0,
        costReduction: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Animais"
          value={metrics?.totalAnimals || 0}
          change={`+${metrics?.animalsPerMonth || 0} este mês`}
          changeType="increase"
          icon={UserGroupIcon}
          color="blue"
        />
        
        <MetricCard
          title="Receita Mensal"
          value={`R$ ${(metrics?.monthlyRevenue || 0).toLocaleString('pt-BR')}`}
          change={`+${metrics?.revenueGrowth || 0}%`}
          changeType="increase"
          icon={CurrencyDollarIcon}
          color="green"
        />
        
        <MetricCard
          title="Custos Mensais"
          value={`R$ ${(metrics?.monthlyCosts || 0).toLocaleString('pt-BR')}`}
          change={`-${metrics?.costReduction || 0}%`}
          changeType="decrease"
          icon={ChartBarIcon}
          color="orange"
        />
        
        <MetricCard
          title="Lucratividade"
          value={`${metrics?.profitability || 0}%`}
          change="vs mês anterior"
          icon={TrendingUpIcon}
          color="purple"
        />
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
              Crescimento do Rebanho
            </h3>
          </CardHeader>
          <CardBody>
            <TrendChart data={trends.animals} title="Animais" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
              Evolução da Receita
            </h3>
          </CardHeader>
          <CardBody>
            <TrendChart data={trends.revenue} title="Receita" />
          </CardBody>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Animais Ativos"
          value={metrics?.activeAnimals || 0}
          color="red"
        />
        
        <MetricCard
          title="Receita Total"
          value={`R$ ${(metrics?.totalRevenue || 0).toLocaleString('pt-BR')}`}
          icon={CurrencyDollarIcon}
          color="green"
        />
        
        <MetricCard
          title="Custos Totais"
          value={`R$ ${(metrics?.totalCosts || 0).toLocaleString('pt-BR')}`}
          icon={ChartBarIcon}
          color="orange"
        />
        
        <MetricCard
          title="Sêmen Disponível"
          value={metrics?.availableSemen || 0}
          color="purple"
        />
      </div>

      {/* Indicadores de Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            Indicadores de Performance
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics?.efficiency || 85}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Eficiência Operacional
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics?.productivity || 92}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Produtividade
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics?.quality || 88}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Qualidade do Rebanho
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
