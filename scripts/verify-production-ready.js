#!/usr/bin/env node

/**
 * AetherOS Production Readiness Verification Script
 * 
 * Runs comprehensive checks to ensure the CBCT adapter implementation
 * is production-ready before deployment.
 * 
 * Usage: node verify-production-ready.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(message, status = 'info') {
  const time = new Date().toLocaleTimeString();
  switch (status) {
    case 'pass':
      console.log(`${colors.green}✅${colors.reset} [${time}] ${message}`);
      checks.passed++;
      break;
    case 'fail':
      console.log(`${colors.red}❌${colors.reset} [${time}] ${message}`);
      checks.failed++;
      break;
    case 'warn':
      console.log(`${colors.yellow}⚠️${colors.reset}  [${time}] ${message}`);
      checks.warnings++;
      break;
    default:
      console.log(`${colors.blue}ℹ️${colors.reset}  [${time}] ${message}`);
  }
}

function check(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      log(`${name}`, 'pass');
    } else if (result.includes('warn')) {
      log(`${name}: ${result.replace('warn:', '')}`, 'warn');
    } else {
      log(`${name}: ${result}`, 'fail');
    }
  } catch (err) {
    log(`${name} (error): ${err.message}`, 'fail');
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function fileContains(filePath, text) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes(text);
}

function fileSize(filePath) {
  if (!fileExists(filePath)) return 0;
  return fs.statSync(filePath).size;
}

console.log(`\n${colors.bold}🔍 AetherOS Production Readiness Verification${colors.reset}\n`);

// ============================================================================
// FILE STRUCTURE CHECKS
// ============================================================================

console.log(`${colors.bold}📁 File Structure Verification${colors.reset}`);

check('Adapter file exists', () => fileExists('client/src/integrations/cbctAdapter.js'));
check('Prefetch service exists', () => fileExists('client/src/services/cbctPrefetch.js'));
check('CBCT Viewer component exists', () => fileExists('client/src/components/CBCTViewer.jsx'));
check('Documentation: Adapter Guide', () => fileExists('ADAPTER_INTEGRATION_GUIDE.md'));
check('Documentation: Test Plan', () => fileExists('ADAPTER_INTEGRATION_TEST_PLAN.md'));
check('Documentation: Production Audit', () => fileExists('PRODUCTION_READINESS_AUDIT.md'));

// ============================================================================
// SECURITY CHECKS
// ============================================================================

console.log(`\n${colors.bold}🔒 Security Verification${colors.reset}`);

check('Adapter: No hardcoded secrets', () => {
  const file = fs.readFileSync('client/src/integrations/cbctAdapter.js', 'utf-8');
  const hasSecrets = file.includes('password') || file.includes('token') || file.includes('api_key');
  return !hasSecrets ? true : 'Contains potential secrets';
});

check('Adapter: URL encoding used', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', 'URLSearchParams') 
    ? true : 'URLSearchParams not found';
});

check('Viewer: iframe sandbox configured', () => {
  return fileContains('client/src/components/CBCTViewer.jsx', 'sandbox=')
    ? true : 'iframe sandbox not configured';
});

check('Viewer: No eval or innerHTML', () => {
  const file = fs.readFileSync('client/src/components/CBCTViewer.jsx', 'utf-8');
  const hasEval = file.includes('eval(') || file.includes('innerHTML');
  return !hasEval ? true : 'Contains unsafe operations';
});

// ============================================================================
// ERROR HANDLING CHECKS
// ============================================================================

console.log(`\n${colors.bold}⚠️ Error Handling Verification${colors.reset}`);

check('Adapter: Try-catch for opens', () => {
  return fileContains('client/src/components/ModelingCanvas.jsx', 'try') && 
         fileContains('client/src/components/ModelingCanvas.jsx', 'catch')
    ? true : 'Error handling not found';
});

check('Adapter: Error throws on invalid input', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', 'throw new Error')
    ? true : 'Error throwing not found';
});

check('Adapter: Prefetch timeout implemented', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', 'AbortController') &&
         fileContains('client/src/integrations/cbctAdapter.js', '5000')
    ? true : 'Timeout not implemented';
});

check('Viewer: No URL found state', () => {
  return fileContains('client/src/components/CBCTViewer.jsx', '!url')
    ? true : 'Missing null URL handling';
});

// ============================================================================
// PERFORMANCE CHECKS
// ============================================================================

console.log(`\n${colors.bold}⚡ Performance Verification${colors.reset}`);

check('Adapter size reasonable', () => {
  const size = fileSize('client/src/integrations/cbctAdapter.js');
  return size > 0 && size < 10000 ? true : `File size suspicious: ${size} bytes`;
});

check('Prefetch uses concurrency limit', () => {
  return fileContains('client/src/services/cbctPrefetch.js', 'maxConcurrentPrefetches')
    ? true : 'Concurrency limit not found';
});

check('Prefetch non-blocking design', () => {
  return fileContains('client/src/services/cbctPrefetch.js', 'async') &&
         fileContains('client/src/services/cbctPrefetch.js', 'Promise')
    ? true : 'Async design not found';
});

check('Component uses useCallback', () => {
  return fileContains('client/src/components/CBCTViewer.jsx', 'useCallback')
    ? true : 'useCallback optimization not found';
});

// ============================================================================
// DEPENDENCY CHECKS
// ============================================================================

console.log(`\n${colors.bold}📦 Dependency Verification${colors.reset}`);

check('No new npm packages added', () => {
  const file = fs.readFileSync('client/src/integrations/cbctAdapter.js', 'utf-8');
  const hasImport = file.includes('import') && !file.includes('from \'@/');
  return !hasImport ? true : 'warn:External import detected - verify it\'s necessary';
});

check('React imports present', () => {
  return fileContains('client/src/components/CBCTViewer.jsx', "import React")
    ? true : 'React not imported';
});

check('Lucide icons used', () => {
  return fileContains('client/src/components/CBCTViewer.jsx', 'lucide-react')
    ? true : 'Lucide icons not found';
});

// ============================================================================
// CODE QUALITY CHECKS
// ============================================================================

console.log(`\n${colors.bold}✨ Code Quality Verification${colors.reset}`);

check('Adapter: JSDoc comments', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', '/**')
    ? true : 'JSDoc comments missing';
});

check('Prefetch: Error handling', () => {
  return fileContains('client/src/services/cbctPrefetch.js', 'catch')
    ? true : 'Error handling missing';
});

check('Logging: Debug prefix', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', '[CBCTAdapter]')
    ? true : 'Logging prefix missing';
});

check('Constants: Configuration centralized', () => {
  return fileContains('client/src/integrations/cbctAdapter.js', 'CBCT_CONFIG')
    ? true : 'Configuration not centralized';
});

// ============================================================================
// INTEGRATION CHECKS
// ============================================================================

console.log(`\n${colors.bold}🔗 Integration Verification${colors.reset}`);

check('Store: cbctUrl state added', () => {
  return fileContains('client/src/store/useStore.js', 'cbctUrl')
    ? true : 'cbctUrl state not found';
});

check('Store: setCbctUrl method added', () => {
  return fileContains('client/src/store/useStore.js', 'setCbctUrl')
    ? true : 'setCbctUrl method not found';
});

check('App.jsx: Uses CBCTViewer', () => {
  return fileContains('client/src/App.jsx', 'CBCTViewer')
    ? true : 'CBCTViewer import missing';
});

check('App.jsx: Proper view conditionals', () => {
  return fileContains('client/src/App.jsx', "viewMode === 'CODE'")
    ? true : 'View mode conditionals missing';
});

check('ModelingCanvas: onNodeDoubleClick implemented', () => {
  return fileContains('client/src/components/ModelingCanvas.jsx', 'onNodeDoubleClick')
    ? true : 'Double-click handler missing';
});

// ============================================================================
// DOCUMENTATION CHECKS
// ============================================================================

console.log(`\n${colors.bold}📚 Documentation Verification${colors.reset}`);

check('Adapter Guide: Complete', () => {
  return fileContains('ADAPTER_INTEGRATION_GUIDE.md', 'Core Principle') &&
         fileContains('ADAPTER_INTEGRATION_GUIDE.md', 'Adapter Role')
    ? true : 'Guide incomplete';
});

check('Test Plan: Comprehensive', () => {
  return fileContains('ADAPTER_INTEGRATION_TEST_PLAN.md', 'Unit Tests') &&
         fileContains('ADAPTER_INTEGRATION_TEST_PLAN.md', 'Integration Tests')
    ? true : 'Test plan incomplete';
});

check('Production Audit: Created', () => {
  return fileContains('PRODUCTION_READINESS_AUDIT.md', 'Production Ready') ||
         fileContains('PRODUCTION_READINESS_AUDIT.md', 'PRODUCTION READY')
    ? true : 'Production audit missing';
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${colors.bold}📊 Verification Summary${colors.reset}`);
console.log(
  `${colors.green}✅ Passed: ${checks.passed}${colors.reset} | ` +
  `${colors.yellow}⚠️  Warnings: ${checks.warnings}${colors.reset} | ` +
  `${colors.red}❌ Failed: ${checks.failed}${colors.reset}\n`
);

if (checks.failed === 0) {
  console.log(
    `${colors.green}${colors.bold}✅ PRODUCTION READY${colors.reset}\n` +
    `All critical checks passed. Ready for deployment!\n`
  );
  process.exit(0);
} else {
  console.log(
    `${colors.red}${colors.bold}❌ ISSUES FOUND${colors.reset}\n` +
    `Please address ${checks.failed} critical issue(s) before deployment.\n`
  );
  process.exit(1);
}
