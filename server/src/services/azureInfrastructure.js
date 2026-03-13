/**
 * Azure Infrastructure Components Service
 * Handles Azure service configurations and deployment architecture
 */

/**
 * Azure Infrastructure Node Types with Configurations
 */
const AZURE_SERVICES = {
  APP_SERVICE: {
    id: 'azure-app-service',
    label: 'App Service',
    type: 'AzureAppService',
    icon: '⚙️',
    color: '#0078D4',
    category: 'COMPUTE',
    defaultConfig: {
      region: 'eastus',
      tier: 'Standard',
      instances: 1,
      runtime: 'Node.js 18 LTS',
      autoscale: false,
      maxInstances: 10,
      minInstances: 1,
    },
    supportedRegions: [
      'eastus',
      'westus',
      'northeurope',
      'westeurope',
      'southeastasia',
      'japaneast',
      'australiaeast',
      'canadacentral',
    ],
    tiers: ['Free', 'Shared', 'Basic', 'Standard', 'Premium', 'Isolated'],
    runtimes: [
      'Node.js 18 LTS',
      'Node.js 20 LTS',
      'Python 3.11',
      'Python 3.12',
      '.NET 6',
      '.NET 7',
      '.NET 8',
      'Java 17',
      'PHP 8.2',
    ],
    description: 'Build and host web apps, mobile back-ends, and RESTful APIs in .NET, Node.js, Python, Java, or PHP',
  },

  STATIC_WEB_APPS: {
    id: 'azure-static-web-apps',
    label: 'Static Web Apps',
    type: 'AzureStaticWebApps',
    icon: '📱',
    color: '#0078D4',
    category: 'COMPUTE',
    defaultConfig: {
      region: 'eastus',
      tier: 'Free',
      cdn: true,
      customDomains: [],
      https: true,
      staging: true,
    },
    supportedRegions: [
      'eastus',
      'westus',
      'northeurope',
      'westeurope',
      'southeastasia',
      'japaneast',
      'australiaeast',
    ],
    tiers: ['Free', 'Standard'],
    description: 'Deploy static web apps directly from your repository',
  },

  COSMOS_DB: {
    id: 'azure-cosmos-db',
    label: 'Cosmos DB',
    type: 'AzureCosmosDB',
    icon: '💾',
    color: '#16A34A',
    category: 'DATABASE',
    defaultConfig: {
      region: 'eastus',
      tier: 'Standard',
      api: 'SQL',
      throughput: 400,
      autoscale: false,
      maxThroughput: 4000,
      consistency: 'Session',
      multiRegion: false,
      replication: ['eastus'],
    },
    supportedRegions: [
      'eastus',
      'westus',
      'northeurope',
      'westeurope',
      'southeastasia',
      'japaneast',
      'australiaeast',
      'canadacentral',
      'uksouth',
    ],
    apis: ['SQL', 'MongoDB', 'Cassandra', 'Table', 'Gremlin'],
    consistencyLevels: ['Strong', 'Bounded Staleness', 'Session', 'Consistent Prefix', 'Eventual'],
    tiers: ['Standard', 'Provisioned Throughput', 'Serverless'],
    description: 'Globally distributed, multi-model database service for any scale',
  },

  OPENAI: {
    id: 'azure-openai',
    label: 'Azure OpenAI',
    type: 'AzureOpenAI',
    icon: '🤖',
    color: '#7928CA',
    category: 'AI',
    defaultConfig: {
      region: 'eastus',
      tier: 'Standard',
      models: ['gpt-35-turbo', 'gpt-4'],
      quotaTokens: 240000,
      rateLimit: 3000,
      deploymentName: 'default',
    },
    supportedRegions: [
      'eastus',
      'westus',
      'northeurope',
      'westeurope',
      'japaneast',
      'southcentralus',
    ],
    tiers: ['Standard'],
    models: [
      'gpt-35-turbo',
      'gpt-35-turbo-16k',
      'gpt-4',
      'gpt-4-32k',
      'text-embedding-ada-002',
      'text-davinci-003',
    ],
    description: 'Generative AI models with enterprise-grade security and compliance',
  },

  STORAGE: {
    id: 'azure-storage',
    label: 'Storage Account',
    type: 'AzureStorage',
    icon: '📦',
    color: '#0078D4',
    category: 'STORAGE',
    defaultConfig: {
      region: 'eastus',
      tier: 'Standard',
      replication: 'LRS',
      accessTier: 'Hot',
      secureTransfer: true,
      httpsOnly: true,
      publicAccess: 'None',
    },
    supportedRegions: [
      'eastus',
      'westus',
      'northeurope',
      'westeurope',
      'southeastasia',
      'japaneast',
      'australiaeast',
      'canadacentral',
    ],
    tiers: ['Standard', 'Premium'],
    replicationOptions: ['LRS', 'GRS', 'RA-GRS', 'ZRS', 'GZRS', 'RA-GZRS'],
    accessTiers: ['Hot', 'Cool', 'Archive'],
    containerTypes: ['Blob Storage', 'File Shares', 'Tables', 'Queues'],
    description: 'Massively scalable and secure cloud storage',
  },
};

/**
 * Create an Azure infrastructure node with default configuration
 */
