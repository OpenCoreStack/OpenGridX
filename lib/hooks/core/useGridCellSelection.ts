import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { scrollColumnIntoView, scrollRowIntoView } from '../../utils/scroll';
import { isSyntheticRowId } from '../../utils/syntheticRows';
import { isTextEntryElement } from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { getCellValue } from '../../utils/values';
import { AGGREGATION_FUNCTIONS } from '../../utils/aggregation';
import {
    LARGE_RANGE_COPY_CELLS,
    defaultCellSelectionAnnouncement,
    isRangeColumnField,
    isSameCellSelectionModel,
    isSameCoordinates,
    nextRangeHead,
    rectCellCount,
    resolveCellRange,
} from '../../utils/cellSelection';
import type { CellRangeContext, CellRangeRect, CellRangeSpanLookup, ResolvedCellRange } from '../../utils/cellSelection';
import { buildRangeTsv } from '../features/useGridClipboard';
import type { GridSpanningResult } from '../features/useGridSpanning';
import type { LayoutResult } from './useLayout';
import type { GridKeyboardCellSelection } from './useGridKeyboardNavigation';
import type {
    GridCellCoordinates,
    GridCellSelectionModel,
    GridCellSelectionReason,
    GridColDef,
    GridLocaleText,
    GridRowId,
    GridRowMeta,
    GridRowModel,
    GridSelectedCell,
} from '../../types';

/** Root class while a pointer drag selects cells: no text selection meanwhile. Public from v3.3. */
export const RANGE_DRAGGING_CLASS = 'ogx--range-dragging';

/** Pointer distance (px) from a body edge at which a drag starts scrolling. */
const AUTO_SCROLL_EDGE = 32;
const AUTO_SCROLL_MAX_STEP = 40;
const ANNOUNCEMENT_DELAY_MS = 300;

/** The rectangle in the coordinates rows render with: row indices of the renderable rows, data column indices. */
export interface GridDisplayCellRange {
    top: number;
    bottom: number;
    /** `columnIndexMap` index of the first column. */
    left: number;
    right: number;
}

/** Totals of the status bar. */
export interface GridCellSelectionStats {
    cellCount: number;
    rowCount: number;
    columnCount: number;
    count: number;
    numericCount: number;
    sum: number | null;
    average: number | null;
}

type RangeColumn<R extends GridRowModel> = Pick<GridColDef<R>, 'field'> & Partial<GridColDef<R>>;

export interface UseGridCellSelectionParams<R extends GridRowModel> {
    enabled: boolean;
    model: GridCellSelectionModel;
    onModelChange: (model: GridCellSelectionModel, reason: GridCellSelectionReason) => void;
    /** The model passed to onModelChange since the last commit (not rendered yet), or null. */
    getPendingModel: () => GridCellSelectionModel | null;
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    /** System columns and the rendered data columns, in render order (useGridColumns). */
    navigationColumns: ReadonlyArray<RangeColumn<R>>;
    columnIndexMap: Map<string, number>;
    spanning: GridSpanningResult;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    layout: LayoutResult<R>;
    rowHeight: number;
    pinnedTopRowCount: number;
    viewportRef: RefObject<HTMLDivElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
    localeText?: GridLocaleText;
    showStats: boolean;
}

