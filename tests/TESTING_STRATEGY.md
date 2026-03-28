# AetherOS Comprehensive Testing Strategy

**Status**: Complete Testing Framework Specification  
**Date**: March 28, 2026  
**Version**: 1.0

---

## 📋 Testing Goals

1. **Robustness**: Handle edge cases, errors, and invalid inputs gracefully
2. **Scalability**: Verify performance with large datasets and concurrent operations
3. **Effectiveness**: Ensure features work as designed across all use cases
4. **Integrability**: Enable seamless feature additions without breaking existing code
5. **Maintainability**: Keep tests clear, reusable, and easy to extend
6. **Security**: Prevent vulnerabilities and unauthorized access

---

## 🏗️ Test Structure

```
tests/
├── unit/                    # Component & function isolation tests
│   ├── store/               # Zustand store unit tests
│   ├── services/            # Service layer tests
│   ├── components/          # React component tests
│   ├── utils/               # Utility function tests
│   └── hooks/               # Custom hook tests
│
├── integration/             # Feature interaction tests
│   ├── modules/             # CBCT, Azure, GitHub modules
│   ├── cache-system/        # Cache integration with prefetch
│   ├── view-transitions/    # Architecture ↔ CODE view switching
│   └── data-flow/           # End-to-end data transformations
│
├── e2e/                     # Full user workflows (Playwright/Cypress)
│   ├── architecture-flow/   # Create → Import → Simulate → Export
│   ├── cbct-integration/    # Double-click → CODE view → Metrics
│   ├── azure-workflow/      # Connect → Analyze → Deploy
│   ├── github-workflow/     # Repo → Infer → Annotate
│   └── error-recovery/      # Error scenarios & recovery
│
├── performance/             # Scalability & optimization
│   ├── cache-performance/   # Cache hit/miss timing
│   ├── render-performance/  # Component render optimization
│   ├── bundle-size/         # Code bundles & loading
│   ├── memory-usage/        # Memory leaks & cleanup
│   └── scaling/             # Performance with 1K/10K/100K nodes
│
├── security/                # Vulnerability & hardening tests
│   ├── input-validation/    # XSS, injection, path traversal
│   ├── auth-flow/           # Authentication security tests
│   ├── data-isolation/      # Cross-tenant/repo isolation
│   ├── api-security/        # Rate limiting, token validation
│   └── cache-safety/        # Cache key validation, TTL enforcement
│
├── stability/               # Long-running reliability
│   ├── memory-leaks/        # Graceful cleanup patterns
│   ├── websocket-stability/ # Connection resilience
│   ├── state-consistency/   # State coherence under load
│   └── error-recovery/      # Retry and backoff strategies
│
└── TESTING_STRATEGY.md      # This file
```

---

## 🎯 Test Coverage by Module

### **Store Tests** (`tests/unit/store/`)
```js
useStore.test.js
├─ State initialization
├─ Node operations (add, update, remove, bulk add)
├─ Edge operations (create, delete, animate)
├─ View mode transitions (ARCHITECTURE ↔ CODE)
├─ CBCT integration (enterCodeView, exitCodeView)
├─ Cache validity (cbctData, cbctActiveNodeId)
├─ Event tracking (all mutations push events)
└─ Persistence (data survives reload)
```

### **Service Tests** (`tests/unit/services/`)
```js
cache.test.js
├─ get() returns null for missing keys
├─ set() stores values with TTL
├─ TTL expiration works correctly
├─ has() checks existence accurately
├─ clear() removes entries
├─ clearAll() purges cache
├─ getStats() reports accurate metrics

prefetch.test.js
├─ queuePrefetch() is non-blocking
├─ Cache hits prevent re-analysis
├─ getPrefetchStatus() returns correct states
├─ Failure gracefully falls back
├─ Concurrent prefetches don't duplicate

cbctIntegration.test.js
├─ Transform CBCT data correctly
├─ Calculate complexity (0-1 range)
├─ Determine risk levels (low/med/high)
├─ Generate node indicators
├─ Create summary cards
└─ Enrich nodes with metadata
```

### **Component Tests** (`tests/unit/components/`)
```js
ModelingCanvas.test.js
├─ Render ReactFlow cleanly
├─ Double-click triggers enterCodeView()
├─ Node selection works
├─ Keyboard shortcuts (delete)
├─ Drag-drop node creation
├─ Context menu operations

CBCTWrapper.test.js
├─ Skip welcome when repoPath provided
├─ Auto-start analysis
├─ Show breadcrumbs correctly
├─ Handle loading states
├─ Apply data on exit
└─ Graceful error handling

Header.test.js
├─ Render navigation correctly
├─ Show environment selector
├─ Display connection status
└─ Theme toggle works

RightPanel.test.js
├─ Show node properties
├─ Edit metadata
├─ Display CBCT metrics
├─ Collapse/expand sections
└─ Responsive layout
```

