
import React, { Fragment, useEffect } from 'react'

import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '../ui/Icons'

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const toastColors = {
  success: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
  },
}

export default function Toast({ show, message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const Icon = toastIcons[type]
  const colors = toastColors[type]

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform transition duration-300"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition duration-200"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border-2 shadow-2xl
        backdrop-blur-lg
        ${colors.bg} ${colors.border}
        animate-slide-in-right
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${colors.icon} animate-scale-in`} aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${colors.text}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={`
                  inline-flex rounded-md ${colors.text} hover:opacity-75 
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  transition-all duration-200
                `}
                onClick={onClose}
              >
                <span className="sr-only">Fechar</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Barra de progresso */}
          {duration > 0 && (
            <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  type === 'success' ? 'bg-green-500' :
                  type === 'error' ? 'bg-red-500' :
                  type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{
                  animation: `shrink ${duration}ms linear`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Transition>
  )
}

// Container para múltiplos toasts
export function ToastContainer({ toasts = [], onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  )
}

// Adicionar estilos para a animação da barra de progresso
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `
  document.head.appendChild(style)
}

