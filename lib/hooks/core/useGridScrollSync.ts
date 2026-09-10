import { useRef, useState, useCallback, useEffect } from 'react';
import type { GridRowScrollEndParams } from '../../types';

export interface UseGridScrollSyncParams {
    onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;
    /** Minimum overscan rows — the adaptive algorithm never goes below this. Defaults to 3. */
    overscanRowCount?: number;
}

export interface UseGridScrollSyncResult {
    scrollTop: number;
    scrollLeft: number;
    /** Dynamically computed overscan row count based on current scroll velocity. */
    overscanRows: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

/** Maps scroll velocity (px/ms) to an overscan row count. */
function velocityToOverscan(velocity: number, minOverscan: number): number {
    let base: number;
    if (velocity < 0.5)      base = 3;
    else if (velocity < 3)   base = 5;
    else if (velocity < 15)  base = 12;
    else if (velocity < 40)  base = 20;
    else                     base = 30;
    return Math.max(base, minOverscan);
}

export function useGridScrollSync(params: UseGridScrollSyncParams): UseGridScrollSyncResult {
    const { onRowsScrollEnd, overscanRowCount = 3 } = params;

    const pendingRef = useRef({ scrollTop: 0, scrollLeft: 0, velocity: 0 });
    const prevRef    = useRef({ scrollTop: 0, scrollLeft: 0, time: 0 });
    const rafRef     = useRef<number | null>(null);
    const decayRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [scrollState, setScrollState] = useState({
        scrollTop: 0,
        scrollLeft: 0,
        overscanRows: overscanRowCount,
    });

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (decayRef.current !== null) clearTimeout(decayRef.current);
        };
    }, []);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const now = performance.now();

        // Velocity: total positional delta / elapsed time (px/ms)
        const deltaPos = Math.abs(target.scrollTop  - prevRef.current.scrollTop)
                       + Math.abs(target.scrollLeft - prevRef.current.scrollLeft);
        const deltaTime = now - prevRef.current.time;
        const velocity = deltaTime > 0 ? deltaPos / deltaTime : 0;

        prevRef.current = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft, time: now };
        pendingRef.current = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft, velocity };

        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const { scrollTop, scrollLeft, velocity: v } = pendingRef.current;
            setScrollState({
                scrollTop,
                scrollLeft,
                overscanRows: velocityToOverscan(v, overscanRowCount),
            });
        });

        // Decay back to the minimum overscan 200ms after scrolling stops
        if (decayRef.current !== null) clearTimeout(decayRef.current);
        decayRef.current = setTimeout(() => {
            decayRef.current = null;
            setScrollState(prev => ({ ...prev, overscanRows: overscanRowCount }));
        }, 200);

        if (onRowsScrollEnd) {
            const { scrollTop, scrollHeight, clientHeight } = target;
            if (scrollHeight - scrollTop - clientHeight < 100) {
                onRowsScrollEnd({
                    visibleTop: scrollTop,
                    visibleBottom: scrollTop + clientHeight,
                    viewportHeight: clientHeight,
                });
            }
        }
    }, [onRowsScrollEnd, overscanRowCount]);

    return {
        scrollTop:    scrollState.scrollTop,
        scrollLeft:   scrollState.scrollLeft,
        overscanRows: scrollState.overscanRows,
        handleScroll,
    };
}
