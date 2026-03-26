# AetherOS × CBCT Integration Guide

## 🎯 Overview

CBCT is now seamlessly integrated into AetherOS as an **embedded code intelligence layer**. Users can:

1. **View System Architecture** in AetherOS
2. **Double-click any node** to zoom into CODE view
3. **Explore code structure** with CBCT's graph visualization
4. **Return seamlessly** to architecture view

---

## 🏗️ Architecture

```
AetherOS (System-level Intelligence)
    ↓
    ├─ Infer Architecture from repo
    ├─ Queue CBCT prefetch (background)
    └─ Double-click node
       ↓
    CBCTWrapper (Embedded)
       ├─ Load pre-cached analysis
       ├─ Display code graph
       └─ Return with summary
       ↓
    Apply CBCT metrics to nodes
```

---

## 📦 Key Components

### 1. **Cache Layer** (`client/src/services/cache.js`)
- Shared in-memory cache between AetherOS and CBCT
- TTL-based expiration (30 min default)
- Future: Swap with Redis

### 2. **Prefetch Service** (`client/src/services/prefetch.js`)
- Triggers CBCT analysis when repo is inferred
- Runs in background (non-blocking)
- Stores results in cache for instant CODE view

### 3. **CBCT Integration Service** (`client/src/services/cbctIntegration.js`)
- Transforms CBCT data into AetherOS node metadata
- Calculates complexity, risk, dependency metrics
- Creates visual indicators and summary cards

### 4. **Enhanced Store** (`client/src/store/useStore.js`)
- New state: `cbctActiveNodeId`, `cbctLoading`, `cbctError`
- Methods: `enterCodeView()`, `exitCodeView()`, `applyCBCTDataToNodes()`
- Auto-prefetch on architecture import

### 5. **CBCTWrapper** (`client/src/components/CBCTWrapper.jsx`)
- Embeds CBCT as CODE view mode
- Skips welcome screen when repoPath provided
- Returns CBCT summary when exiting

### 6. **Enhanced CBCT App** (`CBCT/client/src/App.jsx`)
- Accepts `embeddedMode` and `repoPath` props
- Auto-starts analysis when repoPath provided
- Hides header when embedded

### 7. **ModelingCanvas** (`client/src/components/ModelingCanvas.jsx`)
- Double-click handler triggers `enterCodeView()`
- Seamless transition to CODE view

---

## 🔄 Data Flow

### When Repository is Inferred

```js
inferFromGithub(repoUrl)
  ↓
importInferredGraph(result)
  ├─ Create nodes/edges in AetherOS
  ├─ Store repoPath
  └─ Queue CBCT prefetch (background)
```

### When User Double-Clicks Node

```
Double-click node
  ↓
enterCodeView(nodeId)
  ├─ Set viewMode = 'CODE'
  ├─ Set cbctActiveNodeId
  └─ Render CBCTWrapper
     ├─ Check cache for CBCT analysis
     │  ├─ HIT → Load instantly ⚡
     │  └─ MISS → Analyze (slower)
     └─ Render CBCT graph
```

### When User Exits CODE View

```
Click "Back to Architecture"
  ↓
exitCodeView()
  ├─ Apply CBCT metrics to nodes
  ├─ Set viewMode = 'ARCHITECTURE'
  └─ Add visual indicators to nodes
```

---

## 🚀 Usage

### Basic Integration (Already Implemented)

```jsx
// In App.jsx
{viewMode === 'CODE' && (
  <CBCTWrapper 
    nodeId={selectedNodeId}
    repoPath={lastInferredRepo}
  />
)}
```

### Programmatic Access

```js
// In your component
import { cacheService, cacheKeys } from '@/services/cache';
import { queuePrefetch, getPrefetchStatus } from '@/services/prefetch';

// Check if CBCT analysis is cached
const cached = cacheService.get(cacheKeys.cbctAnalysis(repoPath));

// Check prefetch status
const status = getPrefetchStatus(repoPath); // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED'

// Queue background analysis
queuePrefetch(repoPath);

// Apply CBCT data to nodes
import { transformCBCTToNodeMetadata } from '@/services/cbctIntegration';
const metadata = transformCBCTToNodeMetadata(cbctGraph, cbctMetrics);
```

