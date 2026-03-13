# Azure Integration Guide

## Overview

AetherOS now includes comprehensive Microsoft Azure ecosystem integration for the hackathon submission. This enables developers to:

- **Analyze architectures using Azure OpenAI** for intelligent recommendations
- **Import GitHub repositories** to auto-infer system architecture
- **Access pre-built Azure reference architectures** (microservices, serverless, containers, event-driven)
- **Get AI-driven deployment suggestions** for Azure cloud platforms
- **Analyze scalability patterns** using Azure-specific patterns

---

## Quick Start

### 1. Prerequisites

```bash
# Install dependencies
npm install
```

### 2. Configure Azure Services

Create a `.env` file in the `server/` directory:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo

# GitHub API Configuration (optional but recommended)
GITHUB_TOKEN=your-github-personal-access-token
```

### 3. Start the Application

```bash
npm run dev
```

Both frontend and backend will start:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **WebSocket:** ws://localhost:4000/ws

---

## Features

### 1. Azure OpenAI Architecture Advisor

Use Azure's GPT-4/3.5-Turbo models to analyze your architecture.

#### Capabilities:
- **Architecture Analysis** - Get AI recommendations on your design
- **Deployment Suggestions** - AI-powered Azure deployment architecture recommendations
- **Scalability Analysis** - Identify bottlenecks and scaling strategies

#### API Endpoints:

```bash
# Analyze architecture
POST /api/azure/analyze
{
  "architecture": { /* architecture object */ },
  "nodes": [ /* React Flow nodes */ ],
  "edges": [ /* React Flow edges */ ]
}

# Get deployment suggestion
POST /api/azure/deployment-suggestion
{
  "architecture": { /* architecture object */ }
}

# Analyze scalability
POST /api/azure/scalability-analysis
{
  "architecture": { /* architecture object */ }
}
```

#### Frontend Usage:

```jsx
import { analyzeArchitectureWithAzure } from '../lib/azureApi';

const result = await analyzeArchitectureWithAzure(
  architecture,
  nodes,
  edges
);
```

---

### 2. GitHub Repository Analysis

Automatically analyze GitHub repositories to infer architecture.

#### Capabilities:
- **Technology Stack Detection** - Identifies languages, frameworks, databases
- **Dependency Analysis** - Extracts package dependencies and services
- **Repository Structure** - Maps directory organization
- **Insights** - Generates architecture insights from codebase

#### API Endpoint:

```bash
# Analyze repository
POST /api/github/analyze
{
  "repositoryUrl": "https://github.com/owner/repo"
}
```

#### Frontend Usage:

```jsx
import { analyzeGitHubRepository } from '../lib/azureApi';

const analysis = await analyzeGitHubRepository(
  'https://github.com/microsoft/TypeScript'
);

// Returns:
// {
//   repository: { name, url, description, stars, language, topics },
//   analysis: {
//     structure: [...],
//     stack: { languages, frameworks, databases, tools },
//     dependencies: { production, development, containers },
//     insights: [...]
//   }
// }
```

---

### 3. Azure Reference Architectures

Pre-built, production-ready Azure architecture templates.

#### Available Templates:

1. **Microservices with Cosmos DB** (`microservices-cosmos`)
   - Global distribution with Cosmos DB
   - API Management + microservices
   - Event-driven communication
   - Estimated cost: $2,500-$5,000/month

2. **Web API on App Service** (`web-api-appservice`)
   - Traditional monolithic architecture
   - App Service auto-scaling
   - SQL Database + Blob Storage
   - Estimated cost: $500-$1,500/month

3. **Event-Driven with Service Bus** (`event-driven-servicebus`)
   - Decoupled services via Service Bus
   - Event sourcing pattern
   - Serverless event processors
   - Estimated cost: $800-$2,000/month

4. **Serverless with Functions** (`serverless-functions`)
   - Pure serverless architecture
   - Function Apps + Static Web Apps
   - Cosmos DB Serverless
   - Estimated cost: $10-$500/month (pay-per-execution)

5. **Hybrid Container Architecture** (`hybrid-container`)
   - AKS (Kubernetes) + Container Instances
   - Mixed managed services
   - Configuration management
   - Estimated cost: $1,500-$4,000/month

#### API Endpoints:

```bash
# Get all reference architectures
GET /api/azure/reference-architectures

