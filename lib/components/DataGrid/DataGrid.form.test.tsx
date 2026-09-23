import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { GridColDef, GridFilterModel, GridRowModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'price', headerName: 'Price', type: 'number' },
];
const ROWS: GridRowModel[] = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `r${i + 1}`, price: i }));

/** Every <button> the grid has put in the document (the panels and the menu are portalled). */
function submitButtons(): string[] {
    return Array.from(document.querySelectorAll('button'))
        .filter(btn => btn.type !== 'button')
        .map(btn => btn.getAttribute('aria-label') || btn.textContent || btn.className);
}

function GridInForm({ onSubmit, withToolbar = true }: { onSubmit: (e: React.FormEvent) => void; withToolbar?: boolean }) {
    const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
        items: [
            { id: 1, field: 'name', operator: 'contains', value: 'r' },
            { id: 2, field: 'price', operator: '>', value: -1 },
        ],
        quickFilterValues: ['r'],
    });
    return (
        <form onSubmit={onSubmit}>
            <DataGrid
                rows={ROWS}
                columns={COLS}
                pagination
                pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                onPivotModelChange={() => {}}
                slots={withToolbar ? { toolbar: GridToolbar as never } : undefined}
            />
        </form>
    );
}

// The first render of a full grid with toolbar and pager is slow on a loaded machine.
describe('DataGrid inside a <form>', { timeout: 20000 }, () => {
    it('pagination, column-menu and toolbar clicks never submit the form', () => {
        const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
        const { container } = render(<GridInForm onSubmit={onSubmit} />);

        fireEvent.click(screen.getByLabelText('Go to next page'));
        fireEvent.click(container.querySelector('.ogx__menu-icon-btn') as HTMLElement);
        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Pin to left' }));
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        fireEvent.click(screen.getByRole('button', { name: 'sum' }));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('renders no submit buttons in the toolbar, its panels, the column menu or the pager', () => {
        const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
        const { container } = render(<GridInForm onSubmit={onSubmit} />);

        expect(submitButtons()).toEqual([]);

        fireEvent.click(container.querySelector('.ogx__menu-icon-btn') as HTMLElement);
        expect(submitButtons()).toEqual([]);
        fireEvent.keyDown(document, { key: 'Escape' });

        for (const label of ['Configure summaries', 'Configure pivot', 'Advanced filters', 'Manage columns']) {
            fireEvent.click(screen.getByLabelText(label));
            expect(submitButtons()).toEqual([]);
        }
    });

    it('the standalone Columns panel opened from the column menu has no submit buttons', () => {
        const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
        const { container } = render(<GridInForm onSubmit={onSubmit} withToolbar={false} />);

        fireEvent.click(container.querySelector('.ogx__menu-icon-btn') as HTMLElement);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Manage all columns' }));
        expect(document.querySelector('.ogx-column-visibility-panel')).not.toBeNull();
        expect(submitButtons()).toEqual([]);
    });
});
