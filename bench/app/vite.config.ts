import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Cross-origin isolation gives every engine fine-grained performance.now() values (Firefox rounds
// them to 1 ms otherwise). Port 4320: the smoke fixtures use 4318 and 4319.
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 4000 },
  preview: { port: 4320, strictPort: true, headers: isolation },
});
