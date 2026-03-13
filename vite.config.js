/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  base: '/OpenGridX/',
  plugins: [react()],
  root: './demo',
  resolve: {
    alias: {
      '@opencorestack/opengridx': fileURLToPath(new URL('./lib/index.ts', import.meta.url))
    }
  },
  build: {
    sourcemap: 'inline',
    // Raise the warning threshold — the DataGrid library is intentionally large
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React + ReactDOM → stable vendor chunk (cached across deploys)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // DataGrid library code → its own chunk, shared by all demos
          if (id.includes('/lib/')) {
            return 'opengridx';
          }
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: 'inline'
    }
  }
});