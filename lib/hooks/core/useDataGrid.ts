
import { useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import type {
  GridState,
  GridRowModel,
  GridColDef,
  GridRowId,
  GridSortItem,
  GridFilterModel,
  GridPaginationModel,
  GridColumnVisibilityModel,
  GridApi
} from '../../types';

type GridAction =
  | { type: 'SET_ROWS'; payload: GridRowModel[] | ((prev: GridRowModel[]) => GridRowModel[]); preserveRowCount?: boolean }
  | { type: 'SET_COLUMNS'; payload: GridColDef[] }
  | { type: 'SET_SORT_MODEL'; payload: GridSortItem[] }
  | { type: 'SET_FILTER_MODEL'; payload: GridFilterModel }
  | { type: 'SET_PAGINATION_MODEL'; payload: GridPaginationModel }
  | { type: 'SET_SELECTION'; payload: Set<GridRowId> }
  | { type: 'SET_SCROLL'; payload: { scrollTop: number; scrollLeft: number } }
  | { type: 'SET_DIMENSIONS'; payload: { viewportWidth: number; viewportHeight: number } }
  | { type: 'SET_DATASOURCE_LOADING'; payload: boolean }
  | { type: 'SET_DATASOURCE_ERROR'; payload: any }
  | { type: 'SET_ROW_COUNT'; payload: number };

function createInitialState(rows: GridRowModel[], columns: GridColDef[], columnVisibilityModel: GridColumnVisibilityModel = {}): GridState {
  const idRowsLookup = new Map<GridRowId, GridRowModel>();
  const allRows: GridRowId[] = [];

  rows.forEach(row => {
    const id = row.id;
    idRowsLookup.set(id, row);
    allRows.push(id);
  });

  const columnLookup = new Map<string, GridColDef>();
  const orderedFields: string[] = [];

  columns.forEach(col => {
    columnLookup.set(col.field, col);
    orderedFields.push(col.field);
  });

  return {
    rows: {
      idRowsLookup,
      allRows
    },
    columns: {
      all: columns,
      lookup: columnLookup,
      orderedFields,
      columnVisibilityModel
    },
    sorting: {
      sortModel: []
    },
    filter: {
      filterModel: { items: [] }
    },
    pagination: {
      paginationModel: { page: 0, pageSize: 100 },
      rowCount: rows.length
    },
    selection: {
      selectedRows: new Set()
    },
    pinning: {
      pinnedColumns: {},
      pinnedRows: {}
    },
    virtualization: {
      renderContext: {
        firstRowIndex: 0,
        lastRowIndex: 0,
        firstColumnIndex: 0,
        lastColumnIndex: 0
      },
      scrollTop: 0,
      scrollLeft: 0
    },
    dimensions: {
      rowHeight: 52,
      headerHeight: 56,
      viewportWidth: 0,
      viewportHeight: 0
    },
    dataSource: {
      loading: false,
      error: null
    }
  };
}

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_ROWS': {
      const currentRows = Array.from(state.rows.idRowsLookup.values());
      const newRows = typeof action.payload === 'function' 
        ? action.payload(currentRows)
        : action.payload;

      const idRowsLookup = new Map<GridRowId, GridRowModel>();
      const allRows: GridRowId[] = [];

      newRows.forEach(row => {
        idRowsLookup.set(row.id, row);
        allRows.push(row.id);
      });

      return {
        ...state,
        rows: { idRowsLookup, allRows },
        pagination: {
          ...state.pagination,
          // Only override rowCount when we're NOT in server mode (i.e. no preserveRowCount flag)
          // Server-side fetches set rowCount separately via SET_ROW_COUNT.
          rowCount: action.preserveRowCount ? state.pagination.rowCount : newRows.length
        }
      };
    }

    case 'SET_COLUMNS': {
      const columnLookup = new Map<string, GridColDef>();
      const orderedFields: string[] = [];

      action.payload.forEach(col => {
        columnLookup.set(col.field, col);
        orderedFields.push(col.field);
      });

      return {
        ...state,
        columns: {
          all: action.payload,
          lookup: columnLookup,
          orderedFields,
          columnVisibilityModel: {}
        }
      };
    }

    case 'SET_SORT_MODEL':
      return {
        ...state,
        sorting: { sortModel: action.payload }
      };

    case 'SET_FILTER_MODEL':
      return {
        ...state,
        filter: { filterModel: action.payload }
      };

    case 'SET_PAGINATION_MODEL':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          paginationModel: action.payload
        }
      };

    case 'SET_SELECTION':
      return {
        ...state,
        selection: { selectedRows: action.payload }
      };

    case 'SET_SCROLL':
      return {
        ...state,
        virtualization: {
          ...state.virtualization,
          scrollTop: action.payload.scrollTop,
          scrollLeft: action.payload.scrollLeft
        }
      };

    case 'SET_DIMENSIONS':
      return {
        ...state,
        dimensions: {
          ...state.dimensions,
          viewportWidth: action.payload.viewportWidth,
          viewportHeight: action.payload.viewportHeight
        }
      };

    case 'SET_DATASOURCE_LOADING':
      return {
        ...state,
        dataSource: {
          ...state.dataSource,
          loading: action.payload
        }
      };

    case 'SET_DATASOURCE_ERROR':
      return {
        ...state,
        dataSource: {
          ...state.dataSource,
          error: action.payload
        }
      };

    case 'SET_ROW_COUNT':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          rowCount: action.payload
        }
      };

    default:
      return state;
  }
}

