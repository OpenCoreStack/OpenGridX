import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { useGridApiRef } from './useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridRowModel, GridSortItem } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100, type: 'number' },
];
const ROWS: GridRowModel[] = [
    { id: 1, name: 'Carol', age: 30 },
    { id: 2, name: 'Alice', age: 25 },
    { id: 3, name: 'Bob', age: 40 },
];

function renderedNames(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('.ogx__row')).map(r => r.querySelector('[role="gridcell"]')?.textContent ?? '');
}

type Extra = Partial<DataGridProps>;

function renderWithApi(extra: Extra = {}) {
    const out: { api: GridApi | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        useEffect(() => { out.api = apiRef.current; });
        return <DataGrid rows={ROWS} columns={COLS} apiRef={apiRef} {...extra} />;
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => out.api! };
}

describe('apiRef sorting', () => {
    it('sortColumn re-sorts the rendered rows and fires onSortModelChange', () => {
        const onSortModelChange = vi.fn();
        const { container, api } = renderWithApi({ onSortModelChange });
        act(() => { api().sortColumn('name', 'asc'); });
        expect(renderedNames(container)).toEqual(['Alice', 'Bob', 'Carol']);
        expect(onSortModelChange).toHaveBeenLastCalledWith([{ field: 'name', sort: 'asc' }]);
        expect(api().getSortModel()).toEqual([{ field: 'name', sort: 'asc' }]);
    });

    it('sortColumn replaces the sort like a header click, and merges under multiSort', () => {
        const single = renderWithApi({ initialState: { sorting: { sortModel: [{ field: 'age', sort: 'desc' }] } } });
        act(() => { single.api().sortColumn('name', 'asc'); });
        expect(single.api().getSortModel()).toEqual([{ field: 'name', sort: 'asc' }]);
        single.unmount();

        const multi = renderWithApi({ multiSort: true, initialState: { sorting: { sortModel: [{ field: 'age', sort: 'desc' }] } } });
        act(() => { multi.api().sortColumn('name', 'asc'); });
        expect(multi.api().getSortModel()).toEqual([{ field: 'age', sort: 'desc' }, { field: 'name', sort: 'asc' }]);
        act(() => { multi.api().sortColumn('age', null); });
        expect(multi.api().getSortModel()).toEqual([{ field: 'name', sort: 'asc' }]);
    });

    it('getSortModel returns the controlled sortModel', () => {
        const { api } = renderWithApi({ sortModel: [{ field: 'age', sort: 'desc' }] });
        expect(api().getSortModel()).toEqual([{ field: 'age', sort: 'desc' }]);
    });

    it('getSortModel follows a header-click sort', () => {
        const { container, api } = renderWithApi();
        fireEvent.click(container.querySelector('[role="columnheader"]') as HTMLElement);
        expect(api().getSortModel()).toEqual([{ field: 'name', sort: 'asc' }]);
    });

    it('under a controlled sortModel, sortColumn only reports the change', () => {
        const onSortModelChange = vi.fn();
        const sortModel: GridSortItem[] = [];
        const { container, api } = renderWithApi({ sortModel, onSortModelChange });
        act(() => { api().sortColumn('name', 'asc'); });
        expect(onSortModelChange).toHaveBeenCalledWith([{ field: 'name', sort: 'asc' }]);
        expect(renderedNames(container)).toEqual(['Carol', 'Alice', 'Bob']);
    });
});

describe('apiRef filtering', () => {
    it('setFilterModel filters the grid and fires onFilterModelChange', () => {
        const onFilterModelChange = vi.fn();
        const { container, api } = renderWithApi({ onFilterModelChange });
        const model = { items: [{ field: 'name', operator: 'equals' as const, value: 'Bob' }] };
        act(() => { api().setFilterModel(model); });
        expect(renderedNames(container)).toEqual(['Bob']);
        expect(onFilterModelChange).toHaveBeenLastCalledWith(model);
        expect(api().getFilterModel()).toEqual(model);
    });

    it('getFilterModel returns the controlled filterModel', () => {
        const filterModel = { items: [{ field: 'name', operator: 'contains' as const, value: 'a' }] };
        const { api } = renderWithApi({ filterModel });
        expect(api().getFilterModel()).toEqual(filterModel);
    });
});

describe('apiRef pagination', () => {
    it('setPage and setPageSize change the rendered page and fire onPaginationModelChange', () => {
        const onPaginationModelChange = vi.fn();
        const { container, api } = renderWithApi({
            pagination: true,
            pageSizeOptions: [1, 2],
            initialState: { pagination: { paginationModel: { page: 0, pageSize: 1 } } },
            onPaginationModelChange,
        });
        expect(renderedNames(container)).toEqual(['Carol']);
        act(() => { api().setPage(2); });
        expect(renderedNames(container)).toEqual(['Bob']);
        expect(onPaginationModelChange).toHaveBeenLastCalledWith({ page: 2, pageSize: 1 });

        act(() => { api().setPageSize(2); });
        expect(renderedNames(container)).toEqual(['Carol', 'Alice']);
        expect(onPaginationModelChange).toHaveBeenLastCalledWith({ page: 0, pageSize: 2 });
    });
});

