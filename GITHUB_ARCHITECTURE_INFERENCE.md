# GitHub Repository Integration for Architecture Inference

## Overview

The GitHub repository integration feature enables automatic architecture detection and inference from public GitHub repositories. The system analyzes repository structure, configuration files, and dependencies to generate a visual architecture graph that can be imported directly into AetherOS.

## Features

- **Automatic Architecture Detection**: Analyzes GitHub repositories to identify frontend, backend, database, message queue, and worker services
- **Configuration File Analysis**: Parses package.json, docker-compose.yml, requirements.txt, Dockerfile, go.mod, and pom.xml
- **Service Detection**: Identifies:
  - Frontend frameworks (React, Vue, Angular, Svelte)
  - Backend frameworks (Express, FastAPI, Django, Spring Boot, etc.)
  - Databases (PostgreSQL, MongoDB, MySQL, Redis, DynamoDB, etc.)
  - Message queues (RabbitMQ, Kafka, Redis)
  - Caching layers (Redis, Memcached)
  - Background workers and jobs
- **React Flow Integration**: Automatically generates nodes and edges for the architecture canvas
- **Visual Architecture Graph**: Creates connected components with proper relationships

## Setup

### 1. GitHub Token (Optional but Recommended)

While the integration works without authentication, GitHub API has rate limits. For better rate limits and access to private repos:

```bash
# Create a Personal Access Token at: https://github.com/settings/tokens
# Then add to .env file:
GITHUB_TOKEN=ghp_your_token_here
```

### 2. Environment Configuration

Add to `server/.env`:

```env
GITHUB_TOKEN=ghp_your_token_here  # Optional, for higher rate limits
```

### 3. Verify Installation

```bash
cd server
npm list octokit
```

Should output: `octokit@3.1.0` (or higher)

## API Reference

### POST /api/github/analyze-repo

Analyzes a GitHub repository and infers its architecture.

**Request:**

```bash
curl -X POST http://localhost:4000/api/github/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/facebook/react"
  }'
```

**Input Parameters:**

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| repoUrl   | string | Yes      | Full GitHub repository URL or owner/repo format |

**Success Response (200 OK):**

```json
{
  "status": "success",
  "repository": {
    "owner": "facebook",
    "repo": "react",
    "url": "https://github.com/facebook/react"
  },
  "detectedServices": {
    "frontend": {
      "type": "Frontend",
      "name": "Frontend Application",
      "directory": "packages/react",
      "framework": "React"
    },
    "backend": null,
    "database": null,
    "workers": [],
    "caches": [],
    "messageQueue": null,
    "other": []
  },
  "architecture": {
    "nodes": [
      {
        "id": "service-0",
        "data": {
          "label": "Frontend",
          "type": "Frontend",
          "service": {
            "type": "Frontend",
            "name": "Frontend Application",
            "framework": "React"
          }
        },
        "position": {
          "x": 150,
          "y": 100
        }
      }
    ],
    "edges": []
  },
  "timestamp": "2026-03-13T10:30:45.123Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "status": "error",
  "message": "Invalid GitHub URL format. Expected: https://github.com/owner/repo"
}
```

## Frontend Integration

### Using the GitHub Import Panel

The `GitHubImportPanel` component provides a user-friendly interface for repository analysis.

**Component Props:**

```javascript
<GitHubImportPanel
  onArchitectureDetected={(nodes, edges) => {
    // Handle the detected architecture
  }}
/>
```

**Example Integration:**

```jsx
import GitHubImportPanel from './components/panels/GitHubImportPanel';

export default function App() {
  const handleArchitectureDetected = (architecture) => {
    // Add nodes and edges to the canvas
    setNodes(prev => [...prev, ...architecture.nodes]);
    setEdges(prev => [...prev, ...architecture.edges]);
  };

  return (
    <div>
      <GitHubImportPanel onArchitectureDetected={handleArchitectureDetected} />
    </div>
  );
}
```

### Programmatic Usage

```javascript
import { analyzeGitHubRepository } from './lib/githubApi';

const analyzeRepo = async () => {
  try {
    const result = await analyzeGitHubRepository('https://github.com/owner/repo');

    if (result.status === 'success') {
      // Use result.architecture.nodes and result.architecture.edges
      console.log('Detected services:', result.detectedServices);
      console.log('Nodes:', result.architecture.nodes);
      console.log('Edges:', result.architecture.edges);
    }
  } catch (error) {
    console.error('Failed to analyze repository:', error);
  }
};
```

## Architecture Detection Logic

### Frontend Detection

The system detects frontends by looking for:
- `client/`, `frontend/`, or `webapp/` directories
- `package.json` with React, Vue, Angular, or Svelte dependencies
- Vite, Webpack, or other bundler configurations

Detected frameworks:
- **React** - detect from dependencies
- **Vue** - detect from `vue` package
- **Angular** - detect from `@angular` packages
- **Svelte** - detect from `svelte` package

### Backend Detection

The system identifies backends by analyzing package files:

**Node.js**: `package.json` with Express, Fastify, NestJS, Koa, or Hapi
**Python**: `requirements.txt` with Django, Flask, or FastAPI
**Go**: Presence of `go.mod`
**Java**: Presence of `pom.xml` (Spring Boot detected)

### Database Detection

Databases are identified from:
- `docker-compose.yml` services
- `package.json`/`requirements.txt` dependencies
- Configuration files

Supported databases:
- PostgreSQL / Postgres
- MySQL / MariaDB
- MongoDB / Mongo
- Redis
- Elasticsearch
- DynamoDB
- Cassandra
- SQLite

### Message Queue Detection

