import { useCallback, useMemo } from 'react';
import type { GridRowId } from '../../types';

// ── Pure selection transitions (shared by the UI handlers and the imperative API) ──────────

/** Selects or deselects `ids`. With `single`, selecting keeps only the last id. */
export function nextSelectionForRows(
    current: ReadonlySet<GridRowId>,
    ids: readonly GridRowId[],
    isSelected: boolean,
    single: boolean
): GridRowId[] {
    if (isSelected && single) {
        return ids.length > 0 ? [ids[ids.length - 1]] : Array.from(current);
    }
    const next = new Set(current);
    ids.forEach(id => (isSelected ? next.add(id) : next.delete(id)));
    return Array.from(next);
}

/** A row click toggles the row; with `single` it replaces the selection instead of adding to it. */
export function nextSelectionForClick(current: ReadonlySet<GridRowId>, id: GridRowId, single: boolean): GridRowId[] {
    if (single) return current.has(id) ? [] : [id];
    return nextSelectionForRows(current, [id], !current.has(id), false);
}

/** Whether `next` holds exactly the ids of `current` (order ignored). */
export function isSameSelection(current: ReadonlySet<GridRowId>, next: readonly GridRowId[]): boolean {
    return next.length === current.size && next.every(id => current.has(id));
}

export interface UseGridRowSelectionParams {
    selectedRowIds: Set<GridRowId>;
    /** Applies a new model: internal state when uncontrolled, plus onRowSelectionModelChange. */
    onSelectionModelChange: (model: GridRowId[]) => void;
    disableMultipleRowSelection: boolean;
    /**
     * The rows the header checkbox acts on and reflects: the data rows that pass the filter
     * (including pinned rows, excluding synthetic group rows).
     */
    selectableRowIds: readonly GridRowId[];
}

export interface UseGridRowSelectionReturn {
    /** Checkbox / Space-key toggle of one row. */
    toggleRow: (id: GridRowId, isSelected: boolean) => void;
    /** Row-click toggle. */
    clickRow: (id: GridRowId) => void;
    /** Header checkbox; undefined when disableMultipleRowSelection is set (no select-all). */
    selectAll: ((isSelected: boolean) => void) | undefined;
    allSelected: boolean;
    someSelected: boolean;
}

export function useGridRowSelection(params: UseGridRowSelectionParams): UseGridRowSelectionReturn {
    const { selectedRowIds, onSelectionModelChange, disableMultipleRowSelection, selectableRowIds } = params;

    const commit = useCallback((next: GridRowId[]) => {
        if (isSameSelection(selectedRowIds, next)) return;
        onSelectionModelChange(next);
    }, [selectedRowIds, onSelectionModelChange]);

    const toggleRow = useCallback((id: GridRowId, isSelected: boolean) => {
        commit(nextSelectionForRows(selectedRowIds, [id], isSelected, disableMultipleRowSelection));
    }, [commit, selectedRowIds, disableMultipleRowSelection]);

    const clickRow = useCallback((id: GridRowId) => {
        commit(nextSelectionForClick(selectedRowIds, id, disableMultipleRowSelection));
    }, [commit, selectedRowIds, disableMultipleRowSelection]);

    // Select-all adds the selectable rows to the selection and deselect-all removes them, so
    // rows hidden by the filter are never selected by it (and keep their own state).
    const selectAllHandler = useCallback((isSelected: boolean) => {
        commit(nextSelectionForRows(selectedRowIds, selectableRowIds, isSelected, false));
    }, [commit, selectedRowIds, selectableRowIds]);

    const { allSelected, someSelected } = useMemo(() => {
        let selectedCount = 0;
        for (const id of selectableRowIds) if (selectedRowIds.has(id)) selectedCount++;
        const all = selectableRowIds.length > 0 && selectedCount === selectableRowIds.length;
        return { allSelected: all, someSelected: !all && selectedCount > 0 };
    }, [selectableRowIds, selectedRowIds]);

    return {
        toggleRow,
        clickRow,
        selectAll: disableMultipleRowSelection ? undefined : selectAllHandler,
        allSelected,
        someSelected,
    };
}
