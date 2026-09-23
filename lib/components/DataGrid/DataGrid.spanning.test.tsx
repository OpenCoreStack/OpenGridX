import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { DataGridProps, GridColDef, GridDataSource, GridRenderCellParams, GridRowModel } from '../../types';

interface Row extends GridRowModel {
    id: number;
    a: string;
    b: string;
    c: string;
}

const ROWS: Row[] = [1, 2, 3].map(i => ({ id: i, a: `A${i}`, b: `B${i}`, c: `C${i}` }));
const NO_ROWS: Row[] = [];

const renderGrid = (props: Partial<DataGridProps<Row>> & { columns: GridColDef<Row>[] }) =>
    render(<div style={{ height: 400, width: 800 }}><DataGrid<Row> rows={ROWS} {...props} /></div>);

const rowEl = (c: HTMLElement, rowIndex: number) => c.querySelector<HTMLElement>(`[role="row"][data-rowindex="${rowIndex}"]`);
const cellEl = (c: HTMLElement, rowIndex: number, field: string) => rowEl(c, rowIndex)?.querySelector<HTMLElement>(`[data-field="${field}"]`) ?? null;
const focusedCell = (c: HTMLElement) => {
    const el = c.querySelector<HTMLElement>('.ogx__cell--focused');
    if (!el) return 'NONE';
    return `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.getAttribute('data-field')}`;
};
const press = (c: HTMLElement, key: string) => fireEvent.keyDown(c.querySelector('[role="grid"]')!, { key });

afterEach(() => { vi.restoreAllMocks(); });

