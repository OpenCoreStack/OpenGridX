import { useCallback, useState } from 'react';
import type { GridRowId } from '../../types';

export interface UseDetailPanelHeightsResult {
    /** Rendered heights of `'auto'` detail panels, by row id. Pass to `useLayout`. */
    detailPanelHeights: Map<GridRowId, number>;
    /** Stable callback the panels report their rendered height through. */
    reportDetailPanelHeight: (rowId: GridRowId, height: number) => void;
}

/**
 * Keeps the measured heights of `'auto'` detail panels, so the layout reserves what the panel
 * really renders at instead of a guess. A height is kept after its panel collapses or scrolls out
 * of the render window: it is the best estimate for the next time the panel is shown.
 */
export function useDetailPanelHeights(): UseDetailPanelHeightsResult {
    const [detailPanelHeights, setDetailPanelHeights] = useState<Map<GridRowId, number>>(() => new Map());

    const reportDetailPanelHeight = useCallback((rowId: GridRowId, height: number) => {
        setDetailPanelHeights(prev => {
            if (prev.get(rowId) === height) return prev;
            const next = new Map(prev);
            next.set(rowId, height);
            return next;
        });
    }, []);

    return { detailPanelHeights, reportDetailPanelHeight };
}
