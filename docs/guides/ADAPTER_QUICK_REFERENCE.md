# 🧠 AetherOS ↔ CBCT Integration Quick Reference

## 🎯 For Developers

### Understanding the Adapter Pattern

The adapter is your **translation layer**. AetherOS speaks AetherOS. CBCT speaks CBCT. The adapter translates between them.

```
Your AetherOS Code  →  Adapter  →  CBCT API
```

**Golden Rule**: If you're about to write CBCT code directly in AetherOS, STOP. Use the adapter instead.

---

## 📍 Where Things Happen

### 1. User Double-Clicks Node → `ModelingCanvas.jsx`

```jsx
onNodeDoubleClick = (_event, node) => {
  // 1. Check if node is ready via adapter
  if (!canInspectInCBCT(node, lastInferredRepo)) {
    return; // Node not ready
  }

  // 2. Get CBCT URL from adapter
  const cbctUrl = openCBCTContext(node, lastInferredRepo);

  // 3. Enter CODE view
  store.enterCodeView(nodeId);
  store.setCbctUrl(cbctUrl);

  // 4. Prefetch next
  queuePrefetch(lastInferredRepo);
};
```

**Key Insight**: The adapter (`openCBCTContext`) builds the URL. Your job is to call it.

---

### 2. Adapter Builds URL → `cbctAdapter.js`

```js
export function openCBCTContext(node, lastInferredRepo) {
  const cbctUrl = buildCBCTUrl(node, lastInferredRepo);

  // Adapter throws if no repo — that's validation!
  if (!cbctUrl) {
    throw new Error('Cannot open CBCT: no repository path.');
  }

  return cbctUrl; // Returns: https://cbct.../?repoPath=...&mode=embedded
}
```

**Key Insight**: The adapter handles ALL CBCT URL logic. Centralized. Testable.

---

### 3. Prefetch Triggers Cache → `cbctAdapter.js` + `cbctPrefetch.js`

```js
export async function prefetchCBCT(repoPath) {
  // Build prefetch URL
  const url = new URL('/api/prefetch', CBCT_CONFIG.baseUrl);

  // Fire-and-forget (5s timeout)
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({ repoPath })
  });
}
```

**Key Insight**: Prefetch is fire-and-forget. Failures are silent. It's optional optimization.

---

### 4. iframe Renders CBCT → `App.jsx` + `CBCTViewer.jsx`

```jsx
{viewMode === 'CODE' && (
  <CBCTViewer url={cbctUrl} onBack={exitCodeView} />
)}
```

```jsx
// CBCTViewer.jsx
<iframe src={url} className="w-full h-full" />
```

**Key Insight**: Just render the URL. CBCT handles the rest.

---

## 🔄 State Flow Diagram

```
ModelingCanvas.onNodeDoubleClick()
         ↓
    openCBCTContext(node, repo)  ← Adapter magic
         ↓
    store.enterCodeView(nodeId)  ← State update
         ↓
    store.setCbctUrl(cbctUrl)    ← URL stored
         ↓
    App.jsx detects viewMode changed
         ↓
    Renders CBCTViewer with URL
         ↓
    iframe loads CBCT
         ↓
    CBCT checks Redis cache
         ↓
    Either: cached ⚡ OR analyze + cache 🔄
```

---

## 🛠️ Common Tasks

### Add a New Prefetch Trigger

**Before**: Don't do this:
```js
// ❌ WRONG - Hardcodes CBCT logic
fetch('https://cbct.../api/prefetch', ...)
```

**After**: Do this:
```js
// ✅ CORRECT - Use service
import { queuePrefetch } from '../services/cbctPrefetch';
queuePrefetch(repoPath);
```

### Change CBCT URL

**Before**: Edit everywhere it appears (bad 😱)

**After**: Edit one place:
```js
updateCBCTConfig({ baseUrl: 'https://new-cbct.com' });
```

### Add a New Validation

The adapter is your validation layer:

```js
// In cbctAdapter.js
export function validateNodeHasMetadata(node) {
  if (!node?.data?.metadata?.repoPath) {
    throw new Error('Node missing required metadata');
  }
  return true;
}

// Use it in ModelingCanvas
if (!validateNodeHasMetadata(node)) return;
```

### Debug Prefetch Issues

```js
// Check queue status
import { getPrefetchStatus } from '../services/cbctPrefetch';
console.log(getPrefetchStatus());
// Output: { queued: 1, active: 0, maxConcurrent: 2 }
```

---

## 🚨 Common Mistakes & Fixes

### ❌ Mistake 1: Calling CBCT API Directly

```js
// ❌ WRONG
fetch('https://cbct.../api/analyze', {...});

// ✅ CORRECT
import { open CBCTContext } from '../integrations/cbctAdapter';
const url = openCBCTContext(node, repo);
```

### ❌ Mistake 2: Hardcoding CBCT Config

```js
// ❌ WRONG
const CBCT_URL = 'https://cbct.../';

// ✅ CORRECT
import { getCBCTConfig } from '../integrations/cbctAdapter';
const { baseUrl } = getCBCTConfig();
```

### ❌ Mistake 3: Blocking on Prefetch

```js
// ❌ WRONG - Prefetch should never block UX
const url = await prefetchCBCT(repo);

// ✅ CORRECT - Fire-and-forget
queuePrefetch(repo); // No await!
const url = openCBCTContext(node, repo);
```

---

## 🔍 Testing the Integration

### Test Adapter Functions

```js
// tests/unit/adapter.test.js
import { buildCBCTUrl, openCBCTContext } from '../../src/integrations/cbctAdapter';

it('should build correct CBCT URL', () => {
  const url = buildCBCTUrl(mockNode, 'user/repo');
  expect(url).toContain('repoPath=user/repo');
  expect(url).toContain('mode=embedded');
});
```

### Test View Transition

```js
// tests/integration/modules/cbct.test.js
it('should enter CODE view on double-click', async () => {
  // 1. Simulate double-click
  fireEvent.doubleClick(nodeElement);

  // 2. Assert state changed
  expect(store.viewMode).toBe('CODE');
  expect(store.cbctUrl).toBeTruthy();

  // 3. Assert iframe rendered
  expect(screen.getByRole('iframe')).toBeInTheDocument();
});
```

---

## 📞 Architecture Support Contacts

- **Adapter Issues** → Check `cbctAdapter.js`
- **Prefetch Issues** → Check `cbctPrefetch.js`
- **State Issues** → Check `useStore.js`
- **UI Issues** → Check `CBCTViewer.jsx`
- **Integration Issues** → Check this guide 😊

---

## 🎓 Learning Path

1. **Understand** the adapter pattern (read ADAPTER_REDIS_INTEGRATION_VERIFICATION.md)
2. **Trace** a double-click flow: `ModelingCanvas` → `cbctAdapter` → `Store` → `CBCTViewer`
3. **Modify** CBCT_CONFIG (safest change)
4. **Add** prefetch triggers using `queuePrefetch()`
5. **Review** strict rules before making big changes

---

## 🚀 Performance Tips

- **Prefetch early**: Queue prefetch as soon as repo is loaded
- **Prefetch aggressively**: Prefetch on node hover, not just click
- **Monitor**: Check browser DevTools Network for CBCT requests
- **Optimize**: CBCT caching happens server-side, not your concern

---

**Remember**: You're not building CBCT integration code. You're building adapter _calls_.

The adapter is your guardrail. Use it. Trust it. Love it. ❤️
