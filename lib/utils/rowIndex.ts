import type { GridRowId } from '../types';

/** The ids of a row array in order, and each id's first index. */
export interface GridRowIndex {
    rowIds: GridRowId[];
    rowIndexById: Map<GridRowId, number>;
}

interface CacheEntry {
    rows: readonly object[];
    value: GridRowIndex;
}

// Last result per id resolver and view. The grid's resolver keeps its identity while the row store
// keeps its id maps (cell edits do), so the entry lives exactly as long as it can be reused.
const cache = new WeakMap<(row: never) => GridRowId, Map<string, CacheEntry>>();

function build<R extends object>(rows: readonly R[], getRowId: (row: R) => GridRowId): GridRowIndex {
    const rowIds = new Array<GridRowId>(rows.length);
    const rowIndexById = new Map<GridRowId, number>();
    for (let index = 0; index < rows.length; index++) {
        const id = getRowId(rows[index]);
        rowIds[index] = id;
        if (!rowIndexById.has(id)) rowIndexById.set(id, index);
    }
    return { rowIds, rowIndexById };
}

/**
 * `rows.map(getRowId)` plus an id → first index map, reusing the previous result for the same
 * resolver and `view` when the ids are unchanged position by position. A cell edit replaces row
 * objects but never moves or re-keys rows, so after an edit only the replaced positions are
 * resolved (a reference comparison per row instead of a map lookup per row, ~20× cheaper at 1M
 * rows), and callers memoized on the returned object do not recompute. Treat the result as
 * read-only: it may be shared.
 */
export function getRowIndex<R extends object>(
    rows: readonly R[],
    getRowId: (row: R) => GridRowId,
    view: string,
): GridRowIndex {
    let byView = cache.get(getRowId);
    const previous = byView?.get(view);
    if (previous && previous.rows.length === rows.length) {
        const prevRows = previous.rows as readonly R[];
        const prevIds = previous.value.rowIds;
        let same = true;
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if (row !== prevRows[index] && getRowId(row) !== prevIds[index]) {
                same = false;
                break;
            }
        }
        if (same) {
            previous.rows = rows;
            return previous.value;
        }
    }
    const value = build(rows, getRowId);
    if (!byView) {
        byView = new Map();
        cache.set(getRowId, byView);
    }
    byView.set(view, { rows, value });
    return value;
}
