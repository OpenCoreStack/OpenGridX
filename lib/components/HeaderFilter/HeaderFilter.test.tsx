import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from '../DataGrid/DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { GridColDef, GridFilterItem, GridFilterModel } from '../../types';

type Order = { id: number; customer: string; qty: number; shipped: string; paid: boolean; status: string; photo?: string };

const ROWS: Order[] = [
    { id: 1, customer: 'Anna', qty: 5, shipped: '2026-01-10', paid: true, status: 'Open' },
    { id: 2, customer: 'Bob', qty: 12, shipped: '2026-02-01', paid: false, status: 'Closed' },
    { id: 3, customer: 'Hannah', qty: 5, shipped: '2026-01-10', paid: false, status: 'Open' },
];

const COLS: GridColDef<Order>[] = [
    { field: 'customer', headerName: 'Customer', width: 120 },
    { field: 'qty', headerName: 'Qty', type: 'number', width: 100 },
    { field: 'shipped', headerName: 'Shipped', type: 'date', width: 120 },
    { field: 'paid', headerName: 'Paid', type: 'boolean', width: 90 },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Open', 'Closed'], width: 110 },
    { field: 'photo', headerName: 'Photo', type: 'image', width: 80 },
];

afterEach(() => {
    vi.useRealTimers();
});

const advance = (ms = 400) => act(() => { vi.advanceTimersByTime(ms); });
const filterRow = (c: HTMLElement) => c.querySelector('.ogx__header-filter-row') as HTMLElement | null;
const filterCell = (c: HTMLElement, field: string) =>
    c.querySelector(`.ogx__header-filter-row [data-field="${field}"]`) as HTMLElement;
const headerCell = (c: HTMLElement, field: string) =>
    c.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
const customers = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('.ogx__virtual-container [role="row"] [data-field="customer"]')).map(el => el.textContent);
const valueInput = (c: HTMLElement, field: string) =>
    filterCell(c, field).querySelector('input, select') as HTMLInputElement & HTMLSelectElement;
const itemsOf = (model: GridFilterModel | undefined) => (model?.items ?? []) as GridFilterItem[];

function Controlled({ initial = { items: [] }, seen, toolbar = false }: { initial?: GridFilterModel; seen?: GridFilterModel[]; toolbar?: boolean }) {
    const [model, setModel] = useState<GridFilterModel>(initial);
    return (
        <DataGrid
            rows={ROWS}
            columns={COLS}
            headerFilters
            filterModel={model}
            onFilterModelChange={(m) => { seen?.push(m); setModel(m); }}
            slots={toolbar ? { toolbar: GridToolbar } : undefined}
        />
    );
}

