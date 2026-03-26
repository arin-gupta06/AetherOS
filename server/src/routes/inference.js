/**
 * AetherOS — Inference API Routes
 * Repository-assisted architecture inference.
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { cloneRepository, inferArchitecture } = require('../engines/inferenceEngine');

// Infer architecture from a GitHub URL
router.post('/github', async (req, res) => {
  let repoPath = null;
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

    // Clone
    repoPath = await cloneRepository(repoUrl);
    // Infer
    const result = await inferArchitecture(repoPath);

    return res.json({
      success: true,
      repoUrl,
      ...result
    });
  } catch (err) {
    console.error('[Inference]', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up cloned repo - DISABLED to allow CBCT analysis
    // if (repoPath) {
    //   try { fs.rmSync(repoPath, { recursive: true, force: true }); } catch { /* ignore */ }
    // }
  }
});

// Infer from a local path (for development/testing)
router.post('/local', async (req, res) => {
  try {
    const { path: localPath } = req.body;
    if (!localPath) return res.status(400).json({ error: 'path is required' });

    const result = await inferArchitecture(localPath);
    return res.json({ success: true, path: localPath, ...result });
  } catch (err) {
    console.error('[Inference]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
