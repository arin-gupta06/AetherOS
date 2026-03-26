/**
 * AetherOS × CBCT Data Integration Service
 * 
 * Converts CBCT analysis results into AetherOS node metadata
 * Enables visual indicators for code complexity, risk, dependencies, etc.
 */

/**
 * Transform CBCT graph data into AetherOS-compatible node metadata
 * This allows CBCT insights to flow back into the architecture view
 * 
 * @param {Object} cbctGraphData - CBCT graph analysis result
 * @param {Array} cbctMetrics - CBCT complexity/centrality metrics
 * @returns {Object} Map of nodeId -> metadata updates
 */
export function transformCBCTToNodeMetadata(cbctGraphData, cbctMetrics = {}) {
  const metadata = {};

  if (!cbctGraphData || !cbctGraphData.nodes) {
    return metadata;
  }

  // Process each node from CBCT
  for (const cbctNode of cbctGraphData.nodes) {
    const nodeId = cbctNode.id;
    const fileCount = cbctNode.files?.length || 1;
    
    // Calculate complexity score based on CBCT metrics
    const metrics = cbctMetrics[nodeId] || {};
    const complexity = metrics.complexity || calculateComplexity(cbctNode);
    const centralityScore = metrics.centrality || 0;
    const dependencyCount = cbctNode.dependencies?.length || 0;
    
    // Determine risk level based on complexity and dependencies
    let riskLevel = 'low';
    if (complexity > 0.7 || dependencyCount > 8) riskLevel = 'high';
    else if (complexity > 0.4 || dependencyCount > 4) riskLevel = 'medium';

    metadata[nodeId] = {
      // Code-level metrics
      cbctAnalyzed: true,
      complexity: complexity,
      complexityLevel: complexity > 0.7 ? 'high' : complexity > 0.4 ? 'medium' : 'low',
      centrality: centralityScore,
      
      // Dependency insights
      dependencyCount: dependencyCount,
      dependentCount: cbctNode.dependents?.length || 0,
      
      // File metrics
      fileCount: fileCount,
      
      // Risk assessment
      riskLevel: riskLevel,
      
      // CBCT-specific metadata
      cbctNodeId: nodeId,
      cbctMetadata: cbctNode.metadata || {}
    };
  }

  return metadata;
}

/**
 * Calculate complexity score from CBCT node data
 * Scale: 0 (simple) to 1 (very complex)
 * 
 * @param {Object} cbctNode - CBCT node object
 * @returns {number} Complexity score 0-1
 */
function calculateComplexity(cbctNode) {
  let score = 0;

  // Factor 1: Number of dependencies (max 10)
  const depCount = cbctNode.dependencies?.length || 0;
  score += Math.min(depCount / 15, 1) * 0.3;

  // Factor 2: Number of dependents (max 10)
  const depCount2 = cbctNode.dependents?.length || 0;
  score += Math.min(depCount2 / 15, 1) * 0.3;

  // Factor 3: Lines of code metric (if available)
  if (cbctNode.metadata?.loc) {
    score += Math.min(cbctNode.metadata.loc / 2000, 1) * 0.2;
  }

  // Factor 4: File count
  const fileCount = cbctNode.files?.length || 0;
  score += Math.min(fileCount / 50, 1) * 0.2;

  return Math.min(score, 1);
}

/**
 * Get visual indicators for a node based on CBCT data
 * Used to draw badges/dialogs in the architecture view
 * 
 * @param {Object} nodeMetadata - Node metadata from CBCT transform
 * @returns {Object} Visual indicators configuration
 */
export function getNodeIndicators(nodeMetadata) {
  if (!nodeMetadata || !nodeMetadata.cbctAnalyzed) {
    return {
      badges: [],
      color: 'default'
    };
  }

  const badges = [];
  const { complexity, riskLevel, dependencyCount } = nodeMetadata;

  // Complexity badge
  if (complexity > 0.7) {
    badges.push({
      type: 'complexity',
      level: 'high',
      icon: '🔴',
      label: 'High Complexity',
      color: '#ef4444'
    });
  } else if (complexity > 0.4) {
    badges.push({
      type: 'complexity',
      level: 'medium',
      icon: '🟡',
      label: 'Medium Complexity',
      color: '#f59e0b'
    });
  }

  // Dependency badge
  if (dependencyCount > 8) {
    badges.push({
      type: 'dependencies',
      level: 'high',
      icon: '🔗',
      label: `${dependencyCount} Dependencies`,
      color: '#6366f1'
    });
  }

  // Risk level color mapping
  const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  return {
    badges,
    borderColor: riskColors[riskLevel] || '#6366f1',
    riskLevel
  };
}

/**
 * Create a summary card for CBCT data
 * Used in right panel or hover tooltips
 * 
 * @param {Object} nodeMetadata - Node metadata
 * @param {string} nodeLabel - Node display name
 * @returns {Object} Summary card data
 */
export function createNodeSummaryCard(nodeMetadata, nodeLabel) {
  if (!nodeMetadata || !nodeMetadata.cbctAnalyzed) {
    return {
      title: nodeLabel,
      sections: [{
        title: 'Code Analysis',
        content: 'Double-click node to view code structure'
      }]
    };
  }

  return {
    title: nodeLabel,
    sections: [
      {
        title: 'Code Metrics',
        items: [
          { label: 'Complexity', value: (nodeMetadata.complexity * 100).toFixed(0) + '%', level: nodeMetadata.complexityLevel },
          { label: 'Centrality', value: (nodeMetadata.centrality * 100).toFixed(0) + '%' },
          { label: 'Files', value: nodeMetadata.fileCount }
        ]
      },
      {
        title: 'Dependencies',
        items: [
          { label: 'Outgoing', value: nodeMetadata.dependencyCount },
          { label: 'Incoming', value: nodeMetadata.dependentCount }
        ]
      },
      {
        title: 'Risk Assessment',
        items: [
          { label: 'Risk Level', value: nodeMetadata.riskLevel.toUpperCase(), raw: true }
        ]
      }
    ],
    cbctMetadata: nodeMetadata.cbctMetadata || {}
  };
}

/**
 * Apply CBCT metadata to AetherOS nodes
 * Updates node.data.metadata with CBCT insights
 * 
 * @param {Array} aetherNodes - AetherOS nodes array
 * @param {Object} cbctMetadata - Map of nodeId -> metadata from transformCBCTToNodeMetadata
 * @returns {Array} Updated nodes with CBCT data
 */
export function enrichNodesWithCBCTData(aetherNodes, cbctMetadata) {
  return aetherNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      metadata: {
        ...node.data.metadata,
        ...(cbctMetadata[node.id] || {})
      }
    }
  }));
}

export default {
  transformCBCTToNodeMetadata,
  getNodeIndicators,
  createNodeSummaryCard,
  enrichNodesWithCBCTData
};
