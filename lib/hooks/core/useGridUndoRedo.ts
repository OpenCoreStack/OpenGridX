import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type {
    GridApi,
    GridBatchEditResult,
    GridColDef,
    GridHistoryChangeParams,
    GridRowId,
    GridRowModel,
} from '../../types';
import { classifyKeyTarget } from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { scrollColumnIntoView, scrollRowIntoView } from '../../utils/scroll';
import { boundingTargetRect, buildEditTargetContext, rectCorners } from '../../utils/editing/targets';
import type { GridCellChange } from '../../utils/editing/commit';
import type { GridEditSource, UseGridBatchEditReturn } from '../features/useGridBatchEdit';
import type { UseGridCellSelectionReturn } from './useGridCellSelection';
import type { LayoutResult } from './useLayout';

/** Default number of actions `undoRedo` keeps. */
export const UNDO_HISTORY_LIMIT = 100;

type CommitListener = (changes: GridCellChange[], source: GridEditSource) => void;

export interface GridEditCommitChannel {
    /** Passed to the commit paths (`useGridEditing`, `useGridBatchEdit`) as `onCommitted`. Stable. */
    emit: CommitListener;
    /** Set by `useGridUndoRedo`, which runs later in the hook order. Stable. */
    setListener: (listener: CommitListener | null) => void;
}

/**
 * Connects the commit paths, which run early in the hook order, to the history, which runs late
 * (it needs the focus and selection hooks). Created before `useGridBatchEdit`.
 */
export function useGridEditCommitChannel(): GridEditCommitChannel {
    const listenerRef = useRef<CommitListener | null>(null);
    const emit = useCallback<CommitListener>((changes, source) => {
        const listener = listenerRef.current;
        if (listener) listener(changes, source);
    }, []);
    const setListener = useCallback((listener: CommitListener | null) => {
        listenerRef.current = listener;
    }, []);
    return useMemo(() => ({ emit, setListener }), [emit, setListener]);
}

export interface UseGridUndoRedoParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    enabled: boolean;
    limit: number;
    onHistoryChange?: (params: GridHistoryChangeParams) => void;
    channel: GridEditCommitChannel;
    batchEdit: UseGridBatchEditReturn<R>;
    isEditing: boolean;
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    selection: UseGridCellSelectionReturn;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    navigationColumns: ReadonlyArray<GridColDef<R>>;
    layout: LayoutResult<R>;
    rowHeight: number;
    pinnedTopRowCount: number;
}

const emptyResult = (): GridBatchEditResult => ({ updated: [], failed: [], skipped: [] });

/** 'undo', 'redo' or null for a keydown. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y (also on non-Latin layouts). */
function historyShortcut(event: KeyboardEvent): 'undo' | 'redo' | null {
    if (event.altKey || !(event.ctrlKey || event.metaKey)) return null;
    const key = (event.key ?? '').toLowerCase();
    const latin = /^[a-z]$/.test(key);
    const isZ = key === 'z' || (!latin && event.code === 'KeyZ');
    const isY = key === 'y' || (!latin && event.code === 'KeyY');
    if (isZ) return event.shiftKey ? 'redo' : 'undo';
    if (isY && event.ctrlKey && !event.shiftKey) return 'redo';
    return null;
}

/**
 * Undo / redo of cell edits, pastes and range clears (`undoRedo`, v3.4). An action is recorded only
 * after `processRowUpdate` succeeded, as the changed cells with their value before and the stored
 * value after. Undo writes the `before` values as a batch edit (so `valueSetter` and
 * `processRowUpdate` run); a cell that no longer holds its `after` value is skipped (`'changed'`), a
 * row that is gone too (`'missing'`). Redo is the reverse. Runs after useGridClipboardPaste.
 */
