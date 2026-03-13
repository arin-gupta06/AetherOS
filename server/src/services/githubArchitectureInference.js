/**
 * GitHub Architecture Inference Service
 * Analyzes GitHub repositories to infer system architecture
 */

const { Octokit } = require('octokit');

/**
 * Initialize GitHub client with token from environment
 */
function getGitHubClient() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });
}

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url) {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^/]+)\/([^/.]+)(\.git)?$/, // https://github.com/owner/repo.git
    /github\.com\/([^/]+)\/([^/.]+)\/?$/, // https://github.com/owner/repo/
    /https:\/\/github\.com\/([^/]+)\/([^/]+)/, // Full URL format
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
  }

  throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
}

/**
 * Infer architecture from GitHub repository
 */
async function inferArchitectureFromRepo(repoUrl) {
  const octokit = getGitHubClient();

  try {
    const { owner, repo } = parseGitHubUrl(repoUrl);

    // Fetch repository files
    const fileStructure = await getRepositoryStructure(octokit, owner, repo);

    // Fetch key configuration files
    const configFiles = await getConfigurationFiles(octokit, owner, repo);

    // Analyze file structure and configs to detect services
    const detectedServices = analyzeServices(fileStructure, configFiles);

    // Generate architecture nodes and edges
    const { nodes, edges } = generateArchitecture(detectedServices, fileStructure);

    return {
      status: 'success',
      repository: { owner, repo, url: repoUrl },
      detectedServices,
      architecture: {
        nodes,
        edges,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GitHub Inference] Error:', error.message);
    return {
      status: 'error',
      message: error.message,
      architecture: null,
    };
  }
}

/**
 * Get repository directory structure (top 2 levels)
 */
async function getRepositoryStructure(octokit, owner, repo) {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '',
    });

    const items = Array.isArray(response.data) ? response.data : [response.data];
    const structure = {};

    for (const item of items) {
      if (item.type === 'dir' && !item.name.startsWith('.')) {
        structure[item.name] = {
          type: 'dir',
          name: item.name,
          path: item.path,
        };
      } else if (item.type === 'file' && !item.name.startsWith('.')) {
        structure[item.name] = {
          type: 'file',
          name: item.name,
          path: item.path,
        };
      }
    }

    return structure;
  } catch (error) {
    console.error('[GitHub Inference] Structure fetch error:', error.message);
    return {};
  }
}

/**
 * Get configuration files (package.json, docker-compose.yml, etc.)
 */
async function getConfigurationFiles(octokit, owner, repo) {
  const files = {};
  const filesToFetch = ['package.json', 'docker-compose.yml', 'docker-compose.yaml', 'Dockerfile', 'requirements.txt', 'go.mod', 'pom.xml'];

  for (const fileName of filesToFetch) {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: fileName,
      });

      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      files[fileName] = {
        exists: true,
        content: content.substring(0, 5000), // Limit content size
      };
    } catch (_error) {
      files[fileName] = { exists: false };
    }
  }

  return files;
}

/**
 * Analyze files to detect services
 */
