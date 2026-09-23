/** The layout's minimum for a column without `minWidth` (see useLayout's flex solver). */
export const DEFAULT_MIN_COLUMN_WIDTH = 50;

/**
 * Clamps a width a resize asks for to the column's `minWidth` / `maxWidth`. Without `minWidth` the
 * floor is 50px, and without `maxWidth` there is no ceiling. A column that already sits outside
 * those bounds (a 30px icon column) is never snapped to them: its own width stays reachable.
 */
export function clampResizeWidth(width: number, startWidth: number, minWidth?: number, maxWidth?: number): number {
    const min = Math.min(minWidth ?? DEFAULT_MIN_COLUMN_WIDTH, startWidth);
    const max = Math.max(maxWidth ?? Infinity, startWidth);
    return Math.max(min, Math.min(max, width));
}
