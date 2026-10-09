import { describe, it, expect } from 'vitest';
import { buildAiChips, effectiveState, pickAllowedParts, removeAiChip, snapshotParts } from './aiAssistant';
import type { GridAiState } from '../types';

const label = (field: string) => field.toUpperCase();

describe('aiAssistant helpers', () => {
    it('keeps the allowed parts and reports the others', () => {
        expect(pickAllowedParts({ sortModel: [], rowGroupingModel: ['a'] }, ['sort'])).toEqual({
            state: { sortModel: [] },
            errors: [{ path: 'rowGroupingModel', message: 'Part not allowed' }],
        });
    });

    it('snapshots the touched parts and merges visibility over them', () => {
        const current: GridAiState = { sortModel: [{ field: 'a', sort: 'asc' }], columnVisibilityModel: { b: false }, filterModel: { items: [] } };
        const applied: GridAiState = { sortModel: [], columnVisibilityModel: { c: false } };
        const previous = snapshotParts(applied, current);
        expect(previous).toEqual({ sortModel: [{ field: 'a', sort: 'asc' }], columnVisibilityModel: { b: false } });
        expect(effectiveState(applied, previous)).toEqual({ sortModel: [], columnVisibilityModel: { b: false, c: false } });
        // A part removed from the reply gets its previous value back.
        expect(effectiveState({ columnVisibilityModel: { c: false } }, previous)).toEqual({ sortModel: [{ field: 'a', sort: 'asc' }], columnVisibilityModel: { b: false, c: false } });
    });

    it('builds one chip per change', () => {
        const chips = buildAiChips({
            filterModel: { items: [{ field: 'a', operator: '>', value: 1 }, { logicOperator: 'or', items: [{ field: 'b', operator: 'isAnyOf', value: ['x', 'y'] }, { field: 'b', operator: 'isEmpty' }] }], quickFilterValues: ['acme'] },
            sortModel: [{ field: 'a', sort: 'desc' }],
            rowGroupingModel: [],
            aggregationModel: { a: 'sum' },
            pivotModel: { rowFields: ['b'], columnFields: [], valueFields: [{ field: 'a', aggFn: 'sum' }] },
            columnVisibilityModel: { b: false, c: true },
        }, label);
        expect(chips.map((c) => `${c.id} | ${c.label}`)).toEqual([
            'filter:0 | A > 1',
            'filter:1 | (B isAnyOf x, y or B isEmpty)',
            'filter:quick | Search: acme',
            'sort:0 | Sort: A, descending',
            'grouping:clear | No grouping',
            'aggregation:a | Sum: A',
            'pivot | Pivot: B, A',
            'columnVisibility:b | Hide: B',
            'columnVisibility:c | Show: C',
        ]);
    });

    it('removes one change; a part left empty is dropped', () => {
        const applied: GridAiState = {
            filterModel: { items: [{ field: 'a', operator: '>', value: 1 }], quickFilterValues: ['x'] },
            sortModel: [{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'asc' }],
            rowGroupingModel: [],
            aggregationModel: { a: 'sum' },
            columnVisibilityModel: { b: false },
            pivotModel: { rowFields: [], columnFields: [], valueFields: [] },
        };
        expect(removeAiChip(applied, 'filter:0').filterModel).toEqual({ items: [], quickFilterValues: ['x'] });
        expect(removeAiChip(removeAiChip(applied, 'filter:0'), 'filter:quick').filterModel).toBeUndefined();
        expect(removeAiChip(applied, 'sort:0').sortModel).toEqual([{ field: 'b', sort: 'asc' }]);
        expect('rowGroupingModel' in removeAiChip(applied, 'grouping:clear')).toBe(false);
        expect('aggregationModel' in removeAiChip(applied, 'aggregation:a')).toBe(false);
        expect('columnVisibilityModel' in removeAiChip(applied, 'columnVisibility:b')).toBe(false);
        expect('pivotModel' in removeAiChip(applied, 'pivot')).toBe(false);
        expect(removeAiChip(applied, 'unknown:1')).toEqual(applied);
    });
});