export interface UseGridCellSelectionReturn {
    enabled: boolean;
    /** The first range of the model. */
    range: GridCellSelectionModel[number] | null;
    /** Where the range lies on screen, or null when it is empty or a corner is not displayed. */
    resolved: ResolvedCellRange | null;
    /** The rectangle to draw (more than one cell selected), in render coordinates. */
    displayRange: GridDisplayCellRange | null;
    hasRowSpan: boolean;
    /** Viewport mousedown: click, Shift+click and drag. Undefined while off. */
    handleMouseDown: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    /** Viewport click (capture): swallows the click that ends a drag or a Shift+click. Undefined while off. */
    handleClickCapture: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    /** Shift+navigation key from the keyboard hook. Returns whether the key was used. */
    extendSelection: (key: string, withModifier: boolean, pageSize: number, from: FocusedCell) => boolean;
    /** Escape: collapses a multi-cell range to its anchor. Returns whether it did. */
    collapseSelection: () => boolean;
    /** Ctrl/Cmd+A: every data cell of the page. Returns whether anything was selected. */
    selectAllCells: () => boolean;
    /** The three keyboard handlers for useGridKeyboardNavigation (stable), undefined while off. */
    keyboard: GridKeyboardCellSelection | undefined;
    /** The text Ctrl/Cmd+C copies: the range, else the focused cell; null when there is nothing. */
    getCopyText: () => string | null;
    getSelectedCells: () => GridSelectedCell[];
    /** Live-region text, debounced. Empty when nothing is to be said. */
    announcement: string;
    stats: GridCellSelectionStats | null;
    /** Lets the API hook (after the keyboard hook) report the focus position the copy falls back to. */
    reportFocus: (cell: FocusedCell | null) => void;
    /** Sets the model, keeping only the first range, unless it is unchanged. */
    setModel: (model: GridCellSelectionModel, reason: GridCellSelectionReason) => void;
    /**
     * The current range (a pending model included) and where it lies, read at call time. Its indices
     * address the renderable rows and the range columns of `navigationColumns` (`isRangeColumnField`).
     */
    getCurrentRange: () => { range: GridCellSelectionModel[number] | null; resolved: ResolvedCellRange | null };
    /** Starts a tracked pointer drag with the range drag's auto-scroll (fill handle). Stable. @since v3.5 */
    startTrackedDrag: (options: GridTrackedDragOptions) => void;
}

interface DragState {
    anchor: GridCellCoordinates;
    head: GridCellCoordinates;
    x: number;
    y: number;
    frame: number;
    moved: boolean;
    /** Ends the drag; `cancelled` unless the button was released normally. */
    stop: (cancelled?: boolean, altKey?: boolean) => void;
    /** A tracked drag (fill handle): told the cell under the pointer each frame instead of moving the range. */
    onTrack?: (head: GridCellCoordinates, x: number, y: number) => void;
}

/** A drag that reuses the range drag's hit testing and auto-scroll without selecting (the fill handle, v3.5). */
export interface GridTrackedDragOptions {
    /** The cell the drag starts on. */
    start: GridCellCoordinates;
    x: number;
    y: number;
    /** Pointer events of this pointer are followed (touch included), not mouse events. */
    pointerId: number;
    /** Each frame: the cell under the pointer (or nearest it) and the pointer position. */
    onTrack: (head: GridCellCoordinates, x: number, y: number) => void;
    /** Once: released (`cancelled: false`, with the Alt key state) or cancelled. */
    onEnd: (details: { cancelled: boolean; altKey: boolean }) => void;
}

/** The body cell of `viewport` holding `target`: its row index and field. Not cells of nested grids or detail panels. */
function cellFromTarget(target: EventTarget | null, viewport: HTMLElement): { rowIndex: number; field: string; element: HTMLElement } | null {
    if (!target || (target as Node).nodeType !== 1) return null;
    const element = (target as Element).closest<HTMLElement>('.ogx__cell[data-field]');
    if (!element || element.closest('.ogx__viewport') !== viewport) return null;
    const panel = element.closest('.ogx__detail-panel');
    if (panel && viewport.contains(panel)) return null;
    const rowElement = element.closest('[role="row"][data-rowindex]');
    if (!rowElement) return null;
    const rowIndex = Number(rowElement.getAttribute('data-rowindex'));
    const field = element.dataset.field;
    if (!Number.isInteger(rowIndex) || !field) return null;
    return { rowIndex, field, element };
}

