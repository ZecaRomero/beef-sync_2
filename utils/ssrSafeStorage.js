// Utilitário para armazenamento seguro em SSR (Server-Side Rendering)


/**
 * Verifica se está no ambiente do cliente
 * @returns {boolean} - True se estiver no cliente
 */
import React, { useCallback, useEffect, useState } from 'react'

export const isClient = () => typeof window !== 'undefined'

/**
 * Verifica se está no ambiente do servidor
 * @returns {boolean} - True se estiver no servidor
 */
export const isServer = () => typeof window === 'undefined'

/**
 * Classe para armazenamento seguro em SSR
 */
class SSRSafeStorage {
  constructor() {
    this.fallbackStorage = new Map()
    this.isInitialized = false
  }

  /**
   * Inicializar o armazenamento
   */
  initialize() {
    if (this.isInitialized) return
    
    // Verificar se localStorage está disponível
    if (isClient()) {
      try {
        // Testar se localStorage funciona
        const testKey = '__ssr_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        this.isInitialized = true
      } catch (error) {
        console.warn('localStorage não disponível, usando fallback:', error)
        this.isInitialized = false
      }
    }
  }

  /**
   * Obter item do armazenamento
   * @param {string} key - Chave do item
   * @returns {string|null} - Valor armazenado ou null
   */
  getItem(key) {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        return localStorage.getItem(key)
      } catch (error) {
        console.warn('Erro ao acessar localStorage:', error)
        return this.fallbackStorage.get(key) || null
      }
    }

    return this.fallbackStorage.get(key) || null
  }

  /**
   * Definir item no armazenamento
   * @param {string} key - Chave do item
   * @param {string} value - Valor a ser armazenado
   */
  setItem(key, value) {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        localStorage.setItem(key, value)
        return
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
      }
    }

    // Fallback para Map
    this.fallbackStorage.set(key, value)
  }

  /**
   * Remover item do armazenamento
   * @param {string} key - Chave do item
   */
  removeItem(key) {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error)
      }
    }

    this.fallbackStorage.delete(key)
  }

  /**
   * Limpar todo o armazenamento
   */
  clear() {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        localStorage.clear()
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error)
      }
    }

    this.fallbackStorage.clear()
  }

  /**
   * Obter chave por índice
   * @param {number} index - Índice da chave
   * @returns {string|null} - Chave no índice ou null
   */
  key(index) {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        return localStorage.key(index)
      } catch (error) {
        console.warn('Erro ao acessar chave do localStorage:', error)
        const keys = Array.from(this.fallbackStorage.keys())
        return keys[index] || null
      }
    }

    const keys = Array.from(this.fallbackStorage.keys())
    return keys[index] || null
  }

  /**
   * Obter número de itens armazenados
   * @returns {number} - Número de itens
   */
  get length() {
    this.initialize()

    if (isClient() && this.isInitialized) {
      try {
        return localStorage.length
      } catch (error) {
        console.warn('Erro ao obter tamanho do localStorage:', error)
        return this.fallbackStorage.size
      }
    }

    return this.fallbackStorage.size
  }
}

// Instância singleton
const ssrSafeStorage = new SSRSafeStorage()

/**
 * Funções utilitárias para armazenamento seguro
 */
export const safeGetItem = (key) => ssrSafeStorage.getItem(key)
export const safeSetItem = (key, value) => ssrSafeStorage.setItem(key, value)
export const safeRemoveItem = (key) => ssrSafeStorage.removeItem(key)
export const safeClear = () => ssrSafeStorage.clear()
export const safeKey = (index) => ssrSafeStorage.key(index)
export const safeLength = () => ssrSafeStorage.length

/**
 * Hook para armazenamento seguro em React
 */
export const useSSRSafeStorage = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getItem = useCallback((key) => {
    if (!isClient) return null
    return safeGetItem(key)
  }, [isClient])

  const setItem = useCallback((key, value) => {
    if (!isClient) return
    safeSetItem(key, value)
  }, [isClient])

  const removeItem = useCallback((key) => {
    if (!isClient) return
    safeRemoveItem(key)
  }, [isClient])

  const clear = useCallback(() => {
    if (!isClient) return
    safeClear()
  }, [isClient])

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    isClient
  }
}

/**
 * Hook para dados JSON seguros
 */
export const useSSRSafeJSON = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    
    try {
      const stored = safeGetItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        setValue(parsed)
      }
    } catch (error) {
      console.warn(`Erro ao carregar JSON do localStorage (${key}):`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const updateValue = useCallback((newValue) => {
    setValue(newValue)
    if (isClient) {
      try {
        safeSetItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.warn(`Erro ao salvar JSON no localStorage (${key}):`, error)
      }
    }
  }, [key, isClient])

  const removeValue = useCallback(() => {
    setValue(defaultValue)
    if (isClient) {
      safeRemoveItem(key)
    }
  }, [key, isClient, defaultValue])

  return {
    value,
    updateValue,
    removeValue,
    isClient,
    isLoading
  }
}

/**
 * Componente para renderização condicional baseada em SSR
 */
export const ClientOnly = ({ children, fallback = null }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return fallback
  }

  return children
}

/**
 * Hook para detectar hidratação
 */
export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Decorator para componentes que precisam de hidratação
 */
export const withHydration = (Component) => {
  const WrappedComponent = (props) => {
    const isHydrated = useHydration()

    if (!isHydrated) {
      return null
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withHydration(${Component.displayName || Component.name})`
  return WrappedComponent
}

/**
 * Utilitário para dados persistentes seguros
 */
export class PersistentData {
  constructor(key, defaultValue = null) {
    this.key = key
    this.defaultValue = defaultValue
    this.listeners = new Set()
  }

  get() {
    try {
      const stored = safeGetItem(this.key)
      return stored ? JSON.parse(stored) : this.defaultValue
    } catch (error) {
      console.warn(`Erro ao carregar dados persistentes (${this.key}):`, error)
      return this.defaultValue
    }
  }

  set(value) {
    try {
      safeSetItem(this.key, JSON.stringify(value))
      this.notifyListeners(value)
    } catch (error) {
      console.warn(`Erro ao salvar dados persistentes (${this.key}):`, error)
    }
  }

  remove() {
    safeRemoveItem(this.key)
    this.notifyListeners(this.defaultValue)
  }

  addListener(listener) {
    this.listeners.add(listener)
  }

  removeListener(listener) {
    this.listeners.delete(listener)
  }

  notifyListeners(value) {
    this.listeners.forEach(listener => {
      try {
        listener(value)
      } catch (error) {
        console.warn('Erro no listener de dados persistentes:', error)
      }
    })
  }
}

/**
 * Hook para dados persistentes
 */
export const usePersistentData = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const persistentData = new PersistentData(key, defaultValue)
    const currentValue = persistentData.get()
    setValue(currentValue)

    const handleChange = (newValue) => {
      setValue(newValue)
    }

    persistentData.addListener(handleChange)

    return () => {
      persistentData.removeListener(handleChange)
    }
  }, [key, defaultValue])

  const updateValue = useCallback((newValue) => {
    if (!isClient) return
    
    const persistentData = new PersistentData(key, defaultValue)
    persistentData.set(newValue)
  }, [key, defaultValue, isClient])

  const removeValue = useCallback(() => {
    if (!isClient) return
    
    const persistentData = new PersistentData(key, defaultValue)
    persistentData.remove()
  }, [key, defaultValue, isClient])

  return {
    value,
    updateValue,
    removeValue,
    isClient
  }
}

export default ssrSafeStorage
