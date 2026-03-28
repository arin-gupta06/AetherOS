# AetherOS × CBCT Integration - Developer Quick Start

## What Changed?

The integration adds **code-level intelligence** to AetherOS's architectural views. Users can now double-click any system node to zoom into its code structure and dependencies.

---

## 🎯 Key User Flow

```
1. Import GitHub repo in AetherOS
   ↓ (CBCT analysis queues in background)
2. View architecture (nodes/edges)
   ↓ (User double-clicks a node)
3. Enter CODE view (full-screen CBCT graph)
   ↓ (User clicks back button)
4. Return to ARCHITECTURE with code metrics
```

---

## 📁 New Files

### 1. **`client/src/services/cache.js`**
Shared cache service between AetherOS and CBCT.

```js
import { cacheService, cacheKeys } from '@/services/cache';

// Get cached value
const analysis = cacheService.get(cacheKeys.cbctAnalysis(repoPath));

// Set value (30-min TTL)
cacheService.set(key, value);

// Check if exists
if (cacheService.has(key)) { ... }

// View stats
cacheService.getStats()
```

### 2. **`client/src/services/prefetch.js`**
Triggers CBCT analysis in background when repo loads.

```js
import { queuePrefetch, getPrefetchStatus } from '@/services/prefetch';

// Queue background analysis
queuePrefetch(repoPath);

// Check status
const status = getPrefetchStatus(repoPath);
// Returns: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED'
```

### 3. **`client/src/services/cbctIntegration.js`**
Transforms CBCT data into AetherOS node metadata.

```js
import { 
  transformCBCTToNodeMetadata,
  getNodeIndicators,
  createNodeSummaryCard,
  enrichNodesWithCBCTData
} from '@/services/cbctIntegration';

// Transform CBCT data
const metadata = transformCBCTToNodeMetadata(cbctGraph, cbctMetrics);

// Get visual indicators for a node
const indicators = getNodeIndicators(nodeMetadata);

// Create summary card
const card = createNodeSummaryCard(nodeMetadata, 'NodeName');

// Apply to nodes
const enriched = enrichNodesWithCBCTData(aetherNodes, metadata);
```

---

## 📝 Modified Files

### 1. **`client/src/store/useStore.js`**

**New State Properties**:
```js
cbctActiveNodeId: null,        // Which node is being inspected
cbctLoading: false,             // Is CBCT analyzing
cbctError: null,                // Latest error message
```

**New Methods**:
```js
// Set active node for CODE view
setCbctActiveNode(nodeId)

// Set loading state
setCbctLoading(loading)

// Set error state
setCbctError(error)

// Transition to CODE view (all-in-one)
enterCodeView(nodeId)
  // Sets viewMode='CODE', selects node, opens right panel

// Return from CODE view
exitCodeView()
  // Restores viewMode='ARCHITECTURE'

// Apply CBCT metrics to nodes
applyCBCTDataToNodes(repoPath, cbctData)
  // Enriches nodes with complexity, risk, dependencies
```

**Modified Methods**:
```js
// Now queues CBCT prefetch
importInferredGraph(result)
  // Calls queuePrefetch() automatically
```

### 2. **`client/src/components/CBCTWrapper.jsx`**

**Enhanced** from simple wrapper to full integration:
- Skips welcome screen when `repoPath` provided
- Auto-starts CBCT analysis
- Shows breadcrumbs and status
- Passes CBCT data back when exiting
- Matches AetherOS styling

### 3. **`client/src/components/ModelingCanvas.jsx`**

**Modified Double-Click Handler**:
```js
const onNodeDoubleClick = useCallback((_event, node) => {
  useStore.getState().enterCodeView(node.id);
}, []);
// Now transitions to CODE view instead of just changing viewMode
```

### 4. **`client/src/App.jsx`**

**Fixed View Rendering** (was broken):
```jsx
<main>
  <div className={viewMode === 'CODE' ? 'opacity-0' : 'opacity-100'}>
    <ModelingCanvas />
  </div>
  
  {viewMode === 'CODE' && (
    <CBCTWrapper nodeId={selectedNodeId} repoPath={lastInferredRepo} />
  )}
</main>
```

### 5. **`CodeBase-CartoGraphic-Tool-CBCT-/client/src/App.jsx`**

**Added Props Support**:
```jsx
function App({ embeddedMode = false, repoPath = null }) {
  // Auto-load repoPath if provided
  // Skip welcome screen if embedded
  // Hide header if embedded
}
```

---

## 🔌 Integration Points

### When User Imports Repository

```js
// In inferencePanel or similar
const result = await api.inferFromGithub(repoUrl);
useStore.getState().importInferredGraph(result);
// ↑ This automatically queues CBCT prefetch
```

### When User Double-Clicks Node

