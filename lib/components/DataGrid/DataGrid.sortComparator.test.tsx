import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { GridColDef, GridRowModel, GridSortItem } from '../../types';

/** Text of the given column's cells, in row order. */
function cellTexts(container: HTMLElement, field: string): string[] {
    return Array.from(container.querySelectorAll(`.ogx__row [role="gridcell"][data-field="${field}"]`)).map(c => c.textContent ?? '');
}

const SIZE_ORDER: Record<string, number> = { S: 0, M: 1, L: 2, XL: 3 };
/** Clothing sizes in size order, empty values last in asc. */
const bySize = (a: unknown, b: unknown): number =>
    (typeof a === 'string' ? SIZE_ORDER[a] ?? 50 : 99) - (typeof b === 'string' ? SIZE_ORDER[b] ?? 50 : 99);

const ROWS: GridRowModel[] = [
    { id: 1, size: 'M', name: 'Bravo' },
    { id: 2, size: 'XL', name: 'Alpha' },
    { id: 3, size: 'S', name: 'Delta' },
    { id: 4, size: null, name: 'Echo' },
    { id: 5, size: 'M', name: 'Charlie' },
];

const COLS: GridColDef[] = [
    { field: 'size', headerName: 'Size', sortComparator: bySize },
    { field: 'name', headerName: 'Name' },
];

const renderGrid = (sortModel?: GridSortItem[], columns: GridColDef[] = COLS, rows: GridRowModel[] = ROWS) =>
    render(<div style={{ height: 400 }}><DataGrid rows={rows} columns={columns} sortModel={sortModel} /></div>);

describe('GridColDef.sortComparator', () => {
    it('orders a flat sort by the comparator (header click)', () => {
        const { container } = render(<div style={{ height: 400 }}><DataGrid rows={ROWS} columns={COLS} /></div>);
        fireEvent.click(screen.getByText('Size'));
        expect(cellTexts(container, 'size')).toEqual(['S', 'M', 'M', 'XL', '']);
    });

    it('reverses the comparator for desc, so empty values come first', () => {
        const { container } = renderGrid([{ field: 'size', sort: 'desc' }]);
        expect(cellTexts(container, 'size')).toEqual(['', 'XL', 'M', 'M', 'S']);
    });

    it('lets the comparator place empty values first in asc', () => {
        const nullsFirst = (a: unknown, b: unknown) => (a == null ? -1 : 0) - (b == null ? -1 : 0) || bySize(a, b);
        const { container } = renderGrid([{ field: 'size', sort: 'asc' }], [{ field: 'size', sortComparator: nullsFirst }, { field: 'name' }]);
        expect(cellTexts(container, 'size')).toEqual(['', 'S', 'M', 'M', 'XL']);
    });

    it('chains with the other keys in a multi-sort', () => {
        const { container } = renderGrid([{ field: 'size', sort: 'asc' }, { field: 'name', sort: 'desc' }]);
        expect(cellTexts(container, 'name')).toEqual(['Delta', 'Charlie', 'Bravo', 'Alpha', 'Echo']);
    });

    it('is a tie-break when it is the second key', () => {
        const rows = [
            { id: 1, team: 'x', size: 'L' },
            { id: 2, team: 'x', size: 'S' },
            { id: 3, team: 'a', size: 'XL' },
        ];
        const { container } = renderGrid([{ field: 'team', sort: 'asc' }, { field: 'size', sort: 'asc' }], [{ field: 'team' }, { field: 'size', sortComparator: bySize }], rows);
        expect(cellTexts(container, 'size')).toEqual(['XL', 'S', 'L']);
    });

    it('orders row-grouping groups by their grouping value with the grouping column comparator', () => {
        const { container } = render(
            <div style={{ height: 400 }}>
                <DataGrid rows={ROWS.filter(r => r.size != null)} columns={COLS} rowGroupingModel={['size']} sortModel={[{ field: 'size', sort: 'asc' }]} />
            </div>
        );
        const labels = Array.from(container.querySelectorAll('.ogx__row')).map(r => r.textContent ?? '');
        const order = ['S', 'M', 'XL'].map(v => labels.findIndex(t => t.includes(`size: ${v}`) || t.startsWith(v)));
        expect(order.every(i => i >= 0)).toBe(true);
        expect([...order].sort((a, b) => a - b)).toEqual(order);
    });

    it('sorts tree-data siblings with the comparator', () => {
        const rows = [
            { id: 1, path: ['root'], size: 'M' },
            { id: 2, path: ['root', 'a'], size: 'XL' },
            { id: 3, path: ['root', 'b'], size: 'S' },
            { id: 4, path: ['root', 'c'], size: 'L' },
        ];
        const { container } = render(
            <div style={{ height: 400 }}>
                <DataGrid rows={rows} columns={[{ field: 'name' }, { field: 'size', sortComparator: bySize }]} treeData getTreeDataPath={r => r.path as string[]}
                    defaultGroupingExpansionDepth={-1} sortModel={[{ field: 'size', sort: 'asc' }]} />
            </div>
        );
        expect(cellTexts(container, 'size')).toEqual(['M', 'S', 'L', 'XL']);
    });

    it('is ignored with sortingMode="server"', () => {
        const comparator = vi.fn(bySize);
        const { container } = render(
            <div style={{ height: 400 }}>
                <DataGrid rows={ROWS} columns={[{ field: 'size', sortComparator: comparator }]} sortingMode="server" sortModel={[{ field: 'size', sort: 'asc' }]} />
            </div>
        );
        expect(comparator).not.toHaveBeenCalled();
        expect(cellTexts(container, 'size')).toEqual(['M', 'XL', 'S', '', 'M']);
    });

    it('contains a throwing comparator: the grid renders in the original order and warns once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { container } = renderGrid([{ field: 'size', sort: 'asc' }], [{ field: 'size', sortComparator: () => { throw new Error('bad'); } }]);
        expect(cellTexts(container, 'size')).toEqual(['M', 'XL', 'S', '', 'M']);
        expect(warn.mock.calls.filter(c => String(c[0]).includes('sortComparator'))).toHaveLength(1);
        warn.mockRestore();
    });

    it('orders apiRef.getAllFilteredRows the same way', () => {
        let ids: unknown[] = [];
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { ids = apiRef.current.getAllFilteredRows().map(r => r.id); });
            return <div style={{ height: 400 }}><DataGrid apiRef={apiRef} rows={ROWS} columns={COLS} sortModel={[{ field: 'size', sort: 'asc' }]} /></div>;
        }
        render(<Harness />);
        expect(ids).toEqual([3, 1, 5, 2, 4]);
    });
});
