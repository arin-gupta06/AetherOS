/**
 * GitHub Repository Analysis Routes
 */

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const { inferArchitectureFromRepo } = require('../services/githubArchitectureInference');

/**
 * POST /api/github/analyze
 * Analyze a GitHub repository
 */
router.post('/analyze', async (req, res) => {
  try {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
      return res.status(400).json({ error: 'Repository URL required' });
    }

    const analysis = await githubService.analyzeRepository(repositoryUrl);

    res.json(analysis);
  } catch (error) {
    console.error('[GitHub Routes] Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/github/analyze-repo
 * Analyze a GitHub repository and infer its architecture
 *
 * Body:
 * {
 *   "repoUrl": "https://github.com/owner/repo"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "repository": { owner, repo, url },
 *   "detectedServices": { ... },
 *   "architecture": {
 *     "nodes": [...],
 *     "edges": [...]
 *   }
 * }
 */
router.post('/analyze-repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: 'Missing required field: repoUrl',
      });
    }

    const result = await inferArchitectureFromRepo(repoUrl);

    if (result.status === 'error') {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('[GitHub Route] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
