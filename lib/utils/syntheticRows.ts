import type { GridRowId, GridRowMeta } from '../types';
import { PIVOT_GRAND_TOTAL_ID } from './pivot';

/**
 * True for a row the grid made rather than one of the consumer's rows: a row-grouping header or
 * subtotal, an auto-created tree-data parent (`rowMeta.isGroupRow`), or the pivot Grand Total.
 * Such rows are never selected (checkbox, click, keyboard, `apiRef`) and never start or carry a
 * row span.
 */
export function isSyntheticRowId(id: GridRowId, rowMetaMap?: ReadonlyMap<GridRowId, GridRowMeta>): boolean {
    return id === PIVOT_GRAND_TOTAL_ID || rowMetaMap?.get(id)?.isGroupRow === true;
}
