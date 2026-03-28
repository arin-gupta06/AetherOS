/**
 * Architecture Module - System Design Features
 * 
 * Unified module for architecture modeling:
 * - Architecture canvas
 * - Node/edge management
 * - Architecture export
 */

// Components
export { ModelingCanvas } from './components/ModelingCanvas';
export { ArchitectureNode } from './components/ArchitectureNode';

// Services
export { architectureExporterService } from './services/architectureExporterService';
export { aiArchitectureAdvisor } from './services/aiArchitectureAdvisor';

// Module config
export const ARCHITECTURE = {
  name: 'architecture',
  version: '1.0.0',
  features: [
    'architecture-modeling',
    'node-management',
    'edge-management',
    'architecture-export',
    'ai-recommendations'
  ]
};
