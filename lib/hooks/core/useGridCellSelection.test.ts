import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridCellSelection } from './useGridCellSelection';
import type { UseGridCellSelectionParams } from './useGridCellSelection';
import type { GridSpanningResult } from '../features/useGridSpanning';
import type { LayoutResult } from './useLayout';
import type { GridCellSelectionModel, GridColDef, GridRowModel } from '../../types';

const ROWS: GridRowModel[] = [
    { id: 1, a: 'a1', b: 'b1' },
    { id: 2, a: 'a2', b: 'b2' },
];
const COLUMNS: GridColDef[] = [
    { field: 'a', headerName: 'Col A' },
    { field: 'b', headerName: 'Col B' },
];
const MODEL: GridCellSelectionModel = [{ anchor: { id: 1, field: 'a' }, head: { id: 2, field: 'b' } }];

function makeParams(): UseGridCellSelectionParams<GridRowModel> {
    const spanning = { hasColSpan: false, hasRowSpan: false } as GridSpanningResult;
    const layout = {} as LayoutResult<GridRowModel>;
    return {
        enabled: true,
        model: MODEL,
        onModelChange: () => {},
        getPendingModel: () => null,
        allRenderableRows: ROWS,
        getRowId: row => row.id,
        navigationColumns: COLUMNS,
        columnIndexMap: new Map(COLUMNS.map((c, i) => [c.field, i])),
        spanning,
        rowMetaMap: new Map(),
        layout,
        rowHeight: 32,
        pinnedTopRowCount: 0,
        viewportRef: { current: null },
        containerRef: { current: null },
        showStats: false,
    };
}

describe('useGridCellSelection getCopyText', () => {
    it('adds the header line only when includeHeaders is set', () => {
        const { result } = renderHook(() => useGridCellSelection(makeParams()));
        expect(result.current.getCopyText({ includeHeaders: true })).toBe('Col A\tCol B\na1\tb1\na2\tb2');
        expect(result.current.getCopyText()).toBe('a1\tb1\na2\tb2');
    });
});
