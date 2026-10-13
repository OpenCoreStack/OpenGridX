import type { GridRowId } from '../types';

// Select-all at 1M rows built the same 1M-id set three or four times: once to compute the next
// model, once more from that model array (`new Set(rowSelectionModel)`), and a full count to decide
// "all selected". These weak caches let the set built for a model be reused when that very array
// comes back as `rowSelectionModel`, and remember that it contains a given list of ids. Keyed by
// identity, so they never apply to an array or set the grid did not build; entries are collected
// with their keys.

const setByModel = new WeakMap<readonly GridRowId[], ReadonlySet<GridRowId>>();
const containsAll = new WeakMap<ReadonlySet<GridRowId>, readonly GridRowId[]>();

/** The ids of `model` as a set: the one the grid built for this array, or a new one. */
export function selectionSetOf(model: readonly GridRowId[]): ReadonlySet<GridRowId> {
    let set = setByModel.get(model);
    if (!set) {
        set = new Set(model);
        setByModel.set(model, set);
    }
    return set;
}

/** Records that `set` holds exactly the ids of `model` (the grid built both). */
export function rememberSelectionSet(model: readonly GridRowId[], set: ReadonlySet<GridRowId>): void {
    setByModel.set(model, set);
}

/** Records that `set` contains every id of `ids` (it was built by selecting them). */
export function markContainsAll(set: ReadonlySet<GridRowId>, ids: readonly GridRowId[]): void {
    containsAll.set(set, ids);
}

/** Whether `set` is known to contain every id of this very `ids` array. False when unknown. */
export function isKnownToContainAll(set: ReadonlySet<GridRowId>, ids: readonly GridRowId[]): boolean {
    return containsAll.get(set) === ids;
}
