import type { GridColDef, GridRowId, GridRowModel } from '../../types';
import type { GridAriaRowLayout } from '../../utils/aria';
import type { GridSpanningResult } from '../features/useGridSpanning';
import { useGridSpanRowWindow, useGridSpanColumnWindow } from '../features/useGridSpanRenderWindow';
import { useGridAriaRows, type UseGridAriaRowsParams } from './useGridAriaRows';
import { useGridVisibleRows, type GridVisibleRow } from './useGridVisibleRows';
import type { GridVirtualizationResult } from './useGridVirtualization';
import type { LayoutResult } from './useLayout';

export interface UseGridRenderWindowParams<R extends GridRowModel> {
    aria: UseGridAriaRowsParams;
    spanning: GridSpanningResult;
    virtualization: GridVirtualizationResult<R>;
    layout: LayoutResult<R>;
    pinnedTopRows: R[];
    pinnedBottomRows: R[];
    paginatedUnpinnedRows: R[];
    sortedUnpinnedRows: R[];
    pagination: boolean;
    getRowId: (row: R) => GridRowId;
}

export interface UseGridRenderWindowResult<R extends GridRowModel> {
    ariaRows: GridAriaRowLayout;
    spanRowWindow: ReturnType<typeof useGridSpanRowWindow>;
    visibleRows: GridVisibleRow<R>[];
    renderColumns: GridColDef<R>[];
}

/**
 * Steps 38–41 of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: the
 * `aria-rowcount` / `aria-rowindex` bases, the render window widened to whole row spans, the rows to
 * render (pinned + virtual centre) and the columns to render, widened to whole column spans.
 */
export function useGridRenderWindow<R extends GridRowModel>(params: UseGridRenderWindowParams<R>): UseGridRenderWindowResult<R> {
    const {
        aria, spanning, virtualization, layout, pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows,
        pagination, getRowId,
    } = params;

    const ariaRows = useGridAriaRows(aria);

    const spanRowWindow = useGridSpanRowWindow({
        spanning,
        renderContext: virtualization.renderContext,
        offsetTop: virtualization.offsetTop,
        cumulativeHeights: layout.cumulativeHeights,
    });

    const visibleRows = useGridVisibleRows<R>({
        renderContext: spanRowWindow.renderContext,
        pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows, pagination,
        getRowId,
    });

    const renderColumns = useGridSpanColumnWindow<R>({
        spanning,
        firstColumnIndex: virtualization.renderContext.firstColumnIndex,
        lastColumnIndex: virtualization.renderContext.lastColumnIndex,
        virtualColumns: virtualization.virtualColumns,
        layout,
        rows: visibleRows,
    });

    return { ariaRows, spanRowWindow, visibleRows, renderColumns };
}