describe('DataGrid cell spanning', () => {
    describe('which columns a span covers', () => {
        it('skips hidden columns: the span covers the next visible column', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100, colSpan: 2 }, { field: 'b', width: 70 }, { field: 'c', width: 90 }],
                columnVisibilityModel: { b: false },
            });
            const a = cellEl(container, 0, 'a')!;
            expect(a.style.getPropertyValue('--width')).toBe('190px');
            expect(a.getAttribute('aria-colspan')).toBe('2');
            expect(cellEl(container, 0, 'c')).toBeNull();
        });

        it('never covers a column rendered in another pinned section', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100 }, { field: 'b', width: 70, colSpan: 2 }, { field: 'c', width: 90 }],
                pinnedColumns: { left: ['c'] },
            });
            const fields = Array.from(rowEl(container, 0)!.querySelectorAll<HTMLElement>('.ogx__cell[data-field]'))
                .map(el => `${el.dataset.field}:${el.style.getPropertyValue('--width')}:${el.getAttribute('aria-colspan') ?? 1}`);
            expect(fields).toEqual(['c:90px:1', 'a:100px:1', 'b:70px:1']);
        });

        it('gives non-spanning cells the same width as their header (percentage widths)', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: '40%' }, { field: 'b', width: 100 }, { field: 'c', width: 100 }],
            });
            const header = container.querySelector<HTMLElement>('.ogx__header-cell[data-field="a"]')!;
            expect(cellEl(container, 0, 'a')!.style.getPropertyValue('--width')).toBe(header.style.width);
        });
    });

    describe('span sizes are clamped and normalised', () => {
        it('clamps colSpan and rowSpan to the columns and rows that exist', () => {
            const { container } = renderGrid({
                columns: [
                    { field: 'a', width: 50, rowSpan: ({ rowIndex }) => (rowIndex === 2 ? 3 : 1) },
                    { field: 'b', width: 70, colSpan: 4 },
                ],
            });
            expect(cellEl(container, 2, 'a')!.getAttribute('aria-rowspan')).toBeNull();
            expect(cellEl(container, 0, 'b')!.getAttribute('aria-colspan')).toBeNull();
            expect(cellEl(container, 0, 'b')!.style.getPropertyValue('--width')).toBe('70px');
        });

        it('handles huge, infinite, NaN and fractional spans without blocking', () => {
            const t0 = performance.now();
            const { container } = renderGrid({
                columns: [
                    { field: 'a', width: 100, colSpan: ({ rowIndex }) => [Infinity, 2e9, 1.7][rowIndex] },
                    { field: 'b', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? Number.NaN : 1) },
                    { field: 'c', width: 100, rowSpan: 1e9 },
                ],
            });
            expect(performance.now() - t0).toBeLessThan(1000);
            expect(cellEl(container, 0, 'a')!.getAttribute('aria-colspan')).toBe('3');
            expect(cellEl(container, 1, 'a')!.getAttribute('aria-colspan')).toBe('3');
            // 1.7 is floored to 1
            expect(cellEl(container, 2, 'a')!.getAttribute('aria-colspan')).toBeNull();
            expect(cellEl(container, 2, 'b')!.getAttribute('role')).toBe('gridcell');
            expect(cellEl(container, 2, 'c')!.getAttribute('role')).toBe('gridcell');
        });
    });

    describe('callback parameters and failures', () => {
        it('passes the valueGetter value and the rendered column index to colSpan', () => {
            const colSpanIdx: number[] = [];
            const renderIdx: number[] = [];
            const { container } = renderGrid({
                checkboxSelection: true,
                columns: [
                    {
                        field: 'a',
                        width: 100,
                        valueGetter: () => 'computed',
                        colSpan: (p: GridRenderCellParams<Row>) => { colSpanIdx.push(p.colIndex); return p.value === 'computed' ? 2 : 1; },
                        renderCell: (p) => { renderIdx.push(p.colIndex); return String(p.value); },
                    },
                    { field: 'b', width: 100 },
                    { field: 'c', width: 100 },
                ],
            });
            expect(cellEl(container, 0, 'a')!.getAttribute('aria-colspan')).toBe('2');
            expect(colSpanIdx[0]).toBe(renderIdx[0]);
        });

        it('a span callback that throws falls back to no span instead of unmounting the grid', () => {
            vi.spyOn(console, 'warn').mockImplementation(() => {});
            const rows = [{ id: 1, a: 'x', meta: { span: 2 } }, { id: 2, a: 'y', meta: null }] as unknown as Row[];
            const { container } = render(
                <div style={{ height: 400 }}>
                    <DataGrid<Row>
                        rows={rows}
                        columns={[
                            { field: 'a', width: 100, colSpan: ({ row }) => (row as unknown as { meta: { span: number } }).meta.span },
                            { field: 'b', width: 100, rowSpan: ({ row }) => (row as unknown as { meta: { span: number } }).meta.span },
                        ]}
                    />
                </div>
            );
            expect(cellEl(container, 0, 'a')!.getAttribute('aria-colspan')).toBe('2');
            expect(cellEl(container, 1, 'a')!.textContent).toBe('y');
            expect(cellEl(container, 1, 'a')!.getAttribute('aria-colspan')).toBeNull();
        });
    });

    describe('row sections', () => {
        it('a span in a pinned-top row does not reach into the scrolling rows', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100 }, { field: 'b', width: 70, rowSpan: ({ row }) => (row.id === 1 ? 2 : 1) }],
                pinnedRows: { top: [1] },
            });
            const pinnedB = container.querySelector<HTMLElement>('.ogx__row--pinned-top [data-field="b"]')!;
            expect(pinnedB.getAttribute('aria-rowspan')).toBeNull();
            const firstCenter = container.querySelector<HTMLElement>('.ogx__virtual-container [role="row"]')!;
            expect(firstCenter.querySelector('[data-field="b"]')!.textContent).toBe('B2');
        });

        it('a span in the last scrolling row does not reach into a pinned-bottom row', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100 }, { field: 'b', width: 70, rowSpan: ({ row }) => (row.id === 2 ? 2 : 1) }],
                pinnedRows: { bottom: [3] },
            });
            const bottomB = container.querySelector<HTMLElement>('.ogx__row--pinned-bottom [data-field="b"]')!;
            expect(bottomB.className).not.toContain('ogx__cell--hidden');
            expect(bottomB.textContent).toBe('B3');
        });

        it('span callbacks never see infinite-scroll skeleton rows', async () => {
            vi.useFakeTimers();
            try {
                const all = Array.from({ length: 50 }, (_, i) => ({ id: i, a: `r${i}`, b: '', c: '' }));
                const seen: GridRowModel[] = [];
                let call = 0;
                const dataSource: GridDataSource<Row> = {
                    getRows: (p) => {
                        call++;
                        return call === 1 ? Promise.resolve({ rows: all.slice(p.startRow, p.endRow) }) : new Promise(() => {});
                    },
                };
                const columns: GridColDef<Row>[] = [
                    { field: 'a', width: 100, colSpan: ({ row }) => { seen.push(row); return 1; } },
                    { field: 'b', width: 100, rowSpan: ({ row }) => { seen.push(row); return 1; } },
                ];
                const Grid = ({ page }: { page: number }) => (
                    <DataGrid<Row> rows={NO_ROWS} columns={columns} dataSource={dataSource} paginationMode="infinite" paginationModel={{ page, pageSize: 5 }} />
                );
                const { rerender } = render(<Grid page={0} />);
                await act(async () => { await vi.advanceTimersByTimeAsync(350); });
                expect(seen.some(r => r.id === 0)).toBe(true);
                seen.length = 0;
                rerender(<Grid page={1} />);
                await act(async () => { await vi.advanceTimersByTimeAsync(350); });
                expect(seen.filter(r => r._isSkeleton)).toEqual([]);
            } finally {
                vi.useRealTimers();
            }
        });
    });

    describe('combined colSpan and rowSpan', () => {
        it('an origin with colSpan 2 and rowSpan 2 hides both covered cells in the next row', () => {
            const { container } = renderGrid({
                columns: [
                    { field: 'a', width: 100, colSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1), rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
                    { field: 'b', width: 100 },
                    { field: 'c', width: 100 },
                ],
            });
            expect(cellEl(container, 1, 'a')!.className).toContain('ogx__cell--hidden');
            expect(cellEl(container, 1, 'b')!.className).toContain('ogx__cell--hidden');
            expect(cellEl(container, 1, 'c')!.textContent).toBe('C2');
        });

        it('a column covered by a colSpan in a row is not a rowSpan origin in that row', () => {
            const { container } = renderGrid({
                columns: [
                    { field: 'a', width: 100, colSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
                    { field: 'b', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
                ],
            });
            expect(cellEl(container, 0, 'b')).toBeNull();
            expect(cellEl(container, 1, 'b')!.className).not.toContain('ogx__cell--hidden');
            expect(cellEl(container, 1, 'b')!.textContent).toBe('B2');
        });

        it('a colSpan stops before a cell that a rowSpan from above already covers', () => {
            const { container } = renderGrid({
                columns: [
                    { field: 'a', width: 100, colSpan: ({ rowIndex }) => (rowIndex === 1 ? 3 : 1) },
                    { field: 'b', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
                    { field: 'c', width: 100 },
                ],
            });
            expect(cellEl(container, 1, 'a')!.getAttribute('aria-colspan')).toBeNull();
            expect(cellEl(container, 1, 'b')!.className).toContain('ogx__cell--hidden');
            expect(cellEl(container, 1, 'c')!.textContent).toBe('C2');
        });
    });

    it('a rowSpan ends at a row whose detail panel is expanded', () => {
        const { container } = renderGrid({
            columns: [{ field: 'a', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 3 : 1) }, { field: 'b', width: 100 }],
            getDetailPanelContent: () => <div>panel</div>,
            detailPanelExpandedRowIds: new Set([2]),
        });
        expect(cellEl(container, 0, 'a')!.getAttribute('aria-rowspan')).toBe('2');
        expect(cellEl(container, 2, 'a')!.textContent).toBe('A3');
    });

    describe('keyboard navigation across spans', () => {
        const colSpanCols: GridColDef<Row>[] = [{ field: 'a', width: 100, colSpan: 2 }, { field: 'b', width: 70 }, { field: 'c', width: 90 }];

        it('ArrowRight from a colSpan origin moves to the cell after the span', () => {
            const { container } = renderGrid({ columns: colSpanCols });
            fireEvent.click(cellEl(container, 0, 'a')!);
            press(container, 'ArrowRight');
            expect(focusedCell(container)).toBe('0:c');
            expect(document.activeElement?.getAttribute('data-field')).toBe('c');
        });

        it('ArrowLeft into a covered cell lands on the span origin', () => {
            const { container } = renderGrid({ columns: colSpanCols });
            fireEvent.click(cellEl(container, 0, 'c')!);
            press(container, 'ArrowLeft');
            expect(focusedCell(container)).toBe('0:a');
        });

        it('ArrowDown from a rowSpan origin moves past the span, ArrowUp back lands on the origin', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) }, { field: 'b', width: 70 }],
            });
            fireEvent.click(cellEl(container, 0, 'a')!);
            press(container, 'ArrowDown');
            expect(focusedCell(container)).toBe('2:a');
            press(container, 'ArrowUp');
            expect(focusedCell(container)).toBe('0:a');
        });

        it('moving into a rowSpan-hidden cell from the side focuses the origin', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) }, { field: 'b', width: 70 }],
            });
            fireEvent.click(cellEl(container, 1, 'b')!);
            press(container, 'ArrowLeft');
            expect(focusedCell(container)).toBe('0:a');
        });
    });
});
