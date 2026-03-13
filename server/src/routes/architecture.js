/**
 * Architecture Export Routes
 */

const express = require('express');
const router = express.Router();
const exporter = require('../services/architectureExporter');

/**
 * POST /api/architecture/export
 * Export architecture as structured diagram JSON
 */
router.post('/export', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes) {
      return res.status(400).json({
        error: 'Nodes array is required',
        example: {
          nodes: [{ id: 'n1', data: { label: 'Frontend', type: 'Frontend' } }],
          edges: [{ source: 'n1', target: 'n2' }]
        }
      });
    }

    const exportData = exporter.exportArchitecture(nodes, edges || []);

    res.json(exportData);
  } catch (error) {
    console.error('[Architecture Export] Error:', error);
    res.status(500).json({
      error: 'Failed to export architecture',
      message: error.message
    });
  }
});

/**
 * GET /api/architecture/templates
 * Get architecture templates for pre-built patterns
 */
router.get('/templates', (_req, res) => {
  const templates = [
    {
      id: 'simple-web',
      name: 'Simple Web Application',
      description: 'Frontend, API, Database',
      nodes: [
        { id: 'frontend', data: { label: 'React Frontend', type: 'Frontend' } },
        { id: 'api', data: { label: 'Node.js API', type: 'Backend' } },
        { id: 'database', data: { label: 'PostgreSQL', type: 'Database' } }
      ],
      edges: [
        { source: 'frontend', target: 'api' },
        { source: 'api', target: 'database' }
      ]
    },
    {
      id: 'microservices',
      name: 'Microservices Architecture',
      description: 'API Gateway, Multiple Services, Message Queue',
      nodes: [
        { id: 'gateway', data: { label: 'API Gateway', type: 'Backend' } },
        { id: 'users', data: { label: 'Users Service', type: 'Backend' } },
        { id: 'products', data: { label: 'Products Service', type: 'Backend' } },
        { id: 'queue', data: { label: 'Message Queue', type: 'Infrastructure' } },
        { id: 'cache', data: { label: 'Redis Cache', type: 'Infrastructure' } },
        { id: 'db', data: { label: 'MongoDB', type: 'Database' } }
      ],
      edges: [
        { source: 'gateway', target: 'users' },
        { source: 'gateway', target: 'products' },
        { source: 'users', target: 'queue' },
        { source: 'products', target: 'queue' },
        { source: 'users', target: 'cache' },
        { source: 'products', target: 'db' }
      ]
    },
    {
      id: 'ai-powered',
      name: 'AI-Powered Application',
      description: 'Frontend, API, AI Services, Database',
      nodes: [
        { id: 'frontend', data: { label: 'React Frontend', type: 'Frontend' } },
        { id: 'api', data: { label: 'Node.js API', type: 'Backend' } },
        { id: 'ai', data: { label: 'Azure OpenAI', type: 'AI' } },
        { id: 'cache', data: { label: 'Redis Cache', type: 'Infrastructure' } },
        { id: 'database', data: { label: 'CosmosDB', type: 'Database' } }
      ],
      edges: [
        { source: 'frontend', target: 'api' },
        { source: 'api', target: 'ai' },
        { source: 'api', target: 'cache' },
        { source: 'api', target: 'database' }
      ]
    },
    {
      id: 'saas-platform',
      name: 'SaaS Platform',
      description: 'Multi-tier SaaS with API, Services, AI, and Storage',
      nodes: [
        { id: 'frontend', data: { label: 'SPA Frontend', type: 'Frontend' } },
        { id: 'api', data: { label: 'REST API', type: 'Backend' } },
        { id: 'auth', data: { label: 'Auth Service', type: 'Backend' } },
        { id: 'ai', data: { label: 'AI Service', type: 'AI' } },
        { id: 'cache', data: { label: 'Cache Layer', type: 'Infrastructure' } },
        { id: 'database', data: { label: 'Primary DB', type: 'Database' } },
        { id: 'storage', data: { label: 'Blob Storage', type: 'Infrastructure' } },
        { id: 'analytics', data: { label: 'Analytics', type: 'Infrastructure' } }
      ],
      edges: [
        { source: 'frontend', target: 'api' },
        { source: 'frontend', target: 'auth' },
        { source: 'api', target: 'ai' },
        { source: 'api', target: 'cache' },
        { source: 'api', target: 'database' },
        { source: 'api', target: 'storage' },
        { source: 'api', target: 'analytics' }
      ]
    }
  ];

  res.json(templates);
});

module.exports = router;
