import React from 'react'
import { CardProps, CardHeaderProps, CardBodyProps } from '../../types/components'
import { cn } from '../../utils/cn.js'

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700'
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center space-x-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  )
}

const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  noPadding = false,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn(
        !noPadding && 'space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Aliases para compatibilidade
const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
)

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>
    {children}
  </p>
)

export { Card, CardHeader, CardBody, CardTitle, CardDescription }
export default Card