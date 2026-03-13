# Azure Infrastructure Components for Architecture Design

## Overview

The Azure Infrastructure Components feature enables developers to visually design and configure cloud deployment architectures using Azure services. Rather than creating abstract architecture, users can now directly use Azure infrastructure components in their diagrams with proper configuration for regions, scaling, and service tiers.

## Supported Azure Services

### 1. App Service
**Type**: `AzureAppService`  
**Icon**: ⚙️  
**Category**: Compute

Hosts web apps, APIs, and mobile back-ends.

**Configuration Fields**:
- **Region**: eastus, westus, northeurope, westeurope, southeastasia, japaneast, australiaeast, canadacentral
- **Tier**: Free, Shared, Basic, Standard, Premium, Isolated
- **Runtime**: Node.js 18/20, Python 3.11/3.12, .NET 6/7/8, Java 17, PHP 8.2
- **Instances**: 1-100 instances
- **Autoscale**: Enable/disable with min/max settings

**Typical Use Cases**:
- RESTful API endpoints
- Backend servers
- Microservices
- Custom web applications

### 2. Static Web Apps
**Type**: `AzureStaticWebApps`  
**Icon**: 📱  
**Category**: Compute

Deploys static websites and SPAs directly from repositories.

**Configuration Fields**:
- **Region**: eastus, westus, northeurope, westeurope, southeastasia, japaneast, australiaeast
- **Tier**: Free, Standard
- **CDN**: Enable global content delivery
- **Custom Domains**: Multiple domain support
- **Staging**: Enable staging environments

**Typical Use Cases**:
- React/Vue/Angular frontends
- Static content delivery
- JAMstack applications
- Documentation sites

### 3. Cosmos DB
**Type**: `AzureCosmosDB`  
**Icon**: 💾  
**Category**: Database

Globally distributed, multi-model database.

**Configuration Fields**:
- **Region**: eastus, westus, northeurope, westeurope, southeastasia, japaneast, australiaeast, canadacentral, uksouth
- **Tier**: Standard (provisioned), Serverless
- **API**: SQL, MongoDB, Cassandra, Table, Gremlin
- **Throughput**: 400 - 1,000,000 RU/s
- **Autoscale**: Scale throughput automatically
- **Consistency**: Strong, Bounded Staleness, Session, Consistent Prefix, Eventual
- **Multi-Region**: Enable global replication

**Typical Use Cases**:
- NoSQL data storage
- Real-time applications
- Global scale applications
- Multi-model data requirements

### 4. Azure OpenAI
**Type**: `AzureOpenAI`  
**Icon**: 🤖  
**Category**: AI

Generative AI models with enterprise security.

**Configuration Fields**:
- **Region**: eastus, westus, northeurope, westeurope, japaneast, southcentralus
- **Tier**: Standard
- **Models**: gpt-35-turbo, gpt-4, gpt-4-32k, text-embedding-ada-002
- **Token Quota**: Tokens per minute limit
- **Rate Limit**: Requests per minute

**Typical Use Cases**:
- AI-powered features
- Natural language processing
- Content generation
- Intelligent assistants

### 5. Storage Account
**Type**: `AzureStorage`  
**Icon**: 📦  
**Category**: Storage

Massively scalable cloud storage.

**Configuration Fields**:
- **Region**: eastus, westus, northeurope, westeurope, southeastasia, japaneast, australiaeast, canadacentral
- **Tier**: Standard, Premium
- **Replication**: LRS, GRS, RA-GRS, ZRS, GZRS, RA-GZRS
- **Access Tier**: Hot, Cool, Archive
- **Secure Transfer**: HTTPS enforcement
- **Public Access**: None, Container, Blob

**Typical Use Cases**:
- Static file hosting
- Video/media storage
- Backup and archiving
- Data lakes

## Backend API Endpoints

### GET /api/azure/infrastructure/services

Get list of all available Azure infrastructure services.

**Response**:
```json
{
  "status": "success",
  "services": [
    {
      "id": "azure-app-service",
      "label": "App Service",
      "type": "AzureAppService",
      "icon": "⚙️",
      "category": "COMPUTE",
      "color": "#0078D4",
      "description": "..."
    }
  ],
  "count": 5
}
```

### GET /api/azure/infrastructure/services/:serviceType

Get configuration options for a specific service.

**Parameters**:
- `serviceType` (string): Service type (e.g., "AzureAppService")

**Response**:
```json
{
  "status": "success",
  "service": {
    "type": "AzureAppService",
    "label": "App Service",
    "description": "Build and host web apps...",
    "icon": "⚙️",
    "category": "COMPUTE",
    "options": {
      "regions": ["eastus", "westus", ...],
      "tiers": ["Free", "Shared", "Basic", ...],
      "runtimes": ["Node.js 18 LTS", ...]
    }
  }
}
```

