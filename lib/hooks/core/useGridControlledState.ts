import { useState, useCallback, useMemo } from 'react';
import type {
    GridRowId,
    GridSortItem,
    GridColumnPinning,
    GridPaginationModel,
    GridAggregationModel,
    GridPivotModel,
} from '../../types';
import type { GridInitialState } from '../../state/types';

export interface UseGridControlledStateParams {
    initialState?: GridInitialState;

    sortModel?: GridSortItem[];
    onSortModelChange?: (model: GridSortItem[]) => void;

    aggregationModel?: GridAggregationModel;
    onAggregationModelChange?: (model: GridAggregationModel) => void;

    columnVisibilityModel?: Record<string, boolean>;
    onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;

    pinnedColumns?: GridColumnPinning;
    onPinnedColumnsChange?: (model: GridColumnPinning) => void;

    pivotModel?: GridPivotModel;
    onPivotModelChange?: (model: GridPivotModel) => void;

    paginationModel?: GridPaginationModel;
    onPaginationModelChange?: (model: GridPaginationModel) => void;

    rowSelectionModel?: GridRowId[];
    onRowSelectionModelChange?: (model: GridRowId[]) => void;
}

export interface UseGridControlledStateReturn {
    // sort
    sortModel: GridSortItem[];
    isSortControlled: boolean;
    setInternalSortModel: React.Dispatch<React.SetStateAction<GridSortItem[]>>;

    // aggregation
    aggregationModel: GridAggregationModel;
    handleAggregationModelChange: (model: GridAggregationModel) => void;

    // column visibility
    columnVisibilityModel: Record<string, boolean>;
    handleColumnVisibilityModelChange: (model: Record<string, boolean>) => void;

    // pinned columns
    pinnedColumns: GridColumnPinning;
    handlePinnedColumnsChange: (model: GridColumnPinning) => void;

    // pivot
    currentPivotModel: GridPivotModel;
    handlePivotModelChange: (model: GridPivotModel) => void;

    // pagination
    effectivePaginationModel: GridPaginationModel;
    handlePaginationModelChange: (model: GridPaginationModel) => void;

    // selection
    rowSelectionModel: GridRowId[];
    selectedRowIds: Set<GridRowId>;
    isSelectionControlled: boolean;
    setInternalRowSelectionModel: React.Dispatch<React.SetStateAction<GridRowId[]>>;
}

const EMPTY_PIVOT_MODEL: GridPivotModel = { rowFields: [], columnFields: [], valueFields: [] };

