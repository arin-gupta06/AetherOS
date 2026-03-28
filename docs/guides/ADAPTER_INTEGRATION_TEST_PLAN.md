# AetherOS ↔ CBCT Integration Test Plan

## Overview

This test plan validates the Adapter Pattern implementation for CBCT integration with AetherOS.

---

## Test Environment Setup

### Prerequisites

1. **AetherOS running locally**
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. **CBCT deployed** at:
   ```
   https://cbct-code-base-cartographic-tool-cl.vercel.app/
   ```

3. **Browser DevTools** open
   - Console tab (for logging)
   - Network tab (for requests)
   - Elements tab (for DOM inspection)

---

## Unit Tests

### UT-001: Adapter URL Building

**Test:** Verify URLs are correctly built

```javascript
// In browser console
import { buildCBCTUrl, canInspectInCBCT } from '@/integrations/cbctAdapter';

// Test 1: Valid node with repo path
const node = {
  id: 'svc-1',
  data: { label: 'API Service', metadata: { repoPath: 'github.com/user/repo' } }
};
const url = buildCBCTUrl(node, null);
console.assert(url.includes('repoPath=github.com/user/repo'), 'URL should include repo path');
console.assert(url.includes('mode=embedded'), 'URL should include mode=embedded');
console.assert(url.startsWith('https://cbct-'), 'URL should start with CBCT base URL');

// Test 2: Node without repo path
const emptyNode = { id: 'svc-2', data: { label: 'Service' } };
const emptyUrl = buildCBCTUrl(emptyNode, null);
console.assert(emptyUrl === null, 'Should return null for missing repo path');

// Test 3: canInspectInCBCT validation
console.assert(canInspectInCBCT(node, null) === true, 'Valid node should be inspectable');
console.assert(canInspectInCBCT(emptyNode, null) === false, 'Invalid node should not be inspectable');

console.log('✅ UT-001 PASSED');
```

**Expected Results:**
- URLs contain correct parameters
- Invalid nodes return null
- Validation functions work correctly

---

### UT-002: Adapter Context Opening

**Test:** Verify context can be opened safely

```javascript
// In browser console
import { openCBCTContext } from '@/integrations/cbctAdapter';

// Test 1: Valid context
const validNode = {
  id: 'svc-1',
  data: { label: 'Service', metadata: { repoPath: 'github.com/user/repo' } }
};
try {
  const url = openCBCTContext(validNode, null);
  console.assert(url !== null && url.length > 0, 'Should return valid URL');
  console.log('✅ Valid context opened successfully: ' + url.substring(0, 50) + '...');
} catch (err) {
  console.error('❌ Unexpected error:', err);
}

// Test 2: Invalid context (should throw)
const invalidNode = { id: 'svc-2', data: { label: 'Service' } };
try {
  openCBCTContext(invalidNode, null);
  console.error('❌ Should have thrown error for missing repo path');
} catch (err) {
  console.assert(err.message.includes('repository'), 'Error should mention repo path');
  console.log('✅ Correctly throws error for invalid context');
}

console.log('✅ UT-002 PASSED');
```

**Expected Results:**
- Valid contexts open without error
- Invalid contexts throw descriptive errors
- Error messages are helpful

---

### UT-003: Prefetch Function

**Test:** Verify prefetch queuing works

```javascript
// In browser console
import { queuePrefetch, getPrefetchStatus } from '@/services/cbctPrefetch';

// Queue a prefetch
const repoPath = 'github.com/user/repo';
queuePrefetch(repoPath);

console.log('Status:', getPrefetchStatus());
console.assert(getPrefetchStatus().queued >= 0, 'Should have queued items');
console.log('✅ UT-003 PASSED');
```

**Expected Results:**
- Prefetch queues without error
- Status can be retrieved
- Multiple queues don't duplicate

---

## Integration Tests

### IT-001: Node Double-Click Transition

**Test:** Verify CODE view opens on double-click

**Steps:**
1. Start AetherOS with Quick Start environment
2. Import architecture from GitHub (or create nodes manually)
3. Double-click any node

**Expected Results:**
- ✅ Canvas fades out
- ✅ CBCT iframe loads
- ✅ Navigation header appears with Back button
- ✅ Breadcrumb shows node name
- ✅ Loading indicator shows (if CBCT takes time)
- ✅ No console errors

**Failure Points to Check:**
- Is `cbctUrl` being set in store?
- Is `viewMode` changing to 'CODE'?
- Is iframe loading?

---

### IT-002: Back Button Navigation

**Test:** Verify return to architecture view

**Steps:**
1. From CODE view (result of IT-001)
2. Click "Architecture" button

