import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { DataGridProps, GridColDef, GridFilterModel, GridRowModel, GridSortItem } from '../../types';

afterEach(() => {
    vi.useRealTimers();
});

/** Text of the given column's cells, in row order (leaf and group rows alike). */
function cellTexts(container: HTMLElement, field: string): string[] {
    return Array.from(container.querySelectorAll(`.ogx__row [role="gridcell"][data-field="${field}"]`)).map(c => c.textContent ?? '');
}

/** A grid with a controlled filter model and the built-in toolbar. */
function FilterHarness(props: Omit<DataGridProps, 'filterModel' | 'onFilterModelChange'> & { initialFilter?: GridFilterModel; onModel?: (m: GridFilterModel) => void }) {
    const { initialFilter, onModel, ...rest } = props;
    const [model, setModel] = useState<GridFilterModel>(initialFilter ?? { items: [] });
    return (
        <div style={{ height: 400 }}>
            <DataGrid
                {...rest}
                filterModel={model}
                onFilterModelChange={(m) => { onModel?.(m); setModel(m); }}
                slots={{ toolbar: GridToolbar }}
            />
        </div>
    );
}

const openFilters = () => fireEvent.click(screen.getAllByLabelText('Advanced filters')[0]);
const advance = (ms = 400) => act(() => { vi.advanceTimersByTime(ms); });
const last = <T,>(list: T[]): T | undefined => list[list.length - 1];

describe('valueGetter columns', () => {
    const cols: GridColDef[] = [
        { field: 'fullName', headerName: 'Full name', width: 200, valueGetter: ({ row }) => `${row.first} ${row.last}` },
    ];
    const rows: GridRowModel[] = [{ id: 1, first: 'Zed', last: 'Young' }, { id: 2, first: 'Amy', last: 'Adams' }];

    it('sort by the computed value when the header is clicked', () => {
        const { container } = render(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} /></div>);
        fireEvent.click(screen.getByText('Full name'));
        expect(cellTexts(container, 'fullName')).toEqual(['Amy Adams', 'Zed Young']);
    });

    it('filter by the computed value', () => {
        const { container } = render(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} filterModel={{ items: [{ field: 'fullName', operator: 'contains', value: 'Amy' }] }} /></div>);
        expect(cellTexts(container, 'fullName')).toEqual(['Amy Adams']);
    });

    it('are searched by the quick filter', () => {
        const { container } = render(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} filterModel={{ quickFilterValues: ['amy adams'] }} /></div>);
        expect(cellTexts(container, 'fullName')).toEqual(['Amy Adams']);
    });

    it('sort under tree data by the computed value', () => {
        const treeRows: GridRowModel[] = [
            { id: 1, path: ['a'], first: 'Zed', last: 'Young' },
            { id: 2, path: ['b'], first: 'Amy', last: 'Adams' },
        ];
        const { container } = render(
            <div style={{ height: 300 }}>
                <DataGrid rows={treeRows} columns={cols} treeData getTreeDataPath={(r) => r.path as string[]} sortModel={[{ field: 'fullName', sort: 'asc' }]} />
            </div>
        );
        expect(cellTexts(container, 'fullName')).toEqual(['Amy Adams', 'Zed Young']);
    });

    it('filter leaf rows under row grouping by the computed value', () => {
        const groupCols: GridColDef[] = [...cols, { field: 'team', headerName: 'Team' }];
        const groupRows: GridRowModel[] = [
            { id: 1, team: 'A', first: 'Zed', last: 'Young' },
            { id: 2, team: 'A', first: 'Amy', last: 'Adams' },
            { id: 3, team: 'B', first: 'Bob', last: 'Brown' },
        ];
        const { container } = render(
            <div style={{ height: 300 }}>
                <DataGrid rows={groupRows} columns={groupCols} rowGroupingModel={['team']} defaultGroupingExpansionDepth={1}
                    filterModel={{ items: [{ field: 'fullName', operator: 'contains', value: 'amy' }] }} />
            </div>
        );
        const texts = cellTexts(container, 'fullName');
        expect(texts).toHaveLength(2); // group A header + Amy; group B has no matching leaf
        expect(texts[1]).toBe('Amy Adams');
    });
});

