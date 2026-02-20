import React from 'react'

const Input = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
    rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-blue-500 focus:border-blue-500 
    dark:bg-gray-700 dark:text-white dark:placeholder-gray-300
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Input