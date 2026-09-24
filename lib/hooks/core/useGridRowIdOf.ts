import { useCallback, useLayoutEffect, useRef } from 'react';
import type { GridRowId, GridRowModel } from '../../types';

/** The default `getRowId`: the row's own `id` field. */
export function getDefaultRowId(row: GridRowModel): GridRowId {
    return row.id;
}

export interface UseGridRowIdOfResult {
    /**
     * The key of any row the grid renders: stored rows resolve through the store, and grid-made
     * rows (group rows, skeletons, generated tree parents) through their own `id`.
     */
    getRowIdOf: (row: GridRowModel) => GridRowId;
    /**
     * Same resolver with a stable identity, for event handlers only (it reads the last committed
     * store), so column definitions are not rebuilt on every rows change.
     */
    getRowIdOfInEvents: (row: GridRowModel) => GridRowId;
}

/** Row-id resolvers over the row store's `idByRow` map. */
export function useGridRowIdOf(idByRow: Map<GridRowModel, GridRowId>): UseGridRowIdOfResult {
    const getRowIdOf = useCallback(
        (row: GridRowModel): GridRowId => idByRow.get(row) ?? row.id,
        [idByRow]
    );
    const getRowIdOfRef = useRef(getRowIdOf);
    useLayoutEffect(() => { getRowIdOfRef.current = getRowIdOf; });
    const getRowIdOfInEvents = useCallback((row: GridRowModel) => getRowIdOfRef.current(row), []);
    return { getRowIdOf, getRowIdOfInEvents };
}
