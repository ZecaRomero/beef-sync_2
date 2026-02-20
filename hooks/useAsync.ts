/**
 * Hook para gerenciar operações assíncronas
 * Gerencia estados de loading, data e error automaticamente
 */

import { useCallback, useEffect, useState } from 'react'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

export interface UseAsyncReturn<T> {
  execute: (...params: any[]) => Promise<T>
  status: AsyncStatus
  data: T | null
  error: Error | null
  isIdle: boolean
  isPending: boolean
  isSuccess: boolean
  isError: boolean
}

export function useAsync<T = any>(
  asyncFunction: (...params: any[]) => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // A função execute chama asyncFunction e gerencia os estados
  const execute = useCallback((...params: any[]): Promise<T> => {
    setStatus('pending')
    setData(null)
    setError(null)

    return asyncFunction(...params)
      .then((response: T) => {
        setData(response)
        setStatus('success')
        return response
      })
      .catch((error: Error) => {
        setError(error)
        setStatus('error')
        throw error
      })
  }, [asyncFunction])

  // Chama execute se immediate = true
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { 
    execute, 
    status, 
    data, 
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  }
}