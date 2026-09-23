import type { GridDetailPanelHeight } from '../types';

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
