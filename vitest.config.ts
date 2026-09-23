import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath, URL } from 'node:url';

const BROWSER_TESTS = 'lib/**/*.browser.test.{ts,tsx}';

export default defineConfig({
    plugins: [react()],
    test: {
        coverage: {
            provider: 'v8',
            include: ['lib/**/*.{ts,tsx}'],
            exclude: ['lib/**/*.d.ts', 'lib/styles/**'],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'jsdom',
                    globals: true,
                    setupFiles: ['./src/test/setup.ts'],
                    exclude: ['**/node_modules/**', '**/dist/**', BROWSER_TESTS],
                    typecheck: { tsconfig: './tsconfig.test.json' },
                },
            },
            {
                // Real Chromium: layout, ResizeObserver and scrolling behave as in production.
                extends: true,
                test: {
                    name: 'browser',
                    include: [BROWSER_TESTS],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@opencorestack/opengridx': fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
        },
    },
});
