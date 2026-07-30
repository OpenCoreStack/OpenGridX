import { useState, useMemo, useCallback, useEffect } from 'react';
import { useColumnReorder } from '../useColumnReorder';
import { ExpandIcon } from '../../components/ui/ExpandIcon';
import type {
    GridColDef,
    GridRowModel,
    GridRowId,
    GridColumnOrderChangeParams,
    GridRenderCellParams,
} from '../../types';
import type { GridInitialState } from '../../state/types';

interface HierarchyHandlers {
    toggleExpansion: (id: GridRowId) => void;
}

export interface UseGridColumnsParams<R extends GridRowModel> {
    activeColumns: GridColDef<R>[];
    isHierarchyEnabled: boolean;
    isRowGrouping: boolean;
    isTreeData: boolean;
    activeHierarchyHandlers: HierarchyHandlers | null;
    columnVisibilityModel: Record<string, boolean>;
    columnOrder?: string[];
    onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
    disableColumnReorder: boolean;
    pivotMode: boolean;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    initialState?: GridInitialState;
    setColumns: (cols: GridColDef[]) => void;
}

export interface UseGridColumnsResult<R extends GridRowModel> {
    effectiveColumns: GridColDef<R>[];
    orderedColumns: GridColDef<R>[];
    visibleOrderedColumns: GridColDef<R>[];
    navigationColumns: Array<GridColDef<R> | { field: string }>;
    columnWidths: Record<string, number>;
    effectiveColumnOrder: string[];
    setInternalColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
    columnReorderHandlers: ReturnType<typeof useColumnReorder>;
    handleColumnResize: (field: string, newWidth: number) => void;
}

