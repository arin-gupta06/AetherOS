# Environment Configuration for Production

## Setup Instructions

### 1. Create `.env.production` (for production builds)

```env
# CBCT Integration
VITE_CBCT_BASE_URL=https://cbct-code-base-cartographic-tool-cl.vercel.app/

# Feature Flags
VITE_DEBUG_CBCT_ADAPTER=false
VITE_PREFETCH_ENABLED=true
```

### 2. Create `.env.development` (for local development)

```env
# CBCT Integration
VITE_CBCT_BASE_URL=https://cbct-code-base-cartographic-tool-cl.vercel.app/

# Feature Flags
VITE_DEBUG_CBCT_ADAPTER=true
VITE_PREFETCH_ENABLED=true
```

### 3. Update `.env.example` (for reference)

```env
# CBCT Integration Configuration
# URL where CBCT is deployed
VITE_CBCT_BASE_URL=https://cbct-code-base-cartographic-tool-cl.vercel.app/

# Debugging
# Set to true in development to enable verbose logging
VITE_DEBUG_CBCT_ADAPTER=false

# Performance
# Enable background prefetch of CBCT analysis
VITE_PREFETCH_ENABLED=true
```

### 4. Update `cbctAdapter.js` to use environment variables

Replace the CBCT_CONFIG definition with:

```javascript
/**
 * CBCT System Configuration
 */
const CBCT_CONFIG = {
  // Primary CBCT deployment URL (from environment)
  baseUrl: import.meta.env.VITE_CBCT_BASE_URL || 
    'https://cbct-code-base-cartographic-tool-cl.vercel.app/',
  
  // API endpoints
  apiEndpoints: {
    analyze: '/api/analyze',
    prefetch: '/api/prefetch',
    health: '/api/health'
  },
  
  // Debug flag
  debug: import.meta.env.VITE_DEBUG_CBCT_ADAPTER === 'true',
  
  // Query parameters for embedded mode
  queryParams: {
    mode: 'embedded',
    repoPath: null
  }
};
```

### 5. Update logging to respect debug flag

Replace console calls with conditional logging:

```javascript
// In cbctAdapter.js functions

export function buildCBCTUrl(node, lastInferredRepo) {
  const repoPath = lastInferredRepo || node?.data?.metadata?.repoPath;
  
  if (!repoPath) {
    if (CBCT_CONFIG.debug) {
      console.warn('[CBCTAdapter] No repository path found...');
    }
    return null;
  }

  const params = new URLSearchParams({
    repoPath,
    mode: 'embedded'
  });

  const url = `${CBCT_CONFIG.baseUrl}?${params.toString()}`;
  
  if (CBCT_CONFIG.debug) {
    console.debug('[CBCTAdapter] Built CBCT URL:', { repoPath, url: url.split('?')[0] });
  }

  return url;
}
```

---

## Deployment Checklist

### Before Deployment

- [ ] All environment variables defined in `.env.production`
- [ ] CBCT deployment URL verified and accessible
- [ ] Build completes without errors: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] Double-click, CODE view transitions work
- [ ] Back button navigation works
- [ ] No console errors or warnings
- [ ] CBCT_BASE_URL is accessible from your infrastructure

### Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Run tests:**
   ```bash
   npm run test
   ```

3. **Deploy dist/ folder** to your hosting (Vercel, AWS, etc.)

4. **Verify post-deployment:**
   - Visit your deployed site
   - Open DevTools Console
   - Import a repository
   - Double-click a node
   - Verify iframe loads from `VITE_CBCT_BASE_URL`
   - Click back button
   - Verify return to architecture view

### Monitoring

Set up monitoring for:

1. **Error Logs:**
   - Search for `[CBCTAdapter]` error messages
   - Alert on repeated "Cannot open CBCT" errors

2. **Performance:**
   - Monitor iframe load time
   - Track prefetch success rate
   - Alert if average transition time > 3s

3. **User Feedback:**
   - Monitor for "blank CODE view" reports
   - Track "Cannot open code view" notifications

---

## Rollback Plan

If issues arise with CBCT integration:

### Option 1: Disable CBCT (Quick Fix)

```javascript
// In cbctAdapter.js - Temporary disable
export function openCBCTContext(node, lastInferredRepo) {
  throw new Error('CBCT integration temporarily disabled for maintenance');
}
```

### Option 2: Use Older CBCT URL

```bash
# Update environment variable
VITE_CBCT_BASE_URL=https://cbct-old-version.vercel.app/
npm run build
# Redeploy
```

