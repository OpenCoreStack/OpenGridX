import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Demo-site smoke test (`npm run test:demo`, config e2e/playwright.demo.config.ts).
// Every route of the demo site (`examplesConfig` in demo/App.tsx) is read from the source so the
// list cannot go stale; the first test checks the built sidebar links to exactly these routes.
const appSource = readFileSync(fileURLToPath(new URL('../demo/App.tsx', import.meta.url)), 'utf8');
const routes = [...appSource.matchAll(/\{\s*path:\s*'(\/[^']*)'/g)].map((m) => m[1]);

// Pages that also run in Firefox and WebKit: interaction-heavy, large data, RTL, theming and the theme builder.
const HEAVY = new Set(['/cell-selection', '/ai-assistant', '/full-test', '/rtl', '/theming', '/theme-builder', '/pivot', '/infinite']);

// Console messages a page may log on purpose. Each entry needs a comment saying why.
const ALLOWED_CONSOLE: { route: string | null; pattern: RegExp }[] = [];

// A grid has rendered when it shows a row, or an intentional empty / loading / error state.
const RENDERED = [
  '.ogx__row',
  '.ogx-list-view__row',
  '.ogx__empty',
  '.ogx__loading-overlay',
  '.ogx-list-view__empty',
  '.ogx-list-view__loading',
  '.ogx-error-overlay',
].join(', ');

// Network idle: no request in flight for IDLE_MS. Counted from the request events rather than with
// waitForLoadState('networkidle'), which in Firefox under parallel workers sometimes never fires
// on an idle page (pivot, infinite) although every request has finished.
const IDLE_MS = 500;

function trackRequests(page: Page): () => Promise<void> {
  const inflight = new Set<unknown>();
  let lastChange = Date.now();
  page.on('request', (r) => { inflight.add(r); lastChange = Date.now(); });
  const done = (r: unknown) => { inflight.delete(r); lastChange = Date.now(); };
  page.on('requestfinished', done);
  page.on('requestfailed', done);
  return () =>
    expect
      .poll(() => inflight.size === 0 && Date.now() - lastChange >= IDLE_MS, { message: 'network idle', intervals: [100] })
      .toBe(true);
}

function collectProblems(page: Page, route: string): string[] {
  const problems: string[] = [];
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    const type = msg.type();
    if (type !== 'error' && type !== 'warning') return;
    const text = msg.text();
    if (ALLOWED_CONSOLE.some((a) => (a.route === null || a.route === route) && a.pattern.test(text))) return;
    problems.push(`console.${type}: ${text}`);
  });
  return problems;
}

test('the route list from demo/App.tsx matches the sidebar', async ({ page }) => {
  expect(routes.length).toBeGreaterThan(40);
  expect(new Set(routes).size).toBe(routes.length);
  await page.goto('home');
  const hrefs = await page
    .locator('nav.app-sidebar a.sidebar-nav-button[href^="/OpenGridX/"]')
    .evaluateAll((links) => links.map((a) => (a.getAttribute('href') ?? '').replace(/^\/OpenGridX/, '')));
  expect([...hrefs].sort()).toEqual([...routes].sort());
});

for (const route of routes) {
  test(`${route} renders without errors${HEAVY.has(route) ? ' @heavy' : ''}`, async ({ page }) => {
    const problems = collectProblems(page, route);
    const networkIdle = trackRequests(page);
    await page.goto(route.slice(1));
    await networkIdle();

    // The lazy route chunk has replaced the Suspense fallback and the page has content.
    await expect(page.locator('.demo-skeleton-container')).toHaveCount(0);
    const main = page.locator('main.app-main-content');
    await expect(main).not.toBeEmpty();
    expect((await main.innerText()).trim().length, 'main content has text').toBeGreaterThan(20);

    // Every grid root on the page (nested detail-panel grids included) has rendered.
    const grids = page.locator('[class~="ogx"]');
    const count = await grids.count();
    for (let i = 0; i < count; i++) {
      await expect(grids.nth(i).locator(RENDERED).first(), `grid #${i + 1} rendered a row or an empty state`).toBeAttached();
    }

    expect(problems, 'console errors, warnings and page errors').toEqual([]);
  });
}
