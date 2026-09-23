import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

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
