import { useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import type { GridRowScrollEndParams } from '../../types';
import { getRowsScrollEndParams } from '../../utils/scroll/scrollEnd';

/**
 * A scroll handler that calls `onRowsScrollEnd` once per arrival near the end of a row container.
 * It re-arms when the container leaves the threshold or `rowCount` changes (new rows loaded), so a
 * consumer that loads the next page from the callback is not flooded with calls while it loads.
 * The grid viewport has the same rule built into useGridScrollSync; the list view uses this hook.
 */
export function useRowsScrollEndLatch(
    onRowsScrollEnd: ((params: GridRowScrollEndParams) => void) | undefined,
    rowCount: number,
): ((event: React.UIEvent<HTMLElement>) => void) | undefined {
    const armedRef = useRef(true);
    const callbackRef = useRef(onRowsScrollEnd);

    useEffect(() => {
        callbackRef.current = onRowsScrollEnd;
    }, [onRowsScrollEnd]);

    useEffect(() => {
        armedRef.current = true;
    }, [rowCount]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
        const params = getRowsScrollEndParams(event.currentTarget);
        if (!params) {
            armedRef.current = true;
            return;
        }
        if (!armedRef.current) return;
        const callback = callbackRef.current;
        if (!callback) return;
        armedRef.current = false;
        callback(params);
    }, []);

    return onRowsScrollEnd ? handleScroll : undefined;
}
