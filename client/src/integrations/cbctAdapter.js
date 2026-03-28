/**
 * AetherOS → CBCT Adapter
 * 
 * Adapter Pattern Implementation
 * 
 * PRINCIPLE: AetherOS adapts itself to CBCT, not the other way around.
 * This adapter is the ONLY place in AetherOS that knows about CBCT.
 * 
 * Responsibilities:
 * - Translate AetherOS node structure → CBCT-compatible input
 * - Build correct CBCT URLs and API requests
 * - Handle optional caching and prefetching
 * - Abstract all CBCT interaction from the rest of AetherOS
 */

/**
 * CBCT System Configuration
 * Update this if CBCT deployment changes
 */
const CBCT_CONFIG = {
  // Primary CBCT deployment URL
  baseUrl: 'https://cbct-code-base-cartographic-tool-cl.vercel.app/',
  
  // API endpoints (if needed for future enhancements)
  apiEndpoints: {
    analyze: '/api/analyze',
    prefetch: '/api/prefetch',
    health: '/api/health'
  },
  
  // Query parameters for embedded mode
  queryParams: {
    mode: 'embedded',
    repoPath: null // Will be populated dynamically
  }
};

/**
 * Build CBCT URL from AetherOS node data
 * 
 * INPUT: AetherOS Node
 * OUTPUT: CBCT-compatible URL
 * 
 * @param {Object} node - AetherOS node object
 * @returns {string} CBCT URL with encoded repository path
 * 
 * IMPORTANT: Adapter extracts repoPath from node metadata.
 * Node must have lastInferredRepo or node.data.metadata.repoPath
 */
export function buildCBCTUrl(node, lastInferredRepo) {
  // Strategy 1: Use lastInferredRepo from global state (preferred)
  const repoPath = lastInferredRepo || node?.data?.metadata?.repoPath;
  
  if (!repoPath) {
    console.warn(
      '[CBCTAdapter] No repository path found. ' +
      'Ensure node has metadata.repoPath or lastInferredRepo is set.'
    );
    return null;
  }

  // Build URL with query string
  const params = new URLSearchParams({
    repoPath,
    mode: 'embedded'
  });

  const url = `${CBCT_CONFIG.baseUrl}?${params.toString()}`;
  
  console.debug('[CBCTAdapter] Built CBCT URL:', {
    repoPath,
    url: url.split('?')[0] // Log base without params for clarity
  });

  return url;
}

/**
 * Extract repository path from node
 * Helper for checking if node is CBCT-ready
 * 
 * @param {Object} node - AetherOS node
 * @param {string} lastInferredRepo - Global last inferred repository
 * @returns {string|null} Repository path if available
 */
export function getNodeRepositoryPath(node, lastInferredRepo) {
  return lastInferredRepo || node?.data?.metadata?.repoPath || null;
}

/**
 * Open CBCT context for a node
 * Public API for transitioning to CODE view
 * 
 * USAGE: Called when user double-clicks a node
 * 
 * @param {Object} node - AetherOS node
 * @param {string} lastInferredRepo - Global repository path
 * @returns {string} CBCT URL for iframe
 */
export function openCBCTContext(node, lastInferredRepo) {
  const cbctUrl = buildCBCTUrl(node, lastInferredRepo);
  
  if (!cbctUrl) {
    throw new Error(
      'Cannot open CBCT: no repository path. ' +
      'Load architecture from GitHub first.'
    );
  }

  console.info('[CBCTAdapter] Opening CBCT context:', {
    nodeId: node.id,
    nodeLabel: node.data?.label
  });

  return cbctUrl;
}

/**
 * Prefetch CBCT data for performance optimization
 * Non-blocking background operation
 * 
 * USAGE: Call during repo load or node hover to warm cache
 * 
 * @param {string} repoPath - Repository to prefetch
 * @returns {Promise<void>}
 */
export async function prefetchCBCT(repoPath) {
  if (!repoPath) {
    console.warn('[CBCTAdapter] Prefetch aborted: no repoPath provided');
    return;
  }

  try {
    // Build prefetch URL
    const prefetchUrl = new URL(
      CBCT_CONFIG.apiEndpoints.prefetch,
      CBCT_CONFIG.baseUrl
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(prefetchUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('[CBCTAdapter] Prefetch returned non-OK status:', response.status);
    } else {
      console.info('[CBCTAdapter] Prefetch completed:', { repoPath });
    }
  } catch (err) {
    // Prefetch failures are non-critical
    if (err.name === 'AbortError') {
      console.warn('[CBCTAdapter] Prefetch timed out');
    } else {
      console.warn('[CBCTAdapter] Prefetch error:', err.message);
    }
  }
}

/**
 * Validate if a node can be inspected in CBCT
 * Useful for enabling/disabling UI buttons
 * 
 * @param {Object} node - AetherOS node
 * @param {string} lastInferredRepo - Global repository path
 * @returns {boolean} True if node can be inspected
 */
export function canInspectInCBCT(node, lastInferredRepo) {
  return !!getNodeRepositoryPath(node, lastInferredRepo);
}

/**
 * Get CBCT configuration
 * Useful for future enhancements or diagnostics
 * 
 * @returns {Object} Current CBCT configuration
 */
export function getCBCTConfig() {
  return { ...CBCT_CONFIG };
}

/**
 * Update CBCT configuration
 * Call this if CBCT deployment URL changes
 * 
 * @param {Object} updates - Partial config updates
 */
export function updateCBCTConfig(updates) {
  if (updates.baseUrl) {
    CBCT_CONFIG.baseUrl = updates.baseUrl;
    console.info('[CBCTAdapter] Updated CBCT base URL:', CBCT_CONFIG.baseUrl);
  }
  if (updates.apiEndpoints) {
    CBCT_CONFIG.apiEndpoints = { ...CBCT_CONFIG.apiEndpoints, ...updates.apiEndpoints };
  }
}

/**
 * Export all adapter functions as a single object
 * Useful for dependency injection or testing
 */
export const cbctAdapter = {
  buildCBCTUrl,
  getNodeRepositoryPath,
  openCBCTContext,
  prefetchCBCT,
  canInspectInCBCT,
  getCBCTConfig,
  updateCBCTConfig
};

export default cbctAdapter;
