/**
 * Componente TextArea otimizado
 */
import React, { forwardRef, memo } from 'react'

;
import { cn } from '../../utils/cn';

const TextArea = memo(forwardRef(({ 
  className, 
  error,
  label,
  helperText,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'input-field resize-none',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}));

TextArea.displayName = 'TextArea';

export default TextArea;
