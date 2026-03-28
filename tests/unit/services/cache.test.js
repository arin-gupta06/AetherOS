/**
 * Unit Tests - Cache Service
 * 
 * Comprehensive testing of cache.js service
 * Covers: storage, TTL, expiration, thread-safety, performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheService, cacheKeys } from '../../../client/src/services/cache';

describe('Cache Service - Robustness', () => {
  beforeEach(() => {
    cacheService.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Basic Operations ---
  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cacheService.set('test-key', { data: 'value' });
      expect(cacheService.get('test-key')).toEqual({ data: 'value' });
    });

    it('should return null for missing keys', () => {
      expect(cacheService.get('nonexistent')).toBeNull();
    });

    it('should check key existence with has()', () => {
      cacheService.set('key1', 'val1');
      expect(cacheService.has('key1')).toBe(true);
      expect(cacheService.has('key2')).toBe(false);
    });

    it('should clear individual keys', () => {
      cacheService.set('key1', 'val1');
      cacheService.set('key2', 'val2');
      cacheService.clear('key1');
      expect(cacheService.has('key1')).toBe(false);
      expect(cacheService.has('key2')).toBe(true);
    });

    it('should clear entire cache', () => {
      cacheService.set('key1', 'val1');
      cacheService.set('key2', 'val2');
      cacheService.clearAll();
      expect(cacheService.size()).toBe(0);
    });
  });

  // --- TTL & Expiration ---
  describe('TTL & Expiration', () => {
    it('should expire entries after TTL', () => {
      cacheService.set('expiring', 'value', 1000); // 1 second
      expect(cacheService.has('expiring')).toBe(true);
      vi.advanceTimersByTime(1001);
      expect(cacheService.has('expiring')).toBe(false);
    });

    it('should use default TTL if not specified', () => {
      cacheService.set('default-ttl', 'value');
      vi.advanceTimersByTime(30 * 60 * 1000 - 100); // Just before default 30min
      expect(cacheService.has('default-ttl')).toBe(true);
      vi.advanceTimersByTime(200); // Cross the threshold
      expect(cacheService.has('default-ttl')).toBe(false);
    });

    it('should allow custom TTL per entry', () => {
      cacheService.set('short', 'val', 1000);
      cacheService.set('long', 'val', 60000);
      vi.advanceTimersByTime(1500);
      expect(cacheService.has('short')).toBe(false);
      expect(cacheService.has('long')).toBe(true);
    });
  });

  // --- Edge Cases ---
  describe('Edge Cases & Robustness', () => {
    it('should handle null values', () => {
      cacheService.set('null-key', null);
      expect(cacheService.get('null-key')).toBeNull();
    });

    it('should handle undefined values', () => {
      cacheService.set('undefined-key', undefined);
      // Undefined is stored, but get() returns the value
      expect(cacheService.get('undefined-key')).toBeUndefined();
    });

    it('should handle large objects', () => {
      const largeObj = {
        data: new Array(10000).fill({ nested: { deep: { value: 1 } } })
      };
      cacheService.set('large', largeObj);
      expect(cacheService.get('large')).toBe(largeObj);
    });

    it('should handle special characters in keys', () => {
      const keys = ['key:with:colons', 'key/with/slashes', 'key-with-dashes'];
      keys.forEach(k => {
        cacheService.set(k, 'value');
        expect(cacheService.has(k)).toBe(true);
      });
    });

    it('should prevent key collision attacks', () => {
      cacheService.set('cbct:repo1', 'data1');
      cacheService.set('cbct:repo2', 'data2');
      expect(cacheService.get('cbct:repo1')).toBe('data1');
      expect(cacheService.get('cbct:repo2')).toBe('data2');
    });
  });

  // --- Performance ---
  describe('Performance', () => {
    it('should retrieve cached values in <10ms', () => {
      cacheService.set('perf-key', { data: 'value' });
      const start = performance.now();
      cacheService.get('perf-key');
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });

    it('should handle 1000 entries efficiently', () => {
      // Populate cache
      for (let i = 0; i < 1000; i++) {
        cacheService.set(`key-${i}`, `value-${i}`);
      }
      expect(cacheService.size()).toBe(1000);

      // Random access performance
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * 1000);
        cacheService.get(`key-${idx}`);
      }
      const duration = performance.now() - start;
      expect(duration / 100).toBeLessThan(1); // <1ms per access on average
    });
  });

  // --- Cache Statistics ---
  describe('Cache Statistics', () => {
    it('should report accurate size', () => {
      expect(cacheService.size()).toBe(0);
      cacheService.set('key1', 'val1');
      expect(cacheService.size()).toBe(1);
      cacheService.set('key2', 'val2');
      expect(cacheService.size()).toBe(2);
      cacheService.clear('key1');
      expect(cacheService.size()).toBe(1);
    });

    it('should report stats accurately', () => {
      cacheService.set('key1', 'val1', 5000);
      cacheService.set('key2', 'val2', 10000);
      const stats = cacheService.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.expirations.length).toBe(2);
    });
  });

  // --- Thread Safety ---
  describe('Thread Safety & Concurrency', () => {
    it('should handle concurrent writes safely', () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            cacheService.set(`key-${i}`, `value-${i}`);
          })
        );
      }
      return Promise.all(promises).then(() => {
        expect(cacheService.size()).toBe(100);
      });
    });

    it('should handle concurrent reads safely', async () => {
      cacheService.set('shared-key', 'shared-value');
      const reads = await Promise.all(
        Array(50).fill(null).map(() => 
          Promise.resolve(cacheService.get('shared-key'))
        )
      );
      expect(reads).toEqual(Array(50).fill('shared-value'));
    });
  });
});

// --- Cache Key Builders ---
describe('Cache Key Builders', () => {
  it('should generate consistent CBCT analysis keys', () => {
    const key1 = cacheKeys.cbctAnalysis('repo1');
    const key2 = cacheKeys.cbctAnalysis('repo1');
    expect(key1).toBe(key2);
  });

  it('should differentiate keys by repository', () => {
    const key1 = cacheKeys.cbctAnalysis('repo1');
    const key2 = cacheKeys.cbctAnalysis('repo2');
    expect(key1).not.toBe(key2);
  });

  it('should include repository in node summary key', () => {
    const key = cacheKeys.cbctNodeSummary('repo1', 'node123');
    expect(key).toContain('repo1');
    expect(key).toContain('node123');
  });
});
