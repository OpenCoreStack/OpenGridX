import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';

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