Detected from Docker compose files:
- **RabbitMQ**: `rabbitmq` service
- **Kafka**: `kafka` service
- **Redis**: `redis` service as message queue

### Cache Detection

Detected separately from message queues:
- **Redis**: Cache layer
- **Memcached**: Memory caching

### Worker Detection

Workers are identified by:
- `workers/`, `jobs/`, or `tasks/` directories
- Background job configurations in main framework config

## Example Use Cases

### Analyzing a Node.js Full-Stack App

**Repository**: `https://github.com/user/mern-app`

Contains:
- `client/` (React frontend with package.json)
- `server/` (Express backend with package.json)
- `docker-compose.yml` (with MongoDB, Redis)

**Detected Architecture:**
```
Frontend (React)
    ↓
Backend API (Express)
    ├→ MongoDB (Database)
    └→ Redis (Cache)
```

### Analyzing a Microservices Repository

**Repository**: `https://github.com/company/microservices`

Contains:
- Multiple `package.json` files
- `docker-compose.yml` with 5+ services
- RabbitMQ configuration
- Worker services

**Detected Architecture:**
```
Frontend
    ↓
API Gateway (Service 1)
    ├→ User Service
    ├→ Order Service
    ├→ Product Service
    └→ RabbitMQ → Worker Service
```

### Analyzing a Python Backend

**Repository**: `https://github.com/user/fastapi-app`

Contains:
- `requirements.txt` (FastAPI, SQLAlchemy, Celery)
- `docker-compose.yml` (PostgreSQL, Redis, Celery Workers)

**Detected Architecture:**
```
FastAPI Backend
    ├→ PostgreSQL (Database)
    ├→ Redis (Cache)
    └→ Celery Workers
```

## Troubleshooting

### "Invalid GitHub URL format"

**Problem**: The URL provided doesn't match expected formats.

**Solution**: Use one of these formats:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo/`
- `https://github.com/owner/repo.git`

### "Failed to fetch repository"

**Problem**: Repository doesn't exist or is private without authentication.

**Solution**:
1. Verify repository URL is correct and public
2. Add `GITHUB_TOKEN` to `.env` for private repo access
3. Check GitHub API status

### "No architecture detected"

**Problem**: Repository structure doesn't match expected patterns.

**Reasons**:
- Configuration files not in root directory
- Non-standard directory naming conventions
- Monorepo with complex structure

**Solutions**:
1. Check if package.json, docker-compose.yml exist in root
2. Manually add services to canvas as fallback
3. Submit issue with repository details

### Rate Limit Exceeded

**Problem**: Getting HTTP 403 due to GitHub API rate limit.

**Solution**:
1. Add GitHub token: `GITHUB_TOKEN=ghp_your_token` to `.env`
2. Restart server: `npm start`
3. Personal access tokens have higher rate limits (5000 req/hour vs 60 req/hour)

## Architecture Graph Format

The response includes React Flow compatible nodes and edges.

### Node Structure

```javascript
{
  id: "service-0",
  data: {
    label: "Service Name",
    type: "Frontend|Backend|Database|Cache|MessageQueue|Worker",
    service: {
      /* service details */
    }
  },
  position: { x: 100, y: 150 }
}
```

### Edge Structure

```javascript
{
  source: "service-0",
  target: "service-1",
  animated: true
}
```

### Service Types

| Type         | Color | Example                    |
| ------------ | ----- | -------------------------- |
| Frontend     | Amber | React, Vue, Angular        |
| Service      | Blue  | Express, FastAPI, Spring   |
| Database     | Green | PostgreSQL, MongoDB        |
| Cache        | Cyan  | Redis, Memcached           |
| MessageQueue | Purple| RabbitMQ, Kafka            |
| Worker       | Orange| Celery, Bull Queue         |

## Limitations

1. **Private Repositories**: Requires GitHub token authentication
2. **Complex Monorepos**: May not detect all services in complex monorepo structures
3. **Non-standard Structures**: Relies on conventional directory naming
4. **Limited Language Support**: Currently supports Node.js, Python, Go, Java, .NET (limited)
5. **Configuration Parsing**: Basic parsing; complex custom configs may be missed
6. **Docker-only Deployments**: Works best with docker-compose.yml references

## Advanced Usage

### Custom Service Detection

For repositories with non-standard structures, you can:
1. Manually add services after import
2. Create custom detection by forking the service
3. Use JSON import feature (if implemented)

### Extending Detection

To add new language support:

1. Add detection logic to `analyzeServices()` in `githubArchitectureInference.js`
2. Create framework detection function (e.g., `detectRustFramework`)
3. Add to configuration file checks

Example:

```javascript
if (configFiles['Cargo.toml']?.exists) {
  services.backend = {
    type: 'Backend',
    name: 'Backend API',
    runtime: 'Rust',
    framework: detectRustFramework(configFiles['Cargo.toml'].content),
  };
}
```

## Performance Considerations

- **First-time Analysis**: 2-5 seconds (includes GitHub API calls)
- **Cached Results**: N/A (each analysis is fresh)
- **API Rate Limits**:
  - Without token: 60 requests/hour
  - With token: 5000 requests/hour
  - Recommended: Use token for production

## Security

- URLs are parsed client-side
- No repository content is stored
- GitHub token used only for API authentication
- Public repositories analyzed without authentication

## Future Enhancements

- [ ] Support for Kubernetes manifests
- [ ] AWS CloudFormation detection
- [ ] Terraform analysis
- [ ] Pipeline/CI-CD detection (GitHub Actions, GitLab CI)
- [ ] Cost estimation based on detected services
- [ ] Architecture recommendations based on patterns
- [ ] Export detected architecture as code
