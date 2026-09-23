import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { useGridDataSource } from './useGridDataSource';
import type {
    GridAggregationModel,
    GridAggregationResult,
    GridDataSource,
    GridFilterModel,
    GridGetRowsParams,
    GridGetRowsResponse,
    GridPaginationModel,
    GridRowModel,
    GridSortItem,
} from '../../types';

interface Row extends GridRowModel {
    id: number;
    name: string;
}

const makeRows = (start: number, end: number): Row[] =>
    Array.from({ length: end - start }, (_, i) => ({ id: start + i, name: `r${start + i}` }));

interface PendingRequest {
    params: GridGetRowsParams;
    resolve: (response: GridGetRowsResponse<Row>) => void;
    reject: (error: unknown) => void;
}

/** A data source whose requests stay pending until the test resolves them. */
function createManualDataSource() {
    const requests: PendingRequest[] = [];
    const dataSource: GridDataSource<Row> = {
        getRows: (params) => new Promise<GridGetRowsResponse<Row>>((resolve, reject) => {
            requests.push({ params, resolve, reject });
        }),
    };
    return { dataSource, requests };
}

interface HarnessProps {
    dataSource?: GridDataSource<Row>;
    sortModel: GridSortItem[];
    filterModel: GridFilterModel;
    paginationModel: GridPaginationModel;
    paginationMode?: 'client' | 'server' | 'infinite';
    sortingMode?: 'client' | 'server';
    filterMode?: 'client' | 'server';
    aggregationModel?: GridAggregationModel;
    onAggregationResults?: (results: GridAggregationResult) => void;
}

interface SetRowsCall {
    kind: 'replace' | 'updater';
    preserveRowCount: boolean | undefined;
}

