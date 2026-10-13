import type { GridColDef, GridFilterOperator } from '../../types';

/**
 * Helpers shared by the filter panel and the header filter row: both edit a filter item's value
 * through a text box or a select of the column's `valueOptions`.
 */

/** One entry of a `valueOptions` select. `key` is the option's index, used as the `<option>` value. */
export interface FilterValueOption {
    key: string;
    value: unknown;
    label: string;
}

export function getFilterValueOptions(col: Pick<GridColDef, 'valueOptions'>): FilterValueOption[] {
    return (col.valueOptions ?? []).map((option, index) => (
        option !== null && typeof option === 'object'
            ? { key: String(index), value: option.value, label: option.label }
            : { key: String(index), value: option, label: String(option) }
    ));
}

/**
 * Whether a filter value selects this option: the same value, or the same text ignoring case (a
 * value typed or restored from a URL is a string). A list matches by its first entry.
 */
export function matchesFilterValueOption(option: FilterValueOption, value: unknown): boolean {
    const single = Array.isArray(value) ? value[0] : value;
    if (Object.is(option.value, single)) return true;
    return single != null && String(option.value).toLowerCase() === String(single).toLowerCase();
}

/** The item value for typed text. `isAnyOf` takes a comma-separated list. */
export function filterValueFromInputText(text: string, operator: GridFilterOperator): unknown {
    if (operator === 'isAnyOf') return text.split(',').map(part => part.trim()).filter(part => part !== '');
    return text;
}

/** Equal filter values: the same value, dates at the same time, or lists of equal values. */
export function isSameFilterValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => isSameFilterValue(v, b[i]));
    return false;
}
