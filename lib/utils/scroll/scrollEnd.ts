import type { GridRowScrollEndParams } from '../../types';

/** How close (px) to the bottom of a scroll container counts as the end for `onRowsScrollEnd`. */
export const ROWS_SCROLL_END_THRESHOLD = 100;

/**
 * The `onRowsScrollEnd` params for a scrolled row container, or null while it is further than
 * ROWS_SCROLL_END_THRESHOLD from the bottom. Shared by the grid viewport and the list view.
 */
export function getRowsScrollEndParams(el: HTMLElement): GridRowScrollEndParams | null {
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight >= ROWS_SCROLL_END_THRESHOLD) return null;
    return {
        visibleTop: scrollTop,
        visibleBottom: scrollTop + clientHeight,
        viewportHeight: clientHeight,
    };
}
