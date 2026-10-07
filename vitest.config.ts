import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath, URL } from 'node:url';
import type { BrowserCommand } from 'vitest/node';

// Engine-neutral prefers-color-scheme emulation (Playwright's emulateMedia works in Chromium,
// Firefox and WebKit; CDP's Emulation.setEmulatedMedia is Chromium-only).
const setColorScheme: BrowserCommand<['light' | 'dark' | null]> = async (ctx, colorScheme) => {
    await ctx.page.emulateMedia({ colorScheme });
};

const BROWSER_TESTS = 'lib/**/*.browser.test.{ts,tsx}';

// REACT_COMPILER=1 runs the suites against lib/ compiled by React Compiler (tests stay as written).
// See docs/contributing/react-compiler.md.
const reactCompiler = process.env.REACT_COMPILER
    ? { babel: { plugins: [['babel-plugin-react-compiler', {
        target: '19',
        sources: (filename: string) => /[\\/]lib[\\/]/.test(filename) && !/\.test\.tsx?$/.test(filename),
    }]] } }
    : undefined;

export default defineConfig({
    plugins: [react(reactCompiler)],
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
                    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', BROWSER_TESTS],
                    typecheck: { tsconfig: './tsconfig.test.json' },
                },
            },
            {
                // Real Chromium, Firefox and WebKit: layout, ResizeObserver and scrolling behave as in production.
                // Files run one at a time: several test pages open at once in one Firefox lose focus and
                // pointer input to each other, which makes focus and editing tests fail at random.
                extends: true,
                test: {
                    name: 'browser',
                    include: [BROWSER_TESTS],
                    fileParallelism: false,
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        commands: { setColorScheme },
                        instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
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
