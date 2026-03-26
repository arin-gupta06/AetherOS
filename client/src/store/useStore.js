/**
 * AetherOS — Unified State Authority (Zustand)
 * Central state engine: all mutations are governed, tracked, and replayable.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { v4 as uuidv4 } from '../lib/uuid';

const useStore = create(
  persist(
    (set, get) => ({
  // --- Environment ---
  currentEnvironment: null,
  environments: [],

  // --- Architecture Graph ---
  nodes: [],
  edges: [],

  // --- Governance ---
  rules: [],
  violations: [],
  riskScore: 0,

  // --- Simulation ---
  simulationActive: false,
  simulationResult: null,
  preSimulationStatuses: null,
  resilienceScore: 100,

  // --- CBCT / Structural Intelligence ---
  cbctData: null,
  cbctActiveNodeId: null, // Which node is currently being inspected in CODE view
  cbctLoading: false, // Is CBCT analysis in progress
  cbctError: null, // Latest CBCT error
  selectedNodeId: null,
  selectedEdgeId: null,

  // --- Event Log ---
  events: [],

  // --- UI State ---
  viewMode: 'ARCHITECTURE', // 'ARCHITECTURE' | 'CODE'
  sidebarTab: 'nodes',
  rightPanelOpen: false,
  rightPanelTab: 'properties',
  inferenceLoading: false,
  lastInferredRepo: null,
  notification: null,

  // ========== MUTATIONS (all go through state authority) ==========

  /** Push event to the log */
  _pushEvent(type, payload, severity = 'info') {
    const event = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      payload,
      severity
    };
    set(state => ({ events: [...state.events.slice(-999), event] }));
    return event;
  },

  // --- Node Operations ---
  addNode(nodeData) {
    const id = nodeData.id || uuidv4();
    const node = {
      id,
      type: nodeData.type || 'service',
      position: nodeData.position || { x: 250, y: 250 },
      data: {
        label: nodeData.label || 'New Service',
        nodeType: nodeData.type || 'service',
        runtime: nodeData.runtime || '',
        environmentType: nodeData.environmentType || '',
        cpu: nodeData.cpu || '',
        memory: nodeData.memory || '',
        port: nodeData.port || null,
        permissions: nodeData.permissions || [],
        boundary: nodeData.boundary || '',
        metadata: nodeData.metadata || {},
        status: nodeData.status || 'healthy',
        cloudProvider: nodeData.cloudProvider || 'Local',
        cloudConfiguration: nodeData.cloudConfiguration || {
          region: '',
          instanceType: '',
          tier: '',
          replicas: 1,
          autoScale: false,
          maxReplicas: 10,
          customProps: {}
        }
      }
    };

    set(state => ({ nodes: [...state.nodes, node] }));
    get()._pushEvent('node-added', { nodeId: id, label: node.data.label, type: node.type });
    return node;
  },

  /** Bulk-add multiple pre-formed nodes to the canvas (non-destructive append) */
  addNodes(newNodes) {
    if (!newNodes?.length) return;
    const validated = newNodes.map(n => ({
      id: n.id || uuidv4(),
      type: n.type || 'service',
      position: n.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: n.data?.label || n.label || 'Service',
        nodeType: n.data?.nodeType || n.type || 'service',
        status: n.data?.status || 'healthy',
        metadata: n.data?.metadata || {},
        ...n.data,
      },
    }));
    set(state => ({ nodes: [...state.nodes, ...validated] }));
    get()._pushEvent('nodes-bulk-added', { count: validated.length });
  },

  removeNode(nodeId) {
    const node = get().nodes.find(n => n.id === nodeId);
    const orphanedEdges = get().edges.filter(e => e.source === nodeId || e.target === nodeId);
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
    }));
    if (node) get()._pushEvent('node-removed', { nodeId, label: node.data?.label });
    for (const edge of orphanedEdges) {
      get()._pushEvent('edge-removed', { edgeId: edge.id });
    }
  },

  updateNode(nodeId, updates) {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...updates }, position: updates.position || n.position }
          : n
      )
    }));
    get()._pushEvent('node-updated', { nodeId, updates: Object.keys(updates) });
  },

  onNodesChange(changes) {
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },

  // --- Edge Operations ---
  addEdge(edgeData) {
    const id = edgeData.id || uuidv4();
    const edge = {
      id,
      source: edgeData.source,
      target: edgeData.target,
      label: edgeData.label || '',
      type: 'smoothstep',
      animated: edgeData.animated || false,
      style: { stroke: '#6366f1' },
      data: edgeData.data || {}
    };
    set(state => ({ edges: [...state.edges, edge] }));
    get()._pushEvent('edge-added', { edgeId: id, source: edge.source, target: edge.target });
    return edge;
  },

  /** Bulk-add multiple pre-formed edges to the canvas (non-destructive append) */
  addEdges(newEdges) {
    if (!newEdges?.length) return;
    const validated = newEdges.map(e => ({
      id: e.id || uuidv4(),
      source: e.source,
      target: e.target,
      label: e.label || '',
      type: 'smoothstep',
      animated: e.animated || false,
      style: { stroke: '#6366f1' },
      data: e.data || {},
    }));
    set(state => ({ edges: [...state.edges, ...validated] }));
    get()._pushEvent('edges-bulk-added', { count: validated.length });
  },

  removeEdge(edgeId) {
    set(state => ({
      edges: state.edges.filter(e => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      rightPanelOpen: state.selectedEdgeId === edgeId ? false : state.rightPanelOpen
    }));
    get()._pushEvent('edge-removed', { edgeId });
  },

  updateEdge(edgeId, updates) {
    set(state => ({
      edges: state.edges.map(e => e.id === edgeId ? { ...e, ...updates } : e)
    }));
  },

  onEdgesChange(changes) {
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  onConnect(connection) {
    get().addEdge({
      source: connection.source,
      target: connection.target
    });
  },

  // --- Selection ---
  setSelectedNode(nodeId) {
    set({ selectedNodeId: nodeId, selectedEdgeId: null, rightPanelOpen: !!nodeId, rightPanelTab: 'properties' });
  },

  setSelectedEdge(edgeId) {
    set({ selectedEdgeId: edgeId, selectedNodeId: null, rightPanelOpen: !!edgeId, rightPanelTab: 'properties' });
  },

  // --- Environment Management ---
  setCurrentEnvironment(env) {
    set({
      currentEnvironment: env,
      nodes: env?.nodes || [],
      edges: env?.edges || [],
      rules: env?.rules || [],
      events: env?.events || [],
      violations: [],
      riskScore: 0,
      simulationResult: null
    });
  },

  loadEnvironments(envList) {
    set({ environments: envList });
  },

/**
 * Import architecture inferred from GitHub/repository analysis
 * Also queues CBCT analysis in background for instant CODE view loading
 */
  importInferredGraph(result) {
    const newNodes = (result.nodes || []).map(n => ({
      id: n.id,
      type: n.type || 'service',
      position: n.position || { x: 250, y: 250 },
      data: {
        label: n.label,
        nodeType: n.type || 'service',
        runtime: n.data?.runtime || '',
        environmentType: n.data?.environmentType || '',
        port: n.data?.port || null,
        metadata: n.data?.metadata || {},
        status: 'healthy'
      }
    }));

    const newEdges = (result.edges || []).map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || '',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#6366f1' }
    }));

    const repoPath = result.repoPath || result.path || null;
    set({ nodes: newNodes, edges: newEdges, lastInferredRepo: repoPath });
    get()._pushEvent('architecture-inferred', {
      nodeCount: newNodes.length,
      edgeCount: newEdges.length,
      repoPath
    });

    // Queue CBCT prefetch in background (non-blocking)
    if (repoPath) {
      import('../services/prefetch.js').then(({ queuePrefetch }) => {
        queuePrefetch(repoPath);
      }).catch(err => {
        console.warn('Failed to queue CBCT prefetch:', err);
      });
    }
  },

  // --- Rules & Governance ---
  addRule(rule) {
    const id = rule.id || uuidv4();
    set(state => ({ rules: [...state.rules, { ...rule, id, enabled: true }] }));
    get()._pushEvent('rule-added', { ruleId: id, name: rule.name });
  },

  removeRule(ruleId) {
    set(state => ({ rules: state.rules.filter(r => r.id !== ruleId) }));
    get()._pushEvent('rule-removed', { ruleId });
  },

  toggleRule(ruleId) {
    set(state => ({
      rules: state.rules.map(r =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    }));
  },

  setViolations(violations, riskScore) {
    set({ violations, riskScore });
    if (violations.length > 0) {
      get()._pushEvent('rule-violation', { count: violations.length, riskScore }, 'warning');
    }
  },

  // --- Simulation ---
  setSimulationResult(result) {
    // Save pre-simulation statuses for rollback
    const preSimStatuses = {};
    for (const n of get().nodes) {
      preSimStatuses[n.id] = n.data?.status || 'healthy';
    }
    set({
      simulationActive: true,
      simulationResult: result,
      preSimulationStatuses: preSimStatuses,
      nodes: get().nodes.map(n => {
        const affected = result.affectedNodes?.find(a => a.nodeId === n.id);
        if (affected) {
          return { ...n, data: { ...n.data, status: affected.status } };
        }
        return n;
      })
    });
    get()._pushEvent('simulation-started', {
      affectedCount: result.affectedNodes?.length,
      targetNodeId: result.affectedNodes?.[0]?.nodeId
    });
  },

  clearSimulation() {
    const preSim = get().preSimulationStatuses;
    set(state => ({
      simulationActive: false,
      simulationResult: null,
      preSimulationStatuses: null,
      nodes: state.nodes.map(n => ({
        ...n,
        data: { ...n.data, status: preSim?.[n.id] || 'healthy' }
      }))
    }));
    get()._pushEvent('simulation-ended', {});
  },

  setResilienceScore(score) {
    set({ resilienceScore: score });
  },

  // --- CBCT ---
  setCbctData(data) {
    set({ cbctData: data });
  },

  setLastInferredRepo(repo) {
    set({ lastInferredRepo: repo });
  },

  /**
   * Set active node for CODE view (CBCT inspection)
   * @param {string} nodeId - Node ID to inspect
   */
  setCbctActiveNode(nodeId) {
    set({ cbctActiveNodeId: nodeId });
  },

  /**
   * Set CBCT loading state
   * @param {boolean} loading - Is CBCT analyzing
   */
  setCbctLoading(loading) {
    set({ cbctLoading: loading });
  },

  /**
   * Set CBCT error state
   * @param {string} error - Error message or null
   */
  setCbctError(error) {
    set({ cbctError: error });
  },

  /**
   * Transition to CODE view for a specific node
   * Combines setCbctActiveNode, setViewMode, and selection
   * @param {string} nodeId - Node to inspect
   */
  enterCodeView(nodeId) {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    set({
      viewMode: 'CODE',
      cbctActiveNodeId: nodeId,
      selectedNodeId: nodeId,
      rightPanelOpen: true,
      rightPanelTab: 'properties'
    });
    
    get()._pushEvent('code-view-entered', {
      nodeId,
      nodeLabel: node.data?.label,
      repoPath: get().lastInferredRepo
    });
  },

  /**
   * Exit CODE view and return to ARCHITECTURE
   */
  exitCodeView() {
    set({
      viewMode: 'ARCHITECTURE',
      cbctActiveNodeId: null
    });
    get()._pushEvent('code-view-exited', {});
  },

  /**
   * Apply CBCT analysis results to nodes as metadata
   * Enriches node data with complexity, risk, dependency metrics
   * @param {string} repoPath - Repository that was analyzed
   * @param {Object} cbctData - CBCT analysis result
   */
  applyCBCTDataToNodes(repoPath, cbctData) {
    if (!cbctData) return;

    // Import the integration service
    import('../services/cbctIntegration.js').then(({ 
      transformCBCTToNodeMetadata, 
      enrichNodesWithCBCTData 
    }) => {
      const cbctMetadata = transformCBCTToNodeMetadata(
        cbctData.graphData,
        cbctData.metrics
      );

      set(state => ({
        nodes: enrichNodesWithCBCTData(state.nodes, cbctMetadata),
        cbctData: { ...cbctData, repoPath }
      }));

      get()._pushEvent('cbct-data-applied', {
        repoPath,
        nodeCount: Object.keys(cbctMetadata).length
      });
    }).catch(err => {
      console.warn('Failed to apply CBCT data:', err);
    });
  },

  // --- UI ---
  setViewMode(mode) { set({ viewMode: mode }); },
  setSidebarTab(tab) { set({ sidebarTab: tab }); },
  setRightPanelTab(tab) { set({ rightPanelTab: tab }); },
  toggleRightPanel() { set(state => ({ rightPanelOpen: !state.rightPanelOpen })); },
  setInferenceLoading(loading) { set({ inferenceLoading: loading }); },
  setNotification(msg) {
    set({ notification: msg });
    if (msg) setTimeout(() => set({ notification: null }), 4000);
  },

  // --- Reset ---
  resetGraph() {
    set({ nodes: [], edges: [], violations: [], riskScore: 0, simulationResult: null, simulationActive: false, preSimulationStatuses: null });
    get()._pushEvent('architecture-reset', {});
  }
  }),
  {
    name: 'aetheros-state',
    partialize: (state) => ({
      currentEnvironment: state.currentEnvironment,
      nodes: state.nodes,
      edges: state.edges,
      rules: state.rules,
      events: state.events.slice(-200)
    })
  }
  )
);

export default useStore;
