/**
 * AetherOS — Failure Injection & Propagation Simulator
 * Simulates failures and propagates impact across the architecture graph.
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Supported failure types
 */
const FAILURE_TYPES = {
  SERVICE_DOWN: 'service-down',
  LATENCY: 'latency',
  RESOURCE_EXHAUSTION: 'resource-exhaustion',
  DEPENDENCY_UNAVAILABLE: 'dependency-unavailable',
  PERMISSION_CONFLICT: 'permission-conflict'
};

/**
 * Inject a failure into a node and propagate impact
 * @param {Array} nodes - architecture nodes
 * @param {Array} edges - architecture edges
 * @param {Object} failure - { targetNodeId, type, config }
 * @returns {{ affectedNodes: Array, propagationPath: Array, events: Array }}
 */
function injectFailure(nodes, edges, failure) {
  const { targetNodeId, type, config = {} } = failure;
  const affectedNodes = [];
  const propagationPath = [];
  const events = [];

  const targetNode = nodes.find(n => n.id === targetNodeId);
  if (!targetNode) {
    return { affectedNodes, propagationPath, events, error: 'Target node not found' };
  }

  // Mark the target as failed
  affectedNodes.push({
    nodeId: targetNodeId,
    label: targetNode.label,
    impact: 'direct',
    status: type === FAILURE_TYPES.LATENCY ? 'degraded' : 'failed',
    failureType: type,
    config
  });

  events.push({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type: 'failure-injected',
    payload: { nodeId: targetNodeId, label: targetNode.label, failureType: type },
    severity: 'error'
  });

  // Build reverse adjacency list (who depends on this node)
  // In our model: source → target = source depends on target
  // So if target fails, source is affected
  const reverseAdj = {};
  for (const node of nodes) reverseAdj[node.id] = [];
  for (const edge of edges) {
    // source → target means source uses target
    // If target fails, source is impacted
    reverseAdj[edge.target] = reverseAdj[edge.target] || [];
    reverseAdj[edge.target].push(edge.source);
  }

  const visited = new Set([targetNodeId]);
  const queue = [{ nodeId: targetNodeId, depth: 0 }];

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift();
    const upstreamNodes = reverseAdj[nodeId] || [];

    for (const upId of upstreamNodes) {
      if (visited.has(upId)) continue;
      visited.add(upId);

      const upNode = nodes.find(n => n.id === upId);
      if (!upNode) continue;

      // Impact degrades with distance
      const impactLevel = depth < 1 ? 'high' : depth < 3 ? 'medium' : 'low';
      const status = type === FAILURE_TYPES.SERVICE_DOWN
        ? (depth < 2 ? 'failed' : 'degraded')
        : 'degraded';

      affectedNodes.push({
        nodeId: upId,
        label: upNode.label,
        impact: 'cascading',
        impactLevel,
        status,
        depth: depth + 1,
        failureType: type
      });

      propagationPath.push({
        from: nodeId,
        to: upId,
        depth: depth + 1
      });

      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'failure-propagated',
        payload: {
          sourceNodeId: targetNodeId,
          affectedNodeId: upId,
          label: upNode.label,
          impactLevel,
          depth: depth + 1
        },
        severity: impactLevel === 'high' ? 'error' : 'warning'
      });

      queue.push({ nodeId: upId, depth: depth + 1 });
    }
  }

  return { affectedNodes, propagationPath, events };
}

/**
 * Calculate resilience score based on graph connectivity
 */
function calculateResilienceScore(nodes, edges) {
  if (nodes.length === 0) return 100;

  // Nodes with many dependents are single points of failure
  const inDegree = {};
  const outDegree = {};
  for (const node of nodes) {
    inDegree[node.id] = 0;
    outDegree[node.id] = 0;
  }
  for (const edge of edges) {
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    outDegree[edge.source] = (outDegree[edge.source] || 0) + 1;
  }

  // Single points of failure: nodes with high in-degree
  const maxInDegree = Math.max(...Object.values(inDegree), 0);
  const spofPenalty = Math.min(50, (maxInDegree / nodes.length) * 100);

  // Connectivity ratio
  const connectivity = edges.length / Math.max(nodes.length, 1);
  const overConnectedPenalty = connectivity > 3 ? Math.min(30, (connectivity - 3) * 10) : 0;

  return Math.max(0, Math.round(100 - spofPenalty - overConnectedPenalty));
}

module.exports = { injectFailure, calculateResilienceScore, FAILURE_TYPES };
