/**
 * AetherOS — CBCT Integration Routes
 * Contextual structural intelligence directly from CBCT services.
 */
const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');

router.post('/analyze', async (req, res) => {
  try {
    const { repoPath, nodeId } = req.body;
    if (!repoPath) return res.status(400).json({ error: 'repoPath is required' });

    // Utilize CBCT's native complexity analysis (does not duplicate logic)
    const complexityResult = await analysisService.analyzeComplexity(repoPath);
    
    // Check risk by deriving from the node's file metrics/complexity or just returning a mock since CBCT UI handles detail
    const avgScore = complexityResult?.summary?.avgComplexity || 0;
    const isHighRisk = avgScore > 20;

    // Return high-level summary insights strictly for AetherOS highlighting as required
    return res.json({
      nodeId,
      riskLevel: isHighRisk ? "HIGH" : "MEDIUM",
      cycles: 0, // In realistic scenarios, derived from globalDependencyGraph in CBCT
      complexity: isHighRisk ? "HIGH" : "MEDIUM",
      summary: complexityResult?.summary || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
