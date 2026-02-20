import React from 'react'
import { cn } from '../../lib/utils.js'

export default function ModernCard({
  children,
  className = '',
  hover = true,
  gradient = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-md',
        gradient && 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Aliases for backward compatibility and explicit naming
export const ModernCardHeader = CardHeader
export const ModernCardBody = CardBody
export const ModernCardFooter = CardFooter
