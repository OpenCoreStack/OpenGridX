import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export interface UseGridDevWarningsParams {
    paginationRequested: boolean;
    isRowGrouping: boolean;
    autoHeight: boolean;
    viewportHeight: number;
    renderedRowCount: number;
    totalRowCount: number;
    /** `pinnedRows` is set while tree data or row grouping is active, where it has no effect. */
    pinnedRowsIgnored?: boolean;
    /** Pixel height of the scrollable content. */
    scrollHeight?: number;
    /** `listView` is set but `listViewColumn` is not, so the grid view is shown. */
    listViewWithoutColumn?: boolean;
}

// Below this many rows, rendering everything is harmless, so an unbounded container is not worth a warning.
const UNBOUNDED_WARN_THRESHOLD = 200;

/**
 * Browsers cap element heights (Firefox at about 17.9M px, Chromium and Safari at about 33.5M px):
 * rows laid out below the cap cannot be scrolled to.
 */
export const MAX_SCROLLABLE_HEIGHT = 17_800_000;

export function useGridDevWarnings(params: UseGridDevWarningsParams): void {
    const { paginationRequested, isRowGrouping, autoHeight, viewportHeight, renderedRowCount, totalRowCount, pinnedRowsIgnored = false, scrollHeight = 0, listViewWithoutColumn = false } = params;
    const warnedPaginationRef = useRef(false);
    const warnedUnboundedRef = useRef(false);
    const warnedPinnedRowsRef = useRef(false);
    const warnedHeightRef = useRef(false);
    const warnedListViewRef = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedListViewRef.current || !listViewWithoutColumn) return;
        warnedListViewRef.current = true;
        console.warn(
            '[OpenGridX] `listView` is set without a `listViewColumn`, so the grid view is shown instead. ' +
            'Pass `listViewColumn` to render list items. See docs/features/list-view.md.'
        );
    }, [listViewWithoutColumn]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedPinnedRowsRef.current || !pinnedRowsIgnored) return;
        warnedPinnedRowsRef.current = true;
        console.warn(
            '[OpenGridX] `pinnedRows` is ignored while treeData or rowGroupingModel is active: the rows stay in their ' +
            'place in the hierarchy. See docs/features/pinning.md.'
        );
    }, [pinnedRowsIgnored]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedHeightRef.current || scrollHeight <= MAX_SCROLLABLE_HEIGHT) return;
        warnedHeightRef.current = true;
        console.warn(
            `[OpenGridX] The grid content is ${Math.round(scrollHeight)}px tall. Browsers cap element heights ` +
            '(about 17.9M px in Firefox, 33.5M px in Chrome and Safari), so the last rows may not be reachable by scrolling. ' +
            'Use pagination, server-side or infinite loading, or a smaller rowHeight. See docs/features/virtualization.md.'
        );
    }, [scrollHeight]);

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

/**
 * True when the grid's stylesheet does not reach `root` (the `.ogx` element). The stylesheet lays the
 * root out as a flex column; without it the root is a plain block and the viewport does not scroll.
 * jsdom applies no library CSS, so it is never reported there.
 */
export function isGridStylesheetMissing(root: HTMLElement): boolean {
    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return false;
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return false;
    return window.getComputedStyle(root).display !== 'flex';
}

let warnedStylesheet = false;

/**
 * Dev-only: warns once per page when a grid renders without `@opencorestack/opengridx/styles`.
 * The JS bundle does not load the stylesheet, and without it the viewport grows to fit every row,
 * which silently turns virtualization off.
 */
export function useGridStylesheetWarning(rootRef: RefObject<HTMLElement | null>): void {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedStylesheet) return;
        const root = rootRef.current;
        if (!root || !isGridStylesheetMissing(root)) return;
        warnedStylesheet = true;
        console.warn(
            '[OpenGridX] The grid stylesheet is not loaded, so the grid is unstyled and renders every row ' +
            "(its viewport does not scroll). Add `import '@opencorestack/opengridx/styles'` once in your app root. " +
            'See README.md, Getting Started.'
        );
    }, [rootRef]);
}

/** Test helper: lets the stylesheet warning fire again. */
export function resetGridStylesheetWarning(): void {
    warnedStylesheet = false;
}
