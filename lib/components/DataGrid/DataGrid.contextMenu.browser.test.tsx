import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { userEvent, commands, page } from 'vitest/browser';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import '../../styles/opengridx.css';
import { DataGrid } from '../../index';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridContextMenuEntry, GridContextMenuParams } from '../../types';

// The cell context menu (`contextMenu`) in Chromium, Firefox and WebKit: real right-clicks
// (Playwright mouse), menu placement against the window edges, RTL, Shift+F10 and focus return,
// the cell range, and which row a right-click reports with pinned rows, scrolling and grouping.

declare module 'vitest/browser' {
    interface BrowserCommands {
        pointerUp: () => Promise<void>;
    }
}

type Row = { id: number; name: string; group: string; n: number };

const makeRows = (count: number): Row[] =>
    Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `r${i + 1}`, group: i % 2 ? 'odd' : 'even', n: i }));
const COLUMNS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'group', headerName: 'Group', width: 140 },
    { field: 'n', headerName: 'N', width: 140, type: 'number' },
];

const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const settle = async () => { for (let i = 0; i < 4; i++) await frame(); };
const menuEl = () => document.querySelector<HTMLElement>('.ogx-context-menu');
/** The menu once it is positioned (it renders hidden first, measures, then shows). */
const openMenu = async () => {
    await expect.poll(() => menuEl()?.style.visibility).toBe('visible');
    return menuEl()!;
};
const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    c.querySelector<HTMLElement>(`.ogx__viewport [role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`);
// Vitest's Playwright provider has no userEvent.pointer: a right button click is Playwright's own
// mouse input in every engine (WebKit included), at the element's centre.
const rightClick = async (el: Element) => {
    await userEvent.click(el, { button: 'right' });
};
const rangeCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--range')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`,
    );

let apiOut: { current: GridApi | null } = { current: null };
function Grid(props: Partial<DataGridProps<Row>> & { box?: React.CSSProperties; dir?: 'rtl' | 'ltr' }) {
    const apiRef = useGridApiRef();
    useLayoutEffect(() => { apiOut.current = apiRef.current; });
    const { box, dir, ...rest } = props;
    return (
        <div dir={dir} style={{ height: 300, width: 480, ...box }}>
            {/* A text input outside the grid: a Tab-order anchor that every engine stops on. */}
            <input aria-label="before" />
            <DataGrid<Row> rows={makeRows(40)} columns={COLUMNS} height={260} contextMenu apiRef={apiRef} {...rest} />
        </div>
    );
}
const renderGrid = async (ui: ReactNode) => {
    const r = render(<>{ui}</>);
    await settle();
    return r;
};

beforeEach(async () => {
    await page.viewport(1000, 700);
    apiOut = { current: null };
});
afterEach(async () => {
    await commands.pointerUp().catch(() => {});
    cleanup();
});

