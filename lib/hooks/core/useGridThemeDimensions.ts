import { useContext } from 'react';
import { GridThemeContext } from '../../theme/gridThemeContext';
import type { GridDensity } from './useGridControlledState';

const DEFAULT_ROW_HEIGHT = 52;
const DEFAULT_HEADER_HEIGHT = 56;
const COMPACT_ROW_HEIGHT = 32;
const COMFORTABLE_ROW_HEIGHT = 72;

/** A theme height in pixels (`'36px'` or `'36'`); anything else (rem, calc, …) is ignored. */
export function parseThemePixels(value: string | undefined): number | undefined {
    if (value === undefined) return undefined;
    const match = /^\s*(\d+(?:\.\d+)?)\s*(px)?\s*$/.exec(value);
    if (!match) return undefined;
    const px = Number(match[1]);
    return px > 0 ? px : undefined;
}

export interface UseGridThemeDimensionsParams {
    rowHeight?: number;
    headerHeight?: number;
    density: GridDensity;
}

/**
 * The row and header heights the grid lays out and renders with. The grid drives virtualization
 * from these numbers, so a DataGridThemeProvider's `grid.rowHeight*` / `grid.headerHeight` are read
 * here rather than left to CSS (which the grid's own inline heights would override). Precedence:
 * the `rowHeight` / `headerHeight` props, then the theme, then the defaults. `density="compact"` /
 * `"comfortable"` use the theme's compact / comfortable height, else 32 / 72.
 */
export function useGridThemeDimensions(params: UseGridThemeDimensionsParams): { rowHeight: number; headerHeight: number } {
    const { rowHeight, headerHeight, density } = params;
    const grid = useContext(GridThemeContext)?.grid;

    let effectiveRowHeight: number;
    if (density === 'compact') {
        effectiveRowHeight = parseThemePixels(grid?.rowHeightCompact) ?? COMPACT_ROW_HEIGHT;
    } else if (density === 'comfortable') {
        effectiveRowHeight = parseThemePixels(grid?.rowHeightComfortable) ?? COMFORTABLE_ROW_HEIGHT;
    } else {
        effectiveRowHeight = rowHeight ?? parseThemePixels(grid?.rowHeightStandard) ?? DEFAULT_ROW_HEIGHT;
    }

    return {
        rowHeight: effectiveRowHeight,
        headerHeight: headerHeight ?? parseThemePixels(grid?.headerHeight) ?? DEFAULT_HEADER_HEIGHT,
    };
}
