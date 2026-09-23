
import { useReducer, useCallback, useState, useRef, useLayoutEffect } from 'react';
import type {
  GridInternalState as GridState,
  GridRowModel,
  GridColDef,
  GridRowId,
  GridColumnVisibilityModel,
  GridApi
} from '../../types';
import { createGridApiPlaceholder } from './gridApiPlaceholder';

// Sort, filter, pagination and selection deliberately have no slice here: they live in
// useGridControlledState, which is what the grid renders from. (Copies of them in this
// reducer used to drift from it, which made the imperative API a no-op.)
type GetRowId = (row: GridRowModel) => GridRowId;

type GridAction =
  | { type: 'SET_ROWS'; payload: GridRowModel[] | ((prev: GridRowModel[]) => GridRowModel[]); getRowId: GetRowId }
  | { type: 'REPLACE_ROW'; id: GridRowId; row: GridRowModel }
  | { type: 'SET_COLUMNS'; payload: GridColDef[] }
  | { type: 'SET_DIMENSIONS'; payload: { viewportWidth: number; viewportHeight: number } }
  | { type: 'SET_DATASOURCE_LOADING'; payload: boolean }
  | { type: 'SET_DATASOURCE_ERROR'; payload: unknown }
  | { type: 'SET_ROW_COUNT'; payload: number };

const defaultGetRowId: GetRowId = (row) => row.id;

// Rows are re-keyed on every rows change, so warn once rather than on every update.
let warnedDuplicateIds = false;

/**
 * Keys rows by getRowId(row). The row objects are stored as given (never copied or given an
 * `id` field), so `idByRow` maps each one back to its key. A row object the store already
 * holds keeps its key (`knownIds`), so a committed edit stored under the edited row's id stays
 * there even when the stored object does not resolve to that id itself. A duplicate id keeps
 * the first row, so a later row never silently replaces it (or renders twice), and warns once
 * in development.
 */
function buildRowsState(rows: GridRowModel[], getRowId: GetRowId, knownIds?: Map<GridRowModel, GridRowId>): GridState['rows'] {
  const idRowsLookup = new Map<GridRowId, GridRowModel>();
  const idByRow = new Map<GridRowModel, GridRowId>();
  const allRows: GridRowId[] = [];
  const duplicates: GridRowId[] = [];

  rows.forEach(row => {
    const id = knownIds?.get(row) ?? getRowId(row);
    if (idRowsLookup.has(id)) {
      duplicates.push(id);
      return;
    }
    idRowsLookup.set(id, row);
    idByRow.set(row, id);
    allRows.push(id);
  });

  if (duplicates.length > 0 && !warnedDuplicateIds && process.env.NODE_ENV !== 'production') {
    warnedDuplicateIds = true;
    console.warn(
      `[OpenGridX] ${duplicates.length} row(s) reuse the id of an earlier row and were ignored ` +
      `(ids: ${duplicates.slice(0, 5).map(String).join(', ')}${duplicates.length > 5 ? ', …' : ''}). ` +
      'Every row needs a unique id; pass getRowId if the unique key lives in another field.'
    );
  }

  return { idRowsLookup, allRows, idByRow };
}

function createInitialState<R extends GridRowModel>(rows: R[], getRowId: GetRowId, columns: GridColDef<R>[], columnVisibilityModel: GridColumnVisibilityModel = {}): GridState {
  const columnLookup = new Map<string, GridColDef>();
  const orderedFields: string[] = [];

  columns.forEach(col => {
    columnLookup.set(col.field, col as unknown as GridColDef);
    orderedFields.push(col.field);
  });

  return {
    rows: buildRowsState(rows, getRowId),
    columns: {
      all: columns as unknown as GridColDef[],
      lookup: columnLookup,
      orderedFields,
      columnVisibilityModel
    },
    pagination: {
      rowCount: undefined
    },
    pinning: {
      pinnedColumns: {},
      pinnedRows: {}
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
      const currentRows = state.rows.allRows.map(id => state.rows.idRowsLookup.get(id)!);
      const newRows = typeof action.payload === 'function'
        ? action.payload(currentRows)
        : action.payload;

      // pagination.rowCount is the server-reported total only (SET_ROW_COUNT). Client row
      // counts are derived from the rows the grid shows, so replacing rows never touches it.
      return {
        ...state,
        rows: buildRowsState(newRows, action.getRowId, state.rows.idByRow),
      };
    }

    case 'REPLACE_ROW': {
      // Stores a committed edit under the id of the row that was edited, in the current store.
      const previous = state.rows.idRowsLookup.get(action.id);
      if (previous === undefined) return state;
      const idRowsLookup = new Map(state.rows.idRowsLookup);
      idRowsLookup.set(action.id, action.row);
      const idByRow = new Map(state.rows.idByRow);
      idByRow.delete(previous);
      idByRow.set(action.row, action.id);
      return {
        ...state,
        rows: { ...state.rows, idRowsLookup, idByRow },
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
          columnVisibilityModel: state.columns.columnVisibilityModel
        }
      };
    }

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
  /** Keys the store. Read when rows are set; defaults to `row.id`. */
  getRowId?: (row: R) => GridRowId;
  columns: GridColDef<R>[];
  rowHeight?: number;
  headerHeight?: number;
  columnVisibilityModel?: GridColumnVisibilityModel;
  initialState?: import('../../state/types').GridInitialState;
  /**
   * When true (no dataSource owns the rows), the store follows the `rows` param: a new rows
   * array replaces the stored rows in the same render, so rows and the columns rendered
   * against them always change together.
   */
  syncRows?: boolean;
}

