/**
 * Azure Architecture Reference Service
 * Provides pre-built, reference architectures using Azure services
 */

/**
 * Get all available reference architectures
 * @returns {Object} Collection of reference architectures
 */
function getReferenceArchitectures() {
  return {
    'microservices-cosmos': getMicroservicesCosmosArchitecture(),
    'web-api-appservice': getWebAPIAppServiceArchitecture(),
    'event-driven-servicebus': getEventDrivenServiceBusArchitecture(),
    'serverless-functions': getServerlessFunctionsArchitecture(),
    'hybrid-container': getHybridContainerArchitecture(),
  };
}

/**
 * Microservices architecture with Cosmos DB
 */
function getMicroservicesCosmosArchitecture() {
  return {
    id: 'microservices-cosmos',
    name: 'Microservices with Cosmos DB',
    description: 'Distributed microservices architecture with globally replicated data',
    category: 'Enterprise',
    complexity: 'High',
    nodes: [
      { id: 'apim', label: 'API Management', type: 'gateway', azure: 'API Management' },
      { id: 'appgw', label: 'App Gateway', type: 'networking', azure: 'Application Gateway' },
      { id: 'auth', label: 'Identity Service', type: 'service', azure: 'Azure AD B2C' },
      { id: 'user', label: 'User Service', type: 'service', azure: 'App Service' },
      { id: 'product', label: 'Product Service', type: 'service', azure: 'App Service' },
      { id: 'order', label: 'Order Service', type: 'service', azure: 'App Service' },
      { id: 'cosmosdb', label: 'Cosmos DB', type: 'database', azure: 'Azure Cosmos DB' },
      { id: 'cache', label: 'Cache Layer', type: 'cache', azure: 'Azure Cache for Redis' },
      { id: 'eventbus', label: 'Event Bus', type: 'messaging', azure: 'Service Bus' },
      { id: 'monitor', label: 'Monitoring', type: 'observability', azure: 'Application Insights' },
    ],
    edges: [
      { source: 'appgw', target: 'apim' },
      { source: 'apim', target: 'auth' },
      { source: 'apim', target: 'user' },
      { source: 'apim', target: 'product' },
      { source: 'apim', target: 'order' },
      { source: 'user', target: 'cosmosdb' },
      { source: 'product', target: 'cosmosdb' },
      { source: 'order', target: 'cosmosdb' },
      { source: 'user', target: 'cache' },
      { source: 'product', target: 'cache' },
      { source: 'order', target: 'cache' },
      { source: 'user', target: 'eventbus' },
      { source: 'order', target: 'eventbus' },
      { source: 'user', target: 'monitor' },
      { source: 'product', target: 'monitor' },
      { source: 'order', target: 'monitor' },
    ],
    benefits: [
      'Global data replication with Cosmos DB',
      'Automatic scaling across Azure regions',
      'Event-driven communication via Service Bus',
      'Centralized identity and access management',
      'Built-in observability with Application Insights',
    ],
    estimatedMonthlyDollars: '$2,500-$5,000',
  };
}

/**
 * Web API with App Service architecture
 */
function getWebAPIAppServiceArchitecture() {
  return {
    id: 'web-api-appservice',
    name: 'Web API on App Service',
    description: 'Traditional web API with automatic scaling and high availability',
    category: 'Standard',
    complexity: 'Medium',
    nodes: [
      { id: 'cdn', label: 'CDN', type: 'networking', azure: 'Azure CDN' },
      { id: 'appgw', label: 'App Gateway', type: 'networking', azure: 'Application Gateway' },
      { id: 'appservice', label: 'App Service', type: 'compute', azure: 'App Service' },
      { id: 'sqldb', label: 'SQL Database', type: 'database', azure: 'Azure SQL Database' },
      { id: 'storage', label: 'Blob Storage', type: 'storage', azure: 'Azure Storage' },
      { id: 'keyvault', label: 'Key Vault', type: 'security', azure: 'Azure Key Vault' },
      { id: 'monitor', label: 'Monitoring', type: 'observability', azure: 'Application Insights' },
    ],
    edges: [
      { source: 'cdn', target: 'appgw' },
      { source: 'appgw', target: 'appservice' },
      { source: 'appservice', target: 'sqldb' },
      { source: 'appservice', target: 'storage' },
      { source: 'appservice', target: 'keyvault' },
      { source: 'appservice', target: 'monitor' },
    ],
    benefits: [
      'Auto-scaling based on metrics',
      'Geographic redundancy with App Gateway',
      'Integrated authentication and authorization',
      'Secrets management with Key Vault',
      'Fast content delivery via CDN',
    ],
    estimatedMonthlyDollars: '$500-$1,500',
  };
}

