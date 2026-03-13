# Azure Infrastructure Components - Real-World Examples

## Example 1: Startup MVP (Simple Web App)

**Scenario**: A new SaaS startup with limited budget, building MVP with founders as users.

**Architecture**:

```
┌─────────────────────────────────────────────┐
│ Static Web Apps (Free)                      │
│ Frontend (React)                            │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ App Service (Basic B1)                      │
│ Backend API (Node.js 18)                    │
│ 1 instance                                  │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│ Cosmos DB (Serverless)                      │
│ API: SQL                                    │
│ Region: East US                             │
│ Throughput: Pay-per-operation               │
└─────────────────────────────────────────────┘
```

**Configuration**:

```json
{
  "frontend": {
    "serviceType": "AzureStaticWebApps",
    "config": {
      "region": "eastus",
      "tier": "Free",
      "cdn": true,
      "customDomains": ["startup.app"]
    }
  },
  "backend": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Basic",
      "runtime": "Node.js 18 LTS",
      "instances": 1,
      "autoscale": false
    }
  },
  "database": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Serverless",
      "api": "SQL"
    }
  }
}
```

**Monthly Cost**: ~$50-100

**Pros**:
- ✅ Minimal initial cost
- ✅ Static web apps are free
- ✅ Pay-per-request database
- ✅ Easy to scale later

**Scaling Path**: Upgrade App Service tier to Standard → Premium as traffic grows

---

## Example 2: E-Commerce Platform (Microservices)

**Scenario**: Multi-vendor e-commerce platform with product catalog, orders, payments, and user management.

**Architecture**:

```
┌────────────────────────────────────────────────────────────────┐
│ Static Web Apps (Standard)                                      │
│ Frontend (React + Next.js)                                      │
│ CDN enabled, Global distribution                               │
└────────────────────────┬───────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
    ┌─────────────┐ ┌──────────┐ ┌──────────────┐
    │ API Gateway │ │ Products │ │ Orders       │
    │ App Service │ │ Service  │ │ Service      │
    │ Premium     │ │ (Express)│ │ (Express)    │
    │ 3 instances │ │ Standard │ │ Standard     │
    │             │ │ 2 inst   │ │ 2 instances  │
    └──────┬──────┘ └────┬─────┘ └──────┬───────┘
           │             │             │
           ├─────────────┼─────────────┤
           ↓             ↓             ↓
    ┌────────────┐ ┌──────────┐ ┌─────────────┐
    │ SQL API    │ │ MongoDB  │ │ File Store  │
    │ Cosmos DB  │ │ Cosmos   │ │ Storage     │
    │ 10k RU/s   │ │ 5k RU/s  │ │ Account GRS │
    └────────────┘ └──────────┘ └─────────────┘
```

**Configuration**:

```json
{
  "frontend": {
    "serviceType": "AzureStaticWebApps",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "cdn": true,
      "customDomains": ["shop.example.com"]
    }
  },
  "apiGateway": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Premium",
      "runtime": "Node.js 20 LTS",
      "instances": 3,
      "autoscale": true,
      "maxInstances": 10,
      "minInstances": 3
    }
  },
  "productService": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "runtime": "Node.js 20 LTS",
      "instances": 2,
      "autoscale": true
    }
  },
  "orderService": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "runtime": "Node.js 20 LTS",
      "instances": 2,
      "autoscale": true
    }
  },
  "sqlDatabase": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "SQL",
      "throughput": 10000,
      "autoscale": true,
      "maxThroughput": 50000
    }
  },
  "mongoDatabase": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "MongoDB",
      "throughput": 5000,
      "autoscale": true
    }
  },
  "fileStorage": {
    "serviceType": "AzureStorage",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "replication": "GRS",
      "accessTier": "Hot"
    }
  }
}
```

**Monthly Cost**: ~$2,000-3,000

**Architecture Patterns**:
- API Gateway as single entry point (rate limiting, versioning)
- Service-specific databases (polyglot persistence)
- Geo-replicated storage for backups

