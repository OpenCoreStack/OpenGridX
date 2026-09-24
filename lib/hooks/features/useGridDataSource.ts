import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import type {
  GridDataSource,
  GridRowId,
  GridRowModel,
  GridSortItem,
  GridFilterModel,
  GridPaginationModel,
  GridGetRowsResponse,
  GridAggregationModel,
  GridAggregationResult,
} from '../../types';
import { GRID_ALL_ROWS_END_ROW, isServerDrivenDataSource } from '../../utils/dataSource';

/** Rapid sort, filter and page changes are collapsed into one request. */
const FETCH_DEBOUNCE_MS = 300;

/**
 * - `page`: server pagination. Each request is one page and replaces the rows.
 * - `infinite`: infinite scroll. Rows are appended, from the end of what is loaded up to the
 *   current page, so no range is ever skipped.
 * - `all`: the grid pages on the client, so it loads every row once.
 */
type FetchKind = 'page' | 'infinite' | 'all';

interface UseGridDataSourceParams<R extends GridRowModel> {
  dataSource?: GridDataSource<R>;
  sortModel: GridSortItem[];
  filterModel: GridFilterModel;
  paginationModel: GridPaginationModel;
  paginationMode?: 'client' | 'server' | 'infinite';
  sortingMode?: 'client' | 'server';
  filterMode?: 'client' | 'server';
  aggregationModel?: GridAggregationModel;
  /**
   * Row grouping is active. It turns pagination off (every group renders in one scrollable view),
   * so a `paginationMode: 'server'` source is asked for every row instead of the first page.
   */
  rowGroupingActive?: boolean;
  /** Resolves a row's id, to skip fetched rows that are already loaded. Defaults to `row.id`. */
  getRowId?: (row: R) => GridRowId;
  setRows: (rows: R[] | ((prev: R[]) => R[]), preserveRowCount?: boolean) => void;
  setRowCount: (count: number) => void;
  setDataSourceLoading: (loading: boolean) => void;
  setDataSourceError: (error: unknown) => void;
  onAggregationResults?: (results: GridAggregationResult) => void;
  /**
   * Infinite scroll: called with page 0 when a sort, filter, page size or dataSource change
   * restarts the list from its first row.
   */
  onPaginationModelChange?: (model: GridPaginationModel) => void;
}

export interface UseGridDataSourceReturn {
  /** Requests the current rows now (skipping the debounce), e.g. to retry after an error. */
  fetchRows: () => Promise<void>;
  /**
   * Loads the children of a server-side tree node and appends them. A path that is already
   * loading or loaded for the current rows is not requested again. `onError` runs when the
   * request fails; the grid-level error is left alone because the rows themselves are fine.
   */
  fetchChildren: (parentId: GridRowId, groupKeys: string[], onError?: (error: unknown) => void) => Promise<void>;
}

interface InfiniteState {
  /** The page the list is loaded up to (inclusive). */
  page: number;
  /** Server offset just past the last loaded row. */
  loadedEnd: number;
  /** `endRow` of the request in flight, or null. */
  inFlightEnd: number | null;
}

const defaultGetRowId = (row: GridRowModel): GridRowId => row.id;

function getFetchKind(paginationMode: UseGridDataSourceParams<GridRowModel>['paginationMode'], rowGroupingActive: boolean): FetchKind {
  if (paginationMode === 'infinite') return 'infinite';
  // Row grouping shows no pager, so a page-sized request would leave the other rows unreachable.
  if (paginationMode === 'server') return rowGroupingActive ? 'all' : 'page';
  return 'all';
}

/**
 * Drops fetched rows whose id (getRowId) repeats within the response, keeping the first
 * occurrence, and pairs each row with its id. Rows are kept as given: the store keys them by
 * getRowId. Runs outside any state updater, so a getRowId that throws for a fetched row fails the
 * request (error overlay) instead of throwing inside React's update.
 */
function identifyRows<R extends GridRowModel>(rows: R[], getRowId: (row: R) => GridRowId): { id: GridRowId; row: R }[] {
  const seen = new Set<GridRowId>();
  const result: { id: GridRowId; row: R }[] = [];
  rows.forEach(row => {
    const id = getRowId(row);
    if (seen.has(id)) return;
    seen.add(id);
    result.push({ id, row });
  });
  return result;
}

/** The loaded rows followed by the fetched rows whose id is not loaded yet. */
function appendNewRows<R extends GridRowModel>(loaded: R[], fetched: { id: GridRowId; row: R }[], getRowId: (row: R) => GridRowId): R[] {
  const loadedIds = new Set<GridRowId>(loaded.map(getRowId));
  const added = fetched.filter(entry => !loadedIds.has(entry.id)).map(entry => entry.row);
  return added.length === 0 ? loaded : [...loaded, ...added];
}

export function useGridDataSource<R extends GridRowModel>(params: UseGridDataSourceParams<R>): UseGridDataSourceReturn {
  const {
    dataSource,
    sortModel,
    filterModel,
    paginationModel,
    paginationMode,
    sortingMode,
    filterMode,
    aggregationModel,
    rowGroupingActive = false,
  } = params;

  const kind = getFetchKind(paginationMode, rowGroupingActive);
  const loadsAllForGrouping = Boolean(dataSource) && paginationMode === 'server' && rowGroupingActive;
  const warnedGroupingRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || warnedGroupingRef.current || !loadsAllForGrouping) return;
    warnedGroupingRef.current = true;
    console.warn(
      "[OpenGridX] `rowGroupingModel` turns pagination off, so the dataSource with `paginationMode: 'server'` is " +
      'asked for every row (startRow 0, endRow Number.MAX_SAFE_INTEGER) instead of one page. ' +
      'See docs/features/data-source.md.'
    );
  }, [loadsAllForGrouping]);
  const getRows = dataSource?.getRows;
  const serverDriven = isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode });

  // What the loaded rows depend on, compared by content: an inline filterModel, sortModel or
  // aggregationModel (a new object with the same content on every parent render) does not refetch.
  const datasetKey = JSON.stringify([
    kind,
    kind !== 'all' || sortingMode === 'server' ? sortModel : null,
    kind !== 'all' || filterMode === 'server' ? filterModel : null,
    serverDriven ? aggregationModel ?? null : null,
    kind === 'all' ? null : paginationModel.pageSize,
  ]);
  // Client pagination has every row already, so page changes never refetch.
  const requestedPage = kind === 'all' ? 0 : paginationModel.page;
  const requestedPageSize = kind === 'all' ? 0 : paginationModel.pageSize;

  // Requests read the latest params when they start and when they land.
  const latestRef = useRef({ params, kind });
  useLayoutEffect(() => {
    latestRef.current = { params, kind };
  });

  /** Bumped to drop the rows request in flight: a response whose token is stale is ignored. */
  const tokenRef = useRef(0);
  /** Bumped when the rows are replaced: children fetched for the old rows are ignored. */
  const rowsGenerationRef = useRef(0);
  const datasetRef = useRef<{ key: string; getRows: GridDataSource<R>['getRows'] } | null>(null);
  const infiniteRef = useRef<InfiniteState>({ page: 0, loadedEnd: 0, inFlightEnd: null });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** A rows request is scheduled or in flight. */
  const rowsPendingRef = useRef(false);
  const childrenPendingRef = useRef(0);
  const loadingRef = useRef(false);
  /** Children paths requested for the current rows (loading or loaded). */
  const childRequestsRef = useRef(new Set<string>());

  const syncLoading = useCallback(() => {
    const loading = rowsPendingRef.current || childrenPendingRef.current > 0;
    if (loading === loadingRef.current) return;
    loadingRef.current = loading;
    latestRef.current.params.setDataSourceLoading(loading);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const invalidateRowsRequest = useCallback(() => {
    tokenRef.current++;
    infiniteRef.current.inFlightEnd = null;
    rowsPendingRef.current = false;
  }, []);

  const invalidateChildren = useCallback(() => {
    rowsGenerationRef.current++;
    childRequestsRef.current.clear();
    childrenPendingRef.current = 0;
  }, []);

  /** Runs one rows request. Resolves true when an infinite list needs the next range right away. */
  const requestRowsOnce = useCallback(async (): Promise<boolean> => {
    const { params: p, kind: k } = latestRef.current;
    const source = p.dataSource;
    if (!source) return false;
    const infinite = infiniteRef.current;
    const pageSize = p.paginationModel.pageSize;

    let startRow: number;
    let endRow: number;
    if (k === 'infinite') {
      // One range at a time: the request in flight asks for the rest when it lands.
      if (infinite.inFlightEnd !== null) return false;
      startRow = infinite.loadedEnd;
      endRow = (infinite.page + 1) * pageSize;
      if (endRow <= startRow) {
        rowsPendingRef.current = false;
        syncLoading();
        return false;
      }
      infinite.inFlightEnd = endRow;
    } else if (k === 'page') {
      startRow = p.paginationModel.page * pageSize;
      endRow = startRow + pageSize;
    } else {
      startRow = 0;
      endRow = GRID_ALL_ROWS_END_ROW;
    }

    const token = ++tokenRef.current;
    rowsPendingRef.current = true;
    syncLoading();
    p.setDataSourceError(null);

    let response: GridGetRowsResponse<R>;
    try {
      response = await source.getRows({
        startRow,
        endRow,
        sortModel: p.sortModel,
        filterModel: p.filterModel,
        groupKeys: [],
        aggregationModel: p.aggregationModel,
      });
    } catch (error) {
      if (token !== tokenRef.current) return false;
      infinite.inFlightEnd = null;
      rowsPendingRef.current = false;
      latestRef.current.params.setDataSourceError(error);
      console.error('Data Source Error:', error);
      syncLoading();
      return false;
    }
    if (token !== tokenRef.current) return false;

    // A malformed response, or a getRowId that throws for a fetched row, fails the request like a
    // rejected getRows: error overlay, loading cleared, nothing thrown.
    try {
      const { params: current } = latestRef.current;
      const getRowId = current.getRowId ?? (defaultGetRowId as (row: R) => GridRowId);
      const fetched = identifyRows(response.rows, getRowId);
      if (k === 'infinite' && startRow > 0) {
        current.setRows(prev => appendNewRows(prev, fetched, getRowId), true);
      } else {
        current.setRows(fetched.map(entry => entry.row), true);
        invalidateChildren();
      }
      if (response.aggregationResults) current.onAggregationResults?.(response.aggregationResults);
      if (response.rowCount !== undefined) current.setRowCount(response.rowCount);

      if (k === 'infinite') {
        infinite.inFlightEnd = null;
        infinite.loadedEnd = startRow + response.rows.length;
        // A short response is the end of the data; otherwise catch up with a page that moved on.
        const receivedAll = response.rows.length >= endRow - startRow;
        if (receivedAll && (infinite.page + 1) * pageSize > endRow) return true;
      }
    } catch (error) {
      infinite.inFlightEnd = null;
      rowsPendingRef.current = false;
      latestRef.current.params.setDataSourceError(error);
      console.error('Data Source Error:', error);
      syncLoading();
      return false;
    }
    rowsPendingRef.current = false;
    syncLoading();
    return false;
  }, [syncLoading, invalidateChildren]);

  const requestRows = useCallback(async (): Promise<void> => {
    while (await requestRowsOnce()) {
      // keep extending the infinite list until it reaches the current page
    }
  }, [requestRowsOnce]);

  // Layout effect: loading is on before the first paint, so the empty state never flashes up
  // while the first request waits for its debounce.
  useLayoutEffect(() => {
    if (!getRows) {
      if (datasetRef.current) {
        // The dataSource was removed: nothing it still returns may reach the rows.
        datasetRef.current = null;
        clearTimer();
        invalidateRowsRequest();
        invalidateChildren();
        latestRef.current.params.setDataSourceError(null);
        syncLoading();
      }
      return;
    }

    const previous = datasetRef.current;
    const infinite = infiniteRef.current;
    if (!previous || previous.key !== datasetKey || previous.getRows !== getRows) {
      datasetRef.current = { key: datasetKey, getRows };
      invalidateRowsRequest();
      invalidateChildren();
      // A new sort, filter, page size or dataSource restarts an infinite list at its first page.
      const restart = kind === 'infinite' && previous !== null && requestedPage !== 0;
      infinite.page = restart ? 0 : requestedPage;
      infinite.loadedEnd = 0;
      if (restart) {
        const { params: p } = latestRef.current;
        p.onPaginationModelChange?.({ ...p.paginationModel, page: 0 });
      }
    } else if (kind === 'infinite') {
      if (requestedPage < infinite.page) {
        // Going back to an earlier page reloads the list up to that page.
        invalidateRowsRequest();
        infinite.loadedEnd = 0;
      }
      infinite.page = requestedPage;
    } else {
      // A new page supersedes the request in flight.
      invalidateRowsRequest();
    }

    if (kind === 'infinite') {
      const inFlight = infinite.inFlightEnd !== null;
      if (inFlight || (infinite.page + 1) * requestedPageSize <= infinite.loadedEnd) {
        // The request in flight extends the list when it lands, or the rows are already loaded.
        rowsPendingRef.current = inFlight;
        syncLoading();
        return;
      }
    }

    rowsPendingRef.current = true;
    syncLoading();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void requestRows();
    }, FETCH_DEBOUNCE_MS);
    return clearTimer;
  }, [getRows, datasetKey, kind, requestedPage, requestedPageSize, clearTimer, invalidateRowsRequest, invalidateChildren, syncLoading, requestRows]);

  // Nothing still in flight may write to an unmounted grid. (A grid that is shown again, e.g. by
  // StrictMode or <Activity>, reruns the effect above and requests what it still needs.)
  useEffect(() => () => {
    invalidateRowsRequest();
    invalidateChildren();
  }, [invalidateRowsRequest, invalidateChildren]);

  const fetchRows = useCallback((): Promise<void> => {
    clearTimer();
    return requestRows();
  }, [clearTimer, requestRows]);

  const fetchChildren = useCallback(async (
    _parentId: GridRowId,
    groupKeys: string[],
    onError?: (error: unknown) => void,
  ): Promise<void> => {
    const { params: p } = latestRef.current;
    const source = p.dataSource;
    if (!source) return;

    const requestKey = JSON.stringify(groupKeys);
    const requests = childRequestsRef.current;
    if (requests.has(requestKey)) return;
    const generation = rowsGenerationRef.current;
    requests.add(requestKey);
    childrenPendingRef.current++;
    syncLoading();

    try {
      const response = await source.getRows({
        startRow: 0,
        endRow: GRID_ALL_ROWS_END_ROW,
        sortModel: p.sortModel,
        filterModel: p.filterModel,
        groupKeys,
        aggregationModel: p.aggregationModel,
      });
      // Children of rows that have since been replaced (another page, sort or source) are dropped.
      if (generation !== rowsGenerationRef.current) return;
      if (response.rows.length > 0) {
        const { params: current } = latestRef.current;
        const getRowId = current.getRowId ?? (defaultGetRowId as (row: R) => GridRowId);
        const fetched = identifyRows(response.rows, getRowId);
        current.setRows(prev => appendNewRows(prev, fetched, getRowId), true);
      }
    } catch (error) {
      if (generation !== rowsGenerationRef.current) return;
      // Forget the request so that expanding the node again retries it.
      requests.delete(requestKey);
      console.error('Failed to fetch children:', error);
      onError?.(error);
    } finally {
      if (generation === rowsGenerationRef.current) {
        childrenPendingRef.current--;
        syncLoading();
      }
    }
  }, [syncLoading]);

  return {
    fetchRows,
    fetchChildren,
  };
}