function clearTextSelection(doc: Document): void {
    const selection = doc.getSelection();
    if (selection && selection.rangeCount > 0) selection.removeAllRanges();
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const autoScrollStep = (over: number) => Math.min(AUTO_SCROLL_MAX_STEP, Math.max(2, Math.round(over / 2)));

function warnLargeCopy(cellCount: number): void {
    if (process.env.NODE_ENV === 'production') return;
    console.warn(
        `[OpenGridX] Copying ${cellCount} cells. For ranges this large, exportToCsv or exportToExcel is the better tool.`
    );
}

/**
 * Cell range selection (`cellSelection`): resolves the model's range against the current display
 * order (growing it over spans), handles pointer drag with auto-scroll, Shift+click and the
 * Shift+navigation keys the keyboard hook hands over, and builds the copied text, the status-bar
 * totals and the live-region text. The API methods and the focus ↔ anchor sync are installed by
 * useGridCellSelectionApi, after the keyboard hook.
 */
export function useGridCellSelection<R extends GridRowModel>(params: UseGridCellSelectionParams<R>): UseGridCellSelectionReturn {
    const {
        enabled, model, allRenderableRows, getRowId, navigationColumns, columnIndexMap, spanning,
        rowMetaMap, localeText, showStats,
    } = params;

    const range = enabled && model.length > 0 ? model[0] : null;

    const rangeColumns = useMemo(
        () => (enabled ? navigationColumns.filter(c => isRangeColumnField(c.field)) : []),
        [enabled, navigationColumns]
    );

    const spanLookup = useMemo<CellRangeSpanLookup | undefined>(() => {
        if (!spanning.hasColSpan && !spanning.hasRowSpan) return undefined;
        const { colspanMap, rowSpanningCaches, getSpanOrigin } = spanning;
        return {
            getSpanOrigin,
            getColSpan: (rowId, field) => {
                const info = colspanMap.get(rowId)?.[field];
                return info && !info.spannedByColSpan ? info.cellProps.colSpan : 1;
            },
            getRowSpan: (rowId, field) => rowSpanningCaches.spannedCells[rowId]?.[field] ?? 1,
        };
    }, [spanning]);

    const context = useMemo<CellRangeContext | null>(() => {
        if (!enabled) return null;
        const rowIds = allRenderableRows.map(getRowId);
        const rowIndexById = new Map<GridRowId, number>();
        rowIds.forEach((id, index) => { if (!rowIndexById.has(id)) rowIndexById.set(id, index); });
        const fields = rangeColumns.map(c => c.field);
        return {
            rowIds,
            rowIndexById,
            fields,
            colIndexByField: new Map(fields.map((field, index) => [field, index])),
            spans: spanLookup,
        };
    }, [enabled, allRenderableRows, getRowId, rangeColumns, spanLookup]);

    const resolved = useMemo(
        () => (range && context ? resolveCellRange(range, context) : null),
        [range, context]
    );

    const isMultiCell = resolved !== null && rectCellCount(resolved) > 1;

    const displayRange = useMemo<GridDisplayCellRange | null>(() => {
        if (!resolved || !isMultiCell || !context) return null;
        const left = columnIndexMap.get(context.fields[resolved.left]);
        const right = columnIndexMap.get(context.fields[resolved.right]);
        if (left === undefined || right === undefined) return null;
        return { top: resolved.top, bottom: resolved.bottom, left, right };
    }, [resolved, isMultiCell, context, columnIndexMap]);

    const isSynthetic = useCallback((id: GridRowId) => isSyntheticRowId(id, rowMetaMap), [rowMetaMap]);

    /** Visits the cells of `rect` of data rows, in display order; `covered` marks span-covered positions. */
    const forEachCell = useCallback((
        rect: CellRangeRect,
        visitRow: (row: R, id: GridRowId) => void,
        visitCell: (row: R, id: GridRowId, col: RangeColumn<R>, covered: boolean) => void,
    ) => {
        if (!context) return;
        for (let r = rect.top; r <= rect.bottom; r++) {
            const row = allRenderableRows[r];
            const id = context.rowIds[r];
            if (!row || isSynthetic(id)) continue;
            visitRow(row, id);
            for (let c = rect.left; c <= rect.right; c++) {
                const col = rangeColumns[c];
                const origin = spanLookup?.getSpanOrigin(id, col.field);
                visitCell(row, id, col, origin !== null && origin !== undefined && (origin.rowId !== id || origin.field !== col.field));
            }
        }
    }, [context, allRenderableRows, rangeColumns, spanLookup, isSynthetic]);

    // Latest values for event handlers and API methods, which keep a stable identity.
    const latest = { ...params, range, resolved, context, rangeColumns, forEachCell };
    const latestRef = useRef(latest);
    useLayoutEffect(() => {
        latestRef.current = latest;
    });
    const focusRef = useRef<FocusedCell | null>(null);
    const reportFocus = useCallback((cell: FocusedCell | null) => { focusRef.current = cell; }, []);

    const currentModel = useCallback((): GridCellSelectionModel => {
        const { getPendingModel, model: rendered } = latestRef.current;
        return getPendingModel() ?? rendered;
    }, []);

    /** The current range (pending one included) and where it lies, read at call time. */
    const currentRange = useCallback((): { range: GridCellSelectionModel[number] | null; resolved: ResolvedCellRange | null } => {
        const { context: ctx, range: rendered, resolved: renderedResolved, enabled: on } = latestRef.current;
        const first = on ? currentModel()[0] ?? null : null;
        if (!first || !ctx) return { range: null, resolved: null };
        if (first === rendered) return { range: first, resolved: renderedResolved };
        return { range: first, resolved: resolveCellRange(first, ctx) };
    }, [currentModel]);

    const setModel = useCallback((next: GridCellSelectionModel, reason: GridCellSelectionReason) => {
        if (!latestRef.current.enabled) return;
        const trimmed = next.length > 1 ? next.slice(0, 1) : next;
        if (isSameCellSelectionModel(trimmed, currentModel())) return;
        latestRef.current.onModelChange(trimmed, reason);
    }, [currentModel]);

    const setRange = useCallback((anchor: GridCellCoordinates, head: GridCellCoordinates, reason: GridCellSelectionReason) => {
        setModel([{ anchor, head }], reason);
    }, [setModel]);

    const scrollHeadIntoView = useCallback((row: number, field: string) => {
        const { viewportRef, layout, rowHeight, pinnedTopRowCount } = latestRef.current;
        const el = viewportRef.current;
        if (!el) return;
        scrollRowIntoView(el, row - pinnedTopRowCount, layout.cumulativeHeights, layout.pinnedBottomHeight, rowHeight);
        scrollColumnIntoView(el, layout.unpinnedColsWithWidth.findIndex(c => c.field === field), layout);
    }, []);

    const extendSelection = useCallback((key: string, withModifier: boolean, pageSize: number, from: FocusedCell): boolean => {
        const { context: ctx } = latestRef.current;
        const { range: current, resolved: currentResolved } = currentRange();
        if (!ctx || from.id === null || !isRangeColumnField(from.field)) return false;
        const fromRow = ctx.rowIndexById.get(from.id);
        const fromCol = ctx.colIndexByField.get(from.field);
        if (fromRow === undefined || fromCol === undefined) return false;
        // The range extends from the focused cell: the anchor, unless focus moved off it.
        const base = current && currentResolved && isSameCoordinates(current.anchor, { id: from.id, field: from.field })
            ? { range: current, resolved: currentResolved }
            : null;
        const anchor = base ? base.range.anchor : { id: from.id, field: from.field };
        const resolvedBase = base?.resolved ?? resolveCellRange({ anchor, head: anchor }, ctx);
        if (!resolvedBase) return false;
        const next = nextRangeHead(resolvedBase, key, withModifier, pageSize, ctx.rowIds.length - 1, ctx.fields.length - 1);
        if (!next) return true;
        const head = { id: ctx.rowIds[next.row], field: ctx.fields[next.col] };
        setRange(anchor, head, 'keyboard');
        scrollHeadIntoView(next.row, head.field);
        return true;
    }, [currentRange, setRange, scrollHeadIntoView]);

    const collapseSelection = useCallback((): boolean => {
        const { range: current, resolved: currentResolved } = currentRange();
        if (!current || !currentResolved || rectCellCount(currentResolved) <= 1) return false;
        setRange(current.anchor, current.anchor, 'keyboard');
        return true;
    }, [currentRange, setRange]);

    const selectAllCells = useCallback((): boolean => {
        const { context: ctx } = latestRef.current;
        if (!ctx || ctx.rowIds.length === 0 || ctx.fields.length === 0) return false;
        setRange(
            { id: ctx.rowIds[0], field: ctx.fields[0] },
            { id: ctx.rowIds[ctx.rowIds.length - 1], field: ctx.fields[ctx.fields.length - 1] },
            'selectAll',
        );
        return true;
    }, [setRange]);

    /** The rectangle to copy or read: the range, else the focused data cell. */
    const getTargetRect = useCallback((): CellRangeRect | null => {
        const { context: ctx } = latestRef.current;
        const { range: target, resolved: current } = currentRange();
        if (!ctx) return null;
        if (current) return current;
        if (target) return null;
        const focus = focusRef.current;
        if (!focus || focus.id === null || !isRangeColumnField(focus.field)) return null;
        const single = resolveCellRange({ anchor: { id: focus.id, field: focus.field }, head: { id: focus.id, field: focus.field } }, ctx);
        return single;
    }, [currentRange]);

    const getCopyText = useCallback((): string | null => {
        const rect = getTargetRect();
        if (!rect) return null;
        const { rangeColumns: cols, forEachCell: visit } = latestRef.current;
        const cellCount = rectCellCount(rect);
        if (cellCount > LARGE_RANGE_COPY_CELLS) warnLargeCopy(cellCount);
        const rows: R[] = [];
        visit(rect, (row) => { rows.push(row); }, () => {});
        if (rows.length === 0) return null;
        const columns = cols.slice(rect.left, rect.right + 1) as GridColDef[];
        const spans = latestRef.current.context?.spans;
        const getId = latestRef.current.getRowId;
        const isCovered = spans
            ? (row: GridRowModel, col: GridColDef) => {
                const id = getId(row as R);
                const origin = spans.getSpanOrigin(id, col.field);
                return origin !== null && (origin.rowId !== id || origin.field !== col.field);
            }
            : undefined;
        return buildRangeTsv(rows as GridRowModel[], columns, isCovered);
    }, [getTargetRect]);

    const getSelectedCells = useCallback((): GridSelectedCell[] => {
        const { forEachCell: visit } = latestRef.current;
        const { resolved: current } = currentRange();
        if (!current) return [];
        const cells: GridSelectedCell[] = [];
        visit(current, () => {}, (row, id, col, covered) => {
            if (!covered) cells.push({ id, field: col.field, value: getCellValue(row, col.field, col as GridColDef<R>) });
        });
        return cells;
    }, [currentRange]);

    // ── Pointer: click, Shift+click and drag ────────────────────────────────
    const dragRef = useRef<DragState | null>(null);
    const suppressClickRef = useRef(false);

    useEffect(() => () => dragRef.current?.stop(), []);

    const headAtPoint = useCallback((viewport: HTMLElement, x: number, y: number): GridCellCoordinates | null => {
        const ctx = latestRef.current.context;
        if (!ctx) return null;
        const doc = viewport.ownerDocument;
        // jsdom has no elementFromPoint.
        if (typeof doc.elementFromPoint !== 'function') return null;
        const hit = cellFromTarget(doc.elementFromPoint(x, y), viewport);
        if (!hit) return null;
        const id = ctx.rowIds[hit.rowIndex];
        if (id === undefined) return null;
        // Over the system or grouping column (left of the data): the first data column.
        const field = isRangeColumnField(hit.field) ? hit.field : ctx.fields[0];
        return field === undefined ? null : { id, field };
    }, []);

    /** The row whose band holds `centerY` (px from the top of the unpinned rows), with `field`. */
    const headRowAtOffset = useCallback((centerY: number, field: string): GridCellCoordinates | null => {
        const { context: ctx, layout, pinnedTopRowCount } = latestRef.current;
        const heights = layout.cumulativeHeights;
        if (!ctx || heights.length === 0 || centerY < 0) return null;
        let lo = 0;
        let hi = heights.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (heights[mid] > centerY) hi = mid; else lo = mid + 1;
        }
        const id = ctx.rowIds[lo + pinnedTopRowCount];
        return id === undefined ? null : { id, field };
    }, []);

    // The auto-scroll loop schedules the next frame through this ref: a callback cannot name itself.
    const runDragFrameRef = useRef<(allowScroll: boolean) => void>(() => {});
    const runDragFrame = useCallback((allowScroll: boolean) => {
        const drag = dragRef.current;
        const viewport = latestRef.current.viewportRef.current;
        if (!drag || !viewport) return;
        drag.frame = 0;
        const { layout } = latestRef.current;
        const box = viewport.getBoundingClientRect();
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;
        const stickyTop = viewport.querySelector(':scope > .ogx__content > .ogx__sticky-top');
        const stickyBottom = viewport.querySelector(':scope > .ogx__content > .ogx__sticky-bottom');
        const headerWrap = stickyTop?.querySelector(':scope > .ogx__header-wrap');
        const bodyTop = stickyTop ? stickyTop.getBoundingClientRect().bottom : box.top;
        const bodyBottom = Math.min(box.top + height, stickyBottom ? stickyBottom.getBoundingClientRect().top : box.top + height);
        const headerBottom = headerWrap ? headerWrap.getBoundingClientRect().bottom : bodyTop;
        const bodyLeft = box.left + layout.pinnedSystemColumnsWidth + layout.leftWidth;
        const bodyRight = box.left + width - layout.rightWidth;

        // The cell under the pointer; outside the viewport (or over the header) the nearest body cell.
        const x = clamp(drag.x, box.left + 1, box.left + width - 2);
        let y = drag.y;
        if (y < box.top || y > box.top + height || y < headerBottom) y = clamp(y, bodyTop + 1, Math.max(bodyTop + 1, bodyBottom - 2));
        // During fast auto-scroll the rows under the pointer may not be rendered yet (virtualization
        // lags a frame or more on a slow machine), so the hit test finds no cell. Work out the row from
        // the scroll position and the row heights instead, keeping the column the head already has.
        const canHitTest = typeof viewport.ownerDocument.elementFromPoint === 'function';
        const hit = headAtPoint(viewport, x, y);
        const head = hit ?? (canHitTest && drag.moved
            ? headRowAtOffset(y - box.top - (stickyTop ? stickyTop.getBoundingClientRect().height : 0) + viewport.scrollTop, drag.head.field)
            : null);
        if (head && !isSameCoordinates(head, drag.head)) {
            drag.head = head;
            if (!drag.moved && !isSameCoordinates(head, drag.anchor)) {
                drag.moved = true;
                latestRef.current.containerRef.current?.classList.add(RANGE_DRAGGING_CLASS);
                clearTextSelection(viewport.ownerDocument);
            }
            if (!drag.onTrack) setRange(drag.anchor, head, 'pointer');
        }
        // A tracked drag hears every frame: its target can change while the head stays in one cell.
        if (drag.onTrack) drag.onTrack(drag.head, drag.x, drag.y);

        if (!allowScroll) return;
        const outside = drag.y < bodyTop || drag.y > bodyBottom || drag.x < box.left || drag.x > box.left + width;
        if (!drag.moved && !outside) return;
        let dy = 0;
        let dx = 0;
        if (drag.y < bodyTop + AUTO_SCROLL_EDGE) dy = -autoScrollStep(bodyTop + AUTO_SCROLL_EDGE - drag.y);
        else if (drag.y > bodyBottom - AUTO_SCROLL_EDGE) dy = autoScrollStep(drag.y - (bodyBottom - AUTO_SCROLL_EDGE));
        if (drag.x < bodyLeft + AUTO_SCROLL_EDGE) dx = -autoScrollStep(bodyLeft + AUTO_SCROLL_EDGE - drag.x);
        else if (drag.x > bodyRight - AUTO_SCROLL_EDGE) dx = autoScrollStep(drag.x - (bodyRight - AUTO_SCROLL_EDGE));
        const canScrollY = (dy < 0 && viewport.scrollTop > 0) || (dy > 0 && viewport.scrollTop + height < viewport.scrollHeight - 1);
        const canScrollX = (dx < 0 && viewport.scrollLeft > 0) || (dx > 0 && viewport.scrollLeft + width < viewport.scrollWidth - 1);
        if (!canScrollY && !canScrollX) return;
        if (canScrollY) viewport.scrollTop += dy;
        if (canScrollX) viewport.scrollLeft += dx;
        // Keep going while the pointer rests in the edge zone; the next frame picks the new head.
        drag.frame = requestAnimationFrame(() => runDragFrameRef.current(true));
    }, [headAtPoint, headRowAtOffset, setRange]);
    useLayoutEffect(() => {
        runDragFrameRef.current = runDragFrame;
    }, [runDragFrame]);

    const startDrag = useCallback((
        anchor: GridCellCoordinates,
        head: GridCellCoordinates,
        x: number,
        y: number,
        doc: Document,
        tracked?: Pick<GridTrackedDragOptions, 'pointerId' | 'onTrack' | 'onEnd'>,
    ) => {
        dragRef.current?.stop();
        // A range drag follows the mouse; a tracked drag (fill handle) follows its pointer, touch included.
        const moveType = tracked ? 'pointermove' : 'mousemove';
        const upType = tracked ? 'pointerup' : 'mouseup';
        const isOwnEvent = (event: MouseEvent) => !tracked || (event as PointerEvent).pointerId === tracked.pointerId;
        const onMove = (event: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag || !isOwnEvent(event)) return;
            if (event.buttons === 0) {
                // Released outside the window.
                drag.stop();
                return;
            }
            drag.x = event.clientX;
            drag.y = event.clientY;
            // The native text selection started by the press would otherwise follow the pointer out
            // of the grid (WebKit), and a page text selection makes Ctrl/Cmd+C leave the copy to the browser.
            if (drag.moved) {
                event.preventDefault();
                clearTextSelection(doc);
            }
            if (!drag.frame) drag.frame = requestAnimationFrame(() => runDragFrame(true));
        };
        const onUp = (event: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag || !isOwnEvent(event)) return;
            drag.x = event.clientX;
            drag.y = event.clientY;
            runDragFrame(false);
            const moved = drag.moved;
            drag.stop(false, event.altKey);
            if (moved) clearTextSelection(doc);
            if (moved) {
                // The click that follows lands on the common ancestor of both cells (often the row):
                // it must not select the row or move focus.
                suppressClickRef.current = true;
                setTimeout(() => { suppressClickRef.current = false; }, 0);
            }
        };
        const onCancel = (event: Event) => {
            if (isOwnEvent(event as MouseEvent)) dragRef.current?.stop();
        };
        const view = doc.defaultView;
        const onBlur = () => dragRef.current?.stop();
        let ended = false;
        const drag: DragState = {
            anchor, head, x, y, frame: 0, moved: false,
            onTrack: tracked?.onTrack,
            stop: (cancelled = true, altKey = false) => {
                if (drag.frame) cancelAnimationFrame(drag.frame);
                drag.frame = 0;
                doc.removeEventListener(moveType, onMove, true);
                doc.removeEventListener(upType, onUp, true);
                if (tracked) doc.removeEventListener('pointercancel', onCancel, true);
                view?.removeEventListener('blur', onBlur);
                latestRef.current.containerRef.current?.classList.remove(RANGE_DRAGGING_CLASS);
                if (dragRef.current === drag) dragRef.current = null;
                if (!ended) {
                    ended = true;
                    if (tracked) tracked.onEnd({ cancelled, altKey });
                }
            },
        };
        dragRef.current = drag;
        doc.addEventListener(moveType, onMove, true);
        doc.addEventListener(upType, onUp, true);
        if (tracked) doc.addEventListener('pointercancel', onCancel, true);
        view?.addEventListener('blur', onBlur);
    }, [runDragFrame]);

    const startTrackedDrag = useCallback((options: GridTrackedDragOptions) => {
        const viewport = latestRef.current.viewportRef.current;
        if (!viewport || !latestRef.current.enabled) return;
        const { start, x, y, pointerId, onTrack, onEnd } = options;
        startDrag(start, start, x, y, viewport.ownerDocument, { pointerId, onTrack, onEnd });
    }, [startDrag]);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (event.button !== 0 || event.defaultPrevented) return;
        const { context: ctx } = latestRef.current;
        if (!ctx) return;
        const viewport = event.currentTarget;
        const hit = cellFromTarget(event.target, viewport);
        if (!hit || !isRangeColumnField(hit.field)) return;
        // The fill handle starts its own drag (useGridFillHandle).
        if ((event.target as Element).closest?.('.ogx__cell-fill-handle')) return;
        // Typing targets and open editors keep the pointer to themselves.
        if (hit.element.classList.contains('ogx__cell--editing') || isTextEntryElement(event.target as Element)) return;
        const id = ctx.rowIds[hit.rowIndex];
        if (id === undefined) return;
        const cell = { id, field: hit.field };

        let anchor: GridCellCoordinates = cell;
        if (event.shiftKey) {
            const current = currentModel()[0];
            const focus = focusRef.current;
            if (current && ctx.rowIndexById.has(current.anchor.id) && ctx.colIndexByField.has(current.anchor.field)) anchor = current.anchor;
            else if (focus && focus.id !== null && isRangeColumnField(focus.field)) anchor = { id: focus.id, field: focus.field };
            // Shift+click extends the range: no text selection, no focus move and no click (row
            // selection, onCellClick) afterwards.
            event.preventDefault();
            suppressClickRef.current = true;
            const doc = viewport.ownerDocument;
            if (!viewport.contains(doc.activeElement)) viewport.focus({ preventScroll: true });
        }
        setRange(anchor, cell, 'pointer');
        startDrag(anchor, cell, event.clientX, event.clientY, viewport.ownerDocument);
        if (event.shiftKey) {
            const drag = dragRef.current;
            if (drag && !isSameCoordinates(anchor, cell)) drag.moved = true;
        }
    }, [currentModel, setRange, startDrag]);

    const handleClickCapture = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.stopPropagation();
        event.preventDefault();
    }, []);

    // ── Live region and status bar ──────────────────────────────────────────
    const columnCount = resolved ? resolved.right - resolved.left + 1 : 0;
    const rowCount = resolved ? resolved.bottom - resolved.top + 1 : 0;
    const announcementFn = localeText?.cellSelectionAnnouncement ?? defaultCellSelectionAnnouncement;
    const announcementText = isMultiCell ? announcementFn(rowCount * columnCount, rowCount, columnCount) : '';
    const [announcement, setAnnouncement] = useState('');
    useEffect(() => {
        if (!enabled) return;
        const timer = setTimeout(() => setAnnouncement(announcementText), ANNOUNCEMENT_DELAY_MS);
        return () => clearTimeout(timer);
    }, [enabled, announcementText]);

    const stats = useMemo<GridCellSelectionStats | null>(() => {
        if (!showStats || !resolved || !isMultiCell) return null;
        const values: unknown[] = [];
        forEachCell(resolved, () => {}, (row, _id, col, covered) => {
            if (!covered) values.push(getCellValue(row, col.field, col as GridColDef<R>));
        });
        const numbers = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
        return {
            cellCount: rectCellCount(resolved),
            rowCount: resolved.bottom - resolved.top + 1,
            columnCount: resolved.right - resolved.left + 1,
            count: AGGREGATION_FUNCTIONS.count(values) as number,
            numericCount: numbers.length,
            sum: numbers.length ? AGGREGATION_FUNCTIONS.sum(numbers) as number : null,
            average: numbers.length ? AGGREGATION_FUNCTIONS.avg(numbers) as number : null,
        };
    }, [showStats, resolved, isMultiCell, forEachCell]);

    const keyboard = useMemo<GridKeyboardCellSelection | undefined>(
        () => (enabled ? { extendSelection, collapseSelection, selectAllCells } : undefined),
        [enabled, extendSelection, collapseSelection, selectAllCells]
    );

    return {
        enabled,
        range,
        resolved,
        displayRange,
        hasRowSpan: spanning.hasRowSpan,
        handleMouseDown: enabled ? handleMouseDown : undefined,
        handleClickCapture: enabled ? handleClickCapture : undefined,
        extendSelection,
        collapseSelection,
        selectAllCells,
        keyboard,
        getCopyText,
        getSelectedCells,
        announcement: enabled ? announcement : '',
        stats,
        reportFocus,
        setModel,
        getCurrentRange: currentRange,
        startTrackedDrag,
    };
}

