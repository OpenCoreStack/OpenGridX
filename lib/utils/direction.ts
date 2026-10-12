/** Whether `element` lays out right to left (`dir="rtl"` on it or an ancestor, or `direction: rtl`). */
export function isRtl(element: Element | null | undefined): boolean {
    if (!element) return false;
    const view = element.ownerDocument.defaultView;
    return view ? view.getComputedStyle(element).direction === 'rtl' : false;
}

/**
 * The key as seen in a left-to-right layout: in a right-to-left one ArrowLeft and ArrowRight are
 * swapped, so ArrowLeft always moves (or resizes, expands) towards the left of the screen.
 */
export function logicalArrowKey(key: string, rtl: boolean): string {
    if (!rtl) return key;
    if (key === 'ArrowLeft') return 'ArrowRight';
    if (key === 'ArrowRight') return 'ArrowLeft';
    return key;
}

/**
 * How far `element` is scrolled from its inline start, never negative. In a right-to-left
 * scroller modern engines report `scrollLeft` from 0 (at the start, on the right) down to
 * `-(scrollWidth - clientWidth)`; the grid's column maths counts from the start edge.
 */
export function getScrollStart(element: HTMLElement): number {
    return isRtl(element) ? -element.scrollLeft : element.scrollLeft;
}

/** Scrolls `element` to `offset` pixels from its inline start (see `getScrollStart`). */
export function setScrollStart(element: HTMLElement, offset: number): void {
    element.scrollLeft = isRtl(element) ? -offset : offset;
}

/** Fixed position of a toolbar panel under its button. */
export interface GridPanelPosition {
    top: number;
    /** Distance from the viewport's right edge to the panel's right edge (left-to-right). */
    right?: number;
    /** Distance from the viewport's left edge to the panel's left edge (right-to-left). */
    left?: number;
}

/**
 * Places a panel under `anchor`, lined up with the button's end edge and opening towards the
 * grid: leftwards in a left-to-right grid, rightwards in a right-to-left one.
 */
export function getPanelPosition(anchor: HTMLElement | null, viewportWidth: number): GridPanelPosition {
    if (!anchor) return { top: 0, right: 0 };
    const rect = anchor.getBoundingClientRect();
    return isRtl(anchor)
        ? { top: rect.bottom + 6, left: rect.left }
        : { top: rect.bottom + 6, right: viewportWidth - rect.right };
}
