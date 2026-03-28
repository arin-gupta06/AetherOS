# AetherOS ↔ CBCT Integration Guide

## Adapter Pattern Implementation

This document explains the Adapter Pattern implementation for integrating CBCT into AetherOS while maintaining architectural separation.

---

## 🧠 Core Principle

> **AetherOS does NOT adapt CBCT**  
> **AetherOS adapts itself to CBCT**

The adapter layer ensures CBCT remains a fully independent system while AetherOS provides a stable interface to interact with it.

---

## 🏗️ Architecture Overview

```
AetherOS Components (App, Canvas, Store)
           ↓
     Adapter Layer
           ↓
    CBCT Interface (URL/API)
           ↓
  CBCT System (External)
```

### Integration Points

| Component | Purpose | Location |
|-----------|---------|----------|
| **cbctAdapter.js** | URL building, context opening, prefetch | `client/src/integrations/` |
| **cbctPrefetch.js** | Non-blocking background prefetch queue | `client/src/services/` |
| **CBCTViewer.jsx** | iframe rendering, navigation UI | `client/src/components/` |
| **ModelingCanvas.jsx** | Node double-click handler | `client/src/components/` |
| **Store (useStore.js)** | State management for CBCT URL | `client/src/store/` |

---

## 🎯 Adapter Role

The adapter serves as a **single point of integration** between AetherOS and CBCT:

### What the Adapter Does ✅
- Translates AetherOS node structure → CBCT URL parameters
- Manages CBCT configuration (base URL, endpoints)
- Handles prefetch queuing for performance
- Validates node readiness for code inspection
- Maintains error boundaries between systems

### What the Adapter Does NOT Do ❌
- Does not import or depend on CBCT code
- Does not modify CBCT behavior
- Does not bypass iframe sandboxing
- Does not handle business logic (that's AetherOS's job)
- Does not store persistent CBCT analysis data

---

## 🔗 CBCT Adapter API

### Core Functions

#### `buildCBCTUrl(node, lastInferredRepo)`

Translates AetherOS node → CBCT-compatible URL

```javascript
import { buildCBCTUrl } from '@/integrations/cbctAdapter';

const url = buildCBCTUrl(node, 'github.com/owner/repo');
// https://cbct-code-base-cartographic-tool-cl.vercel.app/?repoPath=github.com/owner/repo&mode=embedded
```

**Requirements:**
- `node`: AetherOS node object with `data.metadata`
- `lastInferredRepo`: Repository path from global state or node metadata

**Validation:**
- Logs warning if no repository path found
- Returns `null` if unable to build URL

---

#### `openCBCTContext(node, lastInferredRepo)`

High-level API for entering CODE view

```javascript
import { openCBCTContext } from '@/integrations/cbctAdapter';

try {
  const cbctUrl = openCBCTContext(node, lastInferredRepo);
  // Store URL, transition to CODE view
} catch (err) {
  console.error('Cannot open CBCT:', err.message);
}
```

**Throws:**
- Error if no repository path available

**Usage:**
- Called on node double-click
- Must be wrapped in try-catch

---

#### `canInspectInCBCT(node, lastInferredRepo)`

Validates if node can be inspected

```javascript
import { canInspectInCBCT } from '@/integrations/cbctAdapter';

if (canInspectInCBCT(node, lastInferredRepo)) {
  // Show "Inspect Code" button
} else {
  // Show disabled/hidden button
}
```

**Returns:** `boolean`

---

#### `prefetchCBCT(repoPath)`

Background cache warming (non-blocking)

```javascript
import { prefetchCBCT } from '@/integrations/cbctAdapter';

// Fire and forget
prefetchCBCT('github.com/owner/repo');
```

**Behavior:**
- Non-blocking, returns immediately
- 5-second timeout prevents hanging
- Failures logged but not thrown

---

### Configuration Management

#### `getCBCTConfig()`

Returns current CBCT configuration

```javascript
const config = getCBCTConfig();
// { baseUrl: 'https://...', apiEndpoints: {...}, ... }
```

#### `updateCBCTConfig(updates)`

Updates CBCT base URL if deployment changes

```javascript
updateCBCTConfig({ 
  baseUrl: 'https://new-cbct-domain.com/' 
});
```

---

## 🔄 Integration Flow

### User Double-Clicks Node

```javascript
// 1. ModelingCanvas.jsx onNodeDoubleClick
const cbctUrl = openCBCTContext(node, lastInferredRepo);

// 2. Store (useStore.js)
enterCodeView(nodeId);        // Set viewMode = 'CODE'
setCbctUrl(cbctUrl);          // Store URL for rendering

// 3. App.jsx
{viewMode === 'CODE' && <CBCTViewer url={cbctUrl} onBack={exitCodeView} />}

// 4. CBCTViewer.jsx
<iframe src={url} />           // Render in isolated sandbox
```

### User Clicks Back Button

```javascript
// 1. CBCTViewer detects click
handleBack() → onBack()

// 2. App.jsx callback
exitCodeView()

// 3. Store cleanup
viewMode = 'ARCHITECTURE'
cbctActiveNodeId = null
cbctUrl = null

// 4. Normal architecture canvas resumes
```

