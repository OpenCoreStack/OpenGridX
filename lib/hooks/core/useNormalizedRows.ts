import { useState } from 'react';
import type { GridRowId, GridRowModel } from '../../types';

interface NormalizedRowsState<R extends GridRowModel> {
    source: R[];
    getRowId: (row: R) => GridRowId;
    result: R[];
}

/**
 * Normalises `rows` so that `row.id === getRowId(row)`. When `previous` is the result for the same
 * source array, rows whose id is unchanged keep their previous object, and if nothing changed the
 * previous array itself is returned.
 */
function normalizeRows<R extends GridRowModel>(rows: R[], getRowId: (row: R) => GridRowId, previous: R[] | null): R[] {
    let changed = previous === null || previous.length !== rows.length;
    const next = rows.map((row, i) => {
        const id = getRowId(row);
        const prev = previous?.[i];
        if (prev !== undefined && prev.id === id) return prev;
        changed = true;
        return id === row.id ? row : ({ ...row, id } as R);
    });
    return changed || previous === null ? next : previous;
}

/**
 * Rows keyed for the internal store (`id === getRowId(row)`).
 *
 * The result keeps its identity until the `rows` array or the computed ids change. An inline
 * `getRowId={r => r.id}` is a new function on every parent render; if that alone produced a new
 * array, the store would be reset to the prop rows and every edit applied since would be reverted.
 */
export function useNormalizedRows<R extends GridRowModel>(rows: R[], getRowId: (row: R) => GridRowId): R[] {
    const [state, setState] = useState<NormalizedRowsState<R>>(() => ({
        source: rows,
        getRowId,
        result: normalizeRows(rows, getRowId, null),
    }));

    if (state.source === rows && state.getRowId === getRowId) return state.result;

    const result = normalizeRows(rows, getRowId, state.source === rows ? state.result : null);
    if (result !== state.result) {
        // Storing information from the previous render: React re-runs this render with the new state.
        setState({ source: rows, getRowId, result });
    }
    return result;
}
