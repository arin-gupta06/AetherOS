# AI Architecture Advisor Documentation

## Overview

The **AI Architecture Advisor** is an intelligent system that analyzes your architecture graphs using Azure OpenAI and provides expert recommendations on scalability, resilience, dependency management, and optimization.

## Features

- 🧠 **AI-Powered Analysis** - Uses Azure OpenAI GPT-3.5/4 models
- 🔍 **Comprehensive Review** - Analyzes scalability, dependencies, service boundaries, and failure points
- 💡 **Actionable Insights** - Provides practical recommendations for improvement
- ⚡ **Real-Time Feedback** - Get instant analysis results
- 🎯 **Multi-Category Recommendations** - Scalability, resilience, optimization, and more

## Backend Setup

### Prerequisites

```bash
# Environment variables (in server/.env)
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
```

### Service: `aiArchitectureAdvisor.js`

**Location:** `server/src/services/aiArchitectureAdvisor.js`

**Functions:**

```javascript
// Main function
analyzeArchitecture(nodes, edges)
  - nodes: Array of React Flow node objects
  - edges: Array of React Flow edge objects
  - Returns: Promise<AnalysisResult>
```

**Key Features:**
- Converts architecture graph to readable description
- Sends to Azure OpenAI for intelligent analysis
- Parses structured response
- Graceful error handling

### Route: `/api/ai/analyze-architecture`

**Method:** `POST`

**Location:** `server/src/routes/ai.js`

**Request:**
```json
{
  "nodes": [
    {
      "id": "frontend",
      "data": {
        "label": "Frontend",
        "type": "Frontend"
      }
    },
    {
      "id": "api",
      "data": {
        "label": "API Server",
        "type": "Service"
      }
    },
    {
      "id": "db",
      "data": {
        "label": "Database",
        "type": "Database"
      }
    }
  ],
  "edges": [
    {
      "source": "frontend",
      "target": "api"
    },
    {
      "source": "api",
      "target": "db"
    }
  ]
}
```

**Response - Success:**
```json
{
  "status": "success",
  "analysis": "Overall assessment of the architecture...",
  "recommendations": {
    "scalability_risks": [
      "Single database instance could become a bottleneck",
      "No caching layer between frontend and API"
    ],
    "dependency_issues": [
      "Frontend directly depends on API with no fallback",
      "Tight coupling between services"
    ],
    "service_boundary_problems": [
      "API handling both business logic and data access",
      "No clear separation of concerns"
    ],
    "resilience_recommendations": [
      "Implement circuit breaker pattern for API calls",
      "Add automatic retry logic with exponential backoff",
      "Implement health checks on all services"
    ],
    "potential_failure_points": [
      "Database failure affects entire system",
      "API server failure breaks frontend functionality",
      "No redundancy or failover mechanism"
    ],
    "optimization_opportunities": [
      "Introduce caching layer (Redis)",
      "Separate read and write operations",
      "Implement async processing for heavy operations"
    ]
  },
  "timestamp": "2024-03-13T22:00:00Z"
}
```

**Response - Unconfigured:**
```json
{
  "status": "unconfigured",
  "message": "Azure OpenAI is not configured...",
  "analysis": null,
  "recommendations": []
}
```

**Response - Error:**
```json
{
  "status": "error",
  "message": "Error message here",
  "analysis": null,
  "recommendations": []
}
```

## Frontend Integration

### Component: `AIArchitectureAdvisorPanel.jsx`

**Location:** `client/src/components/panels/AIArchitectureAdvisorPanel.jsx`

**Props:**

```typescript
interface AIArchitectureAdvisorProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  onAnalyze?: (analysis: AnalysisResult) => void;
}
```

**Features:**

1. **Analyze Button**
   - Automatically disabled when no architecture is designed
   - Shows loading state during analysis
   - Smooth loading animation

