import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { useGridScrollSync, type UseGridScrollSyncParams } from './useGridScrollSync';
import { useGridViewportSize } from './useGridViewportSize';

export interface UseGridViewportParams extends UseGridScrollSyncParams {
    /** Receives the viewport's measured content size. */
    setDimensions: (width: number, height: number) => void;
    /** Set to the mounted viewport element. */
    viewportRef: MutableRefObject<HTMLDivElement | null>;
}

export interface UseGridViewportResult {
    scrollTop: number;
    scrollLeft: number;
    overscanRows: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
    /**
     * Callback ref for the viewport: every viewport that mounts (list view switched off again)
     * is measured and gets its scroll position back.
     */
    setViewportElement: (el: HTMLDivElement | null) => void;
}

/** The grid viewport: scroll position and velocity overscan, size measurement, and its callback ref. */
export function useGridViewport(params: UseGridViewportParams): UseGridViewportResult {
    const { setDimensions, viewportRef, ...scrollParams } = params;

    const { scrollTop, scrollLeft, overscanRows, handleScroll, attachViewport } = useGridScrollSync(scrollParams);
    const observeViewportSize = useGridViewportSize(setDimensions);
    const setViewportElement = useCallback((el: HTMLDivElement | null) => {
        viewportRef.current = el;
        observeViewportSize(el);
        attachViewport(el);
    }, [viewportRef, observeViewportSize, attachViewport]);

    return { scrollTop, scrollLeft, overscanRows, handleScroll, setViewportElement };
}
