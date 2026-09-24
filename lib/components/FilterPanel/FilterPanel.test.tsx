import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { FilterPanel } from './FilterPanel';
import type { GridColDef, GridFilterItem, GridFilterModel } from '../../types';

afterEach(() => {
    vi.useRealTimers();
});

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age', type: 'number' },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Active', 'Inactive'] },
    { field: 'vip', headerName: 'VIP', type: 'boolean' },
    { field: 'joined', headerName: 'Joined', type: 'date' },
];

/** A controlled panel that records every model it emits. */
function ControlledPanel({ initial, seen, columns = COLS }: { initial: GridFilterModel; seen: GridFilterModel[]; columns?: GridColDef[] }) {
    const [model, setModel] = useState(initial);
    return (
        <FilterPanel
            columns={columns}
            filterModel={model}
            onFilterModelChange={(m) => { seen.push(m); setModel(m); }}
        />
    );
}

const advance = (ms = 400) => act(() => { vi.advanceTimersByTime(ms); });
const itemsOf = (model: GridFilterModel | undefined) => (model?.items ?? []) as GridFilterItem[];
const last = <T,>(list: T[]): T | undefined => list[list.length - 1];

describe('FilterPanel — opening the panel', () => {
    it('does not emit or rewrite existing non-string values', () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const model: GridFilterModel = { items: [
            { id: 'a', field: 'status', operator: 'isAnyOf', value: ['Active', 'Inactive'] },
            { id: 'b', field: 'age', operator: '>', value: 30 },
            { id: 'c', field: 'joined', operator: 'after', value: new Date(2024, 0, 10) },
        ] };
        render(<FilterPanel columns={COLS} filterModel={model} onFilterModelChange={onChange} />);
        advance(1000);
        expect(onChange).not.toHaveBeenCalled();
        expect((screen.getByLabelText('Filter value for Age') as HTMLInputElement).value).toBe('30');
        expect((screen.getByLabelText('Filter value for Joined') as HTMLInputElement).value).toBe('2024-01-10');
    });
});

describe('FilterPanel — editing keeps the rest of the model', () => {
    it('preserves nested filter groups when another row is edited', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        const group = { logicOperator: 'or' as const, items: [
            { field: 'name', operator: 'equals' as const, value: 'x' },
            { field: 'name', operator: 'equals' as const, value: 'y' },
        ] };
        render(<ControlledPanel initial={{ items: [group] }} seen={seen} />);
        fireEvent.change(screen.getByLabelText('Filter value for Age'), { target: { value: '5' } });
        advance();
        const emitted = last(seen);
        expect(emitted?.items).toHaveLength(2);
        expect(emitted?.items?.[0]).toBe(group);
        expect(emitted?.items?.[1]).toMatchObject({ field: 'age', operator: '=', value: '5' });
    });

    it('edits only the displayed condition when a field has two conditions', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [
            { id: 1, field: 'age', operator: '>', value: '10' },
            { id: 2, field: 'age', operator: '<', value: '20' },
        ] }} seen={seen} />);
        fireEvent.change(screen.getByLabelText('Filter value for Age'), { target: { value: '11' } });
        advance();
        expect(last(seen)?.items).toEqual([
            { id: 1, field: 'age', operator: '>', value: '11' },
            { id: 2, field: 'age', operator: '<', value: '20' },
        ]);
    });

    it('tells the user about conditions it does not show', () => {
        render(<FilterPanel columns={COLS} onFilterModelChange={vi.fn()} filterModel={{ items: [
            { id: 1, field: 'age', operator: '>', value: '10' },
            { id: 2, field: 'age', operator: '<', value: '20' },
        ] }} />);
        expect(screen.getByRole('note').textContent).toMatch(/1 more condition/);
    });

    it('clearing a row removes only that row\'s item', () => {
        const seen: GridFilterModel[] = [];
        const group = { logicOperator: 'and' as const, items: [{ field: 'name', operator: 'contains' as const, value: 'a' }] };
        render(<ControlledPanel initial={{ items: [group, { id: 1, field: 'age', operator: '>', value: '10' }] }} seen={seen} />);
        fireEvent.click(screen.getByLabelText('Clear filter for Age'));
        expect(last(seen)?.items).toEqual([group]);
    });
});

