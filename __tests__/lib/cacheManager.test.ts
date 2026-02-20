/**
 * Testes para CacheManager
 */
import CacheManager from '@/lib/cacheManager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({
      maxSize: 5,
      ttl: 1000, // 1 segundo
      strategy: 'LRU',
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('set e get', () => {
    it('deve armazenar e recuperar valores', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('deve retornar null para chave inexistente', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });
  });

  describe('has', () => {
    it('deve retornar true para chave existente', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('deve retornar false para chave inexistente', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('deve deletar chave existente', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('deve expirar itens após TTL', (done) => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('invalidate', () => {
    it('deve invalidar chaves por padrão', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('post:1', 'post1');

      const count = cache.invalidate('user:');
      expect(count).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('post:1')).toBe(true);
    });
  });

  describe('clear', () => {
    it('deve limpar todo o cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Estratégia LRU', () => {
    it('deve remover item menos recentemente usado', () => {
      // Preencher cache até o máximo
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Acessar key0 para torná-la mais recente
      cache.get('key0');

      // Adicionar novo item deve remover key1 (menos recentemente usado)
      cache.set('key5', 'value5');

      expect(cache.has('key0')).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key5')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas do cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
      expect(stats.strategy).toBe('LRU');
    });
  });
});

