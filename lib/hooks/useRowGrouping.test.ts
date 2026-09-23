import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRowGrouping } from './useRowGrouping';
import { buildColumnLookup } from '../utils/columnLookup';
import type { GridColDef, GridRowModel, GridRowMeta, GridTreeNode } from '../types';

const ROWS = [
    { id: 1, dept: 'Engineering', name: 'Alice' },
    { id: 2, dept: 'Engineering', name: 'Bob' },
    { id: 3, dept: 'HR', name: 'Carol' },
];

const GET_ROW_ID = (row: { id: number }) => row.id;
const GROUPING_MODEL = ['dept'];
const AGGREGATION_MODEL = {};

const BASE_PARAMS = {
    rows: ROWS,
    getRowId: GET_ROW_ID,
    rowGroupingModel: GROUPING_MODEL,
    aggregationModel: AGGREGATION_MODEL,
};

describe('useRowGrouping — rowMetaMap', () => {
    it('includes treeDepth for group rows', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        // Group rows are at depth 0 (top-level)
        let foundGroupAtDepth0 = false;
        map.forEach((meta, _id) => {
            if (meta.isGroupRow) {
                expect(meta.treeDepth).toBe(0);
                foundGroupAtDepth0 = true;
            }
        });
        expect(foundGroupAtDepth0).toBe(true);
    });

    it('includes treeDepth for leaf rows', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        // Leaf rows (original rows) are at depth 1 (under the group)
        let foundLeafAtDepth1 = false;
        map.forEach((meta, _id) => {
            if (!meta.isGroupRow) {
                expect(meta.treeDepth).toBe(1);
                foundLeafAtDepth1 = true;
            }
        });
        expect(foundLeafAtDepth1).toBe(true);
    });

    it('sets isGroupRow true for group rows and false for leaves', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        // Leaf rows have numeric ids (1, 2, 3)
        expect(map.get(1)?.isGroupRow).toBe(false);
        expect(map.get(2)?.isGroupRow).toBe(false);
        expect(map.get(3)?.isGroupRow).toBe(false);
        // Group rows use auto-generated string ids
        let groupCount = 0;
        map.forEach((meta) => {
            if (meta.isGroupRow) groupCount++;
        });
        // Two groups: Engineering and HR
        expect(groupCount).toBe(2);
    });

    it('includes all rows (group + leaf) in the map', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        // 3 leaf rows + 2 group rows = 5 entries
        expect(map.size).toBe(5);
    });

    it('has hasChildren true for group rows and false for leaf rows', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        expect(map.get(1)?.hasChildren).toBe(false);
        map.forEach((meta) => {
            if (meta.isGroupRow) {
                expect(meta.hasChildren).toBe(true);
            }
        });
    });

    it('populates groupLabel from groupingValueFormatter when provided', () => {
        const formatter = ({ field, value }: { field: string; value: unknown }) =>
            `${String(field).toUpperCase()}: ${String(value)}`;
        const columns = [{ field: 'dept', groupingValueFormatter: formatter }];
        const { result } = renderHook(() =>
            useRowGrouping({ ...BASE_PARAMS, columns })
        );
        const map = result.current.rowMetaMap;
        let foundFormatted = false;
        map.forEach((meta) => {
            if (meta.isGroupRow) {
                expect(meta.groupLabel).toMatch(/^DEPT:/);
                foundFormatted = true;
            }
        });
        expect(foundFormatted).toBe(true);
    });

    it('uses default field: value label when groupingValueFormatter is absent', () => {
        const { result } = renderHook(() => useRowGrouping(BASE_PARAMS));
        const map = result.current.rowMetaMap;
        map.forEach((meta) => {
            if (meta.isGroupRow) {
                expect(meta.groupLabel).toMatch(/^dept:/);
            }
        });
    });
});

