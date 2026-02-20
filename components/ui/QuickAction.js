/**
 * Componente de Ação Rápida otimizado
 */
import React, { memo } from 'react'

;
import Button from './Button';
import { cn } from '../../utils/cn';

const QuickAction = memo(function QuickAction({ 
  title, 
  description, 
  icon: Icon, 
  variant = 'primary',
  onClick,
  className 
}) {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        'hover:border-blue-300 dark:hover:border-blue-600',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button 
            variant={variant} 
            size="sm"
            onClick={onClick}
          >
            Acessar
          </Button>
        </div>
      </div>
    </div>
  );
});

export default QuickAction;
