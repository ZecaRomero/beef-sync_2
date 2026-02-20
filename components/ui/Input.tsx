import React from 'react'
import { InputProps } from '../../types/components'
import { cn } from '../../lib/utils'

const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  className = '', 
  error,
  helperText,
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'block w-full rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-transparent',
    filled: 'border-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500'
  }

  const errorClasses = error 
    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' 
    : ''

  const inputClasses = cn(
    baseClasses,
    variantClasses[variant],
    errorClasses,
    icon ? 'pl-10' : 'pl-3',
    'pr-3 py-2',
    className
  )

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <div className="text-sm">
          {error ? (
            <span className="text-red-600 dark:text-red-400">{error}</span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Input