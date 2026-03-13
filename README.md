# AetherOS

**Unified Architectural Intelligence and System Modeling Platform**

AetherOS is a governed architectural reasoning laboratory that enables developers to **model**, **infer**, **simulate**, and **inspect** complex software systems within a unified, state-aware environment.

---

## Core Capabilities

| Feature | Description |
|---|---|
| **System Modeling Canvas** | Drag-and-drop node-based architecture builder using React Flow |
| **Repository Inference** | Auto-generate architecture from GitHub repos, Docker Compose, package.json, etc. |
| **Runtime Assignment** | Assign runtimes (Node, Bun, Python, Go…), environments (Container, Local, Serverless), and resource constraints |
| **Governance Rule Engine** | Define and validate architectural constraints — boundary restrictions, forbidden paths, max depth, access control |
| **Failure Injection** | Simulate service failures, latency, resource exhaustion — observe cascading impact across the graph |
| **CBCT Integration** | Structural code intelligence — file hierarchy, dependency graphs, circular dependency detection, risk heatmaps |
| **Unified Event Log** | Centralized, replayable architectural event stream tracking all mutations |
| **Unified State Authority** | All mutations governed through a central Zustand-based state engine with deterministic tracking |
| **Azure OpenAI Advisor** | AI-powered architecture analysis and recommendations via Azure OpenAI |
| **Azure Deployment Suggestions** | Multi-cloud architecture support (Azure, AWS, GCP) with provider-specific configurations |
| **Reference Architectures** | Pre-built Azure deployment patterns (microservices, serverless, containers, event-driven) |

---

## Microsoft Azure Integration

AetherOS is enhanced with **Microsoft Azure ecosystem** integration to demonstrate enterprise cloud architecture patterns:

### Azure OpenAI Architecture Advisor
- **Intelligent Analysis** — Uses Azure OpenAI (GPT-3.5/4) to analyze your architecture
- **Smart Recommendations** — AI-driven suggestions for improvements, scaling, and deployment
- **Scalability Analysis** — Identifies bottlenecks and recommends Azure scaling patterns

### GitHub Repository Analyzer
- **Auto-Infer Architecture** — Analyze any GitHub repo to detect technology stack
- **Dependency Extraction** — Maps languages, frameworks, databases, and tools
- **Structure Mapping** — Visualizes project organization and components

### Azure Reference Architectures
Pre-built, production-ready patterns for Azure:

1. **Microservices with Cosmos DB** — Global distribution ($2.5K-$5K/month)
2. **Web API on App Service** — Traditional monolithic ($500-$1.5K/month)
3. **Event-Driven with Service Bus** — Loosely coupled services ($800-$2K/month)
4. **Serverless with Functions** — Pay-per-execution ($10-$500/month)
5. **Hybrid Container on AKS** — Kubernetes + managed services ($1.5K-$4K/month)

All templates include:
- Pre-configured Azure services (App Service, Cosmos DB, Service Bus, Functions, etc.)
- Connection patterns and data flows
- Scalability and cost considerations
- Import directly into the modeling canvas

### Azure Deployment Suggestions
- **AI-Powered Recommendations** — Uses Azure OpenAI to suggest optimal Azure services for your architecture
- **Cost Estimates** — Provides estimated monthly costs for suggested deployment
- **Service Selection** — Recommends which Azure services fit your requirements

---

## Architecture

