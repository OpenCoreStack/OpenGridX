import { test, expect, type Page } from '@playwright/test';

// The nopeers fixture is a webpack 5 app that installed the tarball WITHOUT exceljs, jspdf and
// jspdf-autotable. That it built at all is the main check (scripts/smoke.mjs fails otherwise);
// here it must render the grid, and the two exports must reject with an install hint instead of
// crashing the page.

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test('renders the grid without the optional peers', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('[role="grid"]')).toBeVisible();
  await expect(page.locator('.ogx__viewport [role="row"][data-rowindex="0"] [data-field="name"]')).toHaveText('Alpha');
  expect(errors).toEqual([]);
});

test('exports reject with an install hint', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  const status = page.getByTestId('status');
  await page.getByTestId('export-xlsx').click();
  await expect(status).toHaveText("exportToExcelAdvanced requires 'exceljs'. Run: npm install exceljs");
  await page.getByTestId('export-pdf').click();
  await expect(status).toHaveText("exportToPdf requires 'jspdf' and 'jspdf-autotable'. Run: npm install jspdf jspdf-autotable");
  await expect(page.locator('[role="grid"]')).toBeVisible();
  expect(errors).toEqual([]);
});