### **Hook Tests** (`tests/unit/hooks/`)
```js
useWebSocket.test.js
├─ Connect to backend on mount
├─ Reconnect on failure
├─ Send events correctly
├─ Receive broadcast messages
├─ Clean up on unmount
└─ Handle stale connections
```

---

## 🔗 Integration Tests

### **CBCT Integration** (`tests/integration/modules/cbct.test.js`)
```js
describe('CBCT Module Integration', () => {
  // Test prefetch → cache → CODE view flow
  test('Prefetch queues, completes, and cache hits on CODE view')
  
  // Test data transformation
  test('CBCT data transforms to node metadata correctly')
  
  // Test metrics enrichment
  test('Exiting CODE view enriches nodes with metrics')
  
  // Test error recovery
  test('Failed CBCT analysis shows error but doesn\'t crash')
})
```

### **View Transitions** (`tests/integration/view-transitions/`)
```js
describe('Architecture ↔ CODE View Transitions', () => {
  test('Double-click node → CODE view loads CBCT')
  test('Back button → returns to ARCHITECTURE with metrics')
  test('Multiple transitions maintain consistency')
  test('Rapid clicks don\'t cause race conditions')
})
```

### **Data Flow** (`tests/integration/data-flow/`)
```js
describe('End-to-End Data Flows', () => {
  test('Import GitHub → Infer → Prefetch → Display → CODE view')
  test('Azure integration → Analyze → Apply recommendations')
  test('Simulation → Inject failure → Show affected code')
})
```

---

## 🚀 E2E Tests (Playwright/Cypress)

### **Architecture Workflow** (`tests/e2e/architecture-flow/`)
```js
test('Create architecture from scratch', async ({ page }) => {
  // 1. Load app
  // 2. Create environment
  // 3. Add nodes via drag
  // 4. Connect edges
  // 5. Save & verify persistence
})

test('Import from GitHub', async ({ page }) => {
  // 1. Click "Analyze Repository"
  // 2. Enter repo URL
  // 3. Wait for inference
  // 4. Verify nodes created
  // 5. Check metrics
})

test('Run simulation', async ({ page }) => {
  // 1. Select node
  // 2. Click "Inject Failure"
  // 3. Watch cascade
  // 4. Verify affected nodes
  // 5. Rollback simulation
})
```

### **CBCT Integration Workflow** (`tests/e2e/cbct-integration/`)
```js
test('Double-click node → CODE view → Back to Architecture', async ({ page }) => {
  // 1. Have architecture loaded
  // 2. Double-click a node
  // 3. Wait for CODE view
  // 4. Verify no welcome screen
  // 5. Verify CBCT graph loaded
  // 6. Click back button
  // 7. Verify metrics on nodes
  // 8. Verify smooth transition
})

test('CODE view instant load from cache', async ({ page }) => {
  // 1. Double-click (wait for prefetch)
  // 2. Double-click same node again
  // 3. Measure load time < 50ms
  // 4. Verify cache hit
})
```

### **Error Recovery** (`tests/e2e/error-recovery/`)
```js
test('Graceful degradation on backend down', async ({ page }) => {
  // 1. Stop backend server
  // 2. Verify UI still works (offline mode)
  // 3. Show connection error
  // 4. Auto-reconnect when backend returns
})

test('CBCT analysis failure recovery', async ({ page }) => {
  // 1. Mock CBCT analysis error
  // 2. Trigger CODE view
  // 3. See error message
  // 4. Can retry
  // 5. Can still use ARCHITECTURE view
})
```

---

## ⚡ Performance Tests

### **Cache Performance** (`tests/performance/cache-performance/`)
```js
test('Cache hit returns in <10ms', () => {
  // Warm cache with data
  // Measure single get()
  // Assert < 10ms
})

test('Cache handles 100 entries without slowdown', () => {
  // Add 100 repos to cache
  // Get each 10 times
  // Measure steady performance
})

test('TTL cleanup prevents memory bloat', () => {
  // Add entries with 1ms TTL
  // Wait for expiry
  // Check memory didn't grow
})
```

