import React, { useState, useEffect } from 'react'
import StatCard from '../ui/StatCard'
import ModernCard from '../ui/ModernCard'
import { CardBody } from '../ui/ModernCard'
import AnimatedCard from '../ui/AnimatedCard'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function ModernDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com animação */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Moderno
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visão geral do seu rebanho em tempo real
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
          disabled={refreshing}
        >
          <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard delay={0}>
          <StatCard
            title="Total de Animais"
            value={stats?.totalAnimals || 0}
            icon={UserGroupIcon}
            color="blue"
            trend="up"
            trendValue="+12%"
          />
        </AnimatedCard>
        
        <AnimatedCard delay={100}>
          <StatCard
            title="Receita Total"
            value={`R$ ${Number(stats?.totalRevenue || 0).toLocaleString('pt-BR')}`}
            icon={CurrencyDollarIcon}
            color="green"
            trend="up"
            trendValue="+8%"
          />
        </AnimatedCard>
        
        <AnimatedCard delay={200}>
          <StatCard
            title="Nascimentos"
            value={stats?.birthsThisMonth || 0}
            icon={ChartBarIcon}
            color="purple"
            trend={parseFloat(stats?.birthsChange || 0) > 0 ? 'up' : 'down'}
            trendValue={`${stats?.birthsChange || 0}%`}
          />
        </AnimatedCard>
        
        <AnimatedCard delay={300}>
          <StatCard
            title="Performance"
            value="92%"
            icon={TrendingUpIcon}
            color="orange"
            trend="up"
            trendValue="+5%"
          />
        </AnimatedCard>
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard delay={400} className="cursor-pointer" onClick={() => window.location.href = '/animals'}>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gerenciar Animais
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cadastrar e visualizar animais
                </p>
              </div>
              <Badge variant="primary">Novo</Badge>
            </div>
          </CardBody>
        </AnimatedCard>

        <AnimatedCard delay={500} className="cursor-pointer" onClick={() => window.location.href = '/importacao-excel'}>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Importação Excel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Importar dados em massa
                </p>
              </div>
              <Badge variant="success">Rápido</Badge>
            </div>
          </CardBody>
        </AnimatedCard>

        <AnimatedCard delay={600} className="cursor-pointer" onClick={() => window.location.href = '/comercial/analise-mercado'}>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <TrendingUpIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Análise de Mercado
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ROI e análise de vendas
                </p>
              </div>
              <Badge variant="purple">IA</Badge>
            </div>
          </CardBody>
        </AnimatedCard>
      </div>

      {/* Gráficos e Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={700}>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Progresso Mensal
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nascimentos</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">75%</span>
                </div>
                <ProgressBar value={75} max={100} color="green" showLabel={false} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendas</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">60%</span>
                </div>
                <ProgressBar value={60} max={100} color="blue" showLabel={false} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inseminações</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">85%</span>
                </div>
                <ProgressBar value={85} max={100} color="purple" showLabel={false} />
              </div>
            </div>
          </CardBody>
        </AnimatedCard>

        <AnimatedCard delay={800}>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status do Rebanho
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animais Ativos</span>
                <Badge variant="success">{stats?.totalAnimals || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Em Gestação</span>
                <Badge variant="primary">24</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prontos para Venda</span>
                <Badge variant="purple">12</Badge>
              </div>
            </div>
          </CardBody>
        </AnimatedCard>
      </div>
    </div>
  )
}