**Scaling Strategy**:
1. Autoscale triggered at 70% CPU
2. Max 10 instances per service
3. Database autoscales RU/s automatically
4. Storage CDN for static assets

---

## Example 3: AI-Powered Analytics Platform

**Scenario**: Data analytics platform with AI-driven insights using GPT-4 for natural language analysis.

**Architecture**:

```
┌──────────────────────────────────────────────────────────┐
│ Static Web Apps                                          │
│ Dashboard & UI (React + D3.js)                          │
└───────────────────┬──────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
   ┌─────────────┐    ┌───────────────┐
   │ API Service │    │ Analysis      │
   │ (Premium)   │    │ Workers       │
   │ 4 instances │    │ (Standard)    │
   │ Autoscale   │    │ 2 instances   │
   └──────┬──────┘    └───────┬───────┘
          │                   │
          └─────────┬─────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    ┌────────┐ ┌─────────┐ ┌──────────┐
    │ Vector │ │Raw Data │ │ OpenAI   │
    │ Store  │ │ Lake    │ │ Services │
    │Cosmos  │ │Storage  │ │ (East US)│
    │MongoDB │ │Account  │ │ 50k TPM  │
    └────────┘ └─────────┘ └──────────┘
```

**Configuration**:

```json
{
  "frontend": {
    "serviceType": "AzureStaticWebApps",
    "config": {
      "region": "eastus",
      "tier": "Standard"
    }
  },
  "apiService": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Premium",
      "runtime": "Node.js 20 LTS",
      "instances": 4,
      "autoscale": true,
      "maxInstances": 20,
      "minInstances": 4
    }
  },
  "analysisWorkers": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "runtime": "Python 3.12",
      "instances": 2,
      "autoscale": true,
      "maxInstances": 8
    }
  },
  "vectorStore": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "MongoDB",
      "throughput": 20000,
      "autoscale": true,
      "consistency": "Session"
    }
  },
  "dataLake": {
    "serviceType": "AzureStorage",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "replication": "GRS",
      "accessTier": "Cool",
      "lifecycle": "Archive after 90 days"
    }
  },
  "aiNlp": {
    "serviceType": "AzureOpenAI",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "models": ["gpt-4", "gpt-35-turbo"],
      "quotaTokens": 500000,
      "rateLimit": 50000
    }
  }
}
```

**Monthly Cost**: ~$4,000-5,000 (+ API usage)

**AI Features**:
- Natural language query interface
- Automatic insight generation
- Anomaly detection with GPT-4
- Report generation

---

## Example 4: Global Scale SaaS (Multi-Region)

**Scenario**: Enterprise SaaS product serving global users with compliance requirements (GDPR, HIPAA).

**Architecture**:

```
┌────────────────────────────────────────────────────────────────┐
│ Global Static Web Apps (Multi-region)                         │
│ Frontend + CDN                                                 │
└────────────────────────────────────────────────────────────────┘
            │                              │
      ┌─────┴──────────────────────────────┴─────┐
      ↓                                          ↓
┌─────────────────────┐              ┌─────────────────────┐
│ US East Region      │              │ EU West Region      │
├─────────────────────┤              ├─────────────────────┤
│ App Service Premium │              │ App Service Premium │
│ 4 instances         │              │ 4 instances         │
│ Autoscale 1-15      │              │ Autoscale 1-15      │
└──────┬──────────────┘              └──────┬──────────────┘
       │                                      │
       └────────────┬───────────────────────┬─┘
                    │                       │
            ┌───────┴───────┐       ┌───────┴───────┐
            ↓               ↓       ↓               ↓
      ┌──────────┐   ┌──────────┐ (Replicated)
      │Cosmos DB │   │Storage   │
      │Multi     │   │Account   │
      │Region    │   │GRS       │
      │50k RU/s  │   │          │
      └──────────┘   └──────────┘
           │
     (Regional replicas)
    EU: 50k RU/s total
    JP: 30k RU/s opt
    AU: 20k RU/s opt
```

**Configuration**:

```json
{
  "frontendGlobal": {
    "serviceType": "AzureStaticWebApps",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "cdn": true,
      "customDomains": ["api.company.com"]
    }
  },
  "usEastBackend": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Premium",
      "runtime": "Node.js 20 LTS",
      "instances": 4,
      "autoscale": true,
      "maxInstances": 15,
      "minInstances": 4
    }
  },
  "euWestBackend": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "westeurope",
      "tier": "Premium",
      "runtime": "Node.js 20 LTS",
      "instances": 4,
      "autoscale": true,
      "maxInstances": 15,
      "minInstances": 4
    }
  },
  "globalDatabase": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "SQL",
      "throughput": 50000,
      "autoscale": true,
      "maxThroughput": 200000,
      "multiRegion": true,
      "replication": ["eastus", "westeurope", "japaneast", "australiaeast"],
      "consistency": "Bounded Staleness"
    }
  },
  "globalStorage": {
    "serviceType": "AzureStorage",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "replication": "RA-GZRS",
      "accessTier": "Hot"
    }
  }
}
```

**Monthly Cost**: ~$8,000-12,000

**Compliance Features**:
- GDPR: EU data replica in westeurope
- HIPAA: Dedicated US East instance
- Global failover: Multi-region replication
- Audit logging: Storage with retention

**Performance SLAs**:
- 99.99% availability with multi-region
- <100ms response from 4 continents
- Automatic failover on region outage

---

## Example 5: Real-Time Analytics Dashboard

**Scenario**: Real-time monitoring and alerting for operations teams.

**Architecture**:

```
┌──────────────────────────────────────────┐
│ Static Web Apps                          │
│ Dashboard (React + WebSockets)          │
└──────────────┬───────────────────────────┘
               │
               ↓
        ┌────────────────┐
        │ App Service    │
        │ (Node.js+      │
        │  Express-WS)   │
        │ Standard 2inst │
        └────────┬───────┘
                 │
        ┌────────┴──────────┐
        ↓                   ↓
    ┌────────┐         ┌──────────┐
    │Events: │         │Time-series│
    │Cosmos  │         │Data:      │
    │DB      │         │Cosmos DB  │
    │5k RU/s │         │10k RU/s   │
    └────────┘         └──────────┘
```

**Configuration**:

```json
{
  "frontend": {
    "serviceType": "AzureStaticWebApps",
    "config": {
      "region": "eastus",
      "tier": "Standard"
    }
  },
  "apiService": {
    "serviceType": "AzureAppService",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "runtime": "Node.js 20 LTS",
      "instances": 2,
      "autoscale": true
    }
  },
  "eventsDatabase": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "SQL",
      "throughput": 5000,
      "ttl": 2592000
    }
  },
  "timeSeriesDatabase": {
    "serviceType": "AzureCosmosDB",
    "config": {
      "region": "eastus",
      "tier": "Standard",
      "api": "SQL",
      "throughput": 10000,
      "autoscale": true
    }
  }
}
```

**Monthly Cost**: ~$800-1,200

**Real-Time Features**:
- WebSocket connections for instant updates
- Time-series data optimized storage
- TTL for automatic data cleanup
- Configurable throughput scaling

---

## Deployment Considerations

### 1. Blue-Green Deployments
Create parallel infrastructure for zero-downtime updates:
- Keep current version running
- Deploy new version to separate App Service
- Switch traffic via Traffic Manager

### 2. Disaster Recovery
- Always use multi-region for critical systems
- Test failover regularly
- Maintain RTO/RPO SLAs
- Document recovery procedures

### 3. Monitoring & Logging
- Enable Application Insights on App Services
- Monitor database performance metrics
- Set up alerts for anomalies
- Archive logs to Storage for compliance

### 4. Security
- Use managed identities for service-to-service auth
- Enable VNet endpoints
- Implement least-privilege RBAC
- Encrypt data in transit and at rest

### 5. Cost Optimization
- Use Reserved Instances for stable workloads
- Archive old data (Storage lifecycle policies)
- Right-size instances based on actual usage
- Use Cosmos DB serverless for unpredictable loads

---

These examples demonstrate how Azure Infrastructure Components can be used to design realistic, production-grade cloud architectures!