describe('useRowGrouping — multi-field rowGroupingModel', () => {
    const MULTI_ROWS = [
        { id: 1, dept: 'Engineering', country: 'US', name: 'Alice' },
        { id: 2, dept: 'Engineering', country: 'US', name: 'Bob' },
        { id: 3, dept: 'Engineering', country: 'UK', name: 'Carol' },
        { id: 4, dept: 'HR', country: 'US', name: 'Dave' },
    ];
    const MULTI_PARAMS = {
        rows: MULTI_ROWS,
        getRowId: GET_ROW_ID,
        rowGroupingModel: ['dept', 'country'],
        aggregationModel: AGGREGATION_MODEL,
    };

    it('nests one group level per field, in rowGroupingModel order', () => {
        const { result } = renderHook(() => useRowGrouping(MULTI_PARAMS));
        const map = result.current.rowMetaMap;

        const depts = new Set<unknown>();
        const countries = new Set<unknown>();
        map.forEach((meta) => {
            if (!meta.isGroupRow) return;
            if (meta.treeDepth === 0) {
                expect(meta.groupingField).toBe('dept');
                depts.add(meta.groupingValue);
            } else if (meta.treeDepth === 1) {
                expect(meta.groupingField).toBe('country');
                countries.add(meta.groupingValue);
            }
        });
        // dept groups: Engineering, HR
        expect(depts).toEqual(new Set(['Engineering', 'HR']));
        // country groups: US (under Engineering), UK (under Engineering), US (under HR)
        expect(countries).toEqual(new Set(['US', 'UK']));
    });

    it('places leaf rows at depth === rowGroupingModel.length', () => {
        const { result } = renderHook(() => useRowGrouping(MULTI_PARAMS));
        const map = result.current.rowMetaMap;

        [1, 2, 3, 4].forEach((id) => {
            const meta = map.get(id);
            expect(meta?.isGroupRow).toBe(false);
            expect(meta?.treeDepth).toBe(2);
        });
    });

    it('produces one depth-0 group per dept, one depth-1 group per (dept, country) pair', () => {
        const { result } = renderHook(() => useRowGrouping(MULTI_PARAMS));
        const map = result.current.rowMetaMap;

        let depth0Count = 0;
        let depth1Count = 0;
        map.forEach((meta) => {
            if (!meta.isGroupRow) return;
            if (meta.treeDepth === 0) depth0Count++;
            if (meta.treeDepth === 1) depth1Count++;
        });
        // depth 0: Engineering, HR
        expect(depth0Count).toBe(2);
        // depth 1: Engineering/US, Engineering/UK, HR/US
        expect(depth1Count).toBe(3);
    });

    it('reveals the next level down only after both ancestor groups are expanded', () => {
        const { result } = renderHook(() => useRowGrouping(MULTI_PARAMS));

        // Fully collapsed: only depth-0 groups are visible.
        let visible = result.current.getVisibleRows();
        expect(visible).not.toBeNull();
        expect(visible!.length).toBe(2);

        const deptGroupId = [...result.current.treeNodes.entries()]
            .find(([, node]) => node.depth === 0 && node.groupingValue === 'Engineering')![0];

        act(() => { result.current.toggleExpansion(deptGroupId); });
        visible = result.current.getVisibleRows();
        // Engineering expanded reveals its 2 country subgroups; HR still collapsed (1 group).
        expect(visible!.length).toBe(2 + 2);

        // 'US' also exists as a country subgroup under HR — select by parentId to
        // disambiguate and target Engineering's own US subgroup.
        const countryGroupId = [...result.current.treeNodes.entries()]
            .find(([, node]) => node.depth === 1 && node.groupingValue === 'US' && node.parentId === deptGroupId)![0];

        act(() => { result.current.toggleExpansion(countryGroupId); });
        visible = result.current.getVisibleRows();
        // Expanding Engineering/US additionally reveals its 2 leaf rows (Alice, Bob).
        expect(visible!.length).toBe(2 + 2 + 2);
    });
});

describe('useRowGrouping — groupable: false', () => {
    it('skips a column with groupable:false — no group rows created for that field', () => {
        const columns = [{ field: 'dept', groupable: false as const }];
        const { result } = renderHook(() =>
            useRowGrouping({ ...BASE_PARAMS, columns })
        );
        const map = result.current.rowMetaMap;
        // With groupable:false on 'dept', no group rows should exist
        let groupCount = 0;
        map.forEach((meta) => { if (meta.isGroupRow) groupCount++; });
        expect(groupCount).toBe(0);
    });

    it('still groups when groupable is true (explicit)', () => {
        const columns = [{ field: 'dept', groupable: true as const }];
        const { result } = renderHook(() =>
            useRowGrouping({ ...BASE_PARAMS, columns })
        );
        const map = result.current.rowMetaMap;
        let groupCount = 0;
        map.forEach((meta) => { if (meta.isGroupRow) groupCount++; });
        expect(groupCount).toBe(2);
    });
});

