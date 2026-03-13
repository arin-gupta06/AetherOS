/**
 * Azure AI & Architecture Advisory Routes
 */

const express = require('express');
const router = express.Router();
const azureOpenAIService = require('../services/azureOpenAIService');
const azureArchitectureService = require('../services/azureArchitectureService');

/**
 * POST /api/azure/analyze
 * Analyze architecture with Azure OpenAI
 */
router.post('/analyze', async (req, res) => {
  try {
    const { architecture, nodes, edges } = req.body;

    if (!architecture) {
      return res.status(400).json({ error: 'Architecture data required' });
    }

    const analysis = await azureOpenAIService.analyzeArchitecture(architecture, nodes, edges);

    res.json(analysis);
  } catch (error) {
    console.error('[Azure Routes] Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/azure/deployment-suggestion
 * Get Azure deployment architecture recommendation
 */
router.post('/deployment-suggestion', async (req, res) => {
  try {
    const { architecture } = req.body;

    if (!architecture) {
      return res.status(400).json({ error: 'Architecture data required' });
    }

    const suggestion = await azureOpenAIService.suggestAzureDeployment(architecture);

    res.json(suggestion);
  } catch (error) {
    console.error('[Azure Routes] Deployment suggestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/azure/scalability-analysis
 * Analyze scalability with Azure patterns
 */
router.post('/scalability-analysis', async (req, res) => {
  try {
    const { architecture } = req.body;

    if (!architecture) {
      return res.status(400).json({ error: 'Architecture data required' });
    }

    const analysis = await azureOpenAIService.analyzeScalability(architecture);

    res.json(analysis);
  } catch (error) {
    console.error('[Azure Routes] Scalability analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/azure/reference-architectures
 * Get all available Azure reference architectures
 */
router.get('/reference-architectures', (req, res) => {
  try {
    const architectures = azureArchitectureService.getReferenceArchitectures();
    res.json({
      status: 'success',
      architectures,
      count: Object.keys(architectures).length,
    });
  } catch (error) {
    console.error('[Azure Routes] Get architectures error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/azure/reference-architectures/:id
 * Get a specific reference architecture
 */
router.get('/reference-architectures/:id', (req, res) => {
  try {
    const { id } = req.params;
    const architecture = azureArchitectureService.getReferenceArchitecture(id);

    if (!architecture) {
      return res.status(404).json({ error: 'Architecture not found' });
    }

    res.json({
      status: 'success',
      architecture,
    });
  } catch (error) {
    console.error('[Azure Routes] Get architecture error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/azure/recommend-architecture
 * Get architecture recommendations based on workload profile
 */
router.post('/recommend-architecture', (req, res) => {
  try {
    const { workloadProfile } = req.body;

    if (!workloadProfile) {
      return res.status(400).json({ error: 'Workload profile required' });
    }

    const recommendations = azureArchitectureService.recommendArchitecture(workloadProfile);

    res.json({
      status: 'success',
      recommendations,
    });
  } catch (error) {
    console.error('[Azure Routes] Recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
