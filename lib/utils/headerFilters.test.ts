import { describe, it, expect } from 'vitest';
import type { GridColDef, GridFilterModel } from '../types';
import {
    buildHeaderFilterItem,
    convertHeaderFilterValue,
    getHeaderFilterDefaultOperator,
    getHeaderFilterItemId,
    getHeaderFilterOperators,
    getHeaderFilterState,
    hasHeaderFilter,
    setHeaderFilterItem,
} from './headerFilters';

const own = (field: string, operator: string, value: unknown) => ({ id: getHeaderFilterItemId(field), field, operator, value }) as const;

describe('getHeaderFilterDefaultOperator', () => {
    it.each([
        [undefined, 'contains'],
        ['string', 'contains'],
        ['number', '='],
        ['date', 'is'],
        ['boolean', 'is'],
        ['singleSelect', 'is'],
    ] as const)('defaults %s columns to %s', (type, operator) => {
        expect(getHeaderFilterDefaultOperator({ type })).toBe(operator);
    });

    it('takes headerFilterOperator first', () => {
        expect(getHeaderFilterDefaultOperator({ type: 'number', headerFilterOperator: '>=' })).toBe('>=');
    });

    it('offers the type operators, with a starting operator the type does not list first', () => {
        expect(getHeaderFilterOperators({ type: 'number' })).toEqual(['=', '!=', '>', '>=', '<', '<=', 'isEmpty', 'isNotEmpty']);
        expect(getHeaderFilterOperators({ type: 'string', headerFilterOperator: 'isAnyOf' })[0]).toBe('isAnyOf');
    });
});

describe('hasHeaderFilter', () => {
    it('leaves out image, non-filterable, opted-out, system and grouping columns', () => {
        expect(hasHeaderFilter({ field: 'name' })).toBe(true);
        expect(hasHeaderFilter({ field: 'photo', type: 'image' })).toBe(false);
        expect(hasHeaderFilter({ field: 'a', filterable: false })).toBe(false);
        expect(hasHeaderFilter({ field: 'a', headerFilter: false })).toBe(false);
        expect(hasHeaderFilter({ field: '__checkbox_col__' })).toBe(false);
        expect(hasHeaderFilter({ field: '__group__' })).toBe(false);
        expect(hasHeaderFilter({ field: '__spacer_left__', isSpacer: true })).toBe(false);
    });
});

describe('getHeaderFilterState', () => {
    it('is editable with no model or no item for the field', () => {
        expect(getHeaderFilterState(undefined, 'name')).toEqual({ kind: 'editable', item: undefined });
        expect(getHeaderFilterState({ items: [{ field: 'city', operator: 'contains', value: 'x' }] }, 'name'))
            .toEqual({ kind: 'editable', item: undefined });
    });

    it('owns only the root item tagged header:<field>', () => {
        const item = own('name', 'contains', 'an');
        expect(getHeaderFilterState({ items: [item] }, 'name')).toEqual({ kind: 'editable', item });
    });

    it('reads an untagged root item on the field as custom', () => {
        expect(getHeaderFilterState({ items: [{ id: 'name-1', field: 'name', operator: 'contains', value: 'a' }] }, 'name').kind).toBe('custom');
    });

    it('reads a second condition on the field as custom', () => {
        const model: GridFilterModel = { items: [own('age', '>', 1), { field: 'age', operator: '<', value: 9 }] };
        expect(getHeaderFilterState(model, 'age').kind).toBe('custom');
    });

    it('reads an OR root as custom for every column', () => {
        const model: GridFilterModel = { logicOperator: 'or', items: [own('name', 'contains', 'a')] };
        expect(getHeaderFilterState(model, 'name').kind).toBe('custom');
        expect(getHeaderFilterState(model, 'city').kind).toBe('custom');
    });

    it('is editable under an OR root with no items', () => {
        expect(getHeaderFilterState({ logicOperator: 'or', items: [] }, 'name').kind).toBe('editable');
    });

    it('reads a field inside a nested group as custom, and other fields as editable', () => {
        const model: GridFilterModel = {
            items: [{ logicOperator: 'or', items: [{ logicOperator: 'and', items: [{ field: 'city', operator: 'equals', value: 'Oslo' }] }] }],
        };
        expect(getHeaderFilterState(model, 'city').kind).toBe('custom');
        expect(getHeaderFilterState(model, 'name').kind).toBe('editable');
    });
});

