/**
 * Simulation Module - Failure & Resilience Testing
 * 
 * Unified module for system resilience:
 * - Failure injection
 * - Cascade analysis
 * - Resilience scoring
 */

// Components
export { SimulationPanel } from './components/SimulationPanel';

// Services
export { /* simulation services */ } from './services/simulation';

// Module config
export const SIMULATION = {
  name: 'simulation',
  version: '1.0.0',
  features: [
    'failure-injection',
    'cascade-analysis',
    'resilience-scoring',
    'recovery-analysis'
  ]
};
