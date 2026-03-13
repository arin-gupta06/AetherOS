# Azure Infrastructure Components - Integration Guide

## Quick Start (5 Minutes)

### Step 1: Add Component to UI

In your main canvas or right panel component:

```jsx
import AzureInfrastructurePanel from '@/components/panels/AzureInfrastructurePanel';
import { useState } from 'react';

export default function CanvasContainer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleNodeCreated = (node) => {
    setNodes(prev => [...prev, node]);
  };

  const handleTemplateLoaded = (template) => {
    setNodes(prev => [...prev, ...template.nodes]);
    setEdges(prev => [...prev, ...template.edges]);
  };

  return (
    <div className="flex">
      <div className="flex-1">
        {/* Your React Flow Canvas */}
      </div>
      <div className="w-96">
        <AzureInfrastructurePanel 
          onNodeCreated={handleNodeCreated}
          onTemplateLoaded={handleTemplateLoaded}
        />
      </div>
    </div>
  );
}
```

### Step 2: Verify Backend Routes

Test that Azure infrastructure routes are working:

```bash
# List available services
curl http://localhost:4000/api/azure/infrastructure/services

# Get service options
curl http://localhost:4000/api/azure/infrastructure/services/AzureAppService

# Create a node
curl -X POST http://localhost:4000/api/azure/infrastructure/nodes \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "runtime": "Node.js 18 LTS",
      "instances": 1
    }
  }'
```

### Step 3: Add to Sidebar Navigation

```jsx
const sidePanels = [
  { id: 'azure-infra', label: 'Azure Infrastructure', icon: Cloud },
  // ... other panels
];

{activePanel === 'azure-infra' && <AzureInfrastructurePanel {...props} />}
```

Done! The feature is now integrated.

## API Client Usage

### Import Functions

```javascript
import {
  getAvailableAzureServices,
  getServiceOptions,
  createAzureNode,
  validateAzureConfig,
  estimateCost,
  getDeploymentTemplate,
} from '@/lib/azureInfrastructureApi';
```

### Examples

#### Get Available Services

```javascript
const result = await getAvailableAzureServices();
// result.services = [
//   { id: 'azure-app-service', label: 'App Service', ... },
//   { id: 'azure-cosmos-db', label: 'Cosmos DB', ... },
//   ...
// ]
```

#### Get Service Options

```javascript
const options = await getServiceOptions('AzureAppService');
// options.service.options = {
//   regions: ['eastus', 'westus', ...],
//   tiers: ['Basic', 'Standard', 'Premium', ...],
//   runtimes: ['Node.js 18 LTS', 'Node.js 20 LTS', ...]
// }
```

#### Create Node

```javascript
const result = await createAzureNode('AzureAppService', {
  region: 'eastus',
  tier: 'Standard',
  runtime: 'Node.js 18 LTS',
  instances: 2,
  autoscale: true,
});

// result.node = {
//   id: 'AzureAppService-1234567890',
//   data: { label: 'App Service', type: 'AzureAppService', config: {...} },
//   position: { x: 150, y: 200 },
//   style: { ... }
// }
```

#### Validate Configuration

```javascript
const validation = await validateAzureConfig('AzureCosmosDB', {
  throughput: 200, // Invalid - min is 400
});

// validation = {
//   valid: false,
//   errors: ['Throughput must be between 400 and 1,000,000 RU/s']
// }
```

#### Estimate Cost

```javascript
const cost = await estimateCost('AzureAppService', {
  tier: 'Standard',
  instances: 2,
});

// cost = {
//   status: 'success',
//   costEstimate: {
//     estimate: 200,
//     currency: 'USD/month'
//   },
//   validated: true
// }
```

#### Load Template

```javascript
const template = await getDeploymentTemplate('simple-web-app');

// template = {
//   status: 'success',
//   template: {
//     name: 'Simple Web App',
//     nodes: [...],
//     edges: [...]
//   }
// }
```

## Node Structure

### What Gets Created

When a node is created, it has this structure:

```javascript
{
  id: "AzureAppService-1710345678",
  data: {
    label: "App Service",
    type: "AzureAppService",
    icon: "⚙️",
    category: "COMPUTE",
    config: {
      region: "eastus",
      tier: "Standard",
      runtime: "Node.js 18 LTS",
      instances: 2,
      autoscale: true,
      maxInstances: 10,
      minInstances: 1
    },
    description: "Build and host web apps..."
  },
  position: {
    x: 234.5,
    y: 189.3
  },
  style: {
    background: "#0078D4",
    color: "#fff",
    border: "2px solid #010101",
    borderRadius: "8px"
  }
}
```

### Displaying in React Flow

