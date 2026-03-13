/**
 * GitHub API Client
 * Frontend interface to GitHub-related API endpoints
 */

const API_BASE = '/api/github';

/**
 * Analyze GitHub repository and infer architecture
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<Object>} Architecture graph with nodes and edges
 */
export const analyzeGitHubRepository = async (repoUrl) => {
  try {
    const response = await fetch(`${API_BASE}/analyze-repo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repoUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[GitHub API] Error analyzing repository:', error);
    throw error;
  }
};

/**
 * Analyze GitHub repository for general insights (tech stack, dependencies)
 * @param {string} repositoryUrl - GitHub repository URL
 * @returns {Promise<Object>} Repository analysis
 */
export const analyzeRepository = async (repositoryUrl) => {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repositoryUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[GitHub API] Error analyzing repository:', error);
    throw error;
  }
};

export default {
  analyzeGitHubRepository,
  analyzeRepository,
};
