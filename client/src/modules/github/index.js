/**
 * GitHub Module - Repository Analysis Features
 * 
 * Unified module for GitHub integration:
 * - Repository inference
 * - Architecture discovery
 * - Dependency graph
 */

// Components
export { GitHubAnalyzerPanel } from './components/GitHubAnalyzerPanel';

// Services
export { githubService } from './services/githubService';
export { githubArchitectureInference } from './services/githubArchitectureInference';

// Module config
export const GITHUB = {
  name: 'github',
  version: '1.0.0',
  features: [
    'repository-inference',
    'architecture-discovery',
    'dependency-graph',
    'code-analysis',
    'github-integration'
  ]
};