```
AetherOS/
├── client/                     # React 18 + Vite + Tailwind + React Flow + Zustand
│   └── src/
│       ├── components/         # UI components
│       │   ├── nodes/          # Custom React Flow nodes
│       │   ├── panels/         # Sidebar panels (palette, inference, rules, sim, CBCT, events)
│       │   ├── ModelingCanvas  # Main canvas
│       │   ├── Header          # Top bar with env selector + status
│       │   ├── Sidebar         # Left sidebar with tabs
│       │   └── RightPanel      # Node inspector + runtime assignment
│       ├── store/              # Zustand state authority
│       ├── hooks/              # WebSocket hook
│       └── lib/                # API client, utilities
├── server/                     # Node.js + Express + MongoDB + WebSocket
│   └── src/
│       ├── engines/            # Core engines
│       │   ├── inferenceEngine # Repository parsing & topology inference
│       │   ├── ruleEngine      # Governance rule validation + circular dep detection
│       │   ├── failureSimulator# Failure injection & propagation (BFS)
│       │   └── cbctBridge      # Structural intelligence integration
│       ├── models/             # MongoDB schemas
│       ├── routes/             # REST API endpoints
│       └── ws/                 # WebSocket broadcast
└── CodeBase-CartoGraphic-Tool-CBCT-/  # CBCT submodule
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Flow, Zustand, Lucide Icons |
| Backend | Node.js, Express, MongoDB (optional), WebSocket |
| Inference | docker-compose parser, Dockerfile scanner, package.json/requirements.txt analysis |
| Graph Algorithms | BFS/DFS for dependency traversal, failure propagation, circular detection |
| CBCT | CodeBase Cartographic Tool — structural code analysis engine |
| **Azure Cloud** | **Azure OpenAI, GitHub API, Cosmos DB, App Service, Service Bus, Functions** |

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (optional — runs in memory-only mode without it)
- **Azure OpenAI credentials** (optional but recommended for AI features)
- **GitHub Personal Access Token** (optional for extended API limits)

### Install & Run

```bash
# Install all dependencies
npm install

# Configure Azure services (see AZURE_INTEGRATION.md for details)
cp server/.env.template server/.env
# Edit server/.env with your Azure OpenAI and GitHub credentials

# Run both frontend and backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **WebSocket:** ws://localhost:4000/ws

### Quick Start (No Azure, No Database)

Click **"Quick Start"** on the welcome screen to begin modeling immediately in memory mode. Azure features will show as "unconfigured" but the system will work fully offline.

### Azure Integration Setup

For full Azure features:

1. **Get Azure OpenAI credentials:**
   - Create Azure OpenAI Service in Azure Portal
   - Copy endpoint and API key to `server/.env`

2. **Get GitHub Token (optional):**
   - Create Personal Access Token on GitHub
   - Add to `server/.env` for higher API rate limits

See [AZURE_INTEGRATION.md](./AZURE_INTEGRATION.md) for complete setup instructions.

### Multi-Cloud Architecture Support

AetherOS supports **cloud-agnostic architecture design** with **Azure**, **AWS**, and **GCP** first-class support:

#### Cloud Services Node Model
- **Provider Selection** — Each node can target Azure, AWS, GCP, or Local deployment
- **Provider-Specific Configuration** — Automatic region/instance type validation per provider
- **Auto-Scaling** — Configure minimum replicas and maximum auto-scale capacity
- **Export with Cloud Config** — Architecture exports include complete cloud deployment specifications

#### Supported Cloud Providers

**Azure:**
- Regions: 8 (US, EU, APAC)
- Instance Types: B-series (burstable), D-series (compute), 20+ options
- Tiers: Free, Standard, Premium

**AWS:**
- Regions: 8 regions globally
- Instance Types: t3 (burstable), m5 (general), c5 (compute), 20+ options
- Tiers: Free tier eligible, Standard, Reserved

**GCP:**
- Regions: 8 regions globally
- Instance Types: e2 (shared core), n1 (standard), 15+ options
- Tiers: Free, Committed (1-3 year), Standard

#### Quick Cloud Configuration

1. **Select node** → Open **Cloud tab** in right panel
2. **Choose Cloud Provider** (Azure/AWS/GCP/Local)
3. **Select Region** (provider-specific)
4. **Choose Instance Type** (provider-specific)
5. **Set Replication** (min 1-100 replicas)
6. **Enable Auto-Scaling** (optional, with max replicas)
7. **Export** → Cloud config automatically included

#### Example Configuration

```javascript
Node: "API Backend"
Cloud Provider: Azure
Region: eastus
Instance Type: Standard_B2s
Tier: Standard
Replicas: 2
Auto-Scale: Yes (max: 10)
```

