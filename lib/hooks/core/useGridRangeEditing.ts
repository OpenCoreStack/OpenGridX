import type { MutableRefObject, RefObject } from 'react';
import type { DataGridProps, GridApi, GridCellParams, GridCellSelectionModel, GridColDef, GridRowId, GridRowMeta, GridRowModel } from '../../types';
import type { UseGridCellSelectionReturn } from './useGridCellSelection';
import type { FocusedCell } from './useGridKeyboardNavigation';
import type { LayoutResult } from './useLayout';
import type { UseGridBatchEditReturn } from '../features/useGridBatchEdit';
import { useGridCellSelectionApi } from './useGridCellSelectionApi';
import { useGridClipboardPaste } from './useGridClipboardPaste';
import { useGridUndoRedo, UNDO_HISTORY_LIMIT, type GridEditCommitChannel } from './useGridUndoRedo';
import { useGridFillHandle } from './useGridFillHandle';

/** The `DataGrid` props the range editing hooks read. */
export type GridRangeEditingProps<R extends GridRowModel> = Pick<DataGridProps<R>,
    'disableClipboardPaste' | 'disableRangeClear' | 'onClipboardPaste' | 'onBeforeClipboardPaste' |
    'undoRedo' | 'onHistoryChange' | 'disableFillHandle' | 'onFill'>;

export interface UseGridRangeEditingParams<R extends GridRowModel> {
    props: GridRangeEditingProps<R>;
    apiRef: MutableRefObject<GridApi>;
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    selection: UseGridCellSelectionReturn;
    model: GridCellSelectionModel;
    getPendingModel: () => GridCellSelectionModel | null;
    focusedCell: FocusedCell | null;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    navigationColumns: GridColDef<R>[];
    columnIndexMap: Map<string, number>;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
    isEditing: boolean;
    batchEdit: UseGridBatchEditReturn<R>;
    channel: GridEditCommitChannel;
    layout: LayoutResult<R>;
    rowHeight: number;
    pinnedTopRowCount: number;
}

/**
 * Steps 36a–36d of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: the cell
 * selection API (anchor and focus kept together), clipboard paste and range clear, undo/redo, and the fill
 * handle. Returns the fill handle (its position goes to the row renderers).
 */
export function useGridRangeEditing<R extends GridRowModel>(params: UseGridRangeEditingParams<R>) {
    const {
        props, apiRef, containerRef, viewportRef, selection, model, getPendingModel, focusedCell, setFocusedCell,
        allRenderableRows, getRowId, navigationColumns, columnIndexMap, isCellEditable, rowMetaMap, getSpanOrigin,
        isEditing, batchEdit, channel, layout, rowHeight, pinnedTopRowCount,
    } = params;
    const {
        disableClipboardPaste = false,
        disableRangeClear = false,
        onClipboardPaste,
        onBeforeClipboardPaste,
        undoRedo = false,
        disableFillHandle = false,
        onFill,
        onHistoryChange,
    } = props;

    // Keeps the range anchor and the focused cell together; installs the cell selection API.
    useGridCellSelectionApi({
        apiRef,
        selection,
        model,
        getPendingModel,
        focusedCell,
        setFocusedCell,
        containerRef,
    });

    // Ctrl/Cmd+V and Delete on a range (cellSelection); apiRef.pasteText.
    useGridClipboardPaste<R>({
        apiRef, containerRef, viewportRef,
        selection,
        disableClipboardPaste, disableRangeClear,
        focusedCell,
        allRenderableRows,
        getRowId,
        navigationColumns,
        isCellEditable,
        rowMetaMap,
        getSpanOrigin,
        isEditing,
        batchEdit,
        onClipboardPaste,
        onBeforeClipboardPaste,
    });

    // Undo / redo (undoRedo): history of committed edits, keys and apiRef methods.
    useGridUndoRedo<R>({
        apiRef,
        enabled: Boolean(undoRedo),
        limit: (typeof undoRedo === 'object' && undoRedo.limit) || UNDO_HISTORY_LIMIT,
        onHistoryChange,
        channel,
        batchEdit,
        isEditing,
        containerRef, viewportRef,
        selection,
        setFocusedCell,
        allRenderableRows,
        getRowId,
        navigationColumns,
        layout,
        rowHeight,
        pinnedTopRowCount,
    });

    // Fill handle (cellSelection): drag the range's corner, Ctrl/Cmd+D and Ctrl/Cmd+R.
    return useGridFillHandle<R>({
        containerRef, viewportRef,
        selection,
        disableFillHandle,
        isEditing,
        allRenderableRows,
        getRowId,
        navigationColumns,
        columnIndexMap,
        isCellEditable,
        rowMetaMap,
        getSpanOrigin,
        batchEdit,
        onFill,
    });
}
