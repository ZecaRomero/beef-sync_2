
import React, { useEffect, useMemo, useState } from 'react'

import Layout from '../../components/Layout'
import StatCard from '../../components/ui/StatCard'
import { ChartBarIcon, ChartPieIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function BusinessIntelligence() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const year = new Date().getFullYear()
        const [mRes, dRes] = await Promise.all([
          fetch(`/api/reports/monthly-stats?year=${year}`),
          fetch('/api/dashboard/stats')
        ])
        if (!mRes.ok) throw new Error('Erro ao carregar estatísticas mensais')
        if (!dRes.ok) throw new Error('Erro ao carregar dados do dashboard')
        setMonthly(await mRes.json())
        setDashboard(await dRes.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = useMemo(() => {
    if (!monthly) return null
    const labels = monthly.months
    const births = labels.map(l => monthly.data[l]?.nascimentos || 0)
    const deaths = labels.map(l => monthly.data[l]?.mortes || 0)
    const sales = labels.map(l => monthly.data[l]?.vendas || 0)

    return {
      labels,
      datasets: [
        { label: 'Nascimentos', data: births, backgroundColor: 'rgba(16, 185, 129, 0.7)' },
        { label: 'Mortes', data: deaths, backgroundColor: 'rgba(239, 68, 68, 0.7)' },
        { label: 'Vendas', data: sales, backgroundColor: 'rgba(59, 130, 246, 0.7)' }
      ]
    }
  }, [monthly])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400">Analytics com dados reais do banco.</p>
        </div>

        {loading && <div className="text-gray-600 dark:text-gray-300">Carregando dados...</div>}
        {error && <div className="text-red-600 dark:text-red-400">{error}</div>}

        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Animais Ativos" value={dashboard.activeAnimals} icon={ChartPieIcon} />
            <StatCard title="Doses Disponíveis" value={dashboard.availableDoses} icon={ChartBarIcon} />
            <StatCard title="Receita (R$)" value={Number(dashboard.totalRevenue || 0).toLocaleString('pt-BR')} icon={CurrencyDollarIcon} />
          </div>
        )}

        {chartData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nascimentos, Mortes e Vendas por Mês</h2>
            <Bar data={chartData} options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: { y: { beginAtZero: true } }
            }} />
          </div>
        )}
      </div>
    </Layout>
  )
}