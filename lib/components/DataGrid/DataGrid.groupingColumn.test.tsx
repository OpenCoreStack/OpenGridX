import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

type TRow = GridRowModel & { id: number; name: string; path: string[] };
const ROWS: TRow[] = [
    { id: 1, name: 'Root', path: ['root'] },
    { id: 2, name: 'Child', path: ['root', 'child'] },
];
const COLS: GridColDef<TRow>[] = [{ field: 'name', headerName: 'Name', width: 150 }];
const getPath = (row: TRow) => row.path;

const headerFields = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));
const groupCells = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('[role="gridcell"][data-field="__group__"]'));

describe('groupingColDef with tree data', () => {
    it('adds the grouping column first, with its header, showing each row\'s last path segment', () => {
        const { container, getByText } = render(
            <DataGrid rows={ROWS} columns={COLS} treeData getTreeDataPath={getPath} defaultGroupingExpansionDepth={-1}
                groupingColDef={{ field: 'ignored', headerName: 'Hierarchy', width: 200 }} />
        );
        expect(headerFields(container)).toEqual(['__group__', 'name']);
        expect(getByText('Hierarchy')).toBeTruthy();
        expect(groupCells(container).map(c => c.textContent)).toEqual(['root', 'child']);
    });

    it('puts the expand toggle in the grouping column', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} treeData getTreeDataPath={getPath}
                groupingColDef={{ field: 'ignored', headerName: 'Hierarchy' }} />
        );
        const [rootCell] = groupCells(container);
        const toggle = rootCell.querySelector('.ogx-expand-icon');
        expect(toggle).not.toBeNull();
        expect(groupCells(container)).toHaveLength(1);
        fireEvent.click(toggle!);
        expect(groupCells(container)).toHaveLength(2);
    });

    it('lets groupingColDef.valueGetter choose what the column shows', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} treeData getTreeDataPath={getPath} defaultGroupingExpansionDepth={-1}
                groupingColDef={{ field: 'ignored', headerName: 'Path', valueGetter: ({ row }) => row.path.join(' / ') }} />
        );
        expect(groupCells(container).map(c => c.textContent)).toEqual(['root', 'root / child']);
    });

    it('adds no grouping column without groupingColDef', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} treeData getTreeDataPath={getPath} />);
        expect(headerFields(container)).toEqual(['name']);
    });
});
