
import React, { useMemo } from 'react'

import { 
  CurrencyDollarIcon,
  TrendingUpIcon as ArrowTrendingUpIcon,
  TrendingDownIcon as ArrowTrendingDownIcon,
  BanknotesIcon
} from '../ui/Icons'
import { formatCurrency } from '../../utils/formatters'

/**
 * Métricas financeiras detalhadas
 * Calcula ROI, lucro, investimento total com dados reais
 */
export default function FinancialMetrics({ animals = [], costs = [] }) {
  const metrics = useMemo(() => {
    if (!Array.isArray(animals)) return null

    // Calcular investimento total
    const totalInvestment = animals.reduce((sum, animal) => {
      return sum + (parseFloat(animal.custo_total) || 0)
    }, 0)

    // Calcular receita de vendas
    const totalRevenue = animals
      .filter(a => a.situacao === 'Vendido' && a.valor_venda)
      .reduce((sum, animal) => {
        return sum + (parseFloat(animal.valor_venda) || 0)
      }, 0)

    // Calcular valor potencial (animais ativos)
    const potentialValue = animals
      .filter(a => a.situacao === 'Ativo' && a.valor_venda)
      .reduce((sum, animal) => {
        return sum + (parseFloat(animal.valor_venda) || 0)
      }, 0)

    // Calcular lucro realizado
    const realizedProfit = totalRevenue - animals
      .filter(a => a.situacao === 'Vendido')
      .reduce((sum, animal) => sum + (parseFloat(animal.custo_total) || 0), 0)

    // ROI realizado
    const realizedROI = totalRevenue > 0 
      ? ((realizedProfit / (totalInvestment - potentialValue)) * 100)
      : 0

    // Custo médio por animal
    const avgCostPerAnimal = animals.length > 0 
      ? totalInvestment / animals.length 
      : 0

    // Animais vendidos vs ativos
    const soldAnimals = animals.filter(a => a.situacao === 'Vendido').length
    const activeAnimals = animals.filter(a => a.situacao === 'Ativo').length

    return {
      totalInvestment,
      totalRevenue,
      potentialValue,
      realizedProfit,
      realizedROI,
      avgCostPerAnimal,
      soldAnimals,
      activeAnimals
    }
  }, [animals, costs])

  if (!metrics) {
    return <div className="text-center text-gray-500">Carregando métricas...</div>
  }

  return (
    <div className="space-y-4">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-2 gap-4">
        {/* Investimento Total */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-900 dark:text-blue-300">
              Investimento
            </span>
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(metrics.totalInvestment)}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            {formatCurrency(metrics.avgCostPerAnimal)}/animal
          </p>
        </div>

        {/* Receita */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-900 dark:text-green-300">
              Receita
            </span>
          </div>
          <p className="text-xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
            {metrics.soldAnimals} vendidos
          </p>
        </div>

        {/* Lucro */}
        <div className={`${
          metrics.realizedProfit >= 0 
            ? 'bg-emerald-50 dark:bg-emerald-900/20' 
            : 'bg-red-50 dark:bg-red-900/20'
        } rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            {metrics.realizedProfit >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-xs font-medium ${
              metrics.realizedProfit >= 0
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-red-900 dark:text-red-300'
            }`}>
              Lucro
            </span>
          </div>
          <p className={`text-xl font-bold ${
            metrics.realizedProfit >= 0
              ? 'text-emerald-900 dark:text-emerald-100'
              : 'text-red-900 dark:text-red-100'
          }`}>
            {formatCurrency(Math.abs(metrics.realizedProfit))}
          </p>
          <p className={`text-xs mt-1 ${
            metrics.realizedProfit >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {metrics.realizedProfit >= 0 ? 'Positivo' : 'Negativo'}
          </p>
        </div>

        {/* ROI */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-900 dark:text-purple-300">
              ROI
            </span>
          </div>
          <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
            {metrics.realizedROI.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
            Retorno realizado
          </p>
        </div>
      </div>

      {/* Valor potencial */}
      {metrics.potentialValue > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Potencial (Ativos)
              </p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
                {formatCurrency(metrics.potentialValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.activeAnimals} animais
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Previsão de venda
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

