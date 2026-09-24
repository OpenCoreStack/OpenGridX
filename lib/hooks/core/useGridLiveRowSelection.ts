import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { GridRowId, GridRowMeta, GridRowModel } from '../../types';

export interface UseGridLiveRowSelectionParams {
    /** The selection model (controlled prop or internal state). */
    selectedRowIds: Set<GridRowId>;
    /** The row store: ids of the rows the grid holds. */
    rowsLookup: ReadonlyMap<GridRowId, GridRowModel>;
    /** Hierarchy rows the grid made (group rows, generated tree parents); their ids are kept. */
    rowMetaMap: ReadonlyMap<GridRowId, GridRowMeta>;
    /**
     * Prune only when the grid holds every row (client rows, not a server page or a pivot of
     * them); otherwise ids of rows that are not loaded are kept.
     */
    enabled: boolean;
    /** Applies a model: internal state when uncontrolled, plus onRowSelectionModelChange. */
    onSelectionModelChange: (model: GridRowId[]) => void;
}

// Content key of a set of ids; the type is part of it, so 1 and '1' stay apart.
const idsKey = (ids: Iterable<GridRowId>): string =>
    JSON.stringify(Array.from(ids, id => (typeof id === 'number' ? ['n', id] : ['s', id])));

/**
 * The selection the grid acts on: the model without the ids of rows that no longer exist.
 * Everything that reads or builds on the selection (row highlighting, the header checkbox,
 * `getSelectedRows`, the next model a click produces) uses this set. When rows are removed,
 * the pruned model is reported once through `onSelectionModelChange`, so an uncontrolled
 * selection forgets the ids (a row that comes back is not selected again) and a controlled
 * consumer can follow. A pruned model is reported once per distinct (model, pruned model) pair:
 * a controlled parent that keeps passing the stale ids (a fresh inline array each render, or its
 * own state that re-adds them) is not notified again and cannot loop, and StrictMode's re-run of
 * the effect does not report twice.
 */
export function useGridLiveRowSelection(params: UseGridLiveRowSelectionParams): Set<GridRowId> {
    const { selectedRowIds, rowsLookup, rowMetaMap, enabled, onSelectionModelChange } = params;

    const liveRowIds = useMemo(() => {
        if (!enabled || selectedRowIds.size === 0) return selectedRowIds;
        let stale = false;
        const live = new Set<GridRowId>();
        for (const id of selectedRowIds) {
            if (rowsLookup.has(id) || rowMetaMap.has(id)) live.add(id);
            else stale = true;
        }
        return stale ? live : selectedRowIds;
    }, [enabled, selectedRowIds, rowsLookup, rowMetaMap]);

    // Latest callback, so an inline onRowSelectionModelChange does not report again on every render.
    const onChangeRef = useRef(onSelectionModelChange);
    useLayoutEffect(() => { onChangeRef.current = onSelectionModelChange; });

    // Survives StrictMode's effect re-run and re-renders; cleared once nothing is stale.
    const reportedRef = useRef<string | null>(null);
    useEffect(() => {
        if (liveRowIds === selectedRowIds) {
            reportedRef.current = null;
            return;
        }
        const key = `${idsKey(selectedRowIds)}|${idsKey(liveRowIds)}`;
        if (reportedRef.current === key) return;
        reportedRef.current = key;
        onChangeRef.current(Array.from(liveRowIds));
    }, [liveRowIds, selectedRowIds]);

    return liveRowIds;
}