describe('apiRef selection', () => {
    it('selectRow selects the row, fires onRowSelectionModelChange, and getSelectedRows sees it', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, api } = renderWithApi({ checkboxSelection: true, onRowSelectionModelChange });
        act(() => { api().selectRow(2); });
        expect(api().getSelectedRows()).toEqual([2]);
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
        expect(container.querySelectorAll('.ogx__row--selected')).toHaveLength(1);
    });

    it('consecutive setter calls in one tick build on each other', () => {
        const { api } = renderWithApi({ checkboxSelection: true });
        act(() => {
            api().selectRow(1);
            api().selectRow(3);
        });
        expect(api().getSelectedRows()).toEqual([1, 3]);
        act(() => { api().selectRows([1, 3], false); });
        expect(api().getSelectedRows()).toEqual([]);
    });

    it('selectRows honors disableMultipleRowSelection', () => {
        const { api } = renderWithApi({ checkboxSelection: true, disableMultipleRowSelection: true });
        act(() => { api().selectRows([1, 2]); });
        expect(api().getSelectedRows()).toEqual([2]);
        act(() => { api().selectRow(3); });
        expect(api().getSelectedRows()).toEqual([3]);
    });
});

describe('apiRef visible rows and columns', () => {
    it('getVisibleColumns leaves out hidden columns and follows the column order', () => {
        const { api } = renderWithApi({ columnVisibilityModel: { age: false } });
        expect(api().getVisibleColumns().map(c => c.field)).toEqual(['name']);

        const ordered = renderWithApi({ columnOrder: ['age', 'name'] });
        expect(ordered.api().getVisibleColumns().map(c => c.field)).toEqual(['age', 'name']);
    });

    it('getVisibleRows and getAllFilteredRows include pinned rows', () => {
        const { api } = renderWithApi({ pinnedRows: { top: [1], bottom: [3] } });
        expect(api().getVisibleRows().map(r => r.id)).toEqual([1, 2, 3]);
        expect(api().getAllFilteredRows().map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('getAllFilteredRows ignores pagination; getVisibleRows is the current page', () => {
        const { api } = renderWithApi({
            pagination: true,
            pageSizeOptions: [2],
            initialState: { pagination: { paginationModel: { page: 0, pageSize: 2 } } },
        });
        expect(api().getVisibleRows().map(r => r.id)).toEqual([1, 2]);
        expect(api().getAllFilteredRows().map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('getAllFilteredRows returns every matching tree node, including children of collapsed nodes', () => {
        const rows: GridRowModel[] = [
            { id: 1, path: ['A'], name: 'a' },
            { id: 2, path: ['A', 'B'], name: 'b' },
            { id: 3, path: ['C'], name: 'c' },
        ];
        const out: { api: GridApi | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { out.api = apiRef.current; });
            return <DataGrid rows={rows} columns={[{ field: 'name' }]} apiRef={apiRef} treeData getTreeDataPath={(r) => r.path as string[]} />;
        }
        render(<Harness />);
        expect(out.api!.getVisibleRows().map(r => r.id)).toEqual([1, 3]);
        expect(out.api!.getAllFilteredRows().map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('getAllFilteredRows under row grouping returns the filtered data rows, not group rows', () => {
        const rows: GridRowModel[] = [
            { id: 1, team: 'B', name: 'z' },
            { id: 2, team: 'A', name: 'y' },
            { id: 3, team: 'B', name: 'x' },
        ];
        const out: { api: GridApi | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { out.api = apiRef.current; });
            return (
                <DataGrid rows={rows} columns={[{ field: 'team' }, { field: 'name' }]} apiRef={apiRef}
                    rowGroupingModel={['team']} filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'x' }] }} />
            );
        }
        render(<Harness />);
        expect(out.api!.getAllFilteredRows().map(r => r.id)).toEqual([3]);
    });
});

describe('useGridApiRef', () => {
    it('is usable before the grid mounts and is live in the parent\'s layout effects', () => {
        const seen: { beforeMount: unknown; inLayoutEffect: unknown } = { beforeMount: 'unset', inLayoutEffect: 'unset' };
        function Harness() {
            const apiRef = useGridApiRef();
            const [first] = useState(() => apiRef.current.getAllRows());
            seen.beforeMount = first;
            useLayoutEffect(() => { seen.inLayoutEffect = apiRef.current.getAllRows().length; }, [apiRef]);
            return <DataGrid rows={ROWS} columns={COLS} apiRef={apiRef} />;
        }
        render(<Harness />);
        expect(seen.beforeMount).toEqual([]);
        expect(seen.inLayoutEffect).toBe(3);
    });
});
