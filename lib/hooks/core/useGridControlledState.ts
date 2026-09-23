import { useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import type {
    GridRowId,
    GridSortItem,
    GridFilterModel,
    GridColumnPinning,
    GridPaginationModel,
    GridAggregationModel,
    GridPivotModel,
} from '../../types';
import type { GridInitialState, GridDensityState } from '../../state/types';

export type GridDensity = GridDensityState['density'];

export interface UseGridControlledStateParams {
    initialState?: GridInitialState;

    sortModel?: GridSortItem[];
    onSortModelChange?: (model: GridSortItem[]) => void;

    filterModel?: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel) => void;

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
    /** Used to pick the uncontrolled default page size: 100 when offered, else the first option. */
    pageSizeOptions?: number[];

    rowSelectionModel?: GridRowId[];
    onRowSelectionModelChange?: (model: GridRowId[]) => void;

    density?: GridDensity;
}

export interface UseGridControlledStateReturn {
    // sort
    sortModel: GridSortItem[];
    isSortControlled: boolean;
    setInternalSortModel: React.Dispatch<React.SetStateAction<GridSortItem[]>>;
    /** Sets the internal model when uncontrolled and fires onSortModelChange. */
    handleSortModelChange: (model: GridSortItem[]) => void;

    // filter
    filterModel: GridFilterModel;
    isFilterControlled: boolean;
    /** Sets the internal model when uncontrolled and fires onFilterModelChange. */
    handleFilterModelChange: (model: GridFilterModel) => void;

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
    /** Sets the internal model when uncontrolled and fires onRowSelectionModelChange. */
    handleRowSelectionModelChange: (model: GridRowId[]) => void;
    /**
     * The model passed to `handleRowSelectionModelChange` since the last commit, or null when
     * there is none: a change made in this tick that has not rendered yet (read from
     * onRowSelectionModelChange or right after apiRef.selectRows). Stable identity.
     */
    getPendingRowSelectionModel: () => GridRowId[] | null;

    // density (prop, else initialState.density, else 'standard')
    density: GridDensity;
}

const EMPTY_PIVOT_MODEL: GridPivotModel = { rowFields: [], columnFields: [], valueFields: [] };
const DEFAULT_PAGE_SIZE = 100;

/** The uncontrolled page size must be one the page-size select can show. */
export function getDefaultPageSize(pageSizeOptions?: number[]): number {
    if (!pageSizeOptions || pageSizeOptions.length === 0 || pageSizeOptions.includes(DEFAULT_PAGE_SIZE)) {
        return DEFAULT_PAGE_SIZE;
    }
    return pageSizeOptions[0];
}

export function useGridControlledState(params: UseGridControlledStateParams): UseGridControlledStateReturn {
    const {
        initialState,
        sortModel: propSortModel,
        onSortModelChange,
        filterModel: propFilterModel,
        onFilterModelChange,
        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        columnVisibilityModel: propColumnVisibilityModel,
        onColumnVisibilityModelChange,
        pinnedColumns: propPinnedColumns,
        onPinnedColumnsChange,
        pivotModel: propPivotModel,
        onPivotModelChange,
        paginationModel: propPaginationModel,
        onPaginationModelChange,
        pageSizeOptions,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange,
        density: propDensity,
    } = params;

    // ── Sort ─────────────────────────────────────────────────────────────────
    const [internalSortModel, setInternalSortModel] = useState<GridSortItem[]>(
        () => initialState?.sorting?.sortModel ?? []
    );
    const isSortControlled = propSortModel !== undefined;
    const sortModel = isSortControlled ? propSortModel! : internalSortModel;

    const handleSortModelChange = useCallback((model: GridSortItem[]) => {
        if (!isSortControlled) setInternalSortModel(model);
        onSortModelChange?.(model);
    }, [isSortControlled, onSortModelChange]);

    // ── Filter ───────────────────────────────────────────────────────────────
    const [internalFilterModel, setInternalFilterModel] = useState<GridFilterModel>(
        () => initialState?.filter?.filterModel ?? { items: [] }
    );
    // `!= null` so a JS consumer's `filterModel={null}` behaves like "not passed", as before.
    const isFilterControlled = propFilterModel != null;
    const filterModel = isFilterControlled ? propFilterModel : internalFilterModel;

    const handleFilterModelChange = useCallback((model: GridFilterModel) => {
        if (!isFilterControlled) setInternalFilterModel(model);
        onFilterModelChange?.(model);
    }, [isFilterControlled, onFilterModelChange]);

    // ── Aggregation ──────────────────────────────────────────────────────────
    const isAggregationControlled = propAggregationModel !== undefined;
    const [internalAggregationModel, setInternalAggregationModel] = useState<GridAggregationModel>(
        () => propAggregationModel ?? {}
    );
    // Identity follows content: `aggregationModel={{ salary: 'sum' }}` is a new object on every parent
    // render, and the fetches and memos keyed on the model must not rerun for an unchanged model.
    const aggregationModelKey = JSON.stringify(isAggregationControlled ? propAggregationModel! : internalAggregationModel);
    const aggregationModel = useMemo<GridAggregationModel>(
        () => JSON.parse(aggregationModelKey) as GridAggregationModel,
        [aggregationModelKey],
    );

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
    const isPaginationControlled = propPaginationModel !== undefined;
    const [internalPaginationModel, setInternalPaginationModel] = useState<GridPaginationModel>(
        () => initialState?.pagination?.paginationModel ?? propPaginationModel ?? { page: 0, pageSize: getDefaultPageSize(pageSizeOptions) }
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

    // Cleared on every commit: the rendered model is current again (a controlled parent may
    // also have rejected the change).
    const pendingRowSelectionRef = useRef<GridRowId[] | null>(null);
    useLayoutEffect(() => {
        pendingRowSelectionRef.current = null;
    });
    const getPendingRowSelectionModel = useCallback(() => pendingRowSelectionRef.current, []);

    const handleRowSelectionModelChange = useCallback((model: GridRowId[]) => {
        pendingRowSelectionRef.current = model;
        if (!isSelectionControlled) setInternalRowSelectionModel(model);
        onRowSelectionModelChange?.(model);
    }, [isSelectionControlled, onRowSelectionModelChange]);

    // ── Density ──────────────────────────────────────────────────────────────
    // No built-in density UI exists, so there is no internal setter: the prop wins,
    // otherwise the persisted/initial density applies.
    const [initialDensity] = useState<GridDensity>(() => initialState?.density?.density ?? 'standard');
    const density = propDensity ?? initialDensity;

    return {
        sortModel: sortModel as GridSortItem[],
        isSortControlled,
        setInternalSortModel: setInternalSortModel as React.Dispatch<React.SetStateAction<GridSortItem[]>>,
        handleSortModelChange,

        filterModel,
        isFilterControlled,
        handleFilterModelChange,

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
        handleRowSelectionModelChange,
        getPendingRowSelectionModel,

        density,
    };
}
