/**
 * Vitest Configuration
 * 
 * Test framework setup for unit, integration, and performance testing
 * Includes coverage thresholds, reporters, and environment setup
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Environment setup
    environment: 'node',
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.spec.js',
        '**/dist/**'
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      reports: {
        skipFull: true,
        all: true
      }
    },

    // Test file configuration
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Reporter setup
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    },

    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,

    // Setup files
    setupFiles: ['./tests/setup.js'],

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Watch mode
    watch: false,
    changed: false,

    // Bail configuration
    bail: 0, // Don't bail on first failure
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Isolate test environment
    isolate: true
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@server': path.resolve(__dirname, './server/src')
    }
  }
});
