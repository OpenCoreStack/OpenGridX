import { useCallback, useMemo, useState } from 'react';
import { useDetailPanelHeights } from '../features/useDetailPanelHeights';
import { getDetailPanelRowIds } from '../../utils/detailPanel';
import type { GridRowId, GridRowMeta } from '../../types';

export interface UseGridDetailPanelParams {
    /** Whether `getDetailPanelContent` was passed: the grid then has an expand column. */
    hasDetailPanel: boolean;
    /** `detailPanelExpandedRowIds` prop (controlled when defined). */
    controlledExpandedRowIds: Set<GridRowId> | undefined;
    onDetailPanelExpandedRowIdsChange: ((expandedRowIds: Set<GridRowId>) => void) | undefined;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
}

export interface UseGridDetailPanelResult {
    hasDetailPanel: boolean;
    /** What renders and is laid out: synthetic group rows never show a detail panel. */
    expandedRowIds: Set<GridRowId>;
    handleDetailPanelToggle: (rowId: GridRowId) => void;
    /** Measured heights of `'auto'` panels. */
    detailPanelHeights: Map<GridRowId, number>;
    reportDetailPanelHeight: (rowId: GridRowId, height: number) => void;
}

/** Detail-panel expansion (controlled or uncontrolled) and the measured heights of `'auto'` panels. */
export function useGridDetailPanel(params: UseGridDetailPanelParams): UseGridDetailPanelResult {
    const { hasDetailPanel, controlledExpandedRowIds, onDetailPanelExpandedRowIdsChange, rowMetaMap } = params;

    const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<Set<GridRowId>>(new Set());
    const requestedExpandedRowIds = controlledExpandedRowIds ?? internalExpandedRowIds;
    const expandedRowIds = useMemo(() => getDetailPanelRowIds(requestedExpandedRowIds, rowMetaMap), [requestedExpandedRowIds, rowMetaMap]);

    const handleDetailPanelToggle = useCallback((rowId: GridRowId) => {
        // Synthetic group / subtotal rows have no detail panel (keyboard Space on the expand cell lands here too).
        if (rowMetaMap.get(rowId)?.isGroupRow) return;
        const newExpandedRowIds = new Set(requestedExpandedRowIds);
        if (newExpandedRowIds.has(rowId)) {
            newExpandedRowIds.delete(rowId);
        } else {
            newExpandedRowIds.add(rowId);
        }
        if (controlledExpandedRowIds === undefined) {
            setInternalExpandedRowIds(newExpandedRowIds);
        }
        onDetailPanelExpandedRowIdsChange?.(newExpandedRowIds);
    }, [requestedExpandedRowIds, rowMetaMap, controlledExpandedRowIds, onDetailPanelExpandedRowIdsChange]);

    const { detailPanelHeights, reportDetailPanelHeight } = useDetailPanelHeights();

    return { hasDetailPanel, expandedRowIds, handleDetailPanelToggle, detailPanelHeights, reportDetailPanelHeight };
}
