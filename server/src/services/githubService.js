/**
 * GitHub Repository Analysis Service
 * Analyzes GitHub repositories to infer architecture and dependencies
 */

const { Octokit } = require('octokit');

// Initialize GitHub client
function getGitHubClient() {
  if (!process.env.GITHUB_TOKEN) {
    console.warn('[GitHub] GITHUB_TOKEN not set - public API rate limits will apply');
    return new Octokit();
  }

  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
}

/**
 * Analyze a GitHub repository for architecture insights
 * @param {string} repositoryUrl - GitHub repository URL
 * @returns {Promise<Object>} Repository analysis
 */
async function analyzeRepository(repositoryUrl) {
  const octokit = getGitHubClient();

  try {
    const { owner, repo } = parseGitHubUrl(repositoryUrl);

    // Fetch repository metadata
    const repoData = await octokit.rest.repos.get({ owner, repo });

    // Fetch repository structure
    const structure = await getRepositoryStructure(octokit, owner, repo);

    // Analyze key files
    const keyFiles = await analyzeKeyFiles(octokit, owner, repo);

    // Infer technology stack
    const stack = inferTechnologyStack(structure, keyFiles);

    // Analyze dependencies
    const dependencies = await analyzeDependencies(octokit, owner, repo, keyFiles);

    return {
      status: 'success',
      repository: {
        name: repoData.data.name,
        url: repoData.data.html_url,
        description: repoData.data.description,
        stars: repoData.data.stargazers_count,
        language: repoData.data.language,
        topics: repoData.data.topics || [],
      },
      analysis: {
        structure,
        stack,
        dependencies,
        keyFiles,
        insights: generateInsights(stack, dependencies),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GitHub] Analysis error:', error.message);
    return {
      status: 'error',
      message: error.message,
      repository: null,
    };
  }
}

/**
 * Get repository directory structure
 */
async function getRepositoryStructure(octokit, owner, repo, path = '', depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path || undefined,
    });

    const items = Array.isArray(response.data) ? response.data : [response.data];

    const structure = [];
    for (const item of items) {
      // Skip hidden files and common exclusions
      if (item.name.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage'].includes(item.name)) {
        continue;
      }

      if (item.type === 'file') {
        structure.push({
          type: 'file',
          name: item.name,
          path: item.path,
          size: item.size,
        });
      } else if (item.type === 'dir' && depth < maxDepth) {
        const subItems = await getRepositoryStructure(octokit, owner, repo, item.path, depth + 1, maxDepth);
        structure.push({
          type: 'dir',
          name: item.name,
          path: item.path,
          children: subItems,
        });
      }
    }

    return structure;
  } catch (error) {
    console.error(`[GitHub] Structure fetch error for ${path}:`, error.message);
    return [];
  }
}

/**
 * Analyze key files (package.json, Dockerfile, docker-compose.yml, etc.)
 */
async function analyzeKeyFiles(octokit, owner, repo) {
  const keyFiles = {};
  const filesToCheck = ['package.json', 'Dockerfile', 'docker-compose.yml', 'requirements.txt', 'go.mod', 'pom.xml'];

  for (const fileName of filesToCheck) {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: fileName,
      });

      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      keyFiles[fileName] = {
        exists: true,
        content: content.substring(0, 2000), // Limit to 2000 chars
        path: response.data.path,
      };
    } catch (_error) {
      keyFiles[fileName] = { exists: false };
    }
  }

  return keyFiles;
}

/**
 * Infer technology stack from repository
 */
