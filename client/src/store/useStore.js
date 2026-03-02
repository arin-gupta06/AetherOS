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
  selectedNodeId: null,

  // --- Event Log ---
  events: [],

  // --- UI State ---
  sidebarTab: 'nodes',
  rightPanelOpen: false,
  rightPanelTab: 'properties',
  inferenceLoading: false,
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
        status: nodeData.status || 'healthy'
      }
    };

    set(state => ({ nodes: [...state.nodes, node] }));
    get()._pushEvent('node-added', { nodeId: id, label: node.data.label, type: node.type });
    return node;
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

  removeEdge(edgeId) {
    set(state => ({ edges: state.edges.filter(e => e.id !== edgeId) }));
    get()._pushEvent('edge-removed', { edgeId });
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
    set({ selectedNodeId: nodeId, rightPanelOpen: !!nodeId, rightPanelTab: 'properties' });
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

  // --- Graph Import (from inference) ---
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

    set({ nodes: newNodes, edges: newEdges });
    get()._pushEvent('architecture-inferred', {
      nodeCount: newNodes.length,
      edgeCount: newEdges.length
    });
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

  // --- UI ---
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
