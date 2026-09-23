import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { DataGridProps, GridColDef, GridColumnGroupingModel, GridRowModel } from '../../types';

interface Row extends GridRowModel {
    id: number;
    a: string;
    b: string;
    c: string;
}

const ROWS: Row[] = [1, 2, 3].map(i => ({ id: i, a: `A${i}`, b: `B${i}`, c: `C${i}` }));

const renderGrid = (props: Partial<DataGridProps<Row>> & { columns: GridColDef<Row>[] }) =>
    render(<div style={{ height: 400, width: 800 }}><DataGrid<Row> rows={ROWS} {...props} /></div>);

afterEach(() => { vi.restoreAllMocks(); });

describe('DataGrid column group header rows', () => {
    const COLS: GridColDef<Row>[] = [
        { field: 'a', headerName: 'A', width: 100 },
        { field: 'b', headerName: 'B', width: 100 },
        { field: 'c', headerName: 'C', width: 100 },
    ];

    beforeEach(() => { vi.spyOn(console, 'error'); });

    it('renders a non-contiguous group without duplicate React keys', () => {
        const { container } = renderGrid({ columns: COLS, columnGroupingModel: [{ groupId: 'g', headerName: 'G', children: ['a', 'c'] }] });
        expect(container.querySelectorAll('.ogx-col-group-cell--group')).toHaveLength(2);
        const keyErrors = vi.mocked(console.error).mock.calls.filter(args => String(args[0]).includes('same key'));
        expect(keyErrors).toEqual([]);
    });

    it('applies GridColumnGroup.headerClassName to the group cell', () => {
        const { container } = renderGrid({ columns: COLS, columnGroupingModel: [{ groupId: 'g', headerName: 'G', headerClassName: 'my-group', children: ['a', 'b'] }] });
        expect(container.querySelector('.my-group')?.textContent).toBe('G');
    });

    it('exposes group cells with aria-colspan / aria-colindex and hides fillers from assistive technology', () => {
        const { container } = renderGrid({
            columns: COLS,
            checkboxSelection: true,
            columnGroupingModel: [{ groupId: 'g', headerName: 'G', children: ['b', 'c'] }],
        });
        const group = container.querySelector<HTMLElement>('.ogx-col-group-cell--group')!;
        expect(group.getAttribute('role')).toBe('columnheader');
        expect(group.getAttribute('aria-colspan')).toBe('2');
        // checkbox column (1) + a (2) → b is column 3
        expect(group.getAttribute('aria-colindex')).toBe('3');
        const fillers = Array.from(container.querySelectorAll<HTMLElement>('.ogx-col-group-cell--filler'));
        expect(fillers.length).toBeGreaterThan(0);
        expect(fillers.every(f => f.getAttribute('aria-hidden') === 'true' && f.getAttribute('role') !== 'columnheader')).toBe(true);
    });

    it('counts the group header rows in aria-rowcount', () => {
        const model: GridColumnGroupingModel = [
            { groupId: 'outer', headerName: 'Outer', children: [{ groupId: 'inner', headerName: 'Inner', children: ['a', 'b'] }] },
        ];
        const { container } = renderGrid({ columns: COLS, columnGroupingModel: model });
        // 3 data rows + 2 group rows + 1 column header row
        expect(container.querySelector('[role="grid"]')!.getAttribute('aria-rowcount')).toBe('6');
    });

    it('sizes a group over a percentage column with a valid pixel width', () => {
        const { container } = renderGrid({
            columns: [{ field: 'a', width: '20%' }, { field: 'b', width: 70 }, { field: 'c', width: 100 }],
            columnGroupingModel: [{ groupId: 'g', headerName: 'G', children: ['a', 'b'] }],
        });
        const group = container.querySelector<HTMLElement>('.ogx-col-group-cell--group')!;
        const ha = container.querySelector<HTMLElement>('.ogx__header-cell[data-field="a"]')!;
        expect(group.style.width).toBe(`${parseFloat(ha.style.width) + 70}px`);
    });

    describe('column reordering under column grouping', () => {
        const dataTransfer = () => ({ effectAllowed: 'none', dropEffect: 'none', setData: vi.fn(), getData: vi.fn() });
        const headerFields = (c: HTMLElement) =>
            Array.from(c.querySelectorAll<HTMLElement>('.ogx__header-cell[data-field]')).map(el => el.dataset.field);
        const drag = (c: HTMLElement, from: string, to: string) => {
            const source = c.querySelector<HTMLElement>(`.ogx__header-cell[data-field="${from}"]`)!;
            const target = c.querySelector<HTMLElement>(`.ogx__header-cell[data-field="${to}"]`)!;
            fireEvent.dragStart(source, { dataTransfer: dataTransfer() });
            fireEvent.dragOver(target, { dataTransfer: dataTransfer() });
            fireEvent.drop(target, { dataTransfer: dataTransfer() });
        };
        const FOUR: GridColDef<Row>[] = ['a', 'b', 'c', 'd'].map(field => ({ field, width: 100 }));
        const MODEL: GridColumnGroupingModel = [{ groupId: 'g', headerName: 'G', children: ['a', 'b'] }];

        it('lets header drag reorder columns within the same group', () => {
            const { container } = renderGrid({ columns: FOUR, columnGroupingModel: MODEL });
            drag(container, 'b', 'a');
            expect(headerFields(container)).toEqual(['b', 'a', 'c', 'd']);
        });

        it('lets header drag reorder ungrouped columns', () => {
            const { container } = renderGrid({ columns: FOUR, columnGroupingModel: MODEL });
            drag(container, 'd', 'c');
            expect(headerFields(container)).toEqual(['a', 'b', 'd', 'c']);
        });

        it('blocks a header drop that would move a column out of (or into) a group', () => {
            const { container } = renderGrid({ columns: FOUR, columnGroupingModel: MODEL });
            drag(container, 'a', 'c');
            drag(container, 'd', 'b');
            expect(headerFields(container)).toEqual(['a', 'b', 'c', 'd']);
        });

        it('applies the same rule to the toolbar column reorder', () => {
            let reorder: ((from: string, to: string) => void) | undefined;
            const Toolbar = (props: { onColumnReorder?: (from: string, to: string) => void }) => {
                reorder = props.onColumnReorder;
                return null;
            };
            const { container } = renderGrid({ columns: FOUR, columnGroupingModel: MODEL, slots: { toolbar: Toolbar } });
            act(() => { reorder?.('a', 'c'); });
            expect(headerFields(container)).toEqual(['a', 'b', 'c', 'd']);
            act(() => { reorder?.('b', 'a'); });
            expect(headerFields(container)).toEqual(['b', 'a', 'c', 'd']);
        });
    });
});
