import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRowGrouping } from './useRowGrouping';
import { buildColumnLookup } from '../utils/columnLookup';
import { AGGREGATION_FUNCTIONS } from '../utils/aggregation';
import type { GridColDef, GridRowModel, GridSortItem } from '../types';

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const REGIONS = ['North', 'South', 'East', null, 'north'];
const STATUS = ['Open', 'Done', 3, '3'];

function makeRows(count: number, seed: number): GridRowModel[] {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, id) => ({
        id,
        region: REGIONS[Math.floor(rand() * REGIONS.length)],
        status: STATUS[Math.floor(rand() * STATUS.length)],
        amount: rand() < 0.1 ? null : Math.round((rand() - 0.3) * 1e6) / 100,
        name: `n${Math.floor(rand() * 50)}`,
    }));
}

const PLAIN: GridColDef[] = [{ field: 'region' }, { field: 'status' }, { field: 'amount', type: 'number' }, { field: 'name' }];
const GETTERS: GridColDef[] = PLAIN.map(col => ({ ...col, valueGetter: ({ value }) => value }));

function run(rows: GridRowModel[], columns: GridColDef[], sortModel: GridSortItem[] = [], filter = false) {
    const { result } = renderHook(() => useRowGrouping({
        rows,
        getRowId: (row: GridRowModel) => row.id,
        columns,
        columnLookup: buildColumnLookup(columns),
        rowGroupingModel: ['region', 'status'],
        aggregationModel: { amount: 'sum', name: 'count' },
        defaultGroupingExpansionDepth: -1,
        sortModel,
        filterModel: filter ? { items: [{ field: 'amount', operator: '>', value: 0 }] } : undefined,
    }));
    return result.current;
}

/** A plain model of the expected tree: groups in first-appearance order, children in row order. */
function referenceVisibleIds(rows: GridRowModel[], depth = 0, fields = ['region', 'status'], parent: string | null = null): Array<string | number> {
    if (depth === fields.length) return rows.map(r => r.id);
    const buckets = new Map<unknown, GridRowModel[]>();
    for (const row of rows) {
        const key = row[fields[depth]];
        const bucket = buckets.get(key);
        if (bucket) bucket.push(row);
        else buckets.set(key, [row]);
    }
    const out: Array<string | number> = [];
    buckets.forEach((bucketRows, value) => {
        out.push(`${fields[depth]}=${String(value)}@${parent ?? 'root'}`);
        out.push(...referenceVisibleIds(bucketRows, depth + 1, fields, `${String(value)}`));
    });
    return out;
}

describe('useRowGrouping on random data', () => {
    for (let seed = 1; seed <= 4; seed++) {
        it(`seed ${seed}: tree, aggregates and metadata`, () => {
            const rows = makeRows(1500, seed);
            const grouping = run(rows, PLAIN);
            const visible = grouping.getVisibleRows() ?? [];
            const shape = visible.map(row => {
                const meta = grouping.rowMetaMap.get(row.id);
                return meta?.isGroupRow ? `${meta.groupingField}=${String(meta.groupingValue)}@${meta.treeDepth === 0 ? 'root' : String(grouping.treeNodes.get(grouping.treeNodes.get(row.id)?.parentId ?? '')?.groupingValue)}` : row.id;
            });
            expect(shape).toEqual(referenceVisibleIds(rows));

            // Group sums equal the shared aggregation function over the group's leaves.
            grouping.treeNodes.forEach(node => {
                if (!node.children) return;
                const leaves: GridRowModel[] = [];
                const collect = (ids: readonly (string | number)[]) => ids.forEach(id => {
                    const child = grouping.treeNodes.get(id);
                    if (child?.children) collect(child.children);
                    else leaves.push(rows[id as number]);
                });
                collect(node.children);
                leaves.sort((x, y) => (x.id as number) - (y.id as number)); // the group sums its rows in row order
                expect(node.aggregatedValues?.amount).toBe(AGGREGATION_FUNCTIONS.sum(leaves.map(r => r.amount)));
                expect(node.aggregatedValues?.name).toBe(leaves.length);
                expect(node.descendantCount).toBe(leaves.length);
            });

            // Leaf metadata.
            for (const row of rows) expect(grouping.rowMetaMap.get(row.id)).toEqual({ hasChildren: false, treeDepth: 2, isGroupRow: false });
        });

        it(`seed ${seed}: plain columns and valueGetter columns give the same result (sorted, filtered)`, () => {
            const rows = makeRows(800, seed + 10);
            const sortModel: GridSortItem[] = [{ field: 'amount', sort: 'desc' }, { field: 'name', sort: 'asc' }];
            for (const filter of [false, true]) {
                const a = run(rows, PLAIN, sortModel, filter);
                const b = run(rows, GETTERS, sortModel, filter);
                expect(a.getVisibleRows()).toEqual(b.getVisibleRows());
                expect([...a.rowMetaMap]).toEqual([...b.rowMetaMap]);
            }
        });
    }
});
