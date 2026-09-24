import { useLayoutEffect, useRef } from 'react';
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

/**
 * Installs `scrollToIndexes` on the API, in a layout effect reading the latest layout from a ref,
 * so it is live in a parent's layout effect and never scrolls by a previous render's layout.
 */
export function useGridScrollToIndexesApi<R extends GridRowModel>(params: UseGridScrollToIndexesApiParams<R>): void {
    const { apiRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    useLayoutEffect(() => {
        apiRef.current.scrollToIndexes = ({ rowIndex, colIndex }) => {
            const { viewportRef, layout, rowHeight } = latestRef.current;
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
    }, [apiRef]);
}
