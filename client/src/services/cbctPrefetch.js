/**
 * CBCT Prefetch Service
 * 
 * Manages non-blocking, background prefetching of CBCT analysis
 * to ensure instant CODE view loading.
 * 
 * This service returns Promises for all async operations,
 * allowing fire-and-forget pattern for non-critical prefetch.
 * 
 * INTEGRATION: Uses the CBCT Adapter exclusively
 */

import { prefetchCBCT } from '../integrations/cbctAdapter';

// Queue for managing prefetch requests
const prefetchQueue = new Set();
const maxConcurrentPrefetches = 2;
let activePrefetches = 0;

/**
 * Queue a repository for prefetch
 * Non-blocking, can be called multiple times safely
 * 
 * @param {string} repoPath - Repository path to prefetch
 */
export async function queuePrefetch(repoPath) {
  if (!repoPath || prefetchQueue.has(repoPath)) {
    return;
  }

  prefetchQueue.add(repoPath);
  processPrefetchQueue();
}

/**
 * Process prefetch queue with concurrency limit
 * Internal function
 */
async function processPrefetchQueue() {
  if (activePrefetches >= maxConcurrentPrefetches || prefetchQueue.size === 0) {
    return;
  }

  activePrefetches++;
  const repoPath = prefetchQueue.values().next().value;
  prefetchQueue.delete(repoPath);

  try {
    await prefetchCBCT(repoPath);
  } catch (err) {
    console.error('[PrefetchService] Error prefetching:', err);
  } finally {
    activePrefetches--;
    if (prefetchQueue.size > 0) {
      processPrefetchQueue();
    }
  }
}

/**
 * Clear the prefetch queue
 */
export function clearPrefetchQueue() {
  prefetchQueue.clear();
}

/**
 * Get current queue status
 * Useful for debugging
 */
export function getPrefetchStatus() {
  return {
    queued: prefetchQueue.size,
    active: activePrefetches,
    maxConcurrent: maxConcurrentPrefetches
  };
}

export default {
  queuePrefetch,
  clearPrefetchQueue,
  getPrefetchStatus
};
