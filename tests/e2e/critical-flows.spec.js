/**
 * E2E Tests - Critical User Flows
 * 
 * Tests complete workflows from user perspective
 * Covers: graph import, CODE view, architecture export, GitHub analysis
 */

import { test, expect } from '@playwright/test';

test.describe('AetherOS Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173/');
    // Wait for initial load
    await page.waitForSelector('[data-testid="modeling-canvas"]', { timeout: 10000 });
  });

  test.describe('Graph Import & Visualization', () => {
    test('should import architecture from GitHub', async ({ page }) => {
      // Click GitHub import
      await page.click('[data-testid="github-import-btn"]');
      
      // Enter repository URL
      await page.fill('[name="repoUrl"]', 'https://github.com/test/app');
      
      // Submit import
      await page.click('[data-testid="submit-import"]');
      
      // Wait for nodes to appear
      await page.waitForSelector('.react-flow__nodes', { timeout: 30000 });
      
      // Verify nodes are rendered
      const nodeCount = await page.locator('.react-flow__node').count();
      expect(nodeCount).toBeGreaterThan(0);
    });

    test('should display architecture nodes with metadata', async ({ page }) => {
      // Setup: Import a graph first (via API or UI)
      await page.goto('http://localhost:5173/?graph=test');
      await page.waitForSelector('.react-flow__node');
      
      // Click on a node
      await page.click('.react-flow__node >> first-of-type');
      
      // Verify node details appear in right panel
      const rightPanel = page.locator('[data-testid="right-panel"]');
      await expect(rightPanel).toBeVisible();
      
      // Check for metadata
      const nodeLabel = await rightPanel.locator('[data-testid="node-label"]').textContent();
      expect(nodeLabel).toBeTruthy();
    });

    test('should render edges between nodes', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      
      // Wait for SVG edges
      const edges = page.locator('.react-flow__edge');
      const edgeCount = await edges.count();
      
      expect(edgeCount).toBeGreaterThan(0);
    });
  });

  test.describe('CODE View Integration', () => {
    test('should enter CODE view on node double-click', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      await page.waitForSelector('.react-flow__node');
      
      // Double-click on node
      await page.dblclick('.react-flow__node >> first-of-type');
      
      // Wait for CODE view to appear
      await page.waitForSelector('[data-testid="code-viewer"]', { timeout: 10000 });
      
      // Verify CODE view is active
      const viewMode = await page.locator('[data-testid="view-mode"]').textContent();
      expect(viewMode).toContain('CODE');
    });

    test('should display code files in CODE view', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test&view=code');
      
      // Wait for file tree
      await page.waitForSelector('[data-testid="file-tree"]', { timeout: 10000 });
      
      // Verify files are listed
      const files = page.locator('[data-testid="file-item"]');
      const fileCount = await files.count();
      expect(fileCount).toBeGreaterThan(0);
    });

    test('should render code viewer content', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test&view=code');
      
      await page.waitForSelector('[data-testid="code-content"]', { timeout: 10000 });
      
      const codeContent = await page.locator('[data-testid="code-content"]').textContent();
      expect(codeContent).toBeTruthy();
    });

    test('should exit CODE view and return to ARCHITECTURE view', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test&view=code');
      
      // Click exit button
      const exitBtn = page.locator('[data-testid="exit-code-view"]');
      await exitBtn.click();
      
      // Wait for ARCHITECTURE view
      await page.waitForSelector('[data-testid="modeling-canvas"]', { timeout: 5000 });
      
      // Verify view mode changed
      const viewMode = await page.locator('[data-testid="view-mode"]').textContent();
      expect(viewMode).toContain('ARCHITECTURE');
    });

    test('should cache CODE view data for fast access', async ({ page }) => {
      const timings = [];
      
      // First access - slower
      await page.goto('http://localhost:5173/?graph=test');
      const start1 = Date.now();
      await page.dblclick('.react-flow__node >> first-of-type');
      await page.waitForSelector('[data-testid="code-viewer"]');
      timings.push(Date.now() - start1);
      
      // Exit
      await page.click('[data-testid="exit-code-view"]');
      
      // Second access on same node - should be faster (cached)
      const start2 = Date.now();
      await page.dblclick('[data-testid="selected-node"]');
      await page.waitForSelector('[data-testid="code-viewer"]');
      timings.push(Date.now() - start2);
      
      // Second access should be notably faster
      expect(timings[1]).toBeLessThan(timings[0] * 0.8); // At least 20% faster
    });
  });

  test.describe('Architecture Export', () => {
    test('should export graph to JSON', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      
      // Open export menu
      await page.click('[data-testid="export-menu"]');
      
      // Click JSON export
      await page.click('[data-testid="export-json"]');
      
      // Handle download
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
      
      // Wait for success message
      await page.waitForSelector('[data-testid="export-success"]');
    });

    test('should export graph to image (SVG)', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      
      // Open export menu
      await page.click('[data-testid="export-menu"]');
      
      // Click SVG export
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-svg"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.svg');
    });

    test('should generate Terraform code', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      
      // Open export menu
      await page.click('[data-testid="export-menu"]');
      
      // Click Terraform export
      await page.click('[data-testid="export-terraform"]');
      
      // Wait for code to appear
      await page.waitForSelector('[data-testid="terraform-code"]', { timeout: 5000 });
      
      // Verify terraform syntax
      const tfCode = await page.locator('[data-testid="terraform-code"]').textContent();
      expect(tfCode).toContain('provider');
      expect(tfCode).toContain('resource');
    });
  });

  test.describe('GitHub Integration', () => {
    test('should analyze repository structure', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Click GitHub Analyzer
      await page.click('[data-testid="github-analyzer-btn"]');
      
      // Enter repo URL
      await page.fill('[name="githubUrl"]', 'https://github.com/test/repo');
      
      // Click analyze
      await page.click('[data-testid="analyze-btn"]');
      
      // Wait for results
      await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 30000 });
      
      // Verify results
      const results = await page.locator('[data-testid="analysis-results"]').textContent();
      expect(results).toBeTruthy();
    });

    test('should display GitHub metrics', async ({ page }) => {
      await page.goto('http://localhost:5173/?github=test/repo');
      
      // Wait for metrics panel
      await page.waitForSelector('[data-testid="github-metrics"]', { timeout: 10000 });
      
      // Verify metrics present
      const stars = page.locator('[data-testid="metric-stars"]');
      const forks = page.locator('[data-testid="metric-forks"]');
      const issues = page.locator('[data-testid="metric-issues"]');
      
      await expect(stars).toBeVisible();
      await expect(forks).toBeVisible();
      await expect(issues).toBeVisible();
    });
  });

  test.describe('Performance & Responsiveness', () => {
    test('should load initial view in <3 seconds', async ({ page }) => {
      const start = Date.now();
      await page.goto('http://localhost:5173/');
      await page.waitForSelector('[data-testid="modeling-canvas"]');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(3000);
    });

    test('should transition to CODE view in <1 second', async ({ page }) => {
      await page.goto('http://localhost:5173/?graph=test');
      await page.waitForSelector('.react-flow__node');
      
      const start = Date.now();
      await page.dblclick('.react-flow__node >> first-of-type');
      await page.waitForSelector('[data-testid="code-viewer"]');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000);
    });

    test('should handle 1000+ node graph without lag', async ({ page }) => {
      // This would require a test graph with many nodes
      await page.goto('http://localhost:5173/?graph=large-1000');
      
      // Measure interaction performance
      const start = Date.now();
      await page.click('.react-flow__node >> nth=500'); // Click middle node
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should respond within 500ms
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid repo URL gracefully', async ({ page }) => {
      await page.goto('http://localhost:5173/');
      
      // Click GitHub import
      await page.click('[data-testid="github-import-btn"]');
      
      // Enter invalid URL
      await page.fill('[name="repoUrl"]', 'not-a-valid-url');
      await page.click('[data-testid="submit-import"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="error-message"]');
      const errorMsg = await page.locator('[data-testid="error-message"]').textContent();
      expect(errorMsg).toBeTruthy();
    });

    test('should recover from failed API calls', async ({ page }) => {
      await page.route('**/api/github/**', route => route.abort());
      
      await page.goto('http://localhost:5173/');
      await page.click('[data-testid="github-import-btn"]');
      await page.fill('[name="repoUrl"]', 'https://github.com/test/repo');
      await page.click('[data-testid="submit-import"]');
      
      // Should show error
      await page.waitForSelector('[data-testid="error-message"]');
      
      // Should still be able to interact with UI
      const retryBtn = page.locator('[data-testid="retry-btn"]');
      await expect(retryBtn).toBeVisible();
    });
  });
});

// --- Accessibility Tests ---
test.describe('Accessibility (A11y)', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const text = await button.textContent();
      
      // Should have some label
      expect(ariaLabel || title || text).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Tab through interactive elements
    let tabCount = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (['BUTTON', 'INPUT', 'A'].includes(focused)) {
        tabCount++;
      }
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });
});
