import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { getMaxElementHeight } from '../../utils/maxElementHeight';

/**
 * The tallest element this browser lays out (see `getMaxElementHeight`), measured once per document after
 * mount: `undefined` until measured, `Infinity` where there is no layout engine (jsdom, SSR).
 */
export function useGridMaxContentHeight(containerRef: RefObject<HTMLElement | null>): number | undefined {
    const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
    useLayoutEffect(() => {
        const measured = getMaxElementHeight(containerRef.current?.ownerDocument);
        setMaxHeight(prev => (prev === measured ? prev : measured));
    }, [containerRef]);
    return maxHeight;
}
