import { useEffect, useLayoutEffect, useRef } from 'react';
import type { GridPaginationModel } from '../../types';

export interface UseGridPageCorrectionParams {
    /** The pagination model the grid was given (controlled) or holds (uncontrolled). */
    paginationModel: GridPaginationModel;
    /** The page the row pipeline actually shows: the requested page clamped to the last page. */
    currentPage: number;
    /**
     * Whether the row count is settled. While data is loading, or while there are no rows at all
     * (rows not fetched yet), a clamp would throw away a restored page such as
     * `initialState.pagination`, so the model is only corrected once rows are present.
     */
    enabled: boolean;
    /** Stores the model when uncontrolled and calls `onPaginationModelChange`. */
    onPaginationModelChange: (model: GridPaginationModel) => void;
}

/**
 * When the rows shrink (new `rows`, a filter, collapsed tree nodes) the requested page can end up
 * past the last page. The row pipeline already renders the clamped page during render; this hook
 * reports the corrected model so the stored model, the consumer's state and later Previous/Next
 * navigation agree with what is on screen. Reporting a model is a side effect, so it runs in an
 * effect, keyed on the page numbers only: a consumer that passes a fresh model object every render
 * or ignores the callback is told once per change, not on every render.
 */
export function useGridPageCorrection({
    paginationModel,
    currentPage,
    enabled,
    onPaginationModelChange,
}: UseGridPageCorrectionParams): void {
    const latestRef = useRef({ paginationModel, onPaginationModelChange });
    useLayoutEffect(() => {
        latestRef.current = { paginationModel, onPaginationModelChange };
    });

    const requestedPage = paginationModel.page;

    useEffect(() => {
        if (!enabled || currentPage === requestedPage) return;
        const { paginationModel: model, onPaginationModelChange: notify } = latestRef.current;
        notify({ ...model, page: currentPage });
    }, [enabled, currentPage, requestedPage]);
}