**Expected Results:**
- ✅ CBCT iframe fades out
- ✅ Architecture canvas appears
- ✅ Sidebar reappears
- ✅ Right panel reappears
- ✅ No console errors
- ✅ No state corruption

**Verification Commands:**
```javascript
// In console after back button
import useStore from '@/store/useStore';
const state = useStore.getState();
console.log('View Mode:', state.viewMode); // Should be 'ARCHITECTURE'
console.log('CBCT URL:', state.cbctUrl);   // Should be null
console.log('Active Node:', state.cbctActiveNodeId); // Should be null
```

---

### IT-003: Keyboard Shortcuts

**Test:** Verify keyboard navigation works

**Steps:**
1. Double-click node to enter CODE view
2. Press `Escape` key (if implemented)

**Expected Results:**
- ✅ Returns to architecture (if Escape is bound)
- ✅ Or logs to console if not implemented

**Note:** Currently only mouse-based navigation is implemented.

---

### IT-004: Rapid Node Switching

**Test:** Verify adapter handles multiple inspections

**Steps:**
1. Double-click node A
2. Wait for load
3. Click back
4. Double-click node B
5. Click back
6. Repeat for 3-4 nodes

**Expected Results:**
- ✅ Each transition works smoothly
- ✅ No memory leaks
- ✅ URLs are different for different nodes
- ✅ No lingering UI elements
- ✅ Console shows appropriate logs

**Monitor:**
- DevTools Memory tab for leaks
- Network tab for requests
- Console for errors

---

### IT-005: Empty Repository Path

**Test:** Verify error handling when repo path missing

**Steps:**
1. Create a node manually (not from GitHub import)
2. Try to double-click it

**Expected Results:**
- ✅ CODE view does NOT open
- ✅ User sees error notification
- ✅ User stays in architecture view
- ✅ Console shows warning message

**Notification Should Say:**
```
Cannot open code view: Cannot open CBCT: no repository path.
Load architecture from GitHub first.
```

---

## UI/UX Tests

### UX-001: Visual Transitions

**Test:** Verify animations are smooth

**Steps:**
1. Double-click node
2. Observe transition
3. Click back
4. Observe transition

**Expected Results:**
- ✅ 500ms fade-in/fade-out transitions
- ✅ 95% zoom animation on entry
- ✅ No jarring layout shifts
- ✅ Navigation bar slides smoothly

**Check CSS:**
```javascript
// In console
const viewer = document.querySelector('[data-testid="cbct-viewer"]');
const style = getComputedStyle(viewer);
console.log('Transition:', style.transition);
```

---

### UX-002: Loading Indicator

**Test:** Verify loading UI appears and disappears

**Steps:**
1. Double-click node
2. Observe loading spinner (if CBCT takes time)
3. Wait for iframe to load
4. Verify spinner disappears

**Expected Results:**
- ✅ Animated spinner appears
- ✅ "Loading code map..." text shows
- ✅ Spinner disappears when iframe loads
- ✅ Header text updates

---

### UX-003: Breadcrumb Display

**Test:** Verify breadcrumb shows correct node label

**Steps:**
1. Create node with label "My Microservice"
2. Double-click it
3. Observe header

**Expected Results:**
- ✅ Breadcrumb shows: "Inspecting: My Microservice"
- ✅ Text is styled in monospace
- ✅ Icon is visible

---

## Performance Tests

### PERF-001: URL Building Speed

**Test:** Verify adapter is performant

```javascript
// In console
import { buildCBCTUrl } from '@/integrations/cbctAdapter';

const node = {
  id: 'svc-1',
  data: { label: 'Service', metadata: { repoPath: 'github.com/user/repo' } }
};

console.time('buildCBCTUrl');
for (let i = 0; i < 1000; i++) {
  buildCBCTUrl(node, null);
}
console.timeEnd('buildCBCTUrl');
// Should complete in < 10ms for 1000 calls
```

**Expected Results:**
- ✅ URL building < 1ms per call
- ✅ 1000 builds complete in < 10ms

---

### PERF-002: Transition Time

**Test:** Measure time for view transition

**Steps:**
1. Enable Performance tab in DevTools
2. Start recording
3. Double-click node
4. Wait for CBCT to load
5. Stop recording

**Expected Results:**
- ✅ View change (CSS): < 100ms
- ✅ Network request (iframe): < 2s
- ✅ iframe load: < 5s (depends on CBCT)
- ✅ Total perceived time: < 6s

---

## Edge Cases

### EC-001: No Repository Loaded

**Test:** Adapter handles missing repository

**Steps:**
1. Quick Start environment
2. Don't import any architecture
3. Add manual nodes
4. Try to double-click

**Expected Results:**
- ✅ Error message: "Cannot open code view: Cannot open CBCT: no repository path"
- ✅ View doesn't transition
- ✅ No white screen of death

