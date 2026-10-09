import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { GridApi, GridColDef, GridRowGroupingModel } from '../../types';

const columns: GridColDef[] = [
    { field: 'name', width: 120 },
    { field: 'dept', width: 120 },
    { field: 'salary', type: 'number', width: 120 },
];
const rows = [
    { id: 1, name: 'Ann', dept: 'Sales', salary: 10 },
    { id: 2, name: 'Bob', dept: 'Sales', salary: 20 },
    { id: 3, name: 'Cid', dept: 'Ops', salary: 30 },
];

function Grid(props: { onApi: (api: React.MutableRefObject<GridApi>) => void } & Partial<React.ComponentProps<typeof DataGrid>>) {
    const { onApi, ...rest } = props;
    const apiRef = useGridApiRef();
    onApi(apiRef);
    return <DataGrid rows={rows} columns={columns} height={400} apiRef={apiRef} {...rest} />;
}

const groupRows = (container: HTMLElement) => container.querySelectorAll('.ogx__row--group').length;

describe('rowGroupingModel controlled/uncontrolled pair', () => {
    it('uncontrolled: apiRef.setRowGroupingModel groups the rows and fires onRowGroupingModelChange', () => {
        let api!: React.MutableRefObject<GridApi>;
        const onChange = vi.fn();
        const { container } = render(<Grid onApi={(a) => { api = a; }} onRowGroupingModelChange={onChange} />);
        expect(groupRows(container)).toBe(0);
        act(() => api.current.setRowGroupingModel(['dept']));
        expect(onChange).toHaveBeenCalledWith(['dept']);
        expect(groupRows(container)).toBe(2);
        expect(api.current.getGridAiState().rowGroupingModel).toEqual(['dept']);
        act(() => api.current.setRowGroupingModel([]));
        expect(groupRows(container)).toBe(0);
    });

    it('controlled: the prop wins; the change is only reported', () => {
        let api!: React.MutableRefObject<GridApi>;
        const onChange = vi.fn();
        const { container } = render(<Grid onApi={(a) => { api = a; }} rowGroupingModel={['dept']} onRowGroupingModelChange={onChange} />);
        expect(groupRows(container)).toBe(2);
        act(() => api.current.setRowGroupingModel([]));
        expect(onChange).toHaveBeenCalledWith([]);
        expect(groupRows(container)).toBe(2);
    });

    it('controlled with a parent that follows the callback', () => {
        let api!: React.MutableRefObject<GridApi>;
        function Parent() {
            const [model, setModel] = useState<GridRowGroupingModel>([]);
            return <Grid onApi={(a) => { api = a; }} rowGroupingModel={model} onRowGroupingModelChange={setModel} />;
        }
        const { container } = render(<Parent />);
        act(() => api.current.setRowGroupingModel(['dept']));
        expect(groupRows(container)).toBe(2);
    });
});

describe('GridApi model setters and getGridAiState', () => {
    it('fire the change callbacks and are read back by getGridAiState, also in one tick', () => {
        let api!: React.MutableRefObject<GridApi>;
        const onSort = vi.fn();
        const onAgg = vi.fn();
        const onVis = vi.fn();
        const onPivot = vi.fn();
        render(
            <Grid
                onApi={(a) => { api = a; }}
                onSortModelChange={onSort}
                onAggregationModelChange={onAgg}
                onColumnVisibilityModelChange={onVis}
                onPivotModelChange={onPivot}
            />,
        );
        const pivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' as const }] };
        act(() => {
            api.current.setSortModel([{ field: 'salary', sort: 'desc' }]);
            api.current.setAggregationModel({ salary: 'sum' });
            api.current.setColumnVisibilityModel({ name: false });
            api.current.setFilterModel({ items: [{ field: 'salary', operator: '>', value: 5 }] });
            api.current.setPivotModel(pivotModel);
            // Read in the same tick: the setters' values, not the last render's.
            expect(api.current.getGridAiState()).toEqual({
                filterModel: { items: [{ field: 'salary', operator: '>', value: 5 }] },
                sortModel: [{ field: 'salary', sort: 'desc' }],
                rowGroupingModel: [],
                aggregationModel: { salary: 'sum' },
                pivotModel,
                columnVisibilityModel: { name: false },
            });
        });
        expect(onSort).toHaveBeenCalledWith([{ field: 'salary', sort: 'desc' }]);
        expect(onAgg).toHaveBeenCalledWith({ salary: 'sum' });
        expect(onVis).toHaveBeenCalledWith({ name: false });
        expect(onPivot).toHaveBeenCalledWith(pivotModel);
        expect(api.current.getSortModel()).toEqual([{ field: 'salary', sort: 'desc' }]);
        expect(api.current.getVisibleColumns().map((c) => c.field)).toEqual(['dept', 'salary']);
    });

    it('openAiAssistant does nothing without aiAssistant', () => {
        let api!: React.MutableRefObject<GridApi>;
        const { container } = render(<Grid onApi={(a) => { api = a; }} />);
        act(() => api.current.openAiAssistant());
        expect(container.querySelector('[role="dialog"]')).toBeNull();
    });
});
