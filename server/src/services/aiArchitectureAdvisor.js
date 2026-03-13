/**
 * AI Architecture Advisor Service
 * Analyzes architecture graphs using Azure OpenAI and provides intelligent recommendations
 */

const { AzureOpenAI } = require('@azure/openai');

/**
 * Get Azure OpenAI client
 */
function getAzureOpenAIClient() {
  if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    return null;
  }

  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-02-15-preview',
  });
}

/**
 * Convert architecture graph (nodes and edges) to readable description
 */
function convertGraphToDescription(nodes, edges) {
  let description = 'System Architecture:\n\n';

  // Describe all nodes
  description += 'Components:\n';
  if (nodes && nodes.length > 0) {
    nodes.forEach((node, index) => {
      const label = node.data?.label || node.id || `Component ${index + 1}`;
      const type = node.data?.type || 'Unknown';
      description += `  - ${label} (Type: ${type})\n`;
    });
  } else {
    description += '  (No components defined)\n';
  }

  description += '\n';

  // Describe all connections
  description += 'Service Connections:\n';
  if (edges && edges.length > 0) {
    edges.forEach((edge) => {
      const sourceLabel = nodes?.find(n => n.id === edge.source)?.data?.label || edge.source;
      const targetLabel = nodes?.find(n => n.id === edge.target)?.data?.label || edge.target;
      description += `  - ${sourceLabel} → ${targetLabel}\n`;
    });
  } else {
    description += '  (No connections defined)\n';
  }

  return description;
}

/**
 * Analyze architecture graph using Azure OpenAI
 */
async function analyzeArchitecture(nodes, edges) {
  const client = getAzureOpenAIClient();

  // If Azure OpenAI is not configured, return a graceful response
  if (!client) {
    return {
      status: 'unconfigured',
      message: 'Azure OpenAI is not configured. Set AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT environment variables.',
      analysis: null,
      recommendations: [],
    };
  }

  try {
    // Convert graph to readable description
    const architectureDescription = convertGraphToDescription(nodes, edges);

    // Send to Azure OpenAI for analysis
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-35-turbo',
      [
        {
          role: 'system',
          content: `You are a cloud architecture expert with deep knowledge of system design, scalability, and resilience patterns. 
Your task is to analyze system architectures and provide actionable recommendations. 
Focus on:
- Scalability risks and bottlenecks
- Dependency and coupling issues
- Service boundary problems
- Resilience and failure point analysis
- Best practice violations
- Optimization opportunities

Provide clear, concise recommendations that are practical and implementable.`,
        },
        {
          role: 'user',
          content: `Analyze this system architecture and provide detailed insights and recommendations:\n\n${architectureDescription}\n\nProvide your response in the following JSON format:
{
  "analysis": "Overall assessment of the architecture (2-3 sentences)",
  "scalability_risks": ["risk1", "risk2", ...],
  "dependency_issues": ["issue1", "issue2", ...],
  "service_boundary_problems": ["problem1", "problem2", ...],
  "resilience_recommendations": ["recommendation1", "recommendation2", ...],
  "potential_failure_points": ["point1", "point2", ...],
  "optimization_opportunities": ["opportunity1", "opportunity2", ...]
}`,
        },
      ],
      {
        maxTokens: 1500,
        temperature: 0.7,
      }
    );

    // Parse the response
    const responseText = response.choices[0].message.content;
    let parsedResponse;

    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      // If JSON parsing fails, return the raw response
      parsedResponse = {
        analysis: responseText,
        scalability_risks: [],
        dependency_issues: [],
        service_boundary_problems: [],
        resilience_recommendations: [],
        potential_failure_points: [],
        optimization_opportunities: [],
      };
    }

    return {
      status: 'success',
      analysis: parsedResponse?.analysis || responseText,
      recommendations: {
        scalability_risks: parsedResponse?.scalability_risks || [],
        dependency_issues: parsedResponse?.dependency_issues || [],
        service_boundary_problems: parsedResponse?.service_boundary_problems || [],
        resilience_recommendations: parsedResponse?.resilience_recommendations || [],
        potential_failure_points: parsedResponse?.potential_failure_points || [],
        optimization_opportunities: parsedResponse?.optimization_opportunities || [],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[AI Advisor] Analysis error:', error.message);
    return {
      status: 'error',
      message: error.message,
      analysis: null,
      recommendations: [],
    };
  }
}

module.exports = {
  analyzeArchitecture,
};