describe('DataGrid context menu (browser)', () => {
    it('a right-click opens the menu at the pointer', async () => {
        const { container } = await renderGrid(<Grid />);
        const cell = cellAt(container, 1, 'name')!;
        await rightClick(cell);
        const menu = await openMenu();
        const cellRect = cell.getBoundingClientRect();
        const rect = menu.getBoundingClientRect();
        // Playwright presses at the cell's centre.
        expect(Math.abs(rect.left - (cellRect.left + cellRect.width / 2))).toBeLessThanOrEqual(2);
        expect(Math.abs(rect.top - (cellRect.top + cellRect.height / 2))).toBeLessThanOrEqual(2);
        expect(menu.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(0);
    });

    it('near the right and bottom edges of the window the menu stays inside it', async () => {
        const { container } = await renderGrid(
            <div style={{ position: 'fixed', right: 0, bottom: 0 }}><Grid box={{ width: 300 }} /></div>,
        );
        // The last column whose centre is inside the grid (the press lands there), in the last row whose
        // centre is inside the viewport: near the bottom-right corner of the window.
        const viewportRect = container.querySelector<HTMLElement>('.ogx__viewport')!.getBoundingClientRect();
        const centreInside = (el: Element) => {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            return x > viewportRect.left && x < viewportRect.right - 20 && y > viewportRect.top && y < viewportRect.bottom - 20;
        };
        const cell = Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"] .ogx__cell')).filter(centreInside).pop()!;
        expect(window.innerWidth - cell.getBoundingClientRect().right).toBeLessThan(250);
        expect(window.innerHeight - cell.getBoundingClientRect().bottom).toBeLessThan(80);
        await rightClick(cell);
        const rect = (await openMenu()).getBoundingClientRect();
        expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
        expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.top).toBeGreaterThanOrEqual(0);
    });

    it('in a right-to-left grid the menu opens towards the inline start', async () => {
        const { container } = await renderGrid(<Grid dir="rtl" box={{ marginLeft: 400 }} />);
        const cell = cellAt(container, 1, 'group')!;
        await rightClick(cell);
        const rect = (await openMenu()).getBoundingClientRect();
        const pointerX = cell.getBoundingClientRect().left + cell.getBoundingClientRect().width / 2;
        expect(Math.abs(rect.right - pointerX)).toBeLessThanOrEqual(2);
    });

    it('Shift+F10 opens the menu on the focused cell; Escape closes it and focus returns to the cell', async () => {
        const { container } = await renderGrid(<Grid />);
        const cell = cellAt(container, 2, 'group')!;
        await userEvent.click(cell);
        await settle();
        await userEvent.keyboard('{Shift>}{F10}{/Shift}');
        const menu = await openMenu();
        const cellRect = cellAt(container, 2, 'group')!.getBoundingClientRect();
        // Keyboard-opened menus anchor at the cell's corner.
        expect(Math.abs(menu.getBoundingClientRect().top - cellRect.bottom)).toBeLessThanOrEqual(2);
        await expect.poll(() => menu.contains(document.activeElement)).toBe(true);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => menuEl()).toBeNull();
        await expect.poll(() => document.activeElement === cellAt(container, 2, 'group')).toBe(true);
    });

    it('a right-click inside a cell range keeps it; outside collapses it', async () => {
        const { container } = await renderGrid(<Grid cellSelection />);
        act(() => {
            apiOut.current!.setCellSelectionModel([{ anchor: { id: 1, field: 'name' }, head: { id: 2, field: 'group' } }]);
        });
        await settle();
        const range = ['0:name', '0:group', '1:name', '1:group'];
        expect(rangeCells(container)).toEqual(range);

        await rightClick(cellAt(container, 1, 'group')!);
        await openMenu();
        expect(rangeCells(container)).toEqual(range);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => menuEl()).toBeNull();

        await rightClick(cellAt(container, 4, 'n')!);
        await openMenu();
        // Collapsed to the clicked cell (a one-cell range draws no range outline).
        expect(rangeCells(container)).toEqual([]);
        expect(apiOut.current!.getCellSelectionModel()).toEqual([{ anchor: { id: 5, field: 'n' }, head: { id: 5, field: 'n' } }]);
    });

    describe('reports the row that was right-clicked', () => {
        const lastParams = (fn: ReturnType<typeof spy>) => fn.mock.calls[fn.mock.calls.length - 1][0];
        const spy = () => vi.fn((_p: GridContextMenuParams<Row>, defaults: readonly GridContextMenuEntry[]) => defaults);

        it('a top-pinned row', async () => {
            const getItems = spy();
            const { container } = await renderGrid(<Grid pinnedRows={{ top: [30] }} getContextMenuItems={getItems} />);
            const cell = container.querySelector<HTMLElement>('.ogx__viewport [role="row"][data-rowindex="0"] [data-field="name"]')!;
            expect(cell.textContent).toBe('r30');
            await rightClick(cell);
            await openMenu();
            expect(lastParams(getItems).id).toBe(30);
        });

        it('a centre row after scrolling', async () => {
            const getItems = spy();
            const { container } = await renderGrid(<Grid getContextMenuItems={getItems} />);
            const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
            viewport.scrollTop = 600;
            await settle();
            const cell = Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"] [data-field="name"]'))
                .find(el => {
                    const r = el.getBoundingClientRect();
                    const v = viewport.getBoundingClientRect();
                    return r.top > v.top + 60 && r.bottom < v.bottom;
                })!;
            const expected = Number(cell.textContent!.slice(1));
            expect(expected).toBeGreaterThan(10);
            await rightClick(cell);
            await openMenu();
            expect(lastParams(getItems).id).toBe(expected);
        });

        it('a grouped child row', async () => {
            const getItems = spy();
            const { container } = await renderGrid(
                <Grid rowGroupingModel={['group']} defaultGroupingExpansionDepth={-1} getContextMenuItems={getItems} />,
            );
            const cell = Array.from(container.querySelectorAll<HTMLElement>('.ogx__viewport [data-field="name"]'))
                .find(el => el.textContent === 'r3')!;
            await rightClick(cell);
            await openMenu();
            const call = lastParams(getItems);
            expect(call.id).toBe(3);
            expect(call.row.name).toBe('r3');
        });
    });

    it('scrolling the grid closes the menu', async () => {
        const { container } = await renderGrid(<Grid />);
        await rightClick(cellAt(container, 1, 'name')!);
        await openMenu();
        container.querySelector<HTMLElement>('.ogx__viewport')!.scrollTop = 200;
        await expect.poll(() => menuEl()).toBeNull();
    });

    it('openContextMenu on a row far below the viewport scrolls to it and opens anchored there', async () => {
        const { container } = await renderGrid(<Grid rows={makeRows(2000)} />);
        act(() => { apiOut.current!.openContextMenu(1500, 'group'); });
        const menu = await openMenu();
        const rect = menu.getBoundingClientRect();
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
        expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
        // Still open after the scroll has settled: the scroll event did not close it.
        await settle();
        expect(menuEl()).not.toBeNull();
        await expect.poll(() => menu.contains(document.activeElement)).toBe(true);
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => menuEl()).toBeNull();
        await expect.poll(() => document.activeElement?.closest('[role="row"]')?.getAttribute('data-rowindex')).toBe('1499');
        expect((document.activeElement as HTMLElement).dataset.field).toBe('group');
        expect(container.contains(document.activeElement)).toBe(true);
    });

    it('Shift+F10 on a focused cell scrolled out of view opens the menu and it stays open', async () => {
        const { container } = await renderGrid(<Grid />);
        await userEvent.click(cellAt(container, 1, 'name')!);
        await settle();
        container.querySelector<HTMLElement>('.ogx__viewport')!.scrollTop = 600;
        await settle();
        await userEvent.keyboard('{Shift>}{F10}{/Shift}');
        await openMenu();
        await settle();
        expect(menuEl()).not.toBeNull();
        await userEvent.keyboard('{Escape}');
        await expect.poll(() => document.activeElement === cellAt(container, 1, 'name')).toBe(true);
    });
});
