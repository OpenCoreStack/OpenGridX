import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import type { GridColDef, GridRowId, GridRowModel } from '../../types';
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

export interface GridEditingState {
    editingCell: {
        id: GridRowId;
        field: string;
        value: unknown;
        originalValue: unknown;
    } | null;
}

export interface UseGridEditingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    /** Column definitions; used to find the edited column's `valueSetter`. */
    columns?: GridColDef<R>[];
    processRowUpdate?: (newRow: R, oldRow: R) => R | Promise<R>;
    onProcessRowUpdateError?: (error: unknown) => void;
    /**
     * Receives the committed row and the id of the row that was edited. Match on `id` (the key the
     * grid resolved with getRowId), not on a field of the returned row.
     */
    onRowChange?: (newRow: R, id: GridRowId) => void;
    /**
     * Receives the cell change once `processRowUpdate` succeeded and the row was stored (undo/redo
     * history): the value before and the stored value, both read through `getCellValue`. Not called
     * when the stored value equals the previous one.
     */
    onCommitted?: (changes: GridCellChange[]) => void;
}

export interface StopCellEditParams {
    /** Discard the pending value instead of committing it. */
    cancel?: boolean;
    /**
     * Only act if this cell is the one being edited. Editors pass their own cell so that a late
     * blur or unmount cannot end another cell's edit.
     */
    id?: GridRowId;
    field?: string;
}

type EditingCellState = GridEditingState['editingCell'];
type EditingCell = NonNullable<EditingCellState>;

interface PendingCommit {
    value: unknown;
    promise: Promise<void>;
}

const RESOLVED: Promise<void> = Promise.resolve();

/**
 * Cell edit sessions and their commits.
 *
 * - One commit per edit: a stop while a commit is in flight (Enter then blur, Tab then the blur that
 *   moving focus causes) shares that commit instead of calling `processRowUpdate` again. A stop that
 *   arrives after the value changed again commits the newer value once the first commit settles.
 * - A commit that settles late only closes the editor if that same session is still open with the
 *   committed value; it never closes another cell's edit or drops text typed in the meantime. Its
 *   row is always applied: `processRowUpdate` has already run, and may already have persisted it.
 * - Starting an edit on another cell commits the current one first, so an edit whose editor is gone
 *   (for example scrolled out of the render window) is never silently dropped.
 * - The returned functions keep their identity for the lifetime of the grid.
 */
