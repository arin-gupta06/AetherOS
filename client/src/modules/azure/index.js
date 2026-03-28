/**
 * Azure Module - Cloud Integration Features
 * 
 * Unified module for Azure functionality:
 * - Infrastructure analysis
 * - Deployment recommendations
 * - Cost optimization
 */

// Components
export { AzureAdvisorPanel } from './components/AzureAdvisorPanel';
export { AzureInfrastructurePanel } from './components/AzureInfrastructurePanel';
export { AzureReferenceArchitecturesPanel } from './components/AzureReferenceArchitecturesPanel';

// Services
export { azureArchitectureService } from './services/azureArchitectureService';
export { azureInfrastructureService } from './services/azureInfrastructureService';

// Module config
export const AZURE = {
  name: 'azure',
  version: '1.0.0',
  features: [
    'infrastructure-analysis',
    'deployment-recommendations',
    'cost-optimization',
    'reference-architectures',
    'azure-integration'
  ]
};
