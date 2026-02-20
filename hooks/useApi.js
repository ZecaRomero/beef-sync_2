/**
 * Hook personalizado para buscar dados de APIs
 * Padroniza loading, error e data states
 */

import { useState, useEffect, useCallback } from 'react'
import apiClient from '../utils/apiClient'
import logger from '../utils/logger'

/**
 * Hook para buscar dados de uma API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções do hook
 * @returns {Object} { data, loading, error, refetch }
 */
export function useApi(endpoint, options = {}) {
  const {
    autoFetch = true,
    initialData = null,
    onSuccess,
    onError,
    ...fetchOptions
  } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiClient.get(endpoint, fetchOptions)

      // O apiClient já retorna um objeto padronizado com { success, data, message, ... }
      // Normalizar resposta - garantir que sempre temos uma estrutura consistente
      let normalizedData = null;
      
      if (result && typeof result === 'object') {
        // O apiClient já extrai data.data ou retorna data diretamente
        normalizedData = result.data !== undefined ? result.data : result;
      } else {
        normalizedData = result;
      }

      setData(normalizedData)
      
      if (onSuccess) {
        onSuccess(normalizedData)
      }

      logger.debug(`useApi: Dados carregados de ${endpoint}`, {
        count: Array.isArray(normalizedData) ? normalizedData.length : 'N/A',
        hasData: !!normalizedData,
        success: result.success
      })

      return normalizedData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      
      if (onError) {
        onError(err)
      }

      logger.error(`useApi: Erro ao carregar ${endpoint}`, {
        error: errorMessage,
        endpoint,
        stack: err instanceof Error ? err.stack : undefined
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(fetchOptions), onSuccess, onError])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, endpoint])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook para mutações (POST, PUT, DELETE)
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções do hook
 * @returns {Object} { mutate, loading, error }
 */
export function useMutation(endpoint, options = {}) {
  const {
    method = 'POST',
    onSuccess,
    onError,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (body) => {
    try {
      setLoading(true)
      setError(null)

      let result
      switch (method.toUpperCase()) {
        case 'POST':
          result = await apiClient.post(endpoint, body)
          break
        case 'PUT':
          result = await apiClient.put(endpoint, body)
          break
        case 'DELETE':
          result = await apiClient.delete(endpoint)
          break
        case 'PATCH':
          result = await apiClient.patch(endpoint, body)
          break
        default:
          throw new Error(`Método HTTP não suportado: ${method}`)
      }

      if (onSuccess) {
        onSuccess(result.data)
      }

      logger.debug(`useMutation: ${method} ${endpoint}`, {
        success: result.success
      })

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      
      if (onError) {
        onError(err)
      }

      logger.error(`useMutation: Erro em ${method} ${endpoint}`, {
        error: errorMessage,
        endpoint
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, method, onSuccess, onError])

  return {
    mutate,
    loading,
    error,
  }
}

export default useApi

