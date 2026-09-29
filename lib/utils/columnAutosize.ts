import { DEFAULT_MIN_COLUMN_WIDTH } from '../components/ColumnResizeHandle/clampResizeWidth';

/** The grid root an element belongs to, so a nested grid (in a detail panel) is never measured. */
const ROOT_SELECTOR = '.ogx';

/**
 * The width `content` needs to show without clipping, plus the horizontal padding and borders of
 * `cell`. `content` is laid out at `max-content` for the read and restored right after, so the
 * reading works for a column that is too wide (shrinks) as well as one that is too narrow (grows).
 */
function measureCell(cell: HTMLElement, content: HTMLElement): number {
    const saved = content.style.cssText;
    content.style.width = 'max-content';
    content.style.minWidth = '0';
    content.style.maxWidth = 'none';
    content.style.flex = 'none';
    const contentWidth = content.getBoundingClientRect().width;
    content.style.cssText = saved;

    const style = getComputedStyle(cell);
    const extra = [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    return contentWidth + extra;
}

/**
 * The width a column needs to fit its header and the cells rendered right now (the virtualization
 * window, pinned rows included), measured in the DOM. Cells spanning several columns and cells
 * hidden by a row span are skipped. Returns null when nothing of the column is rendered.
 */
export function measureColumnContentWidth(root: HTMLElement, field: string): number | null {
    const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(field) : field.replace(/"/g, '\\"');
    const ownedByRoot = (el: Element) => el.closest(ROOT_SELECTOR) === root;
    let width: number | null = null;
    const take = (w: number) => { width = width === null ? w : Math.max(width, w); };

    root.querySelectorAll<HTMLElement>(`[role="columnheader"][data-field="${escaped}"]`).forEach(header => {
        if (!ownedByRoot(header)) return;
        const content = header.querySelector<HTMLElement>('.ogx__header-cell-content');
        if (content) take(measureCell(header, content));
    });

    root.querySelectorAll<HTMLElement>(`[role="gridcell"][data-field="${escaped}"]`).forEach(cell => {
        if (!ownedByRoot(cell) || cell.hasAttribute('aria-colspan')) return;
        const content = cell.querySelector<HTMLElement>(':scope > .ogx__cell-content');
        if (content) take(measureCell(cell, content));
    });

    return width === null ? null : Math.ceil(width);
}

/** Clamps an autosized width to the column's `minWidth` (default 50px) and `maxWidth`. */
export function clampAutosizeWidth(width: number, minWidth?: number, maxWidth?: number): number {
    const min = minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
    return Math.max(min, Math.min(maxWidth ?? Infinity, width));
}
