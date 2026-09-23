import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { DataGrid, useGridApiRef } from '../../index';
import type { GridColDef } from '../../types';

// Runs in real Chromium (vitest browser project). jsdom has no layout engine, so the
// container-height behaviour these tests pin down cannot be reproduced there.

type Row = { id: number; region: string; amount: number };

const makeRows = (total: number, northCount: number): Row[] =>
    Array.from({ length: total }, (_, i) => ({ id: i + 1, region: i < northCount ? 'North' : 'South', amount: i }));

const columns: GridColDef<Row>[] = [
    { field: 'region', width: 200 },
    { field: 'amount', width: 150 },
];

// Bounded: a flex child with min-height: 0 cannot grow past the 600px parent.
const Bounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

// Unbounded: the classic trap — a flex child without min-height: 0 grows to fit its content.
const Unbounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>{children}</div>
    </div>
);

const domRowCount = (container: HTMLElement) => container.querySelectorAll('.ogx__rows [role="row"]').length;
const firstRow = (container: HTMLElement) => container.querySelector<HTMLElement>('.ogx__rows [role="row"]')!;

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('DataGrid virtualization in a real browser', () => {
    it('virtualizes a large flat dataset in a bounded container', async () => {
        const { container } = render(<Bounded><DataGrid rows={makeRows(30000, 30000)} columns={columns} height="100%" /></Bounded>);
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(domRowCount(container)).toBeLessThan(60);
    });

    it('keeps DOM rows bounded after expanding a 25,000-row group', async () => {
        const { container } = render(
            <Bounded><DataGrid rows={makeRows(30000, 25000)} columns={columns} height="100%" rowGroupingModel={['region']} /></Bounded>
        );
        await expect.poll(() => domRowCount(container)).toBe(2);

        firstRow(container).click();

        await expect.poll(() => domRowCount(container)).toBeGreaterThan(2);
        expect(domRowCount(container)).toBeLessThan(60);

        const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
        viewport.scrollTop = viewport.scrollHeight / 2;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => container.querySelector('.ogx__rows [role="row"]')?.getAttribute('data-rowindex')).not.toBe('0');
        expect(domRowCount(container)).toBeLessThan(80);
    });

    it('warns in development when an unbounded container defeats virtualization', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(
            <Unbounded><DataGrid rows={makeRows(3000, 2500)} columns={columns} height="100%" rowGroupingModel={['region']} /></Unbounded>
        );
        await expect.poll(() => domRowCount(container)).toBe(2);
        firstRow(container).click();

        await expect.poll(() => warn.mock.calls.some(([msg]) => String(msg).includes('virtualization is effectively off'))).toBe(true);
    });

    it('warns in development that pagination is ignored under row grouping', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(<Bounded><DataGrid rows={makeRows(100, 50)} columns={columns} height="100%" pagination rowGroupingModel={['region']} /></Bounded>);
        await expect.poll(() => warn.mock.calls.some(([msg]) => String(msg).includes('`pagination` is ignored'))).toBe(true);
    });

    it('positions every scrolled row correctly when rows are pinned to the top', async () => {
        const rowHeight = 52;
        const rows = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, region: 'r', amount: i }));
        const { container } = render(
            <Bounded>
                <DataGrid rows={rows} columns={[{ field: 'id', width: 100 }, ...columns]} height="100%"
                    rowHeight={rowHeight} pinnedRows={{ top: [1, 2] }} />
            </Bounded>
        );
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);

        const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
        viewport.scrollTop = rowHeight * 500;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => Number(firstRow(container).getAttribute('data-rowindex'))).toBeGreaterThan(100);

        const virtualContainer = container.querySelector<HTMLElement>('.ogx__virtual-container')!;
        const containerTop = virtualContainer.getBoundingClientRect().top;
        const centerRows = [...virtualContainer.querySelectorAll<HTMLElement>('[role="row"]')];
        expect(centerRows.length).toBeGreaterThan(5);
        for (const rowEl of centerRows) {
            const id = Number(rowEl.querySelector('[data-field="id"]')!.textContent);
            // ids 1 and 2 are pinned, so id N is unpinned index N - 3.
            const expectedTop = (id - 3) * rowHeight;
            expect(Math.round(rowEl.getBoundingClientRect().top - containerTop)).toBe(expectedTop);
        }

        // The viewport must be filled: the last rendered row reaches past the visible bottom.
        const lastRendered = centerRows[centerRows.length - 1].getBoundingClientRect().bottom;
        expect(lastRendered).toBeGreaterThanOrEqual(viewport.getBoundingClientRect().bottom - 1);
    });

    describe('keyboard navigation keeps the focused row fully visible', () => {
        const rowHeight = 52;
        const rows = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, region: 'r', amount: i }));

        const pressArrowDown = async (times: number) => {
            const grid = document.querySelector<HTMLElement>('.ogx__viewport')!;
            for (let i = 0; i < times; i++) {
                grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                await new Promise(r => requestAnimationFrame(() => r(null)));
            }
        };

        const assertFocusedRowVisible = (container: HTMLElement) => {
            const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
            const focused = container.querySelector<HTMLElement>('.ogx__cell--focused')!;
            expect(focused).not.toBeNull();
            const cell = focused.getBoundingClientRect();
            const vp = viewport.getBoundingClientRect();
            const stickyTop = [...container.querySelectorAll<HTMLElement>('.ogx__header-wrap, .ogx__pinned-rows--top')]
                .reduce((max, el) => Math.max(max, el.getBoundingClientRect().bottom), vp.top);
            const stickyBottom = [...container.querySelectorAll<HTMLElement>('.ogx__pinned-rows--bottom')]
                .reduce((min, el) => Math.min(min, el.getBoundingClientRect().top), vp.top + viewport.clientHeight);
            expect(cell.top).toBeGreaterThanOrEqual(stickyTop - 1);
            expect(cell.bottom).toBeLessThanOrEqual(stickyBottom + 1);
        };

        for (const pinned of [false, true]) {
            it(`after ArrowDown past the bottom edge${pinned ? ' with pinned top rows' : ''}`, async () => {
                const { container } = render(
                    <Bounded>
                        <DataGrid rows={rows} columns={[{ field: 'id', width: 100 }, ...columns]} height="100%"
                            rowHeight={rowHeight} pinnedRows={pinned ? { top: [1, 2] } : undefined} />
                    </Bounded>
                );
                await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
                const target = container.querySelector<HTMLElement>(`.ogx__virtual-container [data-field="id"]`)!;
                target.click();
                await pressArrowDown(20);
                assertFocusedRowVisible(container);
            });
        }
    });

    it('apiRef.scrollToIndexes brings a row below the fold fully into view', async () => {
        const rows = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, region: 'r', amount: i }));
        const onReady = vi.fn<(apiRef: ReturnType<typeof useGridApiRef>) => void>();
        const Harness = ({ onApi }: { onApi: typeof onReady }) => {
            const apiRef = useGridApiRef();
            useEffect(() => { onApi(apiRef); }, [apiRef, onApi]);
            return <DataGrid apiRef={apiRef} rows={rows} columns={[{ field: 'id', width: 100 }, ...columns]} height="100%" />;
        };
        const { container } = render(<Bounded><Harness onApi={onReady} /></Bounded>);
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);

        onReady.mock.calls[0][0].current.scrollToIndexes({ rowIndex: 40 });
        const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
        viewport.dispatchEvent(new Event('scroll'));
        const rowEl = () => [...container.querySelectorAll<HTMLElement>('.ogx__virtual-container [role="row"]')]
            .find(r => r.querySelector('[data-field="id"]')?.textContent === '41');
        await expect.poll(() => Boolean(rowEl())).toBe(true);
        const vp = viewport.getBoundingClientRect();
        const header = container.querySelector<HTMLElement>('.ogx__header-wrap')!.getBoundingClientRect();
        const r = rowEl()!.getBoundingClientRect();
        expect(r.top).toBeGreaterThanOrEqual(header.bottom - 1);
        expect(r.bottom).toBeLessThanOrEqual(vp.top + viewport.clientHeight + 1);
    });
});
