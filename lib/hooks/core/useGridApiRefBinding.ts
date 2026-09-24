import { useLayoutEffect } from 'react';
import type { MutableRefObject } from 'react';
import type { GridApi } from '../../types';

/**
 * Points the consumer's `apiRef` prop at the grid's live API. A layout effect, so the live API
 * is in place before the parent's layout effects run.
 */
export function useGridApiRefBinding(
    propApiRef: MutableRefObject<GridApi> | undefined,
    apiRef: MutableRefObject<GridApi>
): void {
    useLayoutEffect(() => {
        if (propApiRef) {
            propApiRef.current = apiRef.current;
        }
    }, [propApiRef, apiRef]);
}
