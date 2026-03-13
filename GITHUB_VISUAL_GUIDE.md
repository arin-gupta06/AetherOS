# GitHub Architecture Inference - Visual Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Flow Canvas                            │
│              (Displays Detected Architecture)                    │
│                                                                   │
│    ┌──────────────┐          ┌──────────────┐                   │
│    │   Frontend   │──────→   │   Backend    │                   │
│    │   (React)    │          │  (Express)   │                   │
│    └──────────────┘          └──────────────┘                   │
│                                    │                              │
│                                    ↓                              │
│                            ┌──────────────┐                      │
│                            │  Database    │                      │
│                            │  (MongoDB)   │                      │
│                            └──────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
          ↑
          │ (imports to)
          │
┌─────────────────────────────────────────────────────────────────┐
│             GitHub Import Panel (React Component)                │
│                                                                   │
│   [GitHub URL Input Field]                                       │
│   https://github.com/owner/repo                                  │
│                                                                   │
│   [Analyze Repository] (button)                                  │
│                                                                   │
│   ✓ Frontend Application (React)                                │
│   ✓ API Backend (Express)                                        │
│   ✓ Database (MongoDB)                                           │
│   ✓ Cache (Redis)                                                │
│                                                                   │
│   [Auto-imported to canvas ↑↑↑]                                 │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│              Backend Analysis Service                            │
│                                                                   │
│   1. Parse GitHub URL → Extract owner/repo                      │
│   2. Fetch Repository Structure → Analyze directories           │
│   3. Fetch Config Files:                                         │
│      - package.json    (Node.js/npm)                             │
│      - requirements.txt (Python)                                 │
│      - docker-compose.yml (Services)                             │
│      - go.mod          (Go)                                      │
│      - pom.xml         (Java)                                    │
│   4. Detect Services:                                            │
│      - Analyze dependencies                                      │
│      - Identify frameworks                                       │
│      - Extract infrastructure                                    │
│   5. Generate Graph → Create nodes & edges                      │
│   6. Return to Frontend → Display in canvas                      │
└─────────────────────────────────────────────────────────────────┘
          │
          ↓
      GitHub API
   (Octokit/REST)
         │
         ↓
   Repository Files
```

## Data Flow Diagram

```
User Pastes GitHub URL
    │
    ↓
┌──────────────────────────────────┐
│  GitHubImportPanel (React)       │
│  - Input: GitHub repo URL        │
│  - Calls: analyzeGitHubRepository│
└──────────────────────────────────┘
    │
    ↓ HTTP POST
┌──────────────────────────────────┐
│  API Endpoint                    │
│  POST /api/github/analyze-repo   │
│  - Validates URL                 │
│  - Calls inference service       │
└──────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────┐
│  GitHub Inference Service        │
│  - Parses repository structure   │
│  - Fetches config files          │
│  - Analyzes dependencies         │
│  - Detects services              │
│  - Generates graph               │
└──────────────────────────────────┘
    │
    ↓ HTTP Response (JSON)
┌──────────────────────────────────┐
│  Response with:                  │
│  - Detected services             │
│  - Architecture nodes            │
│  - Architecture edges            │
│  - Metadata                      │
└──────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────┐
│  React Component Updates         │
│  - Shows detected components     │
│  - Displays success message      │
│  - Triggers canvas import        │
└──────────────────────────────────┘
    │
    ↓
┌──────────────────────────────────┐
│  React Flow Canvas               │
│  - Renders nodes                 │
│  - Renders edges                 │
│  - Shows architecture graph      │
└──────────────────────────────────┘
```

## Service Detection Logic

```
                    GitHub Repository
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ↓                ↓                ↓
    package.json    requirements.txt  docker-compose.yml
         │                │                │
         ↓                ↓                ↓
    ┌─────────────────────────────────────────┐
    │  Configuration File Analysis            │
    └─────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────┐
    │  Detect Dependencies:                   │
    │  - React → Frontend                     │
    │  - Express → Backend                    │
    │  - MongoDB → Database                   │
    │  - RabbitMQ → Message Queue             │
    │  - Redis → Cache                        │
    └─────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────┐
    │  Generate React Flow Graph:             │
    │  - Create nodes for each service        │
    │  - Create edges for connections         │
    │  - Add metadata and styling             │
    └─────────────────────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────────────┐
    │  Return:                                │
    │  {                                      │
    │    "nodes": [...],                      │
    │    "edges": [...],                      │
    │    "detectedServices": {...}            │
    │  }                                      │
    └─────────────────────────────────────────┘
