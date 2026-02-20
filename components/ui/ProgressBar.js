import React from 'react'
import { cn } from '../../lib/utils.js'

export default function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  showLabel = true,
  size = 'md',
  animated = true,
  className = '',
  ...props
}) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600'
  }
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  }
  
  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {value} / {max}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          )}
        </div>
      </div>
    </div>
  )
}