export interface UseDataGridParams<R extends GridRowModel = GridRowModel> {
  rows: R[];
  columns: GridColDef<R>[];
  rowHeight?: number;
  headerHeight?: number;
  rowCount?: number;
  columnVisibilityModel?: GridColumnVisibilityModel;
  initialState?: import('../../state/types').GridInitialState;
}

export function useDataGrid<R extends GridRowModel = GridRowModel>(params: UseDataGridParams<R>) {
  const { rows, columns, rowHeight = 52, headerHeight = 56, columnVisibilityModel, initialState: propInitialState } = params;

  const internalInitialState = useMemo(
    () => createInitialState(rows, columns as any, columnVisibilityModel),
    [] 
  );

  const [state, dispatch] = useReducer(gridReducer, {
    ...internalInitialState,
    sorting: propInitialState?.sorting || internalInitialState.sorting,
    filter: propInitialState?.filter || internalInitialState.filter,
    dataSource: (propInitialState?.dataSource 
      ? { ...internalInitialState.dataSource, ...propInitialState.dataSource }
      : internalInitialState.dataSource) as any,
    pagination: {
      ...internalInitialState.pagination,
      ...(propInitialState?.pagination || {}),
      rowCount: params.rowCount ?? propInitialState?.pagination?.rowCount ?? internalInitialState.pagination.rowCount
    },
    dimensions: {
      ...internalInitialState.dimensions,
      rowHeight,
      headerHeight
    }
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync internal state when the external `rows` prop changes
  const prevRowsRef = useRef(rows);
  useEffect(() => {
    if (rows !== prevRowsRef.current) {
      prevRowsRef.current = rows;
      dispatch({ type: 'SET_ROWS', payload: rows as GridRowModel[] });
    }
  }, [rows]);

  const setRows = useCallback((rowsOrUpdater: GridRowModel[] | ((prev: GridRowModel[]) => GridRowModel[]), preserveRowCount?: boolean) => {
    dispatch({ type: 'SET_ROWS', payload: rowsOrUpdater, preserveRowCount });
  }, []);

  const setColumns = useCallback((newColumns: GridColDef[]) => {
    dispatch({ type: 'SET_COLUMNS', payload: newColumns });
  }, []);

  const setSortModel = useCallback((sortModel: GridSortItem[]) => {
    dispatch({ type: 'SET_SORT_MODEL', payload: sortModel });
  }, []);

  const setFilterModel = useCallback((filterModel: GridFilterModel) => {
    dispatch({ type: 'SET_FILTER_MODEL', payload: filterModel });
  }, []);

  const setPaginationModel = useCallback((paginationModel: GridPaginationModel) => {
    dispatch({ type: 'SET_PAGINATION_MODEL', payload: paginationModel });
  }, []);

  const setSelection = useCallback((selectedRows: Set<GridRowId>) => {
    dispatch({ type: 'SET_SELECTION', payload: selectedRows });
  }, []);

  const setScroll = useCallback((scrollTop: number, scrollLeft: number) => {
    dispatch({ type: 'SET_SCROLL', payload: { scrollTop, scrollLeft } });
  }, []);

  const setDimensions = useCallback((viewportWidth: number, viewportHeight: number) => {
    dispatch({ type: 'SET_DIMENSIONS', payload: { viewportWidth, viewportHeight } });
  }, []);

  const setDataSourceLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_DATASOURCE_LOADING', payload: loading });
  }, []);

  const setDataSourceError = useCallback((error: any) => {
    dispatch({ type: 'SET_DATASOURCE_ERROR', payload: error });
  }, []);

  const setRowCount = useCallback((count: number) => {
    dispatch({ type: 'SET_ROW_COUNT', payload: count });
  }, []);

  const apiRef = useRef<GridApi>({
    getRow: (id: GridRowId) => stateRef.current.rows.idRowsLookup.get(id) || null,
    getAllRows: () => Array.from(stateRef.current.rows.idRowsLookup.values()),
    getVisibleRows: () => Array.from(stateRef.current.rows.idRowsLookup.values()),
    getAggregationResult: () => null,
    getAggregationModel: () => null,
    getColumn: (field: string) => stateRef.current.columns.lookup.get(field) || null,
    getAllColumns: () => stateRef.current.columns.all,
    getVisibleColumns: () => stateRef.current.columns.all,
    selectRow: (id: GridRowId, isSelected = true) => {
      const newSelection = new Set(stateRef.current.selection.selectedRows);
      if (isSelected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      setSelection(newSelection);
    },
    selectRows: (ids: GridRowId[], isSelected = true) => {
      const newSelection = new Set(stateRef.current.selection.selectedRows);
      ids.forEach(id => {
        if (isSelected) {
          newSelection.add(id);
        } else {
          newSelection.delete(id);
        }
      });
      setSelection(newSelection);
    },
    getSelectedRows: () => Array.from(stateRef.current.selection.selectedRows),
    sortColumn: (field: string, direction) => {
      if (direction === null) {
        setSortModel(stateRef.current.sorting.sortModel.filter(item => item.field !== field));
      } else {
        const existingIndex = stateRef.current.sorting.sortModel.findIndex(item => item.field === field);
        if (existingIndex >= 0) {
          const newModel = [...stateRef.current.sorting.sortModel];
          newModel[existingIndex] = { field, sort: direction };
          setSortModel(newModel);
        } else {
          setSortModel([...stateRef.current.sorting.sortModel, { field, sort: direction }]);
        }
      }
    },
    getSortModel: () => stateRef.current.sorting.sortModel,
    setFilterModel,
    getFilterModel: () => stateRef.current.filter.filterModel,
    setPage: (page: number) => {
      setPaginationModel({ ...stateRef.current.pagination.paginationModel, page });
    },
    setPageSize: (pageSize: number) => {
      setPaginationModel({ ...stateRef.current.pagination.paginationModel, pageSize, page: 0 });
    },
    scrollToIndexes: () => {

    },
    copySelectedRows: () => Promise.resolve()
  });

  return {
    state,
    dispatch,
    apiRef,
    setRows,
    setColumns,
    setSortModel,
    setFilterModel,
    setPaginationModel,
    setSelection,
    setScroll,
    setDimensions,
    setDataSourceLoading,
    setDataSourceError,
    setRowCount
  };
}
