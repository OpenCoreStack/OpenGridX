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

describe('Header — wrapHeaderText', () => {
    const headerCell = (container: HTMLElement, field: string) =>
        container.querySelector(`[role="columnheader"][data-field="${field}"]`) as HTMLElement;
    const title = (container: HTMLElement, field: string) =>
        headerCell(container, field).querySelector('.ogx__header-cell-title') as HTMLElement;
    const wraps = (container: HTMLElement, field: string) =>
        headerCell(container, field).classList.contains('ogx__header-cell--wrap');

    it('does not wrap by default', () => {
        const { container } = render(<Header columns={COLUMNS} />);
        expect(wraps(container, 'name')).toBe(false);
        expect(title(container, 'name').style.webkitLineClamp).toBe('');
    });

    it('wraps every column when the grid prop is on, clamped to the lines that fit', () => {
        const { container } = render(<Header columns={COLUMNS} wrapHeaderText headerHeight={72} />);
        for (const field of ['name', 'age', 'dept']) {
            expect(wraps(container, field)).toBe(true);
            expect(title(container, field).style.webkitLineClamp).toBe('3');
        }
    });

    it('lets a column opt out of, or into, wrapping over the grid prop', () => {
        const on = render(<Header columns={[{ field: 'name', headerName: 'Name', wrapHeaderText: false }, { field: 'age', headerName: 'Age' }]} wrapHeaderText />);
        expect(wraps(on.container, 'name')).toBe(false);
        expect(wraps(on.container, 'age')).toBe(true);
        on.unmount();

        const off = render(<Header columns={[{ field: 'name', headerName: 'Name', wrapHeaderText: true }, { field: 'age', headerName: 'Age' }]} />);
        expect(wraps(off.container, 'name')).toBe(true);
        expect(wraps(off.container, 'age')).toBe(false);
    });

    it('shows the full title as a tooltip when wrapping, unless a description is set', () => {
        const columns: GridColDef[] = [
            { field: 'name', headerName: 'Net asset value per share' },
            { field: 'age', headerName: 'Age', description: 'Age in years' },
        ];
        const { container } = render(<Header columns={columns} wrapHeaderText />);
        expect(headerCell(container, 'name').getAttribute('title')).toBe('Net asset value per share');
        expect(headerCell(container, 'age').getAttribute('title')).toBe('Age in years');
    });

    it('takes a line off for the aggregation label', () => {
        const { container } = render(<Header columns={COLUMNS} wrapHeaderText headerHeight={72} aggregationModel={{ age: 'sum' }} />);
        expect(title(container, 'age').style.webkitLineClamp).toBe('2');
        expect(title(container, 'name').style.webkitLineClamp).toBe('3');
    });
});
