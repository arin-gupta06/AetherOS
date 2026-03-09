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

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (optional — runs in memory-only mode without it)

### Install & Run

```bash
# Install all dependencies
npm install

# Run both frontend and backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **WebSocket:** ws://localhost:4000/ws

### Quick Start (No Database)

Click **"Quick Start"** on the welcome screen to begin modeling immediately in memory mode.

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
