import type { GridColDef, GridFilterGroup, GridFilterItem, GridFilterModel, GridFilterOperator } from '../types';
import { NO_VALUE_OPERATORS, getOperatorsForType, isEmptyFilterValue } from './filtering';
import { isSystemField } from './focus';

/** Prefix of the ids of the filter items the header filter row owns: `header:<field>`. */
export const HEADER_FILTER_ID_PREFIX = 'header:';

/** Default height of the header filter row, in pixels. */
export const DEFAULT_HEADER_FILTER_HEIGHT = 40;

/** Debounce for typed values, the same as the filter panel's. */
export const HEADER_FILTER_DEBOUNCE_MS = 300;

/** The synthetic row-grouping column; it has no header filter. */
const GROUPING_FIELD = '__group__';

type FilterEntry = GridFilterItem | GridFilterGroup;

const NO_ENTRIES: FilterEntry[] = [];

export function getHeaderFilterItemId(field: string): string {
    return `${HEADER_FILTER_ID_PREFIX}${field}`;
}

function isFilterGroup(entry: FilterEntry): entry is GridFilterGroup {
    return 'items' in entry && Array.isArray(entry.items);
}

/** Whether a column gets a control in the header filter row. */
export function hasHeaderFilter(col: Pick<GridColDef, 'field' | 'type' | 'filterable' | 'headerFilter' | 'isSpacer'>): boolean {
    if (col.isSpacer || isSystemField(col.field) || col.field === GROUPING_FIELD) return false;
    return col.headerFilter !== false && col.filterable !== false && col.type !== 'image';
}

/** The operator a new header filter starts with: `headerFilterOperator`, else the default for the type. */
export function getHeaderFilterDefaultOperator(col: Pick<GridColDef, 'type' | 'headerFilterOperator'>): GridFilterOperator {
    if (col.headerFilterOperator) return col.headerFilterOperator;
    switch (col.type) {
        case 'number': return '=';
        case 'date':
        case 'boolean':
        case 'singleSelect':
            return 'is';
        default:
            return 'contains';
    }
}

/** The operators the operator menu offers: the type's operators, with the starting one first if the type does not list it. */
export function getHeaderFilterOperators(col: Pick<GridColDef, 'type' | 'headerFilterOperator'>): GridFilterOperator[] {
    const operators = getOperatorsForType(col.type);
    const start = getHeaderFilterDefaultOperator(col);
    return operators.includes(start) ? operators : [start, ...operators];
}

/**
 * What a header filter cell shows:
 * - `editable`: the cell owns `item` (the root-level item `header:<field>`), or there is none yet;
 * - `custom`: the model holds a condition on the field the row cannot show (root `logicOperator`
 *   `'or'`, another root item on the field, the field inside a nested group). The cell is read-only.
 */
export type GridHeaderFilterState =
    | { kind: 'editable'; item: GridFilterItem | undefined }
    | { kind: 'custom' };

function groupMentionsField(group: GridFilterGroup, field: string): boolean {
    return group.items.some(entry => (isFilterGroup(entry) ? groupMentionsField(entry, field) : entry.field === field));
}

/** Whether a model's root combines its items with OR (with something to combine). */
export function isOrRootModel(model: GridFilterModel | null | undefined): boolean {
    return (model?.logicOperator ?? 'and') === 'or' && (model?.items?.length ?? 0) > 0;
}

export function getHeaderFilterState(model: GridFilterModel | null | undefined, field: string): GridHeaderFilterState {
    const items = model?.items ?? NO_ENTRIES;
    if (isOrRootModel(model)) return { kind: 'custom' };
    const ownId = getHeaderFilterItemId(field);
    let own: GridFilterItem | undefined;
    for (const entry of items) {
        if (isFilterGroup(entry)) {
            if (groupMentionsField(entry, field)) return { kind: 'custom' };
            continue;
        }
        if (entry.field !== field) continue;
        if (entry.id !== ownId || own) return { kind: 'custom' };
        own = entry;
    }
    return { kind: 'editable', item: own };
}

