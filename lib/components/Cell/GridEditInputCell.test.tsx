import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

// The built-in editors, driven through the public DataGrid: double-click opens the editor,
// Enter / blur commit, and processRowUpdate shows what reached the row.

const cellOf = (container: HTMLElement, rowIndex: number, field: string) =>
    container.querySelector<HTMLElement>(`.ogx__rows [data-rowindex="${rowIndex}"] [data-field="${field}"]`)!;

function renderGrid<R extends GridRowModel>(rows: R[], columns: GridColDef<R>[]) {
    const processRowUpdate = vi.fn((row: R) => row);
    const utils = render(<DataGrid rows={rows} columns={columns} processRowUpdate={processRowUpdate} />);
    return { ...utils, processRowUpdate };
}

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('select editor', () => {
    type SRow = { id: number; status: unknown };
    const objectOptions: GridColDef<SRow>[] = [{
        field: 'status', type: 'singleSelect', editable: true, width: 120,
        valueOptions: [{ value: 1, label: 'Open' }, { value: 2, label: 'Closed' }],
    }];

    it('commits the original numeric value of an object option, not its string form', async () => {
        const { container, processRowUpdate } = renderGrid<SRow>([{ id: 1, status: 1 }], objectOptions);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        expect(select.value).toBe('1');
        fireEvent.change(select, { target: { value: '2' } });
        fireEvent.keyDown(select, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].status).toBe(2);
    });

    it('commits a number for bare numeric options', async () => {
        const cols: GridColDef<SRow>[] = [{ field: 'status', type: 'singleSelect', editable: true, width: 120, valueOptions: [1, 2, 3] }];
        const { container, processRowUpdate } = renderGrid<SRow>([{ id: 1, status: 1 }], cols);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        fireEvent.change(select, { target: { value: '3' } });
        fireEvent.keyDown(select, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].status).toBe(3);
    });

    it('still commits strings for string options', async () => {
        const cols: GridColDef<SRow>[] = [{ field: 'status', type: 'singleSelect', editable: true, width: 120, valueOptions: ['Admin', 'Editor'] }];
        const { container, processRowUpdate } = renderGrid<SRow>([{ id: 1, status: 'Admin' }], cols);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        fireEvent.change(select, { target: { value: 'Editor' } });
        fireEvent.keyDown(select, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].status).toBe('Editor');
    });

    it('shows an empty choice when the value is null, so the first option can be picked', async () => {
        const cols: GridColDef<SRow>[] = [{ field: 'status', type: 'singleSelect', editable: true, width: 120, valueOptions: ['Admin', 'Editor'] }];
        const { container, processRowUpdate } = renderGrid<SRow>([{ id: 1, status: null }], cols);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        expect(select.value).toBe('');
        expect(select.options[select.selectedIndex].textContent).toBe('');
        // Enter without choosing leaves the null value alone.
        fireEvent.keyDown(select, { key: 'Enter' });
        await waitFor(() => expect(container.querySelector('.ogx__edit-select')).toBeNull());
        expect(processRowUpdate).not.toHaveBeenCalled();

        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const reopened = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        fireEvent.change(reopened, { target: { value: 'Admin' } });
        fireEvent.keyDown(reopened, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].status).toBe('Admin');
    });

    it('shows an empty choice when the value is not among the options', () => {
        const cols: GridColDef<SRow>[] = [{ field: 'status', type: 'singleSelect', editable: true, width: 120, valueOptions: ['Admin', 'Editor'] }];
        const { container } = renderGrid<SRow>([{ id: 1, status: 'Retired' }], cols);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        expect(select.value).toBe('');
        expect(Array.from(select.options).map(o => o.textContent)).toEqual(['', 'Admin', 'Editor']);
    });

    it('does not add an empty choice when the value matches an option', () => {
        const { container } = renderGrid<SRow>([{ id: 1, status: 2 }], objectOptions);
        fireEvent.doubleClick(cellOf(container, 0, 'status'));
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        expect(Array.from(select.options).map(o => o.textContent)).toEqual(['Open', 'Closed']);
        expect(select.value).toBe('2');
    });
});