### POST /api/azure/infrastructure/nodes

Create a new Azure infrastructure node.

**Request**:
```json
{
  "serviceType": "AzureAppService",
  "config": {
    "region": "eastus",
    "tier": "Standard",
    "runtime": "Node.js 18 LTS",
    "instances": 2,
    "autoscale": true
  }
}
```

**Response**:
```json
{
  "status": "success",
  "node": {
    "id": "AzureAppService-1234567890",
    "data": {
      "label": "App Service",
      "type": "AzureAppService",
      "icon": "⚙️",
      "category": "COMPUTE",
      "config": { ... }
    },
    "position": { "x": 150, "y": 200 },
    "style": { ... }
  }
}
```

### POST /api/azure/infrastructure/validate

Validate Azure configuration.

**Request**:
```json
{
  "serviceType": "AzureCosmosDB",
  "config": {
    "region": "eastus",
    "tier": "Standard",
    "throughput": 200
  }
}
```

**Response** (Invalid):
```json
{
  "valid": false,
  "errors": [
    "Throughput must be between 400 and 1,000,000 RU/s"
  ]
}
```

### POST /api/azure/infrastructure/cost-estimate

Get cost estimate for configuration.

**Request**:
```json
{
  "serviceType": "AzureAppService",
  "config": {
    "tier": "Standard",
    "instances": 2
  }
}
```

**Response**:
```json
{
  "status": "success",
  "serviceType": "AzureAppService",
  "configuration": { ... },
  "costEstimate": {
    "estimate": 200,
    "currency": "USD/month"
  },
  "validated": true,
  "validationErrors": []
}
```

### POST /api/azure/infrastructure/template

Load predefined deployment template.

**Available Templates**:
- `simple-web-app` - Frontend, Backend, Database
- `microservices` - Distributed services
- `ai-enabled-app` - App with OpenAI
- `global-scale-app` - Multi-region deployment

**Request**:
```json
{
  "template": "simple-web-app"
}
```

**Response**:
```json
{
  "status": "success",
  "template": {
    "name": "Simple Web App",
    "description": "Single frontend and backend deployment",
    "nodes": [ ... ],
    "edges": [ ... ]
  }
}
```

## Frontend Component Usage

### Basic Integration

```jsx
import AzureInfrastructurePanel from '@/components/panels/AzureInfrastructurePanel';

export default function RightPanel() {
  const handleNodeCreated = (node) => {
    // Add node to canvas
    setNodes(prev => [...prev, node]);
  };

  const handleTemplateLoaded = (template) => {
    // Add template nodes and edges
    setNodes(prev => [...prev, ...template.nodes]);
    setEdges(prev => [...prev, ...template.edges]);
  };

  return (
    <AzureInfrastructurePanel
      onNodeCreated={handleNodeCreated}
      onTemplateLoaded={handleTemplateLoaded}
    />
  );
}
```

### Component Props

| Prop | Type | Description |
|------|------|-------------|
| `onNodeCreated` | Function | Called when node is created, receives node object |
| `onTemplateLoaded` | Function | Called when template is loaded, receives template object |

### Event Handlers

```javascript
// Node created event
const handleNodeCreated = (node) => {
  console.log('Created node:', node.id);
  console.log('Service type:', node.data.type);
  console.log('Configuration:', node.data.config);
};

// Template loaded event
const handleTemplateLoaded = (template) => {
  console.log('Template nodes:', template.nodes.length);
  console.log('Template edges:', template.edges.length);
};
```

## Configuration Examples

### Example 1: Production App Service

```json
{
  "serviceType": "AzureAppService",
  "config": {
    "region": "westeurope",
    "tier": "Premium",
    "runtime": "Node.js 20 LTS",
    "instances": 3,
    "autoscale": true,
    "maxInstances": 10,
    "minInstances": 3
  }
}
```

**Cost**: ~$840/month

### Example 2: Global Cosmos DB

```json
{
  "serviceType": "AzureCosmosDB",
  "config": {
    "region": "eastus",
    "tier": "Standard",
    "api": "MongoDB",
    "throughput": 10000,
    "autoscale": true,
    "maxThroughput": 20000,
    "consistency": "Session",
    "multiRegion": true,
    "replication": ["eastus", "westeurope", "japaneast"]
  }
}
```

**Cost**: ~$4,800/month (multi-region)

### Example 3: AI-Powered Application

```json
{
  "serviceType": "AzureOpenAI",
  "config": {
    "region": "eastus",
    "tier": "Standard",
    "models": ["gpt-4", "gpt-35-turbo"],
    "quotaTokens": 500000,
    "rateLimit": 5000,
    "deploymentName": "prod-deployment"
  }
}
```

