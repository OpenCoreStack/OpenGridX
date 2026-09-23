import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';

// Runs in real Chromium: the footer must line up with the header and body cells, which depends on
// layout, sticky positioning and horizontal scrolling that jsdom cannot reproduce.

type Row = { id: number; [k: string]: unknown };
const FIELDS = ['a', 'b', 'c', 'd', 'e', 'f'];
const rows: Row[] = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, ...Object.fromEntries(FIELDS.map(f => [f, i])) }));
const cols: GridColDef<Row>[] = FIELDS.map(f => ({ field: f, width: 200, type: 'number' }));

const Box = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 400, width: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const headerLeft = (c: HTMLElement, field: string) =>
    c.querySelector<HTMLElement>(`[role="columnheader"][data-field="${field}"]`)!.getBoundingClientRect().left;
const footerCellLeft = (c: HTMLElement, label: string) => {
    const cell = Array.from(c.querySelectorAll<HTMLElement>('.ogx__aggregation-cell'))
        .find(x => x.querySelector('.ogx__aggregation-label')?.textContent === label)!;
    return cell.getBoundingClientRect().left;
};

async function scrollTo(c: HTMLElement, left: number) {
    const v = viewport(c);
    v.scrollLeft = left;
    v.dispatchEvent(new Event('scroll'));
    await frame();
    await frame();
}

afterEach(() => cleanup());

describe('aggregation footer alignment in a real browser', () => {
    it('keeps a total under its header when an earlier column is hidden', async () => {
        const { container } = render(
            <Box><DataGrid rows={rows} columns={cols} height="100%" aggregationModel={{ c: 'sum' }} columnVisibilityModel={{ a: false }} /></Box>
        );
        await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
        await frame();
        expect(footerCellLeft(container, 'sum')).toBeCloseTo(headerLeft(container, 'c'), 0);
    });

    it('keeps a left-pinned total under its header after scrolling with an unpinned checkbox column', async () => {
        const { container } = render(
            <Box><DataGrid rows={rows} columns={cols} height="100%" checkboxSelection pinCheckboxColumn={false}
                pinnedColumns={{ left: ['a'] }} aggregationModel={{ a: 'sum' }} /></Box>
        );
        await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
        await scrollTo(container, 300);
        expect(footerCellLeft(container, 'sum')).toBeCloseTo(headerLeft(container, 'a'), 0);
    });

    it('keeps the checkbox spacer pinned with the body checkbox column when scrolled', async () => {
        const { container } = render(
            <Box><DataGrid rows={rows} columns={cols} height="100%" checkboxSelection aggregationModel={{ a: 'sum' }} /></Box>
        );
        await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
        await scrollTo(container, 300);
        const spacer = container.querySelector<HTMLElement>('.ogx__aggregation-spacer')!;
        const bodyCheckbox = container.querySelector<HTMLElement>('.ogx__cell--checkbox')!;
        expect(spacer.getBoundingClientRect().left).toBeCloseTo(bodyCheckbox.getBoundingClientRect().left, 0);
    });

    it('keeps totals aligned when horizontal virtualization renders only some columns', async () => {
        const many: GridColDef<Row>[] = Array.from({ length: 40 }, (_, i) => ({ field: `k${i}`, width: 150, type: 'number' }));
        const wide: Row[] = Array.from({ length: 20 }, (_, r) => ({ id: r + 1, ...Object.fromEntries(many.map(c => [c.field, r])) }));
        const { container } = render(
            <Box><DataGrid rows={wide} columns={many} height="100%" aggregationModel={{ k30: 'max' }} /></Box>
        );
        await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
        await scrollTo(container, 150 * 28);
        await expect.poll(() => container.querySelector('[role="columnheader"][data-field="k30"]')).not.toBeNull();
        expect(footerCellLeft(container, 'max')).toBeCloseTo(headerLeft(container, 'k30'), 0);
    });

    it('keeps a right-pinned total under its header', async () => {
        const { container } = render(
            <Box><DataGrid rows={rows} columns={cols} height="100%" pinnedColumns={{ right: ['b'] }} aggregationModel={{ b: 'min' }} /></Box>
        );
        await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
        await scrollTo(container, 200);
        expect(footerCellLeft(container, 'min')).toBeCloseTo(headerLeft(container, 'b'), 0);
    });
});
