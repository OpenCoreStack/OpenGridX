/**
 * Vertically scrolls the grid viewport so the center (unpinned) row at `centerIndex`
 * is fully visible below the sticky header / top-pinned rows and above the
 * bottom-pinned rows. `cumulativeHeights` is the unpinned-row layout.
 */
export function scrollRowIntoView(
    viewport: HTMLElement,
    centerIndex: number,
    cumulativeHeights: number[],
    pinnedBottomHeight: number,
): void {
    if (centerIndex < 0 || centerIndex >= cumulativeHeights.length) return;
    const virtualContainer = viewport.querySelector<HTMLElement>('.ogx__virtual-container');
    if (!virtualContainer) return;

    const { scrollTop, clientHeight } = viewport;
    // Everything above the center rows is sticky, so it covers exactly this many
    // pixels at the top of the viewport at any scroll position.
    const stickyTop = virtualContainer.getBoundingClientRect().top - viewport.getBoundingClientRect().top + scrollTop;
    const rowTop = stickyTop + (centerIndex === 0 ? 0 : cumulativeHeights[centerIndex - 1]);
    const rowBottom = stickyTop + cumulativeHeights[centerIndex];

    if (rowTop < scrollTop + stickyTop) {
        viewport.scrollTop = Math.max(0, rowTop - stickyTop);
    } else if (rowBottom > scrollTop + clientHeight - pinnedBottomHeight) {
        viewport.scrollTop = rowBottom - clientHeight + pinnedBottomHeight;
    }
}
