/**
 * AI Architecture Advisor API Client
 */

const API_BASE = 'http://localhost:4000/api';

/**
 * Analyze architecture using AI
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeArchitectureWithAI = async (nodes, edges) => {
  try {
    const response = await fetch(`${API_BASE}/ai/analyze-architecture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('[AI API] Error:', error.message);
    throw error;
  }
};
