import type { GridAggregationModel, GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';
import { formatAggregationValue } from '../../hooks/features/useAggregation';
import { computeAggregations } from '../aggregation';

/**
 * Helpers shared by every exporter (CSV, HTML .xls, JSON, print, PDF and advanced XLSX), so the
 * formats agree on which columns and rows are exported and how values and aggregates are written.
 */

type SelectedRowIds = readonly (string | number)[] | undefined;

/** Columns that appear in an export: not `exportable: false`, not a spacer, not a system column. */
export function getExportColumns<R extends GridRowModel>(columns: GridColDef<R>[]): GridColDef<R>[] {
    return columns.filter(col =>
        col.exportable !== false &&
        !col.isSpacer &&
        col.field !== '__check__' &&
        col.field !== '__actions__'
    );
}

export function hasSelection(selectedRows: SelectedRowIds): selectedRows is readonly (string | number)[] {
    return !!selectedRows && selectedRows.length > 0;
}

/**
 * The rows whose id is in `selectedRows`, in row order. Linear time: the ids go into a Set once,
 * so "select all" on a large grid does not scan the selection for every row.
 */
export function pickSelectedRows<R extends GridRowModel>(rows: R[], selectedRows: readonly (string | number)[]): R[] {
    const selected = new Set<unknown>(selectedRows);
    return rows.filter(row => selected.has(row.id));
}

/** `selectedRows` when a selection is given, else every row. */
export function rowsForExport<R extends GridRowModel>(rows: R[], selectedRows: SelectedRowIds): R[] {
    return hasSelection(selectedRows) ? pickSelectedRows(rows, selectedRows) : rows;
}

/**
 * Whether an exporter writes the grouped layout. A non-empty `selectedRows` takes precedence over
 * `groupedRows`: the selected rows are exported flat, as `exportToExcelAdvanced` does for
 * `rows: 'selected'` sheets.
 */
export function shouldExportGrouped(groupedRows: GridGroupedExportRow[] | undefined, selectedRows: SelectedRowIds): groupedRows is GridGroupedExportRow[] {
    return !!groupedRows && groupedRows.length > 0 && !hasSelection(selectedRows);
}

/**
 * The totals to write under the exported rows. The caller's `aggregationResult` covers every row it
 * was computed from; when a selection narrowed the export, the totals are recomputed over the
 * exported rows with the grid's own aggregation functions so they match what is in the file.
 */
export function aggregationForExport<R extends GridRowModel>(
    exportedRows: R[],
    selectionApplied: boolean,
    columns: GridColDef<R>[],
    aggregationResult: Record<string, unknown> | null | undefined,
    aggregationModel: GridAggregationModel | null | undefined,
): Record<string, unknown> | null {
    if (!aggregationResult) return null;
    if (!selectionApplied || !aggregationModel || Object.keys(aggregationModel).length === 0) return aggregationResult;
    const lookup = new Map<string, GridColDef<R>>(columns.map(col => [col.field, col]));
    return computeAggregations(exportedRows, aggregationModel, lookup, 'export');
}

/** The cell's raw value: `row[field]`, then the column's `valueGetter`. */
export function getRawExportValue<R extends GridRowModel>(row: R, col: GridColDef<R>): unknown {
    const value: unknown = (row as GridRowModel)[col.field];
    return col.valueGetter ? col.valueGetter({ row, field: col.field, value }) : value;
}

/**
 * The cell's display text, matching the grid (`Cell.tsx`): `valueFormatter` runs whenever it is set,
 * including for null/undefined, so placeholder text such as "Unassigned" is exported. A formatter
 * that throws for a missing value exports an empty cell, as before; any other throw propagates.
 */
export function formatExportValue<R extends GridRowModel>(row: R, col: GridColDef<R>, value: unknown): string {
    if (!col.valueFormatter) return value == null ? '' : String(value);
    if (value == null) {
        try {
            return String(col.valueFormatter({ value, row, field: col.field }) ?? '');
        } catch {
            return '';
        }
    }
    return String(col.valueFormatter({ value, row, field: col.field }) ?? '');
}

const COUNT_FUNCTIONS = new Set(['count', 'unique']);

/** Whether an aggregation result is a count of values rather than a value of the column's kind. */
export function isCountAggregation(fnName: string | undefined): boolean {
    return fnName !== undefined && COUNT_FUNCTIONS.has(fnName);
}

/**
 * The aggregation result in the column's own terms. `lib/utils/aggregation` reduces dates to epoch
 * milliseconds, so `min` / `max` on a date column are turned back into a Date.
 */
export function normalizeAggregateValue<R extends GridRowModel>(col: GridColDef<R>, fnName: string | undefined, value: unknown): unknown {
    if (col.type === 'date' && (fnName === 'min' || fnName === 'max') && typeof value === 'number' && Number.isFinite(value)) {
        return new Date(value);
    }
    return value;
}

/**
 * Text for an aggregate cell, shared by the text exporters.
 * - `count` / `unique` are plain counts, formatted as the grid footer does; the column's
 *   `valueFormatter` is not applied (a count of a currency column is not an amount).
 * - `sum`, `avg`, `min`, `max` go through the column's `valueFormatter`, whose `row` is the record
 *   of aggregated values (as in the grid's group rows). A formatter that throws falls back to the
 *   footer formatting instead of aborting the export.
 */
export function formatExportAggregate<R extends GridRowModel>(
    col: GridColDef<R>,
    fnName: string | undefined,
    value: unknown,
    aggregates: Record<string, unknown>,
): string {
    if (value == null) return '';
    if (isCountAggregation(fnName)) return formatAggregationValue(value, fnName ?? '');
    const normalized = normalizeAggregateValue(col, fnName, value);
    if (col.valueFormatter) {
        try {
            return String(col.valueFormatter({ value: normalized, row: aggregates as R, field: col.field }) ?? '');
        } catch {
            // fall through to the footer formatting
        }
    }
    if (normalized instanceof Date) return Number.isNaN(normalized.getTime()) ? '' : normalized.toLocaleDateString();
    return formatAggregationValue(normalized, fnName ?? '');
}

/**
 * Text for the first cell of a subtotal / total row. The label is written there, and when the first
 * column carries its own aggregate the value is kept next to it instead of being overwritten.
 */
export function summaryLabelText(label: string, firstColumnValue: string): string {
    return firstColumnValue ? `${label}: ${firstColumnValue}` : label;
}

/** Only the aggregates of exported columns, so `exportable: false` fields do not leak. */
export function pickExportedAggregates<R extends GridRowModel>(
    aggregates: Record<string, unknown>,
    exportColumns: GridColDef<R>[],
): Record<string, unknown> {
    const picked: Record<string, unknown> = {};
    exportColumns.forEach(col => {
        if (Object.prototype.hasOwnProperty.call(aggregates, col.field)) picked[col.field] = aggregates[col.field];
    });
    return picked;
}

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
// Optional sign, then only digits, separators and whitespace (\s includes NBSP and U+202F):
// such text cannot reference cells or call functions.
const PLAIN_NUMBER = /^[-+]?[\d.,\s]*\d[\d.,\s]*%?$/;

/**
 * Neutralise spreadsheet formula injection (CSV injection). Text that starts with `=`, `+`, `-`,
 * `@`, tab or CR is prefixed with `'` so spreadsheet apps treat it as text. Plain signed numbers
 * ("-12.50") and text formatted from a number, boolean or Date (`fromNonText`) are left alone.
 */
export function neutralizeFormula(text: string, fromNonText = false): string {
    if (fromNonText || !FORMULA_TRIGGER.test(text) || PLAIN_NUMBER.test(text)) return text;
    return `'${text}`;
}

/** Whether a raw value is a number, bigint, boolean or Date, whose formatted text is not user-typed. */
export function isNonTextValue(value: unknown): boolean {
    return typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean' || value instanceof Date;
}

export function escapeHTML(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const INVALID_SHEET_CHARS = /[\\/?*:[\]]/g;
const MAX_SHEET_NAME = 31;

/**
 * A sheet name Excel accepts: the characters `\ / ? * : [ ]` become `-`, leading and trailing
 * apostrophes are dropped, the name is cut to 31 characters, and a name already in `used`
 * (case-insensitive, plus Excel's reserved "History") gets a " (2)", " (3)"… suffix. The chosen
 * name is added to `used`.
 */
export function sanitizeSheetName(name: string | undefined, used: Set<string> = new Set()): string {
    let base = String(name ?? '').replace(INVALID_SHEET_CHARS, '-').trim().replace(/^'+|'+$/g, '').trim();
    if (!base) base = 'Sheet';
    base = base.slice(0, MAX_SHEET_NAME).trim();
    const taken = (candidate: string) => used.has(candidate.toLowerCase()) || candidate.toLowerCase() === 'history';
    let result = base;
    for (let n = 2; taken(result); n++) {
        const suffix = ` (${n})`;
        result = `${base.slice(0, MAX_SHEET_NAME - suffix.length).trim()}${suffix}`;
    }
    used.add(result.toLowerCase());
    return result;
}
