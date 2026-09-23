/**
 * Size of the layout viewport that `position: fixed` offsets are measured from. Unlike
 * `window.innerWidth` / `innerHeight` it excludes a classic (non-overlay) page scrollbar, so a
 * panel placed with `right: getViewportWidth() - anchorRect.right` lines up with its anchor on
 * Windows and Linux desktops too. Falls back to the window size where the document element
 * reports no size (jsdom).
 */
export function getViewportWidth(): number {
    return document.documentElement.clientWidth || window.innerWidth;
}

export function getViewportHeight(): number {
    return document.documentElement.clientHeight || window.innerHeight;
}