export function useGridUndoRedo<R extends GridRowModel>(params: UseGridUndoRedoParams<R>): void {
    const { apiRef, enabled, channel, containerRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const undoStackRef = useRef<GridCellChange[][]>([]);
    const redoStackRef = useRef<GridCellChange[][]>([]);
    const lastEmittedRef = useRef<GridHistoryChangeParams>({ canUndo: false, canRedo: false, size: 0 });
    // Undo and redo run one after the other, each on the rows the previous one stored.
    const queueRef = useRef<Promise<unknown>>(Promise.resolve());

    const notify = useCallback(() => {
        const next = {
            canUndo: undoStackRef.current.length > 0,
            canRedo: redoStackRef.current.length > 0,
            size: undoStackRef.current.length,
        };
        const last = lastEmittedRef.current;
        if (last.canUndo === next.canUndo && last.canRedo === next.canRedo && last.size === next.size) return;
        lastEmittedRef.current = next;
        latestRef.current.onHistoryChange?.(next);
    }, []);

    const record = useCallback((changes: GridCellChange[]) => {
        if (!latestRef.current.enabled || changes.length === 0) return;
        const stack = undoStackRef.current;
        stack.push(changes);
        const limit = Math.max(1, latestRef.current.limit);
        if (stack.length > limit) stack.splice(0, stack.length - limit);
        redoStackRef.current = [];
        notify();
    }, [notify]);

    useLayoutEffect(() => {
        channel.setListener(enabled ? record : null);
        return () => channel.setListener(null);
    }, [channel, enabled, record]);

    const clearHistory = useCallback(() => {
        undoStackRef.current = [];
        redoStackRef.current = [];
        notify();
    }, [notify]);

    // Turning undoRedo off forgets the history.
    useEffect(() => {
        if (!enabled) clearHistory();
    }, [enabled, clearHistory]);

    /** Selects the affected cells (their bounding rectangle) and scrolls its first cell into view. */
    const reveal = useCallback((cells: GridCellChange[]) => {
        const p = latestRef.current;
        const ctx = buildEditTargetContext(p.allRenderableRows, p.getRowId, p.navigationColumns);
        const rect = boundingTargetRect(ctx, cells);
        if (!rect) return;
        const { anchor, head } = rectCorners(ctx, rect);
        if (p.selection.enabled) p.selection.setModel([{ anchor, head }], 'keyboard');
        else p.setFocusedCell({ id: anchor.id, field: anchor.field, rowIndex: rect.top });
        const viewport = p.viewportRef.current;
        if (!viewport) return;
        scrollRowIntoView(viewport, rect.top - p.pinnedTopRowCount, p.layout.cumulativeHeights, p.layout.pinnedBottomHeight, p.rowHeight);
        scrollColumnIntoView(viewport, p.layout.unpinnedColsWithWidth.findIndex(c => c.field === anchor.field), p.layout);
    }, []);

    /** Replays the top action of one stack onto the other. */
    const replay = useCallback((direction: 'undo' | 'redo'): Promise<GridBatchEditResult> => {
        const run = async (): Promise<GridBatchEditResult> => {
            if (!latestRef.current.enabled) return emptyResult();
            const from = direction === 'undo' ? undoStackRef : redoStackRef;
            const to = direction === 'undo' ? redoStackRef : undoStackRef;
            const action = from.current.pop();
            if (!action) return emptyResult();
            notify();
            // Undo writes `before` where `after` still holds; redo writes `after` where `before` holds.
            const edits = action.map(change => direction === 'undo'
                ? { id: change.id, field: change.field, value: change.before, expect: { value: change.after } }
                : { id: change.id, field: change.field, value: change.after, expect: { value: change.before } });
            const outcome = await latestRef.current.batchEdit.applyEdits(edits, direction);
            if (outcome.committed.length > 0) {
                // The opposite action: for an undo, `before` is what it stored and `after` what it replaced.
                to.current.push(direction === 'undo'
                    ? outcome.committed.map(c => ({ id: c.id, field: c.field, before: c.after, after: c.before }))
                    : outcome.committed);
            }
            // Rows whose processRowUpdate failed keep their part of the action, to try again.
            const failedIds = new Set<GridRowId>(outcome.result.failed.map(f => f.id));
            if (failedIds.size > 0) {
                const remainder = action.filter(change => failedIds.has(change.id));
                if (remainder.length > 0) from.current.push(remainder);
            }
            notify();
            if (outcome.committed.length > 0) reveal(outcome.committed);
            return outcome.result;
        };
        const next = queueRef.current.then(run, run);
        queueRef.current = next;
        return next;
    }, [notify, reveal]);

    const undo = useCallback(() => replay('undo'), [replay]);
    const redo = useCallback(() => replay('redo'), [replay]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || !enabled) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            const shortcut = historyShortcut(event);
            if (!shortcut) return;
            const viewport = latestRef.current.viewportRef.current;
            if (!viewport || latestRef.current.isEditing) return;
            // Inside an editor or a text field the input's own undo wins.
            const kind = classifyKeyTarget(event.target, viewport);
            if (kind !== 'grid' && kind !== 'control') return;
            event.preventDefault();
            void (shortcut === 'undo' ? undo() : redo());
        };
        root.addEventListener('keydown', onKeyDown);
        return () => root.removeEventListener('keydown', onKeyDown);
    }, [containerRef, enabled, undo, redo]);

    useLayoutEffect(() => {
        const api = apiRef.current;
        api.undo = undo;
        api.redo = redo;
        api.canUndo = () => latestRef.current.enabled && undoStackRef.current.length > 0;
        api.canRedo = () => latestRef.current.enabled && redoStackRef.current.length > 0;
        api.clearHistory = clearHistory;
    }, [apiRef, undo, redo, clearHistory]);
}