function createAzureNode(serviceType, customConfig = {}) {
  const azureService = Object.values(AZURE_SERVICES).find(
    s => s.type === serviceType || s.id === serviceType
  );

  if (!azureService) {
    throw new Error(`Unknown Azure service type: ${serviceType}`);
  }

  const config = {
    ...azureService.defaultConfig,
    ...customConfig,
  };

  return {
    id: `${serviceType}-${Date.now()}`,
    data: {
      label: azureService.label,
      type: azureService.type,
      icon: azureService.icon,
      category: azureService.category,
      config,
      description: azureService.description,
    },
    position: {
      x: Math.random() * 400,
      y: Math.random() * 300,
    },
    style: {
      background: azureService.color,
      color: '#fff',
      border: '2px solid #010101',
      borderRadius: '8px',
    },
  };
}

/**
 * Validate Azure node configuration
 */
function validateNodeConfig(serviceType, config) {
  const azureService = Object.values(AZURE_SERVICES).find(
    s => s.type === serviceType || s.id === serviceType
  );

  if (!azureService) {
    return { valid: false, errors: [`Unknown service type: ${serviceType}`] };
  }

  const errors = [];

  // Validate region
  if (config.region && !azureService.supportedRegions.includes(config.region)) {
    errors.push(`Invalid region: ${config.region}`);
  }

  // Validate tier if applicable
  if (config.tier && azureService.tiers && !azureService.tiers.includes(config.tier)) {
    errors.push(`Invalid tier: ${config.tier}`);
  }

  // Service-specific validations
  if (serviceType === 'AzureCosmosDB' || serviceType === 'azure-cosmos-db') {
    if (config.throughput && (config.throughput < 400 || config.throughput > 1000000)) {
      errors.push('Throughput must be between 400 and 1,000,000 RU/s');
    }
    if (config.maxThroughput && config.maxThroughput < config.throughput) {
      errors.push('Max throughput must be greater than or equal to throughput');
    }
    if (config.api && !azureService.apis.includes(config.api)) {
      errors.push(`Invalid API: ${config.api}`);
    }
  }

  if (serviceType === 'AzureAppService' || serviceType === 'azure-app-service') {
    if (config.instances && (config.instances < 1 || config.instances > 100)) {
      errors.push('Instance count must be between 1 and 100');
    }
    if (config.runtime && !azureService.runtimes.includes(config.runtime)) {
      errors.push(`Invalid runtime: ${config.runtime}`);
    }
  }

  if (serviceType === 'AzureOpenAI' || serviceType === 'azure-openai') {
    if (config.quotaTokens && config.quotaTokens < 1000) {
      errors.push('Quota tokens must be at least 1000');
    }
    if (config.rateLimit && config.rateLimit < 100) {
      errors.push('Rate limit must be at least 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get service configuration options
 */
function getServiceOptions(serviceType) {
  const azureService = Object.values(AZURE_SERVICES).find(
    s => s.type === serviceType || s.id === serviceType
  );

  if (!azureService) {
    return null;
  }

  return {
    regions: azureService.supportedRegions,
    tiers: azureService.tiers,
    ...(azureService.runtimes && { runtimes: azureService.runtimes }),
    ...(azureService.apis && { apis: azureService.apis }),
    ...(azureService.consistencyLevels && { consistencyLevels: azureService.consistencyLevels }),
    ...(azureService.replicationOptions && { replicationOptions: azureService.replicationOptions }),
    ...(azureService.accessTiers && { accessTiers: azureService.accessTiers }),
    ...(azureService.models && { models: azureService.models }),
  };
}

/**
 * Get all Azure services metadata for UI
 */
function getAzureServicesList() {
  return Object.values(AZURE_SERVICES).map(service => ({
    id: service.id,
    label: service.label,
    type: service.type,
    icon: service.icon,
    category: service.category,
    color: service.color,
    description: service.description,
  }));
}

/**
 * Calculate estimated cost for Azure configuration (simplified)
 */
function estimateCost(serviceType, config) {
  const costEstimates = {
    'AzureAppService': () => {
      const tierCosts = {
        'Free': 0,
        'Shared': 10,
        'Basic': 50,
        'Standard': 100,
        'Premium': 280,
        'Isolated': 500,
      };
      return tierCosts[config.tier] || 0;
    },
    'AzureStaticWebApps': () => {
      return config.tier === 'Free' ? 0 : 99;
    },
    'AzureCosmosDB': () => {
      if (config.tier === 'Serverless') {
        return 0.25; // Per million operations
      }
      return Math.ceil(config.throughput / 100) * 24 * 30; // Rough estimate
    },
    'AzureOpenAI': () => {
      // Per 1000 tokens (varies by model)
      return config.quotaTokens * 0.002;
    },
    'AzureStorage': () => {
      return config.tier === 'Standard' ? 20 : 150; // Estimate per month
    },
  };

  const calculator = costEstimates[serviceType];
  if (!calculator) {
    return { estimate: 'TBD', currency: 'USD' };
  }

  try {
    return {
      estimate: calculator(),
      currency: 'USD/month',
    };
  } catch (_error) {
    return { estimate: 'TBD', currency: 'USD' };
  }
}

module.exports = {
  AZURE_SERVICES,
  createAzureNode,
  validateNodeConfig,
  getServiceOptions,
  getAzureServicesList,
  estimateCost,
};