```jsx
import { Handle, Position } from 'reactflow';

function AzureNodeComponent({ data }) {
  return (
    <div className="azure-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-icon">{data.icon}</div>
        <div className="node-label">{data.label}</div>
        <div className="node-config">
          <div className="config-item">
            <span>Region:</span>
            <strong>{data.config.region}</strong>
          </div>
          <div className="config-item">
            <span>Tier:</span>
            <strong>{data.config.tier}</strong>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

## Styling Azure Nodes

### Dark Mode Support

```css
.azure-node {
  background: linear-gradient(135deg, #0078D4, #0066B2);
  color: white;
  padding: 12px;
  border-radius: 8px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.azure-node:hover {
  box-shadow: 0 6px 16px rgba(0, 120, 212, 0.4);
}

.azure-node.selected {
  box-shadow: 0 0 0 2px #40a9ff;
}
```

### Service-Specific Colors

```javascript
const serviceColors = {
  'AzureAppService': '#0078D4',      // Blue
  'AzureStaticWebApps': '#0078D4',   // Blue
  'AzureCosmosDB': '#16A34A',        // Green
  'AzureOpenAI': '#7928CA',          // Purple
  'AzureStorage': '#0078D4',         // Blue
};
```

## Advanced Usage

### Custom Validation

Add application-specific validation before creating nodes:

```javascript
async function handleCreateNode(serviceType, config) {
  // Custom validation
  if (serviceType === 'AzureAppService') {
    if (config.tier === 'Premium' && nodes.length > 5) {
      showWarning('Multiple premium instances increase costs');
    }
  }

  // Proceed with creation
  const node = await createAzureNode(serviceType, config);
  addNodeToCanvas(node);
}
```

### Cost Comparison

Compare costs between configurations:

```javascript
const configs = [
  { tier: 'Standard', instances: 1 },
  { tier: 'Standard', instances: 2 },
  { tier: 'Premium', instances: 1 },
];

const costs = await Promise.all(
  configs.map(config =>
    estimateCost('AzureAppService', config)
  )
);

costs.forEach((cost, idx) => {
  console.log(`Config ${idx + 1}: $${cost.costEstimate.estimate}`);
});
```

### Architecture Export

Export architecture diagram as configuration:

```javascript
function exportAzureArchitecture(nodes, edges) {
  const services = nodes
    .filter(n => n.data.type.startsWith('Azure'))
    .map(n => ({
      type: n.data.type,
      config: n.data.config,
      position: n.position,
    }));

  const connections = edges.map(e => ({
    source: e.source,
    target: e.target,
  }));

  return {
    services,
    connections,
    exportedAt: new Date().toISOString(),
  };
}
```

### Template Creation

Create custom reusable templates:

```javascript
function createCustomTemplate(name, nodes, edges) {
  return {
    id: `custom-${Date.now()}`,
    name,
    nodes,
    edges,
    createdAt: new Date().toISOString(),
    custom: true,
  };
}
```

## Common Patterns

### 1. Three-Tier Web App

```javascript
// Frontend
const frontend = await createAzureNode('AzureStaticWebApps', {
  region: 'eastus',
  tier: 'Standard',
});

// Backend
const backend = await createAzureNode('AzureAppService', {
  region: 'eastus',
  tier: 'Standard',
  runtime: 'Node.js 20 LTS',
  instances: 2,
});

// Database
const database = await createAzureNode('AzureCosmosDB', {
  region: 'eastus',
  api: 'SQL',
  throughput: 5000,
});

// Add to canvas
setNodes([frontend.node, backend.node, database.node]);
setEdges([
  { source: frontend.node.id, target: backend.node.id },
  { source: backend.node.id, target: database.node.id },
]);
```

### 2. AI-Powered Application

```javascript
const services = await Promise.all([
  createAzureNode('AzureStaticWebApps', { region: 'eastus' }),
  createAzureNode('AzureAppService', { 
    region: 'eastus', 
    tier: 'Premium' 
  }),
  createAzureNode('AzureOpenAI', { 
    region: 'eastus',
    models: ['gpt-4']
  }),
  createAzureNode('AzureCosmosDB', { 
    region: 'eastus',
    api: 'MongoDB'
  }),
]);

const nodes = services.map(s => s.node);
```

### 3. Multi-Region Deployment

```javascript
const regions = ['eastus', 'westeurope', 'japaneast'];

const nodes = await Promise.all(
  regions.map(region =>
    createAzureNode('AzureAppService', {
      region,
      tier: 'Premium',
      instances: 3,
    })
  )
);

setNodes(nodes.map(n => n.node));
```

## Troubleshooting

### Routes Not Loading
- Ensure server restarted after adding routes
- Check that imports are correct in server/src/index.js
- Verify routes registered: `app.use('/api/azure', azureInfrastructureRoutes)`

### Services Not Appearing
- Check browser console for fetch errors
- Verify API endpoint: `GET /api/azure/infrastructure/services`
- Check CORS configuration if cross-origin

### Validation Fails
- Review field requirements in docs
- Check dependent fields (e.g., throughput limits for tier)
- Validate using POST endpoint before creating

### Cost Estimate Shows "TBD"
- Service may have usage-based pricing
- Check Azure pricing page for accurate rates
- Some services require runtime data

## Performance Tips

1. **Cache Service Options**
   ```javascript
   const [cachedOptions, setCachedOptions] = useState({});
   const getServiceOptionsWithCache = async (type) => {
     if (cachedOptions[type]) return cachedOptions[type];
     const options = await getServiceOptions(type);
     setCachedOptions(prev => ({ ...prev, [type]: options }));
     return options;
   };
   ```

2. **Debounce Validation**
   ```javascript
   const debouncedValidate = useCallback(
     debounce((config) => validateAzureConfig(type, config), 500),
     [type]
   );
   ```

3. **Batch Template Loads**
   ```javascript
   const loadTemplates = useCallback(
     async (templateIds) => {
       return Promise.all(
         templateIds.map(id => getDeploymentTemplate(id))
       );
     },
     []
   );
   ```

## Next Steps

1. ✅ Add component to UI sidebar
2. ✅ Test creating individual nodes
3. ✅ Load templates
4. ✅ Display costs for configurations
5. ✅ Connect nodes with edges
6. ✅ Export architecture diagrams
7. ✅ Save/load custom templates

---

Ready to design Azure architectures visually! 🚀