describe('useRowGrouping — group aggregation matches useAggregation semantics', () => {
    const NULL_ROWS = [
        { id: 1, g: 'A', v: 10 as number | null },
        { id: 2, g: 'A', v: null as number | null },
        { id: 3, g: 'A', v: 20 as number | null },
    ];
    const MODEL = ['g'];
    const aggFor = (fn: string, columns?: { field: string; availableAggregationFunctions?: string[] }[]) => {
        const aggregationModel = { v: fn };
        const { result } = renderHook(() => useRowGrouping({ rows: NULL_ROWS, getRowId: GET_ROW_ID, rowGroupingModel: MODEL, aggregationModel, columns }));
        return [...result.current.treeNodes.values()].find(n => n.depth === 0)!.aggregatedValues!;
    };

    it('ignores nulls for min / avg / count instead of treating them as 0', () => {
        expect(aggFor('min').v).toBe(10);
        expect(aggFor('avg').v).toBe(15);
        expect(aggFor('count').v).toBe(2);
        expect(aggFor('sum').v).toBe(30);
        expect(aggFor('max').v).toBe(20);
    });

    it('supports the unique aggregation', () => {
        expect(aggFor('unique').v).toBe(2);
    });

    it('honors availableAggregationFunctions', () => {
        expect(aggFor('avg', [{ field: 'v', availableAggregationFunctions: ['sum'] }])).not.toHaveProperty('v');
    });
});

describe('useRowGrouping — expansion state', () => {
    it('preserves user expansion when rows are replaced with edited copies', () => {
        const { result, rerender } = renderHook(({ rows }) => useRowGrouping({ ...BASE_PARAMS, rows }), { initialProps: { rows: ROWS } });
        const eng = [...result.current.treeNodes.values()].find(n => n.groupingValue === 'Engineering')!.id;
        act(() => { result.current.toggleExpansion(eng); });
        rerender({ rows: ROWS.map(r => (r.id === 1 ? { ...r, name: 'Alicia' } : r)) });
        expect(result.current.isGroupExpanded(eng)).toBe(true);
    });

    it('preserves user expansion when an equal rowGroupingModel is passed as a new array', () => {
        const { result, rerender } = renderHook(({ model }) => useRowGrouping({ ...BASE_PARAMS, rowGroupingModel: model }), { initialProps: { model: ['dept'] } });
        const eng = [...result.current.treeNodes.values()].find(n => n.groupingValue === 'Engineering')!.id;
        act(() => { result.current.toggleExpansion(eng); });
        rerender({ model: ['dept'] });
        expect(result.current.isGroupExpanded(eng)).toBe(true);
    });

    it('discards user overrides when defaultGroupingExpansionDepth changes', () => {
        const { result, rerender } = renderHook(({ depth }) => useRowGrouping({ ...BASE_PARAMS, defaultGroupingExpansionDepth: depth }), { initialProps: { depth: -1 } });
        const hr = [...result.current.treeNodes.values()].find(n => n.groupingValue === 'HR')!.id;
        expect(result.current.isGroupExpanded(hr)).toBe(true);
        act(() => { result.current.toggleExpansion(hr); });
        expect(result.current.isGroupExpanded(hr)).toBe(false);
        // depth 1 also expands depth-0 groups by default; the collapse override must not survive.
        rerender({ depth: 1 });
        expect(result.current.isGroupExpanded(hr)).toBe(true);
    });

    it('does not reorder the memoized tree when getVisibleRows sorts', () => {
        const { result } = renderHook(() => useRowGrouping({ ...BASE_PARAMS, sortModel: SORT_DESC, defaultGroupingExpansionDepth: -1 }));
        const eng = [...result.current.treeNodes.values()].find(n => n.groupingValue === 'Engineering')!;
        const before = [...eng.children!];
        result.current.getVisibleRows();
        expect(eng.children).toEqual(before);
    });
});

const SORT_DESC = [{ field: 'name', sort: 'desc' as const }];

type SaleRow = GridRowModel & { id: number; region: unknown; team: string; amount: number; first?: string; last?: string };
const saleId = (r: SaleRow) => r.id;
const groupMetasOf = (map: Map<unknown, GridRowMeta>) =>
    [...map.values()].filter(meta => meta.isGroupRow && !meta.isGroupFooter);

describe('useRowGrouping — groupable: false keeps the other levels at their depth', () => {
    const columns: GridColDef<SaleRow>[] = [{ field: 'region', groupable: false }, { field: 'team' }, { field: 'amount' }];
    const rows: SaleRow[] = [
        { id: 1, region: 'EU', team: 'Alpha', amount: 1 },
        { id: 2, region: 'US', team: 'Alpha', amount: 2 },
        { id: 3, region: 'EU', team: 'Beta', amount: 3 },
    ];

    it('groups as if the skipped field was not in the model', () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, columns, rowGroupingModel: ['region', 'team'], defaultGroupingExpansionDepth: 1 }));
        const top = [...result.current.treeNodes.values()].filter(n => n.parentId === null);
        expect(top.map(n => [n.groupingField, n.depth])).toEqual([['team', 0], ['team', 0]]);
        // defaultGroupingExpansionDepth=1 expands the top level, so the leaves (depth 1) are visible.
        expect((result.current.getVisibleRows() ?? []).map(r => r.id)).toContain(1);
        expect(result.current.rowMetaMap.get(1)?.treeDepth).toBe(1);
    });
});

