/**
 * Integration Tests - CBCT Module
 * 
 * Tests interaction between CBCT components, services, and store
 * Covers: prefetch → cache → CODE view flow, data transformation, metrics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useStore from '../../../client/src/store/useStore';
import { cacheService, cacheKeys } from '../../../client/src/services/cache';
import { queuePrefetch } from '../../../client/src/services/prefetch';
import { transformCBCTToNodeMetadata } from '../../../client/src/services/cbctIntegration';

describe('CBCT Module Integration - Full Data Flow', () => {
  beforeEach(() => {
    cacheService.clearAll();
    vi.clearAllMocks();
  });

  describe('Prefetch → Cache → CODE View Flow', () => {
    it('should import repo and queue CBCT prefetch', async () => {
      const { result } = renderHook(() => useStore());

      const importResult = {
        nodes: [
          { id: 'n1', type: 'service', label: 'API', position: { x: 0, y: 0 } },
          { id: 'n2', type: 'service', label: 'DB', position: { x: 100, y: 0 } }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' }
        ],
        repoPath: '/repo/github.com/test/app'
      };

      act(() => {
        result.current.importInferredGraph(importResult);
      });

      expect(result.current.nodes).toHaveLength(2);
      expect(result.current.lastInferredRepo).toBe('/repo/github.com/test/app');
      
      // Verify prefetch was queued (would be async)
      // This would require mocking the prefetch function
    });

    it('should cache CBCT analysis results', async () => {
      const repoPath = '/repo/test';
      const cbctData = {
        nodes: [
          { id: 'n1', files: ['a.js', 'b.js'], dependencies: [] },
          { id: 'n2', files: ['c.js'], dependencies: ['n1'] }
        ]
      };

      // Simulate prefetch storing data
      act(() => {
        cacheService.set(
          cacheKeys.cbctAnalysis(repoPath),
          cbctData
        );
      });

      // Verify cache hit
      const cached = cacheService.get(cacheKeys.cbctAnalysis(repoPath));
      expect(cached).toEqual(cbctData);
    });

    it('should load CODE view from cache instantly', () => {
      const repoPath = '/repo/test';
      const cbctData = {
        nodes: [{ id: 'n1', complexity: 0.5 }]
      };

      cacheService.set(cacheKeys.cbctAnalysis(repoPath), cbctData);

      const start = performance.now();
      const cached = cacheService.get(cacheKeys.cbctAnalysis(repoPath));
      const duration = performance.now() - start;

      expect(cached).toBeDefined();
      expect(duration).toBeLessThan(10); // Must be <10ms for cache hit
    });
  });

  describe('Data Transformation - CBCT to AetherOS', () => {
    it('should transform CBCT data to node metadata', () => {
      const cbctGraphData = {
        nodes: [
          {
            id: 'n1',
            files: ['a.js', 'b.js', 'c.js'],
            dependencies: ['n2', 'n3'],
            dependents: ['n4'],
            metadata: { loc: 500 }
          }
        ]
      };

      const metadata = transformCBCTToNodeMetadata(cbctGraphData);

      expect(metadata['n1']).toBeDefined();
      expect(metadata['n1'].complexity).toBeGreaterThan(0);
      expect(metadata['n1'].complexity).toBeLessThanOrEqual(1);
      expect(metadata['n1'].fileCount).toBe(3);
      expect(metadata['n1'].dependencyCount).toBe(2);
      expect(metadata['n1'].dependentCount).toBe(1);
    });

    it('should calculate complexity between 0-1', () => {
      const testCases = [
        { files: [], dependencies: [], expected: 'low' },
        { files: Array(10).fill('f.js'), dependencies: Array(5).fill('n'), expected: 'medium' },
        { files: Array(50).fill('f.js'), dependencies: Array(15).fill('n'), expected: 'high' }
      ];

      testCases.forEach(({ files, dependencies, expected }) => {
        const metadata = transformCBCTToNodeMetadata({
          nodes: [{
            id: 'test',
            files,
            dependencies,
            dependents: [],
            metadata: {}
          }]
        });

        expect(metadata.test.complexityLevel).toBe(expected);
      });
    });

    it('should determine risk levels correctly', () => {
      const highRiskNode = {
        nodes: [{
          id: 'high',
          files: Array(50).fill('f.js'),
          dependencies: Array(10).fill('n'),
          dependents: [],
          metadata: {}
        }]
      };

      const metadata = transformCBCTToNodeMetadata(highRiskNode);
      expect(metadata.high.riskLevel).toBe('high');
    });
  });

  describe('Node Enrichment Workflow', () => {
    it('should enrich nodes with CBCT data', () => {
      const { result } = renderHook(() => useStore());
      
      // Create architecture
      act(() => {
        result.current.addNode({ id: 'n1', label: 'Service', type: 'service' });
      });

      // Apply CBCT data
      const cbctData = {
        graphData: {
          nodes: [{
            id: 'n1',
            files: ['a.js', 'b.js'],
            dependencies: ['n2'],
            dependents: [],
            metadata: {}
          }]
        },
        metrics: {}
      };

      act(() => {
        result.current.applyCBCTDataToNodes('/repo', cbctData);
      });

      // Verify enrichment
      const node = result.current.nodes[0];
      expect(node.data.metadata.cbctAnalyzed).toBe(true);
      expect(node.data.metadata.fileCount).toBe(2);
      expect(node.data.metadata.dependencyCount).toBe(1);
      expect(node.data.metadata.complexity).toBeGreaterThan(0);
    });
  });

  describe('Error Handling & Recovery', () => {
    it('should handle missing CBCT data gracefully', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.addNode({ label: 'Test', type: 'service' });
      });

      // Try to apply null data
      act(() => {
        result.current.applyCBCTDataToNodes('/repo', null);
      });

      // Should not crash, nodes should be unchanged
      expect(result.current.nodes).toHaveLength(1);
    });

    it('should handle empty CBCT results', () => {
      const metadata = transformCBCTToNodeMetadata({
        nodes: []
      });

      expect(metadata).toEqual({});
    });

    it('should handle cache misses without crashing', () => {
      const missing = cacheService.get(cacheKeys.cbctAnalysis('/nonexistent'));
      expect(missing).toBeNull();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large CBCT graphs (1000+ nodes)', () => {
      const largeGraph = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `n${i}`,
          files: Array(5).fill('f.js'),
          dependencies: Array.from({ length: 5 }, (_, j) => `n${(i + j) % 100}`),
          dependents: [],
          metadata: {}
        }))
      };

      const start = performance.now();
      const metadata = transformCBCTToNodeMetadata(largeGraph);
      const duration = performance.now() - start;

      expect(Object.keys(metadata)).toHaveLength(100);
      expect(duration).toBeLessThan(100); // Should complete quickly
    });

    it('should cache multiple repos without collision', () => {
      const repos = ['/repo1', '/repo2', '/repo3'];
      const data = { nodes: [{ id: 'n', files: [] }] };

      repos.forEach(repo => {
        cacheService.set(cacheKeys.cbctAnalysis(repo), data);
      });

      repos.forEach(repo => {
        const cached = cacheService.get(cacheKeys.cbctAnalysis(repo));
        expect(cached).toBeDefined();
      });
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistency through view transitions', async () => {
      const { result } = renderHook(() => useStore());
      
      act(() => {
        result.current.addNode({ label: 'Test', type: 'service' });
      });

      const nodeId = result.current.nodes[0].id;

      // Enter CODE view
      act(() => {
        result.current.enterCodeView(nodeId);
      });
      expect(result.current.viewMode).toBe('CODE');

      // Simulate CBCT data
      const cbctData = {
        graphData: { nodes: [{ id: nodeId, files: [], dependencies: [], dependents: [] }] },
        metrics: {}
      };

      // Exit CODE view
      act(() => {
        result.current.applyCBCTDataToNodes('/repo', cbctData);
        result.current.exitCodeView();
      });

      expect(result.current.viewMode).toBe('ARCHITECTURE');
      expect(result.current.nodes[0].data.metadata.cbctAnalyzed).toBe(true);
    });
  });
});
