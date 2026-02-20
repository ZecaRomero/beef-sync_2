import React, { useState } from 'react'
import { cn } from '../../lib/utils.js'

export default function AnimatedCard({
  children,
  className = '',
  onClick,
  delay = 0,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-lg',
        'transition-all duration-300 ease-out',
        'border border-gray-200 dark:border-gray-700',
        onClick && 'cursor-pointer',
        isHovered && 'shadow-2xl scale-105 -translate-y-2',
        'animate-fade-in',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