describe('FilterPanel — debounce races', () => {
    it('changing the operator right after typing keeps the typed value', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [] }} seen={seen} />);
        const input = screen.getByLabelText('Filter value for Age') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '42' } });
        advance(100);
        fireEvent.change(screen.getByLabelText('Filter operator for Age'), { target: { value: '>' } });
        advance();
        expect(input.value).toBe('42');
        expect(itemsOf(last(seen))).toEqual([expect.objectContaining({ field: 'age', operator: '>', value: '42' })]);
        expect(seen).toHaveLength(1);
    });

    it('an outside reset within the debounce window is not undone by the pending typing', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        function Harness() {
            const [model, setModel] = useState<GridFilterModel>({ items: [{ id: 1, field: 'age', operator: '>', value: '3' }] });
            return (
                <>
                    {/* Stands in for the toolbar's "Clear all" or any code outside the panel. */}
                    <button type="button" onClick={() => setModel({ items: [] })}>outside reset</button>
                    <FilterPanel columns={COLS} filterModel={model} onFilterModelChange={(m) => { seen.push(m); setModel(m); }} />
                </>
            );
        }
        render(<Harness />);
        const name = screen.getByLabelText('Filter value for Name') as HTMLInputElement;
        fireEvent.change(name, { target: { value: 'abc' } });
        advance(100);
        fireEvent.click(screen.getByText('outside reset'));
        advance();
        expect(seen).toEqual([]);
        expect(name.value).toBe('');
    });

    it('typing in a second row while the first commits keeps both values', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [] }} seen={seen} />);
        fireEvent.change(screen.getByLabelText('Filter value for Name'), { target: { value: 'al' } });
        advance(200);
        fireEvent.change(screen.getByLabelText('Filter value for Age'), { target: { value: '3' } });
        advance(150); // Name commits here, Age is still pending
        advance(300);
        expect(itemsOf(last(seen)).map(i => [i.field, i.value])).toEqual([['name', 'al'], ['age', '3']]);
        expect((screen.getByLabelText('Filter value for Age') as HTMLInputElement).value).toBe('3');
    });

    it('clearing the text keeps the chosen operator with an empty value', () => {
        vi.useFakeTimers();
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [{ id: 1, field: 'age', operator: '>', value: '5' }] }} seen={seen} />);
        fireEvent.change(screen.getByLabelText('Filter value for Age'), { target: { value: '' } });
        advance();
        expect(itemsOf(last(seen))).toEqual([{ id: 1, field: 'age', operator: '>', value: '' }]);
    });
});

