import type { MutableRefObject, RefObject } from 'react';
import type { GridApi, GridColDef, GridRowId, GridRowModel } from '../../types';
import { useGridClipboardApi } from './useGridClipboardApi';
import { useGridScrollToIndexesApi } from './useGridScrollToIndexesApi';
import { useGridColumnAutosize } from './useGridColumnAutosize';
import type { LayoutResult } from './useLayout';

export interface UseGridViewApisParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    /** Rendered data columns with their layout-resolved widths, in render order (what Ctrl/Cmd+C copies). */
    copyColumns: GridColDef[];
    getRowId: (row: GridRowModel) => GridRowId;
    disableClipboardCopy: boolean;
    /** The cell range's copy text while `cellSelection` is on. */
    getCellRangeCopyText: (() => string | null) | undefined;
    layout: LayoutResult<R>;
    rowHeight: number;
    /** Every column in display order (what auto-size measures). */
    orderedColumns: GridColDef<R>[];
    onColumnResize: (field: string, width: number) => void;
}

/**
 * Steps 30–31a of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: the
 * `apiRef` installers that need the laid-out view — copy, `scrollToIndexes` and column auto-size.
 * Returns the resize handle's auto-size handler.
 */
export function useGridViewApis<R extends GridRowModel>(params: UseGridViewApisParams<R>): (field: string) => void {
    const {
        apiRef, containerRef, viewportRef, copyColumns, getRowId, disableClipboardCopy, getCellRangeCopyText, layout, rowHeight,
        orderedColumns, onColumnResize,
    } = params;

    useGridClipboardApi({
        apiRef,
        columns: copyColumns,
        getRowId,
        containerRef,
        disableKeyboardShortcut: disableClipboardCopy,
        getCellRangeCopyText,
    });
    useGridScrollToIndexesApi<R>({ apiRef, viewportRef, layout, rowHeight });
    return useGridColumnAutosize<R>({ apiRef, containerRef, columns: orderedColumns, onColumnResize });
}
