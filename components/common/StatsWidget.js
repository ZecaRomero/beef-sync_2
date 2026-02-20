
import React, { useEffect, useState } from 'react'

import {
  TrendingUpIcon as ArrowTrendingUpIcon,
  TrendingDownIcon as ArrowTrendingDownIcon,
  ChartBarIcon,
} from '../ui/Icons'

export default function StatsWidget({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient = 'from-blue-500 to-purple-600',
  trend = [],
  onClick,
  loading = false,
}) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (loading) return

    const targetValue = typeof value === 'number' ? value : parseFloat(value) || 0
    const duration = 1000
    const steps = 60
    const stepValue = targetValue / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      setAnimatedValue(Math.min(stepValue * currentStep, targetValue))

      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [value, loading])

  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('R$')) {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return Math.round(val).toLocaleString('pt-BR')
  }

  const getChangeIcon = () => {
    if (!change) return null
    const changeValue = parseFloat(change)
    if (changeValue > 0) return ArrowTrendingUpIcon
    if (changeValue < 0) return ArrowTrendingDownIcon
    return null
  }

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600 dark:text-green-400'
    if (changeType === 'negative') return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const ChangeIcon = getChangeIcon()

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
      </div>
    )
  }

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl shadow-xl
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        transition-all duration-300 hover:shadow-2xl hover:scale-105
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Gradiente de fundo decorativo */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 
        group-hover:opacity-10 transition-opacity duration-300
      `} />
      
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          {Icon && (
            <div className={`
              p-3 rounded-xl bg-gradient-to-br ${gradient}
              transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
              shadow-lg
            `}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Valor Principal */}
        <div className="mb-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(animatedValue)}
          </p>
        </div>

        {/* Mudança/Tendência */}
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
            {ChangeIcon && <ChangeIcon className="h-4 w-4" />}
            <span>{change}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs mês anterior</span>
          </div>
        )}

        {/* Mini gráfico de tendência */}
        {trend && trend.length > 0 && (
          <div className="mt-4 h-12 flex items-end gap-1">
            {trend.map((value, index) => (
              <div
                key={index}
                className={`
                  flex-1 bg-gradient-to-t ${gradient} rounded-t
                  transform transition-all duration-300 hover:scale-110
                  opacity-70 hover:opacity-100
                `}
                style={{
                  height: `${(value / Math.max(...trend)) * 100}%`,
                  minHeight: '4px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicador de clicável */}
      {onClick && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChartBarIcon className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  )
}

// Grid de estatísticas
export function StatsGrid({ children, columns = 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 animate-fade-in-up`}>
      {children}
    </div>
  )
}

