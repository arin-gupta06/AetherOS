/**
 * AetherOS — Architectural Rule Engine
 * Validates architecture against governance constraints.
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Run all enabled rules against the current architecture graph
 * @param {Array} nodes - architecture nodes
 * @param {Array} edges - architecture edges
 * @param {Array} rules - governance rules
 * @returns {{ violations: Array, riskScore: number }}
 */
function validateRules(nodes, edges, rules) {
  const violations = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    switch (rule.type) {
      case 'boundary-restriction':
        violations.push(...checkBoundaryRestriction(nodes, edges, rule));
        break;
      case 'forbidden-path':
        violations.push(...checkForbiddenPaths(nodes, edges, rule));
        break;
      case 'isolation':
        violations.push(...checkIsolation(nodes, edges, rule));
        break;
      case 'max-depth':
        violations.push(...checkMaxDepth(nodes, edges, rule));
        break;
      case 'access-control':
        violations.push(...checkAccessControl(nodes, edges, rule));
        break;
      default:
        break;
    }
  }

  // Compute risk score (0–100)
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  const riskScore = Math.min(100, errorCount * 20 + warningCount * 5);

  return { violations, riskScore };
}

/**
 * Boundary restriction — no cross-boundary edges unless explicitly allowed
 */
function checkBoundaryRestriction(nodes, edges, rule) {
  const violations = [];
  const { allowedCrossings = [] } = rule.config || {};

  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) continue;

    const srcBoundary = sourceNode.data?.boundary || 'default';
    const tgtBoundary = targetNode.data?.boundary || 'default';

    if (srcBoundary !== tgtBoundary) {
      const crossingKey = `${srcBoundary}->${tgtBoundary}`;
      if (!allowedCrossings.includes(crossingKey)) {
        violations.push({
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity || 'warning',
          message: `Cross-boundary connection: "${sourceNode.label}" (${srcBoundary}) → "${targetNode.label}" (${tgtBoundary})`,
          nodeIds: [sourceNode.id, targetNode.id],
          edgeId: edge.id
        });
      }
    }
  }
  return violations;
}

/**
 * Forbidden path — specific source→target dependency paths are not allowed
 */
function checkForbiddenPaths(nodes, edges, rule) {
  const violations = [];
  const { forbidden = [] } = rule.config || {};

  // forbidden: [{ sourceType: 'frontend', targetType: 'database' }]
  for (const fp of forbidden) {
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) continue;

      if (sourceNode.type === fp.sourceType && targetNode.type === fp.targetType) {
        violations.push({
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity || 'error',
          message: `Forbidden dependency: "${sourceNode.label}" (${fp.sourceType}) → "${targetNode.label}" (${fp.targetType})`,
          nodeIds: [sourceNode.id, targetNode.id],
          edgeId: edge.id
        });
      }
    }
  }
  return violations;
}

/**
 * Isolation — certain node types must have no incoming/outgoing edges
 */
function checkIsolation(nodes, edges, rule) {
  const violations = [];
  const { isolatedTypes = [], direction = 'both' } = rule.config || {};

  for (const node of nodes) {
    if (!isolatedTypes.includes(node.type)) continue;

    for (const edge of edges) {
      const isSource = edge.source === node.id;
      const isTarget = edge.target === node.id;

      if ((direction === 'outgoing' && isSource) ||
          (direction === 'incoming' && isTarget) ||
          (direction === 'both' && (isSource || isTarget))) {
        violations.push({
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity || 'warning',
          message: `Isolation violated: "${node.label}" (${node.type}) has ${isSource ? 'outgoing' : 'incoming'} connection`,
          nodeIds: [node.id],
          edgeId: edge.id
        });
      }
    }
  }
  return violations;
}

/**
 * Max depth — BFS from each root to check max dependency chain length
 */
function checkMaxDepth(nodes, edges, rule) {
  const violations = [];
  const { maxDepth = 5 } = rule.config || {};

  // Build adjacency list
  const adj = {};
  for (const node of nodes) adj[node.id] = [];
  for (const edge of edges) {
    if (adj[edge.source]) adj[edge.source].push(edge.target);
  }

  // Find roots (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !hasIncoming.has(n.id));

  for (const root of roots) {
    const depth = bfsMaxDepth(root.id, adj);
    if (depth > maxDepth) {
      violations.push({
        id: uuidv4(),
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity || 'warning',
        message: `Dependency chain from "${root.label}" has depth ${depth}, exceeding max ${maxDepth}`,
        nodeIds: [root.id]
      });
    }
  }
  return violations;
}

function bfsMaxDepth(startId, adj) {
  let maxDepth = 0;
  const queue = [{ id: startId, depth: 0 }];
  const visited = new Set();

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    maxDepth = Math.max(maxDepth, depth);

    for (const neighbor of (adj[id] || [])) {
      if (!visited.has(neighbor)) {
        queue.push({ id: neighbor, depth: depth + 1 });
      }
    }
  }
  return maxDepth;
}

/**
 * Access control — certain node types cannot connect to restricted types
 */
function checkAccessControl(nodes, edges, rule) {
  const violations = [];
  const { policies = [] } = rule.config || {};

  for (const policy of policies) {
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) continue;

      if (sourceNode.type === policy.sourceType &&
          targetNode.type === policy.targetType &&
          !policy.allowed) {
        violations.push({
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity || 'error',
          message: `Access denied: "${sourceNode.label}" → "${targetNode.label}" (policy: ${policy.sourceType} ✗ ${policy.targetType})`,
          nodeIds: [sourceNode.id, targetNode.id],
          edgeId: edge.id
        });
      }
    }
  }
  return violations;
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependencies(nodes, edges) {
  const adj = {};
  for (const node of nodes) adj[node.id] = [];
  for (const edge of edges) {
    if (adj[edge.source]) adj[edge.source].push(edge.target);
  }

  const cycles = [];
  const visited = new Set();
  const recStack = new Set();
  const pathStack = [];

  function dfs(nodeId) {
    visited.add(nodeId);
    recStack.add(nodeId);
    pathStack.push(nodeId);

    for (const neighbor of (adj[nodeId] || [])) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        const cycleStart = pathStack.indexOf(neighbor);
        const cycle = pathStack.slice(cycleStart).map(id => {
          const node = nodes.find(n => n.id === id);
          return node ? node.label : id;
        });
        cycles.push(cycle);
      }
    }

    pathStack.pop();
    recStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) dfs(node.id);
  }

  return cycles;
}

module.exports = { validateRules, detectCircularDependencies };
