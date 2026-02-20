
import React, { useCallback, useEffect, useState } from 'react'

import logger from '../utils/logger'

export default function useDashboardData() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Validar estrutura dos dados
      if (!data || typeof data !== 'object') {
        throw new Error('Dados inválidos recebidos da API')
      }
      
      // Normalizar dados com valores padrão
      const normalizedStats = {
        totalAnimals: Number(data.totalAnimals) || 0,
        activeAnimals: Number(data.activeAnimals) || 0,
        birthsThisMonth: Number(data.birthsThisMonth) || 0,
        birthsChange: Number(data.birthsChange) || 0,
        availableDoses: Number(data.availableDoses) || 0,
        totalSemen: Number(data.totalSemen) || 0,
        totalRevenue: Number(data.totalRevenue) || 0,
        totalCosts: Number(data.totalCosts) || 0
      }
      
      setStats(normalizedStats)
      setAlerts(Array.isArray(data.alerts) ? data.alerts : [])
      
      logger.info('Dashboard carregado com sucesso', { 
        totalAnimals: normalizedStats.totalAnimals,
        activeAnimals: normalizedStats.activeAnimals,
        birthsThisMonth: normalizedStats.birthsThisMonth
      })
    } catch (error) {
      logger.error('Erro ao carregar dados do dashboard:', error)
      setError(error.message)
      
      // Dados padrão em caso de erro
      const defaultStats = {
        totalAnimals: 0,
        activeAnimals: 0,
        birthsThisMonth: 0,
        birthsChange: 0,
        availableDoses: 0,
        totalSemen: 0,
        totalRevenue: 0,
        totalCosts: 0
      }
      
      setStats(defaultStats)
      setAlerts([{
        id: 'error-1',
        type: 'error',
        title: 'Erro ao carregar dados',
        message: 'Não foi possível carregar os dados do dashboard. Verifique sua conexão.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const refreshData = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    stats,
    loading,
    alerts,
    error,
    refreshData
  }
}