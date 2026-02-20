import { useState, useEffect, useCallback } from 'react'
import { Animal, AnimalFormData, AnimalFilters, AnimalStats, UseAnimalsReturn, PaginationParams, ApiResponse } from '../types/animals'

const useAnimals = (): UseAnimalsReturn => {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AnimalStats | null>(null)

  const fetchAnimals = useCallback(async (filters?: AnimalFilters, pagination?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Adicionar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            params.append(key, String(value))
          }
        })
      }

      // Adicionar paginação
      if (pagination) {
        Object.entries(pagination).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
      }

      const response = await fetch(`/api/animals?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar animais: ${response.status}`)
      }

      const data: ApiResponse<Animal[]> = await response.json()
      
      if (data.success && data.data) {
        setAnimals(data.data)
      } else {
        throw new Error(data.error || 'Erro desconhecido ao carregar animais')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar animais:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createAnimal = useCallback(async (data: AnimalFormData): Promise<Animal> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar animal: ${response.status}`)
      }

      const result: ApiResponse<Animal> = await response.json()
      
      if (result.success && result.data) {
        // Atualizar lista local
        setAnimals(prev => [result.data!, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Erro desconhecido ao criar animal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAnimal = useCallback(async (id: string, data: Partial<AnimalFormData>): Promise<Animal> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/animals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar animal: ${response.status}`)
      }

      const result: ApiResponse<Animal> = await response.json()
      
      if (result.success && result.data) {
        // Atualizar lista local
        setAnimals(prev => prev.map(animal => 
          animal.id === id ? result.data! : animal
        ))
        return result.data
      } else {
        throw new Error(result.error || 'Erro desconhecido ao atualizar animal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAnimal = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/animals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar animal: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        // Remover da lista local
        setAnimals(prev => prev.filter(animal => animal.id !== id))
      } else {
        throw new Error(result.error || 'Erro desconhecido ao deletar animal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch('/api/animals/stats')
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar estatísticas: ${response.status}`)
      }

      const data: ApiResponse<AnimalStats> = await response.json()
      
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        throw new Error(data.error || 'Erro desconhecido ao carregar estatísticas')
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      // Não definir erro para stats, pois é uma funcionalidade secundária
    }
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    fetchAnimals({ orderBy: 'created_at' })
    refreshStats()
  }, [fetchAnimals, refreshStats])

  return {
    animals,
    loading,
    error,
    stats,
    fetchAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    refreshStats,
  }
}

export default useAnimals