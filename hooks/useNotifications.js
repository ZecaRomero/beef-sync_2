

import React, { useEffect, useState } from 'react'

export default function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Carregar notificações
  const loadNotifications = async (limit = 50) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data || [])
        setUnreadCount((data || []).filter(n => !n.lida).length)
      } else if (response.status !== 404) {
        // Só logar se não for 404 (rota não encontrada)
        console.warn(`Erro ao carregar notificações: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      // Silenciar erros de rede (servidor não disponível)
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Servidor não disponível - não logar para não poluir o console
        return
      }
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Marcar notificação como lida
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, lida: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.lida).map(n => n.id)
      
      for (const id of unreadIds) {
        await fetch(`/api/notifications?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lida: true })
        })
      }
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  // Criar nova notificação
  const createNotification = async (notificationData) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })
      
      if (response.ok) {
        const newNotification = await response.json()
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        return newNotification
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
    }
  }

  // Gerar notificações automáticas
  const generateNotifications = async (tipo = 'all') => {
    try {
      const response = await fetch('/api/generate-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Recarregar notificações após gerar novas
        await loadNotifications()
        return result
      }
    } catch (error) {
      // Silenciar erros de rede (servidor não disponível)
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return
      }
      console.error('Erro ao gerar notificações:', error)
    }
  }

  // Excluir notificação
  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
        // Recalcular contagem de não lidas
        setUnreadCount(prev => {
          const deletedNotification = notifications.find(n => n.id === id)
          return deletedNotification && !deletedNotification.lida ? Math.max(0, prev - 1) : prev
        })
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
    }
  }

  // Carregar notificações na inicialização
  useEffect(() => {
    const initNotifications = async () => {
      await loadNotifications()
      
      // Gerar notificações de exames andrológicos automaticamente na inicialização
      try {
        const response = await fetch('/api/generate-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'andrologico' })
        })
        if (response.ok) {
          await loadNotifications() // Recarregar após gerar
        }
      } catch (err) {
        // Silenciar erros de rede (servidor não disponível)
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          return
        }
        console.error('Erro ao gerar notificações de exames andrológicos:', err)
      }
    }
    
    initNotifications()
    
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(async () => {
      await loadNotifications()
    }, 30000)
    
    // Gerar notificações de exames andrológicos a cada 5 minutos
    const generateInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/generate-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'andrologico' })
        })
        if (response.ok) {
          await loadNotifications() // Recarregar após gerar
        }
      } catch (err) {
        // Silenciar erros de rede (servidor não disponível)
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          return
        }
        console.error('Erro ao gerar notificações de exames andrológicos:', err)
      }
    }, 300000) // 5 minutos
    
    return () => {
      clearInterval(interval)
      clearInterval(generateInterval)
    }
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    generateNotifications,
    deleteNotification
  }
}
