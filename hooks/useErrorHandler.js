/**
 * Hook para tratamento de erros consistente
 */
import React, { useCallback, useState } from 'react'
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';

export function useErrorHandler() {
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      logError = true,
      customMessage = null,
    } = options;

    // Log do erro
    if (logError) {
      logger.error('Error handled:', error);
    }

    // Atualizar estado
    setError(error);

    // Mostrar toast
    if (showToast) {
      const message = customMessage || 
        error?.message || 
        'Ocorreu um erro. Por favor, tente novamente.';
      
      toast.error(message);
    }

    return error;
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
}