/** Wires the hook to real React state so functional `setRows` updaters are exercised. */
function useHarness(props: HarnessProps) {
    const [rows, setRowsState] = useState<Row[]>([]);
    const [rowCount, setRowCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [setRowsCalls, setSetRowsCalls] = useState<SetRowsCall[]>([]);
    const [loadingHistory, setLoadingHistory] = useState<boolean[]>([]);

    const setRows = useCallback((next: Row[] | ((prev: Row[]) => Row[]), preserveRowCount?: boolean) => {
        setRowsState(prev => (typeof next === 'function' ? next(prev) : next));
        setSetRowsCalls(prev => [...prev, { kind: typeof next === 'function' ? 'updater' : 'replace', preserveRowCount }]);
    }, []);

    const setDataSourceLoading = useCallback((value: boolean) => {
        setLoading(value);
        setLoadingHistory(prev => [...prev, value]);
    }, []);

    const handlers = useGridDataSource<Row>({
        ...props,
        setRows,
        setRowCount,
        setDataSourceLoading,
        setDataSourceError: setError,
    });

    return { rows, rowCount, loading, error, setRowsCalls, loadingHistory, ...handlers };
}

const EMPTY_SORT: GridSortItem[] = [];
const EMPTY_FILTER: GridFilterModel = { items: [] };
const PAGE_0: GridPaginationModel = { page: 0, pageSize: 10 };
const DEBOUNCE_MS = 300;

async function advance(ms: number) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

async function settle(request: PendingRequest, response: GridGetRowsResponse<Row>) {
    await act(async () => {
        request.resolve(response);
    });
}

async function fail(request: PendingRequest, error: unknown) {
    await act(async () => {
        request.reject(error);
    });
}

function renderHarness(initialProps: HarnessProps) {
    return renderHook((props: HarnessProps) => useHarness(props), { initialProps });
}

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    vi.useFakeTimers();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('useGridDataSource — when requests are made', () => {
    it('does nothing without a dataSource', async () => {
        const { result } = renderHarness({
            sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server',
        });
        await advance(1000);
        await act(async () => {
            await result.current.fetchRows();
            await result.current.fetchChildren(1, ['a']);
        });
        expect(result.current.setRowsCalls).toEqual([]);
        expect(result.current.loadingHistory).toEqual([]);
    });

    it.each([
        ['paginationMode="server"', { paginationMode: 'server' as const }],
        ['paginationMode="infinite"', { paginationMode: 'infinite' as const }],
        ['sortingMode="server"', { sortingMode: 'server' as const }],
        ['filterMode="server"', { filterMode: 'server' as const }],
    ])('fetches automatically with %s', async (_label, modes) => {
        const { dataSource, requests } = createManualDataSource();
        renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, ...modes });
        await advance(DEBOUNCE_MS);
        expect(requests).toHaveLength(1);
    });

    it('debounces the first request by 300ms', async () => {
        const { dataSource, requests } = createManualDataSource();
        renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS - 1);
        expect(requests).toHaveLength(0);
        await advance(1);
        expect(requests).toHaveLength(1);
    });

    it('collapses rapid sort changes into a single request for the latest sort', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, sortingMode: 'server' as const };
        const { rerender } = renderHarness({ ...base, sortModel: EMPTY_SORT });
        await advance(100);
        rerender({ ...base, sortModel: [{ field: 'name', sort: 'asc' }] });
        await advance(100);
        const latest: GridSortItem[] = [{ field: 'name', sort: 'desc' }];
        rerender({ ...base, sortModel: latest });
        await advance(DEBOUNCE_MS);
        expect(requests).toHaveLength(1);
        expect(requests[0].params.sortModel).toEqual(latest);
    });

    it('does not fire a request when unmounted before the debounce elapses', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { unmount } = renderHarness({
            dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server',
        });
        await advance(100);
        unmount();
        await advance(1000);
        expect(requests).toHaveLength(0);
    });

    it('refetches when the dataSource identity changes', async () => {
        const first = createManualDataSource();
        const second = createManualDataSource();
        const base = { sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' as const };
        const { rerender } = renderHarness({ ...base, dataSource: first.dataSource });
        await advance(DEBOUNCE_MS);
        await settle(first.requests[0], { rows: makeRows(0, 10), rowCount: 10 });

        rerender({ ...base, dataSource: second.dataSource });
        await advance(DEBOUNCE_MS);
        expect(first.requests).toHaveLength(1);
        expect(second.requests).toHaveLength(1);
    });

    it('does not refetch when re-rendered with identical inputs', async () => {
        const { dataSource, requests } = createManualDataSource();
        const props = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' as const };
        const { rerender } = renderHarness(props);
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10) });
        rerender({ ...props, paginationModel: { page: 0, pageSize: 10 } });
        await advance(1000);
        expect(requests).toHaveLength(1);
    });

    it('stops fetching automatically when every mode goes back to client', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER };
        const { rerender } = renderHarness({ ...base, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10) });
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 }, paginationMode: 'client' });
        await advance(1000);
        expect(requests).toHaveLength(1);
    });

    it('fetchRows can be called imperatively even when no server mode is set', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0 });
        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchRows();
        });
        expect(requests).toHaveLength(1);
        await act(async () => {
            requests[0].resolve({ rows: makeRows(0, 3) });
            await pending;
        });
        expect(result.current.rows.map(r => r.id)).toEqual([0, 1, 2]);
    });
});

describe('useGridDataSource — request parameters', () => {
    it('sends the page range, sort, filter, aggregation model and empty groupKeys', async () => {
        const { dataSource, requests } = createManualDataSource();
        const sortModel: GridSortItem[] = [{ field: 'name', sort: 'asc' }];
        const filterModel: GridFilterModel = { items: [{ field: 'name', operator: 'contains', value: 'r' }] };
        const aggregationModel: GridAggregationModel = { id: 'sum' };
        renderHarness({
            dataSource, sortModel, filterModel, aggregationModel,
            paginationModel: { page: 3, pageSize: 25 }, paginationMode: 'server',
        });
        await advance(DEBOUNCE_MS);
        expect(requests[0].params).toEqual({
            startRow: 75,
            endRow: 100,
            sortModel,
            filterModel,
            groupKeys: [],
            aggregationModel,
        });
    });

    it('sends startRow 0 for the first page', async () => {
        const { dataSource, requests } = createManualDataSource();
        renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: { page: 0, pageSize: 50 }, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        expect(requests[0].params.startRow).toBe(0);
        expect(requests[0].params.endRow).toBe(50);
    });

    it('requests the new page after a page change', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 100 });
        rerender({ ...base, paginationModel: { page: 4, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        expect(requests).toHaveLength(2);
        expect(requests[1].params.startRow).toBe(40);
        expect(requests[1].params.endRow).toBe(50);
    });
});