function analyzeServices(fileStructure, configFiles) {
  const services = {
    frontend: null,
    backend: null,
    database: null,
    workers: [],
    caches: [],
    messageQueue: null,
    other: [],
  };

  // Detect frontend
  if (fileStructure.client || fileStructure.frontend || fileStructure.webapp) {
    services.frontend = {
      type: 'Frontend',
      name: 'Frontend Application',
      directory: Object.keys(fileStructure).find(k => ['client', 'frontend', 'webapp'].includes(k)),
      framework: detectFrontendFramework(configFiles),
    };
  }

  // Check for package.json for Node.js backend
  if (configFiles['package.json']?.exists) {
    const pkgContent = configFiles['package.json'].content;
    const isBackend = pkgContent.includes('express') || pkgContent.includes('fastify') || pkgContent.includes('koa');
    const isFrontend = pkgContent.includes('react') || pkgContent.includes('vue') || pkgContent.includes('angular');

    if (isBackend && !isFrontend) {
      services.backend = {
        type: 'Backend',
        name: 'Backend API',
        runtime: 'Node.js',
        framework: detectNodeFramework(pkgContent),
      };
    }
  }

  // Check for Python backend
  if (configFiles['requirements.txt']?.exists) {
    services.backend = {
      type: 'Backend',
      name: 'Backend API',
      runtime: 'Python',
      framework: detectPythonFramework(configFiles['requirements.txt'].content),
    };
  }

  // Check for Go backend
  if (configFiles['go.mod']?.exists) {
    services.backend = {
      type: 'Backend',
      name: 'Backend API',
      runtime: 'Go',
      framework: 'Go',
    };
  }

  // Check for Java backend
  if (configFiles['pom.xml']?.exists) {
    services.backend = {
      type: 'Backend',
      name: 'Backend API',
      runtime: 'Java',
      framework: 'Spring Boot',
    };
  }

  // Detect database
  const hasDatabaseReferences = checkForDatabaseReferences(configFiles, fileStructure);
  if (hasDatabaseReferences) {
    services.database = {
      type: 'Database',
      name: 'Database',
      databases: detectDatabases(configFiles),
    };
  }

  // Detect Docker services
  if (configFiles['docker-compose.yml']?.exists || configFiles['docker-compose.yaml']?.exists) {
    const dockerContent = configFiles['docker-compose.yml']?.content || configFiles['docker-compose.yaml']?.content;
    const dockerServices = detectDockerServices(dockerContent);
    services.messageQueue = dockerServices.messageQueue;
    services.caches = dockerServices.caches;
    services.workers = dockerServices.workers;
  }

  // Detect workers/background jobs
  if (fileStructure.workers || fileStructure.jobs || fileStructure.tasks) {
    services.workers.push({
      type: 'Worker',
      name: 'Background Worker',
      directory: Object.keys(fileStructure).find(k => ['workers', 'jobs', 'tasks'].includes(k)),
    });
  }

  return services;
}

/**
 * Detect frontend framework
 */
function detectFrontendFramework(configFiles) {
  const pkgContent = configFiles['package.json']?.content || '';
  if (pkgContent.includes('"react"')) return 'React';
  if (pkgContent.includes('"vue"')) return 'Vue';
  if (pkgContent.includes('"angular"')) return 'Angular';
  if (pkgContent.includes('"svelte"')) return 'Svelte';
  return 'Unknown';
}

/**
 * Detect Node.js framework
 */
function detectNodeFramework(content) {
  if (content.includes('express')) return 'Express';
  if (content.includes('fastify')) return 'Fastify';
  if (content.includes('koa')) return 'Koa';
  if (content.includes('nestjs')) return 'NestJS';
  if (content.includes('hapi')) return 'Hapi';
  return 'Node.js';
}

/**
 * Detect Python framework
 */
function detectPythonFramework(content) {
  if (content.includes('django')) return 'Django';
  if (content.includes('flask')) return 'Flask';
  if (content.includes('fastapi')) return 'FastAPI';
  if (content.includes('tornado')) return 'Tornado';
  return 'Python';
}

/**
 * Detect databases from config files
 */
function detectDatabases(configFiles) {
  const databases = [];
  const configContent = Object.values(configFiles)
    .map(f => f.content || '')
    .join(' ')
    .toLowerCase();

  if (configContent.includes('postgresql') || configContent.includes('postgres')) databases.push('PostgreSQL');
  if (configContent.includes('mysql')) databases.push('MySQL');
  if (configContent.includes('mongodb') || configContent.includes('mongo')) databases.push('MongoDB');
  if (configContent.includes('redis')) databases.push('Redis');
  if (configContent.includes('elasticsearch')) databases.push('Elasticsearch');
  if (configContent.includes('dynamodb')) databases.push('DynamoDB');
  if (configContent.includes('cassandra')) databases.push('Cassandra');
  if (configContent.includes('sqlite')) databases.push('SQLite');

  return databases.length > 0 ? databases : ['Unknown Database'];
}

/**
 * Check for database references in code
 */
