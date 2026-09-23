import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridListViewColDef, GridRowModel, GridRowId } from '../../types';

// Real focus and Tab order: jsdom cannot show either.

afterEach(() => { cleanup(); });

type TRow = GridRowModel & { id: number; name: string; path?: string[] };
const COLS: GridColDef<TRow>[] = [{ field: 'name', width: 150 }];
const ROWS: TRow[] = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `r${i + 1}` }));
const LIST_COL: GridListViewColDef<TRow> = {
    field: 'name',
    renderCell: (p) => <div style={{ height: 40 }}>{String(p.row.name)}</div>,
};

const Box = ({ children }: { children: React.ReactNode }) => (
    <div style={{ height: 300, width: 500, display: 'flex', flexDirection: 'column' }}>
        <button type="button">before</button>
        {children}
    </div>
);

const rowEls = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('.ogx-list-view__row'));
const focusedName = () => (document.activeElement as HTMLElement | null)?.textContent;

describe('list view keyboard', () => {
    it('is a single Tab stop and moves between rows with the arrow keys, Home and End', async () => {
        const { container, getByText } = render(
            <Box><DataGrid rows={ROWS} columns={COLS} listView listViewColumn={LIST_COL} height={260} /></Box>
        );
        getByText('before').focus();
        await userEvent.keyboard('{Tab}');
        expect(focusedName()).toBe('r1');
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(focusedName()).toBe('r3');
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedName()).toBe('r2');
        await userEvent.keyboard('{End}');
        expect(focusedName()).toBe('r30');
        // The focused row is scrolled into view
        const list = container.querySelector<HTMLElement>('.ogx-list-view__rows')!;
        const last = rowEls(container)[29].getBoundingClientRect();
        const box = list.getBoundingClientRect();
        expect(last.bottom).toBeLessThanOrEqual(box.bottom + 1);
        await userEvent.keyboard('{Home}');
        expect(focusedName()).toBe('r1');
        expect(rowEls(container).filter(r => r.tabIndex === 0)).toHaveLength(1);
    });

    it('returns Tab to the last focused row', async () => {
        const { getByText } = render(
            <Box><DataGrid rows={ROWS} columns={COLS} listView listViewColumn={LIST_COL} height={260} /></Box>
        );
        getByText('before').focus();
        await userEvent.keyboard('{Tab}{ArrowDown}{ArrowDown}');
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement?.textContent).toBe('before');
        await userEvent.keyboard('{Tab}');
        expect(focusedName()).toBe('r3');
    });

    it('activates the focused row with Enter and Space, and selects it with Shift+Space', async () => {
        const onRowClick = vi.fn();
        const onRowSelectionModelChange = vi.fn<(ids: GridRowId[]) => void>();
        const { getByText } = render(
            <Box>
                <DataGrid rows={ROWS} columns={COLS} listView listViewColumn={LIST_COL} height={260}
                    onRowClick={onRowClick} disableRowSelectionOnClick checkboxSelection
                    onRowSelectionModelChange={onRowSelectionModelChange} />
            </Box>
        );
        getByText('before').focus();
        await userEvent.keyboard('{Tab}');
        // With checkboxSelection the first Tab stop inside the row list is the focused row, not a checkbox.
        expect(focusedName()).toBe('r1');
        await userEvent.keyboard('{ArrowDown}{Enter}');
        expect(onRowClick).toHaveBeenLastCalledWith(expect.objectContaining({ id: 2 }));
        await userEvent.keyboard(' ');
        expect(onRowClick).toHaveBeenCalledTimes(2);
        await userEvent.keyboard('{Shift>} {/Shift}');
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
    });

    it('expands and collapses a tree-data parent with Enter', async () => {
        const rows: TRow[] = [
            { id: 1, name: 'parent', path: ['parent'] },
            { id: 2, name: 'child', path: ['parent', 'child'] },
        ];
        const { container, getByText } = render(
            <Box>
                <DataGrid rows={rows} columns={COLS} listView listViewColumn={LIST_COL} height={260}
                    treeData getTreeDataPath={(r) => r.path ?? []} />
            </Box>
        );
        getByText('before').focus();
        await userEvent.keyboard('{Tab}');
        expect(focusedName()).toBe('parent');
        expect(rowEls(container)).toHaveLength(1);
        expect(rowEls(container)[0].getAttribute('aria-expanded')).toBe('false');
        await userEvent.keyboard('{Enter}');
        expect(rowEls(container)).toHaveLength(2);
        expect(focusedName()).toBe('parent');
        await userEvent.keyboard('{Enter}');
        expect(rowEls(container)).toHaveLength(1);
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        expect(rowEls(container)).toHaveLength(2);
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        expect(rowEls(container)).toHaveLength(2);
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        expect(rowEls(container)).toHaveLength(1);
    });

    it('does not make the row checkboxes separate Tab stops', async () => {
        const { getByText } = render(
            <Box>
                <DataGrid rows={ROWS.slice(0, 3)} columns={COLS} listView listViewColumn={LIST_COL} height={260} checkboxSelection />
                <button type="button">after</button>
            </Box>
        );
        getByText('before').focus();
        await userEvent.keyboard('{Tab}{Tab}');
        expect(document.activeElement?.textContent).toBe('after');
    });
});