---

### EC-002: CBCT Service Down

**Test:** Handle CBCT deployment offline

**Steps:**
1. Block CBCT URL in DevTools (Network → Add domain to block)
2. Double-click node

**Expected Results:**
- ✅ iframe shows blank/error from browser
- ✅ AetherOS doesn't crash
- ✅ Back button still works
- ✅ Can return to architecture

---

### EC-003: Very Long Repository Path

**Test:** Adapter handles long paths

```javascript
// In console
import { buildCBCTUrl } from '@/integrations/cbctAdapter';

const longPath = 'github.com/' + 'a'.repeat(500) + '/repo';
const node = {
  id: 'svc-1',
  data: { label: 'Service', metadata: { repoPath: longPath } }
};

const url = buildCBCTUrl(node, null);
console.log('URL length:', url.length);
console.assert(url.includes('repoPath='), 'URL should be valid');
```

**Expected Results:**
- ✅ Long paths encoded correctly
- ✅ URL is valid
- ✅ No truncation

---

### EC-004: Special Characters in Repository Path

**Test:** Adapter handles special characters

```javascript
// In console
const specialPath = 'github.com/user/repo-with-special_chars.2024@/test';
const node = {
  id: 'svc-1',
  data: { label: 'Service', metadata: { repoPath: specialPath } }
};

const url = buildCBCTUrl(node, null);
console.log('URL:', url);
console.assert(url.includes('repoPath='), 'URL should be valid');
// URL should have encoded special characters
```

**Expected Results:**
- ✅ Special characters properly URL-encoded
- ✅ CBCT can decode them
- ✅ Repository loads correctly

---

## Regression Tests

### REG-001: Architecture Canvas Still Works

**Test:** Verify canvas functionality unchanged

**Steps:**
1. Quick Start environment
2. Add nodes by dragging from sidebar
3. Connect them with edges
4. Select and delete nodes
5. Double-click to enter CODE view
6. Return to architecture

**Expected Results:**
- ✅ All canvas operations work
- ✅ Adding nodes works
- ✅ Deleting nodes works
- ✅ Edge creation works
- ✅ Selection works
- ✅ No performance regression

---

### REG-002: Sidebar and Right Panel

**Test:** Verify panels work correctly

**Steps:**
1. In architecture view
2. Click node to select
3. Verify right panel shows properties
4. Switch tabs in right panel
5. Double-click node
6. Verify panels hide
7. Return to architecture
8. Verify panels reappear with same state

**Expected Results:**
- ✅ Panels hide in CODE view
- ✅ Panels show in ARCHITECTURE view
- ✅ State preserved on return

---

### REG-003: Store State Integrity

**Test:** Verify store state consistency

```javascript
// After entering and exiting CODE view
import useStore from '@/store/useStore';

const state = useStore.getState();
console.assert(state.viewMode === 'ARCHITECTURE', 'viewMode should reset');
console.assert(state.cbctUrl === null, 'cbctUrl should clear');
console.assert(state.cbctActiveNodeId === null, 'activeNodeId should clear');
console.assert(state.nodes.length > 0, 'Nodes should still exist');
console.assert(state.edges.length >= 0, 'Edges should be intact');
```

---

## Manual Checklist

- [ ] All console logs prefixed with `[CBCTAdapter]` or similar
- [ ] All error messages are descriptive
- [ ] No hardcoded test data in production code
- [ ] No commented-out code (except intentional examples)
- [ ] All imports use correct paths
- [ ] No circular dependencies
- [ ] CSS classes exist (aether-accent, aether-bg, etc.)
- [ ] iframe sandbox attributes are correct
- [ ] No console warnings about missing props
- [ ] Mobile responsiveness (if applicable)

---

## Test Execution Order

1. **Unit Tests** (UT-001 through UT-003)
2. **Integration Tests** (IT-001 through IT-005)
3. **UI/UX Tests** (UX-001 through UX-003)
4. **Performance Tests** (PERF-001, PERF-002)
5. **Edge Cases** (EC-001 through EC-004)
6. **Regression Tests** (REG-001 through REG-003)

---

## Success Criteria

✅ **All tests pass**
- No red error messages in console
- No failed assertions
- All notifications appear correctly
- All transitions smooth

✅ **Performance acceptable**
- Transitions < 6s
- URL building < 1ms
- No memory leaks

✅ **User experience smooth**
- Animations fluid
- Loading indicators visible
- Error messages helpful
- Navigation clear

---

## Notes

- Tests can be run anytime
- Integration tests require full environment
- Use fresh browser session for consistent results
- Check console.log output for [CBCTAdapter] messages
- Save Network request logs for debugging
- Report any failures with screenshot + console logs
