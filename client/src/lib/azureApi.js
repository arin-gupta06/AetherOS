/**
 * Azure Integration API Client
 * Frontend API client for Azure OpenAI, GitHub, and architecture services
 */

const API_BASE = 'http://localhost:4000/api';

/**
 * Analyze architecture with Azure OpenAI
 */
export const analyzeArchitectureWithAzure = async (architecture, nodes, edges) => {
  try {
    const response = await fetch(`${API_BASE}/azure/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ architecture, nodes, edges }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Analysis error:', error);
    throw error;
  }
};

/**
 * Get Azure deployment architecture suggestion
 */
export const getAzureDeploymentSuggestion = async (architecture) => {
  try {
    const response = await fetch(`${API_BASE}/azure/deployment-suggestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ architecture }),
    });

    if (!response.ok) {
      throw new Error(`Deployment suggestion failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Deployment suggestion error:', error);
    throw error;
  }
};

/**
 * Analyze scalability with Azure patterns
 */
export const analyzeScalabilityWithAzure = async (architecture) => {
  try {
    const response = await fetch(`${API_BASE}/azure/scalability-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ architecture }),
    });

    if (!response.ok) {
      throw new Error(`Scalability analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Scalability analysis error:', error);
    throw error;
  }
};

/**
 * Get all Azure reference architectures
 */
export const getAzureReferenceArchitectures = async () => {
  try {
    const response = await fetch(`${API_BASE}/azure/reference-architectures`);

    if (!response.ok) {
      throw new Error(`Failed to fetch architectures: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Get architectures error:', error);
    throw error;
  }
};

/**
 * Get a specific Azure reference architecture
 */
export const getAzureReferenceArchitecture = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/azure/reference-architectures/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch architecture: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Get architecture error:', error);
    throw error;
  }
};

/**
 * Get architecture recommendations based on workload profile
 */
export const getArchitectureRecommendations = async (workloadProfile) => {
  try {
    const response = await fetch(`${API_BASE}/azure/recommend-architecture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workloadProfile }),
    });

    if (!response.ok) {
      throw new Error(`Recommendation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Recommendation error:', error);
    throw error;
  }
};

/**
 * Analyze a GitHub repository
 */
export const analyzeGitHubRepository = async (repositoryUrl) => {
  try {
    const response = await fetch(`${API_BASE}/github/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl }),
    });

    if (!response.ok) {
      throw new Error(`Repository analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[GitHub API] Analysis error:', error);
    throw error;
  }
};
