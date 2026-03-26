/**
 * AetherOS × CBCT Prefetch Service
 * 
 * Triggers CBCT analysis in background when a repository is inferred,
 * stores results in shared cache to enable instant CODE view loading.
 */

import { cacheService, cacheKeys } from './cache';
import api from '../lib/api';

/**
 * Prefetch CBCT analysis for a repository
 * Runs in background - does not block UI
 * 
 * @param {string} repoPath - Repository path to analyze
 * @returns {Promise<Object>} Analysis result
 */
export async function prefetchCBCTAnalysis(repoPath) {
  // Check if already cached
  const cacheKey = cacheKeys.cbctAnalysis(repoPath);
  const cached = cacheService.get(cacheKey);
  if (cached) {
    console.log(`[CBCT Prefetch] Cache HIT for ${repoPath}`);
    return cached;
  }

  // Check if prefetch is already in progress
  const prefetchKey = cacheKeys.prefetchStatus(repoPath);
  const existing = cacheService.get(prefetchKey);
  if (existing === 'IN_PROGRESS') {
    console.log(`[CBCT Prefetch] Already in progress for ${repoPath}`);
    return null; // Don't double-fetch
  }

  // Mark as in progress
  cacheService.set(prefetchKey, 'IN_PROGRESS', 10 * 60 * 1000); // 10 min timeout

  try {
    console.log(`[CBCT Prefetch] Starting analysis for ${repoPath}`);

    // Trigger CBCT analysis via backend
    const result = await api.analyzeCbct(repoPath);

    // Cache the result for 30 minutes
    cacheService.set(cacheKey, result, 30 * 60 * 1000);
    cacheService.set(prefetchKey, 'COMPLETE', 10 * 60 * 1000);

    console.log(`[CBCT Prefetch] Complete for ${repoPath}`);
    return result;
  } catch (error) {
    console.error(`[CBCT Prefetch] Failed for ${repoPath}:`, error);
    cacheService.set(prefetchKey, 'FAILED', 5 * 60 * 1000); // Retry after 5 min
    throw error;
  }
}

/**
 * Get prefetch status for a repository
 * @param {string} repoPath - Repository path
 * @returns {string} 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED'
 */
export function getPrefetchStatus(repoPath) {
  const prefetchKey = cacheKeys.prefetchStatus(repoPath);
  return cacheService.get(prefetchKey) || 'NOT_STARTED';
}

/**
 * Clear prefetch cache for a repository
 * @param {string} repoPath - Repository path
 */
export function clearPrefetch(repoPath) {
  const cacheKey = cacheKeys.cbctAnalysis(repoPath);
  const prefetchKey = cacheKeys.prefetchStatus(repoPath);
  
  cacheService.clear(cacheKey);
  cacheService.clear(prefetchKey);
  console.log(`[CBCT Prefetch] Cleared cache for ${repoPath}`);
}

/**
 * Queue a prefetch without waiting for result
 * Use this when importing graphs to avoid blocking UI
 * 
 * @param {string} repoPath - Repository path
 */
export function queuePrefetch(repoPath) {
  // Fire and forget
  prefetchCBCTAnalysis(repoPath).catch(err => {
    console.warn('[CBCT Prefetch] Background fetch failed:', err);
  });
}

export default {
  prefetchCBCTAnalysis,
  getPrefetchStatus,
  clearPrefetch,
  queuePrefetch
};
