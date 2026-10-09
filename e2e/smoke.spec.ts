import { readFileSync } from 'node:fs';
import { test, expect, type ConsoleMessage, type Locator, type Page } from '@playwright/test';

// Package smoke suite: every test drives a production build of a consumer app that installed the
// packed tarball (see scripts/smoke.mjs). It checks what only a real install can show: the
// package resolves, its types compile, it renders under React 18 and 19, its CSS lays out, and
// optional peers (exceljs, jspdf) load from the consumer's node_modules.

/** Console output that is expected and harmless. Keep this list short and explain every entry. */
const ALLOWED_CONSOLE: RegExp[] = [];

const REACT18_SCENARIOS = new Set(['basic', 'flex', 'grouping', 'editing', 'range', 'paste', 'ai', 'ai-assistant', 'header-filters', 'fill']);

function fixtureOf(projectName: string): string {
  return projectName.split('-')[1] ?? '';
}

interface ConsoleRecord {
  type: string;
  text: string;
}

async function openScenario(page: Page, scenario: string): Promise<ConsoleRecord[]> {
  test.skip(fixtureOf(test.info().project.name) === 'react18' && !REACT18_SCENARIOS.has(scenario), 'React 19 fixture only');
  const records: ConsoleRecord[] = [];
  page.on('console', (m: ConsoleMessage) => {
    const type = m.type();
    if (type !== 'error' && type !== 'warning') return;
    const text = m.text();
    if (ALLOWED_CONSOLE.some((re) => re.test(text))) return;
    records.push({ type, text });
  });
  page.on('pageerror', (e) => records.push({ type: 'pageerror', text: String(e) }));
  await page.goto(`/?scenario=${scenario}`);
  try {
    await expect(page.locator('[role="grid"]').first()).toBeVisible();
    await expect(centerRow(page, 0)).toBeVisible();
  } catch (e) {
    // Surface what the page logged: a render failure usually shows up there first.
    throw new Error(`grid did not render. Console: ${JSON.stringify(records, null, 2)}\n${String(e)}`);
  }
  return records;
}

function viewport(page: Page): Locator {
  return page.locator('.ogx__viewport').first();
}

/** A rendered body row by its center-row index (pinned rows are excluded). */
function centerRow(page: Page, index: number): Locator {
  return page.locator(`.ogx__viewport [role="row"][data-rowindex="${index}"]`).first();
}

function cell(row: Locator, field: string): Locator {
  return row.locator(`[data-field="${field}"]`).first();
}

function renderedRows(page: Page): Locator {
  return page.locator('.ogx__viewport [role="row"][data-rowindex]');
}

async function scrollToBottom(page: Page): Promise<void> {
  await viewport(page).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
}

const parseAmount = (s: string): number => Number(s.replace(/[^0-9.-]/g, ''));

