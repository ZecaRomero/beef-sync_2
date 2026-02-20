import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  leftIcon, 
  rightIcon,
  className = '', 
  disabled = false,
  modern = false,
  glow = false,
  ...props 
}) => {
  const baseClasses = modern 
    ? 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-lg hover:shadow-xl'
    : 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = modern ? {
    primary: `bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500/50 ${glow ? 'shadow-glow-md hover:shadow-glow-lg' : ''}`,
    secondary: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white focus:ring-gray-500/50',
    success: `bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white focus:ring-green-500/50 ${glow ? 'shadow-glow-green' : ''}`,
    warning: `bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white focus:ring-amber-500/50 ${glow ? 'shadow-glow-orange' : ''}`,
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white focus:ring-red-500/50',
    ghost: 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 focus:ring-gray-500/50 backdrop-blur-sm',
    outline: 'border-2 border-blue-500 hover:bg-blue-500 text-blue-600 hover:text-white focus:ring-blue-500/50 transition-colors duration-300'
  } : {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
  }
  
  const sizes = modern ? {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  } : {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {modern && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      )}
      
      <div className="relative flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <div className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
          {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
        </div>
      </div>
    </button>
  )
}

export default Button
export { Button }