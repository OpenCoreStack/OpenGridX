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
}

/**
 * Copies the selected rows (every page, collapsed groups, pinned rows) with the on-screen columns
 * in screen order, on Ctrl/Cmd+C while focus is inside this grid, and installs `copySelectedRows`
 * on the API for programmatic use.
 */
export function useGridClipboardApi(params: UseGridClipboardApiParams): void {
    const { apiRef, columns, getRowId, containerRef, disableKeyboardShortcut } = params;

    const getGridRootElement = useCallback(() => containerRef.current, [containerRef]);
    const { copySelectedRows } = useGridClipboard({
        getSelectedRowIds: () => apiRef.current.getSelectedRows(),
        getColumns: () => columns,
        getRows: () => apiRef.current.getAllFilteredRows(),
        getRowId,
        getRootElement: getGridRootElement,
        disableKeyboardShortcut,
    });

    // Stable identity.
    useLayoutEffect(() => {
        apiRef.current.copySelectedRows = copySelectedRows;
    }, [copySelectedRows, apiRef]);
}
