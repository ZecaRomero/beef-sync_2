// Sistema de cache inteligente para o Beef Sync


/**
 * Configurações padrão do cache
 */
import React from 'react'

const DEFAULT_CONFIG = {
  maxSize: 100, // Máximo de itens no cache
  ttl: 5 * 60 * 1000, // 5 minutos em millisegundos
  cleanupInterval: 60 * 1000, // Limpeza a cada minuto
  enableStats: true, // Habilitar estatísticas
  enablePersistence: true, // Persistir no localStorage
  persistenceKey: 'beefsync_cache'
}

/**
 * Item do cache
 */
class CacheItem {
  constructor(key, value, ttl = DEFAULT_CONFIG.ttl) {
    this.key = key
    this.value = value
    this.createdAt = Date.now()
    this.lastAccessed = Date.now()
    this.ttl = ttl
    this.accessCount = 0
  }

  isExpired() {
    return Date.now() - this.createdAt > this.ttl
  }

  updateAccess() {
    this.lastAccessed = Date.now()
    this.accessCount++
  }

  toJSON() {
    return {
      key: this.key,
      value: this.value,
      createdAt: this.createdAt,
      lastAccessed: this.lastAccessed,
      ttl: this.ttl,
      accessCount: this.accessCount
    }
  }

  static fromJSON(data) {
    const item = new CacheItem(data.key, data.value, data.ttl)
    item.createdAt = data.createdAt
    item.lastAccessed = data.lastAccessed
    item.accessCount = data.accessCount
    return item
  }
}

/**
 * Gerenciador de cache inteligente
 */
class CacheManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      cleanups: 0
    }
    this.cleanupTimer = null

    // Inicializar
    this.initialize()
  }

  /**
   * Inicializar o cache
   */
  initialize() {
    // Carregar dados persistidos
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage()
    }

    // Iniciar limpeza automática
    this.startCleanupTimer()
  }

  /**
   * Carregar cache do localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.persistenceKey)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.cache && Array.isArray(data.cache)) {
          data.cache.forEach(itemData => {
            const item = CacheItem.fromJSON(itemData)
            if (!item.isExpired()) {
              this.cache.set(item.key, item)
            }
          })
        }
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats }
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error)
    }
  }

  /**
   * Salvar cache no localStorage
   */
  saveToStorage() {
    if (!this.config.enablePersistence || typeof window === 'undefined') return

    try {
      const data = {
        cache: Array.from(this.cache.values()).map(item => item.toJSON()),
        stats: this.stats,
        timestamp: Date.now()
      }
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error)
    }
  }

  /**
   * Iniciar timer de limpeza
   */
  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Parar timer de limpeza
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Obter valor do cache
   * @param {string} key - Chave do cache
   * @returns {any} - Valor armazenado ou null se não encontrado/expirado
   */
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    if (item.isExpired()) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      return null
    }

    item.updateAccess()
    this.stats.hits++
    return item.value
  }

  /**
   * Armazenar valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em millisegundos (opcional)
   */
  set(key, value, ttl = this.config.ttl) {
    // Verificar se precisa evictar itens
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    const item = new CacheItem(key, value, ttl)
    this.cache.set(key, item)
    this.stats.sets++

    // Salvar no localStorage
    this.saveToStorage()
  }

  /**
   * Verificar se uma chave existe no cache
   * @param {string} key - Chave a ser verificada
   * @returns {boolean} - True se existe e não está expirada
   */
  has(key) {
    const item = this.cache.get(key)
    if (!item) return false
    if (item.isExpired()) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Remover item do cache
   * @param {string} key - Chave a ser removida
   * @returns {boolean} - True se foi removido
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.saveToStorage()
    }
    return deleted
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      cleanups: 0
    }
    this.saveToStorage()
  }

  /**
   * Evictar item menos recentemente usado
   */
  evictLeastRecentlyUsed() {
    let oldestKey = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  /**
   * Limpeza de itens expirados
   */
  cleanup() {
    const expiredKeys = []
    
    for (const [key, item] of this.cache.entries()) {
      if (item.isExpired()) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key)
      this.stats.evictions++
    })

    this.stats.cleanups++
    
    if (expiredKeys.length > 0) {
      this.saveToStorage()
    }
  }

  /**
   * Obter estatísticas do cache
   * @returns {Object} - Estatísticas
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      utilization: Math.round((this.cache.size / this.config.maxSize) * 100)
    }
  }

  /**
   * Obter informações detalhadas do cache
   * @returns {Object} - Informações detalhadas
   */
  getInfo() {
    const items = Array.from(this.cache.values())
    const now = Date.now()

    return {
      stats: this.getStats(),
      items: items.map(item => ({
        key: item.key,
        age: now - item.createdAt,
        lastAccessed: now - item.lastAccessed,
        accessCount: item.accessCount,
        ttl: item.ttl,
        expiresIn: item.ttl - (now - item.createdAt)
      })),
      config: { ...this.config }
    }
  }

  /**
   * Destruir o cache e limpar recursos
   */
  destroy() {
    this.stopCleanupTimer()
    this.clear()
  }
}

// Instância singleton
const cacheManager = new CacheManager()

// Funções utilitárias
export const getCache = (key) => cacheManager.get(key)
export const setCache = (key, value, ttl) => cacheManager.set(key, value, ttl)
export const hasCache = (key) => cacheManager.has(key)
export const deleteCache = (key) => cacheManager.delete(key)
export const clearCache = () => cacheManager.clear()
export const getCacheStats = () => cacheManager.getStats()
export const getCacheInfo = () => cacheManager.getInfo()

// Hook para React
export const useCache = () => {
  const [stats, setStats] = React.useState(cacheManager.getStats())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats())
    }, 10000) // Atualizar a cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  return {
    get: cacheManager.get.bind(cacheManager),
    set: cacheManager.set.bind(cacheManager),
    has: cacheManager.has.bind(cacheManager),
    delete: cacheManager.delete.bind(cacheManager),
    clear: cacheManager.clear.bind(cacheManager),
    stats
  }
}

// Decorator para cache de funções
export const withCache = (fn, keyGenerator, ttl = DEFAULT_CONFIG.ttl) => {
  return async (...args) => {
    const key = keyGenerator(...args)
    
    // Tentar obter do cache
    const cached = getCache(key)
    if (cached !== null) {
      return cached
    }

    // Executar função e cachear resultado
    const result = await fn(...args)
    setCache(key, result, ttl)
    
    return result
  }
}

// Cache para dados de API
export const apiCache = {
  get: (url, params = {}) => {
    const key = `api:${url}:${JSON.stringify(params)}`
    return getCache(key)
  },
  
  set: (url, params = {}, data, ttl = 5 * 60 * 1000) => {
    const key = `api:${url}:${JSON.stringify(params)}`
    setCache(key, data, ttl)
  },
  
  delete: (url, params = {}) => {
    const key = `api:${url}:${JSON.stringify(params)}`
    deleteCache(key)
  }
}

// Cache para dados do localStorage
export const storageCache = {
  get: (key) => {
    const cacheKey = `storage:${key}`
    return getCache(cacheKey)
  },
  
  set: (key, value, ttl = 10 * 60 * 1000) => {
    const cacheKey = `storage:${key}`
    setCache(cacheKey, value, ttl)
  }
}

export default cacheManager
