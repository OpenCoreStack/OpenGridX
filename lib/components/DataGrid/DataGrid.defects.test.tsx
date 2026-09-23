import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { GridColDef } from '../../types';

type GridApiRef = ReturnType<typeof useGridApiRef>;

// Regression tests for the OpenGridX 2.0.4 consumer defect report.

type Row = { id: number; region: string; amount: number };

const ROWS: Row[] = [
    { id: 1, region: 'North', amount: 1200 },
    { id: 2, region: 'North', amount: 800 },
    { id: 3, region: 'South', amount: 450 },
];

const COLUMNS: GridColDef<Row>[] = [
    { field: 'region', headerName: 'Region', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150, valueFormatter: ({ value }) => `$${String(value)}` },
];

describe('D3 — valueFormatter survives row grouping', () => {
    it('renders formatted values without grouping', () => {
        render(<DataGrid rows={ROWS} columns={COLUMNS} />);
        expect(screen.getByText('$1200')).toBeInTheDocument();
    });

    it('renders formatted values for leaf rows when rowGroupingModel is active', () => {
        render(<DataGrid rows={ROWS} columns={COLUMNS} rowGroupingModel={['region']} defaultGroupingExpansionDepth={-1} />);
        expect(screen.getByText('$1200')).toBeInTheDocument();
        expect(screen.queryByText('1200')).not.toBeInTheDocument();
    });

    it('passes formattedValue to a consumer renderCell', () => {
        const renderCell = vi.fn(() => null);
        const cols: GridColDef<Row>[] = [COLUMNS[0], { ...COLUMNS[1], renderCell }];
        render(<DataGrid rows={ROWS} columns={cols} />);
        expect(renderCell).toHaveBeenCalledWith(expect.objectContaining({ value: 1200, formattedValue: '$1200' }));
    });
});

describe('D2 — slots that were typed but never rendered', () => {
    it('renders slots.footer with grid state, replacing the default pagination', () => {
        const Footer = vi.fn((props: Record<string, unknown>) => <div data-testid="footer">rows:{String(props.rowCount)} note:{String(props.note)}</div>);
        render(
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                pagination
                aggregationModel={{ amount: 'sum' }}
                slots={{ footer: Footer }}
                slotProps={{ footer: { note: 'hi' } }}
            />
        );
        expect(screen.getByTestId('footer')).toHaveTextContent('rows:3 note:hi');
        expect(Footer).toHaveBeenCalledWith(expect.objectContaining({ aggregationResult: { amount: 2450 } }), undefined);
        expect(document.querySelector('.ogx-pagination, .ogx__pagination')).toBeNull();
    });

    it('renders slots.noRowsOverlay when there are no rows', () => {
        render(<DataGrid rows={[]} columns={COLUMNS} slots={{ noRowsOverlay: () => <div>Nothing here</div> }} />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders slots.loadingOverlay while loading with no rows', () => {
        render(<DataGrid rows={[]} columns={COLUMNS} loading slots={{ loadingOverlay: () => <div>Fetching…</div> }} />);
        expect(screen.getByText('Fetching…')).toBeInTheDocument();
    });
});

describe('D6 — onRowDoubleClick', () => {
    it('fires with the row params on double-click', () => {
        const onRowDoubleClick = vi.fn();
        render(<DataGrid rows={ROWS} columns={COLUMNS} onRowDoubleClick={onRowDoubleClick} />);
        fireEvent.doubleClick(screen.getByText('$800'));
        expect(onRowDoubleClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2, row: ROWS[1] }));
    });

    it('fires in list view as well', () => {
        const onRowDoubleClick = vi.fn();
        render(
            <DataGrid rows={ROWS} columns={COLUMNS} listView
                listViewColumn={{ field: 'card', renderCell: ({ row }) => <span>card-{row.id}</span> }}
                onRowDoubleClick={onRowDoubleClick} />
        );
        fireEvent.doubleClick(screen.getByText('card-3'));
        expect(onRowDoubleClick).toHaveBeenCalledWith(expect.objectContaining({ id: 3, row: ROWS[2] }));
    });
});

describe('Row grouping — expansion survives row edits', () => {
    it('keeps a user-expanded group open when the rows prop changes', () => {
        const { rerender, container } = render(<DataGrid rows={ROWS} columns={COLUMNS} rowGroupingModel={['region']} />);
        const rowCount = () => container.querySelectorAll('.ogx__rows [role="row"]').length;
        expect(rowCount()).toBe(2);

        fireEvent.click(container.querySelector('.ogx__rows [role="row"]')!);
        expect(rowCount()).toBe(4);

        rerender(<DataGrid rows={ROWS.map(r => (r.id === 1 ? { ...r, amount: 1300 } : r))} columns={COLUMNS} rowGroupingModel={['region']} />);
        expect(rowCount()).toBe(4);
        expect(screen.getByText('$1300')).toBeInTheDocument();
    });
});

