/**
 * Componente de loading spinner reutilizável
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  text = 'Carregando...'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          border-2 border-t-transparent 
          ${colors[color]} 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner