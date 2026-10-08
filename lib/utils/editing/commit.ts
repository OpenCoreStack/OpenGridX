import type { GridColDef, GridRowId, GridRowModel } from '../../types';

/**
 * The steps every committed edit shares: a single-cell edit (`useGridEditing`) and a batch edit
 * (`useGridBatchEdit`: paste, range clear, undo, redo) build the row the same way and report errors
 * the same way.
 */

/** A misuse of the editing contract (e.g. processRowUpdate returned nothing), as opposed to a consumer rejection. */
export class OpenGridXEditError extends Error {}

/** One committed cell change: the value before and the value stored after (both read through `getCellValue`). */
export interface GridCellChange {
    id: GridRowId;
    field: string;
    before: unknown;
    after: unknown;
}

/** Cell values compare equal: dates by time, anything else with `Object.is`. */
export function isSameValue(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return Object.is(a, b);
}

export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function';
}

/**
 * Sends an edit failure to `onProcessRowUpdateError`. Without one, a misuse of the contract is logged
 * in development; a consumer rejection is the consumer's own and stays silent.
 */
export function reportEditError(error: unknown, onError: ((error: unknown) => void) | undefined): void {
    if (onError) {
        onError(error);
    } else if (process.env.NODE_ENV !== 'production' && error instanceof OpenGridXEditError) {
        console.error(error.message);
    }
}

/** The error for a `processRowUpdate` that resolved to something other than a row object. */
export function invalidProcessedRowError(processed: unknown, outcome: string): OpenGridXEditError {
    return new OpenGridXEditError(
        `[OpenGridX] processRowUpdate must return the updated row object (or a Promise of it); ` +
        `it returned ${processed === null ? 'null' : typeof processed}. ${outcome}`
    );
}

/** The row with one cell changed: through the column's `valueSetter`, else `row[field] = value`. */
export function buildEditedRow<R extends GridRowModel>(
    row: R,
    cell: { field: string; value: unknown },
    colDef: GridColDef<R> | undefined,
    warnedFields: Set<string>
): R {
    if (colDef?.valueSetter) {
        return colDef.valueSetter({ value: cell.value, row, field: cell.field });
    }
    if (colDef?.valueGetter && process.env.NODE_ENV !== 'production' && !warnedFields.has(cell.field)) {
        warnedFields.add(cell.field);
        console.warn(
            `[OpenGridX] Column "${cell.field}" is editable and has a valueGetter but no valueSetter. ` +
            `The edited value was written to row["${cell.field}"], which the valueGetter may ignore, so the cell ` +
            'can keep showing the old value. Add a valueSetter that maps the value back onto the row.'
        );
    }
    return { ...row, [cell.field]: cell.value };
}
