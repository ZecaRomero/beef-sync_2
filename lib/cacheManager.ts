/**
 * Sistema de cache inteligente com invalidação automática
 * Suporta múltiplas estratégias de cache (LRU, LFU, FIFO)
 */

import type { CacheConfig } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

type CacheStrategy = 'LRU' | 'LFU' | 'FIFO';

class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private strategy: CacheStrategy;
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.strategy = config.strategy || 'LRU';
    this.maxSize = config.maxSize || 100;
    this.defaultTTL = config.ttl || 60000; // 1 minuto padrão

    // Iniciar limpeza automática a cada minuto
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Adicionar ou atualizar item no cache
   */
  set(key: string, data: T, ttl?: number): void {
    // Se atingiu o tamanho máximo, remover item baseado na estratégia
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccess: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Obter item do cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccess = Date.now();

    return entry.data;
  }

  /**
   * Verificar se existe no cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remover item do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidar cache por padrão de chave
   */
  invalidate(pattern: string): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obter tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    strategy: CacheStrategy;
    hitRate: number;
  } {
    let totalAccess = 0;
    let hits = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      if (entry.accessCount > 0) hits++;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      strategy: this.strategy,
      hitRate: totalAccess > 0 ? hits / totalAccess : 0,
    };
  }

  /**
   * Remover itens expirados
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Remover item baseado na estratégia de cache
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (this.strategy) {
      case 'LRU': // Least Recently Used
        keyToEvict = this.findLRU();
        break;
      case 'LFU': // Least Frequently Used
        keyToEvict = this.findLFU();
        break;
      case 'FIFO': // First In First Out
        keyToEvict = this.findFIFO();
        break;
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * Encontrar item menos recentemente usado
   */
  private findLRU(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Encontrar item menos frequentemente usado
   */
  private findLFU(): string | null {
    let leastUsedKey: string | null = null;
    let leastCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  /**
   * Encontrar item mais antigo (primeiro inserido)
   */
  private findFIFO(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Destruir instância do cache e limpar interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Instância global do cache
export const globalCache = new CacheManager({
  maxSize: 200,
  ttl: 300000, // 5 minutos
  strategy: 'LRU',
});

// Cache específico para animais
export const animalsCache = new CacheManager({
  maxSize: 500,
  ttl: 600000, // 10 minutos
  strategy: 'LRU',
});

// Cache para dados de dashboard
export const dashboardCache = new CacheManager({
  maxSize: 50,
  ttl: 180000, // 3 minutos
  strategy: 'LRU',
});

// Cache para estoque de sêmen
export const semenCache = new CacheManager({
  maxSize: 300,
  ttl: 600000, // 10 minutos
  strategy: 'LRU',
});

export default CacheManager;