describe('FilterPanel — value controls per column type', () => {
    it('boolean: starts on "Any", choosing true creates the filter and "Any" removes it', () => {
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [] }} seen={seen} />);
        const select = screen.getByLabelText('Filter value for VIP') as HTMLSelectElement;
        expect(select.value).toBe('');
        fireEvent.change(select, { target: { value: 'true' } });
        expect(itemsOf(last(seen))).toEqual([expect.objectContaining({ field: 'vip', operator: 'is', value: 'true' })]);
        fireEvent.change(select, { target: { value: '' } });
        expect(last(seen)?.items).toEqual([]);
    });

    it('singleSelect: isAnyOf offers the valueOptions and emits an array', () => {
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [] }} seen={seen} />);
        const select = screen.getByLabelText('Filter value for Status') as HTMLSelectElement;
        expect(select.multiple).toBe(true);
        expect(Array.from(select.options).map(o => o.textContent)).toEqual(['Active', 'Inactive']);
        select.options[0].selected = true;
        fireEvent.change(select);
        expect(itemsOf(last(seen))).toEqual([expect.objectContaining({ field: 'status', operator: 'isAnyOf', value: ['Active'] })]);
    });

    it('singleSelect: keeps the option\'s own value type and shows its label', () => {
        const seen: GridFilterModel[] = [];
        const cols: GridColDef[] = [{ field: 'level', headerName: 'Level', type: 'singleSelect', valueOptions: [{ value: 1, label: 'Low' }, { value: 2, label: 'High' }] }];
        render(<ControlledPanel initial={{ items: [{ id: 'l', field: 'level', operator: 'is', value: '' }] }} seen={seen} columns={cols} />);
        const select = screen.getByLabelText('Filter value for Level') as HTMLSelectElement;
        expect(Array.from(select.options).map(o => o.textContent)).toEqual(['Any', 'Low', 'High']);
        fireEvent.change(select, { target: { value: select.options[2].value } });
        expect(itemsOf(last(seen))).toEqual([{ id: 'l', field: 'level', operator: 'is', value: 2 }]);
    });

    it('singleSelect: switching isAnyOf -> is carries the first selected value over', () => {
        const seen: GridFilterModel[] = [];
        render(<ControlledPanel initial={{ items: [{ id: 's', field: 'status', operator: 'isAnyOf', value: ['Inactive'] }] }} seen={seen} />);
        fireEvent.change(screen.getByLabelText('Filter operator for Status'), { target: { value: 'is' } });
        expect(itemsOf(last(seen))).toEqual([{ id: 's', field: 'status', operator: 'is', value: 'Inactive' }]);
        expect((screen.getByLabelText('Filter value for Status') as HTMLSelectElement).value).toBe('1');
    });

    it('date columns use a date input', () => {
        render(<FilterPanel columns={COLS} filterModel={{ items: [] }} onFilterModelChange={vi.fn()} />);
        expect((screen.getByLabelText('Filter value for Joined') as HTMLInputElement).type).toBe('date');
    });

    it('shows an operator the column type does not list instead of a different one', () => {
        const cols: GridColDef[] = [{ field: 'price', headerName: 'Price', type: 'number' }];
        render(<FilterPanel columns={cols} filterModel={{ items: [{ id: 1, field: 'price', operator: 'contains', value: '5' }] }} onFilterModelChange={vi.fn()} />);
        const select = screen.getByLabelText('Filter operator for Price') as HTMLSelectElement;
        expect(select.value).toBe('contains');
        expect(Array.from(select.options).map(o => o.value)).toContain('=');
    });
});

// The toolbar closes the Filters panel on an outside click or Escape; text typed just before
// that is still waiting for the debounce and must not be dropped.
describe('FilterPanel keeps typing that is still debouncing when it closes', () => {
    it('commits the pending value once on unmount', () => {
        vi.useFakeTimers();
        const onFilterModelChange = vi.fn();
        const { unmount } = render(
            <FilterPanel filterModel={{ items: [] }} columns={[{ field: 'name', headerName: 'Name' }]} onFilterModelChange={onFilterModelChange} />
        );
        const input = screen.getByLabelText('Filter value for Name') as HTMLInputElement;
        act(() => { fireEvent.change(input, { target: { value: 'Ada' } }); });
        act(() => { vi.advanceTimersByTime(100); });
        unmount();
        act(() => { vi.runAllTimers(); });
        expect(onFilterModelChange).toHaveBeenCalledTimes(1);
        expect(onFilterModelChange.mock.calls[0][0].items[0]).toMatchObject({ field: 'name', value: 'Ada' });
    });

    it('does not commit again on unmount once the debounce has committed', () => {
        vi.useFakeTimers();
        const onFilterModelChange = vi.fn();
        const { unmount } = render(
            <FilterPanel filterModel={{ items: [] }} columns={[{ field: 'name', headerName: 'Name' }]} onFilterModelChange={onFilterModelChange} />
        );
        const input = screen.getByLabelText('Filter value for Name') as HTMLInputElement;
        act(() => { fireEvent.change(input, { target: { value: 'Ada' } }); });
        act(() => { vi.runAllTimers(); });
        unmount();
        expect(onFilterModelChange).toHaveBeenCalledTimes(1);
    });
});
