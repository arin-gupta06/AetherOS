/**
 * Architecture Exporter Service
 * Converts architecture graph to structured diagram JSON for hackathon submission
 */

/**
 * Categorize nodes by their type to layer them
 */
function categorizeNodesByLayer(nodes) {
  const layers = {
    frontend: [],
    backend: [],
    ai: [],
    infrastructure: [],
    data: [],
    other: []
  };

  if (!nodes || nodes.length === 0) {
    return layers;
  }

  nodes.forEach(node => {
    const type = (node.data?.type || '').toLowerCase();
    const label = node.data?.label || node.id;
    const nodeInfo = {
      id: node.id,
      label,
      runtime: node.data?.runtime || null,
      environment: node.data?.environmentType || null,
      cloudProvider: node.data?.cloudProvider || 'Local',
      configuration: node.data?.cloudConfiguration || {}
    };

    // Categorize by type
    if (type.includes('frontend') || type.includes('ui') || type.includes('react') || type.includes('client')) {
      layers.frontend.push(nodeInfo);
    } else if (type.includes('api') || type.includes('backend') || type.includes('server') || type.includes('node')) {
      layers.backend.push(nodeInfo);
    } else if (type.includes('ai') || type.includes('openai') || type.includes('llm') || type.includes('ml')) {
      layers.ai.push(nodeInfo);
    } else if (type.includes('database') || type.includes('db') || type.includes('sql') || type.includes('nosql') || type.includes('cosmos') || type.includes('mongo')) {
      layers.data.push(nodeInfo);
    } else if (type.includes('cloud') || type.includes('azure') || type.includes('cache') || type.includes('queue') || type.includes('storage')) {
      layers.infrastructure.push(nodeInfo);
    } else {
      layers.other.push(nodeInfo);
    }
  });

  return layers;
}

/**
 * Build a map of node connections
 */
function buildConnectionMap(nodes, edges) {
  const connections = {};

  if (!edges || edges.length === 0) {
    return connections;
  }

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceLabel = sourceNode.data?.label || sourceNode.id;
      const targetLabel = targetNode.data?.label || targetNode.id;

      if (!connections[sourceLabel]) {
        connections[sourceLabel] = [];
      }

      connections[sourceLabel].push({
        target: targetLabel,
        label: edge.label || 'connects-to',
        animated: edge.animated || false
      });
    }
  });

  return connections;
}

/**
 * Generate summary of architecture with cloud provider information
 */
function generateArchitectureSummary(layers) {
  const summary = {};

  // Frontend layer
  if (layers.frontend.length > 0) {
    summary.client = layers.frontend.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null
    }));
  }

  // Backend layer
  if (layers.backend.length > 0) {
    summary.backend = layers.backend.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null,
      instanceType: n.configuration?.instanceType || null
    }));
  }

  // AI services
  if (layers.ai.length > 0) {
    summary.ai = layers.ai.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null
    }));
  }

  // Infrastructure & integrations
  if (layers.infrastructure.length > 0) {
    summary.infrastructure = layers.infrastructure.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null,
      instanceType: n.configuration?.instanceType || null
    }));
  }

  // Data layer
  if (layers.data.length > 0) {
    summary.data = layers.data.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null,
      instanceType: n.configuration?.instanceType || null,
      tier: n.configuration?.tier || null
    }));
  }

  // Other
  if (layers.other.length > 0) {
    summary.other = layers.other.map(n => ({
      name: n.label,
      cloudProvider: n.cloudProvider,
      region: n.configuration?.region || null
    }));
  }

  return summary;
}

/**
 * Export architecture as structured diagram JSON
 */