# Get specific architecture
GET /api/azure/reference-architectures/:id

# Get recommendations for workload
POST /api/azure/recommend-architecture
{
  "workloadProfile": {
    "scalability": "extreme",
    "globalDistribution": true,
    "eventDriven": false,
    "complexity": "high",
    "budget": "medium"
  }
}
```

#### Frontend Usage:

```jsx
import { 
  getAzureReferenceArchitectures,
  getArchitectureRecommendations 
} from '../lib/azureApi';

// Get all architectures
const { architectures } = await getAzureReferenceArchitectures();

// Get recommendations
const { recommendations } = await getArchitectureRecommendations({
  scalability: 'extreme',
  globalDistribution: true,
  budget: 'medium'
});
```

---

## Architecture

### Backend Services

#### `server/src/services/azureOpenAIService.js`
Integrates with Azure OpenAI Service for AI-powered analysis.

**Key Functions:**
- `analyzeArchitecture(architecture, nodes, edges)` - General architecture analysis
- `suggestAzureDeployment(architecture)` - Deployment recommendation
- `analyzeScalability(architecture)` - Scalability analysis

#### `server/src/services/githubService.js`
Analyzes GitHub repositories using the GitHub API.

**Key Functions:**
- `analyzeRepository(repositoryUrl)` - Main analysis function
- Extracts: structure, technology stack, dependencies, insights

#### `server/src/services/azureArchitectureService.js`
Provides reference architectures and recommendations.

**Key Functions:**
- `getReferenceArchitectures()` - All templates
- `getReferenceArchitecture(id)` - Specific template
- `recommendArchitecture(workloadProfile)` - Smart recommendations

### Routes

#### `/api/azure/*`
Main Azure integration endpoints
- Analysis
- Deployment suggestions
- Scalability analysis
- Reference architectures
- Recommendations

#### `/api/github/*`
GitHub repository analysis endpoints
- Repository analysis

### Frontend Components

#### `AzureAdvisorPanel.jsx`
Interactive panel for Azure OpenAI analysis
- Three tabs: Analysis, Deployment, Scalability
- Real-time AI recommendations
- Risk and improvement suggestions

#### `GitHubAnalyzerPanel.jsx`
GitHub repository analyzer
- URL input with paste functionality
- Technology stack detection visualization
- Dependencies and insights display

#### `AzureReferenceArchitecturesPanel.jsx`
Reference architecture browser
- Browse all pre-built templates
- View components and connections
- Import architecture into canvas
- View estimated costs

---

## Environment Configuration

### Required Environment Variables (Server)

```env
# Azure OpenAI
AZURE_OPENAI_KEY=<your-key>
AZURE_OPENAI_ENDPOINT=<your-endpoint>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo

# GitHub (Optional but recommended)
GITHUB_TOKEN=<your-token>

# Database (Optional)
MONGO_URI=mongodb://127.0.0.1:27017/aetheros

# Server
PORT=4000
```

### Getting Azure Credentials

1. **Azure OpenAI Key & Endpoint:**
   - Go to Azure Portal → Azure OpenAI Service
   - Navigate to Keys and Endpoint
   - Copy key and endpoint URL

2. **GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer Settings → Personal access tokens
   - Create token with `public_repo` and `repo` scopes

---

## Workflow Examples

### Example 1: Analyze a GitHub Repository

```jsx
import { analyzeGitHubRepository } from './lib/azureApi';

const result = await analyzeGitHubRepository(
  'https://github.com/microsoft/vscode'
);

// View technology stack
console.log(result.analysis.stack);

// View project structure
console.log(result.analysis.structure);
```

### Example 2: Get Architecture Recommendations

```jsx
import { getArchitectureRecommendations } from './lib/azureApi';

const recommendations = await getArchitectureRecommendations({
  scalability: 'extreme',
  globalDistribution: true,
  eventDriven: true,
  complexity: 'high',
  budget: 'medium'
});

// recommendations[0] will be the best match
```

### Example 3: Import Azure Reference Architecture

```jsx
import AzureReferenceArchitecturesPanel from './components/panels/AzureReferenceArchitecturesPanel';

<AzureReferenceArchitecturesPanel 
  onImportArchitecture={(arch) => {
    // Import nodes and edges into canvas
    addNodes(arch.nodes);
    addEdges(arch.edges);
  }}
/>
```

### Example 4: Get AI-Powered Deployment Architecture

```jsx
import { getAzureDeploymentSuggestion } from './lib/azureApi';

const deployment = await getAzureDeploymentSuggestion({
  name: 'My E-Commerce Platform',
  type: 'microservices',
  scale: 'production'
});

// Returns:
// {
//   services: [...recommended Azure services...],
//   rationale: '...',
//   estimatedCost: '$...'
// }
```

---

## Integration Points

### 1. Architecture Canvas
- Right-click menu can trigger Azure analysis
- Properties panel shows Azure deployment suggestions

### 2. Inference Pipeline
- GitHub analyzer feeds into architecture inference
- Auto-creates nodes from detected technologies

### 3. Governance Rules
- Azure patterns validate against rules engine
- Recommendations respect defined constraints

### 4. Simulation Engine
- Azure architectures can be simulated
- Cost analysis updates with failure scenarios

### 5. Event Log
- All Azure interactions logged to event stream
- Traceable and replayable

---

## Hackathon Submission Highlights

### Microsoft Ecosystem Integration ✅

1. **Azure OpenAI** — AI-powered architecture analysis
2. **GitHub API** — Repository inference
3. **Azure Services** — 5 pre-built reference architectures
4. **Cosmos DB** — Global database patterns
5. **App Service** — Deployment templates

### Value Proposition

- **Intelligent**: Uses Azure OpenAI for recommendations
- **Comprehensive**: 5 complete reference architectures
- **Practical**: Import GitHub or templates directly
- **Scalable**: Patterns suit startups to enterprises
- **Cost-aware**: Estimated pricing for each approach

---

## Next Steps

1. **Add Cost Calculator** - Real-time Azure pricing estimates
2. **Azure DevOps Integration** - Pipeline deployment suggestions
3. **Azure Landing Zones** - Enterprise governance templates
4. **Cost Optimization AI** - Suggest cost reduction patterns
5. **Azure Advisor Integration** - Direct Azure recommendations

---

## Troubleshooting

### Azure OpenAI Not Working
- ✅ Check `AZURE_OPENAI_KEY` and `AZURE_OPENAI_ENDPOINT` in `.env`
- ✅ Verify Azure resource is running
- ✅ Check API version in `azureOpenAIService.js`

### GitHub Analysis Failing
- ✅ Validate repository URL format
- ✅ Check internet connectivity
- ✅ Verify `GITHUB_TOKEN` if above rate limit
- ✅ Check GitHub API status

### Reference Architectures Not Loading
- ✅ Ensure server is running on port 4000
- ✅ Check Network tab in browser DevTools
- ✅ Verify JSON structure in `azureArchitectureService.js`

---

## API Response Examples

### Azure Analysis Response

```json
{
  "status": "success",
  "analysis": {
    "recommendations": [
      "Implement caching layer for high-traffic components",
      "Add API gateway for centralized rate limiting",
      "Consider async processing for background jobs"
    ],
    "risks": [
      "Single point of failure in central database",
      "No circuit breakers in microservice calls"
    ],
    "improvements": [...]
  },
  "timestamp": "2024-03-13T10:30:00Z"
}
```

### GitHub Analysis Response

```json
{
  "status": "success",
  "repository": {
    "name": "TypeScript",
    "url": "https://github.com/microsoft/TypeScript",
    "stars": 95000,
    "language": "TypeScript"
  },
  "analysis": {
    "stack": {
      "languages": ["TypeScript", "JavaScript"],
      "frameworks": [],
      "databases": [],
      "tools": ["npm"]
    },
    "insights": [
      "Uses TypeScript for type safety",
      "Cloud-ready with container support"
    ]
  }
}
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment configuration
3. Check server logs: `npm run dev`
4. Verify Azure credentials
5. Test API endpoints with curl/Postman

---

**Made for Microsoft Azure Hackathon** 🚀
