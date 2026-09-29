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
    /** Number of items the list view renders (0 when the list view is not shown). It does not virtualize. */
    listViewRowCount?: number;
}

// Below this many rows, rendering everything is harmless, so an unbounded container is not worth a warning.
const UNBOUNDED_WARN_THRESHOLD = 200;

/** The list view renders every item; above this many the page slows down noticeably. */
export const LIST_VIEW_WARN_THRESHOLD = 2000;

/**
 * Browsers cap element heights (Firefox at about 17.9M px, Chromium and Safari at about 33.5M px):
 * rows laid out below the cap cannot be scrolled to.
 */
export const MAX_SCROLLABLE_HEIGHT = 17_800_000;

export function useGridDevWarnings(params: UseGridDevWarningsParams): void {
    const { paginationRequested, isRowGrouping, autoHeight, viewportHeight, renderedRowCount, totalRowCount, pinnedRowsIgnored = false, scrollHeight = 0, listViewWithoutColumn = false, listViewRowCount = 0 } = params;
    const warnedPaginationRef = useRef(false);
    const warnedUnboundedRef = useRef(false);
    const warnedPinnedRowsRef = useRef(false);
    const warnedHeightRef = useRef(false);
    const warnedListViewRef = useRef(false);
    const warnedListViewSizeRef = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedListViewSizeRef.current || listViewRowCount <= LIST_VIEW_WARN_THRESHOLD) return;
        warnedListViewSizeRef.current = true;
        console.warn(
            `[OpenGridX] The list view is rendering all ${listViewRowCount} items: it does not virtualize. ` +
            'Above a few thousand items use `pagination`, server-side loading, or the grid view. See docs/features/list-view.md.'
        );
    }, [listViewRowCount]);

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
        // Really unbounded: every row is rendered and the viewport is at least as tall as the rows, so it never scrolls.
        if (viewportHeight > 0 && totalRowCount > UNBOUNDED_WARN_THRESHOLD && renderedRowCount >= totalRowCount && viewportHeight >= scrollHeight) {
            warnedUnboundedRef.current = true;
            console.warn(
                `[OpenGridX] The grid viewport is ${Math.round(viewportHeight)}px tall and is rendering all ${totalRowCount} rows, ` +
                'so row virtualization is effectively off: the grid fills its container, and the container grows to fit every row. ' +
                'Give the container a definite height (for example `height: 600px` or `100vh`). If the container, or any ancestor ' +
                'up to the sized one, is a flex or grid item, add `min-height: 0` to it. Alternatively pass a `height` prop, ' +
                'or `autoHeight` if rendering every row is intended. See docs/features/virtualization.md.'
            );
        }
    }, [autoHeight, viewportHeight, renderedRowCount, totalRowCount, scrollHeight]);
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
