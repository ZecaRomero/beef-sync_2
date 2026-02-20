import logger from './logger'

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutos
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl
    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now()
    })
    
    logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`)
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      logger.debug(`Cache miss: ${key}`)
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      logger.debug(`Cache expired: ${key}`)
      return null
    }

    logger.debug(`Cache hit: ${key}`)
    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      logger.debug(`Cache deleted: ${key}`)
    }
    return deleted
  }

  clear() {
    const size = this.cache.size
    this.cache.clear()
    logger.info(`Cache cleared: ${size} items removed`)
  }

  // Cache com função de fallback
  async getOrSet(key, fallbackFn, ttl = this.defaultTTL) {
    let value = this.get(key)
    
    if (value !== null) {
      return value
    }

    try {
      value = await fallbackFn()
      this.set(key, value, ttl)
      return value
    } catch (error) {
      logger.error(`Error in cache fallback for ${key}:`, error)
      throw error
    }
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now()
    let total = 0
    let expired = 0
    let active = 0

    for (const [key, item] of this.cache.entries()) {
      total++
      if (now > item.expiry) {
        expired++
      } else {
        active++
      }
    }

    return {
      total,
      active,
      expired,
      hitRate: this.calculateHitRate()
    }
  }

  // Calcular taxa de acerto (simplificado)
  calculateHitRate() {
    // Esta é uma implementação simplificada
    // Em produção, você poderia armazenar estatísticas mais detalhadas
    return 'N/A'
  }

  // Limpeza de itens expirados
  cleanup() {
    const now = Date.now()
    let removed = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      logger.info(`Cache cleanup: ${removed} expired items removed`)
    }

    return removed
  }

  // Cache para APIs
  async cacheApiCall(url, options = {}, ttl = this.defaultTTL) {
    const cacheKey = `api:${url}:${JSON.stringify(options)}`
    
    return this.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        })

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`)
        }

        return await response.json()
      },
      ttl
    )
  }
}

// Instância global
const cacheManager = new CacheManager()

// Limpeza automática a cada 10 minutos
setInterval(() => {
  cacheManager.cleanup()
}, 10 * 60 * 1000)

export default cacheManager
export { CacheManager }
