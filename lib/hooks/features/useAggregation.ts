import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type {
    GridRowModel,
    GridValidRowModel,
    GridColDef,
    GridAggregationModel,
    GridAggregationResult,
    GridFilterModel,
    GridSortItem,
    GridDataSource,
} from '../../types';
import { computeAggregations } from '../../utils/aggregation';

export type { BuiltInAggFn } from '../../utils/aggregation';
export { formatAggregationValue } from '../../utils/aggregation';

export interface UseAggregationParams<R extends GridValidRowModel = GridRowModel> {
        rows: R[];
        columns?: GridColDef<R>[];
        aggregationModel: GridAggregationModel;
        isServerSide: boolean;
        dataSource?: GridDataSource<R>;
        filterModel?: GridFilterModel;
        sortModel?: GridSortItem[];
        serverAggregationResults?: GridAggregationResult | null;
}

export interface UseAggregationReturn {
        aggregationResult: GridAggregationResult;
        isLoading: boolean;
        error: unknown;
}

const EMPTY_RESULT: GridAggregationResult = {};

interface ServerAggregationState {
    /** The request (model, filter, sort) this outcome belongs to. */
    key: string;
    result: GridAggregationResult | null;
    error: unknown;
}

/**
 * State for totals that arrive with a getRows response. The stored results are tagged with the
 * aggregation model they were computed for and read back as `null` once the model changes, so the
 * footer never shows a total under the wrong function.
 */
export function useServerAggregationResults(
    aggregationModel: GridAggregationModel,
): [GridAggregationResult | null, (results: GridAggregationResult) => void] {
    const modelKey = JSON.stringify(aggregationModel);
    const [state, setState] = useState<{ modelKey: string; results: GridAggregationResult } | null>(null);
    const setResults = useCallback(
        (results: GridAggregationResult) => setState({ modelKey, results }),
        [modelKey],
    );
    return [state && state.modelKey === modelKey ? state.results : null, setResults];
}

export function useAggregation<R extends GridValidRowModel = GridRowModel>(params: UseAggregationParams<R>): UseAggregationReturn;
export function useAggregation<R extends GridValidRowModel = GridRowModel>(
    params: Omit<UseAggregationParams<R>, 'columns'> & { columns?: GridColDef[] },
): UseAggregationReturn;
// Internally rows are read as GridRowModel records; the signature above is the public one.
export function useAggregation<R extends GridRowModel>(
    params: UseAggregationParams<R>
): UseAggregationReturn {
    const {
        rows,
        columns,
        aggregationModel,
        isServerSide,
        dataSource,
        filterModel,
        sortModel,
        serverAggregationResults,
    } = params;

    const hasModel = Object.keys(aggregationModel).length > 0;

    const columnsLookup = useMemo(() => {
        const map = new Map<string, GridColDef>();
        (columns ?? []).forEach(col => map.set(col.field, col));
        return map;
    }, [columns]);

    const clientResult = useMemo<GridAggregationResult>(() => {
        if (isServerSide || !hasModel) return EMPTY_RESULT;

        return computeAggregations(rows, aggregationModel, columnsLookup, 'useAggregation');
    }, [rows, columnsLookup, aggregationModel, isServerSide, hasModel]);

    // Requests are identified by content, so an inline `aggregationModel={{ salary: 'sum' }}` (a new
    // object on every parent render) neither refetches nor drops the result it already has.
    const requestKey = JSON.stringify([aggregationModel, filterModel ?? null, sortModel ?? []]);
    const shouldFetch = isServerSide && hasModel && Boolean(dataSource?.getAggregations) && !serverAggregationResults;

    const latestRequestRef = useRef({ aggregationModel, filterModel, sortModel });
    useEffect(() => {
        latestRequestRef.current = { aggregationModel, filterModel, sortModel };
    });

    const [serverState, setServerState] = useState<ServerAggregationState | null>(null);

    useEffect(() => {
        const getAggregations = dataSource?.getAggregations;
        if (!shouldFetch || !getAggregations) return;

        let cancelled = false;
        const request = latestRequestRef.current;
        let pending: Promise<GridAggregationResult>;
        try {
            pending = Promise.resolve(getAggregations({
                sortModel: request.sortModel ?? [],
                filterModel: request.filterModel ?? { items: [] },
                groupKeys: [],
                aggregationModel: request.aggregationModel,
            }));
        } catch (err) {
            pending = Promise.reject(err);
        }
        pending
            .then(
                (result) => {
                    if (!cancelled) setServerState({ key: requestKey, result, error: null });
                },
                (err: unknown) => {
                    if (cancelled) return;
                    console.error('[useAggregation] Server aggregation error:', err);
                    setServerState({ key: requestKey, result: null, error: err });
                },
            );
        return () => { cancelled = true; };
    }, [shouldFetch, dataSource, requestKey]);

    // An outcome only counts for the request it answered: while a new request is pending, or after it
    // failed, there is no server result (the footer shows '—'), never the previous request's totals.
    const current = serverState && serverState.key === requestKey ? serverState : null;
    const isLoading = shouldFetch && current === null;
    const error = shouldFetch ? current?.error ?? null : null;

    const aggregationResult = useMemo<GridAggregationResult>(() => {
        if (!isServerSide) return clientResult;

        if (serverAggregationResults && Object.keys(serverAggregationResults).length > 0) {
            return serverAggregationResults;
        }
        return current?.result ?? EMPTY_RESULT;
    }, [isServerSide, clientResult, serverAggregationResults, current]);

    return { aggregationResult, isLoading, error };
}
