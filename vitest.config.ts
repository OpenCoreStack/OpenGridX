import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        typecheck: {
            tsconfig: './tsconfig.test.json',
        },
        coverage: {
            provider: 'v8',
            include: ['lib/**/*.{ts,tsx}'],
            exclude: ['lib/**/*.d.ts', 'lib/styles/**'],
        },
    },
    resolve: {
        alias: {
            '@opencorestack/opengridx': fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
        },
    },
});
