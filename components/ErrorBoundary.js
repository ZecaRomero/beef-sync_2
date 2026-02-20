/**
 * Error Boundary melhorado com logging e UI aprimorada
 */
import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from './ui/Icons';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro
    logger.error('Error Boundary capturou erro:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
    
    // Verificação específica para erro de total_tokens
    if (error.message && error.message.includes('total_tokens')) {
      logger.error('🚨 Erro específico de total_tokens detectado:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
      
      // Tentar limpar possíveis dados corrompidos
      if (typeof window !== 'undefined') {
        try {
          // Verificar e limpar localStorage se necessário
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            try {
              const value = localStorage.getItem(key);
              if (value && value.includes('total_tokens')) {
                console.warn(`Removendo chave corrompida do localStorage: ${key}`);
                localStorage.removeItem(key);
              }
            } catch (e) {
              console.error(`Erro ao verificar localStorage[${key}]:`, e);
            }
          });
        } catch (e) {
          console.error('Erro ao limpar localStorage:', e);
        }
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Recarregar a página se fornecido
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Renderizar UI de fallback customizada
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Ops! Algo deu errado
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {this.props.fallbackMessage || 
                'Ocorreu um erro inesperado. Por favor, tente novamente.'}
            </p>
            
            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span>Tentar Novamente</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;