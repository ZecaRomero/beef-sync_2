/**
 * Sistema de cache global para APIs
 * Implementa cache em memória com TTL e invalidação inteligente
 */

class APICache {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutos
    this.maxSize = 100 // Máximo de 100 entradas
  }

  /**
   * Gera chave única para cache baseada na URL e parâmetros
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    const params = new URLSearchParams(options.params || {}).toString()
    return `${method}:${url}:${params}:${body}`
  }

  /**
   * Verifica se uma entrada do cache ainda é válida
   */
  isValid(entry) {
    return Date.now() < entry.expiresAt
  }

  /**
   * Obtém dados do cache
   */
  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (!this.isValid(entry)) {
      this.cache.delete(key)
      return null
    }
    
    // Atualizar último acesso
    entry.lastAccessed = Date.now()
    return entry.data
  }

  /**
   * Armazena dados no cache
   */
  set(key, data, ttl = this.defaultTTL) {
    // Limpar cache se exceder tamanho máximo
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const entry = {
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + ttl
    }

    this.cache.set(key, entry)
  }

  /**
   * Remove entrada específica do cache
   */
  delete(key) {
    return this.cache.delete(key)
  }

  /**
   * Invalida cache por padrão de URL
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    return keysToDelete.length
  }

  /**
   * Limpa entradas expiradas e menos utilizadas
   */
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Remover entradas expiradas
    entries.forEach(([key, entry]) => {
      if (!this.isValid(entry)) {
        this.cache.delete(key)
      }
    })

    // Se ainda exceder o limite, remover as menos acessadas
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2))
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      validEntries: entries.filter(entry => this.isValid(entry)).length,
      expiredEntries: entries.filter(entry => !this.isValid(entry)).length,
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.createdAt), 0) / entries.length
        : 0
    }
  }
}

// Instância global do cache
const apiCache = new APICache()

/**
 * Wrapper para fetch com cache automático
 */
export async function cachedFetch(url, options = {}) {
  const {
    cache: useCache = true,
    cacheTTL = apiCache.defaultTTL,
    invalidateCache = false,
    ...fetchOptions
  } = options

  const cacheKey = apiCache.generateKey(url, fetchOptions)

  // Invalidar cache se solicitado
  if (invalidateCache) {
    apiCache.delete(cacheKey)
  }

  // Tentar obter do cache primeiro (apenas para GET)
  if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cachedData = apiCache.get(cacheKey)
    if (cachedData) {
      return {
        ...cachedData,
        fromCache: true
      }
    }
  }

  try {
    // Fazer requisição
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const result = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      fromCache: false
    }

    // Cachear apenas respostas GET bem-sucedidas
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      apiCache.set(cacheKey, result, cacheTTL)
    }

    // Invalidar cache relacionado para operações de modificação
    if (fetchOptions.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method)) {
      const urlPattern = url.split('?')[0].replace(/\/\d+$/, '') // Remove IDs específicos
      apiCache.invalidatePattern(urlPattern)
    }

    return result
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

/**
 * Hook React para usar cache de API
 */
export function useAPICache() {
  return {
    get: (key) => apiCache.get(key),
    set: (key, data, ttl) => apiCache.set(key, data, ttl),
    delete: (key) => apiCache.delete(key),
    invalidatePattern: (pattern) => apiCache.invalidatePattern(pattern),
    clear: () => apiCache.clear(),
    getStats: () => apiCache.getStats(),
    cachedFetch
  }
}

/**
 * Configurações específicas de cache por endpoint
 */
export const cacheConfigs = {
  '/api/animals': { ttl: 2 * 60 * 1000 }, // 2 minutos
  '/api/dashboard/stats': { ttl: 30 * 1000 }, // 30 segundos
  '/api/reports': { ttl: 10 * 60 * 1000 }, // 10 minutos
  '/api/notas-fiscais': { ttl: 5 * 60 * 1000 }, // 5 minutos
  '/api/contabilidade': { ttl: 15 * 60 * 1000 }, // 15 minutos
}

/**
 * Função helper para obter configuração de cache por URL
 */
export function getCacheConfig(url) {
  for (const [pattern, config] of Object.entries(cacheConfigs)) {
    if (url.includes(pattern)) {
      return config
    }
  }
  return { ttl: apiCache.defaultTTL }
}

export default apiCache