### **Render Performance** (`tests/performance/render-performance/`)
```js
test('ModelingCanvas renders 1000 nodes in <2s', () => {
  // Create 1000 nodes
  // Measure render time
  // Check for frame drops
  // Verify 60 FPS maintained
})

test('Switching views <300ms', () => {
  // Measure ARCHITECTURE → CODE transition
  // Measure CODE → ARCHITECTURE
  // Assert < 300ms each
})
```

### **Bundle Size** (`tests/performance/bundle-size/`)
```js
test('Main bundle < 500KB gzipped', () => {
  // Build production bundle
  // Measure size before gzip
  // Assert < 500KB
})

test('Module imports are efficient', () => {
  // Watch dynamic imports
  // Verify lazy loading works
  // Check split chunks
})
```

### **Memory Usage** (`tests/performance/memory-usage/`)
```js
test('No memory leaks after 100 view transitions', () => {
  // Take initial heap snapshot
  // Do 100 ARCH → CODE → ARCH cycles
  // Check heap didn't grow
  // Verify cleanup on unmount
})

test('Cache auto-cleanup releases memory', () => {
  // Fill cache with 1000 entries
  // Wait for TTL expiry
  // Check memory freed
})
```

### **Scaling** (`tests/performance/scaling/`)
```js
test('Operations remain responsive with 10K nodes', () => {
  // Load 10K nodes
  // Measure select node time
  // Measure add edge time
  // Measure filter performance
  // Assert all < 100ms
})

test('Prefetch queue handles 100 concurrent repos', () => {
  // Queue 100 prefetch requests
  // Verify non-blocking
  // Check proper queuing
  // Verify cache consistency
})
```

---

## 🔐 Security Tests

### **Input Validation** (`tests/security/input-validation/`)
```js
test('XSS prevention in node labels', () => {
  // Create node with `<script>alert('xss')</script>`
  // Verify HTML escaped
  // Verify script not executed
})

test('Path traversal prevention in repoPath', () => {
  // Try `../../../etc/passwd`
  // Verify normalized/rejected
  // Check no file access
})

test('SQL injection prevention', () => {
  // Use `'); DROP TABLE nodes; --`
  // Verify treated as string
  // Verify DB intact
})

test('Cache key injection prevention', () => {
  // Try `cbct:analysis:../keys`
  // Verify key normalized
  // Verify isolation maintained
})
```

### **Auth Flow** (`tests/security/auth-flow/`)
```js
test('Tokens expire correctly', () => {
  // Create JWT
  // Wait for expiry
  // Verify rejected
  // Force re-auth
})

test('Rate limiting prevents brute force', () => {
  // Send 100 requests in 1s
  // Verify 429 after limit
  // Verify backoff works
})

test('CORS headers enforced', () => {
  // Cross-origin request from untrusted domain
  // Verify blocked
  // Same-origin works
})
```

### **Data Isolation** (`tests/security/data-isolation/`)
```js
test('Repos isolated by cache key', () => {
  // Cache CBCT data for repo A
  // Access via repo B cache key
  // Verify failure (not confused)
})

test('User sessions don\'t leak data', () => {
  // User A loads repo
  // User B connects
  // Verify User B doesn't see User A's data
})

test('Multi-tenant cache safety', () => {
  // Multiple users access cache
  // Verify key collision prevention
  // Verify TTL per user respected
})
```

### **API Security** (`tests/security/api-security/`)
```js
test('Authorization header required', () => {
  // POST without token
  // Verify 401
  // POST with token
  // Verify success
})

test('Rate limiting per IP', () => {
  // 100 requests from same IP in 1s
  // Verify throttled after limit
  // Different IP not affected
})

test('HTTPS enforced in production', () => {
  // In production env
  // HTTP request redirects to HTTPS
  // Verify no data loss
})
```

### **Cache Safety** (`tests/security/cache-safety/`)
```js
test('TTL prevents stale data attacks', () => {
  // Cache sensitive data
  // TTL expires
  // Old data inaccessible
})

test('Cache key format validation', () => {
  // Try invalid characters
  // Verify rejected
  // Valid format accepted
})

test('Cache size limits prevent DoS', () => {
  // Try to fill cache beyond max
  // Oldest entries evicted
  // Memory bounded
})
```

---

## 🔧 Stability Tests

### **Memory Leaks** (`tests/stability/memory-leaks/`)
```js
test('No leaks after 1000 imports', () => {
  // Track memory baseline
  // Import 1000 repos sequentially
  // Force gc
  // Baseline memory restored
})

test('Event listeners cleaned up on unmount', () => {
  // Mount/unmount component 100x
  // Check listener count didn't accumulate
})

