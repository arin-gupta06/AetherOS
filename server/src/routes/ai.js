/**
 * AI Architecture Advisor Routes
 */

const express = require('express');
const router = express.Router();
const aiAdvisor = require('../services/aiArchitectureAdvisor');

/**
 * POST /api/ai/analyze-architecture
 * Analyze architecture graph using AI
 */
router.post('/analyze-architecture', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !edges) {
      return res.status(400).json({
        error: 'Both nodes and edges are required',
        example: {
          nodes: [
            {
              id: 'service1',
              data: { label: 'Frontend', type: 'Frontend' },
            },
          ],
          edges: [
            {
              source: 'service1',
              target: 'service2',
            },
          ],
        },
      });
    }

    const analysis = await aiAdvisor.analyzeArchitecture(nodes, edges);

    res.json(analysis);
  } catch (error) {
    console.error('[AI Routes] Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze architecture',
      message: error.message,
    });
  }
});

module.exports = router;
