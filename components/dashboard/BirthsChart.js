
import React, { useMemo } from 'react'

import { CalendarIcon } from '../ui/Icons'

/**
 * Gráfico de nascimentos dos últimos meses
 * Usa dados reais do banco
 */
export default function BirthsChart({ births = [] }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(births) || births.length === 0) {
      return []
    }

    // Agrupar nascimentos por mês
    const monthlyData = {}
    const now = new Date()
    
    // Inicializar últimos 6 meses com zero
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      monthlyData[key] = { month: monthName, count: 0, key }
    }

    // Contar nascimentos por mês
    births.forEach(birth => {
      if (!birth.data_nascimento) return
      
      const date = new Date(birth.data_nascimento)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (monthlyData[key]) {
        monthlyData[key].count++
      }
    })

    return Object.values(monthlyData)
  }, [births])

  const maxCount = useMemo(() => {
    return Math.max(...chartData.map(d => d.count), 1)
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum nascimento registrado nos últimos 6 meses</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de barras simples */}
      <div className="flex items-end justify-between h-40 gap-2">
        {chartData.map((data, index) => {
          const height = (data.count / maxCount) * 100
          
          return (
            <div key={data.key} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-full">
                {data.count > 0 && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {data.count}
                  </span>
                )}
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 dark:from-green-600 dark:to-green-500 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                  style={{ height: `${height}%`, minHeight: data.count > 0 ? '4px' : '0' }}
                  title={`${data.month}: ${data.count} nascimento(s)`}
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {data.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {births.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total 6 meses</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(births.length / 6).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Média/mês</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData[chartData.length - 1]?.count || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mês atual</p>
        </div>
      </div>
    </div>
  )
}

