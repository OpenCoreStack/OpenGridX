import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef } from '../../types';

const ROWS = [
    { id: 1, name: 'a', age: 1, team: 'x' },
    { id: 2, name: 'b', age: 2, team: 'y' },
];

function openMenu(container: HTMLElement, field: string) {
    fireEvent.click(container.querySelector(`[data-field="${field}"] .ogx__menu-icon-btn`) as HTMLElement);
}

function headerFields(container: HTMLElement) {
    return Array.from(container.querySelectorAll('.ogx__header [data-field]')).map(e => e.getAttribute('data-field'));
}

describe('ColumnMenu — hideable', () => {
    it('offers Hide Column only for columns that can be hidden', () => {
        const cols: GridColDef[] = [
            { field: 'name', headerName: 'Name', hideable: false },
            { field: 'age', headerName: 'Age' },
        ];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} />);

        openMenu(container, 'name');
        expect(screen.queryByRole('menuitem', { name: 'Hide Name column' })).toBeNull();
        fireEvent.keyDown(document, { key: 'Escape' });

        openMenu(container, 'age');
        fireEvent.click(screen.getByRole('menuitem', { name: 'Hide Age column' }));
        expect(headerFields(container)).toEqual(['name']);
    });
});

describe('ColumnMenu — pinnable', () => {
    it('offers no pin actions for a pinnable:false column', () => {
        const onPinnedColumnsChange = vi.fn();
        const cols: GridColDef[] = [
            { field: 'name', headerName: 'Name', pinnable: false },
            { field: 'age', headerName: 'Age' },
        ];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} onPinnedColumnsChange={onPinnedColumnsChange} />);

        openMenu(container, 'name');
        expect(screen.queryByRole('menuitemradio', { name: 'Pin to left' })).toBeNull();
        expect(screen.queryByRole('menuitemradio', { name: 'Pin to right' })).toBeNull();
        expect(screen.queryByRole('menuitemradio', { name: 'Unpin column' })).toBeNull();
        expect(screen.queryByText('Pin column')).toBeNull();
        fireEvent.keyDown(document, { key: 'Escape' });

        openMenu(container, 'age');
        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Pin to left' }));
        expect(onPinnedColumnsChange).toHaveBeenCalledWith({ left: ['age'], right: [] });
    });

    it('offers neither hide nor pin actions for the synthetic grouping column', () => {
        const cols: GridColDef[] = [{ field: 'team', headerName: 'Team' }, { field: 'name', headerName: 'Name' }];
        const { container } = render(
            <DataGrid rows={ROWS} columns={cols} rowGroupingModel={['team']} groupingColDef={{ headerName: 'Group' }} />
        );

        openMenu(container, '__group__');
        expect(screen.getByRole('menu', { name: 'Column options for Group' })).toBeTruthy();
        expect(screen.queryByRole('menuitem', { name: 'Hide Group column' })).toBeNull();
        expect(screen.queryByRole('menuitemradio', { name: 'Unpin column' })).toBeNull();
    });
});
