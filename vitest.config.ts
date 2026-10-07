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

// Low-level mouse for drag tests (Playwright input, so it works in every engine). The pointer moves
// to a point of an element in the test iframe (its centre, or x / y in the iframe's CSS pixels from
// its top-left corner, which may lie outside it), and the left button is pressed and released apart,
// so a test can hold it down while the grid auto-scrolls.
const pointerMoveTo: BrowserCommand<[selector: string, x?: number, y?: number]> = async (ctx, selector, x, y) => {
    const locator = ctx.iframe.locator(selector).first();
    if (x === undefined || y === undefined) {
        await locator.hover({ force: true });
        return;
    }
    const box = await locator.boundingBox();
    if (!box) throw new Error(`pointerMoveTo: ${selector} is not rendered`);
    // The test iframe can be drawn scaled: page pixels per CSS pixel of the element.
    const cssWidth = await locator.evaluate((el) => el.getBoundingClientRect().width);
    const scale = cssWidth > 0 ? box.width / cssWidth : 1;
    await ctx.page.mouse.move(box.x + x * scale, box.y + y * scale);
};
const pointerDown: BrowserCommand<[]> = async (ctx) => {
    await ctx.page.mouse.down();
};
const pointerUp: BrowserCommand<[]> = async (ctx) => {
    await ctx.page.mouse.up();
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
                        commands: { setColorScheme, pointerMoveTo, pointerDown, pointerUp },
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
