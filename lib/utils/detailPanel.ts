import type { GridDetailPanelHeight, GridRowId, GridRowMeta } from '../types';

/** Panel height used when `getDetailPanelHeight` is omitted or returns something unusable. */
export const DEFAULT_DETAIL_PANEL_HEIGHT = 200;

/**
 * Normalises a `getDetailPanelHeight` result. The layout and the rendered panel both go through
 * this, so they always agree: `0` is a 0px panel, `'auto'` fits the content, and a missing,
 * negative or non-numeric value is the 200px default.
 */
export function resolveDetailPanelHeight(height: GridDetailPanelHeight | string | null | undefined): number | 'auto' {
    if (height === 'auto') return 'auto';
    const value = typeof height === 'string' ? Number.parseFloat(height) : height;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    return DEFAULT_DETAIL_PANEL_HEIGHT;
}

/**
 * The height the layout reserves for an expanded panel: its fixed height, or for an `'auto'`
 * panel the height it was measured at (the default until it has rendered once).
 */
export function getDetailPanelLayoutHeight(
    height: GridDetailPanelHeight | string | null | undefined,
    measuredHeight: number | undefined,
): number {
    const resolved = resolveDetailPanelHeight(height);
    if (resolved === 'auto') return measuredHeight ?? DEFAULT_DETAIL_PANEL_HEIGHT;
    return resolved;
}

/**
 * The expanded detail-panel ids that can actually show a panel: synthetic hierarchy rows
 * (row-grouping groups, generated tree parents) have no detail panel, so an id of one in a
 * controlled `detailPanelExpandedRowIds` is ignored. Returns the same set when nothing is dropped.
 */
export function getDetailPanelRowIds(
    expandedRowIds: Set<GridRowId>,
    rowMetaMap: ReadonlyMap<GridRowId, GridRowMeta>,
): Set<GridRowId> {
    if (rowMetaMap.size === 0 || expandedRowIds.size === 0) return expandedRowIds;
    let dropped = false;
    const ids = new Set<GridRowId>();
    for (const id of expandedRowIds) {
        if (rowMetaMap.get(id)?.isGroupRow) dropped = true;
        else ids.add(id);
    }
    return dropped ? ids : expandedRowIds;
}