describe('header filter row — rendering', () => {
    it('is not rendered without headerFilters, and the header keeps its aria-rowcount', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        expect(filterRow(container)).toBeNull();
        expect(container.querySelector('[role="grid"]')!.getAttribute('aria-rowcount')).toBe('4');
        expect(container.querySelector('.ogx')!.getAttribute('style')).not.toContain('--ogx-header-filter-height');
    });

    it('renders a header row of labelled column headers after the column header row', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters headerFilterHeight={44} />);
        const row = filterRow(container)!;
        expect(row.getAttribute('role')).toBe('row');
        expect(row.getAttribute('aria-rowindex')).toBe('2');
        expect(filterCell(container, 'customer').getAttribute('role')).toBe('columnheader');
        expect(filterCell(container, 'customer').getAttribute('aria-label')).toBe('Filter Customer');
        expect(filterCell(container, 'qty').getAttribute('aria-colindex')).toBe(headerCell(container, 'qty').getAttribute('aria-colindex'));
        // One more header row: the data rows' aria-rowindex shifts by one.
        expect(container.querySelector('[role="grid"]')!.getAttribute('aria-rowcount')).toBe('5');
        expect(container.querySelector('.ogx__virtual-container [role="row"]')!.getAttribute('aria-rowindex')).toBe('3');
        expect(container.querySelector('.ogx')!.getAttribute('style')).toContain('--ogx-header-filter-height: 44px');
    });

    it('uses the shared Input for text, number and date, and selects for boolean and singleSelect', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters />);
        expect(filterCell(container, 'customer').querySelector('.ogx-input-wrapper input.ogx-input[type="text"]')).not.toBeNull();
        expect(filterCell(container, 'qty').querySelector('input.ogx-input')).not.toBeNull();
        expect(filterCell(container, 'shipped').querySelector('input.ogx-input[type="date"]')).not.toBeNull();
        const paid = filterCell(container, 'paid').querySelector('select')!;
        expect(Array.from(paid.options).map(o => o.textContent)).toEqual(['Any', 'Yes', 'No']);
        const status = filterCell(container, 'status').querySelector('select')!;
        expect(Array.from(status.options).map(o => o.textContent)).toEqual(['Any', 'Open', 'Closed']);
        // image columns and headerFilter: false get an empty cell
        expect(filterCell(container, 'photo').querySelector('input, select, button')).toBeNull();
    });

    it('leaves headerFilter: false columns empty', () => {
        const cols = COLS.map(c => (c.field === 'qty' ? { ...c, headerFilter: false } : c));
        const { container } = render(<DataGrid rows={ROWS} columns={cols} headerFilters />);
        expect(filterCell(container, 'qty').classList).toContain('ogx__header-filter-cell--empty');
        expect(filterCell(container, 'qty').querySelector('input')).toBeNull();
    });

    it('keeps every control out of the Tab order', () => {
        const { container } = render(<Controlled initial={{ items: [{ id: 'header:qty', field: 'qty', operator: '>', value: '3' }] }} />);
        const focusables = Array.from(filterRow(container)!.querySelectorAll<HTMLElement>('input, select, button'));
        expect(focusables.length).toBeGreaterThan(0);
        expect(focusables.every(el => el.tabIndex === -1)).toBe(true);
    });
});

