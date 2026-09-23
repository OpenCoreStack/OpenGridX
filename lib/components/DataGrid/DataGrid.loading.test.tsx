import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridDataSource, GridListViewColDef, GridRowModel } from '../../types';

type Row = GridRowModel & { id: number; name: string };
const COLS: GridColDef<Row>[] = [{ field: 'name', headerName: 'Name', width: 150 }];
const ROWS: Row[] = [{ id: 1, name: 'alpha' }, { id: 2, name: 'beta' }];
const LIST_COL: GridListViewColDef<Row> = {
    field: 'card',
    renderCell: (p) => <div data-testid="card">{p.row.name}</div>,
};
const Loader = () => <div data-testid="custom-loader">loading…</div>;
const NoRows = () => <div data-testid="custom-no-rows">nothing here</div>;
const Footer = () => <div data-testid="custom-footer">footer</div>;

afterEach(() => { vi.restoreAllMocks(); });

describe('loading with rows already shown', () => {
    it('keeps the rows and shows a progress bar', () => {
        render(<DataGrid rows={ROWS} columns={COLS} loading />);
        expect(screen.getByText('alpha')).toBeTruthy();
        expect(screen.getByRole('progressbar', { name: 'Loading data' })).toBeTruthy();
    });

    it('shows slots.loadingOverlay over the rows', () => {
        render(<DataGrid rows={ROWS} columns={COLS} loading slots={{ loadingOverlay: Loader }} />);
        expect(screen.getByText('alpha')).toBeTruthy();
        expect(screen.getByTestId('custom-loader')).toBeTruthy();
    });

    it('shows nothing once loading ends', () => {
        const { rerender } = render(<DataGrid rows={ROWS} columns={COLS} loading />);
        rerender(<DataGrid rows={ROWS} columns={COLS} loading={false} />);
        expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('shows it in list view too', () => {
        render(<DataGrid rows={ROWS} columns={COLS} loading listView listViewColumn={LIST_COL} slots={{ loadingOverlay: Loader }} />);
        expect(screen.getAllByTestId('card')).toHaveLength(2);
        expect(screen.getByTestId('custom-loader')).toBeTruthy();
    });
});

describe('list view slots and states', () => {
    it('does not show the empty state while loading with no rows', () => {
        const { container } = render(<DataGrid rows={[]} columns={COLS} loading listView listViewColumn={LIST_COL} />);
        expect(container.querySelector('.ogx-list-view__empty')).toBeNull();
        expect(screen.getByRole('progressbar', { name: 'Loading data' })).toBeTruthy();
    });

    it('does not show the empty state while a data source fetch is pending', async () => {
        const pending: GridDataSource<Row> = { getRows: () => new Promise(() => { /* stays pending */ }) };
        const { container } = render(
            <DataGrid rows={[]} columns={COLS} dataSource={pending} paginationMode="server" pagination listView listViewColumn={LIST_COL} />
        );
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(container.querySelector('.ogx-list-view__empty')).toBeNull();
    });

    it('renders slots.loadingOverlay while loading with no rows', () => {
        render(<DataGrid rows={[]} columns={COLS} loading listView listViewColumn={LIST_COL} slots={{ loadingOverlay: Loader }} />);
        expect(screen.getByTestId('custom-loader')).toBeTruthy();
    });

    it('renders slots.noRowsOverlay when empty', () => {
        render(<DataGrid rows={[]} columns={COLS} listView listViewColumn={LIST_COL} slots={{ noRowsOverlay: NoRows }} />);
        expect(screen.getByTestId('custom-no-rows')).toBeTruthy();
    });

    it('renders slots.footer in place of the pagination controls', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} listView listViewColumn={LIST_COL} pagination slots={{ footer: Footer }} />
        );
        expect(screen.getByTestId('custom-footer')).toBeTruthy();
        expect(container.querySelector('.ogx-pagination')).toBeNull();
    });

    it('falls back to the grid view and warns when listViewColumn is missing', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} listView />);
        expect(screen.getByText('alpha')).toBeTruthy();
        expect(container.querySelector('.ogx-list-view')).toBeNull();
        expect(warn.mock.calls.some(args => String(args[0]).includes('listViewColumn'))).toBe(true);
    });
});
