/**
 * AetherOS — CBCT Integration Routes
 * Structural intelligence from the CodeBase Cartographic Tool.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const { analyzeStructure } = require('../engines/cbctBridge');

// Analyze a repository path for structural intelligence
router.post('/analyze', (req, res) => {
  try {
    const { repoPath } = req.body;
    if (!repoPath) return res.status(400).json({ error: 'repoPath is required' });

    const result = analyzeStructure(repoPath);
    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze the CBCT tool itself (meta inspection)
router.get('/self-analyze', (_req, res) => {
  try {
    const cbctPath = path.join(__dirname, '..', '..', '..', 'CodeBase-CartoGraphic-Tool-CBCT-');
    const result = analyzeStructure(cbctPath);
    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
