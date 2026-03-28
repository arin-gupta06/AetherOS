/**
 * AetherOS — Redis Cache Service
 * 
 * Provides distributed caching for CBCT analysis results
 * Shared between AetherOS backend and CBCT via Redis
 * 
 * Usage:
 *   import { redisCache } from './redisService';
 *   await redisCache.set('key', value);
 *   const value = await redisCache.get('key');
 */

let redis = null;
let isConnected = false;

/**
 * Initialize Redis connection
 * Called once on server startup
 * 
 * @param {Object} options - Redis connection options
 * @returns {Promise<void>}
 */
export async function initializeRedis(options = {}) {
  try {
    // Try to import redis client
    const Redis = (await import('redis')).default;
    
    const redisUrl = options.url || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const redisOptions = {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    };

    redis = Redis.createClient(redisOptions);

    // Handle connection events
    redis.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      isConnected = false;
    });

    redis.on('connect', () => {
      console.info('[Redis] Connected to', process.env.REDIS_URL || 'localhost:6379');
      isConnected = true;
    });

    redis.on('ready', () => {
      console.info('[Redis] Ready to accept commands');
    });

    // Connect to Redis
    await redis.connect();
    isConnected = true;

    console.info('[Redis] Initialization complete');
    return redis;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn('[Redis] redis package not installed. Install with: npm install redis');
      console.warn('[Redis] Operating in no-cache mode');
      return null;
    }
    console.error('[Redis] Initialization failed:', err.message);
    isConnected = false;
    return null;
  }
}

/**
 * Get Redis client instance
 * Returns null if not connected
 * 
 * @returns {Object|null} Redis client or null
 */
export function getRedisClient() {
  return isConnected ? redis : null;
}

/**
 * Check if Redis is connected
 * 
 * @returns {boolean}
 */
export function isRedisConnected() {
  return isConnected;
}

/**
 * Cache Service with Redis backend
 * Falls back to in-memory cache if Redis unavailable
 */
export class RedisCacheService {
  constructor() {
    this.localCache = new Map(); // Fallback in-memory cache
    this.localTTL = new Map();
    this.defaultTTL = 30 * 60; // 30 minutes in seconds
  }

  /**
   * Get value from cache
   * Tries Redis first, falls back to local cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (isConnected && redis) {
        const value = await redis.get(key);
        if (value) {
          try {
            return JSON.parse(value);
          } catch {
            return value; // Return as string if not JSON
          }
        }
      }
    } catch (err) {
      console.warn('[Redis] GET error, falling back to local cache:', err.message);
    }

    // Fallback to local cache
    return this._getLocal(key);
  }

  /**
   * Set value in cache
   * Stores in Redis and local cache for redundancy
   * 
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time-to-live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    try {
      if (isConnected && redis) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        await redis.setEx(key, ttlSeconds, serialized);
      }
    } catch (err) {
      console.warn('[Redis] SET error:', err.message);
    }

    // Always set in local cache as fallback
    this._setLocal(key, value, ttlSeconds * 1000);
  }

  /**
   * Delete key from cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      if (isConnected && redis) {
        await redis.del(key);
      }
    } catch (err) {
      console.warn('[Redis] DELETE error:', err.message);
    }

    this._deleteLocal(key);
  }

  /**
   * Check if key exists in cache
   * 
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    try {
      if (isConnected && redis) {
        const exists = await redis.exists(key);
        return exists === 1;
      }
    } catch (err) {
      console.warn('[Redis] EXISTS error:', err.message);
    }

    return this._hasLocal(key);
  }

  /**
   * Clear all cache (Redis and local)
   * 
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      if (isConnected && redis) {
        await redis.flushDb();
      }
    } catch (err) {
      console.warn('[Redis] FLUSH error:', err.message);
    }

    this.localCache.clear();
    this.localTTL.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns {Promise<Object>}
   */
  async getStats() {
    const stats = {
      redis: {
        connected: isConnected,
        mode: isConnected ? 'distributed' : 'disabled'
      },
      local: {
        size: this.localCache.size,
        keys: Array.from(this.localCache.keys())
      }
    };

    try {
      if (isConnected && redis) {
        const info = await redis.info('memory');
        stats.redis.info = info;
      }
    } catch (err) {
      console.warn('[Redis] INFO error:', err.message);
    }

    return stats;
  }

  // --- Local Fallback Cache Methods ---

  _getLocal(key) {
    if (!this.localCache.has(key)) return null;
    const expiry = this.localTTL.get(key);
    if (expiry && Date.now() > expiry) {
      this.localCache.delete(key);
      this.localTTL.delete(key);
      return null;
    }
    return this.localCache.get(key);
  }

  _setLocal(key, value, ttlMs) {
    this.localCache.set(key, value);
    this.localTTL.set(key, Date.now() + ttlMs);
  }

  _deleteLocal(key) {
    this.localCache.delete(key);
    this.localTTL.delete(key);
  }

  _hasLocal(key) {
    return this._getLocal(key) !== null;
  }
}

// Singleton instance
export const redisCache = new RedisCacheService();

// Cache key builders (standardized across AetherOS)
export const cacheKeys = {
  // CBCT analysis results
  cbctAnalysis: (repoPath) => `cbct:analysis:${repoPath}`,
  cbctGraph: (repoPath) => `cbct:graph:${repoPath}`,
  cbctMetrics: (repoPath) => `cbct:metrics:${repoPath}`,
  cbctDependencies: (repoPath) => `cbct:deps:${repoPath}`,

  // Node enrichment
  cbctNodeSummary: (repoPath, nodeId) => `cbct:node:${repoPath}:${nodeId}`,

  // Prefetch tracking
  prefetchStatus: (repoPath) => `prefetch:${repoPath}`,
  prefetchInProgress: (repoPath) => `prefetch:inprogress:${repoPath}`
};

/**
 * Graceful shutdown
 * Call this on server shutdown to disconnect Redis
 * 
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (isConnected && redis) {
    try {
      await redis.quit();
      isConnected = false;
      console.info('[Redis] Disconnected gracefully');
    } catch (err) {
      console.error('[Redis] Shutdown error:', err.message);
    }
  }
}

export default {
  initializeRedis,
  getRedisClient,
  isRedisConnected,
  redisCache,
  cacheKeys,
  closeRedis
};