describe('useGridDataSource — applying responses', () => {
    it('replaces rows, preserving the row count, in server pagination mode', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 100 });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 10).map(r => r.id));

        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: makeRows(10, 20), rowCount: 100 });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(10, 20).map(r => r.id));
        expect(result.current.setRowsCalls).toEqual([
            { kind: 'replace', preserveRowCount: true },
            { kind: 'replace', preserveRowCount: true },
        ]);
    });

    it('sets rowCount from the response', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 1234 });
        expect(result.current.rowCount).toBe(1234);
    });

    it('accepts rowCount 0 (empty server result)', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: [], rowCount: 0 });
        expect(result.current.rowCount).toBe(0);
        expect(result.current.rows).toEqual([]);
    });

    it('leaves rowCount untouched when the response omits it', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'infinite' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10) });
        expect(result.current.rowCount).toBeNull();
        expect(result.current.rows).toHaveLength(10);
    });

    it('forwards aggregationResults to onAggregationResults', async () => {
        const { dataSource, requests } = createManualDataSource();
        const onAggregationResults = vi.fn();
        renderHarness({
            dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server',
            aggregationModel: { id: 'sum' }, onAggregationResults,
        });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 10, aggregationResults: { id: 45 } });
        expect(onAggregationResults).toHaveBeenCalledTimes(1);
        expect(onAggregationResults).toHaveBeenCalledWith({ id: 45 });
    });

    it('does not call onAggregationResults when the response has none', async () => {
        const { dataSource, requests } = createManualDataSource();
        const onAggregationResults = vi.fn();
        renderHarness({
            dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server', onAggregationResults,
        });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 10 });
        expect(onAggregationResults).not.toHaveBeenCalled();
    });

    it('works with string row ids', async () => {
        const rows = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] as unknown as Row[];
        const dataSource: GridDataSource<Row> = { getRows: () => Promise.resolve({ rows, rowCount: 2 }) };
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        expect(result.current.rows.map(r => r.id)).toEqual(['a', 'b']);
    });
});

describe('useGridDataSource — loading and error state', () => {
    it('sets loading true while the request is pending and false after it resolves', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        expect(result.current.loading).toBe(true);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 10 });
        expect(result.current.loading).toBe(false);
        expect(result.current.loadingHistory).toEqual([true, false]);
    });

    it('stores the error, logs it and clears loading when getRows rejects', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        const boom = new Error('boom');
        await fail(requests[0], boom);
        expect(result.current.error).toBe(boom);
        expect(result.current.loading).toBe(false);
        expect(result.current.setRowsCalls).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Data Source Error:', boom);
    });

    it('keeps the previously loaded rows when a later request fails', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 100 });
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        await fail(requests[1], new Error('network'));
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 10).map(r => r.id));
        expect(result.current.rowCount).toBe(100);
    });

    it('clears a previous error when the next request starts', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await fail(requests[0], 'string error');
        expect(result.current.error).toBe('string error');

        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        expect(result.current.error).toBeNull();
        await settle(requests[1], { rows: makeRows(10, 20), rowCount: 100 });
        expect(result.current.error).toBeNull();
        expect(result.current.rows).toHaveLength(10);
    });

    it('supports retrying with fetchRows after an error', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await fail(requests[0], new Error('boom'));

        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchRows();
        });
        expect(result.current.error).toBeNull();
        await act(async () => {
            requests[1].resolve({ rows: makeRows(0, 10), rowCount: 10 });
            await pending;
        });
        expect(result.current.rows).toHaveLength(10);
        expect(result.current.loading).toBe(false);
    });
});

