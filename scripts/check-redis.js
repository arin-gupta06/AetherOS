#!/usr/bin/env node

/**
 * Redis Installation & Integration Verification Script
 * 
 * This script checks:
 * 1. Redis server installation
 * 2. Redis connection
 * 3. Node redis package
 * 4. AetherOS Redis integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(level, message) {
  const prefix = {
    '✅': colors.green,
    '❌': colors.red,
    '⚠️': colors.yellow,
    'ℹ️': colors.blue
  }[level];
  console.log(`${prefix}${level}${colors.reset} ${message}`);
}

function check(label, fn) {
  try {
    fn();
    log('✅', label);
    return true;
  } catch (err) {
    log('❌', `${label}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + colors.blue + '🚀 AetherOS Redis Integration Check' + colors.reset + '\n');

  let passed = 0;
  let failed = 0;

  // 1. Check Redis CLI Installation
  console.log(colors.blue + '1. Redis Server Installation' + colors.reset);
  if (check('redis-cli executable found', () => {
    try {
      execSync('redis-cli --version', { stdio: 'pipe' });
    } catch {
      throw new Error('redis-cli not found. Install Redis: see REDIS_SETUP_GUIDE.md');
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  // 2. Check Redis Connection
  console.log('\n' + colors.blue + '2. Redis Server Connection' + colors.reset);
  if (check('Redis server is running (PING)', () => {
    try {
      const result = execSync('redis-cli ping', { stdio: 'pipe' }).toString().trim();
      if (result !== 'PONG') {
        throw new Error(`Expected PONG, got ${result}`);
      }
    } catch {
      throw new Error('Redis server not responding. Start with: redis-server');
    }
  })) {
    passed++;
  } else {
    failed++;
    log('ℹ️', 'To start Redis: redis-server or docker run -d -p 6379:6379 redis:latest');
  }

  // 3. Check Node Dependencies
  console.log('\n' + colors.blue + '3. Node.js Redis Package' + colors.reset);
  
  const packageJsonPath = path.join(__dirname, '../../server/package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    if (check('redis package in dependencies', () => {
      if (!packageJson.dependencies || !packageJson.dependencies.redis) {
        throw new Error('redis package not in package.json');
      }
    })) {
      passed++;
    } else {
      failed++;
    }
  }

  // 4. Check Redis Service Module
  console.log('\n' + colors.blue + '4. AetherOS Redis Service' + colors.reset);
  const redisServicePath = path.join(__dirname, '../services/redisService.js');
  if (check('redisService.js exists', () => {
    if (!fs.existsSync(redisServicePath)) {
      throw new Error('redisService.js not found at ' + redisServicePath);
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  // 5. Check Server Index Integration
  console.log('\n' + colors.blue + '5. Server Integration' + colors.reset);
  const serverIndexPath = path.join(__dirname, '../index.js');
  const serverIndex = fs.readFileSync(serverIndexPath, 'utf-8');
  
  if (check('index.js imports Redis service', () => {
    if (!serverIndex.includes('initializeRedis')) {
      throw new Error('initializeRedis not imported in server index.js');
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  if (check('index.js initializes Redis', () => {
    if (!serverIndex.includes('await initializeRedis')) {
      throw new Error('Redis initialization not called in start()');
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  if (check('index.js closes Redis on shutdown', () => {
    if (!serverIndex.includes('closeRedis')) {
      throw new Error('Redis cleanup not called in shutdown()');
    }
  })) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log('\n' + colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log(colors.blue + '📊 Summary' + colors.reset);
  console.log(colors.blue + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  log('✅', `Passed: ${passed}`);
  log(failed > 0 ? '❌' : '✅', `Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n' + colors.green + '🎉 All checks passed! Redis is properly integrated.' + colors.reset);
    console.log('\n' + colors.blue + 'Next steps:' + colors.reset);
    console.log('  1. npm install (in server directory)');
    console.log('  2. npm run dev (in server directory)');
    console.log('  3. Check logs for "[Redis] Connected..."');
    console.log('\nDocumentation: docs/guides/REDIS_SETUP_GUIDE.md\n');
    process.exit(0);
  } else {
    console.log('\n' + colors.red + '⚠️  Some checks failed. See REDIS_SETUP_GUIDE.md for setup instructions.' + colors.reset);
    console.log('\n' + colors.yellow + 'Quick fix:' + colors.reset);
    console.log('  Windows: choco install redis');
    console.log('  macOS:   brew install redis && brew services start redis');
    console.log('  Linux:   sudo apt install redis-server && sudo service redis-server start');
    console.log('  Docker:  docker run -d -p 6379:6379 redis:latest\n');
    process.exit(1);
  }
}

main().catch(err => {
  log('❌', 'Unexpected error: ' + err.message);
  process.exit(1);
});
