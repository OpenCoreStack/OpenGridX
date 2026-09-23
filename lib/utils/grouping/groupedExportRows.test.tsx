import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useEffect } from 'react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'team', headerName: 'Team', width: 100 },
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'score', headerName: 'Score', width: 100, type: 'number' },
];
const ROWS: GridRowModel[] = [
    { id: 1, team: 'B', name: 'z', score: 1 },
    { id: 2, team: 'A', name: 'y', score: 2 },
    { id: 3, team: 'B', name: 'x', score: 3 },
];

function exportRows(extra: Partial<DataGridProps> = {}): GridGroupedExportRow[] {
    const out: { api: GridApi | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        useEffect(() => { out.api = apiRef.current; });
        return <DataGrid rows={ROWS} columns={COLS} apiRef={apiRef} rowGroupingModel={['team']} {...extra} />;
    }
    render(<Harness />);
    return out.api!.getGroupedExportRows()!;
}

const describeEntry = (e: GridGroupedExportRow) =>
    e.type === 'leaf' ? `leaf:${String(e.row!.id)}` : `${e.type}:${String(e.groupValue ?? '')}`;

describe('getGroupedExportRows', () => {
    it('exports the rows of collapsed groups', () => {
        expect(exportRows().map(describeEntry)).toEqual([
            'group-header:B', 'leaf:1', 'leaf:3',
            'group-header:A', 'leaf:2',
        ]);
    });

    it('orders groups and leaves like the sorted screen', () => {
        const entries = exportRows({ sortModel: [{ field: 'team', sort: 'asc' }] });
        expect(entries.filter(e => e.type === 'group-header').map(e => e.groupValue)).toEqual(['A', 'B']);

        const byName = exportRows({ sortModel: [{ field: 'name', sort: 'asc' }] });
        expect(byName.filter(e => e.type === 'leaf').map(e => e.row!.id)).toEqual([3, 1, 2]);
    });

    it('leaves out filtered rows and groups left empty by the filter', () => {
        const entries = exportRows({ filterModel: { items: [{ field: 'name', operator: 'equals', value: 'x' }] } });
        expect(entries.map(describeEntry)).toEqual(['group-header:B', 'leaf:3']);
    });

    it('computes subtotals over the exported (filtered) leaves, then adds the grand total', () => {
        const entries = exportRows({
            aggregationModel: { score: 'sum' },
            filterModel: { items: [{ field: 'name', operator: 'not', value: 'z' }] },
        });
        expect(entries.map(describeEntry)).toEqual([
            'group-header:B', 'leaf:3', 'group-subtotal:B',
            'group-header:A', 'leaf:2', 'group-subtotal:A',
            'grand-total:',
        ]);
        const subtotals = entries.filter(e => e.type === 'group-subtotal').map(e => e.aggregatedValues?.score);
        expect(subtotals).toEqual([3, 2]);
        expect(entries[entries.length - 1].aggregatedValues?.score).toBe(5);
    });

    it('nests subtotals under a two-level grouping', () => {
        const rows: GridRowModel[] = [
            { id: 1, team: 'A', role: 'dev', score: 1 },
            { id: 2, team: 'A', role: 'qa', score: 2 },
            { id: 3, team: 'A', role: 'dev', score: 4 },
        ];
        const out: { api: GridApi | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { out.api = apiRef.current; });
            return <DataGrid rows={rows} columns={[{ field: 'team' }, { field: 'role' }, { field: 'score', type: 'number' }]}
                apiRef={apiRef} rowGroupingModel={['team', 'role']} aggregationModel={{ score: 'sum' }} />;
        }
        render(<Harness />);
        const entries = out.api!.getGroupedExportRows()!;
        expect(entries.map(e => `${describeEntry(e)}@${e.depth}`)).toEqual([
            'group-header:A@0',
            'group-header:dev@1', 'leaf:1@2', 'leaf:3@2', 'group-subtotal:dev@1',
            'group-header:qa@1', 'leaf:2@2', 'group-subtotal:qa@1',
            'group-subtotal:A@0',
            'grand-total:@0',
        ]);
        expect(entries.filter(e => e.type === 'group-subtotal').map(e => e.aggregatedValues?.score)).toEqual([5, 2, 7]);
    });
});