---

## 🎨 Visual Integration

### Node Indicators (From CBCT Data)

When CBCT data is applied, nodes get:

- **Complexity Badge**: High/Medium/Low based on code structure
- **Dependency Count**: Shows outgoing/incoming connections
- **Risk Color**: Red (high) / Yellow (medium) / Green (low)
- **File Count**: Number of source files

### UI Consistency

- Theme: Matches AetherOS (purple + black)
- Transitions: Smooth fade/zoom animations
- Navigation: Seamless without reloads

---

## ⚙️ Configuration

### Cache TTL

```js
// In cache.js - adjust default TTL
this.defaultTTL = 30 * 60 * 1000; // 30 minutes
```

### Prefetch Timeout

```js
// In prefetch.js - adjust timeout
cacheService.set(prefetchKey, 'IN_PROGRESS', 10 * 60 * 1000); // 10 min
```

---

## 🔮 Future Upgrades

### 1. Redis Cache Layer

**Today**: In-memory only  
**Tomorrow**: Swap cache service with Redis

```js
// Drop-in replacement
import RedisCache from './cache-redis';
export const cacheService = new RedisCache();
```

### 2. Cross-System Integrations

- **Simulation → CBCT**: Highlight affected code after failure
- **AI → CBCT**: "Inspect in Code Map" button
- **CBCT → AetherOS**: Real-time sync of metrics

### 3. Advanced Analytics

- Complexity trends over time
- Dependency cycle detection
- Code hotspots visualization

---

## ✅ Testing Checklist

- [ ] Double-click node in ARCHITECTURE view
- [ ] Verify CODE view loads (and is cached if re-entering)
- [ ] Verify breadcrumbs show node name
- [ ] Click "Back to Architecture"
- [ ] Confirm nodes have CBCT metrics
- [ ] Test with GitHub repo
- [ ] Test with local repo
- [ ] Verify no page reloads
- [ ] Check console for errors
- [ ] Monitor cache size (`cacheService.getStats()`)

---

## 🐛 Debugging

### Check Cache Status

```js
// In browser console
const cache = await import('src/services/cache.js');
cache.cacheService.getStats();
```

### Monitor Prefetch

```js
// Watch prefetch progress
setInterval(() => {
  const status = getPrefetchStatus(repoPath);
  console.log('Prefetch status:', status);
}, 1000);
```

### Enable Debug Logging

```js
// In prefetch.js, logs show:
// [CBCT Prefetch] Starting analysis...
// [CBCT Prefetch] Complete...
// [CBCT Prefetch] Cache HIT
```

---

## 📋 Files Modified

### AetherOS

- `client/src/store/useStore.js` - Added CBCT state & methods
- `client/src/components/CBCTWrapper.jsx` - Enhanced embedding
- `client/src/components/ModelingCanvas.jsx` - Double-click integration
- `client/src/App.jsx` - Fixed view mode rendering
- `client/src/services/cache.js` - NEW: Shared cache
- `client/src/services/prefetch.js` - NEW: Background analysis
- `client/src/services/cbctIntegration.js` - NEW: Data transformation

### CBCT

- `client/src/App.jsx` - Accept props for embedded mode

---

## 🎓 Key Principles

1. **Independence**: Both systems run standalone
2. **Loose Coupling**: Via props and API, not shared logic
3. **Data Sharing**: Cache and metadata, not code
4. **Performance**: Prefetch + cache = instant loading
5. **UX**: Seamless mode switching, no context loss

---

## 📞 Support

If integration issues occur:

1. Check browser console for errors
2. Verify cache service is accessible
3. Confirm CBCT store methods exist
4. Check API endpoints are available
5. Monitor network tab for prefetch requests

