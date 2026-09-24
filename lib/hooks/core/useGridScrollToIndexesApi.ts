import { useEffect } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { scrollRowIntoView, scrollColumnIntoView } from '../../utils/scroll';
import type { LayoutResult } from './useLayout';
import type { GridApi, GridRowModel } from '../../types';

export interface UseGridScrollToIndexesApiParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    viewportRef: RefObject<HTMLDivElement | null>;
    layout: LayoutResult<R>;
    rowHeight: number;
}

/** Installs `scrollToIndexes` on the API. */
export function useGridScrollToIndexesApi<R extends GridRowModel>(params: UseGridScrollToIndexesApiParams<R>): void {
    const { apiRef, viewportRef, layout, rowHeight } = params;

    useEffect(() => {
        apiRef.current.scrollToIndexes = ({ rowIndex, colIndex }) => {
            const el = viewportRef.current;
            if (!el) return;

            if (rowIndex !== undefined && rowIndex >= 0) {
                scrollRowIntoView(el, rowIndex, layout.cumulativeHeights, layout.pinnedBottomHeight, rowHeight);
            }

            if (colIndex !== undefined && colIndex >= 0) {
                // colIndex is an index into all data columns: leftPinned + unpinned + rightPinned
                const allDataCols = [...layout.leftPinnedCols, ...layout.unpinnedColsWithWidth, ...layout.rightPinnedCols];
                const targetCol = allDataCols[colIndex];
                if (!targetCol) return;
                // A pinned column (index -1) is always visible: nothing to scroll.
                scrollColumnIntoView(el, layout.unpinnedColsWithWidth.findIndex(c => c.field === targetCol.field), layout);
            }
        };
    }, [layout, viewportRef, apiRef, rowHeight]);
}
