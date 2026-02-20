
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCacheStats } from '../utils/cacheManager'

/**
 * Hook para monitoramento de performance
 */
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    cacheStats: null,
    networkRequests: 0,
    errors: 0
  })

  const [isMonitoring, setIsMonitoring] = useState(false)

  // Monitorar tempo de renderização
  const measureRenderTime = useCallback((fn) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start
    }))
    
    return result
  }, [])

  // Monitorar uso de memória
  const updateMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance.memory) {
      const memory = window.performance.memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }))
    }
  }, [])

  // Monitorar estatísticas do cache
  const updateCacheStats = useCallback(() => {
    const stats = getCacheStats()
    setMetrics(prev => ({
      ...prev,
      cacheStats: stats
    }))
  }, [])

  // Monitorar requisições de rede
  useEffect(() => {
    if (!isMonitoring) return

    let requestCount = 0
    let errorCount = 0

    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      requestCount++
      setMetrics(prev => ({ ...prev, networkRequests: requestCount }))
      
      try {
        const response = await originalFetch(...args)
        return response
      } catch (error) {
        errorCount++
        setMetrics(prev => ({ ...prev, errors: errorCount }))
        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [isMonitoring])

  // Atualizar métricas periodicamente
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      updateMemoryUsage()
      updateCacheStats()
    }, 5000) // A cada 5 segundos

    return () => clearInterval(interval)
  }, [isMonitoring, updateMemoryUsage, updateCacheStats])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    updateMemoryUsage()
    updateCacheStats()
  }, [updateMemoryUsage, updateCacheStats])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  const resetMetrics = useCallback(() => {
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      cacheStats: null,
      networkRequests: 0,
      errors: 0
    })
  }, [])

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    measureRenderTime
  }
}

/**
 * Hook para otimização de re-renders
 */
export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps)
}

/**
 * Hook para otimização de valores computados
 */
export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps)
}

/**
 * Hook para debounce de valores
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para throttle de funções
 */
export const useThrottle = (callback, delay) => {
  const [throttledCallback, setThrottledCallback] = useState(callback)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledCallback(callback)
        lastRun.current = Date.now()
      }
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])

  return throttledCallback
}

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = (importFunc) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadComponent = useCallback(async () => {
    if (Component) return Component

    setLoading(true)
    setError(null)

    try {
      const module = await importFunc()
      const component = module.default || module
      setComponent(() => component)
      return component
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [Component, importFunc])

  return {
    Component,
    loading,
    error,
    loadComponent
  }
}

/**
 * Hook para virtualização de listas
 */
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)

  const visibleItems = useMemo(() => {
    if (!items.length) return []

    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }))
  }, [items, scrollTop, itemHeight, containerHeight])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    containerRef: setContainerRef,
    handleScroll
  }
}

/**
 * Hook para preload de recursos
 */
export const usePreload = () => {
  const [preloadedResources, setPreloadedResources] = useState(new Set())

  const preloadImage = useCallback((src) => {
    if (preloadedResources.has(src)) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        setPreloadedResources(prev => new Set([...prev, src]))
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }, [preloadedResources])

  const preloadScript = useCallback((src) => {
    if (preloadedResources.has(src)) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = () => {
        setPreloadedResources(prev => new Set([...prev, src]))
        resolve()
      }
      script.onerror = reject
      script.src = src
      document.head.appendChild(script)
    })
  }, [preloadedResources])

  const preloadStylesheet = useCallback((href) => {
    if (preloadedResources.has(href)) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      link.onload = () => {
        setPreloadedResources(prev => new Set([...prev, href]))
        resolve()
      }
      link.onerror = reject
      document.head.appendChild(link)
    })
  }, [preloadedResources])

  return {
    preloadedResources,
    preloadImage,
    preloadScript,
    preloadStylesheet
  }
}

/**
 * Hook para monitoramento de performance de componentes
 */
export const useComponentPerformance = (componentName) => {
  const [renderCount, setRenderCount] = useState(0)
  const [renderTimes, setRenderTimes] = useState([])
  const [isProfiling, setIsProfiling] = useState(false)

  useEffect(() => {
    if (!isProfiling) return

    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      setRenderCount(prev => prev + 1)
      setRenderTimes(prev => [...prev.slice(-9), renderTime]) // Manter últimos 10
    }
  }, [isProfiling])

  const startProfiling = useCallback(() => {
    setIsProfiling(true)
    setRenderCount(0)
    setRenderTimes([])
  }, [])

  const stopProfiling = useCallback(() => {
    setIsProfiling(false)
  }, [])

  const getStats = useCallback(() => {
    if (renderTimes.length === 0) return null

    const avg = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    const min = Math.min(...renderTimes)
    const max = Math.max(...renderTimes)

    return {
      componentName,
      renderCount,
      averageRenderTime: avg,
      minRenderTime: min,
      maxRenderTime: max,
      recentRenderTimes: renderTimes
    }
  }, [componentName, renderCount, renderTimes])

  return {
    renderCount,
    renderTimes,
    isProfiling,
    startProfiling,
    stopProfiling,
    getStats
  }
}

export default usePerformance
