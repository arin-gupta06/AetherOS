import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../CodeBase-CartoGraphic-Tool-CBCT-/client/src")
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: ['..', '../../../CodeBase-CartoGraphic-Tool-CBCT-/']
    },
    proxy: {
      '/api': 'http://127.0.0.1:4000',
      '/ws': {
        target: 'ws://127.0.0.1:4000',
        ws: true
      }
    }
  }
});
