import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

const COLUMNS: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100, type: 'number' },
];

const ROWS = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
];

describe('DataGrid — smoke tests', () => {
    it('renders without throwing', () => {
        expect(() =>
            render(<DataGrid rows={ROWS} columns={COLUMNS} />)
        ).not.toThrow();
    });

    it('renders column headers', () => {
        render(<DataGrid rows={ROWS} columns={COLUMNS} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('renders row data', () => {
        render(<DataGrid rows={ROWS} columns={COLUMNS} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('renders with empty rows without throwing', () => {
        expect(() =>
            render(<DataGrid rows={[]} columns={COLUMNS} />)
        ).not.toThrow();
    });

    it('renders with empty columns without throwing', () => {
        expect(() =>
            render(<DataGrid rows={ROWS} columns={[]} />)
        ).not.toThrow();
    });

    it('renders with checkboxSelection enabled', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLUMNS} checkboxSelection />
        );
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
    });
});