describe('quick filter searches visible columns only', () => {
    it('does not match a hidden column or the row id', () => {
        const cols: GridColDef[] = [{ field: 'name', headerName: 'Name' }, { field: 'secret', headerName: 'Secret' }];
        const rows: GridRowModel[] = [{ id: 11, name: 'Carol', secret: 'zebra' }, { id: 2, name: 'Alice', secret: 'lion' }];
        const hidden = { secret: false };
        const { container, rerender } = render(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} columnVisibilityModel={hidden} filterModel={{ quickFilterValues: ['zebra'] }} /></div>);
        expect(cellTexts(container, 'name')).toEqual([]);
        rerender(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} columnVisibilityModel={hidden} filterModel={{ quickFilterValues: ['1'] }} /></div>);
        expect(cellTexts(container, 'name')).toEqual([]);
        rerender(<div style={{ height: 300 }}><DataGrid rows={rows} columns={cols} filterModel={{ quickFilterValues: ['zebra'] }} /></div>);
        expect(cellTexts(container, 'name')).toEqual(['Carol']);
    });

    it('matches the valueFormatter text', () => {
        const cols: GridColDef[] = [{ field: 'price', headerName: 'Price', valueFormatter: ({ value }) => `$${Number(value).toLocaleString('en-US')}` }];
        const { container } = render(<div style={{ height: 300 }}><DataGrid rows={[{ id: 1, price: 1200 }, { id: 2, price: 7 }]} columns={cols} filterModel={{ quickFilterValues: ['$1,200'] }} /></div>);
        expect(cellTexts(container, 'price')).toEqual(['$1,200']);
    });
});

describe('filter panel inside the grid', () => {
    const COLS: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'age', headerName: 'Age', type: 'number', width: 100 },
        { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Active', 'Inactive'], width: 100 },
    ];
    const ROWS = [
        { id: 1, name: 'Carol', age: -3, status: 'Active' },
        { id: 2, name: 'Alice', age: 0, status: 'Inactive' },
        { id: 3, name: 'Bob', age: 40, status: 'Active' },
    ];

    it('choosing a singleSelect option shows the matching rows', () => {
        const { container } = render(<FilterHarness rows={ROWS} columns={COLS} />);
        openFilters();
        const select = screen.getByLabelText('Filter value for Status') as HTMLSelectElement;
        select.options[0].selected = true;
        fireEvent.change(select);
        expect(cellTexts(container, 'name')).toEqual(['Carol', 'Bob']);
    });

    it('picking an operator without typing a value does not filter', () => {
        vi.useFakeTimers();
        const { container } = render(<FilterHarness rows={ROWS} columns={COLS} />);
        openFilters();
        fireEvent.change(screen.getByLabelText('Filter operator for Age'), { target: { value: '>' } });
        advance();
        expect(cellTexts(container, 'name')).toEqual(['Carol', 'Alice', 'Bob']);
    });

    it('emptying the value input shows every row again', () => {
        vi.useFakeTimers();
        const { container } = render(<FilterHarness rows={ROWS} columns={COLS} />);
        openFilters();
        const input = screen.getByLabelText('Filter value for Age');
        fireEvent.change(input, { target: { value: '40' } });
        advance();
        expect(cellTexts(container, 'name')).toEqual(['Bob']);
        fireEvent.change(input, { target: { value: '' } });
        advance();
        expect(cellTexts(container, 'name')).toEqual(['Carol', 'Alice', 'Bob']);
    });

    it('does not list the synthetic grouping column', () => {
        render(<FilterHarness rows={ROWS} columns={COLS} rowGroupingModel={['status']} groupingColDef={{ field: '__group__', headerName: 'Group' }} />);
        openFilters();
        expect(screen.queryByLabelText('Filter value for Group')).toBeNull();
        expect(screen.getByLabelText('Filter value for Name')).toBeTruthy();
    });
});