test('WebSocket cleanup on disconnect', () => {
  // Connect/disconnect 50 times
  // Check no lingering listeners
  // Memory stable
})
```

### **WebSocket Stability** (`tests/stability/websocket-stability/`)
```js
test('Auto-reconnect after connection loss', () => {
  // Connected
  // Network down
  // Verify retry loop
  // Network up
  // Verify reconnected
  // No data loss
})

test('Handles message queue during reconnect', () => {
  // Disconnect
  // Queue 50 messages
  // Reconnect
  // All messages sent
  // Verify order
})

test('Graceful handling of malformed messages', () => {
  // Receive garbage data
  // Don't crash
  // Log error
  // Continue processing next message
})
```

### **State Consistency** (`tests/stability/state-consistency/`)
```js
test('Store state consistent under rapid mutations', () => {
  // Fire 1000 mutations simultaneously
  // Verify state coherent
  // All mutations applied
  // No duplicates/losses
})

test('Undo/redo consistency', () => {
  // Add node, edge, delete edge
  // Undo 3x to initial state
  // Redo 3x back
  // State identical
})
```

### **Error Recovery** (`tests/stability/error-recovery/`)
```js
test('Exponential backoff on repeated failures', () => {
  // Prefetch fails
  // Verify retry after 1s
  // Fails again
  // Verify retry after 2s
  // Verify backoff curve
})

test('Circuit breaker pattern for failing services', () => {
  // Service X fails 5 times
  // Circuit opens (fast-fail)
  // After timeout, half-open
  // If success, circuit closes
})
```

---

## 📊 Test Metrics

### **Coverage Thresholds**
```
Statements:  ≥ 80%
Branches:    ≥ 75%
Functions:   ≥ 80%
Lines:       ≥ 80%
```

### **Speed Benchmarks**
```
Unit tests:        < 5 sec (all)
Integration tests: < 30 sec (all)
E2E tests:         < 2 min (all)
Performance tests: pass/fail (no timeout)
Security tests:    < 30 sec (all)
```

### **Critical User Flows**
```
Double-click → CODE view:      < 500ms (first), < 50ms (cache)
Cache hit:                     < 10ms
Node creation:                 < 50ms
View transition:               < 300ms
Prefetch (background):         < 2 sec NB
```

---

## 🔄 CI/CD Integration

### **GitHub Actions Pipeline**
```yaml
on: [push, pull_request]

jobs:
  test:
    - Lint (ESLint)
    - Unit tests + coverage
    - Integration tests
    - E2E tests subset
    - Security scan
    - Bundle size check
    
  performance:
    - Lighthouse audit
    - Bundle analysis
    - Memory profiling
    
  security:
    - SAST scan
    - Dependency audit
    - Input validation check
```

---

## ✅ Testing Checklist (Before Release)

**Unit Tests**
- [ ] All store mutations have tests
- [ ] All services have tests
- [ ] All components have render tests
- [ ] Coverage > 80%

**Integration Tests**
- [ ] Module interactions tested
- [ ] Data flows verified
- [ ] Cache integration works
- [ ] View transitions smooth

**E2E Tests**
- [ ] Critical user flows work
- [ ] Error scenarios handled
- [ ] Recovery mechanisms work
- [ ] Performance acceptable

**Performance Tests**
- [ ] Cache < 10ms hits
- [ ] Renders < 300ms
- [ ] Bundle < 500KB
- [ ] No memory leaks

**Security Tests**
- [ ] Input validation works
- [ ] Auth enforced
- [ ] Data isolated
- [ ] No XSS/injection

**Stability Tests**
- [ ] No memory leaks (1000 ops)
- [ ] WebSocket reconnects
- [ ] State stays consistent
- [ ] Errors recover

---

## 🚀 Running Tests

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires server)
npm run test:e2e

# Performance profiling
npm run test:performance

# Security scan
npm run test:security

# Full test suite
npm run test:full

# With coverage report
npm run test:coverage

# Watch mode (development)
npm run test:watch
```

---

## 📈 Continuous Improvement

**Quarterly Review**:
- Update performance baselines
- Add tests for new features
- Retire outdated tests
- Analyze failure patterns
- Adjust coverage targets

**Feedback Loop**:
- Monitor CI failures
- Track flaky tests
- Investigate timeouts
- Improve test clarity
- Refactor slow tests

---

## 📚 Test Patterns & Examples

See individual test files for:
- Mock strategies
- Test data factories
- Fixture definitions
- Assertion helpers
- Performance measurements

---

**Status**: ✅ Comprehensive testing framework specified  
**Next**: Implement test files and CI/CD pipeline integration

