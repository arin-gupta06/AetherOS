/**
 * AetherOS — Repository Inference Engine
 * Parses repository files to reconstruct architecture topology.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');

const CLONE_DIR = path.join(__dirname, '..', '..', 'tmp', 'repos');

/**
 * Clone a GitHub repository to a temporary directory
 */
async function cloneRepository(repoUrl) {
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const dest = path.join(CLONE_DIR, `${repoName}-${Date.now()}`);
  if (!fs.existsSync(CLONE_DIR)) fs.mkdirSync(CLONE_DIR, { recursive: true });
  const git = simpleGit();
  await git.clone(repoUrl, dest, ['--depth', '1']);
  return dest;
}

/**
 * Infer architecture from a cloned repository path
 */
async function inferArchitecture(repoPath) {
  const nodes = [];
  const edges = [];
  const detectedServices = [];

  // 1. Parse docker-compose.yml
  const composeResult = parseDockerCompose(repoPath);
  if (composeResult) {
    detectedServices.push(...composeResult.services);
    edges.push(...composeResult.edges);
  }

  // 2. Scan for Dockerfiles
  const dockerfiles = findFiles(repoPath, 'Dockerfile');
  for (const df of dockerfiles) {
    const dir = path.dirname(df);
    const serviceName = path.basename(dir) === path.basename(repoPath)
      ? 'main-app'
      : path.basename(dir);
    if (!detectedServices.find(s => s.name === serviceName)) {
      const runtime = detectRuntimeFromDockerfile(df);
      detectedServices.push({
        name: serviceName,
        type: 'container',
        runtime,
        source: 'Dockerfile'
      });
    }
  }

  // 3. Scan for package.json (Node/Frontend services)
  const packageJsons = findFiles(repoPath, 'package.json')
    .filter(f => !f.includes('node_modules'));
  for (const pj of packageJsons) {
    const dir = path.dirname(pj);
    const serviceName = path.basename(dir) === path.basename(repoPath)
      ? 'root-app'
      : path.basename(dir);
    if (!detectedServices.find(s => s.name === serviceName)) {
      const pkgData = JSON.parse(fs.readFileSync(pj, 'utf8'));
      const isReact = pkgData.dependencies?.react || pkgData.devDependencies?.react;
      const isNext = pkgData.dependencies?.next;
      const isExpress = pkgData.dependencies?.express;

      let type = 'service';
      let runtime = 'node';

      if (isReact || isNext) { type = 'frontend'; runtime = 'node'; }
      if (isExpress) { type = 'api'; runtime = 'node'; }
      if (pkgData.dependencies?.bun) runtime = 'bun';

      detectedServices.push({
        name: pkgData.name || serviceName,
        type,
        runtime,
        port: extractPort(pkgData),
        source: 'package.json',
        dependencies: Object.keys(pkgData.dependencies || {})
      });
    }
  }

  // 4. Scan for requirements.txt (Python services)
  const requirementsTxts = findFiles(repoPath, 'requirements.txt');
  for (const rt of requirementsTxts) {
    const dir = path.dirname(rt);
    const serviceName = path.basename(dir) === path.basename(repoPath)
      ? 'python-app'
      : path.basename(dir);
    if (!detectedServices.find(s => s.name === serviceName)) {
      const content = fs.readFileSync(rt, 'utf8');
      const isFlask = content.includes('flask') || content.includes('Flask');
      const isDjango = content.includes('django') || content.includes('Django');
      const isFastAPI = content.includes('fastapi') || content.includes('FastAPI');

      detectedServices.push({
        name: serviceName,
        type: isFlask || isDjango || isFastAPI ? 'api' : 'service',
        runtime: 'python',
        source: 'requirements.txt'
      });
    }
  }

  // 5. Scan for OpenAPI specs
  const openApiFiles = [
    ...findFiles(repoPath, 'openapi.yaml'),
    ...findFiles(repoPath, 'openapi.yml'),
    ...findFiles(repoPath, 'swagger.yaml'),
    ...findFiles(repoPath, 'swagger.yml'),
    ...findFiles(repoPath, 'openapi.json'),
    ...findFiles(repoPath, 'swagger.json')
  ];
  for (const oaf of openApiFiles) {
    const dir = path.dirname(oaf);
    const serviceName = `api-${path.basename(dir)}`;
    if (!detectedServices.find(s => s.name === serviceName)) {
      detectedServices.push({
        name: serviceName,
        type: 'api',
        runtime: 'unknown',
        source: 'openapi-spec'
      });
    }
  }

  // 6. Convert detected services to nodes
  let xPos = 100;
  let yPos = 100;
  const nodeMap = {};

  for (const svc of detectedServices) {
    const id = uuidv4();
    nodeMap[svc.name] = id;
    nodes.push({
      id,
      type: svc.type,
      label: svc.name,
      position: { x: xPos, y: yPos },
      data: {
        runtime: svc.runtime || '',
        environmentType: svc.type === 'container' ? 'container' : 'local',
        port: svc.port || null,
        metadata: {
          source: svc.source,
          dependencies: svc.dependencies || []
        },
        status: 'healthy'
      }
    });
    xPos += 300;
    if (xPos > 1200) { xPos = 100; yPos += 200; }
  }

  // 7. Convert edges (resolve names to ids)
  const resolvedEdges = edges
    .filter(e => nodeMap[e.source] && nodeMap[e.target])
    .map(e => ({
      id: uuidv4(),
      source: nodeMap[e.source],
      target: nodeMap[e.target],
      label: e.label || 'depends_on',
      type: 'default'
    }));

  return { nodes, edges: resolvedEdges, metadata: { serviceCount: nodes.length } };
}

