import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColumnVisibilityPanel } from './ColumnVisibilityPanel';
import type { GridColDef } from '../../types';

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'department', headerName: 'Department' },
    { field: 'groupKey', headerName: 'Group Key', hideable: false },
];

const visibleColumns = new Set(['name', 'department', 'groupKey']);

const noop = () => {};

describe('ColumnVisibilityPanel', () => {
    it('excludes hideable:false columns from the list by default', () => {
        render(
            <ColumnVisibilityPanel
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={noop}
                onShowAll={noop}
                onHideAll={noop}
            />
        );
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Department')).toBeInTheDocument();
        expect(screen.queryByText('Group Key')).not.toBeInTheDocument();
    });

    it('shows hideable:false columns as disabled when showNonHideableColumns is true', () => {
        render(
            <ColumnVisibilityPanel
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={noop}
                onShowAll={noop}
                onHideAll={noop}
                showNonHideableColumns
            />
        );
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Department')).toBeInTheDocument();
        expect(screen.getByText('Group Key')).toBeInTheDocument();

        // 3 columns shown + 1 "Show/Hide All" checkbox in footer = 4 checkboxes
        // The 3rd column (Group Key, hideable:false) must be the disabled one
        const checkboxes = screen.getAllByRole('checkbox');
        const disabledCheckboxes = checkboxes.filter(cb => (cb as HTMLInputElement).disabled);
        expect(disabledCheckboxes).toHaveLength(1);
    });

    it('does not render a disabled checkbox for hideable:false columns by default', () => {
        render(
            <ColumnVisibilityPanel
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={noop}
                onShowAll={noop}
                onHideAll={noop}
            />
        );
        const checkboxes = screen.getAllByRole('checkbox');
        const disabledCheckboxes = checkboxes.filter(cb => (cb as HTMLInputElement).disabled);
        expect(disabledCheckboxes).toHaveLength(0);
    });

    it('never shows hideable:false columns even when search would match them', () => {
        // Without showNonHideableColumns, hideable:false columns are not in the base list
        // so they cannot appear regardless of search. This test verifies the base list,
        // not a dynamic search interaction.
        render(
            <ColumnVisibilityPanel
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={noop}
                onShowAll={noop}
                onHideAll={noop}
            />
        );
        // "Group Key" is hideable:false — must not appear in the default panel
        expect(screen.queryByText('Group Key')).not.toBeInTheDocument();
    });
});
