import logger from './logger'

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }

  startTiming(name) {
    this.startTimes.set(name, performance.now())
    logger.debug(`Iniciando medição de performance: ${name}`)
  }

  endTiming(name) {
    const startTime = this.startTimes.get(name)
    if (!startTime) {
      logger.warn(`Tentativa de finalizar medição não iniciada: ${name}`)
      return null
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(name)
    
    // Armazenar métrica
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metrics = this.metrics.get(name)
    metrics.push({
      duration,
      timestamp: Date.now()
    })

    // Manter apenas as últimas 100 medições
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }

    logger.info(`Performance: ${name} - ${duration.toFixed(2)}ms`)
    return duration
  }

  getAverageTime(name) {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) {
      return null
    }

    const sum = metrics.reduce((acc, metric) => acc + metric.duration, 0)
    return sum / metrics.length
  }

  getMetrics() {
    const result = {}
    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        result[name] = {
          average: this.getAverageTime(name),
          count: metrics.length,
          last: metrics[metrics.length - 1].duration
        }
      }
    }
    return result
  }

  // Monitorar função automaticamente
  monitor(name, fn) {
    return async (...args) => {
      this.startTiming(name)
      try {
        const result = await fn(...args)
        this.endTiming(name)
        return result
      } catch (error) {
        this.endTiming(name)
        throw error
      }
    }
  }

  // Verificar se alguma operação está lenta
  checkSlowOperations() {
    const slowThreshold = 1000 // 1 segundo
    const warnings = []

    for (const [name, metrics] of this.metrics.entries()) {
      const average = this.getAverageTime(name)
      if (average && average > slowThreshold) {
        warnings.push({
          operation: name,
          averageTime: average,
          threshold: slowThreshold
        })
      }
    }

    if (warnings.length > 0) {
      logger.warn('Operações lentas detectadas:', warnings)
    }

    return warnings
  }

  // Limpar métricas antigas (mais de 1 hora)
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    for (const [name, metrics] of this.metrics.entries()) {
      const recentMetrics = metrics.filter(metric => metric.timestamp > oneHourAgo)
      
      if (recentMetrics.length === 0) {
        this.metrics.delete(name)
      } else {
        this.metrics.set(name, recentMetrics)
      }
    }
  }
}

// Instância global
const performanceMonitor = new PerformanceMonitor()

// Limpeza automática a cada 30 minutos
setInterval(() => {
  performanceMonitor.cleanup()
}, 30 * 60 * 1000)

export default performanceMonitor
export { PerformanceMonitor }