### Option 3: Full Rollback

If integration is critical:
1. Revert AetherOS to previous commit before adapter implementation
2. Users will lose CODE view, but architecture view still works
3. Minimal impact - no data loss

---

## Security Considerations

### HTTPS Enforcement

The CBCT URL must use HTTPS:
- ✅ `https://cbct-code-base-cartographic-tool-cl.vercel.app/` (secure)
- ❌ `http://cbct-...` (insecure, will be blocked)

### iframe Sandbox Security

The sandbox attribute is correctly set:
```html
<iframe sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
```

This allows:
- ✅ Scripts to run within CBCT
- ✅ Forms to submit (needed for CBCT search)
- ✅ Popups to open (context menus, etc.)

This blocks:
- ❌ Top-level navigation (can't redirect user)
- ❌ Top-level form submission (can't hijack outer page)
- ❌ Access to parent window

### Content Security Policy

Recommend adding to your server headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  frame-src https://cbct-code-base-cartographic-tool-cl.vercel.app/;
  connect-src 'self' https://api.github.com https://cbct-code-base-cartographic-tool-cl.vercel.app/;
```

---

## Performance Tuning

### Prefetch Strategy

Default: Prefetch triggered after architecture import

```javascript
// In useStore.js importInferredGraph()
if (repoPath) {
  queuePrefetch(repoPath);  // Non-blocking, background
}
```

**Behavior:**
- Max 2 concurrent prefetches
- 5-second timeout per prefetch
- Non-blocking (doesn't affect main thread)

### To Disable Prefetch:

```javascript
// In environment
VITE_PREFETCH_ENABLED=false

// In code
if (import.meta.env.VITE_PREFETCH_ENABLED !== 'false' && lastInferredRepo) {
  queuePrefetch(lastInferredRepo);
}
```

### To Increase Concurrency:

```javascript
// In cbctPrefetch.js
const maxConcurrentPrefetches = 4;  // Increase from 2
```

---

## Troubleshooting Guide

### Issue: "Cannot open code view: Cannot open CBCT: no repository path"

**Cause:** User tried to inspect a node without a repository path

**Solution:**
1. User should import architecture from GitHub first
2. Or, manually set node.data.metadata.repoPath

**Check in Console:**
```javascript
const nodes = useStore.getState().nodes;
console.log('Repository paths:', nodes.map(n => ({
  id: n.id,
  label: n.data.label,
  repoPath: n.data.metadata?.repoPath
})));
```

### Issue: iframe loads but shows blank page

**Cause:** CBCT deployment is offline or URL is wrong

**Solution:**
1. Check CBCT deployment: `curl https://cbct-code-base-cartographic-tool-cl.vercel.app/`
2. Verify URL in logs: `[CBCTAdapter] Built CBCT URL`
3. Update `VITE_CBCT_BASE_URL` if needed

**Check in Console:**
```javascript
import { getCBCTConfig } from '@/integrations/cbctAdapter';
console.log('CBCT URL:', getCBCTConfig().baseUrl);
```

### Issue: Slow CODE view loading

**Cause:** CBCT analysis takes time on first load

**Solution:**
- This is normal
- Subsequent loads should be instant (prefetch cache)
- If consistently slow (> 10s), check CBCT server performance

### Issue: Back button doesn't work

**Cause:** Rare race condition or state corruption

**Solution:**
1. Refresh the page
2. Check console for errors
3. If persists, disable and re-enable:
   ```javascript
   // In console
   const { exitCodeView } = useStore.getState();
   exitCodeView();
   ```

---

## Version Compatibility

| Component | Minimum Version | Tested | Notes |
|-----------|-----------------|--------|-------|
| React | 16.8 | 18.2 | Uses hooks |
| Zustand | 3.0 | 4.x | State management |
| Lucide Icons | 0.100 | Latest | Icons only |
| Node.js | 14 | 18.x | Build tooling |
| Vite | 4.0 | 4.x | Build system |

---

## Support Contacts

**For CBCT Integration Issues:**
- Check `PRODUCTION_READINESS_AUDIT.md` for detailed analysis
- Check `ADAPTER_INTEGRATION_GUIDE.md` for API reference
- Review browser console logs (search for `[CBCTAdapter]`)

**For CBCT Deployment Issues:**
- Contact CBCT team
- Verify `VITE_CBCT_BASE_URL` is correctly set
- Check network connectivity to CBCT URL

**For AetherOS Issues:**
- Check GitHub issues
- Review CHANGES.md for recent updates
