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
