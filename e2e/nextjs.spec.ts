import { test, expect, type Page } from '@playwright/test';

// The nextjs fixture: a Next.js App Router app (Turbopack, `next build` + `next start`) without the
// optional export peers. That it built is the first check (scripts/smoke.mjs fails otherwise). Here the
// server-rendered page must contain the grid, hydrate without console errors, and an optional-peer
// export must reject with an install hint.

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test('the server-rendered page holds the grid, and it hydrates without errors', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('role="grid"');
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('.ogx__viewport [role="row"][data-rowindex="0"] [data-field="customer"]')).toHaveText('Anna');
  await page.locator('.ogx__header [data-field="customer"] .ogx__header-cell-title').click();
  await expect(page.locator('.ogx__header [data-field="customer"]')).toHaveAttribute('aria-sort', 'ascending');
  expect(errors).toEqual([]);
});

test('an optional-peer export rejects with an install hint', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('export-xlsx').click();
  await expect(page.getByTestId('status')).toHaveText("exportToExcelAdvanced requires 'exceljs'. Run: npm install exceljs");
  expect(errors).toEqual([]);
});
