import { describe, it, expect } from 'vitest';
import { isKnownToContainAll, markContainsAll, rememberSelectionSet, selectionSetOf } from './selectionSets';
import { nextSelectionForRows } from '../hooks/core/useGridRowSelection';

describe('selection sets', () => {
    it('reuses the set built for a model array, and only for that array', () => {
        const model = [1, 2];
        const set = new Set(model);
        rememberSelectionSet(model, set);
        expect(selectionSetOf(model)).toBe(set);
        const copy = [1, 2];
        expect(selectionSetOf(copy)).not.toBe(set);
        expect([...selectionSetOf(copy)]).toEqual([1, 2]);
        expect(selectionSetOf(copy)).toBe(selectionSetOf(copy));
    });

    it('knows a set contains all ids only for the exact ids array it was marked with', () => {
        const ids = [1, 2, 3];
        const set = new Set(ids);
        markContainsAll(set, ids);
        expect(isKnownToContainAll(set, ids)).toBe(true);
        expect(isKnownToContainAll(set, [1, 2, 3])).toBe(false);
        expect(isKnownToContainAll(new Set(ids), ids)).toBe(false);
    });

    it('nextSelectionForRows hands its set over to the model and marks a select-all', () => {
        const selectable = [1, 2, 3];
        const model = nextSelectionForRows(new Set<number>([9]), selectable, true, false);
        expect(model).toEqual([9, 1, 2, 3]);
        const set = selectionSetOf(model);
        expect([...set]).toEqual([9, 1, 2, 3]);
        expect(isKnownToContainAll(set, selectable)).toBe(true);
        const cleared = nextSelectionForRows(set, selectable, false, false);
        expect(cleared).toEqual([9]);
        expect(isKnownToContainAll(selectionSetOf(cleared), selectable)).toBe(false);
    });
});

describe('live-selection markers', () => {
    it('trusts a set checked against the same maps, and sets derived from it', async () => {
        const { markValidated, markDerivedFromLive, isKnownLive } = await import('./selectionSets');
        const rows = new Map(); const meta = new Map();
        const parent = new Set([1]);
        markValidated(parent, rows, meta);
        const child = new Set([1, 2]);
        markDerivedFromLive(child, parent);
        expect(isKnownLive(parent, rows, meta)).toBe(true);
        expect(isKnownLive(child, rows, meta)).toBe(true);
    });

    it('does not trust it once the rows were replaced (new maps) or for unrelated sets', async () => {
        const { markValidated, markDerivedFromLive, isKnownLive } = await import('./selectionSets');
        const rows = new Map(); const meta = new Map();
        const parent = new Set([1]);
        markValidated(parent, rows, meta);
        const child = new Set([1, 2]);
        markDerivedFromLive(child, parent);
        expect(isKnownLive(child, new Map(), meta)).toBe(false);
        expect(isKnownLive(child, rows, new Map())).toBe(false);
        expect(isKnownLive(new Set([1]), rows, meta)).toBe(false);
    });
});

describe('deselect-all after select-all', () => {
    it('returns an empty model without deleting id by id, and is exact otherwise', () => {
        const selectable = [1, 2, 3];
        const all = selectionSetOf(nextSelectionForRows(new Set<number>(), selectable, true, false));
        expect(nextSelectionForRows(all, selectable, false, false)).toEqual([]);
        // A set holding more than the selectable ids keeps the rest.
        const more = selectionSetOf(nextSelectionForRows(new Set<number>([9]), selectable, true, false));
        expect(nextSelectionForRows(more, selectable, false, false)).toEqual([9]);
    });
});
