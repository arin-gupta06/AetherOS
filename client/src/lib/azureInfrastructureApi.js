/**
 * Azure Infrastructure API Client
 * Frontend interface for Azure deployment components
 */

const API_BASE = '/api/azure';

/**
 * Get list of available Azure infrastructure services
 */
export const getAvailableAzureServices = async () => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/services`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error fetching services:', error);
    throw error;
  }
};

/**
 * Get configuration options for a specific Azure service
 */
export const getServiceOptions = async (serviceType) => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/services/${serviceType}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error fetching service options:', error);
    throw error;
  }
};

/**
 * Create a new Azure infrastructure node
 */
export const createAzureNode = async (serviceType, config = {}) => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceType, config }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error creating node:', error);
    throw error;
  }
};

/**
 * Validate Azure infrastructure configuration
 */
export const validateAzureConfig = async (serviceType, config) => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceType, config }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error validating config:', error);
    throw error;
  }
};

/**
 * Get cost estimate for Azure service configuration
 */
export const estimateCost = async (serviceType, config) => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/cost-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceType, config }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error estimating cost:', error);
    throw error;
  }
};

/**
 * Get predefined deployment template
 */
export const getDeploymentTemplate = async (templateName) => {
  try {
    const response = await fetch(`${API_BASE}/infrastructure/template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: templateName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error);
    }

    return await response.json();
  } catch (error) {
    console.error('[Azure API] Error fetching template:', error);
    throw error;
  }
};

export default {
  getAvailableAzureServices,
  getServiceOptions,
  createAzureNode,
  validateAzureConfig,
  estimateCost,
  getDeploymentTemplate,
};