/**
 * The model with the header filter item for `field` replaced by `item` (added at the end when
 * absent, removed when `item` is null). Every other entry, the logic operator and the quick filter
 * pass through untouched. Returns `model` itself when the cell cannot own the field's filter.
 */
export function setHeaderFilterItem(model: GridFilterModel | null | undefined, field: string, item: GridFilterItem | null): GridFilterModel {
    const base: GridFilterModel = model ?? { items: [] };
    if (getHeaderFilterState(base, field).kind !== 'editable') return base;
    const ownId = getHeaderFilterItemId(field);
    const items = base.items ?? NO_ENTRIES;
    const index = items.findIndex(entry => !isFilterGroup(entry) && entry.id === ownId);
    const nextItem: GridFilterItem | null = item ? { ...item, id: ownId, field } : null;
    let next: FilterEntry[];
    if (index === -1) {
        if (!nextItem) return base;
        // With no items the logic operator means nothing yet; a leftover 'or' would make the
        // next column's cell read the model as custom, so it starts as 'and'.
        if (items.length === 0 && base.logicOperator === 'or') return { ...base, logicOperator: 'and', items: [nextItem] };
        next = [...items, nextItem];
    } else if (nextItem) {
        next = items.map((entry, i) => (i === index ? nextItem : entry));
    } else {
        next = items.filter((_, i) => i !== index);
    }
    return { ...base, items: next };
}

/**
 * The item a header filter cell stores for an operator and value, or null when it should hold no
 * item: an empty value with the starting operator. An empty value with another operator keeps the
 * item, so the chosen operator stays while the value is retyped (an empty value never filters).
 */
export function buildHeaderFilterItem(
    col: Pick<GridColDef, 'field' | 'type' | 'headerFilterOperator'>,
    operator: GridFilterOperator,
    value: unknown,
): GridFilterItem | null {
    const noValue = NO_VALUE_OPERATORS.has(operator);
    if (!noValue && isEmptyFilterValue(value) && operator === getHeaderFilterDefaultOperator(col)) return null;
    return { id: getHeaderFilterItemId(col.field), field: col.field, operator, value: noValue ? undefined : value };
}

/** Carries a value over to a newly picked operator: lists for isAnyOf, scalars for the rest. */
export function convertHeaderFilterValue(value: unknown, operator: GridFilterOperator): unknown {
    if (NO_VALUE_OPERATORS.has(operator)) return undefined;
    if (operator === 'isAnyOf') {
        if (value == null || value === '') return [];
        return Array.isArray(value) ? value : [value];
    }
    if (Array.isArray(value)) return value.length > 0 ? value[0] : '';
    return value ?? '';
}

/** Short label shown on the operator button. */
export const HEADER_FILTER_OPERATOR_SYMBOLS: Record<GridFilterOperator, string> = {
    contains: '∋',
    equals: '=',
    startsWith: 'a…',
    endsWith: '…a',
    isEmpty: '∅',
    isNotEmpty: '!∅',
    isAnyOf: '∈',
    '=': '=',
    '!=': '≠',
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    is: '=',
    not: '≠',
    after: '>',
    onOrAfter: '≥',
    before: '<',
    onOrBefore: '≤',
};

/** Readable operator names for the operator menu and labels. */
export const HEADER_FILTER_OPERATOR_LABELS: Record<GridFilterOperator, string> = {
    contains: 'Contains',
    equals: 'Equals',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    isEmpty: 'Is empty',
    isNotEmpty: 'Is not empty',
    isAnyOf: 'Is any of',
    '=': 'Equals',
    '!=': 'Does not equal',
    '>': 'Greater than',
    '>=': 'Greater than or equal',
    '<': 'Less than',
    '<=': 'Less than or equal',
    is: 'Is',
    not: 'Is not',
    after: 'After',
    onOrAfter: 'On or after',
    before: 'Before',
    onOrBefore: 'On or before',
};
