/**
 * Azure Infrastructure Routes
 * Endpoints for managing Azure deployment components
 */

const express = require('express');
const router = express.Router();
const {
  AZURE_SERVICES,
  createAzureNode,
  validateNodeConfig,
  getServiceOptions,
  getAzureServicesList,
  estimateCost,
} = require('../services/azureInfrastructure');

/**
 * GET /api/azure/infrastructure/services
 * Get list of available Azure infrastructure services
 */
router.get('/infrastructure/services', (req, res) => {
  try {
    const services = getAzureServicesList();
    return res.json({
      status: 'success',
      services,
      count: services.length,
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Services list error:', error);
    return res.status(500).json({
      error: 'Failed to fetch services list',
      message: error.message,
    });
  }
});

/**
 * GET /api/azure/infrastructure/services/:serviceType
 * Get configuration options for a specific Azure service
 */
router.get('/infrastructure/services/:serviceType', (req, res) => {
  try {
    const { serviceType } = req.params;
    const options = getServiceOptions(serviceType);

    if (!options) {
      return res.status(404).json({
        error: 'Service not found',
        message: `Unknown service type: ${serviceType}`,
      });
    }

    const service = Object.values(AZURE_SERVICES).find(
      s => s.type === serviceType || s.id === serviceType
    );

    return res.json({
      status: 'success',
      service: {
        type: serviceType,
        label: service.label,
        description: service.description,
        icon: service.icon,
        category: service.category,
        options,
      },
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Service options error:', error);
    return res.status(500).json({
      error: 'Failed to fetch service options',
      message: error.message,
    });
  }
});

/**
 * POST /api/azure/infrastructure/nodes
 * Create a new Azure infrastructure node
 *
 * Body:
 * {
 *   "serviceType": "AzureAppService",
 *   "config": {
 *     "region": "eastus",
 *     "tier": "Standard",
 *     "instances": 2
 *   }
 * }
 */
router.post('/infrastructure/nodes', (req, res) => {
  try {
    const { serviceType, config } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        error: 'Missing required field: serviceType',
      });
    }

    // Validate configuration
    const validation = validateNodeConfig(serviceType, config || {});
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid configuration',
        errors: validation.errors,
      });
    }

    // Create the node
    const node = createAzureNode(serviceType, config);

    return res.status(201).json({
      status: 'success',
      node,
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Node creation error:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/azure/infrastructure/validate
 * Validate Azure infrastructure node configuration
 *
 * Body:
 * {
 *   "serviceType": "AzureAppService",
 *   "config": { ... }
 * }
 */
router.post('/infrastructure/validate', (req, res) => {
  try {
    const { serviceType, config } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        error: 'Missing required field: serviceType',
      });
    }

    const validation = validateNodeConfig(serviceType, config || {});

    return res.json({
      valid: validation.valid,
      errors: validation.errors || [],
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Validation error:', error);
    return res.status(500).json({
      error: 'Validation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/azure/infrastructure/cost-estimate
 * Estimate cost for Azure service configuration
 *
 * Body:
 * {
 *   "serviceType": "AzureAppService",
 *   "config": { ... }
 * }
 */
router.post('/infrastructure/cost-estimate', (req, res) => {
  try {
    const { serviceType, config } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        error: 'Missing required field: serviceType',
      });
    }

    // First validate
    const validation = validateNodeConfig(serviceType, config || {});

    const cost = estimateCost(serviceType, config || {});

    return res.json({
      status: 'success',
      serviceType,
      configuration: config,
      costEstimate: cost,
      validated: validation.valid,
      validationErrors: validation.errors,
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Cost estimate error:', error);
    return res.status(500).json({
      error: 'Cost estimation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/azure/infrastructure/template
 * Get a predefined deployment template for Azure services
 *
 * Body:
 * {
 *   "template": "mern-stack" // web-app, full-stack, microservices, etc.
 * }
 */
router.post('/infrastructure/template', (req, res) => {
  try {
    const { template } = req.body;

    const templates = {
      'simple-web-app': {
        name: 'Simple Web App',
        description: 'Single frontend and backend deployment',
        nodes: [
          createAzureNode('AzureStaticWebApps', { region: 'eastus', tier: 'Standard' }),
          createAzureNode('AzureAppService', { region: 'eastus', tier: 'Standard' }),
          createAzureNode('AzureCosmosDB', { region: 'eastus', tier: 'Standard', api: 'SQL' }),
        ],
        edges: [
          { source: 'frontend', target: 'backend', animated: true },
          { source: 'backend', target: 'database', animated: true },
        ],
      },

      'microservices': {
        name: 'Microservices Architecture',
        description: 'Scalable microservices with distributed databases',
        nodes: [
          createAzureNode('AzureStaticWebApps', { region: 'eastus' }),
          createAzureNode('AzureAppService', { region: 'eastus', tier: 'Standard' }),
          createAzureNode('AzureCosmosDB', { region: 'eastus', api: 'SQL' }),
          createAzureNode('AzureCosmosDB', { region: 'eastus', api: 'MongoDB' }),
          createAzureNode('AzureStorage', { region: 'eastus' }),
        ],
        edges: [],
      },

      'ai-enabled-app': {
        name: 'AI-Enabled Application',
        description: 'Web app powered by Azure OpenAI',
        nodes: [
          createAzureNode('AzureStaticWebApps', { region: 'eastus' }),
          createAzureNode('AzureAppService', { region: 'eastus', tier: 'Standard' }),
          createAzureNode('AzureOpenAI', { region: 'eastus' }),
          createAzureNode('AzureCosmosDB', { region: 'eastus' }),
          createAzureNode('AzureStorage', { region: 'eastus' }),
        ],
        edges: [],
      },

      'global-scale-app': {
        name: 'Global Scale Application',
        description: 'Multi-region deployment with global database',
        nodes: [
          createAzureNode('AzureStaticWebApps', { region: 'eastus' }),
          createAzureNode('AzureAppService', { region: 'eastus', tier: 'Premium' }),
          createAzureNode('AzureAppService', { region: 'westeurope', tier: 'Premium' }),
          createAzureNode('AzureCosmosDB', {
            region: 'eastus',
            multiRegion: true,
            replication: ['eastus', 'westeurope'],
          }),
          createAzureNode('AzureStorage', { region: 'eastus' }),
          createAzureNode('AzureStorage', { region: 'westeurope' }),
        ],
        edges: [],
      },
    };

    if (!template || !templates[template]) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Available templates: ${Object.keys(templates).join(', ')}`,
        availableTemplates: Object.entries(templates).map(([key, t]) => ({
          id: key,
          name: t.name,
          description: t.description,
        })),
      });
    }

    return res.json({
      status: 'success',
      template: templates[template],
    });
  } catch (error) {
    console.error('[Azure Infrastructure] Template error:', error);
    return res.status(500).json({
      error: 'Failed to fetch template',
      message: error.message,
    });
  }
});

module.exports = router;
