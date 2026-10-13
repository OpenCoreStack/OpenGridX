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

// Live-selection check: a set already checked against the row store's current maps, or built from
// such a set by adding ids of rendered rows (the grid's own toggles, row clicks and select-all), holds
// only ids of existing rows. Rows are removed only by replacing the rows, which gives the store new
// maps, so the check is skipped while the maps are the same objects.
const validatedAgainst = new WeakMap<ReadonlySet<GridRowId>, { rows: object; meta: object }>();
const derivedFrom = new WeakMap<ReadonlySet<GridRowId>, ReadonlySet<GridRowId>>();

/** Records that every id of `set` named an existing row in these maps. */
export function markValidated(set: ReadonlySet<GridRowId>, rows: object, meta: object): void {
    validatedAgainst.set(set, { rows, meta });
}

/**
 * Records that `set` was built from `parent` by adding ids of rendered rows only (never ids from the
 * API, which may name anything), so it is live wherever `parent` is.
 */
export function markDerivedFromLive(set: ReadonlySet<GridRowId>, parent: ReadonlySet<GridRowId>): void {
    if (set !== parent) derivedFrom.set(set, parent);
}

/** Whether `set` (or the set it was derived from) was checked against these very maps. */
export function isKnownLive(set: ReadonlySet<GridRowId>, rows: object, meta: object): boolean {
    for (let s: ReadonlySet<GridRowId> | undefined = set, depth = 0; s && depth < 4; s = derivedFrom.get(s), depth++) {
        const v = validatedAgainst.get(s);
        if (v && v.rows === rows && v.meta === meta) return true;
    }
    return false;
}
