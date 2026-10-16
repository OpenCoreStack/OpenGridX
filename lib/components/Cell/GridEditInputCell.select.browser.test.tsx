import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';
import '../../styles/opengridx.css';

// The singleSelect editor (a native <select>) in real Chromium, Firefox and WebKit: real focus,
// real clicks and real key presses. A native select's popup is drawn by the browser outside the
// page, so these tests cannot open it and pick from it; they drive the focused select with the
// keyboard and with Playwright's selectOption (which sets the value and fires input / change).

type Row = { id: number; name: string; role: string; team: string };

const ROWS: Row[] = [
    { id: 1, name: 'Ann', role: 'Editor', team: 'Red' },
    { id: 2, name: 'Bob', role: 'Admin', team: 'Blue' },
    { id: 3, name: 'Cid', role: 'Viewer', team: 'Green' },
];
const COLS: GridColDef<Row>[] = [
    { field: 'name', editable: true, width: 120 },
    { field: 'role', headerName: 'Role', editable: true, width: 140, type: 'singleSelect', valueOptions: ['Admin', 'Editor', 'Viewer'] },
    { field: 'team', editable: true, width: 120 },
];

const Bounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 300, width: 500, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const cellOf = (container: HTMLElement, rowIndex: number, field: string) =>
    container.querySelector<HTMLElement>(`.ogx__rows [data-rowindex="${rowIndex}"] [data-field="${field}"]`);
const editorOf = (container: HTMLElement) => container.querySelector<HTMLSelectElement>('.ogx__edit-select');

function renderGrid() {
    const processRowUpdate = vi.fn((r: Row) => r);
    const { container } = render(<Bounded><DataGrid rows={ROWS} columns={COLS} height="100%" processRowUpdate={processRowUpdate} /></Bounded>);
    return { container, processRowUpdate };
}

async function openByDoubleClick(container: HTMLElement): Promise<HTMLSelectElement> {
    await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
    await userEvent.dblClick(cellOf(container, 0, 'role')!);
    await expect.poll(() => editorOf(container)).not.toBeNull();
    const select = editorOf(container)!;
    await expect.poll(() => document.activeElement).toBe(select);
    return select;
}

/** Focuses the role cell with a click, then opens the editor with Enter. */
async function openByEnter(container: HTMLElement): Promise<HTMLSelectElement> {
    await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
    await userEvent.click(cellOf(container, 0, 'role')!);
    await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'role'));
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => editorOf(container)).not.toBeNull();
    const select = editorOf(container)!;
    await expect.poll(() => document.activeElement).toBe(select);
    return select;
}

afterEach(() => cleanup());

describe('singleSelect editor with the mouse', () => {
    it('double-click opens the editor with the current value and focus on the select', async () => {
        const { container } = renderGrid();
        const select = await openByDoubleClick(container);
        expect(select.value).toBe('Editor');
        expect(select.getAttribute('aria-label')).toBe('Role');
        expect(cellOf(container, 0, 'role')!.className).toContain('ogx__cell--editing');
    });

    // Same concern as the 3.2.1 boolean fix: if the engine does not focus a <select> on mousedown,
    // the focusable cell around it would take focus, the blur would commit and the editor unmount.
    it('clicking the open select keeps the editor open, focused and uncommitted', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByDoubleClick(container);
        await userEvent.click(select);
        await frame();
        expect(editorOf(container)).toBe(select);
        expect(document.activeElement).toBe(select);
        expect(processRowUpdate).not.toHaveBeenCalled();
        // Close a popup the click may have opened, so the rest of the page gets the input again.
        await userEvent.keyboard('{Escape}');
    });

    it('picking an option does not commit or close the editor by itself', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByDoubleClick(container);
        await userEvent.selectOptions(select, 'Viewer');
        await frame();
        expect(editorOf(container)).toBe(select);
        expect(select.value).toBe('Viewer');
        expect(document.activeElement).toBe(select);
        expect(processRowUpdate).not.toHaveBeenCalled();
    });

    it('clicking another cell commits the picked option and the cell shows it', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByDoubleClick(container);
        await userEvent.selectOptions(select, 'Viewer');
        await userEvent.click(cellOf(container, 1, 'name')!);
        await expect.poll(() => editorOf(container)).toBeNull();
        await expect.poll(() => processRowUpdate.mock.calls.length).toBe(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: 'Viewer' });
        await expect.poll(() => cellOf(container, 0, 'role')!.textContent).toBe('Viewer');
        expect(cellOf(container, 1, 'name')!.className).toContain('ogx__cell--focused');
    });

    it('click, pick, then Enter commits and returns focus to the cell', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByDoubleClick(container);
        await userEvent.click(select);
        // Escape on an open popup closes the popup only; on a closed select it cancels the edit
        // (headless engines here: always cancels). Reopen the editor in that case.
        await userEvent.keyboard('{Escape}');
        const active = editorOf(container) ?? await openByDoubleClick(container);
        await userEvent.selectOptions(active, 'Admin');
        active.focus();
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => editorOf(container)).toBeNull();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: 'Admin' });
        await expect.poll(() => cellOf(container, 0, 'role')!.textContent).toBe('Admin');
        await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'role'));
    });
});