describe('useRowGrouping — group values', () => {
    it('keeps values with the same text in separate groups (null / "null", 1 / "1", true / "true")', () => {
        const rows: SaleRow[] = [
            { id: 1, region: null, team: 't', amount: 1 },
            { id: 2, region: 'null', team: 't', amount: 2 },
            { id: 3, region: 1, team: 't', amount: 3 },
            { id: 4, region: '1', team: 't', amount: 4 },
            { id: 5, region: true, team: 't', amount: 5 },
            { id: 6, region: 'true', team: 't', amount: 6 },
        ];
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' } }));
        const groups = [...result.current.treeNodes.values()].filter(n => n.children && n.children.length > 0);
        expect(groups.map(g => g.groupingValue)).toEqual([null, 'null', 1, '1', true, 'true']);
        expect(groups.map(g => g.aggregatedValues?.amount)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(new Set(groups.map(g => g.id)).size).toBe(6);
    });

    it('puts equal dates in one group', () => {
        const rows: SaleRow[] = [
            { id: 1, region: new Date(2024, 0, 1), team: 't', amount: 1 },
            { id: 2, region: new Date(2024, 0, 1), team: 't', amount: 2 },
        ];
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'] }));
        expect(groupMetasOf(result.current.rowMetaMap)).toHaveLength(1);
    });

    it('groups a computed column by its valueGetter value', () => {
        const columns: GridColDef<SaleRow>[] = [
            { field: 'full', valueGetter: ({ row }) => [row.first, row.last].join(' ') },
            { field: 'amount' },
        ];
        const rows: SaleRow[] = [
            { id: 1, region: 'x', team: 't', amount: 1, first: 'Ann', last: 'Lee' },
            { id: 2, region: 'x', team: 't', amount: 2, first: 'Bob', last: 'Ray' },
        ];
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, columns, rowGroupingModel: ['full'] }));
        expect(groupMetasOf(result.current.rowMetaMap).map(m => m.groupLabel)).toEqual(['full: Ann Lee', 'full: Bob Ray']);
    });
});

describe('useRowGrouping — the filter', () => {
    const rows: SaleRow[] = [
        { id: 1, region: 'N', team: 'a', amount: 100 },
        { id: 2, region: 'N', team: 'b', amount: 5 },
        { id: 3, region: 'S', team: 'b', amount: 7 },
    ];
    const filterModel = { items: [{ field: 'team', operator: 'equals' as const, value: 'a' }] };

    it('aggregates and counts only the leaves that pass it, and drops groups with none', () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' }, filterModel, defaultGroupingExpansionDepth: -1 }));
        const visible = result.current.getVisibleRows() ?? [];
        expect(visible.map(r => r.id)).toEqual([visible[0].id, 1]);
        expect(visible[0].amount).toBe(100);
        expect(result.current.rowMetaMap.get(visible[0].id)?.descendantCount).toBe(1);
        expect(groupMetasOf(result.current.rowMetaMap)).toHaveLength(1);
    });

    it("builds the groups from the rows as they are with filterMode 'server'", () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], filterModel, filterMode: 'server', defaultGroupingExpansionDepth: -1 }));
        expect((result.current.getVisibleRows() ?? []).filter(r => typeof r.id === 'number').map(r => r.id)).toEqual([1, 2, 3]);
    });
});

describe('useRowGrouping — sorting', () => {
    const rows: SaleRow[] = [
        { id: 1, region: 'South', team: 'b', amount: 1 },
        { id: 2, region: 'North', team: 'a', amount: 2 },
    ];
    const columnLookup = buildColumnLookup([{ field: 'team' }, { field: 'region' }, { field: 'amount', type: 'number' }]);
    const groupValues = (visible: SaleRow[] | null) => (visible ?? []).filter(r => typeof r.id === 'string').map(r => r.region);

    it('orders groups by their grouping value when sorting by the column that shows the labels', () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], sortModel: [{ field: 'team', sort: 'asc' }], columnLookup }));
        expect(groupValues(result.current.getVisibleRows('team'))).toEqual(['North', 'South']);
        // Without a label column, 'team' is a column the groups have no value for: first-appearance order.
        expect(groupValues(result.current.getVisibleRows())).toEqual(['South', 'North']);
    });

    it('orders groups by their aggregate when sorting by an aggregated column', () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' }, sortModel: [{ field: 'amount', sort: 'desc' }], columnLookup }));
        expect(groupValues(result.current.getVisibleRows())).toEqual(['North', 'South']);
    });

    it("keeps the server's order with sortingMode 'server'", () => {
        const { result } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], sortModel: [{ field: 'region', sort: 'asc' }], sortingMode: 'server', columnLookup }));
        expect(groupValues(result.current.getVisibleRows())).toEqual(['South', 'North']);
    });
});

