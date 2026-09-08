import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
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