test.describe('package smoke', () => {
  let consoleRecords: ConsoleRecord[] = [];

  test.afterEach(() => {
    const records = consoleRecords;
    consoleRecords = [];
    expect(records, 'no console errors or warnings').toEqual([]);
  });

  test('basic: sort, quick filter, selection, pagination', async ({ page }) => {
    consoleRecords = await openScenario(page, 'basic');

    // Sort by Amount ascending.
    const amountHeader = page.getByRole('columnheader', { name: 'Amount' }).first();
    await amountHeader.click();
    await expect(amountHeader).toHaveAttribute('aria-sort', 'ascending');
    const sorted = await Promise.all([0, 1, 2, 3].map((i) => cell(centerRow(page, i), 'amount').innerText()));
    const values = sorted.map(parseAmount);
    expect(values, `ascending amounts: ${sorted.join(', ')}`).toEqual([...values].sort((a, b) => a - b));

    // Pagination: next page shows different rows.
    const firstDoc = await cell(centerRow(page, 0), 'docNo').innerText();
    await page.getByRole('button', { name: /next page/i }).first().click();
    await expect(cell(centerRow(page, 0), 'docNo')).not.toHaveText(firstDoc);
    await page.getByRole('button', { name: /previous page/i }).first().click();
    await expect(cell(centerRow(page, 0), 'docNo')).toHaveText(firstDoc);

    // Quick filter narrows to one customer.
    await page.getByPlaceholder('Search...').fill('Globex');
    await expect(async () => {
      const customers = (await page.locator('.ogx__viewport [data-rowindex] [data-field="customer"]').allInnerTexts()).map((c) => c.trim());
      expect(customers.length).toBeGreaterThan(0);
      expect(customers.filter((c) => c !== 'Globex'), 'rows left after quick filter').toEqual([]);
    }).toPass();

    // Checkbox selection.
    const boxes = page.getByRole('checkbox', { name: /^Select row/ });
    // The native input is visually hidden behind the styled box; click the box as a user does.
    await boxes.nth(0).locator('xpath=..').click();
    await boxes.nth(1).locator('xpath=..').click();
    await expect(page.getByTestId('selection-count')).toHaveText('selected: 2');
  });

  test('flex: fills an ERP flex shell without a height prop and virtualizes 50k rows', async ({ page }) => {
    consoleRecords = await openScenario(page, 'flex');

    const region = await page.getByTestId('grid-region').boundingBox();
    const grid = await page.locator('.ogx').first().boundingBox();
    expect(region && grid).toBeTruthy();
    if (!region || !grid) return;
    // The grid fills its flex region (within a pixel) instead of growing to its content.
    expect(Math.abs(grid.height - region.height), `grid ${grid.height}px vs region ${region.height}px`).toBeLessThan(2);
    expect(grid.y + grid.height).toBeLessThanOrEqual(900 + 1);

    const vp = await viewport(page).evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }));
    expect(vp.client, 'viewport is bounded').toBeLessThan(900);
    expect(vp.scroll, 'viewport scrolls over all rows').toBeGreaterThan(vp.client * 100);

    await scrollToBottom(page);
    await expect(page.locator('.ogx__viewport [data-field="docNo"]', { hasText: 'INV-050000' })).toBeVisible();
    const count = await renderedRows(page).count();
    expect(count, 'rendered rows at the bottom of 50k').toBeLessThan(100);
  });

  test('grouping: expand groups, aggregation footer, CSV / XLSX / PDF export', async ({ page }) => {
    consoleRecords = await openScenario(page, 'grouping');

    const before = await renderedRows(page).count();
    expect(before, 'collapsed: one row per region').toBe(5);
    await centerRow(page, 0).getByRole('button').first().click();
    await expect.poll(() => renderedRows(page).count()).toBeGreaterThan(before);
    const afterFirst = await renderedRows(page).count();
    await centerRow(page, 1).getByRole('button').first().click();
    await expect.poll(() => renderedRows(page).count()).toBeGreaterThan(afterFirst);

    const footer = page.locator('.ogx__aggregation-footer').first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/\d/);

    const expectations = [
      { id: 'export-csv', name: /\.csv$/, min: 50_000, magic: null },
      { id: 'export-xlsx', name: /\.xlsx$/, min: 20_000, magic: 'PK' },
      { id: 'export-pdf', name: /\.pdf$/, min: 20_000, magic: '%PDF' },
    ] as const;
    for (const e of expectations) {
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), page.getByTestId(e.id).click()]);
      expect(download.suggestedFilename()).toMatch(e.name);
      const path = await download.path();
      const bytes = readFileSync(path);
      expect(bytes.length, `${e.id} size`).toBeGreaterThan(e.min);
      expect(bytes.length, `${e.id} size`).toBeLessThan(20_000_000);
      if (e.magic) expect(bytes.subarray(0, e.magic.length).toString('latin1')).toBe(e.magic);
      if (e.id === 'export-csv') {
        const text = bytes.toString('utf8');
        expect(text).toContain('Doc No');
        expect(text).toContain('INV-000001');
      }
    }
  });

  test('editing: text, valueSetter, singleSelect, date and boolean editors commit', async ({ page }) => {
    consoleRecords = await openScenario(page, 'editing');
    const log = page.getByTestId('edit-log');

    // Text editor.
    const customer = cell(centerRow(page, 0), 'customer');
    await customer.dblclick();
    const input = customer.locator('input').first();
    // The editor's ref reaches the <input> through the shared Input (forwardRef: React 18 too).
    await expect(input).toBeFocused();
    await input.fill('Smoke Co');
    await input.press('Enter');
    await expect(customer).toHaveText('Smoke Co');
    await expect(log).toContainText('1 customer=Smoke Co');

    // valueSetter: editing Net writes amount = net + tax (tax is 18% of the old amount, so >= 0).
    const row1 = centerRow(page, 1);
    const net = cell(row1, 'net');
    await net.dblclick();
    const netInput = net.locator('input').first();
    await expect(netInput).toBeFocused();
    await netInput.fill('1000');
    await netInput.press('Enter');
    await expect(net).toHaveText('1000.00');
    await expect(log).toContainText(/^2 customer=/m);
    expect(parseAmount(await cell(row1, 'amount').innerText())).toBeGreaterThan(1000);

    // singleSelect editor: pick an option other than the current one, or nothing is committed.
    const status = cell(centerRow(page, 2), 'status');
    const nextStatus = (await status.innerText()).trim() === 'Paid' ? 'Overdue' : 'Paid';
    await status.dblclick();
    const select = status.locator('select').first();
    await select.selectOption(nextStatus);
    await select.press('Enter');
    await expect(status).toHaveText(nextStatus);
    await expect(log).toContainText(new RegExp(`^3 customer=.* status=${nextStatus}`, 'm'));

    // Date editor.
    const date = cell(centerRow(page, 3), 'date');
    await date.dblclick();
    const dateInput = date.locator('input').first();
    await expect(dateInput).toBeFocused();
    await dateInput.fill('2025-03-15');
    await dateInput.press('Enter');
    await expect(log).toContainText(/^4 customer=.* date=2025-03-15/m);

    // Boolean editor: clicking the checkbox toggles and commits (the 3.2.1 WebKit regression).
    // It is the shared Checkbox: the <input> is visually hidden, the pointer lands on the drawn box.
    const posted = cell(centerRow(page, 4), 'posted');
    const wasYes = (await posted.innerText()).trim() === 'Yes';
    await posted.dblclick();
    await expect(posted.getByRole('checkbox')).toBeFocused();
    await posted.locator('.ogx-checkbox__box').first().click();
    await expect(posted).toHaveText(wasYes ? 'No' : 'Yes');
    await expect(log).toContainText(new RegExp(`^5 customer=.* posted=${String(!wasYes)}`, 'm'));
  });

  test('paste: Ctrl/Cmd+V pastes clipboard TSV, Ctrl/Cmd+Z undoes and Ctrl/Cmd+Shift+Z redoes', async ({ page }) => {
    consoleRecords = await openScenario(page, 'paste');
    // Put the TSV on the browser's own clipboard with the copy shortcut.
    const source = page.getByTestId('source');
    await source.focus();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('ControlOrMeta+c');

    const first = cell(centerRow(page, 1), 'sku');
    await first.click();
    await expect(first).toBeFocused();
    await page.keyboard.press('ControlOrMeta+v');

    await expect(page.getByTestId('paste-log')).toHaveText('updated 2 skipped 0');
    await expect(first).toHaveText('Widget');
    await expect(cell(centerRow(page, 1), 'qty')).toHaveText('1200');
    await expect(cell(centerRow(page, 2), 'price')).toHaveText('4');
    await expect(page.locator('.ogx__viewport .ogx__cell--range')).toHaveCount(6);
    await expect(page.getByTestId('history-log')).toHaveText('1 true false');

    await page.keyboard.press('ControlOrMeta+z');
    await expect(first).toHaveText('SKU-2');
    await expect(cell(centerRow(page, 2), 'price')).toHaveText('30');
    await expect(page.getByTestId('history-log')).toHaveText('0 false true');

    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(first).toHaveText('Widget');
    await expect(page.getByTestId('history-log')).toHaveText('1 true false');
  });

  test('fill: dragging the fill handle continues a series, Ctrl/Cmd+D fills down, Ctrl/Cmd+Z undoes', async ({ page }) => {
    consoleRecords = await openScenario(page, 'fill');
    const log = page.getByTestId('fill-log');

    // Select Jan of the first two rows (100, 110), then drag the handle down two more rows.
    const start = await cell(centerRow(page, 0), 'jan').boundingBox();
    const end = await cell(centerRow(page, 1), 'jan').boundingBox();
    expect(start && end).toBeTruthy();
    if (!start || !end) return;
    await page.mouse.move(start.x + 10, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + 10, end.y + end.height / 2, { steps: 4 });
    await page.mouse.up();
    const handle = page.locator('.ogx__viewport .ogx__cell-fill-handle');
    await expect(handle).toHaveCount(1);
    const box = await handle.boundingBox();
    const target = await cell(centerRow(page, 3), 'jan').boundingBox();
    if (!box || !target) throw new Error('fill handle or target cell not rendered');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, target.y + target.height / 2, { steps: 6 });
    await page.mouse.up();

    await expect(log).toHaveText('down updated 2 skipped 0');
    await expect(cell(centerRow(page, 2), 'jan')).toHaveText('120');
    await expect(cell(centerRow(page, 3), 'jan')).toHaveText('130');
    await expect(page.locator('.ogx__viewport .ogx__cell--range')).toHaveCount(4);

    // Jan..Mar of the first three rows, then Ctrl/Cmd+D copies the top row down.
    await cell(centerRow(page, 0), 'jan').click();
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');
    await expect(page.locator('.ogx__viewport .ogx__cell--range')).toHaveCount(9);
    await page.keyboard.press('ControlOrMeta+d');
    await expect(log).toHaveText('down updated 2 skipped 0');
    await expect(cell(centerRow(page, 2), 'jan')).toHaveText('100');
    await expect(cell(centerRow(page, 1), 'jan')).toHaveText('100');

    await page.keyboard.press('ControlOrMeta+z');
    await expect(cell(centerRow(page, 2), 'jan')).toHaveText('120');
    await expect(cell(centerRow(page, 1), 'jan')).toHaveText('110');
  });

  test('range: dragging selects a cell range and Ctrl+C copies it as TSV', async ({ page }) => {
    // Capture what the grid writes: the real clipboard needs permissions that differ per engine.
    await page.addInitScript(() => {
      const w = window as unknown as { __copied: string[] };
      w.__copied = [];
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: (text: string) => {
            w.__copied.push(text);
            return Promise.resolve();
          },
        },
      });
    });
    consoleRecords = await openScenario(page, 'range');

    const start = await cell(centerRow(page, 0), 'docNo').boundingBox();
    const end = await cell(centerRow(page, 2), 'customer').boundingBox();
    expect(start && end).toBeTruthy();
    if (!start || !end) return;
    await page.mouse.move(start.x + 10, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + 10, end.y + end.height / 2, { steps: 6 });
    await page.mouse.up();

    await expect(page.getByTestId('range-log')).toHaveText('pointer 1:docNo-3:customer');
    await expect(page.locator('.ogx__viewport .ogx__cell--range')).toHaveCount(9);
    await expect(page.locator('[data-stat="count"]').first()).toHaveText('9');

    await page.keyboard.press('Control+c');
    await expect.poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied.length)).toBe(1);
    const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied[0]);
    const expected: string[] = [];
    for (const i of [0, 1, 2]) {
      const texts = await Promise.all(['docNo', 'date', 'customer'].map(async (f) => (await cell(centerRow(page, i), f).innerText()).trim()));
      expected.push(texts.join('\t'));
    }
    expect(copied).toBe(expected.join('\n'));
  });

  test('ai: the /ai entry point builds a schema, validates a model reply and the grid applies it', async ({ page }) => {
    consoleRecords = await openScenario(page, 'ai');

    await expect(page.getByTestId('ai-schema')).toHaveText('v1: filterModel,sortModel,rowGroupingModel,aggregationModel');
    const state = JSON.parse(await page.getByTestId('ai-state').innerText()) as unknown;
    expect(state).toEqual({
      filterModel: {
        items: [
          { field: 'region', operator: 'equals', value: 'North' },
          { field: 'amount', operator: '>', value: 5000 },
        ],
      },
      sortModel: [{ field: 'amount', sort: 'desc' }],
    });
    await expect(page.getByTestId('ai-errors').locator('li')).toHaveText([
      'filterModel.items[2].field: Unknown field "revenue"',
      /^filterModel\.items\[3\]\.operator: "contains" is not one of isAnyOf, is, not$/,
      'rowModel: Unknown part',
    ]);

    await page.getByTestId('ai-apply').click();
    await expect(page.getByRole('columnheader', { name: 'Amount' }).first()).toHaveAttribute('aria-sort', 'descending');
    await expect(async () => {
      const regions = (await page.locator('.ogx__viewport [data-rowindex] [data-field="region"]').allInnerTexts()).map((r) => r.trim());
      expect(regions.length).toBeGreaterThan(0);
      expect(regions.filter((r) => r !== 'North'), 'rows left after the applied filter').toEqual([]);
    }).toPass();
    const amounts = (await Promise.all([0, 1, 2, 3].map((i) => cell(centerRow(page, i), 'amount').innerText()))).map(parseAmount);
    expect(amounts.every((a) => a > 5000), `amounts over 5000: ${amounts.join(', ')}`).toBe(true);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  test('ai-assistant: the prompt panel applies a validated reply from a mock callModel, with chips and Undo; agent tools', async ({ page }) => {
    consoleRecords = await openScenario(page, 'ai-assistant');
    const regions = async () => (await page.locator('.ogx__viewport [data-rowindex] [data-field="region"]').allInnerTexts()).map((r) => r.trim());

    const askButton = page.getByRole('button', { name: 'Ask AI' });
    await askButton.click();
    const dialog = page.getByRole('dialog', { name: 'Ask AI' });
    const prompt = dialog.getByRole('textbox', { name: 'Prompt' });
    await expect(prompt).toBeFocused();
    await prompt.fill('north, biggest first');
    await prompt.press('Enter');

    await expect(dialog.locator('.ogx-ai-chip__label')).toHaveText(['Region equals North', 'Sort: Amount, descending', 'Hide: Tax']);
    await expect(dialog).toContainText('Showing the North, biggest first.');
    await expect(page.getByRole('columnheader', { name: 'Amount' }).first()).toHaveAttribute('aria-sort', 'descending');
    await expect(page.getByRole('columnheader', { name: 'Tax' })).toHaveCount(0);
    await expect(async () => {
      const list = await regions();
      expect(list.length).toBeGreaterThan(0);
      expect(list.filter((r) => r !== 'North')).toEqual([]);
    }).toPass();

    // Removing a chip re-applies the reply without it.
    await dialog.getByRole('button', { name: 'Remove Region equals North' }).click();
    await expect(async () => expect((await regions()).some((r) => r !== 'North')).toBe(true)).toPass();
    await expect(page.getByRole('columnheader', { name: 'Amount' }).first()).toHaveAttribute('aria-sort', 'descending');

    // Undo restores the state from before the reply.
    await dialog.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('columnheader', { name: 'Amount' }).first()).not.toHaveAttribute('aria-sort', 'descending');
    await expect(page.getByRole('columnheader', { name: 'Tax' })).toHaveCount(1);

    await prompt.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(askButton).toBeFocused();

    // Agent tools from the same package entry point.
    await expect(page.getByTestId('ai-tools')).toHaveText('get_grid_state,set_filter,set_sort,set_grouping,set_aggregation,set_column_visibility,clear_filters');
    await page.getByTestId('ai-run-tool').click();
    await expect(page.getByTestId('ai-tool-result')).toHaveText('{"ok":true,"applied":{"sortModel":[{"field":"amount","sort":"asc"}]}}');
    await expect(page.getByRole('columnheader', { name: 'Amount' }).first()).toHaveAttribute('aria-sort', 'ascending');
  });

  test('header-filters: typing and selects filter the rows, ArrowDown reaches the filter row', async ({ page }) => {
    consoleRecords = await openScenario(page, 'header-filters');
    const filterCell = (field: string) => page.locator(`.ogx__header-filter-row [data-field="${field}"]`).first();
    const headerCell = (field: string) => page.locator(`.ogx__header [data-field="${field}"]`).first();

    // Laid out with the headers: same left edge and width, its own 40px row under them.
    const header = await headerCell('customer').boundingBox();
    const filter = await filterCell('customer').boundingBox();
    expect(header && filter).toBeTruthy();
    if (!header || !filter) return;
    expect(Math.round(filter.x)).toBe(Math.round(header.x));
    expect(Math.round(filter.width)).toBe(Math.round(header.width));
    const headerRow = await page.locator('.ogx__header').first().boundingBox();
    const row = await page.locator('.ogx__header-filter-row').first().boundingBox();
    expect(headerRow && row).toBeTruthy();
    if (!headerRow || !row) return;
    expect(Math.round(row.y)).toBe(Math.round(headerRow.y + headerRow.height));
    expect(Math.round(row.height)).toBe(40);

    await filterCell('customer').getByLabel('Filter value for Customer').fill('Globex');
    await expect(page.getByTestId('filter-log')).toHaveText('header:customer contains Globex');
    await expect(async () => {
      const customers = (await page.locator('.ogx__viewport [data-rowindex] [data-field="customer"]').allInnerTexts()).map((t) => t.trim());
      expect(customers.length).toBeGreaterThan(0);
      expect(customers.filter((c) => c !== 'Globex'), 'rows left after the header filter').toEqual([]);
    }).toPass();

    await filterCell('status').getByLabel('Filter value for Status').selectOption({ label: 'Paid' });
    await expect(page.getByTestId('filter-log')).toHaveText('header:customer contains Globex; header:status is Paid');
    await expect(async () => {
      const statuses = (await page.locator('.ogx__viewport [data-rowindex] [data-field="status"]').allInnerTexts()).map((t) => t.trim());
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.filter((s) => s !== 'Paid')).toEqual([]);
    }).toPass();

    await filterCell('customer').getByLabel('Clear filter for Customer').click();
    await expect(page.getByTestId('filter-log')).toHaveText('header:status is Paid');

    await headerCell('region').locator('.ogx__header-cell-title').click();
    await page.keyboard.press('ArrowDown');
    await expect(filterCell('region')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(cell(centerRow(page, 0), 'region')).toBeFocused();
  });

  test('pinned: pinned columns and rows, column groups, colSpan, detail panel', async ({ page }) => {
    consoleRecords = await openScenario(page, 'pinned');

    await expect(page.getByRole('columnheader', { name: 'Financials' }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Party' }).first()).toBeVisible();
    await expect(page.locator('.ogx__pinned-rows--top').first()).toContainText('INV-000001');
    await expect(page.locator('.ogx__pinned-rows--bottom').first()).toContainText('INV-000002');

    // Left-pinned Doc No stays in place while scrolling horizontally.
    const doc = cell(centerRow(page, 0), 'docNo');
    const x0 = (await doc.boundingBox())?.x ?? 0;
    await viewport(page).evaluate((el) => {
      el.scrollLeft = 300;
    });
    await expect.poll(async () => viewport(page).evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(Math.abs(((await doc.boundingBox())?.x ?? 0) - x0)).toBeLessThan(1);
    await viewport(page).evaluate((el) => {
      el.scrollLeft = 0;
    });

    // colSpan: row id 5 spans Customer over Region.
    const spanned = page.locator('.ogx__viewport [role="row"]', { hasText: 'INV-000005' }).first();
    const spanWidth = (await cell(spanned, 'customer').boundingBox())?.width ?? 0;
    expect(spanWidth).toBeGreaterThan(150 + 100);
    await expect(spanned.locator('[data-field="region"]')).toHaveCount(0);

    // Detail panel.
    await centerRow(page, 0).getByRole('button', { name: 'Expand row', exact: true }).click();
    await expect(page.getByTestId('detail').first()).toBeVisible();
  });

  test('dark: DataGridThemeProvider applies the dark theme', async ({ page }) => {
    consoleRecords = await openScenario(page, 'dark');
    const provider = page.locator('.ogx-theme-provider').first();
    await expect(provider).toBeVisible();
    const token = await provider.evaluate((el) => getComputedStyle(el).getPropertyValue('--ogx-grid-background').trim());
    expect(token.toLowerCase()).toBe('#0f172a');
    const bg = await viewport(page).evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
        node = node.parentElement;
      }
      return '';
    });
    const [r, g, b] = (bg.match(/\d+/g) ?? []).map(Number);
    expect(r + g + b, `grid background ${bg}`).toBeLessThan(150);
  });
});