describe('useRowGrouping — getAggregationPosition', () => {
    const rows: SaleRow[] = [
        { id: 1, region: 'A', team: 'x', amount: 10 },
        { id: 2, region: 'A', team: 'y', amount: 20 },
        { id: 3, region: 'B', team: 'z', amount: 5 },
    ];
    type Position = 'inline' | 'footer' | null;
    const mount = (getAggregationPosition: (node: GridTreeNode | null) => Position, defaultGroupingExpansionDepth = -1) =>
        renderHook(() => useRowGrouping({ rows, getRowId: saleId, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' }, defaultGroupingExpansionDepth, getAggregationPosition }));

    it('is called for every group with its expansion state, and once with null for the grand total', () => {
        const spy = vi.fn((node: GridTreeNode | null): Position => (node === null ? 'footer' : 'inline'));
        const { result } = mount(spy);
        expect(spy).toHaveBeenCalledWith(null);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ groupingValue: 'A', isExpanded: true }));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ groupingValue: 'B', isExpanded: true }));
        expect(result.current.rootAggregationPosition).toBe('footer');
    });

    it('null hides the group aggregates and the grand total', () => {
        const { result } = mount(() => null);
        const groups = (result.current.getVisibleRows() ?? []).filter(r => typeof r.id === 'string');
        expect(groups.map(r => r.amount)).toEqual([undefined, undefined]);
        expect(result.current.rootAggregationPosition).toBeNull();
    });

    it("'footer' moves the aggregates to a subtotal row after the group's children", () => {
        const { result } = mount(() => 'footer');
        const visible = result.current.getVisibleRows() ?? [];
        const kinds = visible.map(r => {
            const meta = result.current.rowMetaMap.get(r.id);
            if (meta?.isGroupFooter) return 'footer:' + String(r.amount);
            if (meta?.isGroupRow) return 'group:' + String(r.amount ?? '-');
            return 'leaf:' + String(r.id);
        });
        expect(kinds).toEqual(['group:-', 'leaf:1', 'leaf:2', 'footer:30', 'group:-', 'leaf:3', 'footer:5']);
        expect(result.current.rowMetaMap.get(visible[3].id)).toMatchObject({ isGroupRow: true, isGroupFooter: true, hasChildren: false, treeDepth: 1, groupingValue: 'A' });
    });

    it("'footer' keeps the aggregates on the group row while the group is collapsed", () => {
        const { result } = mount(() => 'footer', 0);
        const visible = result.current.getVisibleRows() ?? [];
        expect(visible.map(r => r.amount)).toEqual([30, 5]);
    });

    it('an inline callback does not rebuild the rows on every render', () => {
        const { result, rerender } = renderHook(() => useRowGrouping({
            rows, getRowId: saleId, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' },
            getAggregationPosition: (node) => (node === null ? 'footer' : 'inline'),
        }));
        const before = result.current.getVisibleRows;
        rerender();
        expect(result.current.getVisibleRows).toBe(before);
    });
});

describe('useRowGrouping — models passed inline', () => {
    it('does not rebuild the groups when an equal rowGroupingModel or aggregationModel is passed again', () => {
        const formatter = vi.fn(({ value }: { field: string; value: unknown }) => String(value));
        const columns: GridColDef<SaleRow>[] = [{ field: 'region', groupingValueFormatter: formatter }, { field: 'amount' }];
        const rows: SaleRow[] = [{ id: 1, region: 'A', team: 'x', amount: 1 }];
        const { result, rerender } = renderHook(() => useRowGrouping({ rows, getRowId: saleId, columns, rowGroupingModel: ['region'], aggregationModel: { amount: 'sum' } }));
        const calls = formatter.mock.calls.length;
        const treeNodes = result.current.treeNodes;
        rerender();
        rerender();
        expect(formatter.mock.calls.length).toBe(calls);
        expect(result.current.treeNodes).toBe(treeNodes);
    });
});