describe('header filter row — editing the shared model', () => {
    it('debounces typing by 300 ms and adds the owned item', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled seen={seen} />);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'bo' } });
        advance(250);
        expect(seen).toHaveLength(0);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'bob' } });
        advance(250);
        expect(seen).toHaveLength(0);
        advance(100);
        expect(seen).toHaveLength(1);
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'bob' }]);
        expect(customers(container)).toEqual(['Bob']);
    });

    it('updates the owned item in place and removes it when cleared', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const panelItem = { id: 'p1', field: 'status', operator: 'is' as const, value: 'Open' };
        const initial = { items: [{ id: 'header:customer', field: 'customer', operator: 'contains' as const, value: 'a' }, panelItem] };
        const { container } = render(<Controlled initial={initial} seen={seen} />);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'han' } });
        advance();
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'han' }, panelItem]);
        fireEvent.click(within(filterCell(container, 'customer')).getByLabelText('Clear filter for Customer'));
        expect(itemsOf(seen[1])).toEqual([panelItem]);
    });

    it('removes the item when the text is deleted', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled initial={{ items: [{ id: 'header:qty', field: 'qty', operator: '=', value: '5' }] }} seen={seen} />);
        expect(customers(container)).toEqual(['Anna', 'Hannah']);
        fireEvent.change(valueInput(container, 'qty'), { target: { value: '' } });
        advance();
        expect(itemsOf(seen[0])).toEqual([]);
        expect(customers(container)).toHaveLength(3);
    });

    it('filters booleans and singleSelect values immediately', () => {
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled seen={seen} />);
        fireEvent.change(valueInput(container, 'paid'), { target: { value: 'false' } });
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:paid', field: 'paid', operator: 'is', value: false }]);
        expect(customers(container)).toEqual(['Bob', 'Hannah']);
        fireEvent.change(valueInput(container, 'status'), { target: { value: '0' } });
        expect(itemsOf(seen[1])[1]).toEqual({ id: 'header:status', field: 'status', operator: 'is', value: 'Open' });
        expect(customers(container)).toEqual(['Hannah']);
        fireEvent.change(valueInput(container, 'paid'), { target: { value: '' } });
        expect(itemsOf(seen[2])).toEqual([{ id: 'header:status', field: 'status', operator: 'is', value: 'Open' }]);
    });

    it('filters dates by calendar day', () => {
        vi.useFakeTimers();
        const { container } = render(<Controlled />);
        fireEvent.change(valueInput(container, 'shipped'), { target: { value: '2026-01-10' } });
        advance();
        expect(customers(container)).toEqual(['Anna', 'Hannah']);
    });

    it('starts with headerFilterOperator', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        function Grid() {
            const [model, setModel] = useState<GridFilterModel>({ items: [] });
            const cols = COLS.map(c => (c.field === 'qty' ? { ...c, headerFilterOperator: '>' as const } : c));
            return <DataGrid rows={ROWS} columns={cols} headerFilters filterModel={model} onFilterModelChange={(m) => { seen.push(m); setModel(m); }} />;
        }
        const { container } = render(<Grid />);
        fireEvent.change(valueInput(container, 'qty'), { target: { value: '6' } });
        advance();
        expect(itemsOf(seen[0])[0].operator).toBe('>');
        expect(customers(container)).toEqual(['Bob']);
    });

    it('commits pending typing when the row is turned off', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        function Grid({ on }: { on: boolean }) {
            const [model, setModel] = useState<GridFilterModel>({ items: [] });
            return <DataGrid rows={ROWS} columns={COLS} headerFilters={on} filterModel={model} onFilterModelChange={(m) => { seen.push(m); setModel(m); }} />;
        }
        const { container, rerender } = render(<Grid on />);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'bob' } });
        rerender(<Grid on={false} />);
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'bob' }]);
    });

    it('drops typing that is not committed yet when the model changes elsewhere', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        function Grid() {
            const [model, setModel] = useState<GridFilterModel>({ items: [{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'a' }] });
            return (
                <>
                    <button type="button" onClick={() => setModel({ items: [] })}>reset</button>
                    <DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={model} onFilterModelChange={(m) => { seen.push(m); setModel(m); }} />
                </>
            );
        }
        const { container } = render(<Grid />);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'bo' } });
        fireEvent.click(screen.getByText('reset'));
        advance(1000);
        expect(seen).toHaveLength(0);
        expect(valueInput(container, 'customer').value).toBe('');
    });

    it('keeps typing done while its own earlier change is still on the way back', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        // A parent that stores the model 200 ms after the grid reports it (a server round trip).
        function Grid() {
            const [model, setModel] = useState<GridFilterModel>({ items: [] });
            return (
                <DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={model}
                    onFilterModelChange={(m) => { seen.push(m); setTimeout(() => setModel(m), 200); }} />
            );
        }
        const { container } = render(<Grid />);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'b' } });
        advance(300);
        expect(itemsOf(seen[0])[0].value).toBe('b');
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'bo' } });
        advance(250);
        expect(valueInput(container, 'customer').value).toBe('bo');
        advance(100);
        expect(itemsOf(seen[1])[0].value).toBe('bo');
    });

    it('reports the model through onFilterModelChange in server filter mode without filtering rows', () => {
        vi.useFakeTimers();
        const onFilterModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} headerFilters filterMode="server" onFilterModelChange={onFilterModelChange} />
        );
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'zz' } });
        advance();
        expect(onFilterModelChange).toHaveBeenCalledWith({ items: [{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'zz' }] });
        expect(customers(container)).toHaveLength(3);
    });

    it('works uncontrolled and keeps the quick filter', () => {
        vi.useFakeTimers();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} headerFilters initialState={{ filter: { filterModel: { items: [], quickFilterValues: ['nn'] } } }} />
        );
        expect(customers(container)).toEqual(['Anna', 'Hannah']);
        fireEvent.change(valueInput(container, 'customer'), { target: { value: 'h' } });
        advance();
        expect(customers(container)).toEqual(['Hannah']);
    });
});

