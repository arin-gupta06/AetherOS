/**
 * Test Configuration & Setup
 * 
 * Shared test utilities, fixtures, and helpers
 */

import { vi } from 'vitest';

// --- Mock Factories ---
export const createMockNode = (overrides = {}) => ({
  id: `node-${Math.random()}`,
  type: 'service',
  position: { x: 0, y: 0 },
  data: {
    label: 'Test Node',
    nodeType: 'service',
    status: 'healthy',
    metadata: {},
    ...overrides.data
  },
  ...overrides
});

export const createMockEdge = (source, target, overrides = {}) => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  label: '',
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#6366f1' },
  ...overrides
});

export const createMockCBCTData = (nodeCount = 5) => ({
  nodes: Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    files: Array(Math.floor(Math.random() * 10) + 1).fill(`file${i}.js`),
    dependencies: Array.from(
      { length: Math.floor(Math.random() * 5) },
      () => `n${Math.floor(Math.random() * nodeCount)}`
    ),
    dependents: [],
    metadata: { loc: Math.floor(Math.random() * 5000) }
  }))
});

// --- Mock API Responses ---
export const mockGitHubInferenceResponse = {
  nodes: [
    { id: 'api', type: 'service', label: 'API Server', position: { x: 0, y: 0 } },
    { id: 'db', type: 'database', label: 'PostgreSQL', position: { x: 200, y: 0 } },
    { id: 'cache', type: 'cache', label: 'Redis', position: { x: 400, y: 0 } }
  ],
  edges: [
    { id: 'e1', source: 'api', target: 'db' },
    { id: 'e2', source: 'api', target: 'cache' }
  ],
  repoPath: '/tmp/test-repo'
};

export const mockAzureRecommendations = {
  recommendations: [
    {
      id: 'rec1',
      title: 'Enable Auto-scaling',
      description: 'Enable auto-scaling for better cost efficiency',
      severity: 'medium',
      estimatedCost: '-$500/month'
    }
  ]
};

// --- Timer Management ---
export const flushTimers = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

// --- Performance Measurement ---
export const measurePerformance = async (fn, label = 'Operation') => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
  return { result, duration };
};

// --- Mock WebSocket ---
export const createMockWebSocket = () => {
  let listeners = {};

  return {
    addEventListener: vi.fn((event, handler) => {
      listeners[event] = handler;
    }),
    removeEventListener: vi.fn((event) => {
      delete listeners[event];
    }),
    send: vi.fn(),
    close: vi.fn(),
    emit: (event, data) => {
      if (listeners[event]) listeners[event]({ data: JSON.stringify(data) });
    }
  };
};

// --- Assertion Helpers ---
export const expectNodeHasMetadata = (node, keys = []) => {
  expect(node.data.metadata).toBeDefined();
  keys.forEach(key => {
    expect(node.data.metadata).toHaveProperty(key);
  });
};

export const expectCacheValid = (key, maxAge = 5000) => {
  expect(cacheService.has(key)).toBe(true);
  const cached = cacheService.get(key);
  expect(cached).toBeDefined();
};

// --- Test Data Factories ---
export const createTestArchitecture = (nodeCount = 5) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    createMockNode({
      id: `node-${i}`,
      data: { label: `Service${i}` }
    })
  );

  const edges = [];
  for (let i = 0; i < Math.min(nodeCount - 1, 5); i++) {
    edges.push(
      createMockEdge(`node-${i}`, `node-${i + 1}`)
    );
  }

  return { nodes, edges };
};

// --- Async Test Helpers ---
export const waitForCondition = async (condition, timeout = 5000) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await flushTimers();
  }
};

// --- Cleanup ---
export const cleanupTestState = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
};