describe('singleSelect editor with the keyboard', () => {
    it('Enter on the focused cell opens the editor with focus on the select', async () => {
        const { container } = renderGrid();
        const select = await openByEnter(container);
        expect(select.value).toBe('Editor');
    });

    // Not implemented: only Enter and double-click open an editor (handleGridKeyDown in
    // hooks/core/gridKeyDown.ts has no F2 or printable-key branch). `it.fails` flags it once it is.
    it.fails('F2 on the focused cell opens the editor', async () => {
        const { container } = renderGrid();
        await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
        await userEvent.click(cellOf(container, 0, 'role')!);
        await userEvent.keyboard('{F2}');
        await frame();
        expect(editorOf(container)).not.toBeNull();
    });

    it.fails('typing a character on the focused cell opens the editor', async () => {
        const { container } = renderGrid();
        await expect.poll(() => cellOf(container, 0, 'role')).not.toBeNull();
        await userEvent.click(cellOf(container, 0, 'role')!);
        await userEvent.keyboard('v');
        await frame();
        expect(editorOf(container)).not.toBeNull();
    });

    it('ArrowDown / ArrowUp stay in the select: the grid neither moves focus nor ends the edit', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        const seen: string[] = [];
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        seen.push(select.value);
        expect(editorOf(container)).toBe(select);
        expect(document.activeElement).toBe(select);
        await userEvent.keyboard('{ArrowUp}');
        await frame();
        seen.push(select.value);
        expect(editorOf(container)).toBe(select);
        expect(document.activeElement).toBe(select);
        // The focused cell is still the edited one, not the row below or above.
        expect(cellOf(container, 1, 'role')!.className).not.toContain('ogx__cell--focused');
        expect(processRowUpdate).not.toHaveBeenCalled();
        // On a closed select ArrowDown picks the next option (Editor → Viewer) and ArrowUp goes back;
        // where the engine opens a popup instead (macOS: all three engines here), the value stays put.
        expect(['Viewer,Editor', 'Editor,Editor']).toContain(seen.join(','));
        await userEvent.keyboard('{Escape}');
    });

    it('ArrowLeft / ArrowRight do not move grid focus while editing', async () => {
        const { container } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.keyboard('{ArrowRight}');
        await userEvent.keyboard('{ArrowLeft}');
        await frame();
        expect(editorOf(container)).toBe(select);
        expect(document.activeElement).toBe(select);
        expect(cellOf(container, 0, 'team')!.className).not.toContain('ogx__cell--focused');
        expect(cellOf(container, 0, 'name')!.className).not.toContain('ogx__cell--focused');
        await userEvent.keyboard('{Escape}');
    });

    it('typing an option\'s first letter on the focused select picks it (type-ahead), Enter commits', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.keyboard('v');
        await expect.poll(() => select.value).toBe('Viewer');
        expect(editorOf(container)).toBe(select);
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => editorOf(container)).toBeNull();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: 'Viewer' });
        await expect.poll(() => cellOf(container, 0, 'role')!.textContent).toBe('Viewer');
        await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'role'));
    });

    it('a value moved to with the arrows is committed by Enter', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        const picked = select.value;
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => editorOf(container)).toBeNull();
        if (picked === 'Editor') {
            // The engine opened a popup on ArrowDown instead of changing the value: nothing changed.
            expect(processRowUpdate).not.toHaveBeenCalled();
        } else {
            expect(processRowUpdate).toHaveBeenCalledTimes(1);
            expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: picked });
        }
        await expect.poll(() => cellOf(container, 0, 'role')!.textContent).toBe(picked);
    });

    it('Escape cancels and restores the old value', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.selectOptions(select, 'Admin');
        select.focus();
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => editorOf(container)).toBeNull();
        expect(cellOf(container, 0, 'role')!.textContent).toBe('Editor');
        await frame();
        expect(processRowUpdate).not.toHaveBeenCalled();
        await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'role'));
        // Reopening shows the stored value, not the abandoned pick.
        await userEvent.keyboard('{Enter}');
        await expect.poll(() => editorOf(container)?.value).toBe('Editor');
    });

    it('Tab commits once and moves focus to the next editable cell', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.selectOptions(select, 'Admin');
        select.focus();
        await userEvent.keyboard('{Tab}');
        await expect.poll(() => editorOf(container)).toBeNull();
        await frame();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: 'Admin' });
        expect(cellOf(container, 0, 'role')!.textContent).toBe('Admin');
        expect(cellOf(container, 0, 'team')!.className).toContain('ogx__cell--focused');
        await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'team'));
    });

    it('Shift+Tab commits once and moves focus to the previous editable cell', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.selectOptions(select, 'Viewer');
        select.focus();
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        await expect.poll(() => editorOf(container)).toBeNull();
        await frame();
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, role: 'Viewer' });
        await expect.poll(() => document.activeElement).toBe(cellOf(container, 0, 'name'));
    });

    it('Space and Alt+ArrowDown on the focused select leave the edit open (they open the popup natively)', async () => {
        const { container, processRowUpdate } = renderGrid();
        const select = await openByEnter(container);
        await userEvent.keyboard(' ');
        await frame();
        expect(editorOf(container)).toBe(select);
        await userEvent.keyboard('{Escape}');
        const active = editorOf(container) ?? await openByEnter(container);
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
        await frame();
        expect(editorOf(container)).toBe(active);
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(cellOf(container, 1, 'role')!.className).not.toContain('ogx__cell--focused');
        await userEvent.keyboard('{Escape}');
    });
});