function checkForDatabaseReferences(configFiles, fileStructure) {
  const configContent = Object.values(configFiles)
    .map(f => f.content || '')
    .join(' ')
    .toLowerCase();

  // Check for various database indicators
  return (
    configContent.includes('database') ||
    configContent.includes('postgres') ||
    configContent.includes('mysql') ||
    configContent.includes('mongodb') ||
    configContent.includes('redis') ||
    configContent.includes('db_') ||
    fileStructure.migrations ||
    fileStructure.sql ||
    fileStructure.database ||
    fileStructure.data
  );
}

/**
 * Detect Docker services (databases, caches, message queues, workers)
 */
function detectDockerServices(dockerContent) {
  const services = {
    messageQueue: null,
    caches: [],
    workers: [],
  };

  if (!dockerContent) return services;

  const contentLower = dockerContent.toLowerCase();

  // Detect message queues
  if (contentLower.includes('rabbitmq')) {
    services.messageQueue = { type: 'MessageQueue', name: 'RabbitMQ' };
  } else if (contentLower.includes('kafka')) {
    services.messageQueue = { type: 'MessageQueue', name: 'Kafka' };
  } else if (contentLower.includes('redis')) {
    services.messageQueue = { type: 'MessageQueue', name: 'Redis' };
  }

  // Detect caches
  if (contentLower.includes('redis')) {
    services.caches.push({ type: 'Cache', name: 'Redis' });
  }
  if (contentLower.includes('memcached')) {
    services.caches.push({ type: 'Cache', name: 'Memcached' });
  }

  return services;
}

/**
 * Generate architecture nodes and edges from detected services
 */
function generateArchitecture(services, fileStructure) {
  const nodes = [];
  const edges = [];
  let nodeId = 0;
  const serviceMap = {};

  // Helper to add node
  function addNode(type, label, service) {
    const id = `service-${nodeId++}`;
    nodes.push({
      id,
      data: {
        label,
        type,
        service,
      },
      position: { x: Math.random() * 400, y: Math.random() * 300 },
    });
    return id;
  }

  // Frontend
  if (services.frontend) {
    const id = addNode('Frontend', 'Frontend', services.frontend);
    serviceMap.frontend = id;
  }

  // Backend
  if (services.backend) {
    const id = addNode('Service', 'API Backend', services.backend);
    serviceMap.backend = id;
  }

  // Database
  if (services.database) {
    const id = addNode('Database', services.database.databases[0] || 'Database', services.database);
    serviceMap.database = id;
  }

  // Message Queue
  if (services.messageQueue) {
    const id = addNode('MessageQueue', services.messageQueue.name, services.messageQueue);
    serviceMap.messageQueue = id;
  }

  // Caches
  services.caches.forEach((cache, idx) => {
    const id = addNode('Cache', cache.name, cache);
    serviceMap[`cache-${idx}`] = id;
  });

  // Workers
  services.workers.forEach((worker, idx) => {
    const id = addNode('Worker', `${worker.name}`, worker);
    serviceMap[`worker-${idx}`] = id;
  });

  // Generate typical edges based on architecture pattern
  if (serviceMap.frontend && serviceMap.backend) {
    edges.push({
      source: serviceMap.frontend,
      target: serviceMap.backend,
      animated: true,
    });
  }

  if (serviceMap.backend && serviceMap.database) {
    edges.push({
      source: serviceMap.backend,
      target: serviceMap.database,
      animated: true,
    });
  }

  if (serviceMap.backend && serviceMap.messageQueue) {
    edges.push({
      source: serviceMap.backend,
      target: serviceMap.messageQueue,
      animated: true,
    });
  }

  // Connect caches to backend
  if (serviceMap.backend) {
    Object.keys(serviceMap)
      .filter(k => k.startsWith('cache-'))
      .forEach(cacheKey => {
        edges.push({
          source: serviceMap.backend,
          target: serviceMap[cacheKey],
          animated: true,
        });
      });
  }

  // Connect workers to message queue
  if (serviceMap.messageQueue) {
    Object.keys(serviceMap)
      .filter(k => k.startsWith('worker-'))
      .forEach(workerKey => {
        edges.push({
          source: serviceMap.messageQueue,
          target: serviceMap[workerKey],
          animated: true,
        });
      });
  }

  return { nodes, edges };
}

module.exports = {
  inferArchitectureFromRepo,
};
