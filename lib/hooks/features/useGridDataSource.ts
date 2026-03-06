import { useEffect, useRef, useCallback } from 'react';
import { 
  GridDataSource, 
  GridRowModel, 
  GridSortItem, 
  GridFilterModel, 
  GridPaginationModel,
  GridGetRowsParams,
  GridAggregationModel,
  GridAggregationResult,
} from '../../types';

interface UseGridDataSourceParams<R extends GridRowModel> {
  dataSource?: GridDataSource<R>;
  sortModel: GridSortItem[];
  filterModel: GridFilterModel;
  paginationModel: GridPaginationModel;
  paginationMode?: 'client' | 'server' | 'infinite';
  sortingMode?: 'client' | 'server';
  filterMode?: 'client' | 'server';
  aggregationModel?: GridAggregationModel;
  setRows: (rows: R[] | ((prev: R[]) => R[]), preserveRowCount?: boolean) => void;
  setRowCount: (count: number) => void;
  setDataSourceLoading: (loading: boolean) => void;
  setDataSourceError: (error: any) => void;
    onAggregationResults?: (results: GridAggregationResult) => void;
}

export function useGridDataSource<R extends GridRowModel>(params: UseGridDataSourceParams<R>) {
  const {
    dataSource,
    sortModel,
    filterModel,
    paginationModel,
    paginationMode,
    sortingMode,
    filterMode,
    aggregationModel,
    setRows,
    setRowCount,
    setDataSourceLoading,
    setDataSourceError,
    onAggregationResults,
  } = params;

  const prevParamsRef = useRef<{
    sortModel: GridSortItem[];
    filterModel: GridFilterModel;
    page: number;
    pageSize: number;
  } | null>(null);

  const activeRequestRef = useRef<number>(0);

  const fetchRows = useCallback(async () => {
    if (!dataSource) return;

    const requestId = ++activeRequestRef.current;

    setDataSourceLoading(true);
    setDataSourceError(null);

    const startRow = paginationModel.page * paginationModel.pageSize;
    const endRow = startRow + paginationModel.pageSize;

    const requestParams: GridGetRowsParams = {
      startRow,
      endRow,
      sortModel,
      filterModel,
      groupKeys: [], 
      aggregationModel,
    };

    try {
      const response = await dataSource.getRows(requestParams);

      if (requestId !== activeRequestRef.current) {
        return;
      }

      let shouldAppend = false;

      if (paginationMode === 'infinite') {
        const prev = prevParamsRef.current;
        if (prev) {

          const sortChanged = JSON.stringify(prev.sortModel) !== JSON.stringify(sortModel);
          const filterChanged = JSON.stringify(prev.filterModel) !== JSON.stringify(filterModel);
          const pageSizeChanged = prev.pageSize !== paginationModel.pageSize;

          if (!sortChanged && !filterChanged && !pageSizeChanged && paginationModel.page > prev.page) {
            shouldAppend = true;
          }
        }
      }

      if (shouldAppend) {
        setRows((prevRows) => [...prevRows, ...response.rows], true);
      } else {
        setRows(response.rows, true);
      }

      if (response.aggregationResults && onAggregationResults) {
        onAggregationResults(response.aggregationResults);
      }

      if (response.rowCount !== undefined) {
        setRowCount(response.rowCount);
      } else if (paginationMode === 'infinite') {

      }

      prevParamsRef.current = {
        sortModel,
        filterModel,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize
      };

    } catch (error) {
      if (requestId === activeRequestRef.current) {
        setDataSourceError(error);
        console.error('Data Source Error:', error);
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setDataSourceLoading(false);
      }
    }
  }, [
    dataSource, 
    paginationModel.page, 
    paginationModel.pageSize, 
    sortModel, 
    filterModel,
    paginationMode,
    aggregationModel,
    onAggregationResults,
    setRows,
    setRowCount,
    setDataSourceLoading,
    setDataSourceError
  ]);

  useEffect(() => {
    const isServerSide = paginationMode === 'server' || paginationMode === 'infinite' || sortingMode === 'server' || filterMode === 'server';

    if (dataSource && isServerSide) {
      const timer = setTimeout(() => {
        fetchRows();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchRows, dataSource, paginationMode, sortingMode, filterMode]);

  const fetchChildren = useCallback(async (_parentId: string | number, groupKeys: string[]) => {
      if (!dataSource) return;

      setDataSourceLoading(true);
      try {
          const response = await dataSource.getRows({
              startRow: 0,
              endRow: -1, 
              sortModel,
              filterModel,
              groupKeys
          });

          if (response.rows.length > 0) {
              setRows((prevRows) => {

                  const existingIds = new Set(prevRows.map(r => r.id));
                  const newRows = response.rows.filter(r => !existingIds.has(r.id));
                  return [...prevRows, ...newRows];
              });
          }
      } catch (error) {
          setDataSourceError(error);
          console.error('Failed to fetch children:', error);
      } finally {
          setDataSourceLoading(false);
      }
  }, [dataSource, sortModel, filterModel, setRows, setDataSourceLoading, setDataSourceError]);

  return {
    fetchRows,
    fetchChildren
  };
}
