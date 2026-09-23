import { useRef, useState, useCallback, useEffect } from 'react';
import type { GridRowScrollEndParams } from '../../types';
import { getRowsScrollEndParams } from '../../utils/scroll/scrollEnd';

export interface UseGridScrollSyncParams {
    onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;
    /** Minimum overscan rows — the adaptive algorithm never goes below this. Defaults to 3. */
    overscanRowCount?: number;
    /**
     * Number of scrolling (center) rows. A change re-arms `onRowsScrollEnd` and re-checks whether
     * the end of the rows is in view (e.g. the first page does not fill the viewport).
     */
    rowCount?: number;
    /** The viewport grows to its content and never scrolls itself: only scroll events can signal the end. */
    autoHeight?: boolean;
}

export interface UseGridScrollSyncResult {
    scrollTop: number;
    scrollLeft: number;
    /** Overscan row count: the velocity-based value, never below `overscanRowCount`. */
    overscanRows: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
    /**
     * Callback ref for the viewport element. When the viewport remounts (list view switched off
     * again), the last scroll position is restored onto the new element so the render window and
     * the DOM agree.
     */
    attachViewport: (element: HTMLDivElement | null) => void;
}

/** Maps scroll velocity (px/ms) to an overscan row count. */
function velocityToOverscan(velocity: number): number {
    if (velocity < 0.5) return 3;
    if (velocity < 3) return 5;
    if (velocity < 15) return 12;
    if (velocity < 40) return 20;
    return 30;
}

export function useGridScrollSync(params: UseGridScrollSyncParams): UseGridScrollSyncResult {
    const { onRowsScrollEnd, overscanRowCount = 3, rowCount = 0, autoHeight = false } = params;

    const pendingRef = useRef({ scrollTop: 0, scrollLeft: 0, velocity: 0 });
    const prevRef    = useRef({ scrollTop: 0, scrollLeft: 0, time: 0 });
    const rafRef     = useRef<number | null>(null);
    const decayRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);
    /** Cleared when onRowsScrollEnd fires; set again once the viewport leaves the threshold or the rows change. */
    const armedRef   = useRef(true);
    const onRowsScrollEndRef = useRef(onRowsScrollEnd);

    // velocityOverscan is 0 at rest; the prop floor is applied during render, so a new
    // overscanRowCount takes effect without waiting for a scroll.
    const [scrollState, setScrollState] = useState({ scrollTop: 0, scrollLeft: 0, velocityOverscan: 0 });

    useEffect(() => {
        onRowsScrollEndRef.current = onRowsScrollEnd;
    }, [onRowsScrollEnd]);

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (decayRef.current !== null) clearTimeout(decayRef.current);
        };
    }, []);

    /** Fires onRowsScrollEnd once per arrival within the threshold of the end. */
    const checkRowsScrollEnd = useCallback((target: HTMLElement) => {
        const endParams = getRowsScrollEndParams(target);
        if (!endParams) {
            armedRef.current = true;
            return;
        }
        if (!armedRef.current) return;
        const callback = onRowsScrollEndRef.current;
        if (!callback) return;
        armedRef.current = false;
        callback(endParams);
    }, []);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const now = performance.now();

        // Velocity: total positional delta / elapsed time (px/ms)
        const deltaPos = Math.abs(target.scrollTop  - prevRef.current.scrollTop)
                       + Math.abs(target.scrollLeft - prevRef.current.scrollLeft);
        const deltaTime = now - prevRef.current.time;
        const velocity = deltaTime > 0 ? deltaPos / deltaTime : 0;
        const movedVertically = target.scrollTop !== prevRef.current.scrollTop;

        prevRef.current = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft, time: now };
        pendingRef.current = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft, velocity };

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const { scrollTop, scrollLeft, velocity: v } = pendingRef.current;
            setScrollState({ scrollTop, scrollLeft, velocityOverscan: velocityToOverscan(v) });
        });

        // Decay back to the minimum overscan 200ms after scrolling stops
        if (decayRef.current !== null) clearTimeout(decayRef.current);
        decayRef.current = setTimeout(() => {
            decayRef.current = null;
            setScrollState(prev => (prev.velocityOverscan === 0 ? prev : { ...prev, velocityOverscan: 0 }));
        }, 200);

        // Horizontal-only scrolling never reaches (or leaves) the end of the rows.
        if (movedVertically) checkRowsScrollEnd(target);
    }, [checkRowsScrollEnd]);

    // New rows re-arm the callback; if the end is still in view (the rows do not fill the
    // viewport), no scroll event can happen, so check here.
    useEffect(() => {
        armedRef.current = true;
        const el = elementRef.current;
        if (!el || autoHeight || rowCount <= 0 || el.clientHeight === 0) return;
        checkRowsScrollEnd(el);
    }, [rowCount, autoHeight, checkRowsScrollEnd]);

    const attachViewport = useCallback((element: HTMLDivElement | null) => {
        elementRef.current = element;
        if (!element) return;
        const { scrollTop, scrollLeft } = pendingRef.current;
        if (scrollTop === 0 && scrollLeft === 0) return;
        element.scrollTop = scrollTop;
        element.scrollLeft = scrollLeft;
        // The browser clamps to the new content. If it did, sync the state to what the element
        // shows (no scroll event fires when the position ends up unchanged).
        const actual = { scrollTop: element.scrollTop, scrollLeft: element.scrollLeft };
        if (actual.scrollTop !== scrollTop || actual.scrollLeft !== scrollLeft) {
            pendingRef.current = { ...pendingRef.current, ...actual };
            prevRef.current = { ...prevRef.current, ...actual };
            setScrollState(prev => ({ ...prev, ...actual }));
        }
    }, []);

    return {
        scrollTop:    scrollState.scrollTop,
        scrollLeft:   scrollState.scrollLeft,
        overscanRows: Math.max(scrollState.velocityOverscan, overscanRowCount),
        handleScroll,
        attachViewport,
    };
}
