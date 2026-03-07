/**
 * AetherOS — CBCT Bridge
 * Connects to the CodeBase Cartographic Tool for structural intelligence.
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Analyze a directory for structural code intelligence
 */
function analyzeStructure(dirPath) {
  const absDir = path.resolve(dirPath);
  if (!fs.existsSync(absDir)) {
    return { error: 'Directory not found', files: [], tree: null };
  }

  const tree = buildFileTree(absDir, 0, 5);
  const files = flattenTree(tree, '');

  // Compute file metrics
  const codeExtensions = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java', '.rb', '.php', '.cs', '.cpp', '.c', '.vue', '.svelte']);
  const metrics = files.map(f => {
    const ext = path.extname(f.name).toLowerCase();
    const isCode = codeExtensions.has(ext);
    const absolutePath = path.join(absDir, f.relativePath);
    let lines = 0;
    let size = 0;
    try {
      const stat = fs.statSync(absolutePath);
      size = stat.size;
      if (isCode && size < 500000) {
        lines = fs.readFileSync(absolutePath, 'utf8').split('\n').length;
      }
    } catch { /* ignore */ }

    return {
      path: f.relativePath,
      name: f.name,
      extension: ext,
      isCode,
      lines,
      size
    };
  });

  // Simple dependency detection for JS/TS files
  const dependencies = [];
  const codeFiles = metrics.filter(m => m.isCode && ['.js', '.ts', '.jsx', '.tsx'].includes(m.extension));

  for (const file of codeFiles) {
    try {
      const content = fs.readFileSync(path.join(absDir, file.path), 'utf8');
      const importRegex = /(?:import\s+.*?from\s+['"](.+?)['"]|require\s*\(\s*['"](.+?)['"]\s*\))/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const dep = match[1] || match[2];
        if (dep.startsWith('.')) {
          dependencies.push({ source: file.path, target: dep, type: 'local' });
        } else {
          dependencies.push({ source: file.path, target: dep, type: 'external' });
        }
      }
    } catch { /* ignore */ }
  }

  // Detect circular dependencies
  const localDeps = dependencies.filter(d => d.type === 'local');
  const circularDeps = detectCircularImports(localDeps);

  // Risk density (files with many imports or many lines)
  const riskMap = metrics
    .filter(m => m.isCode)
    .map(m => {
      const importCount = dependencies.filter(d => d.source === m.path).length;
      const risk = Math.min(100, (m.lines / 500) * 30 + importCount * 10);
      return { path: m.path, lines: m.lines, imports: importCount, risk: Math.round(risk) };
    })
    .sort((a, b) => b.risk - a.risk);

  return {
    tree,
    fileCount: metrics.length,
    codeFileCount: codeFiles.length,
    totalLines: metrics.reduce((sum, m) => sum + m.lines, 0),
    dependencies,
    circularDependencies: circularDeps,
    riskHeatmap: riskMap.slice(0, 20),
    hotspots: riskMap.filter(r => r.risk > 60)
  };
}

function buildFileTree(dirPath, depth, maxDepth) {
  if (depth > maxDepth) return null;
  const name = path.basename(dirPath);
  const result = { name, type: 'directory', children: [] };
  const ignored = new Set(['node_modules', '.git', '__pycache__', 'dist', 'build', '.next', '.cache', 'coverage']);

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const child = buildFileTree(fullPath, depth + 1, maxDepth);
        if (child) result.children.push(child);
      } else {
        result.children.push({ name: entry.name, type: 'file' });
      }
    }
  } catch { /* ignore */ }

  return result;
}

/**
 * Flatten tree to array of { name, relativePath }.
 * The root directory name is EXCLUDED from paths so that
 * relativePath is always relative to dirPath.
 */
function flattenTree(tree, basePath) {
  const files = [];
  if (!tree) return files;

  if (tree.type === 'file') {
    const rel = basePath ? path.join(basePath, tree.name) : tree.name;
    files.push({ name: tree.name, relativePath: rel.replace(/\\/g, '/') });
  } else if (tree.children) {
    // For the root call (basePath === ''), skip prepending the root dir name
    for (const child of tree.children) {
      if (basePath === '' && child.type === 'directory') {
        // Root-level directory: child's own name becomes its base
        files.push(...flattenTree(child, child.name));
      } else if (basePath === '' && child.type === 'file') {
        // Root-level file
        files.push({ name: child.name, relativePath: child.name });
      } else if (child.type === 'directory') {
        // Nested directory: append child name to current base path
        files.push(...flattenTree(child, `${basePath}/${child.name}`));
      } else {
        // Nested file: just record path directly without recursing
        files.push({ name: child.name, relativePath: `${basePath}/${child.name}`.replace(/\\/g, '/') });
      }
    }
  }
  return files;
}

function detectCircularImports(localDeps) {
  const graph = {};
  for (const dep of localDeps) {
    if (!graph[dep.source]) graph[dep.source] = [];
    graph[dep.source].push(dep.target);
  }

  const cycles = [];
  const visited = new Set();
  const recStack = new Set();

  function dfs(node, pathArr) {
    visited.add(node);
    recStack.add(node);
    pathArr.push(node);

    for (const neighbor of (graph[node] || [])) {
      const resolvedNeighbor = resolveRelativeImport(node, neighbor);
      if (!visited.has(resolvedNeighbor)) {
        dfs(resolvedNeighbor, [...pathArr]);
      } else if (recStack.has(resolvedNeighbor)) {
        const cycleStart = pathArr.indexOf(resolvedNeighbor);
        if (cycleStart >= 0) {
          cycles.push(pathArr.slice(cycleStart));
        }
      }
    }

    recStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) dfs(node, []);
  }

  return cycles;
}

function resolveRelativeImport(fromFile, importPath) {
  const dir = path.dirname(fromFile);
  let resolved = path.join(dir, importPath).replace(/\\/g, '/');
  if (!path.extname(resolved)) {
    // Try common extensions
    resolved += '.js';
  }
  return resolved;
}

module.exports = { analyzeStructure };
