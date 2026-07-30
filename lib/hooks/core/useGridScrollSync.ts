import { useRef, useState, useCallback, useEffect } from 'react';
import type { GridRowScrollEndParams } from '../../types';

export interface UseGridScrollSyncParams {
    onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;
}

export interface UseGridScrollSyncResult {
    scrollTop: number;
    scrollLeft: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function useGridScrollSync(params: UseGridScrollSyncParams): UseGridScrollSyncResult {
    const { onRowsScrollEnd } = params;

    const pendingScrollRef = useRef({ scrollTop: 0, scrollLeft: 0 });
    const scrollRafRef = useRef<number | null>(null);
    const [scrollPos, setScrollPos] = useState({ scrollTop: 0, scrollLeft: 0 });

    useEffect(() => {
        return () => {
            if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
        };
    }, []);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        pendingScrollRef.current = { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft };

        if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;
            setScrollPos(pendingScrollRef.current);
        });

        if (onRowsScrollEnd) {
            const { scrollTop, scrollHeight, clientHeight } = target;
            const scrollThreshold = 100;

            if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
                onRowsScrollEnd({
                    visibleTop: scrollTop,
                    visibleBottom: scrollTop + clientHeight,
                    viewportHeight: clientHeight,
                });
            }
        }
    }, [onRowsScrollEnd]);

    return { scrollTop: scrollPos.scrollTop, scrollLeft: scrollPos.scrollLeft, handleScroll };
}
