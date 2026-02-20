/**
 * Componente Checkbox otimizado
 */
import React, { forwardRef, memo } from 'react'

;
import { cn } from '../../utils/cn';

const Checkbox = memo(forwardRef(({ 
  className, 
  label,
  error,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}));

Checkbox.displayName = 'Checkbox';

export default Checkbox;
