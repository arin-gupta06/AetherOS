/**
 * AetherOS — Rules API Routes
 * Architectural governance rule validation.
 */
const express = require('express');
const router = express.Router();
const { validateRules, detectCircularDependencies } = require('../engines/ruleEngine');
const { broadcastEvent } = require('../ws/broadcast');
const { v4: uuidv4 } = require('uuid');

// Validate architecture against rules
router.post('/validate', (req, res) => {
  try {
    const { nodes, edges, rules } = req.body;
    if (!nodes || !edges || !rules) {
      return res.status(400).json({ error: 'nodes, edges, and rules are required' });
    }

    const result = validateRules(nodes, edges, rules);

    // Broadcast violations
    if (result.violations.length > 0) {
      const clients = req.app.get('wsClients');
      broadcastEvent(clients, {
        type: 'rule-validation',
        payload: {
          violationCount: result.violations.length,
          riskScore: result.riskScore
        }
      });
    }

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detect circular dependencies
router.post('/circular', (req, res) => {
  try {
    const { nodes, edges } = req.body;
    if (!nodes || !edges) {
      return res.status(400).json({ error: 'nodes and edges are required' });
    }

    const cycles = detectCircularDependencies(nodes, edges);
    return res.json({ cycles, hasCycles: cycles.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get predefined rule templates
router.get('/templates', (_req, res) => {
  res.json([
    {
      id: 'tpl-boundary',
      name: 'No Cross-Boundary Access',
      type: 'boundary-restriction',
      config: { allowedCrossings: [] },
      severity: 'warning',
      description: 'Prevents services from different boundaries from connecting directly.'
    },
    {
      id: 'tpl-no-frontend-db',
      name: 'No Frontend → Database',
      type: 'forbidden-path',
      config: { forbidden: [{ sourceType: 'frontend', targetType: 'database' }] },
      severity: 'error',
      description: 'Frontend services must not directly access databases.'
    },
    {
      id: 'tpl-max-depth',
      name: 'Max Dependency Depth (5)',
      type: 'max-depth',
      config: { maxDepth: 5 },
      severity: 'warning',
      description: 'Dependency chains must not exceed 5 levels.'
    },
    {
      id: 'tpl-worker-isolation',
      name: 'Worker Isolation',
      type: 'isolation',
      config: { isolatedTypes: ['worker'], direction: 'incoming' },
      severity: 'info',
      description: 'Workers should not receive incoming connections.'
    }
  ]);
});

module.exports = router;
