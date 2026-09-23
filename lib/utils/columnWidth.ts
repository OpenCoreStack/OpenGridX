import type { GridColDef, GridRowModel } from '../types';

/** Clamps a column width the way CSS applies `min-width` / `max-width` (min-width wins a conflict). */
export function clampColumnWidth(width: number, minWidth?: number, maxWidth?: number): number {
    return Math.max(minWidth ?? 0, Math.min(maxWidth ?? Infinity, width));
}

/**
 * The width a rendered column occupies: the user's resize override, else its width (the
 * layout-resolved pixel width for grid columns), clamped to `minWidth` / `maxWidth` exactly as
 * the cell and header CSS clamp it. Non-numeric widths fall back to `fallback`.
 */
export function getRenderedColumnWidth<R extends GridRowModel>(
    col: GridColDef<R>,
    columnWidths: Record<string, number>,
    fallback = 100,
): number {
    if (col.isSpacer) return typeof col.width === 'number' ? col.width : 0;
    const raw = columnWidths[col.field] ?? col.width;
    const width = typeof raw === 'number' && Number.isFinite(raw) ? raw : fallback;
    return clampColumnWidth(width, col.minWidth, col.maxWidth);
}
