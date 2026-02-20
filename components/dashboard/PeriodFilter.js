
import React, { useState } from 'react'

import { CalendarIcon } from '../ui/Icons'
import Button from '../ui/Button'

/**
 * Filtro de período para o dashboard
 * Permite selecionar intervalos de tempo predefinidos
 */
export default function PeriodFilter({ onPeriodChange, currentPeriod = '30d' }) {
  const periods = [
    { value: '7d', label: '7 dias', days: 7 },
    { value: '30d', label: '30 dias', days: 30 },
    { value: '90d', label: '90 dias', days: 90 },
    { value: '180d', label: '6 meses', days: 180 },
    { value: '365d', label: '1 ano', days: 365 },
    { value: 'all', label: 'Tudo', days: null }
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Período:
      </span>
      <div className="flex gap-2 flex-wrap">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value, period.days)}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-all
              ${currentPeriod === period.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  )
}

