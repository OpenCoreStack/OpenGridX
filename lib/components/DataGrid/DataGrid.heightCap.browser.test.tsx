import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { server } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';
import { getMaxElementHeight } from '../../utils/maxElementHeight';

// Browsers cap element heights (Chromium and WebKit about 33.5M px, Firefox about 17.9M px), and Firefox
// collapses a taller element instead of clamping it: before the cap, a 500,000-row grid at 52 px
// (26M px of content) could not be scrolled at all in Firefox. The grid now keeps its content under the
// measured cap, so rows up to the cap stay reachable in every engine.

type Row = { id: number; name: string };

const ROWS = 500_000;
const ROW_HEIGHT = 52;
const rows: Row[] = Array.from({ length: ROWS }, (_, i) => ({ id: i, name: `Row ${i}` }));
const columns: GridColDef<Row>[] = [{ field: 'id', width: 120 }, { field: 'name', width: 200 }];

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const renderedIds = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__rows [role="row"] [data-field="id"]')).map(el => Number(el.textContent));
const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('content height is capped to what the browser lays out', () => {
    it('measures a finite cap in a real browser', () => {
        const cap = getMaxElementHeight(document);
        expect(Number.isFinite(cap)).toBe(true);
        expect(cap).toBeGreaterThanOrEqual(5_000_000);
        if (server.browser === 'firefox') expect(cap).toBeLessThan(18_000_000);
    });

    it('a 500,000-row grid scrolls, and the last reachable rows render', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(<div style={{ height: 600 }}><DataGrid rows={rows} columns={columns} rowHeight={ROW_HEIGHT} height="100%" /></div>);
        await expect.poll(() => renderedIds(container).length).toBeGreaterThan(0);
        const vp = viewport(container);
        await expect.poll(() => vp.scrollHeight).toBeGreaterThan(vp.clientHeight * 100);

        vp.scrollTop = vp.scrollHeight;
        await frame();
        await expect.poll(() => Math.max(...renderedIds(container))).toBeGreaterThan(300_000);

        const cap = getMaxElementHeight(document);
        const reachable = Math.floor((cap - ROW_HEIGHT * 2) / ROW_HEIGHT);
        const fullyReachable = ROWS * ROW_HEIGHT + 200 <= cap;
        if (fullyReachable) {
            expect(Math.max(...renderedIds(container))).toBe(ROWS - 1);
            expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('can be scrolled to'));
        } else {
            expect(Math.max(...renderedIds(container))).toBeGreaterThan(reachable - 100);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining(`of ${ROWS.toLocaleString('en-US')} rows can be scrolled to`));
        }
    });
});
