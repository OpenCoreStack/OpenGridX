import type { GridColDef, GridRowModel } from '../types';

const warnedCallbacks = new Set<string>();

/**
 * Warn once per key (callback kind and column), in development only, that a consumer callback
 * threw and the grid fell back to a default instead of crashing.
 */
export function warnCallbackFailure(key: string, message: string, error: unknown): void {
    if (process.env.NODE_ENV === 'production' || warnedCallbacks.has(key)) return;
    warnedCallbacks.add(key);
    console.warn(`[OpenGridX] ${message}.`, error);
}

/**
 * Call a consumer callback; when it throws, warn once per `key` (dev only) and return `fallback`.
 * Used for callbacks whose failure has an obvious default (a detail-panel height, a group label).
 */
export function callSafely<T>(fn: () => T, fallback: T, key: string, message: string): T {
    try {
        return fn();
    } catch (error) {
        warnCallbackFailure(key, message, error);
        return fallback;
    }
}

type ValueGetterColumn<R extends GridRowModel> = Pick<GridColDef<R>, 'valueGetter'>;

/**
 * Read a cell through the column's `valueGetter` (or `row[field]`), returning a throw as `error`
 * instead of swallowing it. The row renderer uses this to show the error in that one cell.
 */
export function tryGetCellValue<R extends GridRowModel>(
    row: R,
    field: string,
    colDef?: ValueGetterColumn<R>
): { value: unknown; error?: unknown } {
    const raw = row[field];
    if (!colDef?.valueGetter) return { value: raw };
    try {
        return { value: colDef.valueGetter({ row, field, value: raw }) };
    } catch (error) {
        return { value: undefined, error: error ?? new Error('valueGetter failed') };
    }
}

/**
 * The value a cell holds before formatting: the column's `valueGetter` result when it has one,
 * otherwise `row[field]`. Filtering, sorting, the quick filter, aggregation, row grouping, pivot,
 * list view, clipboard and editing all read cells through this, so a computed column behaves the
 * same everywhere. A `valueGetter` that throws reads as `undefined` (with a one-time dev warning
 * per column), so one bad record cannot take the whole grid down.
 */
export function getCellValue<R extends GridRowModel>(row: R, field: string, colDef?: ValueGetterColumn<R>): unknown {
    const { value, error } = tryGetCellValue(row, field, colDef);
    if (error !== undefined) {
        warnCallbackFailure(`valueGetter:${field}`, `valueGetter for column "${field}" threw; the value is read as undefined`, error);
    }
    return value;
}

/**
 * The column's `valueFormatter` text for `value`, or undefined when the column has no formatter
 * or the formatter throws (with a one-time dev warning per column).
 */
export function getFormattedValue<R extends GridRowModel>(
    row: R,
    field: string,
    value: unknown,
    colDef?: Pick<GridColDef<R>, 'valueFormatter'>
): string | undefined {
    const formatter = colDef?.valueFormatter;
    if (!formatter) return undefined;
    return callSafely(
        () => formatter({ value, row, field }),
        undefined,
        `valueFormatter:${field}`,
        `valueFormatter for column "${field}" threw; the value is shown unformatted`,
    );
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

let localDateFormat: Intl.DateTimeFormat | null = null;

/**
 * `date.toLocaleDateString()` (the default locale's numeric date), with the formatter created
 * once: building a new one per call is several times slower on large grids.
 */
export function formatLocalDate(date: Date): string {
    localDateFormat ??= new Intl.DateTimeFormat();
    return localDateFormat.format(date);
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
            return date ? formatLocalDate(date) : String(value);
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
