import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { GridBatchEditResult, GridColDef, GridEditSkipReason, GridRowId, GridRowModel } from '../../types';
import { attempt } from '../../utils/attempt';
import { getCellValue } from '../../utils/values';
import {
    buildEditedRow,
    invalidProcessedRowError,
    isPromiseLike,
    isSameValue,
    reportEditError,
} from '../../utils/editing/commit';
import type { GridCellChange } from '../../utils/editing/commit';

/** What made a commit: history records `edit`, `paste`, `clear` and `fill`; `undo` / `redo` replay it. */
export type GridEditSource = 'edit' | 'paste' | 'clear' | 'fill' | 'undo' | 'redo';

/** One cell to write in a batch edit. */
export interface GridBatchCellEdit {
    id: GridRowId;
    field: string;
    value: unknown;
    /**
     * Undo/redo: the value the cell must still hold. When it holds something else the cell is
     * skipped with reason `'changed'` (values are compared, not row objects).
     */
    expect?: { value: unknown };
}

/** A batch edit's result, plus the cell changes that were stored (what history records). */
export interface GridBatchEditOutcome {
    result: GridBatchEditResult;
    committed: GridCellChange[];
}

export interface UseGridBatchEditParams<R extends GridRowModel> {
    /** The rendered row store (`state.rows.idRowsLookup`). */
    rowsLookup: ReadonlyMap<GridRowId, R>;
    columns: GridColDef<R>[];
    processRowUpdate?: (newRow: R, oldRow: R) => R | Promise<R>;
    onProcessRowUpdateError?: (error: unknown) => void;
    /** Stores rows in one update (`replaceRows` of the row store). */
    replaceRows: (rows: ReadonlyMap<GridRowId, R>) => void;
    /** Receives the stored changes of every commit that is not an undo or redo (history). */
    onCommitted?: (changes: GridCellChange[], source: GridEditSource) => void;
}

export interface UseGridBatchEditReturn<R extends GridRowModel> {
    /**
     * Writes cells through `valueSetter` → `processRowUpdate` (once per row, rows in parallel) →
     * the store (one update for every row that succeeded). A row that throws or rejects is reported
     * to `onProcessRowUpdateError` and does not stop the others. Cells whose value does not change
     * are left alone. Resolves when every row has settled.
     */
    applyEdits: (edits: readonly GridBatchCellEdit[], source: GridEditSource) => Promise<GridBatchEditOutcome>;
    /** The latest row under `id`, including rows stored but not rendered yet. */
    getRow: (id: GridRowId) => R | undefined;
    /** Stores one committed row (a single-cell edit), so `getRow` sees it before the next render. */
    storeRow: (id: GridRowId, row: R) => void;
}

interface RowCell<R extends GridRowModel> {
    field: string;
    value: unknown;
    colDef: GridColDef<R> | undefined;
    order: number;
}

interface RowGroup<R extends GridRowModel> {
    id: GridRowId;
    row: R;
    cells: RowCell<R>[];
}

type Settled = { id: GridRowId; ok: true; processed: unknown } | { id: GridRowId; ok: false; error: unknown };

/**
 * Batch edits: several cells committed together through the single-edit pipeline (paste, range clear,
 * undo, redo). One `processRowUpdate` per row, one store update for the batch, failures isolated per
 * row and reported through the same path as single edits. The returned functions are stable.
 */