describe('useGridDataSource — out-of-order responses', () => {
    it('ignores a slower, older response that resolves after a newer one', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        expect(requests).toHaveLength(2);

        await settle(requests[1], { rows: makeRows(10, 20), rowCount: 100 });
        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 999 });

        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(10, 20).map(r => r.id));
        expect(result.current.rowCount).toBe(100);
        expect(result.current.loading).toBe(false);
    });

    it('keeps loading true until the newest request settles', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);

        await settle(requests[0], { rows: makeRows(0, 10), rowCount: 100 });
        expect(result.current.loading).toBe(true);
        await settle(requests[1], { rows: makeRows(10, 20), rowCount: 100 });
        expect(result.current.loading).toBe(false);
    });

    it('ignores an error from a superseded request', async () => {
        const { dataSource, requests } = createManualDataSource();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const };
        const { result, rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);

        await fail(requests[0], new Error('stale failure'));
        expect(result.current.error).toBeNull();
        await settle(requests[1], { rows: makeRows(10, 20), rowCount: 100 });
        expect(result.current.error).toBeNull();
        expect(result.current.rows).toHaveLength(10);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('ignores aggregation results from a superseded request', async () => {
        const { dataSource, requests } = createManualDataSource();
        const onAggregationResults = vi.fn();
        const base = { dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationMode: 'server' as const, onAggregationResults };
        const { rerender } = renderHarness({ ...base, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        rerender({ ...base, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);

        await settle(requests[1], { rows: makeRows(10, 20), aggregationResults: { id: 'new' } });
        await settle(requests[0], { rows: makeRows(0, 10), aggregationResults: { id: 'old' } });
        expect(onAggregationResults).toHaveBeenCalledTimes(1);
        expect(onAggregationResults).toHaveBeenCalledWith({ id: 'new' });
    });
});

describe('useGridDataSource — infinite scroll', () => {
    const infiniteBase = (dataSource: GridDataSource<Row>) => ({
        dataSource, filterModel: EMPTY_FILTER, paginationMode: 'infinite' as const,
    });

    async function loadFirstPage(dataSource: GridDataSource<Row>, requests: PendingRequest[]) {
        const hook = renderHarness({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 10) });
        return hook;
    }

    it('appends the rows of the next page', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        expect(requests[1].params.startRow).toBe(10);
        expect(requests[1].params.endRow).toBe(20);
        await settle(requests[1], { rows: makeRows(10, 20) });

        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 20).map(r => r.id));
        expect(result.current.setRowsCalls).toEqual([
            { kind: 'replace', preserveRowCount: true },
            { kind: 'updater', preserveRowCount: true },
        ]);
    });

    it('keeps appending page after page when each page settles before the next is requested', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        for (let page = 1; page <= 3; page++) {
            rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page, pageSize: 10 } });
            await advance(DEBOUNCE_MS);
            await settle(requests[page], { rows: makeRows(page * 10, page * 10 + 10) });
        }
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 40).map(r => r.id));
    });

    it('replaces the rows when the first page is loaded', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = await loadFirstPage(dataSource, requests);
        expect(result.current.setRowsCalls).toEqual([{ kind: 'replace', preserveRowCount: true }]);
        expect(result.current.rows).toHaveLength(10);
    });

    it('replaces the rows when the sort model changes', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        rerender({ ...infiniteBase(dataSource), sortModel: [{ field: 'name', sort: 'desc' }], paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: makeRows(90, 100) });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(90, 100).map(r => r.id));
    });

    it('replaces the rows when the filter model changes', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        rerender({
            dataSource, paginationMode: 'infinite', sortModel: EMPTY_SORT, paginationModel: PAGE_0,
            filterModel: { items: [{ field: 'name', operator: 'equals', value: 'r5' }] },
        });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: [{ id: 5, name: 'r5' }] });
        expect(result.current.rows.map(r => r.id)).toEqual([5]);
    });

    it('replaces the rows when the page size changes', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page: 1, pageSize: 20 } });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: makeRows(20, 40) });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(20, 40).map(r => r.id));
    });

    it('replaces the rows when the page goes backwards', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);
        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: makeRows(10, 20) });

        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: PAGE_0 });
        await advance(DEBOUNCE_MS);
        await settle(requests[2], { rows: makeRows(0, 10) });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 10).map(r => r.id));
    });

    it('does not append after a failed page request; the next page load still appends', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);

        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        await fail(requests[1], new Error('boom'));
        expect(result.current.rows).toHaveLength(10);

        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchRows();
        });
        await act(async () => {
            requests[2].resolve({ rows: makeRows(10, 20) });
            await pending;
        });
        expect(result.current.rows.map(r => r.id)).toEqual(makeRows(0, 20).map(r => r.id));
    });

    it('treats an empty page as the end of data without clearing existing rows', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result, rerender } = await loadFirstPage(dataSource, requests);
        rerender({ ...infiniteBase(dataSource), sortModel: EMPTY_SORT, paginationModel: { page: 1, pageSize: 10 } });
        await advance(DEBOUNCE_MS);
        await settle(requests[1], { rows: [] });
        expect(result.current.rows).toHaveLength(10);
    });
});

