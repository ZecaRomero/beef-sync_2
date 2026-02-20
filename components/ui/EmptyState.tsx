import React from 'react'
import { cn } from '../../utils/cn'
import Button from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg'
    }
  }

  const currentSize = sizes[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      currentSize.container,
      className
    )}>
      {icon && (
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4',
          currentSize.icon
        )}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-gray-900 dark:text-white mb-2',
        currentSize.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-gray-500 dark:text-gray-400 mb-6 max-w-md',
          currentSize.description
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState