

import React, { useCallback, useState } from 'react'

let toastId = 0

/**
 * Hook para gerenciar toasts/notificações
 * 
 * @returns {Object} { toasts, showToast, removeToast }
 */
export default function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++toastId
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])

    // Auto-remover após a duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration)
  }, [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}