describe('date editor', () => {
    type DRow = { id: number; day: unknown };
    const cols: GridColDef<DRow>[] = [{ field: 'day', type: 'date', editable: true, width: 160 }];

    function openDate(day: unknown) {
        const utils = renderGrid<DRow>([{ id: 1, day }], cols);
        fireEvent.doubleClick(cellOf(utils.container, 0, 'day'));
        const input = utils.container.querySelector<HTMLInputElement>('input[type="date"]')!;
        return { ...utils, input };
    }

    it('shows a Date value as its local calendar day', () => {
        const { input } = openDate(new Date(2024, 0, 15));
        expect(input.value).toBe('2024-01-15');
    });

    it('commits a Date for a Date-valued cell and keeps its time of day', async () => {
        const { input, processRowUpdate } = openDate(new Date(2024, 0, 15, 9, 30));
        fireEvent.change(input, { target: { value: '2024-03-01' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        const committed = processRowUpdate.mock.calls[0][0].day;
        expect(committed).toBeInstanceOf(Date);
        const d = committed as Date;
        expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2024, 2, 1, 9, 30]);
    });

    it('shows an ISO date-time string and commits it back in the same format', async () => {
        const { input, processRowUpdate } = openDate('2024-03-01T10:00:00');
        expect(input.value).toBe('2024-03-01');
        fireEvent.change(input, { target: { value: '2024-03-05' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].day).toBe('2024-03-05T10:00:00');
    });

    it('round-trips a plain YYYY-MM-DD string', async () => {
        const { input, processRowUpdate } = openDate('2024-02-20');
        expect(input.value).toBe('2024-02-20');
        fireEvent.change(input, { target: { value: '2024-02-21' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].day).toBe('2024-02-21');
    });

    it('commits null when the date is cleared', async () => {
        const { input, processRowUpdate } = openDate('2024-02-20');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].day).toBeNull();
    });
});

describe('boolean editor', () => {
    type BRow = { id: number; name: string; ok: boolean };
    const rows: BRow[] = [{ id: 1, name: 'Alpha', ok: false }, { id: 2, name: 'Beta', ok: true }];
    const cols: GridColDef<BRow>[] = [
        { field: 'name', editable: true, width: 120 },
        { field: 'ok', type: 'boolean', editable: true, width: 80 },
    ];

    it('closes when focus leaves it without a toggle', () => {
        const { container } = renderGrid<BRow>(rows, cols);
        fireEvent.doubleClick(cellOf(container, 0, 'ok'));
        const checkbox = container.querySelector<HTMLInputElement>('.ogx__edit-checkbox')!;
        expect(document.activeElement).toBe(checkbox);
        fireEvent.click(cellOf(container, 1, 'name'));
        expect(container.querySelector('.ogx__edit-checkbox')).toBeNull();
    });

    it('commits a toggle once, straight away, with nothing left to fire later', async () => {
        vi.useFakeTimers();
        const { container, processRowUpdate } = renderGrid<BRow>(rows, cols);
        fireEvent.doubleClick(cellOf(container, 0, 'ok'));
        fireEvent.click(container.querySelector<HTMLInputElement>('.ogx__edit-checkbox')!);
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate.mock.calls[0][0].ok).toBe(true);
        await act(async () => { vi.advanceTimersByTime(100); });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(container.querySelector('.ogx__edit-checkbox')).toBeNull();
    });

    it('keeps focus on mousedown so the click can toggle (Safari does not focus checkboxes)', () => {
        const { container } = renderGrid<BRow>(rows, cols);
        fireEvent.doubleClick(cellOf(container, 0, 'ok'));
        const checkbox = container.querySelector<HTMLInputElement>('.ogx__edit-checkbox')!;
        // fireEvent returns false when a handler called preventDefault().
        expect(fireEvent.mouseDown(checkbox)).toBe(false);
    });
});

describe('IME composition', () => {
    type TRow = { id: number; name: string; qty: number; day: string };
    const rows: TRow[] = [{ id: 1, name: 'Alpha', qty: 1, day: '2024-01-01' }];
    const cols: GridColDef<TRow>[] = [
        { field: 'name', editable: true, width: 120 },
        { field: 'qty', type: 'number', editable: true, width: 80 },
        { field: 'day', type: 'date', editable: true, width: 140 },
    ];

    it.each([
        ['name', 'Aruf'],
        ['qty', '7'],
        ['day', '2024-02-02'],
    ])('Enter that confirms an IME candidate in the %s editor does not commit', async (field, typed) => {
        const { container, processRowUpdate } = renderGrid<TRow>(rows, cols);
        fireEvent.doubleClick(cellOf(container, 0, field));
        const input = container.querySelector<HTMLInputElement>('.ogx__edit-input')!;
        fireEvent.change(input, { target: { value: typed } });
        fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
        fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
        await act(async () => { await Promise.resolve(); });
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(container.querySelector('.ogx__edit-input')).toBe(input);
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
    });
});

describe('editor accessible names', () => {
    type ARow = { id: number; name: string; qty: number; active: boolean; status: string; day: string };
    const rows: ARow[] = [{ id: 1, name: 'Alpha', qty: 1, active: true, status: 'Open', day: '2024-01-01' }];
    const cols: GridColDef<ARow>[] = [
        { field: 'name', headerName: 'Name', editable: true, width: 100 },
        { field: 'qty', headerName: 'Quantity', type: 'number', editable: true, width: 100 },
        { field: 'active', headerName: 'Active', type: 'boolean', editable: true, width: 100 },
        { field: 'status', headerName: 'Status', type: 'singleSelect', editable: true, width: 100, valueOptions: ['Open', 'Closed'] },
        { field: 'day', type: 'date', editable: true, width: 100 },
    ];

    it.each([
        ['name', 'Name'],
        ['qty', 'Quantity'],
        ['active', 'Active'],
        ['status', 'Status'],
        ['day', 'day'],
    ])('the %s editor is named after its column', (field, expected) => {
        const { container } = renderGrid<ARow>(rows, cols);
        fireEvent.doubleClick(cellOf(container, 0, field));
        const editor = container.querySelector<HTMLElement>('.ogx__edit-cell input, .ogx__edit-cell select')!;
        expect(editor).toHaveAccessibleName(expected);
    });
});
