import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';
import '../../styles/opengridx.css';

// Real Chromium: real focus, real mouse clicks and real scrolling. jsdom cannot show that a
// click inside an editor moves focus away, or that a scrolled-out editor never fires blur.

type Row = { id: number; name: string; role: string | null };

const ROWS: Row[] = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, name: `N${i}`, role: 'Admin' }));
const COLS: GridColDef<Row>[] = [
    { field: 'name', editable: true, width: 200 },
    { field: 'role', editable: true, width: 200, type: 'singleSelect', valueOptions: ['Admin', 'Editor', 'Viewer'] },
];

const Bounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 400, width: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const cellOf = (container: HTMLElement, rowIndex: number, field: string) =>
    container.querySelector<HTMLElement>(`.ogx__rows [data-rowindex="${rowIndex}"] [data-field="${field}"]`);

afterEach(() => cleanup());

describe('DataGrid editing in a real browser', () => {
    it('clicking inside the open text editor keeps it open and focused', async () => {
        const { container } = render(<Bounded><DataGrid rows={ROWS} columns={COLS} height="100%" /></Bounded>);
        await expect.poll(() => cellOf(container, 0, 'name')).not.toBeNull();
        await userEvent.dblClick(cellOf(container, 0, 'name')!);
        const input = container.querySelector<HTMLInputElement>('.ogx__edit-input')!;
        expect(input).not.toBeNull();
        await userEvent.keyboard('X');
        await userEvent.click(input);
        await frame();
        expect(container.querySelector('.ogx__edit-input')).toBe(input);
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('X');
    });

    it('clicking the open select editor keeps it open', async () => {
        const { container } = render(<Bounded><DataGrid rows={ROWS} columns={COLS} height="100%" /></Bounded>);
        await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
        await userEvent.dblClick(cellOf(container, 0, 'role')!);
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        expect(select).not.toBeNull();
        await userEvent.click(select);
        await frame();
        expect(container.querySelector('.ogx__edit-select')).toBe(select);
    });

    it('the first option can be chosen when the current value is null', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const rows: Row[] = [{ id: 1, name: 'N0', role: null }];
        const { container } = render(<Bounded><DataGrid rows={rows} columns={COLS} height="100%" processRowUpdate={processRowUpdate} /></Bounded>);
        await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
        await userEvent.dblClick(cellOf(container, 0, 'role')!);
        const select = container.querySelector<HTMLSelectElement>('.ogx__edit-select')!;
        // The editor must not pretend 'Admin' is already chosen: re-picking the displayed
        // option fires no change event in a real dropdown, so the user could never set it.
        expect(select.value).toBe('');
        expect(select.selectedOptions[0]?.textContent).toBe('');
        await userEvent.selectOptions(select, 'Admin');
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0].role).toBe('Admin');
    });

    it('an edit scrolled out of the render window is committed, not lost', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<Bounded><DataGrid rows={ROWS} columns={COLS} height="100%" processRowUpdate={processRowUpdate} /></Bounded>);
        await expect.poll(() => cellOf(container, 0, 'name')).not.toBeNull();
        await userEvent.dblClick(cellOf(container, 0, 'name')!);
        await userEvent.keyboard('Changed');
        // Firefox scrolls the caret into view a frame after typing; let it settle so it does not undo the scroll below.
        await frame();

        const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
        viewport.scrollTop = 5000;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => cellOf(container, 0, 'name')).toBeNull();
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, name: 'Changed' });

        // Editing another cell works and does not disturb the committed value.
        const visible = container.querySelector<HTMLElement>('.ogx__rows [role="row"] [data-field="name"]')!;
        await userEvent.dblClick(visible);
        await expect.poll(() => container.querySelector('.ogx__edit-input')).not.toBeNull();
        await userEvent.keyboard('{Escape}');

        viewport.scrollTop = 0;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => cellOf(container, 0, 'name')?.textContent).toBe('Changed');
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    it('Tab out of an editor commits once and moves to the next editable cell', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<Bounded><DataGrid rows={ROWS} columns={COLS} height="100%" processRowUpdate={processRowUpdate} /></Bounded>);
        await expect.poll(() => cellOf(container, 0, 'name')).not.toBeNull();
        await userEvent.click(cellOf(container, 0, 'name')!);
        await userEvent.dblClick(cellOf(container, 0, 'name')!);
        await userEvent.keyboard('Tabbed');
        await userEvent.keyboard('{Tab}');
        await expect.poll(() => container.querySelector('.ogx__edit-input')).toBeNull();
        await frame();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(cellOf(container, 0, 'role')!.className).toContain('ogx__cell--focused');
    });
});

