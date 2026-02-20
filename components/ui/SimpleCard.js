import React from 'react'

export const SimpleCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export const SimpleCardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-6 pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export const SimpleCardBody = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export default SimpleCard