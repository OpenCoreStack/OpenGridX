import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
} from 'react';
import type { RefObject } from 'react';
import { isRtl } from '../../utils/direction';
import { isTextEntryElement } from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { isRangeColumnField, isSameCoordinates } from '../../utils/cellSelection';
import type { CellRangeContext } from '../../utils/cellSelection';
import type {
    GridCellCoordinates,
    GridCellSelectionModel,
    GridCellSelectionReason,
    GridRowModel,
} from '../../types';

/** Root class while a pointer drag selects cells: no text selection meanwhile. Public from v3.3. */
export const RANGE_DRAGGING_CLASS = 'ogx--range-dragging';

/** Pointer distance (px) from a body edge at which a drag starts scrolling. */
import type { GridTrackedDragOptions, UseGridCellSelectionParams } from './useGridCellSelection';

// The cell range drag of useGridCellSelection: click, Shift+click and drag (with auto-scroll past
// the edges), and tracked drags for the fill handle. Split out of useGridCellSelection (3.10); it is
// called from there, so the grid's hook order is unchanged.

const AUTO_SCROLL_EDGE = 32;
const AUTO_SCROLL_MAX_STEP = 40;

interface DragState {
    anchor: GridCellCoordinates;
    head: GridCellCoordinates;
    x: number;
    y: number;
    frame: number;
    moved: boolean;
    /**
     * Whether the viewport lays out right to left, read once per drag: `getComputedStyle` every frame
     * forces a style recalculation, which slowed WebKit's auto-scroll enough to delay the release.
     */
    rtl?: boolean;
    /** Ends the drag; `cancelled` unless the button was released normally (tracked drags: Escape cancels). */
    stop: (cancelled?: boolean, altKey?: boolean) => void;
    /** A tracked drag (fill handle): told the cell under the pointer each frame instead of moving the range. */
    onTrack?: (head: GridCellCoordinates, x: number, y: number) => void;
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

/** What the drag reads from the selection hook's latest values at event time. */
export interface CellRangeDragLatest {
    enabled: boolean;
    context: CellRangeContext | null;
    layout: UseGridCellSelectionParams<GridRowModel>['layout'];
    pinnedTopRowCount: number;
    viewportRef: RefObject<HTMLDivElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
}

export interface UseGridCellRangeDragParams {
    latestRef: { readonly current: CellRangeDragLatest };
    focusRef: { readonly current: FocusedCell | null };
    setRange: (anchor: GridCellCoordinates, head: GridCellCoordinates, reason: GridCellSelectionReason) => void;
    currentModel: () => GridCellSelectionModel;
}

export function useGridCellRangeDrag(params: UseGridCellRangeDragParams) {
    const { latestRef, focusRef, setRange, currentModel } = params;
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
    }, [latestRef]);

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
    }, [latestRef]);

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
        // Left-pinned columns (and pinned system columns) sit at the inline start: on the right in a
        // right-to-left grid, whose vertical scrollbar is on the left.
        if (drag.rtl === undefined) drag.rtl = isRtl(viewport);
        const rtl = drag.rtl;
        const contentLeft = rtl ? box.right - width : box.left;
        const startPinnedWidth = layout.pinnedSystemColumnsWidth + layout.leftWidth;
        const bodyLeft = contentLeft + (rtl ? layout.rightWidth : startPinnedWidth);
        const bodyRight = contentLeft + width - (rtl ? startPinnedWidth : layout.rightWidth);

        // The cell under the pointer; outside the viewport (or over the header) the nearest body cell.
        const x = clamp(drag.x, contentLeft + 1, contentLeft + width - 2);
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
        const outside = drag.y < bodyTop || drag.y > bodyBottom || drag.x < contentLeft || drag.x > contentLeft + width;
        if (!drag.moved && !outside) return;
        let dy = 0;
        let dx = 0;
        if (drag.y < bodyTop + AUTO_SCROLL_EDGE) dy = -autoScrollStep(bodyTop + AUTO_SCROLL_EDGE - drag.y);
        else if (drag.y > bodyBottom - AUTO_SCROLL_EDGE) dy = autoScrollStep(drag.y - (bodyBottom - AUTO_SCROLL_EDGE));
        if (drag.x < bodyLeft + AUTO_SCROLL_EDGE) dx = -autoScrollStep(bodyLeft + AUTO_SCROLL_EDGE - drag.x);
        else if (drag.x > bodyRight - AUTO_SCROLL_EDGE) dx = autoScrollStep(drag.x - (bodyRight - AUTO_SCROLL_EDGE));
        const canScrollY = (dy < 0 && viewport.scrollTop > 0) || (dy > 0 && viewport.scrollTop + height < viewport.scrollHeight - 1);
        // scrollLeft runs from 0 to the maximum, or from minus the maximum to 0 right to left.
        const maxScroll = viewport.scrollWidth - width;
        const minLeft = rtl ? -maxScroll : 0;
        const canScrollX = (dx < 0 && viewport.scrollLeft > minLeft) || (dx > 0 && viewport.scrollLeft < minLeft + maxScroll - 1);
        if (!canScrollY && !canScrollX) return;
        if (canScrollY) viewport.scrollTop += dy;
        if (canScrollX) viewport.scrollLeft += dx;
        // Keep going while the pointer rests in the edge zone; the next frame picks the new head.
        drag.frame = requestAnimationFrame(() => runDragFrameRef.current(true));
    }, [latestRef, headAtPoint, headRowAtOffset, setRange]);
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
        // Escape abandons a tracked drag (the fill writes nothing).
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || !dragRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.stop();
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
                if (tracked) {
                    doc.removeEventListener('pointercancel', onCancel, true);
                    doc.removeEventListener('keydown', onKeyDown, true);
                }
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
        if (tracked) {
            doc.addEventListener('pointercancel', onCancel, true);
            doc.addEventListener('keydown', onKeyDown, true);
        }
        view?.addEventListener('blur', onBlur);
    }, [latestRef, runDragFrame]);

    const startTrackedDrag = useCallback((options: GridTrackedDragOptions) => {
        const viewport = latestRef.current.viewportRef.current;
        if (!viewport || !latestRef.current.enabled) return;
        const { start, x, y, pointerId, onTrack, onEnd } = options;
        startDrag(start, start, x, y, viewport.ownerDocument, { pointerId, onTrack, onEnd });
    }, [latestRef, startDrag]);

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
    }, [focusRef, latestRef, currentModel, setRange, startDrag]);

    const handleClickCapture = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.stopPropagation();
        event.preventDefault();
    }, []);

    return { startTrackedDrag, handleMouseDown, handleClickCapture };
}