/**
 * The row store, plus dimensions and dataSource status. With `syncRows`, a new `rows` array
 * replaces the stored rows during render (never one commit later, which let new columns run
 * against the previous rows). Without it, `rows` only seeds the store and a dataSource fills
 * it through setRows.
 */
export function useDataGrid<R extends GridRowModel = GridRowModel>(params: UseDataGridParams<R>) {
  const { rows, columns, rowHeight = 52, headerHeight = 56, columnVisibilityModel, initialState: propInitialState, syncRows = false } = params;
  const getRowId = (params.getRowId ?? defaultGetRowId) as GetRowId;

  // Latest getRowId for dispatches from effects and event handlers. An inline getRowId
  // therefore never re-keys (or resets) the store by itself; new rows are keyed with it.
  const getRowIdRef = useRef(getRowId);
  useLayoutEffect(() => { getRowIdRef.current = getRowId; });

  const [internalInitialState] = useState(() =>
    createInitialState(rows, getRowId, columns, columnVisibilityModel)
  );

  const [state, dispatch] = useReducer(gridReducer, {
    ...internalInitialState,
    dataSource: propInitialState?.dataSource
      ? { ...internalInitialState.dataSource, ...propInitialState.dataSource }
      : internalInitialState.dataSource,
    pagination: {
      rowCount: propInitialState?.pagination?.rowCount,
    },
    dimensions: {
      ...internalInitialState.dimensions,
      rowHeight,
      headerHeight
    }
  });

  // The rows (and sync mode) the store was last filled from. Updating the store while
  // rendering makes React re-render before committing, so no commit pairs the columns of
  // this render with the rows of the previous one.
  const [syncedFrom, setSyncedFrom] = useState({ rows, syncRows });
  if (syncedFrom.rows !== rows || syncedFrom.syncRows !== syncRows) {
    setSyncedFrom({ rows, syncRows });
    if (syncRows) dispatch({ type: 'SET_ROWS', payload: rows, getRowId });
  }

  const stateRef = useRef(state);
  useLayoutEffect(() => { stateRef.current = state; });

  // `_preserveRowCount` is still accepted from callers written against the old signature;
  // replacing rows never changes the server row count any more.
  const setRows = useCallback((rowsOrUpdater: GridRowModel[] | ((prev: GridRowModel[]) => GridRowModel[]), _preserveRowCount?: boolean) => {
    dispatch({ type: 'SET_ROWS', payload: rowsOrUpdater, getRowId: getRowIdRef.current });
  }, []);

  /** Replaces the row stored under `id` (a committed edit); does nothing if that row is gone. */
  const replaceRow = useCallback((id: GridRowId, row: GridRowModel) => {
    dispatch({ type: 'REPLACE_ROW', id, row });
  }, []);

  const setColumns = useCallback((newColumns: GridColDef[]) => {
    dispatch({ type: 'SET_COLUMNS', payload: newColumns });
  }, []);

  const setDimensions = useCallback((viewportWidth: number, viewportHeight: number) => {
    dispatch({ type: 'SET_DIMENSIONS', payload: { viewportWidth, viewportHeight } });
  }, []);

  const setDataSourceLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_DATASOURCE_LOADING', payload: loading });
  }, []);

  const setDataSourceError = useCallback((error: unknown) => {
    dispatch({ type: 'SET_DATASOURCE_ERROR', payload: error });
  }, []);

  const setRowCount = useCallback((count: number) => {
    dispatch({ type: 'SET_ROW_COUNT', payload: count });
  }, []);

  // Store-backed getters live here. DataGrid installs the rest of the API (sort, filter,
  // pagination, selection, visible rows and columns) from the state it actually renders.
  const [initialApi] = useState<GridApi>(() => ({
    ...createGridApiPlaceholder(),
    getRow: (id: GridRowId) => stateRef.current.rows.idRowsLookup.get(id) || null,
    getAllRows: () => stateRef.current.rows.allRows.map(id => stateRef.current.rows.idRowsLookup.get(id)!),
    getColumn: (field: string) => stateRef.current.columns.lookup.get(field) || null,
    getAllColumns: () => stateRef.current.columns.all,
  }));
  const apiRef = useRef<GridApi>(initialApi);

  return {
    state,
    dispatch,
    apiRef,
    setRows,
    replaceRow,
    setColumns,
    setDimensions,
    setDataSourceLoading,
    setDataSourceError,
    setRowCount
  };
}