describe('toolbar search', () => {
    const cols: GridColDef[] = [{ field: 'first', headerName: 'First' }, { field: 'city', headerName: 'City' }];
    const rows = [{ id: 1, first: 'John', city: 'London' }, { id: 2, first: 'Jane', city: 'Paris' }, { id: 3, first: 'Johnny', city: 'Paris' }];

    it('splits the search into words that may match different columns', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<FilterHarness rows={rows} columns={cols} onModel={(m) => seen.push(m)} />);
        const input = screen.getByLabelText('Global Search');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: '  john  london ' } });
        advance();
        expect(last(seen)?.quickFilterValues).toEqual(['john', 'london']);
        expect(cellTexts(container, 'first')).toEqual(['John']);
        // The box keeps what the user typed, it is not rewritten to the normalised terms.
        expect((input as HTMLInputElement).value).toBe('  john  london ');
    });

    it('shows every programmatic term and keeps them when the user edits', () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        render(<GridToolbar columns={cols} filterModel={{ items: [], quickFilterValues: ['john', 'london'] }} onFilterModelChange={onChange} />);
        const input = screen.getByLabelText('Global Search') as HTMLInputElement;
        expect(input.value).toBe('john london');
        fireEvent.change(input, { target: { value: 'john london uk' } });
        advance();
        expect((last(onChange.mock.calls)?.[0] as GridFilterModel | undefined)?.quickFilterValues).toEqual(['john', 'london', 'uk']);
    });
});

describe('multi-sort from the header and the column menu', () => {
    const cols: GridColDef[] = [
        { field: 'a', headerName: 'A', width: 100 },
        { field: 'b', headerName: 'B', width: 100 },
        { field: 'c', headerName: 'C', width: 100 },
    ];
    const rows: GridRowModel[] = [{ id: 1, a: 1, b: 2, c: 1 }, { id: 2, a: 1, b: 1, c: 2 }, { id: 3, a: 2, b: 1, c: 3 }];

    function SortHarness({ initial, onChange, multiSort }: { initial: GridSortItem[]; onChange: (m: GridSortItem[]) => void; multiSort?: boolean }) {
        const [model, setModel] = useState(initial);
        return (
            <div style={{ height: 400, width: 400 }}>
                <DataGrid rows={rows} columns={cols} sortModel={model} multiSort={multiSort}
                    onSortModelChange={(m) => { onChange(m); setModel(m); }} />
            </div>
        );
    }
    const header = (field: string) => document.querySelector(`[role="columnheader"][data-field="${field}"]`) as HTMLElement;
    const TWO_KEYS: GridSortItem[] = [{ field: 'a', sort: 'asc' }, { field: 'b', sort: 'asc' }];

    it('shift-click on the primary key flips its direction and keeps it primary', () => {
        const onChange = vi.fn();
        render(<SortHarness initial={TWO_KEYS} onChange={onChange} />);
        fireEvent.click(header('a'), { shiftKey: true });
        expect(onChange).toHaveBeenLastCalledWith([{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'asc' }]);
    });

    it('a multiSort click on the primary key keeps it primary', () => {
        const onChange = vi.fn();
        render(<SortHarness initial={TWO_KEYS} onChange={onChange} multiSort />);
        fireEvent.click(header('a'));
        expect(onChange).toHaveBeenLastCalledWith([{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'asc' }]);
    });

    it('column menu "Unsort" removes only that column', () => {
        const onChange = vi.fn();
        render(<SortHarness initial={TWO_KEYS} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Open column menu for B'));
        fireEvent.click(screen.getByText('Unsort'));
        expect(onChange).toHaveBeenLastCalledWith([{ field: 'a', sort: 'asc' }]);
    });

    it('column menu direction on an already-sorted column keeps the other keys', () => {
        const onChange = vi.fn();
        render(<SortHarness initial={TWO_KEYS} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Open column menu for B'));
        fireEvent.click(screen.getByText('Sort Descending'));
        expect(onChange).toHaveBeenLastCalledWith([{ field: 'a', sort: 'asc' }, { field: 'b', sort: 'desc' }]);
    });

    it('column menu on an unsorted column appends with multiSort and replaces without it', () => {
        const withMulti = vi.fn();
        const { unmount } = render(<SortHarness initial={TWO_KEYS} onChange={withMulti} multiSort />);
        fireEvent.click(screen.getByLabelText('Open column menu for C'));
        fireEvent.click(screen.getByText('Sort Ascending'));
        expect(withMulti).toHaveBeenLastCalledWith([...TWO_KEYS, { field: 'c', sort: 'asc' }]);
        unmount();

        const single = vi.fn();
        render(<SortHarness initial={TWO_KEYS} onChange={single} />);
        fireEvent.click(screen.getByLabelText('Open column menu for C'));
        fireEvent.click(screen.getByText('Sort Ascending'));
        expect(single).toHaveBeenLastCalledWith([{ field: 'c', sort: 'asc' }]);
    });
});
