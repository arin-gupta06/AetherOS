# AetherOS Testing Framework

Complete testing implementation following the TESTING_STRATEGY.md specification.

## Test Structure

```
tests/
├── setup.js                    # Shared test utilities and fixtures
├── unit/                       # Unit tests for individual modules
│   ├── services/
│   │   └── cache.test.js      # Cache service tests (100+ assertions)
│   └── store/
│       └── useStore.test.js   # Zustand store tests (state consistency)
├── integration/                # Integration tests for module interactions
│   └── modules/
│       └── cbct.test.js       # CBCT prefetch → cache → CODE view flow
├── e2e/                        # End-to-end user flow tests
│   └── critical-flows.spec.js # Playwright tests for real user workflows
├── performance/                # Performance benchmark tests
│   └── benchmarks.test.js     # Cache, render, memory, network benchmarks
├── security/                   # Security vulnerability tests
│   └── security.test.js       # XSS, injection, auth, CSRF, CSP tests
└── stability/                  # Resilience and edge case tests
    └── stability.test.js      # Memory leaks, reconnection, state sync tests
```

## Quick Start

### Install Dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### Run All Tests

```bash
npm run test:full
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires running app)
npm run test:e2e

# Performance benchmarks
npm run test:performance

# Security tests
npm run test:security

# Stability tests (edit tests/stability/stability.test.js commands)
npm run test:stability
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

This generates:
- Terminal report
- HTML report at `coverage/index.html`
- LCOV report for CI/CD integration

## Test Categories

### 1. Unit Tests (60+ test cases)

**Cache Service** (`tests/unit/services/cache.test.js`)
- ✅ Store and retrieve values
- ✅ TTL and expiration management
- ✅ Large object handling
- ✅ Performance <10ms for cache hits
- ✅ Handle 1000+ entries efficiently
- ✅ Thread-safe concurrent operations
- ✅ Cache key builders

**Zustand Store** (`tests/unit/store/useStore.test.js`)
- ✅ Node add/update/remove operations
- ✅ Edge creation and bulk operations
- ✅ CBCT integration and CODE view transitions
- ✅ State consistency under rapid mutations
- ✅ Event logging with metadata
- ✅ 100 rapid mutations without corruption
- ✅ Orphaned edge cleanup

**Coverage Target**: ≥80% statements/lines/functions/branches

### 2. Integration Tests (30+ test cases)

**CBCT Module** (`tests/integration/modules/cbct.test.js`)
- ✅ Prefetch → cache → CODE view data flow
- ✅ CBCT data transformation to node metadata
- ✅ Complexity calculation (0-1 range)
- ✅ Risk level determination
- ✅ Node enrichment with code metrics
- ✅ Error handling for missing data
- ✅ Large graph handling (100+ nodes)
- ✅ Multi-repo cache without collision
- ✅ View transition state consistency

**Performance**: <100ms for graph transformation, <10ms for cache hits

### 3. E2E Tests (30+ test cases)

**Critical User Flows** (`tests/e2e/critical-flows.spec.js`)
- ✅ Import repo from GitHub
- ✅ Display architecture with metadata
- ✅ Render edges between nodes
- ✅ Enter CODE view on double-click (<1 second)
- ✅ Display code files in file tree
- ✅ Exit CODE view back to ARCHITECTURE
- ✅ Cache CODE view for instant reload
- ✅ Export graph to JSON/SVG/Terraform
- ✅ Analyze GitHub repository structure
- ✅ Display GitHub metrics (stars, forks, issues)
- ✅ Load initial view in <3 seconds
- ✅ Handle invalid inputs with error messages
- ✅ Recover from API failures
- ✅ Keyboard navigation and accessibility

**Timing Requirements**:
- Initial load: <3 seconds
- View transition: <300ms
- CODE view load: <1 second (from cache)
- Large graph (1000+ nodes): responsive <500ms

### 4. Performance Tests (15+ benchmarks)

**Cache Operations** (`tests/performance/benchmarks.test.js`)
- ✅ Cache hit <10ms threshold (avg <5ms, max <10ms)
- ✅ 1000 set operations in <100ms
- ✅ View render <300ms
- ✅ Memory growth <50MB for 10,000 operations
- ✅ Bundle size <500KB
- ✅ GitHub API fetch <5 seconds
- ✅ Background prefetch <2 seconds
- ✅ 100 concurrent cache operations <50ms
- ✅ Cache cleanup smooth <50ms

### 5. Security Tests (30+ scenarios)

**Input & XSS Protection** (`tests/security/security.test.js`)
- ✅ HTML escape in node labels
- ✅ Script injection prevention
- ✅ NoSQL injection prevention
- ✅ API input validation
- ✅ CSRF token validation
- ✅ Token exposure in logs

**Authentication & Authorization**
- ✅ GitHub token validation
- ✅ User permission checking
- ✅ Unauthorized data modification prevention

**Data Protection**
- ✅ User data isolation in cache
- ✅ Cross-user data leakage prevention
- ✅ Secrets not stored in client
- ✅ Secure storage usage

**Network & API**
- ✅ HTTPS enforcement
- ✅ API response schema validation
- ✅ Rate limiting (10 requests per minute)

**CSP & Dependencies**
- ✅ Content Security Policy headers
- ✅ Inline script blocking
- ✅ No CRITICAL vulnerabilities

### 6. Stability Tests (25+ scenarios)

**Memory Management** (`tests/stability/stability.test.js`)
- ✅ No memory leaks after 1000 operations
- ✅ Listener cleanup on unmount
- ✅ Cache entry expiration
- ✅ Cache memory cleanup

**Error Resilience**
- ✅ Undefined node handling
- ✅ Failed cache operation recovery
- ✅ Malformed JSON parsing
- ✅ API request retry (exponential backoff)
- ✅ Cached data fallback on API failure

**WebSocket Resilience**
- ✅ Automatic reconnection
- ✅ Message queuing during disconnect
- ✅ Flush queued messages on reconnect
- ✅ Out-of-order message handling

**State Consistency**
- ✅ Local ↔ server state sync
- ✅ Conflict resolution (server authority)
- ✅ Transaction rollback on error

**Resource Limits**
- ✅ Large file handling (graceful rejection)
- ✅ Timeout for long-running operations
- ✅ Graceful degradation under load

## Running Tests in CI/CD

```bash
# Full test suite with coverage
npm run test:full && npm run test:coverage