describe('header filter row — operators', () => {
    it('changes the operator from the menu, keeping the value', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled initial={{ items: [{ id: 'header:qty', field: 'qty', operator: '=', value: '5' }] }} seen={seen} />);
        const button = within(filterCell(container, 'qty')).getByRole('button', { name: /Filter operator for Qty/ });
        expect(button.getAttribute('aria-label')).toBe('Filter operator for Qty: Equals');
        fireEvent.click(button);
        const menu = screen.getByRole('menu', { name: 'Filter operator for Qty' });
        expect(within(menu).getAllByRole('menuitemradio').map(b => b.textContent)).toEqual([
            'Equals', 'Does not equal', 'Greater than', 'Greater than or equal', 'Less than', 'Less than or equal', 'Is empty', 'Is not empty',
        ]);
        fireEvent.click(within(menu).getByText('Greater than'));
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:qty', field: 'qty', operator: '>', value: '5' }]);
        expect(customers(container)).toEqual(['Bob']);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('isEmpty needs no value and shows its name instead of the input', () => {
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled seen={seen} />);
        fireEvent.click(within(filterCell(container, 'customer')).getByRole('button', { name: /Filter operator/ }));
        fireEvent.click(screen.getByText('Is empty'));
        expect(itemsOf(seen[0])).toEqual([{ id: 'header:customer', field: 'customer', operator: 'isEmpty', value: undefined }]);
        expect(filterCell(container, 'customer').querySelector('input')).toBeNull();
        expect(filterCell(container, 'customer').textContent).toContain('Is empty');
        expect(customers(container)).toEqual([]);
    });
});

describe('header filter row — models it cannot show', () => {
    it('shows "Custom filter" for an OR root and never rewrites it', () => {
        const model: GridFilterModel = { logicOperator: 'or', items: [{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'a' }, { field: 'qty', operator: '>', value: 10 }] };
        const onFilterModelChange = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={model} onFilterModelChange={onFilterModelChange} />);
        for (const field of ['customer', 'qty', 'paid']) {
            expect(filterCell(container, field).textContent).toBe('Custom filter');
            expect(filterCell(container, field).querySelector('input, select')).toBeNull();
        }
        fireEvent.keyDown(filterCell(container, 'customer'), { key: 'Delete' });
        expect(onFilterModelChange).not.toHaveBeenCalled();
    });

    it('shows "Custom filter" only for fields in nested groups or with untagged items', () => {
        const model: GridFilterModel = { items: [
            { logicOperator: 'or', items: [{ field: 'status', operator: 'is', value: 'Open' }, { field: 'status', operator: 'is', value: 'Closed' }] },
            { id: 'panel', field: 'customer', operator: 'contains', value: 'a' },
        ] };
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={model} />);
        expect(filterCell(container, 'status').textContent).toBe('Custom filter');
        expect(filterCell(container, 'customer').textContent).toBe('Custom filter');
        expect(filterCell(container, 'qty').querySelector('input')).not.toBeNull();
    });

    it('opens the toolbar filter panel from "Custom filter"', () => {
        const model: GridFilterModel = { logicOperator: 'or', items: [{ field: 'qty', operator: '>', value: 10 }, { field: 'qty', operator: '<', value: 2 }] };
        const { container } = render(<Controlled initial={model} toolbar />);
        expect(screen.queryByRole('dialog', { name: 'Advanced filters' })).toBeNull();
        fireEvent.click(within(filterCell(container, 'qty')).getByRole('button', { name: 'Custom filter' }));
        expect(screen.getByRole('dialog', { name: 'Advanced filters' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Close filters panel' }));
        expect(screen.queryByRole('dialog', { name: 'Advanced filters' })).toBeNull();
        // It opens again after being closed.
        fireEvent.click(within(filterCell(container, 'qty')).getByRole('button', { name: 'Custom filter' }));
        expect(screen.getByRole('dialog', { name: 'Advanced filters' })).toBeInTheDocument();
    });

    it('shows a plain label without a toolbar to open', () => {
        const model: GridFilterModel = { logicOperator: 'or', items: [{ field: 'qty', operator: '>', value: 10 }] };
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={model} />);
        expect(within(filterCell(container, 'qty')).queryByRole('button')).toBeNull();
    });

    it('the filter panel edits the header item and keeps its id', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled initial={{ items: [{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'a' }] }} seen={seen} toolbar />);
        fireEvent.click(screen.getByRole('button', { name: 'Advanced filters' }));
        fireEvent.change(screen.getByRole('dialog').querySelector('input[name="filter-val-customer"]')!, { target: { value: 'bob' } });
        advance();
        expect(itemsOf(seen[seen.length - 1])).toEqual([{ id: 'header:customer', field: 'customer', operator: 'contains', value: 'bob' }]);
        expect(valueInput(container, 'customer').value).toBe('bob');
    });
});

