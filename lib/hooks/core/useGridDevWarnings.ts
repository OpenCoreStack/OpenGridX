import { useEffect, useRef } from 'react';

export interface UseGridDevWarningsParams {
    paginationRequested: boolean;
    isRowGrouping: boolean;
    autoHeight: boolean;
    viewportHeight: number;
    renderedRowCount: number;
    totalRowCount: number;
}

// Below this many rows, rendering everything is harmless, so an unbounded container is not worth a warning.
const UNBOUNDED_WARN_THRESHOLD = 200;

export function useGridDevWarnings(params: UseGridDevWarningsParams): void {
    const { paginationRequested, isRowGrouping, autoHeight, viewportHeight, renderedRowCount, totalRowCount } = params;
    const warnedPaginationRef = useRef(false);
    const warnedUnboundedRef = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedPaginationRef.current) return;
        if (paginationRequested && isRowGrouping) {
            warnedPaginationRef.current = true;
            console.warn(
                '[OpenGridX] `pagination` is ignored while `rowGroupingModel` is active — all group rows render in one ' +
                'scrollable view. Give the grid a bounded height so it virtualizes. See docs/features/tree-data-grouping.md.'
            );
        }
    }, [paginationRequested, isRowGrouping]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedUnboundedRef.current || autoHeight) return;
        if (viewportHeight > 0 && totalRowCount > UNBOUNDED_WARN_THRESHOLD && renderedRowCount >= totalRowCount) {
            warnedUnboundedRef.current = true;
            console.warn(
                `[OpenGridX] The grid viewport is ${Math.round(viewportHeight)}px tall and is rendering all ${totalRowCount} rows, ` +
                'so row virtualization is effectively off. The grid container has no bounded height: it grows to fit its ' +
                'content. Give it a fixed height, or if it is a flex child add `min-height: 0`. See docs/features/virtualization.md.'
            );
        }
    }, [autoHeight, viewportHeight, renderedRowCount, totalRowCount]);
}
