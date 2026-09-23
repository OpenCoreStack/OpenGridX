// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { DataGridProps, GridColDef } from '../../types';

// No DOM here: any `document` / `window` access during render throws, as it would in Next.js,
// Remix or any other renderToString / renderToPipeableStream pass.

type Row = { id: number; name: string; team: string; age: number; path: string[] };

const ROWS: Row[] = [
    { id: 1, name: 'Ada', team: 'A', age: 36, path: ['A'] },
    { id: 2, name: 'Linus', team: 'B', age: 54, path: ['A', 'Linus'] },
    { id: 3, name: 'Grace', team: 'A', age: 85, path: ['B'] },
];
const COLUMNS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'team', headerName: 'Team', width: 100 },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
];

function ssr(props: Partial<DataGridProps<Row>> = {}): string {
    return renderToString(<DataGrid<Row> rows={ROWS} columns={COLUMNS} {...props} />);
}

describe('DataGrid server-side rendering', () => {
    it('has no DOM globals in this environment', () => {
        expect(typeof document).toBe('undefined');
        expect(typeof window).toBe('undefined');
    });

    it('renders the default grid (standalone Columns panel mounted) with its rows', () => {
        const html = ssr();
        expect(html).toContain('ogx__header');
        expect(html).toContain('Ada');
        expect(html).toContain('Grace');
    });

    it('renders with the built-in toolbar', () => {
        expect(ssr({ slots: { toolbar: GridToolbar } })).toContain('Ada');
    });

    it.each<[string, Partial<DataGridProps<Row>>]>([
        ['checkbox selection and pinned columns', { checkboxSelection: true, pinnedColumns: { left: ['name'], right: ['age'] } }],
        ['row reordering and pinned rows', { rowReordering: true, pinnedRows: { top: [1], bottom: [3] } }],
        ['pagination', { pagination: true, paginationModel: { page: 0, pageSize: 2 }, pageSizeOptions: [2, 5] }],
        ['sorting, filtering and density', { sortModel: [{ field: 'age', sort: 'desc' }], filterModel: { items: [{ field: 'team', operator: 'equals', value: 'A' }] }, density: 'compact' }],
        ['row grouping with a grouping column and aggregation', { rowGroupingModel: ['team'], groupingColDef: { field: '__group__', headerName: 'Group' }, aggregationModel: { age: 'sum' } }],
        ['tree data', { treeData: true, getTreeDataPath: (row: Row) => row.path }],
        ['a detail panel', { getDetailPanelContent: ({ row }) => <div>Detail {row.name}</div> }],
        ['column groups', { columnGroupingModel: [{ groupId: 'who', headerName: 'Who', children: ['name', 'team'] }] }],
        ['list view', { listView: true, listViewColumn: { field: 'name', renderCell: ({ row }) => <b>{row.name}</b> } }],
        ['loading', { loading: true }],
        ['no rows', { rows: [] }],
    ])('renders with %s', (_label, props) => {
        expect(() => ssr(props)).not.toThrow();
    });
});
