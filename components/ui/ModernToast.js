import React, { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

const ModernToast = {
  toasts: [],
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  },

  notify() {
    this.listeners.forEach(listener => listener(this.toasts))
  },

  success(message, options = {}) {
    this.add('success', message, options)
  },

  error(message, options = {}) {
    this.add('error', message, options)
  },

  warning(message, options = {}) {
    this.add('warning', message, options)
  },

  info(message, options = {}) {
    this.add('info', message, options)
  },

  add(type, message, options = {}) {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      type,
      message,
      duration: options.duration || 5000,
      action: options.action,
      ...options
    }

    this.toasts.push(toast)
    this.notify()

    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, toast.duration)
    }
  },

  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  },

  clear() {
    this.toasts = []
    this.notify()
  }
}

const ToastIcon = ({ type }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  
  const Icon = icons[type]
  return <Icon className="h-6 w-6" />
}

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
      icon: 'text-white',
      border: 'border-emerald-200'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-600',
      icon: 'text-white',
      border: 'border-red-200'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      icon: 'text-white',
      border: 'border-amber-200'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'text-white',
      border: 'border-blue-200'
    }
  }

  const style = typeStyles[toast.type] || typeStyles.info

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl border ${style.border}
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : ''}
        max-w-md w-full
      `}
    >
      {/* Background with gradient */}
      <div className={`${style.bg} p-4`}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${style.icon}`}>
            <ToastIcon type={toast.type} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-relaxed">
              {toast.message}
            </p>
            
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white/40 transition-all ease-linear"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
    </div>
  )
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = ModernToast.subscribe(setToasts)
    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem 
            toast={toast} 
            onRemove={ModernToast.remove.bind(ModernToast)} 
          />
        </div>
      ))}
    </div>
  )
}

export default ModernToast