export function useGridBatchEdit<R extends GridRowModel>(params: UseGridBatchEditParams<R>): UseGridBatchEditReturn<R> {
    const latestRef = useRef(params);
    // Rows stored since the last render. The rendered lookup catches up on the next render, when
    // this is emptied; until then an undo right after a paste still reads the pasted rows.
    const overlayRef = useRef(new Map<GridRowId, R>());
    const warnedFieldsRef = useRef(new Set<string>());
    useLayoutEffect(() => {
        latestRef.current = params;
        overlayRef.current.clear();
    });

    const getRow = useCallback((id: GridRowId): R | undefined => {
        const pending = overlayRef.current.get(id);
        return pending === undefined ? latestRef.current.rowsLookup.get(id) : pending;
    }, []);

    const store = useCallback((rows: Map<GridRowId, R>) => {
        if (rows.size === 0) return;
        rows.forEach((row, id) => { overlayRef.current.set(id, row); });
        latestRef.current.replaceRows(rows);
    }, []);

    const storeRow = useCallback((id: GridRowId, row: R) => {
        store(new Map([[id, row]]));
    }, [store]);

    const applyEdits = useCallback((edits: readonly GridBatchCellEdit[], source: GridEditSource): Promise<GridBatchEditOutcome> => {
        const { columns, processRowUpdate } = latestRef.current;
        const report = (error: unknown) => reportEditError(error, latestRef.current.onProcessRowUpdateError);
        const columnOrder = new Map<string, number>();
        const columnByField = new Map<string, GridColDef<R>>();
        columns.forEach((col, index) => {
            columnOrder.set(col.field, index);
            columnByField.set(col.field, col);
        });

        const skipped: { id: GridRowId; field: string; reason: GridEditSkipReason }[] = [];
        const groups = new Map<GridRowId, RowGroup<R>>();
        for (const edit of edits) {
            const row = getRow(edit.id);
            if (row === undefined) {
                skipped.push({ id: edit.id, field: edit.field, reason: 'missing' });
                continue;
            }
            const colDef = columnByField.get(edit.field);
            if (edit.expect && !isSameValue(getCellValue(row, edit.field, colDef), edit.expect.value)) {
                skipped.push({ id: edit.id, field: edit.field, reason: 'changed' });
                continue;
            }
            let group = groups.get(edit.id);
            if (!group) {
                group = { id: edit.id, row, cells: [] };
                groups.set(edit.id, group);
            }
            const order = columnOrder.get(edit.field) ?? Number.MAX_SAFE_INTEGER;
            const existing = group.cells.findIndex(cell => cell.field === edit.field);
            const cell = { field: edit.field, value: edit.value, colDef, order };
            // The same cell twice: the last value wins.
            if (existing === -1) group.cells.push(cell);
            else group.cells[existing] = cell;
        }

        const settled: Settled[] = [];
        const pending: Promise<Settled>[] = [];
        const warned = warnedFieldsRef.current;
        groups.forEach(group => {
            const { id, row } = group;
            // Cells that already hold the value are not written; a row with none left is left alone.
            const cells = group.cells
                .filter(cell => !isSameValue(getCellValue(row, cell.field, cell.colDef), cell.value))
                .sort((a, b) => a.order - b.order);
            group.cells = cells;
            if (cells.length === 0) return;
            const outcome = attempt<unknown>(() => {
                let newRow = row;
                for (const cell of cells) newRow = buildEditedRow(newRow, cell, cell.colDef, warned);
                return processRowUpdate ? processRowUpdate(newRow, row) : newRow;
            });
            if (!outcome.ok) {
                settled.push({ id, ok: false, error: outcome.error });
                return;
            }
            const value = outcome.value;
            if (isPromiseLike(value)) {
                pending.push(Promise.resolve(value).then(
                    (processed): Settled => ({ id, ok: true, processed }),
                    (error: unknown): Settled => ({ id, ok: false, error }),
                ));
            } else {
                settled.push({ id, ok: true, processed: value });
            }
        });

        const finish = (all: Settled[]): GridBatchEditOutcome => {
            const byId = new Map<GridRowId, Settled>();
            all.forEach(entry => { byId.set(entry.id, entry); });
            const updated: GridRowId[] = [];
            const failed: { id: GridRowId; error: unknown }[] = [];
            const committed: GridCellChange[] = [];
            const stored = new Map<GridRowId, R>();
            groups.forEach(group => {
                const entry = byId.get(group.id);
                if (!entry) return;
                if (!entry.ok) {
                    failed.push({ id: group.id, error: entry.error });
                    report(entry.error);
                    return;
                }
                const processed = entry.processed;
                if (typeof processed !== 'object' || processed === null) {
                    const error = invalidProcessedRowError(processed, 'The row was not saved.');
                    failed.push({ id: group.id, error });
                    report(error);
                    return;
                }
                const storedRow = processed as R;
                stored.set(group.id, storedRow);
                updated.push(group.id);
                for (const cell of group.cells) {
                    const before = getCellValue(group.row, cell.field, cell.colDef);
                    const after = getCellValue(storedRow, cell.field, cell.colDef);
                    if (!isSameValue(before, after)) committed.push({ id: group.id, field: cell.field, before, after });
                }
            });
            store(stored);
            if (committed.length > 0 && source !== 'undo' && source !== 'redo') {
                latestRef.current.onCommitted?.(committed, source);
            }
            return { result: { updated, failed, skipped }, committed };
        };

        if (pending.length === 0) return Promise.resolve(finish(settled));
        return Promise.all(pending).then(results => finish([...settled, ...results]));
    }, [getRow, store]);

    return useMemo(() => ({ applyEdits, getRow, storeRow }), [applyEdits, getRow, storeRow]);
}
