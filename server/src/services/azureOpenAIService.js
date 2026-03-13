/**
 * Azure OpenAI Architecture Advisor Service
 * Provides AI-driven architecture analysis and recommendations using Azure OpenAI
 */

const { AzureOpenAI } = require('@azure/openai');

// Initialize Azure OpenAI client with environment variables
function getAzureOpenAIClient() {
  if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    console.warn('[Azure OpenAI] Not configured - set AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT');
    return null;
  }

  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-02-15-preview',
  });
}

/**
 * Analyze architecture and provide recommendations
 * @param {Object} architecture - Architecture graph with nodes and edges
 * @param {Array} nodes - Architecture nodes
 * @param {Array} edges - Architecture connections
 * @returns {Promise<Object>} AI-generated analysis and recommendations
 */
async function analyzeArchitecture(architecture, nodes = [], edges = []) {
  const client = getAzureOpenAIClient();
  if (!client) {
    return {
      status: 'unconfigured',
      message: 'Azure OpenAI not configured',
      recommendations: [],
    };
  }

  try {
    const architectureDescription = formatArchitectureForAnalysis(architecture, nodes, edges);

    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      [
        {
          role: 'system',
          content: `You are an expert software architect analyzing system designs. 
          Provide concise, actionable recommendations for improving architecture quality, 
          scalability, resilience, and cloud deployment patterns.
          Format your response as a JSON object with: { recommendations: [...], risks: [...], improvements: [...] }`,
        },
        {
          role: 'user',
          content: `Analyze this architecture and provide recommendations:\n\n${architectureDescription}`,
        },
      ],
      {
        maxTokens: 1000,
        temperature: 0.7,
      }
    );

    const content = response.choices[0].message.content;
    const parsed = parseAIResponse(content);

    return {
      status: 'success',
      analysis: parsed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Azure OpenAI] Analysis error:', error.message);
    return {
      status: 'error',
      message: error.message,
      recommendations: [],
    };
  }
}

/**
 * Generate deployment architecture suggestions for Azure
 * @param {Object} currentArchitecture - Current architecture details
 * @returns {Promise<Object>} Azure deployment architecture recommendation
 */
async function suggestAzureDeployment(currentArchitecture) {
  const client = getAzureOpenAIClient();
  if (!client) {
    return {
      status: 'unconfigured',
      deploymentArchitecture: null,
    };
  }

  try {
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      [
        {
          role: 'system',
          content: `You are an Azure solutions architect. Design a deployment architecture using Azure services.
          Consider: App Service, Container Instances, Cosmos DB, Azure Functions, API Management, Azure Monitor.
          Respond with JSON: { services: [...], rationale: string, estimatedCost: string, architecture: string }`,
        },
        {
          role: 'user',
          content: `Suggest an Azure deployment architecture for this system:\n${JSON.stringify(currentArchitecture, null, 2)}`,
        },
      ],
      {
        maxTokens: 1500,
        temperature: 0.8,
      }
    );

    const content = response.choices[0].message.content;
    const parsed = parseAIResponse(content);

    return {
      status: 'success',
      deploymentArchitecture: parsed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Azure OpenAI] Deployment suggestion error:', error.message);
    return {
      status: 'error',
      message: error.message,
      deploymentArchitecture: null,
    };
  }
}

/**
 * Identify potential scalability issues using Azure patterns
 * @param {Object} architecture - Architecture definition
 * @returns {Promise<Object>} Scalability analysis
 */
async function analyzeScalability(architecture) {
  const client = getAzureOpenAIClient();
  if (!client) {
    return {
      status: 'unconfigured',
      scalabilityAnalysis: null,
    };
  }

  try {
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      [
        {
          role: 'system',
          content: `You are an Azure scalability expert. Analyze architecture for scaling bottlenecks.
          Consider: horizontal scaling, caching, queuing, database sharding, CDN.
          Respond with JSON: { bottlenecks: [...], solutions: [...], priority: [...] }`,
        },
        {
          role: 'user',
          content: `Analyze scalability of this architecture:\n${JSON.stringify(architecture, null, 2)}`,
        },
      ],
      {
        maxTokens: 1200,
        temperature: 0.7,
      }
    );

    const content = response.choices[0].message.content;
    const parsed = parseAIResponse(content);

    return {
      status: 'success',
      scalabilityAnalysis: parsed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Azure OpenAI] Scalability analysis error:', error.message);
    return {
      status: 'error',
      message: error.message,
      scalabilityAnalysis: null,
    };
  }
}

/**
 * Format architecture for AI analysis
 */
function formatArchitectureForAnalysis(architecture, nodes, edges) {
  const nodesList = nodes && nodes.length > 0
    ? nodes.map(n => `- ${n.data?.label || n.id} (${n.data?.type || 'unknown'})`).join('\n')
    : 'No nodes defined';

  const connectionsList = edges && edges.length > 0
    ? edges.map(e => `- ${e.source} → ${e.target}`).join('\n')
    : 'No connections defined';

  return `Architecture: ${architecture?.name || 'Unnamed'}
Environment: ${architecture?.environment || 'Not specified'}
Description: ${architecture?.description || 'No description'}

Components:
${nodesList}

Connections:
${connectionsList}

Additional Details:
${JSON.stringify(architecture, null, 2)}`;
}

/**
 * Parse AI response from various formats
 */
function parseAIResponse(content) {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (_e) {
    // Fall through to string response
  }

  // Return as formatted text response
  return {
    analysis: content,
    formatted: true,
  };
}

module.exports = {
  analyzeArchitecture,
  suggestAzureDeployment,
  analyzeScalability,
};
