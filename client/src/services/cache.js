/**
 * AetherOS × CBCT Shared Cache Layer
 * 
 * Prevents duplicate analysis between AetherOS and CBCT
 * Future: Replace with Redis for distributed caching
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time-to-live tracking
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if expired/missing
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Check if expired
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time-to-live in milliseconds (optional)
   */
  set(key, value, ttlMs = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear entire cache
   */
  clearAll() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache stats (for debugging)
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expirations: Array.from(this.ttl.entries()).map(([k, exp]) => ({
        key: k,
        expiresIn: Math.max(0, exp - Date.now())
      }))
    };
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache key builders (for consistency)
export const cacheKeys = {
  /**
   * CBCT analysis cache key
   * Format: cbct:repoPath
   */
  cbctAnalysis: (repoPath) => `cbct:${repoPath}`,

  /**
   * CBCT graph data cache key
   * Format: cbct:graph:repoPath
   */
  cbctGraph: (repoPath) => `cbct:graph:${repoPath}`,

  /**
   * CBCT complexity metrics cache key
   * Format: cbct:metrics:repoPath
   */
  cbctMetrics: (repoPath) => `cbct:metrics:${repoPath}`,

  /**
   * CBCT dependencies cache key
   * Format: cbct:deps:repoPath
   */
  cbctDependencies: (repoPath) => `cbct:deps:${repoPath}`,

  /**
   * CBCT node summary cache key (for AetherOS integration)
   * Format: cbct:summary:repoPath:nodeId
   */
  cbctNodeSummary: (repoPath, nodeId) => `cbct:summary:${repoPath}:${nodeId}`,

  /**
   * Prefetch status cache key
   * Format: prefetch:repoPath
   */
  prefetchStatus: (repoPath) => `prefetch:${repoPath}`
};

export default cacheService;