# E2E tests (requires running app first)
npm run dev &
sleep 5  # Wait for app startup
npm run test:e2e
```

## Test Configuration

### Vitest Config (`vitest.config.js`)

```javascript
- Environment: Node.js
- Coverage: v8 provider (80% thresholds)
- Timeout: 10 seconds
- Concurrency: 4 threads
- Reporters: verbose, json
- Mock reset: true (isolate tests)
```

### Playwright Config

Tests run against live app at `http://localhost:5173/`

### Mock Utilities (`tests/setup.js`)

- `createMockNode()` - Node factory with defaults
- `createMockEdge()` - Edge factory
- `createMockCBCTData()` - CBCT graph data
- `mockGitHubInferenceResponse` - GitHub API mock
- `mockAzureRecommendations` - Azure API mock
- `createTestArchitecture()` - Full architecture fixture
- `measurePerformance()` - Timing measurements
- `waitForCondition()` - Async polling helper

## Coverage Requirements

All tests must meet or exceed:
- **Statements**: ≥80%
- **Lines**: ≥80%
- **Functions**: ≥80%
- **Branches**: ≥75%

Generate coverage report:
```bash
npm run test:coverage
# Opens coverage/index.html
```

## Performance Benchmarks

Must pass before release:

| Operation | Threshold | Status |
|-----------|-----------|--------|
| Cache hit | <10ms | ✅ |
| View render | <300ms | ✅ |
| View transition | <1 second | ✅ |
| Initial load | <3 seconds | ✅ |
| Bundle size | <500KB | ✅ |
| Memory growth | <50MB/10k ops | ✅ |
| API fetch | <5 seconds | ✅ |
| WebSocket reconnect | Automatic | ✅ |

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/test.yml`):

1. **Test Suite** (Matrix: Node 18, 20)
   - Unit tests with coverage
   - Integration tests
   - E2E tests (Playwright)
   - Performance tests
   - Security audit (npm audit)
   - Linting (ESLint)

2. **Coverage Upload**
   - Codecov integration
   - HTML reports as artifacts

3. **Performance Benchmarks**
   - Runs separately
   - Compares with baseline
   - Uploads results

4. **Security Scanning**
   - npm audit (high level)
   - Snyk integration (optional)

5. **Build Verification**
   - Client build
   - Server build
   - Bundle size check

## Before Release Checklist

**Unit Tests**
- [ ] All store mutations have tests
- [ ] Cache service tests pass
- [ ] Coverage >80%

**Integration Tests**
- [ ] Module interactions tested
- [ ] Data flows verified
- [ ] CBCT prefetch works

**E2E Tests**
- [ ] Critical user flows pass
- [ ] Error scenarios handled
- [ ] Performance thresholds met

**Performance**
- [ ] Cache <10ms hits
- [ ] Renders <300ms
- [ ] Bundle <500KB
- [ ] No memory leaks

**Security**
- [ ] Input validation works
- [ ] Auth enforced
- [ ] Data isolated
- [ ] No XSS/injection vulnerabilities
- [ ] npm audit clean

**Stability**
- [ ] No memory leaks (1000 ops)
- [ ] WebSocket reconnects
- [ ] State stays consistent
- [ ] Graceful error handling

## Troubleshooting

### Tests timeout

Increase timeout in `vitest.config.js`:
```javascript
testTimeout: 20000, // 20 seconds
```

### Memory issues

Run tests sequentially:
```bash
vitest run --threads=false
```

### E2E tests fail

Ensure app is running:
```bash
npm run dev &
npm run test:e2e
```

### Coverage reporting issues

Clear coverage cache:
```bash
rm -rf coverage/
npm run test:coverage
```

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Strategy](../TESTING_STRATEGY.md)
- [GitHub Actions Workflow](../.github/workflows/test.yml)

## Authors

Generated as part of AetherOS testing infrastructure setup (v1.0.0)