// The built-in editors render through the shared <Input variant="cell"> / <Checkbox>: the ref
// must still reach the <input> (focus + select on open) and the keys and blur must still commit.
type TypedRow = { id: number; name: string; qty: number; due: string; active: boolean };
const TYPED_ROWS: TypedRow[] = [
    { id: 1, name: 'Alpha', qty: 12, due: '2024-01-10', active: false },
    { id: 2, name: 'Beta', qty: 5, due: '2024-02-20', active: true },
];
const TYPED_COLS: GridColDef<TypedRow>[] = [
    { field: 'name', editable: true, width: 120 },
    { field: 'qty', editable: true, width: 100, type: 'number' },
    { field: 'due', editable: true, width: 160, type: 'date' },
    { field: 'active', editable: true, width: 100, type: 'boolean' },
];

function renderTyped() {
    const processRowUpdate = vi.fn((r: TypedRow) => r);
    const { container } = render(<Bounded><DataGrid rows={TYPED_ROWS} columns={TYPED_COLS} height="100%" processRowUpdate={processRowUpdate} /></Bounded>);
    return { container, processRowUpdate };
}

async function openEditor(container: HTMLElement, field: string): Promise<HTMLInputElement> {
    await expect.poll(() => cellOf(container, 0, field)).not.toBeNull();
    await userEvent.dblClick(cellOf(container, 0, field)!);
    await expect.poll(() => cellOf(container, 0, field)?.querySelector('input') ?? null).not.toBeNull();
    const input = cellOf(container, 0, field)!.querySelector<HTMLInputElement>('input')!;
    await expect.poll(() => document.activeElement).toBe(input);
    return input;
}

describe('built-in editors through the shared Input and Checkbox', () => {
    it('text: renders in the cell variant, focuses and selects on open, Enter commits', async () => {
        const { container, processRowUpdate } = renderTyped();
        const input = await openEditor(container, 'name');
        expect(input.className).toContain('ogx__edit-input');
        expect(input.closest('.ogx-input-wrapper--cell')).not.toBeNull();
        // The whole value is selected, so typing replaces it.
        await userEvent.keyboard('Z');
        expect(input.value).toBe('Z');
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, name: 'Z' });
    });

    it('text: Escape cancels', async () => {
        const { container, processRowUpdate } = renderTyped();
        await openEditor(container, 'name');
        await userEvent.keyboard('Gone');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => container.querySelector('.ogx__edit-input')).toBeNull();
        expect(cellOf(container, 0, 'name')!.textContent).toBe('Alpha');
        expect(processRowUpdate).not.toHaveBeenCalled();
    });

    it('number: focuses and selects on open, blur commits', async () => {
        const { container, processRowUpdate } = renderTyped();
        const input = await openEditor(container, 'qty');
        expect(input.className).toContain('ogx__edit-input--number');
        await userEvent.keyboard('7');
        expect(input.value).toBe('7');
        await userEvent.click(cellOf(container, 1, 'name')!);
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, qty: 7 });
    });

    it('number: Escape cancels', async () => {
        const { container, processRowUpdate } = renderTyped();
        await openEditor(container, 'qty');
        await userEvent.keyboard('99');
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => container.querySelector('.ogx__edit-input')).toBeNull();
        expect(processRowUpdate).not.toHaveBeenCalled();
    });

    it('date: focuses on open, Enter commits, Escape cancels', async () => {
        const { container, processRowUpdate } = renderTyped();
        const input = await openEditor(container, 'due');
        expect(input.type).toBe('date');
        await userEvent.fill(input, '2025-03-15');
        input.focus();
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, due: '2025-03-15' });

        const again = await openEditor(container, 'due');
        await userEvent.fill(again, '2030-01-01');
        again.focus();
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => container.querySelector('.ogx__edit-input')).toBeNull();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    // 3.2.1 regression: Safari does not focus a checkbox on click, so the cell blur used to commit
    // the old value before the click toggled it. The pointer lands on the drawn box.
    it('boolean: clicking the drawn box toggles and commits', async () => {
        const { container, processRowUpdate } = renderTyped();
        const input = await openEditor(container, 'active');
        expect(input.className).toContain('ogx__edit-checkbox');
        await userEvent.click(cellOf(container, 0, 'active')!.querySelector<HTMLElement>('.ogx-checkbox__box')!);
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, active: true });
    });
});
