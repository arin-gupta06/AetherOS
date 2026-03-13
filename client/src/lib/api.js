/**
 * AetherOS — API client
 */
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Environments
  getEnvironments: () => request('/environments'),
  getEnvironment: (id) => request(`/environments/${id}`),
  createEnvironment: (data) => request('/environments', { method: 'POST', body: JSON.stringify(data) }),
  updateEnvironment: (id, data) => request(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEnvironment: (id) => request(`/environments/${id}`, { method: 'DELETE' }),

  // Inference
  inferFromGithub: (repoUrl) => request('/inference/github', { method: 'POST', body: JSON.stringify({ repoUrl }) }),
  inferFromLocal: (path) => request('/inference/local', { method: 'POST', body: JSON.stringify({ path }) }),

  // Rules
  validateRules: (nodes, edges, rules) =>
    request('/rules/validate', { method: 'POST', body: JSON.stringify({ nodes, edges, rules }) }),
  detectCircular: (nodes, edges) =>
    request('/rules/circular', { method: 'POST', body: JSON.stringify({ nodes, edges }) }),
  getRuleTemplates: () => request('/rules/templates'),

  // Simulation
  injectFailure: (nodes, edges, targetNodeId, type, config) =>
    request('/simulation/inject', { method: 'POST', body: JSON.stringify({ nodes, edges, targetNodeId, type, config }) }),
  getResilienceScore: (nodes, edges) =>
    request('/simulation/resilience', { method: 'POST', body: JSON.stringify({ nodes, edges }) }),
  getFailureTypes: () => request('/simulation/failure-types'),

  // CBCT
  analyzeCbct: (repoPath) => request('/cbct/analyze', { method: 'POST', body: JSON.stringify({ repoPath }) }),
  selfAnalyze: () => request('/cbct/self-analyze'),

  // Events
  getEvents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/events${qs ? '?' + qs : ''}`);
  },
  postEvent: (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),

  // AI Architecture Advisor
  analyzeArchitecture: (nodes, edges) =>
    request('/ai/analyze-architecture', { method: 'POST', body: JSON.stringify({ nodes, edges }) }),

  // Architecture Export
  exportArchitecture: (nodes, edges) =>
    request('/architecture/export', { method: 'POST', body: JSON.stringify({ nodes, edges }) }),
  getArchitectureTemplates: () => request('/architecture/templates'),

  // Health
  health: () => request('/health')
};

export default api;