export function useGridEditing<R extends GridRowModel>(params: UseGridEditingParams<R>) {
    const [editingCell, setEditingCellState] = useState<EditingCellState>(null);
    const editingCellRef = useRef<EditingCellState>(null);
    // Id of the current edit session; bumped whenever a cell enters edit mode.
    const sessionRef = useRef(0);
    const pendingRef = useRef(new Map<number, PendingCommit>());
    const warnedFieldsRef = useRef(new Set<string>());
    const mountedRef = useRef(false);

    // Latest props, read when an edit is committed so the callbacks below can stay stable.
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const setEditingCell = useCallback((next: EditingCellState) => {
        editingCellRef.current = next;
        setEditingCellState(next);
    }, []);

    // The in-flight branch below re-runs the commit through this ref: a callback that refers to
    // itself is read before its declaration, which React Compiler rejects.
    const commitRef = useRef<((token: number, cell: EditingCell) => Promise<void>) | null>(null);

    const commit = useCallback((token: number, cell: EditingCell): Promise<void> => {
        const inFlight = pendingRef.current.get(token);
        if (inFlight) {
            if (isSameValue(inFlight.value, cell.value)) return inFlight.promise;
            // The value changed while a commit was in flight: commit the newer value once it settles.
            return inFlight.promise.then(() => {
                const now = editingCellRef.current;
                if (sessionRef.current !== token || !now || isSameValue(now.value, inFlight.value)) return;
                return commitRef.current?.(token, now);
            });
        }

        const isCurrent = () => sessionRef.current === token && editingCellRef.current !== null;

        if (isSameValue(cell.value, cell.originalValue)) {
            if (isCurrent()) setEditingCell(null);
            return RESOLVED;
        }

        const { rows, getRowId, columns, processRowUpdate } = latestRef.current;
        const existingRow = rows.find(r => getRowId(r) === cell.id);
        if (!existingRow) {
            if (isCurrent()) setEditingCell(null);
            return RESOLVED;
        }

        const report = (error: unknown) => reportEditError(error, latestRef.current.onProcessRowUpdateError);
        const colDef = columns?.find(c => c.field === cell.field);

        const apply = (processed: unknown) => {
            if (typeof processed !== 'object' || processed === null) {
                report(invalidProcessedRowError(processed, 'The edit was not saved and the editor stays open.'));
                return;
            }
            latestRef.current.onRowChange?.(processed as R, cell.id);
            const { onCommitted } = latestRef.current;
            if (onCommitted) {
                const before = getCellValue(existingRow, cell.field, colDef);
                const after = getCellValue(processed as R, cell.field, colDef);
                if (!isSameValue(before, after)) onCommitted([{ id: cell.id, field: cell.field, before, after }]);
            }
            const now = editingCellRef.current;
            if (sessionRef.current !== token || !now) return;
            if (isSameValue(now.value, cell.value)) {
                setEditingCell(null);
            } else {
                // Newer text was typed while this commit was in flight: keep editing it.
                setEditingCell({ ...now, originalValue: cell.value });
            }
        };

        // Register the commit before calling out, so a re-entrant stop joins it.
        let settle!: () => void;
        let fail!: (error: unknown) => void;
        const promise = new Promise<void>((resolve, reject) => { settle = resolve; fail = reject; });
        const entry: PendingCommit = { value: cell.value, promise };
        pendingRef.current.set(token, entry);
        const finish = () => {
            if (pendingRef.current.get(token) === entry) pendingRef.current.delete(token);
        };

        const outcome = attempt<unknown>(() => {
            const newRow = buildEditedRow(existingRow, cell, colDef, warnedFieldsRef.current);
            return processRowUpdate ? processRowUpdate(newRow, existingRow) : newRow;
        });
        if (!outcome.ok) {
            // Consumer code (valueSetter / processRowUpdate) threw: report it, keep the editor open.
            finish();
            report(outcome.error);
            settle();
            return promise;
        }
        const result = outcome.value;

        const complete = (processed: unknown) => {
            finish();
            try {
                apply(processed);
                settle();
            } catch (error) {
                // A failure while the grid stores the row is a grid error, not a processRowUpdate one.
                fail(error);
            }
        };

        if (isPromiseLike(result)) {
            Promise.resolve(result).then(complete, (error: unknown) => {
                finish();
                report(error);
                settle();
            });
        } else {
            complete(result);
        }
        return promise;
    }, [setEditingCell]);
    useLayoutEffect(() => {
        commitRef.current = commit;
    }, [commit]);

    const startCellEdit = useCallback((editParams: { id: GridRowId; field: string; value: unknown }) => {
        const current = editingCellRef.current;
        if (current) {
            if (current.id === editParams.id && current.field === editParams.field) return;
            // Commit the edit in progress before switching cells.
            void commit(sessionRef.current, current);
        }
        sessionRef.current += 1;
        setEditingCell({
            id: editParams.id,
            field: editParams.field,
            value: editParams.value,
            originalValue: editParams.value
        });
    }, [commit, setEditingCell]);

    const stopCellEdit = useCallback((stopParams?: StopCellEditParams): Promise<void> => {
        const cell = editingCellRef.current;
        if (!cell || !mountedRef.current) return RESOLVED;
        if (stopParams?.id !== undefined && stopParams.id !== cell.id) return RESOLVED;
        if (stopParams?.field !== undefined && stopParams.field !== cell.field) return RESOLVED;

        if (stopParams?.cancel) {
            setEditingCell(null);
            return RESOLVED;
        }
        return commit(sessionRef.current, cell);
    }, [commit, setEditingCell]);

    const setEditCellValue = useCallback((editParams: { id: GridRowId; field: string; value: unknown }) => {
        const current = editingCellRef.current;
        if (!current || current.id !== editParams.id || current.field !== editParams.field) return;
        setEditingCell({ ...current, value: editParams.value });
    }, [setEditingCell]);

    return useMemo(() => ({
        editingCell,
        startCellEdit,
        stopCellEdit,
        setEditCellValue
    }), [editingCell, startCellEdit, stopCellEdit, setEditCellValue]);
}