export function useGridControlledState(params: UseGridControlledStateParams): UseGridControlledStateReturn {
    const {
        initialState,
        sortModel: propSortModel,
        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        columnVisibilityModel: propColumnVisibilityModel,
        onColumnVisibilityModelChange,
        pinnedColumns: propPinnedColumns,
        onPinnedColumnsChange,
        pivotModel: propPivotModel,
        onPivotModelChange,
        paginationModel: propPaginationModel = { page: 0, pageSize: 100 },
        onPaginationModelChange,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange,
    } = params;

    // ── Sort ─────────────────────────────────────────────────────────────────
    const [internalSortModel, setInternalSortModel] = useState<GridSortItem[]>(
        () => initialState?.sorting?.sortModel ?? []
    );
    const isSortControlled = propSortModel !== undefined;
    const sortModel = isSortControlled ? propSortModel! : internalSortModel;

    // ── Aggregation ──────────────────────────────────────────────────────────
    const isAggregationControlled = propAggregationModel !== undefined;
    const [internalAggregationModel, setInternalAggregationModel] = useState<GridAggregationModel>(
        () => propAggregationModel ?? {}
    );
    const aggregationModel = isAggregationControlled ? propAggregationModel! : internalAggregationModel;

    const handleAggregationModelChange = useCallback((model: GridAggregationModel) => {
        if (!isAggregationControlled) setInternalAggregationModel(model);
        onAggregationModelChange?.(model);
    }, [isAggregationControlled, onAggregationModelChange]);

    // ── Column visibility ────────────────────────────────────────────────────
    const isColumnVisibilityControlled = propColumnVisibilityModel !== undefined;
    const [internalColumnVisibilityModel, setInternalColumnVisibilityModel] = useState<Record<string, boolean>>(
        () => initialState?.columns?.columnVisibilityModel ?? {}
    );
    const columnVisibilityModel = isColumnVisibilityControlled
        ? propColumnVisibilityModel!
        : internalColumnVisibilityModel;

    const handleColumnVisibilityModelChange = useCallback((model: Record<string, boolean>) => {
        if (!isColumnVisibilityControlled) setInternalColumnVisibilityModel(model);
        onColumnVisibilityModelChange?.(model);
    }, [isColumnVisibilityControlled, onColumnVisibilityModelChange]);

    // ── Pinned columns ───────────────────────────────────────────────────────
    const isPinnedColumnsControlled = propPinnedColumns !== undefined;
    const [internalPinnedColumns, setInternalPinnedColumns] = useState<GridColumnPinning>(
        () => initialState?.columns?.pinnedColumns ?? {}
    );
    const pinnedColumns = isPinnedColumnsControlled ? propPinnedColumns! : internalPinnedColumns;

    const handlePinnedColumnsChange = useCallback((model: GridColumnPinning) => {
        if (!isPinnedColumnsControlled) setInternalPinnedColumns(model);
        onPinnedColumnsChange?.(model);
    }, [isPinnedColumnsControlled, onPinnedColumnsChange]);

    // ── Pivot ────────────────────────────────────────────────────────────────
    const [internalPivotModel, setInternalPivotModel] = useState<GridPivotModel>(
        () => propPivotModel ?? EMPTY_PIVOT_MODEL
    );
    const currentPivotModel = propPivotModel ?? internalPivotModel;

    const handlePivotModelChange = useCallback((model: GridPivotModel) => {
        setInternalPivotModel(model);
        onPivotModelChange?.(model);
    }, [onPivotModelChange]);

    // ── Pagination ───────────────────────────────────────────────────────────
    const isPaginationControlled = propPaginationModel !== undefined && params.paginationModel !== undefined;
    const [internalPaginationModel, setInternalPaginationModel] = useState<GridPaginationModel>(
        () => initialState?.pagination?.paginationModel ?? propPaginationModel
    );
    const effectivePaginationModel = isPaginationControlled ? propPaginationModel : internalPaginationModel;

    const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
        if (!isPaginationControlled) setInternalPaginationModel(newModel);
        onPaginationModelChange?.(newModel);
    }, [isPaginationControlled, onPaginationModelChange]);

    // ── Row selection ────────────────────────────────────────────────────────
    const isSelectionControlled = propRowSelectionModel !== undefined;
    const [internalRowSelectionModel, setInternalRowSelectionModel] = useState<GridRowId[]>([]);
    const rowSelectionModel = isSelectionControlled ? propRowSelectionModel! : internalRowSelectionModel;
    const selectedRowIds = useMemo(() => new Set(rowSelectionModel), [rowSelectionModel]);

    // onRowSelectionModelChange is consumed by the caller directly (they call it when selection changes)
    void onRowSelectionModelChange;

    return {
        sortModel: sortModel as GridSortItem[],
        isSortControlled,
        setInternalSortModel: setInternalSortModel as React.Dispatch<React.SetStateAction<GridSortItem[]>>,

        aggregationModel,
        handleAggregationModelChange,

        columnVisibilityModel,
        handleColumnVisibilityModelChange,

        pinnedColumns,
        handlePinnedColumnsChange,

        currentPivotModel,
        handlePivotModelChange,

        effectivePaginationModel,
        handlePaginationModelChange,

        rowSelectionModel,
        selectedRowIds,
        isSelectionControlled,
        setInternalRowSelectionModel,
    };
}
