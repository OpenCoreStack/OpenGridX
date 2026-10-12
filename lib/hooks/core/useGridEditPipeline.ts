import type { GridColDef, GridRowId, GridRowModel } from '../../types';
import { useGridEditCommitChannel } from './useGridUndoRedo';
import { useGridBatchEdit, type UseGridBatchEditParams } from '../features/useGridBatchEdit';
import { useGridEditing } from '../features/useGridEditing';

export interface UseGridEditPipelineParams<R extends GridRowModel> {
    /** The row store's lookup (rows stored since the last render are read through `batchEdit.getRow`). */
    rowsLookup: ReadonlyMap<GridRowId, R>;
    /** The stored rows, in store order. */
    rows: R[];
    getRowId: (row: R) => GridRowId;
    columns: GridColDef<R>[];
    processRowUpdate: UseGridBatchEditParams<R>['processRowUpdate'];
    onProcessRowUpdateError: UseGridBatchEditParams<R>['onProcessRowUpdateError'];
    replaceRows: UseGridBatchEditParams<R>['replaceRows'];
}

/**
 * Steps 12a–13 of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: the edit
 * commit channel, the batch edit and single-cell editing. Single edits store through `batchEdit.storeRow`
 * and report to the channel; the undo/redo history (`useGridRangeEditing`, later) listens on it.
 */
export function useGridEditPipeline<R extends GridRowModel>(params: UseGridEditPipelineParams<R>) {
    const { rowsLookup, rows, getRowId, columns, processRowUpdate, onProcessRowUpdateError, replaceRows } = params;

    // Commits (single edits and batch edits) reach the undo/redo history created further down.
    const editCommitChannel = useGridEditCommitChannel();
    // Batch edits (paste, range clear, undo, redo): one processRowUpdate per row, one store update.
    const batchEdit = useGridBatchEdit<R>({
        rowsLookup,
        columns,
        processRowUpdate,
        onProcessRowUpdateError,
        replaceRows,
        onCommitted: editCommitChannel.emit,
    });

    const editingHandlers = useGridEditing({
        rows,
        getRowId,
        columns,
        processRowUpdate,
        onProcessRowUpdateError,
        onRowChange: (updatedRow, rowId) => {
            // Replaces the edited row in the *current* store, under the edited row's id: this runs
            // after an awaited processRowUpdate, by which time the rows prop (or a dataSource
            // fetch) may have replaced the rows this render saw. The returned row is stored as is
            // (the grid never writes an id onto it), even if it does not carry its key itself.
            batchEdit.storeRow(rowId, updatedRow);
        },
        onCommitted: (changes) => editCommitChannel.emit(changes, 'edit'),
    });

    return { editCommitChannel, batchEdit, editingHandlers };
}
