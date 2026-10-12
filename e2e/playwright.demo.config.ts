import { defineConfig, devices } from '@playwright/test';

// Demo-site smoke test. Run through `npm run test:demo`, which builds the demo site
// (`npm run build` -> demo/dist, served under the GitHub Pages base /OpenGridX/) first; this
// config only serves that build. Port 4322: 4318/4319/4321 belong to the package smoke suite,
// 4320 to the bench.
const DEMO_PORT = 4322;

const isCI = Boolean(process.env.CI);
const baseURL = `http://localhost:${DEMO_PORT}/OpenGridX/`;
const viewport = { width: 1400, height: 900 };

export default defineConfig({
  testDir: '.',
  testMatch: 'demo.spec.ts',
  outputDir: '../test-results/demo',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 4,
  reporter: isCI
    ? [['list'], ['html', { outputFolder: '../playwright-report/demo', open: 'never' }], ['github']]
    : [['list'], ['html', { outputFolder: '../playwright-report/demo', open: 'never' }]],
  use: { viewport, baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    // Every route in Chromium; the heavy pages (titles tagged @heavy) in Firefox and WebKit too.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport, baseURL } },
    { name: 'firefox', grep: /@heavy/, use: { ...devices['Desktop Firefox'], viewport, baseURL } },
    { name: 'webkit', grep: /@heavy/, use: { ...devices['Desktop Safari'], viewport, baseURL } },
  ],
  webServer: {
    command: `npx vite preview --port ${DEMO_PORT} --strictPort`,
    cwd: '..',
    url: baseURL,
    // Never reuse: a server left over from another checkout would serve a different build.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
