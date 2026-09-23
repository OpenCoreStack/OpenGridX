import { useState, useMemo, useCallback, useEffect } from 'react';
import { useColumnReorder } from '../useColumnReorder';
import { ExpandIcon } from '../../components/ui/ExpandIcon';
import { isColumnPinned } from '../../utils/pinning';
import type {
    GridColDef,
    GridRowModel,
    GridRowId,
    GridColumnOrderChangeParams,
    GridColumnPinning,
    GridRenderCellParams,
} from '../../types';
import type { GridInitialState } from '../../state/types';

interface HierarchyHandlers {
    toggleExpansion: (id: GridRowId) => void;
}

// Injected hierarchy renderers replace the plain-cell path in Cell, so they must
// render the formatted value themselves or valueFormatter is silently lost.
const displayValue = <R extends GridRowModel>(cellParams: GridRenderCellParams<R>): React.ReactNode =>
    cellParams.formattedValue ?? (cellParams.value as React.ReactNode);

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
    pinnedColumns?: GridColumnPinning;
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
        pinnedColumns,
    } = params;

    // ── Column order ──────────────────────────────────────────────────────────
    const naturalOrder = useMemo(() => activeColumns.map(col => col.field), [activeColumns]);

    // null = the columns' own order, until the user reorders. Deriving it (instead of snapshotting the
    // columns at mount) keeps it right when the grid mounts in pivot mode or the columns change.
    const [storedColumnOrder, setStoredColumnOrder] = useState<string[] | null>(
        () => initialState?.columns?.columnOrder ?? null
    );

    // Generated pivot columns keep an order of their own, so pivoting never rewrites the user's column
    // order, and a controlled `columnOrder` (which names source columns) does not apply to them. It
    // resets whenever the generated column set changes.
    const pivotColumnsKey = pivotMode ? naturalOrder.join('\u0000') : '';
    const [pivotOrderState, setPivotOrderState] = useState<{ key: string; order: string[] } | null>(null);
    const pivotColumnOrder = pivotOrderState && pivotOrderState.key === pivotColumnsKey ? pivotOrderState.order : naturalOrder;

    const internalColumnOrder = storedColumnOrder ?? naturalOrder;
    const effectiveColumnOrder = pivotMode ? pivotColumnOrder : (columnOrder ?? internalColumnOrder);

    const setInternalColumnOrder = useCallback<React.Dispatch<React.SetStateAction<string[]>>>((action) => {
        if (pivotMode) {
            setPivotOrderState(prev => {
                const base = prev && prev.key === pivotColumnsKey ? prev.order : naturalOrder;
                return { key: pivotColumnsKey, order: typeof action === 'function' ? action(base) : action };
            });
            return;
        }
        setStoredColumnOrder(prev => (typeof action === 'function' ? action(prev ?? naturalOrder) : action));
    }, [pivotMode, pivotColumnsKey, naturalOrder]);

    // In pivot mode the row-label columns (marked hideable: false) always show: the pivot rows are
    // labelled by them, and they share their field with the source column a visibility model may hide.
    const isColumnShown = useCallback(
        (col: GridColDef<R>) => (pivotMode && col.hideable === false) || columnVisibilityModel[col.field] !== false,
        [pivotMode, columnVisibilityModel],
    );

    // The expand toggle, indentation and group label go on the leftmost column actually
    // on screen, so hiding, reordering or pinning columns never strips group rows of them.
    // Mirrors the render order: left-pinned, then unpinned, then right-pinned.
    const hierarchyField = useMemo<string | undefined>(() => {
        if (!isHierarchyEnabled) return undefined;
        const orderIndex = new Map(effectiveColumnOrder.map((field, idx) => [field, idx]));
        const rank = (col: GridColDef<R>) => orderIndex.get(col.field) ?? activeColumns.indexOf(col);
        const ordered = disableColumnReorder ? activeColumns : [...activeColumns].sort((a, b) => rank(a) - rank(b));
        const pinRank = (col: GridColDef<R>) => {
            const side = isColumnPinned(col.field, pinnedColumns);
            return side === 'left' ? 0 : side === 'right' ? 2 : 1;
        };
        const onScreen = ordered
            .filter(col => columnVisibilityModel[col.field] !== false)
            .sort((a, b) => pinRank(a) - pinRank(b));
        return (onScreen[0] ?? activeColumns[0])?.field;
    }, [isHierarchyEnabled, effectiveColumnOrder, activeColumns, disableColumnReorder, columnVisibilityModel, pinnedColumns]);

    // ── Effective columns (hierarchy cell renderer injection) ─────────────────
    const effectiveColumns = useMemo<GridColDef<R>[]>(() => {
        if (!isHierarchyEnabled) return activeColumns;

        return activeColumns.map((col) => {
            if (col.field === hierarchyField) {
                return {
                    ...col,
                    renderCell: (cellParams: GridRenderCellParams<R>) => {
                        const meta = cellParams.rowMeta;
                        const depth = meta?.treeDepth ?? 0;
                        const hasChildren = Boolean(meta?.hasChildren);
                        const isExpanded = Boolean(meta?.isExpanded);
                        const groupingField = meta?.groupingField;
                        const groupingValue = meta?.groupingValue;
                        const descendantCount = meta?.descendantCount;
                        const isGroupRow = Boolean(meta?.isGroupRow);

                        let content: React.ReactNode = col.renderCell ? col.renderCell(cellParams) : displayValue(cellParams);

                        if (isTreeData && hasChildren && isGroupRow) {
                            content = (
                                <div className="ogx__group-cell-content">
                                    {cellParams.value as React.ReactNode}
                                    {descendantCount !== undefined && descendantCount > 0 ? ` (${descendantCount})` : ''}
                                </div>
                            );
                        }

                        if (isRowGrouping && hasChildren && groupingField) {
                            const groupLabel = meta?.groupLabel ?? `${groupingField}: ${String(groupingValue)}`;
                            content = (
                                <div className="ogx__group-cell-content">
                                    {groupLabel}
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
                    const meta = cellParams.rowMeta;
                    const hasChildren = Boolean(meta?.hasChildren);
                    const groupingField = meta?.groupingField;

                    if (isRowGrouping && hasChildren) {
                        if (col.field === groupingField) return null;
                        if (cellParams.value !== undefined && cellParams.value !== null) {
                            return col.renderCell ? col.renderCell(cellParams) : displayValue(cellParams);
                        }
                        return null;
                    }

                    return col.renderCell ? col.renderCell(cellParams) : displayValue(cellParams);
                }
            };
        }) as GridColDef<R>[];
    }, [activeColumns, isHierarchyEnabled, isRowGrouping, isTreeData, activeHierarchyHandlers, hierarchyField]);

    // ── Column widths ─────────────────────────────────────────────────────────
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        () => initialState?.columns?.columnWidths ?? {}
    );

    const handleColumnResize = useCallback((field: string, newWidth: number) => {
        setColumnWidths(prev => ({ ...prev, [field]: newWidth }));
    }, []);

    useEffect(() => {
        setColumns(activeColumns as unknown as GridColDef[]);
    }, [activeColumns, setColumns]);

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
        () => orderedColumns.filter(isColumnShown),
        [orderedColumns, isColumnShown]
    );

    // ── Column reorder handlers ───────────────────────────────────────────────
    const columnReorderHandlers = useColumnReorder({
        columns: orderedColumns,
        onColumnOrderChange: useCallback((reorderParams: GridColumnOrderChangeParams) => {
            const { oldIndex, targetIndex } = reorderParams;
            const newOrder = [...effectiveColumnOrder];
            const [movedField] = newOrder.splice(oldIndex, 1);
            newOrder.splice(targetIndex, 0, movedField);
            if (pivotMode || !columnOrder) setInternalColumnOrder(newOrder);
            onColumnOrderChange?.(reorderParams);
        }, [effectiveColumnOrder, pivotMode, columnOrder, setInternalColumnOrder, onColumnOrderChange]),
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
