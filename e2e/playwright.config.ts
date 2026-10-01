import { defineConfig, devices } from '@playwright/test';

// Package smoke suite. Run through `npm run test:smoke`, which packs the library, installs and
// builds the consumer fixtures first; this config only serves their production builds.

const fixtures = [
  { name: 'react19', port: 4319 },
  { name: 'react18', port: 4318 },
] as const;

const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
] as const;

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: '.',
  testMatch: 'smoke.spec.ts',
  outputDir: '../test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 4,
  reporter: isCI
    ? [['list'], ['html', { outputFolder: '../playwright-report', open: 'never' }], ['github']]
    : [['list'], ['html', { outputFolder: '../playwright-report', open: 'never' }]],
  use: {
    viewport: { width: 1400, height: 900 },
    acceptDownloads: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: browsers.flatMap((b) =>
    fixtures.map((f) => ({
      name: `${b.name}-${f.name}`,
      metadata: { fixture: f.name },
      use: { ...b.device, viewport: { width: 1400, height: 900 }, baseURL: `http://localhost:${f.port}` },
    })),
  ),
  webServer: fixtures.map((f) => ({
    command: `npx vite preview --port ${f.port} --strictPort`,
    cwd: `fixtures/${f.name}`,
    url: `http://localhost:${f.port}`,
    // Never reuse: a server left over from another checkout would serve a different build.
    reuseExistingServer: false,
    timeout: 60_000,
  })),
});