export function useGridColumns<R extends GridRowModel>(
    params: UseGridColumnsParams<R>
): UseGridColumnsResult<R> {
    const {
        activeColumns,
        isHierarchyEnabled,
        isRowGrouping,
        isTreeData,
        activeHierarchyHandlers,
        columnVisibilityModel,
        columnOrder,
        onColumnOrderChange,
        disableColumnReorder,
        pivotMode,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        initialState,
        setColumns,
    } = params;

    // ── Effective columns (hierarchy cell renderer injection) ─────────────────
    const effectiveColumns = useMemo<GridColDef<R>[]>(() => {
        if (!isHierarchyEnabled) return activeColumns;

        return activeColumns.map((col, index) => {
            if (index === 0) {
                return {
                    ...col,
                    renderCell: (cellParams: GridRenderCellParams<R>) => {
                        const r = cellParams.row as Record<string, unknown>;
                        const depth = typeof r._treeDepth === 'number' ? r._treeDepth : 0;
                        const hasChildren = Boolean(r._hasChildren);
                        const isExpanded = Boolean(r._isExpanded);
                        const groupingField = typeof r._groupingField === 'string' ? r._groupingField : undefined;
                        const groupingValue = r._groupingValue;
                        const descendantCount = typeof r._descendantCount === 'number' ? r._descendantCount : undefined;
                        const isGroupRow = Boolean(r._isGroupRow);

                        let content: React.ReactNode = col.renderCell ? col.renderCell(cellParams) : cellParams.value as React.ReactNode;

                        if (isTreeData && hasChildren && isGroupRow) {
                            content = (
                                <div className="ogx__group-cell-content">
                                    {cellParams.value as React.ReactNode}
                                    {descendantCount !== undefined && descendantCount > 0 ? ` (${descendantCount})` : ''}
                                </div>
                            );
                        }

                        if (isRowGrouping && hasChildren && groupingField) {
                            content = (
                                <div className="ogx__group-cell-content">
                                    {col.field === groupingField ? '' : `${groupingField}: `}
                                    {String(groupingValue)}
                                    {descendantCount !== undefined ? ` (${descendantCount})` : ''}
                                </div>
                            );
                        }

                        return (
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: depth * 24, width: '100%', height: '100%' }}>
                                <div style={{ marginRight: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', flexShrink: 0 }}>
                                    {hasChildren ? (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); activeHierarchyHandlers?.toggleExpansion(cellParams.row.id); }}
                                            onMouseDown={(e) => { e.stopPropagation(); }}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                                        >
                                            <ExpandIcon
                                                isExpanded={isExpanded}
                                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); activeHierarchyHandlers?.toggleExpansion(cellParams.row.id); }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content}</div>
                            </div>
                        );
                    }
                };
            }

            return {
                ...col,
                renderCell: (cellParams: GridRenderCellParams<R>) => {
                    const r = cellParams.row as Record<string, unknown>;
                    const hasChildren = Boolean(r._hasChildren);
                    const groupingField = typeof r._groupingField === 'string' ? r._groupingField : undefined;

                    if (isRowGrouping && hasChildren) {
                        if (col.field === groupingField) return null;
                        if (cellParams.value !== undefined && cellParams.value !== null) {
                            return col.renderCell ? col.renderCell(cellParams) : cellParams.value;
                        }
                        return null;
                    }

                    return col.renderCell ? col.renderCell(cellParams) : cellParams.value;
                }
            };
        }) as GridColDef<R>[];
    }, [activeColumns, isHierarchyEnabled, isRowGrouping, isTreeData, activeHierarchyHandlers]);

    // ── Column widths ─────────────────────────────────────────────────────────
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        () => initialState?.columns?.columnWidths ?? {}
    );

    const handleColumnResize = useCallback((field: string, newWidth: number) => {
        setColumnWidths(prev => ({ ...prev, [field]: newWidth }));
    }, []);

    // ── Column order ──────────────────────────────────────────────────────────
    const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(
        () => initialState?.columns?.columnOrder ?? activeColumns.map(col => col.field)
    );

    const effectiveColumnOrder = columnOrder ?? internalColumnOrder;

    useEffect(() => {
        setColumns(activeColumns as unknown as GridColDef[]);
    }, [activeColumns, setColumns]);

    useEffect(() => {
        if (pivotMode) {
            setInternalColumnOrder(activeColumns.map(col => col.field));
        }
    }, [pivotMode, activeColumns]);

    // ── Ordered / visible columns ─────────────────────────────────────────────
    const orderedColumns = useMemo<GridColDef<R>[]>(() => {
        if (disableColumnReorder) return effectiveColumns;

        const orderMap = new Map(effectiveColumnOrder.map((field, idx) => [field, idx]));
        return [...effectiveColumns].sort((a, b) => {
            const ai = orderMap.get(a.field) ?? effectiveColumns.indexOf(a);
            const bi = orderMap.get(b.field) ?? effectiveColumns.indexOf(b);
            return ai - bi;
        });
    }, [effectiveColumns, effectiveColumnOrder, disableColumnReorder]);

    const visibleOrderedColumns = useMemo<GridColDef<R>[]>(
        () => orderedColumns.filter(col => columnVisibilityModel[col.field] !== false),
        [orderedColumns, columnVisibilityModel]
    );

    // ── Column reorder handlers ───────────────────────────────────────────────
    const columnReorderHandlers = useColumnReorder({
        columns: orderedColumns,
        onColumnOrderChange: useCallback((reorderParams: GridColumnOrderChangeParams) => {
            const { oldIndex, targetIndex } = reorderParams;
            const newOrder = [...effectiveColumnOrder];
            const [movedField] = newOrder.splice(oldIndex, 1);
            newOrder.splice(targetIndex, 0, movedField);
            if (!columnOrder) setInternalColumnOrder(newOrder);
            onColumnOrderChange?.(reorderParams);
        }, [effectiveColumnOrder, columnOrder, onColumnOrderChange]),
        disableColumnReorder,
    });

    // ── Navigation columns (system cols + data cols for keyboard nav) ─────────
    const navigationColumns = useMemo(() => {
        const specials: { field: string }[] = [];
        if (rowReordering)    specials.push({ field: '__reorder_col__' });
        if (hasDetailPanel)   specials.push({ field: '__expand_col__' });
        if (checkboxSelection) specials.push({ field: '__checkbox_col__' });
        return [...specials, ...orderedColumns] as Array<GridColDef<R> | { field: string }>;
    }, [orderedColumns, checkboxSelection, hasDetailPanel, rowReordering]);

    return {
        effectiveColumns,
        orderedColumns,
        visibleOrderedColumns,
        navigationColumns,
        columnWidths,
        effectiveColumnOrder,
        setInternalColumnOrder,
        columnReorderHandlers,
        handleColumnResize,
    };
}
