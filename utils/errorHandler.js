// Utilitário para tratamento de erros no sistema Beef Sync

import React from 'react'

import ErrorBoundary from '../components/common/ErrorBoundary'

/**
 * Tipos de erro personalizados
 */
export class BeefSyncError extends Error {
  constructor(message, code, details = {}) {
    super(message)
    this.name = 'BeefSyncError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export class DatabaseError extends BeefSyncError {
  constructor(message, details = {}) {
    super(message, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends BeefSyncError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends BeefSyncError {
  constructor(message, details = {}) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class StorageError extends BeefSyncError {
  constructor(message, details = {}) {
    super(message, 'STORAGE_ERROR', details)
    this.name = 'StorageError'
  }
}

/**
 * Serviço de tratamento de erros
 */
class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 100
    this.listeners = new Set()
  }

  /**
   * Adiciona um listener para erros
   * @param {Function} listener - Função para ser chamada quando ocorrer um erro
   */
  addListener(listener) {
    this.listeners.add(listener)
  }

  /**
   * Remove um listener de erros
   * @param {Function} listener - Função a ser removida
   */
  removeListener(listener) {
    this.listeners.delete(listener)
  }

  /**
   * Notifica todos os listeners sobre um erro
   * @param {Error} error - Erro a ser notificado
   */
  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Erro no listener de erro:', listenerError)
      }
    })
  }

  /**
   * Adiciona um erro ao log
   * @param {Error} error - Erro a ser logado
   */
  addToLog(error) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server'
    }

    this.errorLog.unshift(errorEntry)
    
    // Manter apenas os últimos erros
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Notificar listeners
    this.notifyListeners(error)

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro capturado:', errorEntry)
    }
  }

  /**
   * Captura e trata um erro
   * @param {Error} error - Erro a ser tratado
   * @param {Object} context - Contexto adicional do erro
   */
  handle(error, context = {}) {
    // Adicionar contexto ao erro
    if (context.component) {
      error.component = context.component
    }
    if (context.action) {
      error.action = context.action
    }
    if (context.userId) {
      error.userId = context.userId
    }

    // Adicionar ao log
    this.addToLog(error)

    // Enviar para serviço de monitoramento se configurado
    this.sendToMonitoring(error, context)

    // Retornar erro tratado
    return this.formatError(error)
  }

  /**
   * Envia erro para serviço de monitoramento
   * @param {Error} error - Erro a ser enviado
   * @param {Object} context - Contexto do erro
   */
  sendToMonitoring(error, context) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_code: error.code || 'UNKNOWN',
          component: context.component || 'Unknown',
          action: context.action || 'Unknown'
        }
      })
    }

    // Sentry (se configurado)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: context.component,
          action: context.action
        },
        extra: context
      })
    }

    // Log personalizado
    if (process.env.NODE_ENV === 'production') {
      // Aqui você pode enviar para seu próprio serviço de logs
      console.log('Erro enviado para monitoramento:', {
        error: error.message,
        code: error.code,
        context
      })
    }
  }

  /**
   * Formata erro para exibição
   * @param {Error} error - Erro a ser formatado
   * @returns {Object} - Erro formatado
   */
  formatError(error) {
    const baseError = {
      message: error.message,
      code: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString()
    }

    // Adicionar detalhes específicos baseados no tipo de erro
    if (error instanceof DatabaseError) {
      return {
        ...baseError,
        type: 'database',
        userMessage: 'Erro ao acessar o banco de dados. Tente novamente.',
        canRetry: true
      }
    }

    if (error instanceof ValidationError) {
      return {
        ...baseError,
        type: 'validation',
        userMessage: 'Dados inválidos fornecidos.',
        canRetry: false,
        details: error.details
      }
    }

    if (error instanceof NetworkError) {
      return {
        ...baseError,
        type: 'network',
        userMessage: 'Erro de conexão. Verifique sua internet.',
        canRetry: true
      }
    }

    if (error instanceof StorageError) {
      return {
        ...baseError,
        type: 'storage',
        userMessage: 'Erro ao salvar dados localmente.',
        canRetry: true
      }
    }

    // Erro genérico
    return {
      ...baseError,
      type: 'generic',
      userMessage: 'Ocorreu um erro inesperado.',
      canRetry: true
    }
  }

  /**
   * Obtém o log de erros
   * @returns {Array} - Lista de erros
   */
  getErrorLog() {
    return [...this.errorLog]
  }

  /**
   * Limpa o log de erros
   */
  clearErrorLog() {
    this.errorLog = []
  }

  /**
   * Obtém estatísticas de erros
   * @returns {Object} - Estatísticas
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byCode: {},
      byComponent: {},
      recent: this.errorLog.filter(error => {
        const errorTime = new Date(error.timestamp)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return errorTime > oneHourAgo
      }).length
    }

    this.errorLog.forEach(error => {
      // Contar por código
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1
      
      // Contar por componente
      const component = error.component || 'Unknown'
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1
    })

    return stats
  }
}

// Instância singleton
const errorHandler = new ErrorHandler()

// Funções utilitárias
export const handleError = (error, context) => errorHandler.handle(error, context)
export const addErrorListener = (listener) => errorHandler.addListener(listener)
export const removeErrorListener = (listener) => errorHandler.removeListener(listener)
export const getErrorLog = () => errorHandler.getErrorLog()
export const getErrorStats = () => errorHandler.getErrorStats()
export const clearErrorLog = () => errorHandler.clearErrorLog()

// Hook para React
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const handleError = (error) => {
      setError(error)
    }

    addErrorListener(handleError)
    return () => removeErrorListener(handleError)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, clearError }
}

// Decorator para capturar erros em funções
export const withErrorHandling = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context)
      throw error
    }
  }
}

// Decorator para capturar erros em componentes React
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default errorHandler
