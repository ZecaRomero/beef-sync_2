
import React, { useMemo } from 'react'

import { ChartBarIcon } from '../ui/Icons'

/**
 * Gráfico de distribuição por raça
 * Usa dados reais dos animais
 */
export default function BreedDistribution({ animals = [] }) {
  const breedData = useMemo(() => {
    if (!Array.isArray(animals) || animals.length === 0) {
      return []
    }

    // Contar animais por raça
    const breedCounts = {}
    animals.forEach(animal => {
      const breed = animal.raca || 'Não informada'
      breedCounts[breed] = (breedCounts[breed] || 0) + 1
    })

    // Converter para array e ordenar por quantidade
    return Object.entries(breedCounts)
      .map(([breed, count]) => ({
        breed,
        count,
        percentage: (count / animals.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 raças
  }, [animals])

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500'
  ]

  if (breedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum animal cadastrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barras de progresso */}
      <div className="space-y-3">
        {breedData.map((data, index) => (
          <div key={data.breed} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {data.breed}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {data.count} ({data.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {breedData.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Raças diferentes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {breedData[0]?.breed?.split(' ')[0] || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Raça predominante</p>
          </div>
        </div>
      </div>
    </div>
  )
}

