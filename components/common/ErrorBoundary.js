
import React from 'react'

import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon
} from '@heroicons/react/24/outline'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para exibir a UI de erro na próxima renderização
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Enviar erro para serviço de monitoramento (se configurado)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state
      const { fallback: Fallback, showDetails = false } = this.props

      // Usar componente fallback customizado se fornecido
      if (Fallback) {
        return <Fallback error={error} retry={this.handleRetry} />
      }

      // UI padrão de erro
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                {/* Ícone de erro */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>

                {/* Título */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ops! Algo deu errado
                </h2>

                {/* Descrição */}
                <p className="text-sm text-gray-600 mb-6">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para corrigir o problema.
                </p>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Ir para o Início
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Recarregar Página
                  </button>
                </div>

                {/* Contador de tentativas */}
                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 mt-4">
                    Tentativas: {retryCount}
                  </p>
                )}

                {/* Detalhes do erro (apenas em desenvolvimento) */}
                {showDetails && process.env.NODE_ENV === 'development' && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                      <BugAntIcon className="h-4 w-4 mr-1" />
                      Detalhes Técnicos
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                      <div className="mb-2">
                        <strong>Erro:</strong>
                        <pre className="whitespace-pre-wrap">{error && error.toString()}</pre>
                      </div>
                      {errorInfo && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Informações de contato */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Se o problema persistir, entre em contato conosco.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar ErrorBoundary em componentes funcionais
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Componente para capturar erros assíncronos
export const AsyncErrorBoundary = ({ children, onError }) => {
  const { captureError } = useErrorHandler()

  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      captureError(new Error(event.reason))
      if (onError) {
        onError(event.reason)
      }
    }

    const handleError = (event) => {
      captureError(event.error)
      if (onError) {
        onError(event.error)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [captureError, onError])

  return children
}

// Componente de fallback customizado
export const ErrorFallback = ({ error, retry }) => (
  <div className="p-4 border border-red-200 rounded-md bg-red-50">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Erro no componente
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>Ocorreu um erro ao renderizar este componente.</p>
        </div>
        <div className="mt-4">
          <button
            onClick={retry}
            className="bg-red-100 px-2 py-1 text-xs font-medium text-red-800 rounded hover:bg-red-200"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default ErrorBoundary