```js
// In ModelingCanvas.jsx
onNodeDoubleClick() → enterCodeView(nodeId)
  ├─ Set viewMode = 'CODE'
  ├─ Set cbctActiveNodeId = nodeId
  └─ Render <CBCTWrapper />
```

### When User Returns to Architecture

```js
// In CBCTWrapper.jsx back button
onClick={() => {
  // Apply CBCT metrics to nodes
  applyCBCTDataToNodes(repoPath, cbctData);
  // Switch back to architecture
  exitCodeView();
}}
```

---

## 💾 State Management

### Before Integration
```js
viewMode: 'ARCHITECTURE'
selectedNodeId: null
nodes: []
edges: []
```

### After Integration
```js
viewMode: 'ARCHITECTURE' | 'CODE'
cbctActiveNodeId: nodeId
selectedNodeId: null
cbctLoading: false
cbctError: null
nodes: [{
  data: {
    metadata: {
      complexity: 0.65,
      riskLevel: 'medium',
      dependencyCount: 5,
      ...
    }
  }
}]
```

---

## 🎨 Visual Enhancements

### From CBCT Integration

Nodes get enriched with:
- **Complexity Badge**: % complexity score
- **Risk Color**: Red/Yellow/Green border
- **Dependency Count**: Number of deps
- **Hover Tooltip**: Summary card with metrics

### Example Node Summary
```
Node: AuthService

Code Metrics:
  Complexity: 65%
  Centrality: 42%
  Files: 12

Dependencies:
  Outgoing: 5 (uses)
  Incoming: 3 (used by)

Risk Assessment:
  Risk Level: MEDIUM
```

---

## ⚙️ How to Extend

### Add Custom Node Indicators

```js
// In cbctIntegration.js, modify getNodeIndicators()
badges.push({
  type: 'custom',
  icon: '🎯',
  label: 'Custom Metric',
  color: '#6366f1'
});
```

### Modify Complexity Calculation

```js
// In cbctIntegration.js, edit calculateComplexity()
function calculateComplexity(cbctNode) {
  // Add your own factors
  const cyclomatic = cbctNode.metadata?.cyclomatic || 0;
  // ...
}
```

### Add More Cache Keys

```js
// In cache.js, add to cacheKeys object
cbctCustomData: (repoPath, type) => `cbct:custom:${repoPath}:${type}`
```

---

## 🐛 Debugging

### Check if CBCT is Cached

```js
// Browser console
const { cacheService, cacheKeys } = await import('src/services/cache.js');
const cached = cacheService.get(cacheKeys.cbctAnalysis('repoPath'));
console.log('Cached:', cached);
```

### Monitor Prefetch Progress

```js
// Browser console
const { getPrefetchStatus } = await import('src/services/prefetch.js');
console.log(getPrefetchStatus('repoPath')); // 'IN_PROGRESS', 'COMPLETE', etc
```

### View Cache Statistics

```js
// Browser console
cacheService.getStats()
// Returns: { size: 5, keys: [...], expirations: [...] }
```

### Check Node Metadata

```js
// Browser console after CODE view
const node = store.nodes[0];
console.log(node.data.metadata);
// Shows: { complexity: 0.65, riskLevel: 'medium', ... }
```

---

## 🚀 Performance Tips

1. **Cache Hits**: First entry is slow (analysis), subsequent entries instant
2. **Prefetch**: Background loading means CODE view usually instant
3. **Memory**: Cache auto-expires after 30 minutes
4. **Lazy Load**: Services use dynamic imports to avoid bundle bloat

---

## 🔗 Related Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Architecture and data flows
- [INTEGRATION_SPECIFICATION.md](./INTEGRATION_SPECIFICATION.md) - Compliance matrix
- [CBCTWrapper.jsx](./client/src/components/CBCTWrapper.jsx) - Component source
- [cache.js](./client/src/services/cache.js) - Cache implementation

---

## ✅ Verification Checklist

After integration, verify:

- [ ] Double-click node → CODE view loads
- [ ] Back button → returns to ARCHITECTURE
- [ ] Nodes show complexity badges
- [ ] Cache has entries after CODE view
- [ ] No console errors
- [ ] No page reloads occur
- [ ] Breadcrumbs show correct node name
- [ ] Can repeat CODE view (should be instant 2nd time)

---

## 📞 Troubleshooting

| Issue | Solution |
|---|---|
| CODE view doesn't load | Check cache service is accessible |
| Welcome screen shows | Ensure `repoPath` is passed to CBCTWrapper |
| No CBCT metrics on nodes | Check `applyCBCTDataToNodes()` called on exit |
| Blank breadcrumbs | Verify `nodes` array has correct node |
| Slow second entry | Check cache TTL in cache.js (should be fast) |

