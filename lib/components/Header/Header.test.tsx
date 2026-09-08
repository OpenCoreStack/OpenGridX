import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import type { GridColDef } from '../../types';

const COLUMNS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'dept', headerName: 'Dept', width: 120 },
];

describe('Header — multi-sort shift-click', () => {
    it('plain click calls onSort with single field (replaces model)', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        render(
            <Header
                columns={COLUMNS}
                sortModel={[]}
                onSort={onSort}
                onSortAdd={onSortAdd}
            />
        );
        fireEvent.click(screen.getByText('Name'));
        expect(onSort).toHaveBeenCalledWith('name', 'asc');
        expect(onSortAdd).not.toHaveBeenCalled();
    });

    it('shift-click calls onSortAdd (accumulates)', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        render(
            <Header
                columns={COLUMNS}
                sortModel={[{ field: 'name', sort: 'asc' }]}
                onSort={onSort}
                onSortAdd={onSortAdd}
            />
        );
        fireEvent.click(screen.getByText('Age'), { shiftKey: true });
        expect(onSortAdd).toHaveBeenCalledWith('age', 'asc');
        expect(onSort).not.toHaveBeenCalled();
    });

    it('shift-click on already-sorted field cycles direction without replacing others', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        render(
            <Header
                columns={COLUMNS}
                sortModel={[
                    { field: 'name', sort: 'asc' },
                    { field: 'age', sort: 'asc' },
                ]}
                onSort={onSort}
                onSortAdd={onSortAdd}
            />
        );
        fireEvent.click(screen.getByText('Age'), { shiftKey: true });
        expect(onSortAdd).toHaveBeenCalledWith('age', 'desc');
        expect(onSort).not.toHaveBeenCalled();
    });

    it('shift-click on desc-sorted field removes it from model', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        render(
            <Header
                columns={COLUMNS}
                sortModel={[
                    { field: 'name', sort: 'asc' },
                    { field: 'age', sort: 'desc' },
                ]}
                onSort={onSort}
                onSortAdd={onSortAdd}
            />
        );
        fireEvent.click(screen.getByText('Age'), { shiftKey: true });
        expect(onSortAdd).toHaveBeenCalledWith('age', null);
        expect(onSort).not.toHaveBeenCalled();
    });

    it('plain click on one column while another is sorted resets to single-key', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        render(
            <Header
                columns={COLUMNS}
                sortModel={[{ field: 'name', sort: 'asc' }]}
                onSort={onSort}
                onSortAdd={onSortAdd}
            />
        );
        fireEvent.click(screen.getByText('Age'));
        expect(onSort).toHaveBeenCalledWith('age', 'asc');
        expect(onSortAdd).not.toHaveBeenCalled();
    });

    it('does not call onSort/onSortAdd for sortable:false columns', () => {
        const onSort = vi.fn();
        const onSortAdd = vi.fn();
        const cols: GridColDef[] = [
            { field: 'id', headerName: 'ID', sortable: false },
        ];
        render(<Header columns={cols} sortModel={[]} onSort={onSort} onSortAdd={onSortAdd} />);
        fireEvent.click(screen.getByText('ID'));
        expect(onSort).not.toHaveBeenCalled();
        expect(onSortAdd).not.toHaveBeenCalled();
    });
});

describe('Header — description tooltip', () => {
    it('renders title attribute from column description', () => {
        const cols: GridColDef[] = [
            { field: 'salary', headerName: 'Salary', description: 'Annual salary in USD' },
        ];
        const { container } = render(
            <Header columns={cols} sortModel={[]} />
        );
        const headerCell = container.querySelector('[data-field="salary"]');
        expect(headerCell?.getAttribute('title')).toBe('Annual salary in USD');
    });

    it('has no title attribute when description is absent', () => {
        const cols: GridColDef[] = [
            { field: 'name', headerName: 'Name' },
        ];
        const { container } = render(
            <Header columns={cols} sortModel={[]} />
        );
        const headerCell = container.querySelector('[data-field="name"]');
        expect(headerCell?.getAttribute('title')).toBeNull();
    });
});