**Cost**: Varies by usage (~$1000s+/month for heavy use)

## Predefined Templates

### 1. Simple Web App

Creates a basic three-tier architecture:
- **Frontend**: Static Web Apps (Free tier)
- **Backend**: App Service (Standard)
- **Database**: Cosmos DB (Standard, SQL)

**Ideal for**: MVP, development, small production apps

### 2. Microservices

Creates a scalable microservices platform:
- **Frontend**: Static Web Apps
- **Multiple Backends**: App Services with different purposes
- **Databases**: Multiple Cosmos DB instances with different APIs
- **Storage**: Storage Account for shared assets

**Ideal for**: Large distributed teams, complex applications

### 3. AI-Enabled App

Creates an application powered by AI:
- **Frontend**: Static Web Apps
- **Backend**: App Service (Premium tier)
- **OpenAI**: Azure OpenAI (gpt-4)
- **Vector DB**: Cosmos DB (MongoDB API)
- **Storage**: Storage Account for embeddings

**Ideal for**: AI features, chat bots, intelligent assistants

### 4. Global Scale App

Creates multi-region deployment:
- **Frontend**: Static Web Apps (multiple regions)
- **Backends**: App Services in multiple regions
- **Global DB**: Cosmos DB with multi-region replication
- **CDN**: Global content delivery

**Ideal for**: Global audience, compliance requirements

## Validation Rules

### App Service
- Instances: 1-100
- Tier must be valid
- Runtime must be supported

### Cosmos DB
- Throughput: 400-1,000,000 RU/s
- Max throughput ≥ throughput
- API must be supported
- Region must be available

### OpenAI
- Token quota ≥ 1000
- Rate limit ≥ 100
- Model must be available in region

### Storage
- Replication option valid
- Access tier appropriate for storage type

## Estimated Costs (Monthly)

| Service | Tier | Config | Cost |
|---------|------|--------|------|
| App Service | Free | 1 instance | $0 |
| App Service | Basic | 1 instance | $50 |
| App Service | Standard | 1 instance | $100 |
| App Service | Premium | 1 instance | $280 |
| Static Web Apps | Free | - | $0 |
| Static Web Apps | Standard | - | $99 |
| Cosmos DB | Serverless | - | $0.25/million ops |
| Cosmos DB | Provisioned | 400 RU/s | ~$24 |
| Cosmos DB | Provisioned | 10,000 RU/s | ~$600 |
| Storage Account | Standard | - | ~$20 |
| Storage Account | Premium | - | ~$150 |
| OpenAI | Standard | Per token | ~$0.002/1k tokens |

**Note**: Costs are estimates. Actual costs vary by usage patterns, data transfer, and region.

## Best Practices

### 1. Start with Templates
Use predefined templates for common architectures rather than building from scratch.

### 2. Configuration Validation
Always validate configuration before creating nodes. The system prevents invalid combinations.

### 3. Region Selection
- Choose regions close to users for latency
- Consider data residency requirements
- Some services available in limited regions

### 4. Tier Selection
- Free/Shared tiers: Development only
- Basic/Standard: Production small-medium
- Premium: High-traffic production
- Isolated: Multi-tenant isolation

### 5. Scaling Configuration
- Enable autoscaling for variable workloads
- Set appropriate min/max instances
- Monitor and adjust based on metrics

### 6. Cost Optimization
- Use Serverless tier for Cosmos DB if burst workloads
- Archive old data in Storage Archive tier
- Right-size instances based on actual usage
- Use Reserved Instances for predictable loads

### 7. Global Deployments
- Use multi-region only when needed
- Consider data consistency requirements
- Test failover strategies

## Limitations

- Cost estimates are rough approximations
- Some regions have limited service availability
- Inter-region replication has bandwidth costs
- Node configuration UI has standard options; advanced configs require manual JSON editing

## Future Enhancements

- [ ] Support for more Azure services (Functions, Service Bus, Event Hubs)
- [ ] Cost breakdown by component
- [ ] Export to ARM templates
- [ ] Integration with Azure templates
- [ ] Performance recommendations
- [ ] Scaling policy templates

## Troubleshooting

**Q: "Unknown service type" error**
A: Verify service type matches one of the supported types exactly (case-sensitive).

**Q: "Invalid region"**
A: Service may not be available in selected region. Check service options for available regions.

**Q: Cost estimate shows "TBD"**
A: Service may have usage-based pricing. Check Azure pricing for accurate estimates.

**Q: Validation fails for valid configuration**
A: Some fields have interdependencies. Check error message for specific requirements.

---

All Azure infrastructure components are ready to use in your architecture diagrams!
