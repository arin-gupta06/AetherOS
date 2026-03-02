/**
 * AetherOS — Simulation API Routes
 * Failure injection and resilience analysis.
 */
const express = require('express');
const router = express.Router();
const { injectFailure, calculateResilienceScore, FAILURE_TYPES } = require('../engines/failureSimulator');
const { broadcastEvent } = require('../ws/broadcast');

// Inject failure
router.post('/inject', (req, res) => {
  try {
    const { nodes, edges, targetNodeId, type, config } = req.body;
    if (!nodes || !edges || !targetNodeId || !type) {
      return res.status(400).json({ error: 'nodes, edges, targetNodeId, and type are required' });
    }

    const result = injectFailure(nodes, edges, { targetNodeId, type, config });

    // Broadcast simulation
    const clients = req.app.get('wsClients');
    broadcastEvent(clients, {
      type: 'simulation-started',
      payload: {
        targetNodeId,
        failureType: type,
        affectedCount: result.affectedNodes.length
      }
    });

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate resilience score
router.post('/resilience', (req, res) => {
  try {
    const { nodes, edges } = req.body;
    if (!nodes || !edges) {
      return res.status(400).json({ error: 'nodes and edges are required' });
    }

    const score = calculateResilienceScore(nodes, edges);
    return res.json({ resilienceScore: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available failure types
router.get('/failure-types', (_req, res) => {
  res.json(Object.entries(FAILURE_TYPES).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  })));
});

module.exports = router;