```

## Detected Services Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Detection                            │
├─────────────────────┬─────────────────────┬─────────────────────┤
│  Frontend           │  Backend            │  Infrastructure     │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ • React             │ • Express           │ • PostgreSQL        │
│ • Vue               │ • Fastify           │ • MongoDB           │
│ • Angular           │ • NestJS            │ • MySQL             │
│ • Svelte            │ • Koa               │ • Redis             │
│ • Next.js           │ • Django            │ • RabbitMQ          │
│ • Nuxt              │ • Flask             │ • Kafka             │
│ • Remix             │ • FastAPI           │ • Elasticsearch     │
│                     │ • Spring Boot       │ • DynamoDB          │
│                     │ • Go                │ • Memcached         │
│                     │ • Rust              │ • Docker Compose    │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

## File Detection Map

```
Repository Structure
│
├── package.json
│   ├─→ Node.js Project Detected
│   ├─→ Parse dependencies
│   ├─→ Identify framework (Express, Fastify, React, etc.)
│   └─→ Create corresponding nodes
│
├── requirements.txt
│   ├─→ Python Project Detected
│   ├─→ Parse packages
│   ├─→ Identify framework (Django, Flask, FastAPI)
│   └─→ Create backend node
│
├── docker-compose.yml
│   ├─→ Multi-service architecture
│   ├─→ Extract services:
│   │   ├─ postgres → Database node
│   │   ├─ redis → Cache node
│   │   ├─ rabbitmq → Queue node
│   │   └─ web → Backend node
│   └─→ Create edges between services
│
├── Dockerfile
│   ├─→ Containerized service detected
│   └─→ Identify service type
│
├── go.mod
│   ├─→ Go project detected
│   └─→ Create backend node (Go)
│
└── pom.xml
    ├─→ Java/Maven project detected
    ├─→ Spring Boot framework detected
    └─→ Create backend node (Spring Boot)
```

## Component Type Visualization

```
React Flow Node Types
───────────────────────────────────────────────────────────────

┌─────────────────────┐    ┌─────────────────────┐
│  🎨 Frontend        │    │  ⚙️  Backend API    │
│  React, Vue, etc.   │    │  Express, Flask     │
└─────────────────────┘    └─────────────────────┘
         ↓                          ↓
┌─────────────────────┐    ┌─────────────────────┐
│  💾 Database        │    │  ⚡ Cache           │
│  PostgreSQL, Mongo  │    │  Redis, Memcached   │
└─────────────────────┘    └─────────────────────┘
         ↓                          ↓
┌─────────────────────┐    ┌─────────────────────┐
│  📨 Message Queue   │    │  👷 Worker          │
│  RabbitMQ, Kafka    │    │  Background jobs    │
└─────────────────────┘    └─────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────────────┐
│         AetherOS Main Application            │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Sidebar / Right Panel                 │  │
│  │  (Where GitHubImportPanel is added)    │  │
│  │                                        │  │
│  │  - GitHub Import                       │  │
│  │  - AI Architecture Advisor             │  │
│  │  - Azure Integration                   │  │
│  │  - Other panels...                     │  │
│  └────────────────────────────────────────┘  │
│           ↓                                   │
│  ┌────────────────────────────────────────┐  │
│  │  React Flow Canvas                     │  │
│  │  (Where architecture is visualized)    │  │
│  │                                        │  │
│  │  [receives nodes & edges from panel]   │  │
│  └────────────────────────────────────────┘  │
│           ↑                                   │
│  ┌────────────────────────────────────────┐  │
│  │  handleArchitectureDetected() callback │  │
│  │  (Imported from GitHubImportPanel)     │  │
│  │                                        │  │
│  │  setNodes([...newNodes])               │  │
│  │  setEdges([...newEdges])               │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│         Backend API Server (Express)         │
├──────────────────────────────────────────────┤
│                                              │
│  POST /api/github/analyze-repo               │
│  ├─ Input: { repoUrl }                      │
│  └─ Output: { nodes, edges, services }      │
│                                              │
└──────────────────────────────────────────────┘
         ↓
      GitHub API
   (via Octokit)
```

## Example Transformation

```
Input:
──────
URL: https://github.com/facebook/react

↓ (Analysis Process)

Detection:
──────────
✓ Directory structure: packages/
✓ package.json found
✓ Dependency: "react"
✓ Framework: React
✗ Backend: None
✗ Database: None
✗ Queue: None

Output:
───────
{
  "status": "success",
  "architecture": {
    "nodes": [
      { id: "service-0", label: "Frontend", type: "Frontend" }
    ],
    "edges": []
  }
}

↓ (Canvas Rendering)

Visual:
───────
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────────────┘
```

## Complex Example Transformation

```
Input:
──────
URL: https://github.com/user/ecommerce

↓ (Analysis Process)

Detection:
──────────
✓ package.json: React dependencies
✓ package.json: Express dependencies
✓ requirements.txt: Not found
✓ docker-compose.yml found
  - postgres service
  - redis service
  - rabbitmq service
  - web service (Express)
✓ Database: PostgreSQL, Redis
✓ Queue: RabbitMQ

Output:
───────
{
  "status": "success",
  "architecture": {
    "nodes": [
      { id: "service-0", label: "Frontend", type: "Frontend" },
      { id: "service-1", label: "API Backend", type: "Service" },
      { id: "service-2", label: "PostgreSQL", type: "Database" },
      { id: "service-3", label: "Redis", type: "Cache" },
      { id: "service-4", label: "RabbitMQ", type: "MessageQueue" }
    ],
    "edges": [
      { source: "service-0", target: "service-1" },
      { source: "service-1", target: "service-2" },
      { source: "service-1", target: "service-3" },
      { source: "service-1", target: "service-4" }
    ]
  }
}

↓ (Canvas Rendering)

Visual:
───────
        Frontend (React)
              │
              ↓
        API Backend (Express)
          ├────┬────┐
          ↓    ↓    ↓
       PostgreSQL Redis RabbitMQ
```

---

This visual guide shows how the GitHub integration fits into AetherOS and how data flows through the system!
