import { useCallback, useLayoutEffect } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { useGridClipboard } from '../features/useGridClipboard';
import type { GridApi, GridColDef, GridRowId, GridRowModel } from '../../types';

export interface UseGridClipboardApiParams {
    apiRef: MutableRefObject<GridApi>;
    /** The rendered data columns, in screen order. */
    columns: GridColDef[];
    getRowId: (row: GridRowModel) => GridRowId;
    /** The grid root: Ctrl/Cmd+C only copies while focus is inside it. */
    containerRef: RefObject<HTMLDivElement | null>;
    disableKeyboardShortcut: boolean;
    /**
     * Cell range selection: the text Ctrl/Cmd+C copies instead of the selected rows (`null`: nothing).
     * Absent while `cellSelection` is off, so the shortcut copies rows.
     */
    getCellRangeCopyText?: () => string | null;
}

/**
 * Copies the selected rows (every page, collapsed groups, pinned rows) with the on-screen columns
 * in screen order, on Ctrl/Cmd+C while focus is inside this grid, and installs `copySelectedRows`
 * on the API for programmatic use. With `cellSelection` on, the shortcut copies the cell range instead.
 */
export function useGridClipboardApi(params: UseGridClipboardApiParams): void {
    const { apiRef, columns, getRowId, containerRef, disableKeyboardShortcut, getCellRangeCopyText } = params;

    const getGridRootElement = useCallback(() => containerRef.current, [containerRef]);
    const { copySelectedRows } = useGridClipboard({
        getSelectedRowIds: () => apiRef.current.getSelectedRows(),
        getColumns: () => columns,
        getRows: () => apiRef.current.getAllFilteredRows(),
        getRowId,
        getRootElement: getGridRootElement,
        disableKeyboardShortcut,
        getShortcutText: getCellRangeCopyText,
    });

    // Stable identity.
    useLayoutEffect(() => {
        apiRef.current.copySelectedRows = copySelectedRows;
    }, [copySelectedRows, apiRef]);
}