function exportArchitecture(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return {
      status: 'empty',
      message: 'No architecture components to export',
      timestamp: new Date().toISOString()
    };
  }

  // Categorize nodes by layer
  const layers = categorizeNodesByLayer(nodes);

  // Build connections map
  const connections = buildConnectionMap(nodes, edges);

  // Generate summary
  const summary = generateArchitectureSummary(layers);

  // Build full export structure
  const exportData = {
    status: 'success',
    timestamp: new Date().toISOString(),
    metadata: {
      totalComponents: nodes.length,
      totalConnections: edges.length,
      layers: {
        frontend: layers.frontend.length,
        backend: layers.backend.length,
        ai: layers.ai.length,
        infrastructure: layers.infrastructure.length,
        data: layers.data.length,
        other: layers.other.length
      }
    },
    architecture: {
      summary,
      layers: {
        frontend: layers.frontend,
        backend: layers.backend,
        ai: layers.ai,
        infrastructure: layers.infrastructure,
        data: layers.data,
        other: layers.other
      },
      connections
    },
    diagram: generateDiagramStructure(layers, connections)
  };

  return exportData;
}

/**
 * Generate ASCII diagram of architecture with cloud provider info
 */
function generateDiagramStructure(layers, connections) {
  const lines = [];

  lines.push('=== ARCHITECTURE DIAGRAM ===\n');

  // Helper function to format node with cloud info
  const formatNodeLine = (node) => {
    let line = `│ • ${node.label}`;
    if (node.cloudProvider && node.cloudProvider !== 'Local') {
      line += ` [${node.cloudProvider}`;
      if (node.configuration?.region) {
        line += ` - ${node.configuration.region}`;
      }
      line += ']';
    }
    return line;
  };

  // Frontend
  if (layers.frontend.length > 0) {
    lines.push('┌─ FRONTEND LAYER ─┐');
    layers.frontend.forEach(node => {
      lines.push(formatNodeLine(node));
    });
    lines.push('└────────────────────┘\n');
  }

  // Backend
  if (layers.backend.length > 0) {
    lines.push('┌─ BACKEND LAYER ─┐');
    layers.backend.forEach(node => {
      lines.push(formatNodeLine(node));
      if (connections[node.label]) {
        connections[node.label].forEach(conn => {
          lines.push(`│   → ${conn.target}`);
        });
      }
    });
    lines.push('└────────────────┘\n');
  }

  // AI Services
  if (layers.ai.length > 0) {
    lines.push('┌─ AI SERVICES ─┐');
    layers.ai.forEach(node => {
      lines.push(formatNodeLine(node));
    });
    lines.push('└────────────────┘\n');
  }

  // Infrastructure
  if (layers.infrastructure.length > 0) {
    lines.push('┌─ INFRASTRUCTURE ─┐');
    layers.infrastructure.forEach(node => {
      let line = `│ • ${node.label}`;
      if (node.cloudProvider && node.cloudProvider !== 'Local') {
        line += ` [${node.cloudProvider}`;
        if (node.configuration?.region) {
          line += ` / ${node.configuration.region}`;
        }
        if (node.configuration?.instanceType) {
          line += ` / ${node.configuration.instanceType}`;
        }
        line += ']';
      }
      lines.push(line);
    });
    lines.push('└────────────────────┘\n');
  }

  // Data Layer
  if (layers.data.length > 0) {
    lines.push('┌─ DATA LAYER ─┐');
    layers.data.forEach(node => {
      let line = `│ • ${node.label}`;
      if (node.cloudProvider && node.cloudProvider !== 'Local') {
        line += ` [${node.cloudProvider}`;
        if (node.configuration?.region) {
          line += ` / ${node.configuration.region}`;
        }
        if (node.configuration?.instanceType) {
          line += ` / ${node.configuration.instanceType}`;
        }
        if (node.configuration?.tier) {
          line += ` / ${node.configuration.tier}`;
        }
        line += ']';
      }
      lines.push(line);
    });
    lines.push('└────────────────┘\n');
  }

  return lines.join('\n');
}

module.exports = {
  exportArchitecture,
  categorizeNodesByLayer,
  buildConnectionMap,
  generateArchitectureSummary
};
