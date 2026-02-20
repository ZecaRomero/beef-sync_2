
import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import Layout from '../../components/Layout'
import StatCard from '../../components/ui/StatCard'
import { ChartBarIcon, CurrencyDollarIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function ComercialDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) throw new Error('Falha ao carregar estatísticas do dashboard')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Área Comercial</h1>
          <p className="text-gray-600 dark:text-gray-400">Métricas em tempo real com dados 100% reais.</p>
        </div>

        {loading && (
          <div className="text-gray-600 dark:text-gray-300">Carregando métricas...</div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total de Animais" value={stats.totalAnimals} icon={UsersIcon} />
            <StatCard title="Nascimentos no mês" value={stats.birthsThisMonth} icon={ChartBarIcon} trend={parseFloat(stats.birthsChange) > 0 ? 'up' : (parseFloat(stats.birthsChange) < 0 ? 'down' : 'neutral')} trendValue={`${stats.birthsChange}% vs mês anterior`} />
            <StatCard title="Receita total (R$)" value={Number(stats.totalRevenue || 0).toLocaleString('pt-BR')} icon={CurrencyDollarIcon} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/comercial/analise-mercado" className="block">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg border border-purple-300 dark:border-purple-600 p-6 hover:shadow-lg transition-all text-white">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6" />
                Análise de Mercado & ROI
              </h2>
              <p className="text-purple-100">Análise inteligente de animais aptos para venda</p>
            </div>
          </Link>
          <Link href="/comercial/bi" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Intelligence</h2>
              <p className="text-gray-600 dark:text-gray-400">Analytics avançados e gráficos com dados do sistema.</p>
            </div>
          </Link>
          <Link href="/comercial/relatorios" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatórios</h2>
              <p className="text-gray-600 dark:text-gray-400">Gere relatórios PDF/Excel com dados reais.</p>
            </div>
          </Link>
          <Link href="/estoque-semen" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Estoque de Sêmen</h2>
              <p className="text-gray-600 dark:text-gray-400">Visão rápida do estoque e alertas.</p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  )
}