describe('header filter row — keyboard', () => {
    const viewport = (c: HTMLElement) => c.querySelector('.ogx__viewport') as HTMLElement;
    const focusedFilter = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__header-filter-cell--focused')?.dataset.field ?? null;

    it('ArrowDown moves header → filter cell → first row, and ArrowUp back', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters />);
        fireEvent.click(headerCell(container, 'qty'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        expect(focusedFilter(container)).toBe('qty');
        expect(document.activeElement).toBe(filterCell(container, 'qty'));
        expect(container.querySelector('.ogx__header-cell--focused')).toBeNull();
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
        expect(document.activeElement).toBe(filterCell(container, 'shipped'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        expect(document.activeElement?.closest('[role="row"]')?.getAttribute('data-rowindex')).toBe('0');
        expect((document.activeElement as HTMLElement).dataset.field).toBe('shipped');
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(filterCell(container, 'shipped'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(headerCell(container, 'shipped'));
    });

    it('Enter focuses the control without sorting, and Escape returns to the cell', () => {
        const onSortModelChange = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters onSortModelChange={onSortModelChange} />);
        fireEvent.click(headerCell(container, 'customer'));
        onSortModelChange.mockClear();
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
        expect(document.activeElement).toBe(valueInput(container, 'customer'));
        // Arrow keys in the input are left to it.
        expect(fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })).toBe(true);
        expect(document.activeElement).toBe(valueInput(container, 'customer'));
        fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
        expect(document.activeElement).toBe(filterCell(container, 'customer'));
        fireEvent.keyDown(document.activeElement!, { key: ' ' });
        expect(document.activeElement).toBe(valueInput(container, 'customer'));
        expect(onSortModelChange).not.toHaveBeenCalled();
    });

    it('typing on a filter cell starts a value in its input', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled seen={seen} />);
        fireEvent.click(headerCell(container, 'customer'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        fireEvent.keyDown(document.activeElement!, { key: 'h' });
        expect(document.activeElement).toBe(valueInput(container, 'customer'));
        expect(valueInput(container, 'customer').value).toBe('h');
        advance();
        expect(itemsOf(seen[0])[0].value).toBe('h');
    });

    it('Alt+ArrowDown opens the operator menu and Escape returns focus to the control', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} headerFilters />);
        fireEvent.click(headerCell(container, 'qty'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown', altKey: true });
        const menu = screen.getByRole('menu');
        fireEvent.keyDown(menu.querySelector('button')!, { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(valueInput(container, 'qty'));
    });

    it('Delete on a filter cell clears its filter', () => {
        const seen: GridFilterModel[] = [];
        const { container } = render(<Controlled initial={{ items: [{ id: 'header:qty', field: 'qty', operator: '=', value: '5' }] }} seen={seen} />);
        fireEvent.click(headerCell(container, 'qty'));
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
        fireEvent.keyDown(document.activeElement!, { key: 'Delete' });
        expect(itemsOf(seen[0])).toEqual([]);
    });

    it('without headerFilters ArrowDown goes from the header straight to the first row', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(headerCell(container, 'qty'));
        fireEvent.keyDown(viewport(container).contains(document.activeElement) ? document.activeElement! : viewport(container), { key: 'ArrowDown' });
        expect(document.activeElement?.closest('[role="row"]')?.getAttribute('data-rowindex')).toBe('0');
    });
});