2. **Analysis Results Display**
   - Overall architecture assessment
   - Scalability risks (yellow highlight)
   - Dependency issues (orange highlight)
   - Service boundary problems (red highlight)
   - Resilience recommendations (green highlight)
   - Optimization opportunities (blue highlight)
   - Potential failure points (red highlight)

3. **Visual Indicators**
   - Icons for different types of insights
   - Color-coded categories
   - Responsive design
   - Dark mode support

4. **Error Handling**
   - User-friendly error messages
   - Status indicators (unconfigured, error, success)
   - Action guidance for configuration issues

### Usage Example

```jsx
import AIArchitectureAdvisorPanel from './components/panels/AIArchitectureAdvisorPanel';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleAnalysis = (analysis) => {
    console.log('Analysis complete:', analysis);
    // Store analysis results or update UI
  };

  return (
    <AIArchitectureAdvisorPanel
      nodes={nodes}
      edges={edges}
      onAnalyze={handleAnalysis}
    />
  );
}
```

### API Client: `aiApi.js`

**Location:** `client/src/lib/aiApi.js`

**Functions:**

```javascript
// Analyze architecture with AI
analyzeArchitectureWithAI(nodes, edges)
  - nodes: Array<ReactFlowNode>
  - edges: Array<ReactFlowEdge>
  - Returns: Promise<AnalysisResult>

// Example usage:
const result = await analyzeArchitectureWithAI(nodes, edges);
console.log(result.recommendations.scalability_risks);
```

## How It Works

### 1. Graph-to-Description Conversion

The architecture graph is converted to a readable format:

```
System Architecture:

Components:
  - Frontend (Type: Frontend)
  - API Server (Type: Service)
  - Database (Type: Database)

Service Connections:
  - Frontend → API Server
  - API Server → Database
```

### 2. AI Analysis

The description is sent to Azure OpenAI with a specialized prompt:

```
You are a cloud architecture expert with deep knowledge of system design, 
scalability, and resilience patterns.

Analyze this system architecture and provide detailed insights and recommendations.
Focus on:
- Scalability risks and bottlenecks
- Dependency and coupling issues
- Service boundary problems
- Resilience and failure point analysis
- Best practice violations
- Optimization opportunities
```

### 3. Response Parsing

The AI response is parsed into structured JSON with categories:
- `analysis` - Overall assessment
- `scalability_risks` - Scaling bottlenecks
- `dependency_issues` - Coupling problems
- `service_boundary_problems` - Design issues
- `resilience_recommendations` - Improvement suggestions
- `potential_failure_points` - Risk areas
- `optimization_opportunities` - Enhancement ideas

### 4. UI Display

Results are rendered in organized, color-coded sections with icons for easy scanning.

## Configuration

### Setting Up Azure OpenAI

1. **Create Azure OpenAI Service**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create new Azure OpenAI Service resource
   - Deploy a model (e.g., gpt-35-turbo)

2. **Get Credentials**
   - Navigate to Keys and Endpoint
   - Copy API key and endpoint URL

