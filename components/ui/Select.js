import React from 'react'

export default function Select({ 
  label, 
  children, 
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`
          block w-full rounded-lg border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          px-3 py-2
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}