describe('useGridDataSource — fetchChildren (server tree data)', () => {
    it('requests the children with the given group keys and current sort/filter', async () => {
        const { dataSource, requests } = createManualDataSource();
        const sortModel: GridSortItem[] = [{ field: 'name', sort: 'asc' }];
        const filterModel: GridFilterModel = { items: [{ field: 'name', operator: 'contains', value: 'x' }] };
        const { result } = renderHarness({ dataSource, sortModel, filterModel, paginationModel: PAGE_0 });
        act(() => {
            void result.current.fetchChildren('parent', ['Root', 'Parent']);
        });
        expect(requests).toHaveLength(1);
        expect(requests[0].params.groupKeys).toEqual(['Root', 'Parent']);
        expect(requests[0].params.startRow).toBe(0);
        expect(requests[0].params.sortModel).toEqual(sortModel);
        expect(requests[0].params.filterModel).toEqual(filterModel);
    });

    it('is not debounced', () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0 });
        act(() => {
            void result.current.fetchChildren(1, ['a']);
        });
        expect(requests).toHaveLength(1);
    });

    it('appends the children after the existing rows', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 3), rowCount: 3 });

        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchChildren(0, ['r0']);
        });
        await act(async () => {
            requests[1].resolve({ rows: makeRows(100, 102) });
            await pending;
        });
        expect(result.current.rows.map(r => r.id)).toEqual([0, 1, 2, 100, 101]);
    });

    it('skips children whose id is already loaded', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0, paginationMode: 'server' });
        await advance(DEBOUNCE_MS);
        await settle(requests[0], { rows: makeRows(0, 3), rowCount: 3 });

        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchChildren(0, ['r0']);
        });
        await act(async () => {
            requests[1].resolve({ rows: [{ id: 2, name: 'duplicate' }, { id: 7, name: 'r7' }] });
            await pending;
        });
        expect(result.current.rows.map(r => r.id)).toEqual([0, 1, 2, 7]);
        expect(result.current.rows.find(r => r.id === 2)?.name).toBe('r2');
    });

    it('does not touch rows when the parent has no children', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0 });
        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchChildren(1, ['a']);
        });
        await act(async () => {
            requests[0].resolve({ rows: [] });
            await pending;
        });
        expect(result.current.setRowsCalls).toEqual([]);
        expect(result.current.loadingHistory).toEqual([true, false]);
    });

    it('stores the error and clears loading when the children request fails', async () => {
        const { dataSource, requests } = createManualDataSource();
        const { result } = renderHarness({ dataSource, sortModel: EMPTY_SORT, filterModel: EMPTY_FILTER, paginationModel: PAGE_0 });
        let pending: Promise<void> | undefined;
        act(() => {
            pending = result.current.fetchChildren(1, ['a']);
        });
        const boom = new Error('children failed');
        await act(async () => {
            requests[0].reject(boom);
            await pending;
        });
        expect(result.current.error).toBe(boom);
        expect(result.current.loading).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch children:', boom);
    });
});