describe('D3 acceptance (2.1.0 retest) — valueFormatter in all three states', () => {
    const money = ({ value }: { value: unknown }) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const cols: GridColDef<Row>[] = [
        { field: 'region', headerName: 'Region', groupingValueFormatter: ({ value }) => `Region: ${String(value)}` },
        { field: 'amount', headerName: 'Amount', type: 'number', valueFormatter: money },
    ];
    const cellsOf = (row: Element) => [...row.querySelectorAll('[role="gridcell"]')].map(c => c.textContent);

    it('formats ungrouped cells', () => {
        render(<DataGrid rows={ROWS} columns={cols} />);
        expect(screen.getByText('1,200.00')).toBeInTheDocument();
    });

    it('formats the aggregate on a group-header row', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} aggregationModel={{ amount: 'sum' }} />);
        const header = container.querySelector('.ogx__rows [role="row"]')!;
        expect(cellsOf(header)).toContain('2,000.00');
    });

    it('formats data cells inside an expanded group', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} aggregationModel={{ amount: 'sum' }} />);
        fireEvent.click(container.querySelector('.ogx__rows [role="row"]')!);
        const leaf = container.querySelectorAll('.ogx__rows [role="row"]')[1];
        expect(cellsOf(leaf)).toContain('1,200.00');
    });
});

describe('Row grouping — group label and toggle follow the leftmost on-screen column', () => {
    const cols: GridColDef<Row>[] = [
        { field: 'region', headerName: 'Region', groupingValueFormatter: ({ value }) => `Region: ${String(value)}` },
        { field: 'amount', headerName: 'Amount' },
    ];
    const firstCellOfFirstRow = (c: HTMLElement) => c.querySelector('.ogx__rows [role="row"] [role="gridcell"]')!;

    it('keeps the label and toggle when the first column is hidden', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} columnVisibilityModel={{ region: false }} />);
        const cell = firstCellOfFirstRow(container);
        expect(cell.getAttribute('data-field')).toBe('amount');
        expect(cell.textContent).toContain('Region: North');
        expect(cell.querySelector('.ogx-expand-icon, [aria-expanded], svg')).not.toBeNull();
    });

    it('puts the label in the first column of a custom columnOrder', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} columnOrder={['amount', 'region']} />);
        const cell = firstCellOfFirstRow(container);
        expect(cell.getAttribute('data-field')).toBe('amount');
        expect(cell.textContent).toContain('Region: North');
    });

    it('puts the label in a column pinned to the left', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} pinnedColumns={{ left: ['amount'] }} />);
        const cell = firstCellOfFirstRow(container);
        expect(cell.getAttribute('data-field')).toBe('amount');
        expect(cell.textContent).toContain('Region: North');
    });
});

describe('getGroupedExportRows carries the grid label', () => {
    it('sets groupLabel from groupingValueFormatter on group-header entries', () => {
        let api: GridApiRef | null = null;
        const cols: GridColDef<Row>[] = [
            { field: 'region', headerName: 'Region', groupingValueFormatter: ({ value }) => `Region: ${String(value)}` },
            { field: 'amount', headerName: 'Amount' },
        ];
        function Harness({ onApi }: { onApi: (a: GridApiRef) => void }) {
            const apiRef = useGridApiRef();
            useEffect(() => { onApi(apiRef); }, [apiRef, onApi]);
            return <DataGrid apiRef={apiRef} rows={ROWS} columns={cols} rowGroupingModel={['region']} />;
        }
        render(<Harness onApi={(a) => { api = a; }} />);
        const headers = api!.current.getGroupedExportRows()!.filter(e => e.type === 'group-header');
        expect(headers.map(h => h.groupLabel)).toEqual(expect.arrayContaining(['Region: North', 'Region: South']));
    });
});

describe('v3.0 — row objects are passed through unchanged under hierarchy', () => {
    const UNDERSCORE = ['_hasChildren', '_treeDepth', '_isExpanded', '_groupingField', '_groupingValue', '_descendantCount', '_isGroupRow'];

    it('row grouping hands renderCell the consumer row object with no injected fields', () => {
        const seen: Row[] = [];
        const cols: GridColDef<Row>[] = [
            { field: 'region', headerName: 'Region' },
            { field: 'amount', headerName: 'Amount', renderCell: (p) => { seen.push(p.row); return String(p.value); } },
        ];
        render(<DataGrid rows={ROWS} columns={cols} rowGroupingModel={['region']} defaultGroupingExpansionDepth={-1} />);
        const leaf = seen.find(r => r.id === 1)!;
        expect(leaf).toBe(ROWS[0]);
        for (const key of UNDERSCORE) expect(leaf).not.toHaveProperty(key);
    });

    it('tree data hands renderCell the consumer row object with no injected fields', () => {
        type TreeRow = { id: number; path: string[]; name: string };
        const rows: TreeRow[] = [
            { id: 1, path: ['A'], name: 'a' },
            { id: 2, path: ['A', 'B'], name: 'b' },
        ];
        const seen: TreeRow[] = [];
        const cols: GridColDef<TreeRow>[] = [
            { field: 'name', headerName: 'Name' },
            { field: 'id', headerName: 'Id', renderCell: (p) => { seen.push(p.row); return String(p.value); } },
        ];
        render(<DataGrid rows={rows} columns={cols} treeData getTreeDataPath={(r) => r.path} defaultGroupingExpansionDepth={-1} />);
        const child = seen.find(r => r.id === 2)!;
        expect(child).toBe(rows[1]);
        for (const key of UNDERSCORE) expect(child).not.toHaveProperty(key);
    });
});