/**
 * Event-driven architecture with Service Bus
 */
function getEventDrivenServiceBusArchitecture() {
  return {
    id: 'event-driven-servicebus',
    name: 'Event-Driven with Service Bus',
    description: 'Loosely coupled event-driven system with reliable messaging',
    category: 'Enterprise',
    complexity: 'High',
    nodes: [
      { id: 'frontend', label: 'Frontend', type: 'ui', azure: 'Static Web Apps' },
      { id: 'gateway', label: 'API Gateway', type: 'gateway', azure: 'API Management' },
      { id: 'api', label: 'Command API', type: 'service', azure: 'App Service' },
      { id: 'eventbus', label: 'Event Bus', type: 'messaging', azure: 'Service Bus' },
      { id: 'processor1', label: 'Event Processor 1', type: 'service', azure: 'Function App' },
      { id: 'processor2', label: 'Event Processor 2', type: 'service', azure: 'Function App' },
      { id: 'eventstore', label: 'Event Store', type: 'database', azure: 'Azure Cosmos DB' },
      { id: 'querydb', label: 'Query Database', type: 'database', azure: 'Azure SQL' },
      { id: 'monitor', label: 'Monitoring', type: 'observability', azure: 'Application Insights' },
    ],
    edges: [
      { source: 'frontend', target: 'gateway' },
      { source: 'gateway', target: 'api' },
      { source: 'api', target: 'eventbus' },
      { source: 'eventbus', target: 'processor1' },
      { source: 'eventbus', target: 'processor2' },
      { source: 'processor1', target: 'eventstore' },
      { source: 'processor2', target: 'querydb' },
      { source: 'api', target: 'monitor' },
      { source: 'processor1', target: 'monitor' },
      { source: 'processor2', target: 'monitor' },
    ],
    benefits: [
      'Decoupled service communication',
      'Reliable message delivery and retry logic',
      'Event sourcing capability',
      'Serverless event processors',
      'CQRS pattern support',
    ],
    estimatedMonthlyDollars: '$800-$2,000',
  };
}

/**
 * Serverless architecture with Functions
 */
function getServerlessFunctionsArchitecture() {
  return {
    id: 'serverless-functions',
    name: 'Serverless with Functions',
    description: 'Pure serverless architecture with minimal operations overhead',
    category: 'StartUp',
    complexity: 'Low',
    nodes: [
      { id: 'staticweb', label: 'Static Website', type: 'ui', azure: 'Static Web Apps' },
      { id: 'funcapi', label: 'API Functions', type: 'compute', azure: 'Function App' },
      { id: 'funcprocess', label: 'Background Functions', type: 'compute', azure: 'Function App' },
      { id: 'cosmosdb', label: 'Data Store', type: 'database', azure: 'Cosmos DB Serverless' },
      { id: 'storage', label: 'Blob Storage', type: 'storage', azure: 'Azure Storage' },
      { id: 'queue', label: 'Queue', type: 'messaging', azure: 'Storage Queue' },
      { id: 'monitor', label: 'Monitoring', type: 'observability', azure: 'Application Insights' },
    ],
    edges: [
      { source: 'staticweb', target: 'funcapi' },
      { source: 'funcapi', target: 'cosmosdb' },
      { source: 'funcapi', target: 'storage' },
      { source: 'funcapi', target: 'queue' },
      { source: 'queue', target: 'funcprocess' },
      { source: 'funcprocess', target: 'cosmosdb' },
      { source: 'funcapi', target: 'monitor' },
      { source: 'funcprocess', target: 'monitor' },
    ],
    benefits: [
      'Pay-per-execution pricing model',
      'Auto-scaling from zero',
      'Minimal DevOps overhead',
      'Fast time-to-market',
      'Integrated with Static Web Apps',
    ],
    estimatedMonthlyDollars: '$10-$500 (based on usage)',
  };
}

