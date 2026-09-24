/**
 * PERFORMANCE regression (counting benchmark, deterministic): a parent re-render that passes a
 * new-but-equal `columns` array must not re-run the client-side filter / sort pass over every row.
 * In v2.1.0 filtering and sorting did not depend on column identity; on main the column lookup
 * (useGridColumnLookup) is keyed on `columns` identity, so inline column definitions make every
 * parent render re-filter and re-sort the full row set (valueGetter called once per row per render).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridFilterModel, GridSortItem } from '../../types';

interface PerfRow { id: number; name: string; amount: number; [key: string]: unknown }

const ROW_COUNT = 2000;
const rows: PerfRow[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i, name: `name ${i % 97}`, amount: (i * 7919) % 1000 }));

const counter = { calls: 0 };
// Stable function identity: only the column objects and the array are new on each render.
const doubleGetter = ({ row }: { row: PerfRow }) => { counter.calls++; return row.amount * 2; };

function makeColumns(): GridColDef<PerfRow>[] {
    return [
        { field: 'id', width: 80 },
        { field: 'name', width: 150 },
        {
            field: 'double', type: 'number', width: 100,
            valueGetter: doubleGetter,
        },
    ];
}

function renderGrid(extra: { sortModel?: GridSortItem[]; filterModel?: GridFilterModel }) {
    const view = render(
        <div style={{ height: 400, width: 600 }}>
            <DataGrid rows={rows} columns={makeColumns()} {...extra} />
        </div>
    );
    return { view };
}

describe('PERF: inline columns do not re-run filter/sort over all rows', () => {
    it('sorted by a valueGetter column: re-render with equal columns reads cells only for rendered rows', () => {
        const sortModel: GridSortItem[] = [{ field: 'double', sort: 'asc' }];
        const { view } = renderGrid({ sortModel });
        counter.calls = 0;
        for (let i = 0; i < 5; i++) {
            view.rerender(
                <div style={{ height: 400, width: 600 }}>
                    <DataGrid rows={rows} columns={makeColumns()} sortModel={sortModel} />
                </div>
            );
        }
        // Rendered cells only (a few dozen rows per render); a full re-sort costs ROW_COUNT per render.
        expect(counter.calls).toBeLessThan(ROW_COUNT);
    });

    it('quick filter active: re-render with equal columns does not re-filter every row', () => {
        const filterModel: GridFilterModel = { items: [], quickFilterValues: ['1'] };
        const { view } = renderGrid({ filterModel });
        counter.calls = 0;
        for (let i = 0; i < 5; i++) {
            view.rerender(
                <div style={{ height: 400, width: 600 }}>
                    <DataGrid rows={rows} columns={makeColumns()} filterModel={filterModel} />
                </div>
            );
        }
        expect(counter.calls).toBeLessThan(ROW_COUNT);
    });
});