See [CLOUD_SERVICES_GUIDE.md](./CLOUD_SERVICES_GUIDE.md) for complete documentation and [CLOUD_SERVICES_QUICK_REFERENCE.md](./CLOUD_SERVICES_QUICK_REFERENCE.md) for quick reference.

---

## Workflow

1. **Create** a new environment (or use Quick Start)
2. **Drag** component nodes from the palette onto the canvas
3. **Connect** nodes by dragging edges between them
4. **Import** — paste a GitHub URL to auto-infer architecture
5. **Assign** runtimes and environments via the right panel
6. **Define** governance rules from templates
7. **Validate** architecture against rules
8. **Inject** failures and observe cascading impact
9. **Inspect** structural details via CBCT analysis
10. **Review** the event log for full mutation history

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/environments` | List all environments |
| POST | `/api/environments` | Create environment |
| GET | `/api/environments/:id` | Get environment |
| PUT | `/api/environments/:id` | Update environment |
| DELETE | `/api/environments/:id` | Delete environment |
| POST | `/api/inference/github` | Infer architecture from GitHub repo |
| POST | `/api/inference/local` | Infer architecture from local path |
| POST | `/api/rules/validate` | Validate rules against architecture |
| POST | `/api/rules/circular` | Detect circular dependencies |
| GET | `/api/rules/templates` | Get rule templates |
| POST | `/api/simulation/inject` | Inject failure |
| POST | `/api/simulation/resilience` | Calculate resilience score |
| POST | `/api/cbct/analyze` | Analyze repository structure |
| GET | `/api/events` | Get event log |
| **POST** | **`/api/azure/analyze`** | **Analyze architecture with Azure OpenAI** |
| **POST** | **`/api/azure/deployment-suggestion`** | **Get Azure deployment recommendation** |
| **POST** | **`/api/azure/scalability-analysis`** | **Analyze scalability patterns** |
| **GET** | **`/api/azure/reference-architectures`** | **List all reference architectures** |
| **GET** | **`/api/azure/reference-architectures/:id`** | **Get specific reference architecture** |
| **POST** | **`/api/azure/recommend-architecture`** | **Get AI recommendations for workload** |
| **POST** | **`/api/github/analyze`** | **Analyze GitHub repository** |

---

## Azure Integration Components

### Backend Services

**`server/src/services/azureOpenAIService.js`**
- Integrates with Azure OpenAI Service (GPT-3.5/4)
- Analyzes architecture and provides recommendations
- Suggests optimal Azure deployment patterns
- Analyzes scalability and identifies bottlenecks

**`server/src/services/githubService.js`**
- Analyzes GitHub repositories using GitHub API
- Detects technology stack and dependencies
- Maps repository structure and architecture
- Generates insights from code analysis

**`server/src/services/azureArchitectureService.js`**
- Provides 5 pre-built Azure reference architectures
- Offers architecture recommendations based on workload profile
- Includes estimated costs for each pattern

### Frontend Panels

**`client/src/components/panels/AzureAdvisorPanel.jsx`**
- Three-tab interface: Analysis, Deployment, Scalability
- Real-time AI recommendations from Azure OpenAI
- Risk identification and improvement suggestions

**`client/src/components/panels/GitHubAnalyzerPanel.jsx`**
- GitHub repository URL input and analysis
- Technology stack visualization
- Dependencies and insights display

**`client/src/components/panels/AzureReferenceArchitecturesPanel.jsx`**
- Browse all pre-built Azure architectures
- View components, benefits, and estimated costs
- Import architectures directly into the canvas

---

## Node Types

- **Service** — Application service
- **API** — API gateway / endpoint
- **Frontend** — Client-side application
- **Database** — Data store
- **Cache** — Caching layer (Redis, etc.)
- **Queue** — Message broker
- **Worker** — Background worker
- **Runtime** — Execution engine
- **Container** — Containerized component
- **Boundary** — Infrastructure boundary

---

## License

MIT
