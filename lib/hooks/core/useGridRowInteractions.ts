import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useGridRowSelection, type UseGridRowSelectionReturn } from './useGridRowSelection';
import { PIVOT_GRAND_TOTAL_ID } from '../../utils/pivot';
import { isSyntheticRowId } from '../../utils/syntheticRows';
import type { GridRowId, GridRowMeta, GridRowModel, GridRowParams } from '../../types';
import { getRowIndex } from '../../utils/rowIndex';

export interface UseGridRowInteractionsParams<R extends GridRowModel> {
    /** Data rows that pass the filter (pinned included, synthetic group rows excluded). */
    dataRows: R[];
    getRowId: (row: GridRowModel) => GridRowId;
    isPivotActive: boolean;
    selectedRowIds: ReadonlySet<GridRowId>;
    onSelectionModelChange: (model: GridRowId[]) => void;
    disableMultipleRowSelection: boolean;
    disableRowSelectionOnClick: boolean;
    isHierarchyEnabled: boolean;
    rowMetaMap: ReadonlyMap<GridRowId, GridRowMeta>;
    /** The active tree-data / row-grouping handlers, if any. */
    activeHierarchyHandlers: { toggleExpansion: (id: GridRowId) => void } | null;
    onRowClick: ((params: GridRowParams<R>) => void) | undefined;
}

export interface UseGridRowInteractionsResult<R extends GridRowModel> {
    rowSelection: UseGridRowSelectionReturn;
    /** Row click (and keyboard row activation). */
    handleRowClick: (params: GridRowParams<R>) => void;
    /** Row checkbox / Space key. */
    handleSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
}

/** Row selection and the row-level click / checkbox handlers. */
export function useGridRowInteractions<R extends GridRowModel>(
    params: UseGridRowInteractionsParams<R>
): UseGridRowInteractionsResult<R> {
    const {
        dataRows, getRowId, isPivotActive, selectedRowIds, onSelectionModelChange, disableMultipleRowSelection,
        disableRowSelectionOnClick, isHierarchyEnabled, rowMetaMap, activeHierarchyHandlers, onRowClick,
    } = params;

    // Select-all acts on, and the header checkbox reflects, the data rows that pass the
    // filter: never rows hidden by it, synthetic group rows, the pivot grand total, or stale
    // ids in the selection.
    const selectableRowIds = useMemo(() => {
        const { rowIds: ids } = getRowIndex(dataRows, getRowId, 'data');
        return isPivotActive ? ids.filter(id => id !== PIVOT_GRAND_TOTAL_ID) : ids;
    }, [dataRows, getRowId, isPivotActive]);
    const rowSelection = useGridRowSelection({
        selectedRowIds,
        onSelectionModelChange,
        disableMultipleRowSelection,
        selectableRowIds,
    });

    // Depend on the selection callbacks, not the object around them (a new one each render), so the
    // handlers keep their identity and memoised rows do not re-render.
    const { clickRow, toggleRow } = rowSelection;

    const rowClick = useCallback((rowParams: GridRowParams<R>) => {
        const { id } = rowParams;

        // Synthetic group rows toggle on click and are never selected. Tree-data parents are real rows:
        // they fire onRowClick and select like any row, and expand through their chevron.
        const rowMeta = isHierarchyEnabled ? rowMetaMap.get(id) : undefined;
        if (rowMeta?.isGroupRow) {
            if (rowMeta.hasChildren) activeHierarchyHandlers?.toggleExpansion(id);
            return;
        }

        onRowClick?.(rowParams);

        // The pivot Grand Total is clickable (onRowClick) but, like any synthetic row, not selectable.
        if (!disableRowSelectionOnClick && !isSyntheticRowId(id, rowMetaMap)) {
            clickRow(id);
        }
    }, [isHierarchyEnabled, activeHierarchyHandlers, onRowClick, rowMetaMap, disableRowSelectionOnClick, clickRow]);

    // Honors disableMultipleRowSelection like a row click does. Synthetic group / subtotal rows
    // and the pivot Grand Total are not data: their ids never enter the selection model.
    const selectionChange = useCallback((rowId: GridRowId, isSelected: boolean) => {
        if (isSyntheticRowId(rowId, rowMetaMap)) return;
        toggleRow(rowId, isSelected);
    }, [rowMetaMap, toggleRow]);

    // Rows receive these handlers and are memoised on their props: stable identities (reading the
    // latest handlers at event time) keep a selection change from re-rendering every visible row.
    const latestRef = useRef({ rowClick, selectionChange });
    useLayoutEffect(() => { latestRef.current = { rowClick, selectionChange }; });
    const handleRowClick = useCallback((rowParams: GridRowParams<R>) => latestRef.current.rowClick(rowParams), []);
    const handleSelectionChange = useCallback(
        (rowId: GridRowId, isSelected: boolean) => latestRef.current.selectionChange(rowId, isSelected),
        []
    );

    return { rowSelection, handleRowClick, handleSelectionChange };
}
