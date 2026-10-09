import { useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { canReorderWithinColumnGroups } from '../../utils/columnGroups';
import type {
    DataGridProps,
    GridAggregationModel,
    GridApi,
    GridColDef,
    GridColumnGroupingModel,
    GridColumnVisibilityModel,
    GridFilterModel,
    GridPivotModel,
    GridRowModel,
    GridToolbarSlotProps,
} from '../../types';

type ToolbarSlot = NonNullable<DataGridProps['slots']>['toolbar'];
type ToolbarSlotProps = NonNullable<DataGridProps['slotProps']>['toolbar'];

export interface UseGridToolbarPropsParams<R extends GridRowModel> {
    /** `slots.toolbar`: nothing is built without one. */
    toolbar: ToolbarSlot;
    /** `slotProps.toolbar`, merged over the grid's props. */
    toolbarSlotProps: ToolbarSlotProps;
    apiRef: MutableRefObject<GridApi>;
    /** Columns in display order (`useGridColumns().orderedColumns`). */
    orderedColumns: GridColDef<R>[];
    /** The `columns` prop. */
    baseColumns: GridColDef<R>[];
    aggregationModel: GridAggregationModel;
    onAggregationModelChange: (model: GridAggregationModel) => void;
    /** The toolbar gets the pivot model only when the consumer uses the pivot (`pivotMode`, `pivotModel` or `onPivotModelChange`). */
    pivotMode: boolean;
    pivotModelProp: GridPivotModel | undefined;
    onPivotModelChangeProp: ((model: GridPivotModel) => void) | undefined;
    pivotModel: GridPivotModel;
    onPivotModelChange: (model: GridPivotModel) => void;
    filterModel: GridFilterModel;
    onFilterModelChange: (model: GridFilterModel) => void;
    columnVisibilityModel: GridColumnVisibilityModel;
    onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
    disableColumnReorder: boolean;
    columnGroupingModel: GridColumnGroupingModel | undefined;
    moveColumn: (fromField: string, toField: string) => void;
    resetColumnOrder: () => void;
    /** `useGridColumnsPanel().toolbarPanelRequested`. */
    forceColumnsOpen: boolean;
    onColumnsPanelClose: () => void;
    /** `aiAssistant` is set: the toolbar shows the Ask AI button. */
    aiAssistantEnabled?: boolean;
    aiAssistantOpen?: boolean;
    onAiAssistantToggle?: (trigger: HTMLElement | null) => void;
    aiAssistantLabel?: string;
}

/** The props the grid passes to `slots.toolbar`, or null when there is no toolbar slot. */
export function useGridToolbarProps<R extends GridRowModel>(
    params: UseGridToolbarPropsParams<R>
): (GridToolbarSlotProps & Record<string, unknown>) | null {
    const {
        toolbar, toolbarSlotProps, apiRef, orderedColumns, baseColumns, aggregationModel, onAggregationModelChange,
        pivotMode, pivotModelProp, onPivotModelChangeProp, pivotModel, onPivotModelChange, filterModel,
        onFilterModelChange, columnVisibilityModel, onColumnVisibilityModelChange, disableColumnReorder,
        columnGroupingModel, moveColumn, resetColumnOrder, forceColumnsOpen, onColumnsPanelClose,
        aiAssistantEnabled = false, aiAssistantOpen = false, onAiAssistantToggle, aiAssistantLabel,
    } = params;

    return useMemo(() => {
        if (!toolbar) return null;
        const reorderHandler = disableColumnReorder
            ? undefined
            : (fromField: string, toField: string) => {
                if (!canReorderWithinColumnGroups(columnGroupingModel, fromField, toField)) return;
                moveColumn(fromField, toField);
            };
        return {
            apiRef,
            columns: orderedColumns as unknown as GridColDef[],
            baseColumns: baseColumns as unknown as GridColDef[],
            aggregationModel,
            onAggregationModelChange,
            ...(pivotMode || pivotModelProp || onPivotModelChangeProp ? {
                pivotModel,
                onPivotModelChange,
            } : {}),
            filterModel,
            onFilterModelChange,
            columnVisibilityModel,
            onColumnVisibilityModelChange,
            onColumnReorder: reorderHandler,
            onColumnOrderReset: disableColumnReorder ? undefined : resetColumnOrder,
            forceColumnsOpen,
            onColumnsPanelClose,
            ...(aiAssistantEnabled && onAiAssistantToggle ? {
                onAiAssistantToggle,
                aiAssistantOpen,
                ...(aiAssistantLabel ? { aiAssistantLabel } : {}),
            } : {}),
            ...toolbarSlotProps,
        };
    }, [
        toolbar, disableColumnReorder, moveColumn, resetColumnOrder, orderedColumns, apiRef,
        baseColumns, aggregationModel, onAggregationModelChange, pivotMode,
        pivotModelProp, onPivotModelChangeProp, pivotModel, onPivotModelChange,
        filterModel, onFilterModelChange, columnVisibilityModel,
        onColumnVisibilityModelChange, forceColumnsOpen, onColumnsPanelClose, toolbarSlotProps, columnGroupingModel,
        aiAssistantEnabled, aiAssistantOpen, onAiAssistantToggle, aiAssistantLabel,
    ]);
}