---

## 🛡️ Strict Isolation Rules

### ✅ What Adapter Can Do

- Read node metadata (labels, IDs, repo path)
- Build URLs with encoded query parameters
- Make background prefetch requests to CBCT API
- Log diagnostic messages
- Return simple values (URLs, booleans)

### ❌ What Adapter Cannot Do

- Import CBCT components or modules
- Modify CBCT behavior or state
- Inject AetherOS logic into CBCT
- Bypass the iframe sandbox
- Access CBCT's internal store directly

---

## 🧪 Testing Integration

### 1. Verify Adapter Loads

```javascript
// In browser console
import cbctAdapter from '@/integrations/cbctAdapter';
console.log(cbctAdapter.getCBCTConfig());
```

### 2. Test URL Building

```javascript
const node = {
  id: 'service-1',
  data: { label: 'My Service', metadata: { repoPath: 'github.com/owner/repo' } }
};

const url = cbctAdapter.buildCBCTUrl(node, null);
console.log(url);
// Should include: ?repoPath=github.com/owner/repo&mode=embedded
```

### 3. Test Double-Click

1. Create a new environment (Quick Start)
2. Import architecture from GitHub (or create nodes manually)
3. Double-click a node
4. Verify:
   - Canvas fades out
   - CBCT loads in iframe
   - Back button appears
   - Breadcrumb shows node name

### 4. Test Back Navigation

1. Click "Architecture" button
2. Verify:
   - CBCT fades out
   - Canvas appears
   - Sidebar and right panel reappear
   - No errors in console

---

## 🚀 Performance Optimization

### Prefetching Strategy

The adapter supports optional prefetching for instant CODE view loading:

```javascript
// In importInferredGraph (store)
if (repoPath) {
  import('../services/cbctPrefetch.js').then(({ queuePrefetch }) => {
    queuePrefetch(repoPath);
  });
}
```

**Benefits:**
- Warm CBCT cache before user clicks
- Reduces perceived load time
- Non-blocking background operation

---

## 🔮 Future Integrations

The adapter pattern can be repeated for other external systems:

```
AetherOS
  ├─ CBCT Adapter         (current)
  ├─ AI Advisor Adapter   (future)
  ├─ Simulation Adapter   (future)
  └─ Metrics Adapter      (future)
```

### Template for New Adapter

```javascript
// client/src/integrations/newSystemAdapter.js

const CONFIG = {
  baseUrl: 'https://external-system.com/',
  apiEndpoints: { /* ... */ }
};

export function buildSystemUrl(node, lastInferredRepo) {
  // Extract metadata from node
  // Build URL with parameters
  // Return URL string
}

export function openSystemContext(node, lastInferredRepo) {
  try {
    return buildSystemUrl(node, lastInferredRepo);
  } catch (err) {
    throw new Error('Cannot open context: ' + err.message);
  }
}

// ... etc
```

---

## 📋 Configuration

### CBCT Base URL

Default: `https://cbct-code-base-cartographic-tool-cl.vercel.app/`

To change, update in `cbctAdapter.js`:

```javascript
const CBCT_CONFIG = {
  baseUrl: 'https://new-url/', // Update here
  // ...
};
```

### Query Parameters

- `repoPath`: Repository path (required)
- `mode`: Always `embedded` for iframe mode

---

## 🔍 Debugging

### Enable Adapter Logging

The adapter uses console methods prefixed with `[CBCTAdapter]`:

```javascript
// In browser DevTools
localStorage.debug = '*'; // Enable all logs
// Refresh page
```

### Common Issues

| Issue | Solution |
|-------|----------|
| URL shows `null` | Check `lastInferredRepo` is set in store |
| iframe is blank | Verify CBCT deployment URL is correct |
| Prefetch fails | Check network/CORS, failures are non-critical |
| Back button missing | Verify `CBCTViewer` component is used |

---

## 📚 File References

### New Files Created

- `client/src/integrations/cbctAdapter.js` — Adapter implementation
- `client/src/services/cbctPrefetch.js` — Prefetch queue manager
- `client/src/components/CBCTViewer.jsx` — iframe viewer component

### Modified Files

- `client/src/components/ModelingCanvas.jsx` — Added adapter integration
- `client/src/store/useStore.js` — Added cbctUrl state and setCbctUrl()
- `client/src/App.jsx` — Switched to CBCTViewer, removed CBCTWrapper

---

## ✅ Checklist

- [x] Adapter layer created (cbctAdapter.js)
- [x] Prefetch service created (cbctPrefetch.js)
- [x] Viewer component created (CBCTViewer.jsx)
- [x] ModelingCanvas integrated with adapter
- [x] Store updated with cbctUrl state
- [x] App.jsx updated to use new viewer
- [x] Documentation created

---

## 📞 Support

For issues or questions about the adapter pattern integration, refer to:

1. This integration guide
2. Source code comments in `cbctAdapter.js`
3. CBCT_BASE_URL and API contract documentation
4. Browser console logs (prefixed with `[CBCTAdapter]`)