/**
 * Hybrid container architecture
 */
function getHybridContainerArchitecture() {
  return {
    id: 'hybrid-container',
    name: 'Hybrid Container Architecture',
    description: 'Mix of containerized services and managed platforms',
    category: 'Enterprise',
    complexity: 'High',
    nodes: [
      { id: 'aks', label: 'Kubernetes (AKS)', type: 'compute', azure: 'Azure Kubernetes Service' },
      { id: 'ingress', label: 'Ingress Controller', type: 'networking', azure: 'AKS Ingress' },
      { id: 'service1', label: 'Containerized Service', type: 'service', azure: 'AKS Pod' },
      { id: 'service2', label: 'Managed Service', type: 'service', azure: 'Container Instances' },
      { id: 'appconfig', label: 'Configuration', type: 'config', azure: 'App Configuration' },
      { id: 'sqldb', label: 'SQL Database', type: 'database', azure: 'Azure SQL' },
      { id: 'cosmosdb', label: 'Document DB', type: 'database', azure: 'Cosmos DB' },
      { id: 'monitor', label: 'Monitoring', type: 'observability', azure: 'Container Insights' },
      { id: 'acr', label: 'Container Registry', type: 'repository', azure: 'ACR' },
    ],
    edges: [
      { source: 'ingress', target: 'service1' },
      { source: 'service2', target: 'appconfig' },
      { source: 'service1', target: 'sqldb' },
      { source: 'service2', target: 'cosmosdb' },
      { source: 'service1', target: 'monitor' },
      { source: 'service2', target: 'monitor' },
      { source: 'acr', target: 'service1' },
      { source: 'acr', target: 'service2' },
    ],
    benefits: [
      'Flexible deployment options',
      'Enterprise-grade Kubernetes orchestration',
      'Cost optimization with mixed models',
      'Easy migration path from on-premises',
      'Native DevOps integration',
    ],
    estimatedMonthlyDollars: '$1,500-$4,000',
  };
}

/**
 * Get a specific reference architecture by ID
 */
function getReferenceArchitecture(id) {
  const architectures = getReferenceArchitectures();
  return architectures[id] || null;
}

/**
 * Get architecture recommendation based on workload characteristics
 */
function recommendArchitecture(workloadProfile) {
  const recommendations = [];

  if (workloadProfile.scalability === 'extreme' && workloadProfile.globalDistribution) {
    recommendations.push({
      id: 'microservices-cosmos',
      score: 0.95,
      reason: 'Global distribution + extreme scalability requires Cosmos DB + microservices',
    });
  }

  if (workloadProfile.complexity === 'low' && workloadProfile.budget === 'minimal') {
    recommendations.push({
      id: 'serverless-functions',
      score: 0.9,
      reason: 'Minimal complexity and budget - serverless is ideal',
    });
  }

  if (workloadProfile.eventDriven) {
    recommendations.push({
      id: 'event-driven-servicebus',
      score: 0.85,
      reason: 'Event-driven requirements - use Service Bus for reliability',
    });
  }

  if (workloadProfile.traditional && !workloadProfile.microservices) {
    recommendations.push({
      id: 'web-api-appservice',
      score: 0.8,
      reason: 'Traditional monolithic architecture - App Service is suitable',
    });
  }

  if (workloadProfile.hybrid) {
    recommendations.push({
      id: 'hybrid-container',
      score: 0.85,
      reason: 'Mixed requirements - hybrid approach provides flexibility',
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

module.exports = {
  getReferenceArchitectures,
  getReferenceArchitecture,
  recommendArchitecture,
};