// --- Helpers ---

function parseDockerCompose(repoPath) {
  const composeFiles = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];
  for (const file of composeFiles) {
    const fullPath = path.join(repoPath, file);
    if (fs.existsSync(fullPath)) {
      try {
        const doc = yaml.load(fs.readFileSync(fullPath, 'utf8'));
        if (!doc || !doc.services) return null;

        const services = [];
        const edges = [];

        for (const [name, config] of Object.entries(doc.services)) {
          let runtime = 'unknown';
          if (config.image) {
            if (config.image.includes('node')) runtime = 'node';
            else if (config.image.includes('python')) runtime = 'python';
            else if (config.image.includes('mongo')) runtime = 'database';
            else if (config.image.includes('postgres')) runtime = 'database';
            else if (config.image.includes('redis')) runtime = 'cache';
            else if (config.image.includes('rabbit') || config.image.includes('kafka')) runtime = 'queue';
            else if (config.image.includes('nginx')) runtime = 'proxy';
          }

          const type = runtime === 'database' ? 'database'
            : runtime === 'cache' ? 'cache'
            : runtime === 'queue' ? 'queue'
            : 'service';

          const port = config.ports?.[0]
            ? parseInt(String(config.ports[0]).split(':')[0])
            : null;

          services.push({ name, type, runtime, port, source: 'docker-compose' });

          if (config.depends_on) {
            const deps = Array.isArray(config.depends_on) ? config.depends_on : Object.keys(config.depends_on);
            for (const dep of deps) {
              edges.push({ source: name, target: dep, label: 'depends_on' });
            }
          }
        }

        return { services, edges };
      } catch (e) {
        console.warn('[Inference] Failed to parse docker-compose:', e.message);
      }
    }
  }
  return null;
}

function detectRuntimeFromDockerfile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    if (content.includes('FROM node') || content.includes('FROM oven/bun')) return content.includes('bun') ? 'bun' : 'node';
    if (content.includes('FROM python')) return 'python';
    if (content.includes('FROM golang') || content.includes('FROM go')) return 'go';
    if (content.includes('FROM rust')) return 'rust';
    if (content.includes('FROM openjdk') || content.includes('FROM java')) return 'java';
    if (content.includes('FROM ruby')) return 'ruby';
    if (content.includes('FROM php')) return 'php';
    if (content.includes('FROM deno')) return 'deno';
    return 'unknown';
  } catch { return 'unknown'; }
}

function findFiles(rootDir, filename, maxDepth = 4) {
  const results = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath, depth + 1);
        else if (entry.name === filename) results.push(fullPath);
      }
    } catch { /* ignore permission errors */ }
  }
  walk(rootDir, 0);
  return results;
}

function extractPort(pkgData) {
  const startScript = pkgData.scripts?.start || pkgData.scripts?.dev || '';
  const portMatch = startScript.match(/--port\s+(\d+)|PORT=(\d+)|-p\s+(\d+)/);
  if (portMatch) return parseInt(portMatch[1] || portMatch[2] || portMatch[3]);
  return null;
}

module.exports = { cloneRepository, inferArchitecture };
