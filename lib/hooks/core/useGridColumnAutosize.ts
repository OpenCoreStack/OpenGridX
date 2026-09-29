import { useCallback, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type { GridApi, GridColDef, GridValidRowModel } from '../../types';
import { clampAutosizeWidth, measureColumnContentWidth } from '../../utils/columnAutosize';

export interface UseGridColumnAutosizeParams<R extends GridValidRowModel> {
    apiRef: MutableRefObject<GridApi>;
    /** The grid root (`.ogx`). */
    containerRef: RefObject<HTMLDivElement | null>;
    /** Every column the grid knows (hidden ones are measured as not rendered and left alone). */
    columns: readonly GridColDef<R>[];
    /** The width setter a manual resize uses. */
    onColumnResize: (field: string, width: number) => void;
}

/**
 * Auto-sizing of columns to their content: the header and the cells in the current render window,
 * measured in the DOM, clamped to `minWidth` / `maxWidth`. Columns with `resizable: false` are left
 * alone. A flex column gets a fixed width, like after a manual resize. Installs `autosizeColumn` /
 * `autosizeColumns` on the API and returns `autosizeColumn` for the resize handle.
 */
export function useGridColumnAutosize<R extends GridValidRowModel>(params: UseGridColumnAutosizeParams<R>): (field: string) => void {
    const { apiRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const autosizeColumns = useCallback((fields?: readonly string[]) => {
        const { containerRef, columns, onColumnResize } = latestRef.current;
        const root = containerRef.current;
        if (!root) return;
        // Measure every column first: the reads all see the same layout, then the widths are set.
        const widths: Array<[string, number]> = [];
        for (const field of fields ?? columns.map(c => c.field)) {
            const colDef = columns.find(c => c.field === field);
            if (!colDef || colDef.resizable === false) continue;
            const measured = measureColumnContentWidth(root, field);
            if (measured !== null) widths.push([field, clampAutosizeWidth(measured, colDef.minWidth, colDef.maxWidth)]);
        }
        for (const [field, width] of widths) onColumnResize(field, width);
    }, []);

    const autosizeColumn = useCallback((field: string) => autosizeColumns([field]), [autosizeColumns]);

    useLayoutEffect(() => {
        apiRef.current.autosizeColumn = autosizeColumn;
        apiRef.current.autosizeColumns = autosizeColumns;
    }, [apiRef, autosizeColumn, autosizeColumns]);

    return autosizeColumn;
}
