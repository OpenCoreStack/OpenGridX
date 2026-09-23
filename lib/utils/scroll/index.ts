/**
 * Height of the sticky block at the bottom of the viewport (bottom-pinned rows, their expanded
 * detail panels and the aggregation footer), measured from the DOM.
 */
function stickyBottomHeight(viewport: HTMLElement): number {
    const block = viewport.querySelector<HTMLElement>('.ogx__sticky-bottom');
    return block ? block.getBoundingClientRect().height : 0;
}

/**
 * Vertically scrolls the grid viewport so the center (unpinned) row at `centerIndex`
 * is fully visible below the sticky header / top-pinned rows and above the sticky
 * bottom block (bottom-pinned rows and aggregation footer). `cumulativeHeights` is the
 * unpinned-row layout; `pinnedBottomHeight` is a lower bound for the bottom block.
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
    const bottomCover = Math.max(pinnedBottomHeight, stickyBottomHeight(viewport));
    const rowTop = stickyTop + (centerIndex === 0 ? 0 : cumulativeHeights[centerIndex - 1]);
    const rowBottom = stickyTop + cumulativeHeights[centerIndex];

    if (rowTop < scrollTop + stickyTop) {
        viewport.scrollTop = Math.max(0, rowTop - stickyTop);
    } else if (rowBottom > scrollTop + clientHeight - bottomCover) {
        viewport.scrollTop = rowBottom - clientHeight + bottomCover;
    }
}

export interface GridColumnScrollMetrics {
    /** Cumulative widths of the unpinned columns (layout). */
    unpinnedAccWidths: number[];
    leftWidth: number;
    rightWidth: number;
    /** Width of all system columns (they precede the data columns). */
    systemColumnsWidth: number;
    /** Width of the system columns that are sticky. */
    pinnedSystemColumnsWidth: number;
}

/**
 * Horizontally scrolls the viewport so the unpinned column at `unpinnedIndex` is fully visible
 * between the sticky left block (pinned system columns + left-pinned columns) and the
 * right-pinned columns.
 */
export function scrollColumnIntoView(viewport: HTMLElement, unpinnedIndex: number, metrics: GridColumnScrollMetrics): void {
    const { unpinnedAccWidths, leftWidth, rightWidth, systemColumnsWidth, pinnedSystemColumnsWidth } = metrics;
    if (unpinnedIndex < 0 || unpinnedIndex >= unpinnedAccWidths.length) return;
    const contentStart = systemColumnsWidth + leftWidth;
    const colLeft = contentStart + (unpinnedIndex > 0 ? unpinnedAccWidths[unpinnedIndex - 1] : 0);
    const colRight = contentStart + unpinnedAccWidths[unpinnedIndex];
    const stickyLeft = pinnedSystemColumnsWidth + leftWidth;
    const { scrollLeft, clientWidth } = viewport;

    if (colLeft < scrollLeft + stickyLeft) {
        viewport.scrollLeft = Math.max(0, colLeft - stickyLeft);
    } else if (colRight > scrollLeft + clientWidth - rightWidth) {
        viewport.scrollLeft = colRight - clientWidth + rightWidth;
    }
}