3. **Configure Environment**
   ```bash
   # server/.env
   AZURE_OPENAI_KEY=your-api-key-here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

## Analysis Categories Explained

### 📊 Scalability Risks
Identifies potential bottlenecks and performance issues:
- Single points of failure
- Lack of caching
- N+1 query patterns
- Inefficient data flows

### 🔗 Dependency Issues
Analyzes coupling and dependency problems:
- Circular dependencies
- Tight coupling
- Missing abstraction layers
- Fragile interfaces

### 🏗️ Service Boundary Problems
Reviews service design and separation of concerns:
- Mixed responsibilities
- Unclear boundaries
- Inappropriate granularity
- Domain violations

### 💪 Resilience Recommendations
Suggests fault tolerance improvements:
- Circuit breakers
- Retry strategies
- Health checks
- Failover mechanisms
- Redundancy patterns

### ⚠️ Potential Failure Points
Identifies critical vulnerabilities:
- Single points of failure
- Lack of redundancy
- No graceful degradation
- Missing monitoring

### ⚡ Optimization Opportunities
Recommends improvements for efficiency:
- Caching strategies
- Async processing
- Database optimization
- Resource pooling
- Load balancing

## Troubleshooting

### Azure OpenAI Not Configured
If you see "Azure OpenAI is not configured":
1. Ensure `.env` file exists in `server/` directory
2. Set `AZURE_OPENAI_KEY` and `AZURE_OPENAI_ENDPOINT`
3. Restart the backend server
4. Refresh the frontend

### Analysis Takes Too Long
- Check internet connectivity
- Verify Azure OpenAI service is running
- Check API quota limits
- Reduce architecture complexity (fewer nodes/edges)

### No Recommendations Returned
- Verify backend server is running
- Check browser console for errors
- Ensure nodes and edges are properly defined
- Verify API response in browser DevTools Network tab

### Unexpected Recommendations
- The AI model may interpret architecture differently
- Complex architectures might need manual refinement
- Consider architect review alongside AI insights
- Provide feedback for next analysis

## Limitations

- **First Analysis**: May take 4-10 seconds depending on architecture size
- **Architecture Size**: Very large architectures (100+ nodes) might have longer analysis times
- **Token Limits**: Very detailed architectures might hit model token limits
- **Azure Availability**: Requires active Azure OpenAI service
- **Network**: Requires internet connectivity for Azure API calls

## Configuration in Sidebar

To add the AI Advisor to your sidebar:

```jsx
// In your Sidebar component
import AIArchitectureAdvisorPanel from './panels/AIArchitectureAdvisorPanel';

const tabs = [
  // ... other tabs
  {
    id: 'ai-advisor',
    label: 'AI Advisor',
    icon: <Brain className="w-4 h-4" />,
    component: <AIArchitectureAdvisorPanel nodes={nodes} edges={edges} />
  }
];
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ai/analyze-architecture` | Analyze architecture with AI |

## Related Features

- **Governance Rules** - Define architectural constraints
- **Failure Simulation** - Test resilience
- **Event Log** - Track all changes
- **Azure Advisor** - Additional Azure-specific analysis
- **GitHub Analysis** - Import architectures from repositories

## Examples

### Simple 3-Tier Architecture
```json
{
  "nodes": [
    { "id": "ui", "data": { "label": "Web UI", "type": "Frontend" } },
    { "id": "api", "data": { "label": "API", "type": "Service" } },
    { "id": "db", "data": { "label": "Database", "type": "Database" } }
  ],
  "edges": [
    { "source": "ui", "target": "api" },
    { "source": "api", "target": "db" }
  ]
}
```

### Microservices Architecture
```json
{
  "nodes": [
    { "id": "gateway", "data": { "label": "API Gateway", "type": "Gateway" } },
    { "id": "auth", "data": { "label": "Auth Service", "type": "Service" } },
    { "id": "users", "data": { "label": "Users Service", "type": "Service" } },
    { "id": "orders", "data": { "label": "Orders Service", "type": "Service" } },
    { "id": "db", "data": { "label": "Database", "type": "Database" } },
    { "id": "cache", "data": { "label": "Cache", "type": "Cache" } }
  ],
  "edges": [
    { "source": "gateway", "target": "auth" },
    { "source": "gateway", "target": "users" },
    { "source": "gateway", "target": "orders" },
    { "source": "users", "target": "db" },
    { "source": "orders", "target": "db" },
    { "source": "users", "target": "cache" },
    { "source": "orders", "target": "cache" }
  ]
}
```

## Next Steps

1. Design your architecture on the canvas
2. Click "Analyze with AI"
3. Review recommendations by category
4. Implement suggested improvements
5. Re-analyze to verify improvements
6. Use governance rules to enforce best practices

---

**Last Updated:** March 13, 2026
**Version:** 1.0.0
