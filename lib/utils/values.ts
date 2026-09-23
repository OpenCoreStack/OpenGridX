import type { GridColDef, GridRowModel } from '../types';

/**
 * The value a cell holds before formatting: the column's `valueGetter` result when it has one,
 * otherwise `row[field]`. Filtering, sorting and the quick filter all read cells through this,
 * so a computed column behaves the same as a stored one.
 */
export function getCellValue(row: GridRowModel, field: string, colDef?: GridColDef): unknown {
    const raw = row[field];
    return colDef?.valueGetter ? colDef.valueGetter({ row, field, value: raw }) : raw;
}

/**
 * Coerce a cell or filter value to a number. Returns null for null/undefined, blank strings,
 * NaN and anything that does not parse, so an empty cell is never read as 0.
 */
export function toNumber(value: unknown): number | null {
    if (value == null) return null;
    if (typeof value === 'number') return Number.isNaN(value) ? null : value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        const n = Number(trimmed);
        return Number.isNaN(n) ? null : n;
    }
    if (typeof value === 'boolean') return null;
    if (value instanceof Date) {
        const t = value.getTime();
        return Number.isNaN(t) ? null : t;
    }
    if (typeof value === 'bigint') return Number(value);
    return null;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a Date object, epoch milliseconds or a date string. A plain `YYYY-MM-DD` string is read
 * as a local calendar date: `new Date('2024-01-10')` is UTC midnight, which is the previous day
 * west of UTC. Returns null for empty, unparsable or invalid values.
 */
export function toDate(value: unknown): Date | null {
    if (value == null) return null;
    let date: Date;
    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'number') {
        date = new Date(value);
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;
        const match = DATE_ONLY.exec(trimmed);
        if (match) {
            const year = Number(match[1]);
            const month = Number(match[2]) - 1;
            const day = Number(match[3]);
            date = new Date(year, month, day);
            // Reject roll-overs such as 2024-02-31.
            if (date.getMonth() !== month || date.getDate() !== day) return null;
        } else {
            date = new Date(trimmed);
        }
    } else {
        return null;
    }
    return Number.isNaN(date.getTime()) ? null : date;
}

/** A sortable integer for the local calendar day of a date (YYYYMMDD), or null when unparsable. */
export function toLocalDayKey(value: unknown): number | null {
    const date = toDate(value);
    if (!date) return null;
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** The local calendar day of a date as `YYYY-MM-DD`, or '' when unparsable. */
export function toLocalDateString(value: unknown): string {
    const date = toDate(value);
    if (!date) return '';
    const y = String(date.getFullYear()).padStart(4, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

type ValueOption = string | number | { value: unknown; label: string };

/** The label of the `valueOptions` entry for `value`, or undefined when no option matches. */
export function getValueOptionLabel(options: readonly ValueOption[] | undefined, value: unknown): string | undefined {
    if (!options) return undefined;
    const optionValue = (option: ValueOption): unknown => (typeof option === 'object' ? option.value : option);
    const optionLabel = (option: ValueOption): string => (typeof option === 'object' ? option.label : String(option));
    // Exact match first; then by text, so a numeric option still labels a value read back as a string.
    const match = options.find(option => Object.is(optionValue(option), value))
        ?? options.find(option => String(optionValue(option)) === String(value));
    return match === undefined ? undefined : optionLabel(match);
}

/**
 * Default display text for a cell whose column has no `valueFormatter`, by column `type`:
 * - `date`: the local calendar date (`toLocaleDateString()`) of a Date, timestamp or date string;
 *   text that does not parse as a date is shown as is.
 * - `boolean`: `Yes` / `No` for `true` / `false`.
 * - `singleSelect`: the matching `valueOptions` label; a value with no option is shown as is.
 * - anything else (and `image`, whose cell renders an image of this URL): `String(value)`.
 * null and undefined are ''. The grid cells and the text exporters (CSV, print, PDF) use this, so
 * a file shows what the grid shows.
 */
export function formatValueByType(value: unknown, colDef: Pick<GridColDef, 'type' | 'valueOptions'> | undefined): string {
    if (value === null || value === undefined) return '';
    switch (colDef?.type) {
        case 'date': {
            const date = toDate(value);
            return date ? date.toLocaleDateString() : String(value);
        }
        case 'boolean':
            if (value === true) return 'Yes';
            if (value === false) return 'No';
            return String(value);
        case 'singleSelect':
            return getValueOptionLabel(colDef.valueOptions, value) ?? String(value);
        default:
            return String(value);
    }
}
