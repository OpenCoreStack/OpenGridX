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

/** Gap kept between a point menu and the viewport edges, in pixels. */
const POINT_MENU_MARGIN = 8;

/** Clamps `value` so a box of `size` stays inside `[margin, viewport - margin]`; oversized boxes sit at the margin. */
function clampToViewport(value: number, size: number, viewport: number): number {
    return Math.max(POINT_MENU_MARGIN, Math.min(value, viewport - size - POINT_MENU_MARGIN));
}

/**
 * Viewport position of a menu opened at the pointer `(x, y)`. Left-to-right it opens to the right
 * of the pointer and flips to end at it when it would overflow; right-to-left it opens towards the
 * inline start and stays at the pointer when that would overflow. Vertically it opens below the
 * pointer and flips above it. The result is clamped to an 8 px margin on every side.
 */
export function getPointMenuPosition(
    x: number,
    y: number,
    menu: { width: number; height: number },
    viewport: { width: number; height: number },
    rtl: boolean,
): { top: number; left: number } {
    let left = x;
    if (rtl) {
        if (x - menu.width < POINT_MENU_MARGIN) left = x;
        else left = x - menu.width;
    } else if (x + menu.width + POINT_MENU_MARGIN > viewport.width) {
        left = x - menu.width;
    }

    let top = y;
    if (y + menu.height + POINT_MENU_MARGIN > viewport.height) top = y - menu.height;

    return {
        top: clampToViewport(top, menu.height, viewport.height),
        left: clampToViewport(left, menu.width, viewport.width),
    };
}
