import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRowGrouping } from './useRowGrouping';

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
