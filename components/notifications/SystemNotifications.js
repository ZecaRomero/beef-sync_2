
import React, { useEffect, useState } from 'react'

import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '../ui/Icons'
import logger from '../../utils/logger'

const NotificationItem = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'error':
        return 'text-red-800 dark:text-red-200'
      default:
        return 'text-blue-800 dark:text-blue-200'
    }
  }

  // Auto-dismiss após 10 segundos para notificações de sucesso
  useEffect(() => {
    if (notification.type === 'success' && !notification.persistent) {
      const timer = setTimeout(() => {
        onDismiss(notification.id)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.type, notification.persistent, onDismiss])

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()} shadow-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${getTextColor()}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {notification.message}
          </p>
          {notification.timestamp && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {new Date(notification.timestamp).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onDismiss(notification.id)}
            className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500`}
          >
            <span className="sr-only">Fechar</span>
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SystemNotifications({ notifications = [], onDismiss }) {
  if (!notifications || notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