function inferTechnologyStack(structure, keyFiles) {
  const stack = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
  };

  // Analyze file extensions in structure
  const fileExtensions = getFileExtensions(structure);

  if (fileExtensions.includes('.js') || fileExtensions.includes('.jsx') || fileExtensions.includes('.ts') || fileExtensions.includes('.tsx')) {
    stack.languages.push('JavaScript/TypeScript');
  }
  if (fileExtensions.includes('.py')) {
    stack.languages.push('Python');
  }
  if (fileExtensions.includes('.go')) {
    stack.languages.push('Go');
  }
  if (fileExtensions.includes('.java')) {
    stack.languages.push('Java');
  }
  if (fileExtensions.includes('.cs')) {
    stack.languages.push('C#/.NET');
  }

  // Check key files
  if (keyFiles.package?.json?.exists) {
    stack.tools.push('npm/Node.js');
    try {
      const pkg = JSON.parse(keyFiles['package.json'].content);
      // Detect framework
      if (pkg.dependencies?.react || pkg.devDependencies?.react) {
        stack.frameworks.push('React');
      }
      if (pkg.dependencies?.express || pkg.devDependencies?.express) {
        stack.frameworks.push('Express');
      }
      if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
        stack.frameworks.push('Vue');
      }
      if (pkg.dependencies?.['@nestjs/core']) {
        stack.frameworks.push('NestJS');
      }
      if (pkg.dependencies?.mongodb || pkg.dependencies?.mongoose) {
        stack.databases.push('MongoDB');
      }
      if (pkg.dependencies?.pg || pkg.dependencies?.['pg-promise']) {
        stack.databases.push('PostgreSQL');
      }
    } catch (_e) {
      // Parsing error, continue
    }
  }

  if (keyFiles['Dockerfile']?.exists) {
    stack.tools.push('Docker');
  }

  if (keyFiles['docker-compose.yml']?.exists) {
    stack.tools.push('Docker Compose');
  }

  return stack;
}

/**
 * Analyze package dependencies
 */
async function analyzeDependencies(octokit, owner, repo, keyFiles) {
  const dependencies = {
    production: [],
    development: [],
    containers: [],
  };

  if (keyFiles['package.json']?.exists) {
    try {
      const pkg = JSON.parse(keyFiles['package.json'].content);
      dependencies.production = Object.keys(pkg.dependencies || {}).slice(0, 10);
      dependencies.development = Object.keys(pkg.devDependencies || {}).slice(0, 5);
    } catch (_e) {
      // Parsing error
    }
  }

  if (keyFiles['docker-compose.yml']?.exists) {
    try {
      const composeLine = keyFiles['docker-compose.yml'].content.split('\n');
      const services = composeLine.filter(line => line.includes('image:'));
      dependencies.containers = services.slice(0, 5);
    } catch (_e) {
      // Parsing error
    }
  }

  return dependencies;
}

/**
 * Generate architecture insights from analysis
 */
function generateInsights(stack, dependencies) {
  const insights = [];

  if (stack.languages.length > 0) {
    insights.push(`Uses ${stack.languages.join(', ')}`);
  }

  if (stack.frameworks.length > 0) {
    insights.push(`Built with ${stack.frameworks.join(', ')}`);
  }

  if (stack.databases.length > 0) {
    insights.push(`Data storage: ${stack.databases.join(', ')}`);
  }

  if (dependencies.containers.length > 0) {
    insights.push(`Containerized services detected`);
  }

  if (stack.tools.includes('Docker')) {
    insights.push(`Cloud-ready with container support`);
  }

  return insights;
}

/**
 * Get file extensions from directory structure
 */
function getFileExtensions(structure, extensions = new Set()) {
  for (const item of structure) {
    if (item.type === 'file') {
      const match = item.name.match(/\.[^.]+$/);
      if (match) {
        extensions.add(match[0]);
      }
    } else if (item.children) {
      getFileExtensions(item.children, extensions);
    }
  }
  return Array.from(extensions);
}

/**
 * Parse GitHub URL
 */
function parseGitHubUrl(url) {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^/]+)\/([^/.]+)(\.git)?$/,
    /github\.com\/([^/]+)\/([^/.]+)\/?$/,
    /https:\/\/github\.com\/([^/]+)\/([^/.]+)/,
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

  throw new Error('Invalid GitHub URL format');
}

module.exports = {
  analyzeRepository,
};
