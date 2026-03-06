
import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type {
    GridRowModel,
    GridAggregationModel,
    GridAggregationResult,
    GridFilterModel,
    GridSortItem,
    GridDataSource,
} from '../../types';

export type BuiltInAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique';

const AGGREGATION_FUNCTIONS: Record<BuiltInAggFn, (values: any[]) => any> = {
    sum: (values) => {
        const nums = values.filter((v) => v != null && !isNaN(Number(v)));
        return nums.reduce((acc, v) => acc + Number(v), 0);
    },
    avg: (values) => {
        const nums = values.filter((v) => v != null && !isNaN(Number(v)));
        if (nums.length === 0) return null;
        return nums.reduce((acc, v) => acc + Number(v), 0) / nums.length;
    },
    count: (values) => values.filter((v) => v != null).length,
    min: (values) => {
        const nums = values.filter((v) => v != null && !isNaN(Number(v))).map(Number);
        return nums.length ? Math.min(...nums) : null;
    },
    max: (values) => {
        const nums = values.filter((v) => v != null && !isNaN(Number(v))).map(Number);
        return nums.length ? Math.max(...nums) : null;
    },
    unique: (values) => new Set(values.filter((v) => v != null)).size,
};

export function formatAggregationValue(value: any, fnName: string): string {
    if (value == null) return '—';
    if (typeof value === 'number') {
        if (fnName === 'avg') {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return value.toLocaleString();
    }
    return String(value);
}

export interface UseAggregationParams<R extends GridRowModel> {
        rows: R[];
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
        error: any;
}

export function useAggregation<R extends GridRowModel>(
    params: UseAggregationParams<R>
): UseAggregationReturn {
    const {
        rows,
        aggregationModel,
        isServerSide,
        dataSource,
        filterModel,
        sortModel,
        serverAggregationResults,
    } = params;

    const clientResult = useMemo<GridAggregationResult>(() => {
        if (isServerSide || Object.keys(aggregationModel).length === 0) return {};

        const result: GridAggregationResult = {};
        for (const [field, fnName] of Object.entries(aggregationModel)) {
            const fn = AGGREGATION_FUNCTIONS[fnName as BuiltInAggFn];
            if (!fn) {
                console.warn(`[useAggregation] Unknown aggregation function: "${fnName}"`);
                continue;
            }
            const values = rows.map((row) => (row as any)[field]);
            result[field] = fn(values);
        }
        return result;
    }, [rows, aggregationModel, isServerSide]);

    const [serverResult, setServerResult] = useState<GridAggregationResult>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const requestIdRef = useRef(0);

    const fetchServerAggregations = useCallback(async () => {
        if (!dataSource?.getAggregations || Object.keys(aggregationModel).length === 0) return;

        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        setError(null);

        try {
            const result = await dataSource.getAggregations({
                sortModel: sortModel ?? [],
                filterModel: filterModel ?? { items: [] },
                groupKeys: [],
                aggregationModel,
            });

            if (requestId === requestIdRef.current) {
                setServerResult(result);
            }
        } catch (err) {
            if (requestId === requestIdRef.current) {
                setError(err);
                console.error('[useAggregation] Server aggregation error:', err);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [dataSource, aggregationModel, filterModel, sortModel]);

    useEffect(() => {
        if (isServerSide && dataSource?.getAggregations && !serverAggregationResults) {
            fetchServerAggregations();
        }
    }, [fetchServerAggregations, isServerSide, dataSource, serverAggregationResults]);

    const aggregationResult = useMemo<GridAggregationResult>(() => {
        if (!isServerSide) return clientResult;

        if (serverAggregationResults && Object.keys(serverAggregationResults).length > 0) {
            return serverAggregationResults;
        }
        return serverResult;
    }, [isServerSide, clientResult, serverAggregationResults, serverResult]);

    return { aggregationResult, isLoading, error };
}