describe('setHeaderFilterItem', () => {
    it('adds the owned item at the end, keeping other items, the logic operator and the quick filter', () => {
        const panelItem = { id: 'city-1', field: 'city', operator: 'contains' as const, value: 'o' };
        const model: GridFilterModel = { items: [panelItem], logicOperator: 'and', quickFilterValues: ['x'] };
        const next = setHeaderFilterItem(model, 'name', { field: 'name', operator: 'contains', value: 'an' });
        expect(next).toEqual({ items: [panelItem, own('name', 'contains', 'an')], logicOperator: 'and', quickFilterValues: ['x'] });
        expect(next.items?.[0]).toBe(panelItem);
    });

    it('updates the owned item in place', () => {
        const other = { field: 'city', operator: 'contains' as const, value: 'o' };
        const model: GridFilterModel = { items: [own('name', 'contains', 'a'), other] };
        const next = setHeaderFilterItem(model, 'name', { field: 'name', operator: 'startsWith', value: 'b' });
        expect(next.items).toEqual([own('name', 'startsWith', 'b'), other]);
    });

    it('removes the owned item', () => {
        const other = { field: 'city', operator: 'contains' as const, value: 'o' };
        const next = setHeaderFilterItem({ items: [own('name', 'contains', 'a'), other] }, 'name', null);
        expect(next.items).toEqual([other]);
    });

    it('returns the model unchanged when removing an item that is not there', () => {
        const model: GridFilterModel = { items: [] };
        expect(setHeaderFilterItem(model, 'name', null)).toBe(model);
    });

    it('never rewrites a model the row cannot show', () => {
        const orModel: GridFilterModel = { logicOperator: 'or', items: [own('name', 'contains', 'a')] };
        expect(setHeaderFilterItem(orModel, 'name', null)).toBe(orModel);
        expect(setHeaderFilterItem(orModel, 'city', { field: 'city', operator: 'contains', value: 'x' })).toBe(orModel);
        const panelModel: GridFilterModel = { items: [{ id: 'p', field: 'name', operator: 'equals', value: 'x' }] };
        expect(setHeaderFilterItem(panelModel, 'name', { field: 'name', operator: 'contains', value: 'y' })).toBe(panelModel);
    });

    it('starts an empty OR model as AND', () => {
        const next = setHeaderFilterItem({ logicOperator: 'or', items: [] }, 'name', { field: 'name', operator: 'contains', value: 'a' });
        expect(next).toEqual({ logicOperator: 'and', items: [own('name', 'contains', 'a')] });
    });

    it('tags the item with the owned id whatever id it is given', () => {
        const next = setHeaderFilterItem(undefined, 'name', { id: 'other', field: 'name', operator: 'contains', value: 'a' });
        expect(next.items).toEqual([own('name', 'contains', 'a')]);
    });
});

describe('buildHeaderFilterItem', () => {
    const col: Pick<GridColDef, 'field' | 'type'> = { field: 'qty', type: 'number' };

    it('builds the owned item', () => {
        expect(buildHeaderFilterItem(col, '>', '5')).toEqual(own('qty', '>', '5'));
    });

    it('drops an empty value with the starting operator', () => {
        expect(buildHeaderFilterItem(col, '=', '')).toBeNull();
        expect(buildHeaderFilterItem(col, '=', '  ')).toBeNull();
    });

    it('keeps an empty value with another operator, so the operator stays', () => {
        expect(buildHeaderFilterItem(col, '>', '')).toEqual(own('qty', '>', ''));
    });

    it('stores no value for isEmpty / isNotEmpty', () => {
        expect(buildHeaderFilterItem(col, 'isEmpty', '7')).toEqual(own('qty', 'isEmpty', undefined));
    });
});

describe('convertHeaderFilterValue', () => {
    it('turns values into lists for isAnyOf and back', () => {
        expect(convertHeaderFilterValue('a', 'isAnyOf')).toEqual(['a']);
        expect(convertHeaderFilterValue('', 'isAnyOf')).toEqual([]);
        expect(convertHeaderFilterValue(['a', 'b'], 'is')).toBe('a');
        expect(convertHeaderFilterValue([], 'is')).toBe('');
        expect(convertHeaderFilterValue('x', 'isEmpty')).toBeUndefined();
        expect(convertHeaderFilterValue(undefined, 'contains')).toBe('');
    });
});
