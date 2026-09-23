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
