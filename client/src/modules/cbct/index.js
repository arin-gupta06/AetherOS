/**
 * CBCT Module - Code Intelligence Features
 * 
 * Unified module bringing together all CBCT-related functionality:
 * - Code graph visualization
 * - Dependency analysis
 * - Complexity metrics
 */

// Components
export { CBCTWrapper } from './components/CBCTWrapper';
export { CBCTViewer } from './components/CBCTViewer';

// Services
export { cacheService, cacheKeys } from './services/cache';
export { queuePrefetch, getPrefetchStatus } from './services/prefetch';
export { 
  transformCBCTToNodeMetadata,
  getNodeIndicators,
  createNodeSummaryCard,
  enrichNodesWithCBCTData
} from './services/cbctIntegration';

// Module config
export const CBCT = {
  name: 'cbct',
  version: '1.0.0',
  features: [
    'code-graph-visualization',
    'dependency-analysis',
    'complexity-metrics',
    'prefetch-optimization',
    'cache-integration'
  ]
};
