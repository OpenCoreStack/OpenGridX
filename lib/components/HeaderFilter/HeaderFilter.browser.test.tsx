import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { useLayoutEffect } from 'react';
import type { ReactNode, RefObject } from 'react';
import { DataGrid, useGridApiRef } from '../../index';
import type { GridApi, GridColDef, GridColumnPinning } from '../../types';
import '../../styles/opengridx.css';

// Real browsers: typing, focus, menus, sticky layout and scroll positions of the header filter row.

type Row = { id: number; name: string; qty: number; paid: boolean; [k: string]: unknown };

const NAMES = ['Anna', 'Bob', 'Carla', 'Dmitri', 'Eve', 'Farid'];
const makeRows = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `${NAMES[i % NAMES.length]} ${i + 1}`, qty: i % 10, paid: i % 2 === 0 }));

const BASE_COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'qty', headerName: 'Qty', type: 'number', width: 120 },
    { field: 'paid', headerName: 'Paid', type: 'boolean', width: 120 },
];

const Box = ({ children, h = 400, w = 800 }: { children: ReactNode; h?: number; w?: number }) => (
    <div style={{ height: h, width: w }}>{children}</div>
);

function withApi(renderGrid: (api: RefObject<GridApi>) => ReactNode) {
    const holder: { api: RefObject<GridApi> | null } = { api: null };
    const Grid = () => {
        const api = useGridApiRef();
        useLayoutEffect(() => { holder.api = api; }, [api]);
        return <>{renderGrid(api)}</>;
    };
    return { Grid, api: () => holder.api!.current };
}

const frame = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const settle = async () => { await frame(); await frame(); await frame(); };
const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const filterCell = (c: HTMLElement, field: string) => c.querySelector<HTMLElement>(`.ogx__header-filter-row [data-field="${field}"]`);
const headerCell = (c: HTMLElement, field: string) => c.querySelector<HTMLElement>(`.ogx__header [data-field="${field}"]`);
const valueInput = (c: HTMLElement, field: string) => filterCell(c, field)!.querySelector<HTMLInputElement>('input, select')!;
const names = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('.ogx__rows [role="row"] [data-field="name"]')).map(el => el.textContent);
const rectOf = (el: Element) => el.getBoundingClientRect();

afterEach(() => cleanup());

describe('header filter row (real browser)', () => {
    it('filters rows as the user types, after the debounce', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(12)} columns={BASE_COLS} height={400} headerFilters /></Box>);
        await expect.poll(() => filterCell(container, 'name')).not.toBeNull();
        await userEvent.click(valueInput(container, 'name'));
        await userEvent.keyboard('bob');
        expect(document.activeElement).toBe(valueInput(container, 'name'));
        await expect.poll(() => names(container)).toEqual(['Bob 2', 'Bob 8']);
        // Focus stays in the input while the rows change.
        expect(document.activeElement).toBe(valueInput(container, 'name'));
    });

    it('changes the operator from the menu and clears the filter', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(12)} columns={BASE_COLS} height={400} headerFilters /></Box>);
        await expect.poll(() => filterCell(container, 'qty')).not.toBeNull();
        await settle();
        // Rows rendered unfiltered (the render window, not all 12).
        const unfiltered = names(container);
        await userEvent.click(valueInput(container, 'qty'));
        await userEvent.keyboard('7');
        await expect.poll(() => names(container)).toEqual(['Bob 8']);

        await userEvent.click(filterCell(container, 'qty')!.querySelector<HTMLElement>('.ogx__header-filter-operator')!);
        await expect.poll(() => document.querySelector('.ogx__header-filter-menu')).not.toBeNull();
        await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('.ogx__header-filter-menu [role="menuitemradio"]')).find(b => b.textContent === 'Greater than or equal')!);
        await expect.poll(() => names(container)).toEqual(['Bob 8', 'Carla 9', 'Dmitri 10']);
        expect(document.querySelector('.ogx__header-filter-menu')).toBeNull();

        await userEvent.click(filterCell(container, 'qty')!.querySelector<HTMLElement>('.ogx__header-filter-clear')!);
        await expect.poll(() => names(container)).toEqual(unfiltered);
        expect(valueInput(container, 'qty').value).toBe('');
    });

    it('filters a boolean column from its select', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(6)} columns={BASE_COLS} height={400} headerFilters /></Box>);
        await expect.poll(() => filterCell(container, 'paid')).not.toBeNull();
        await userEvent.selectOptions(valueInput(container, 'paid'), 'false');
        await expect.poll(() => names(container)).toEqual(['Bob 2', 'Dmitri 4', 'Farid 6']);
    });

    it('is a header row of headerFilterHeight inside the sticky header', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(100)} columns={BASE_COLS} height={400} headerFilters headerFilterHeight={44} /></Box>);
        await expect.poll(() => filterCell(container, 'name')).not.toBeNull();
        await settle();
        const row = container.querySelector('.ogx__header-filter-row')!;
        expect(Math.round(rectOf(row).height)).toBe(44);
        expect(Math.round(rectOf(row).top)).toBe(Math.round(rectOf(container.querySelector('.ogx__header')!).bottom));
        viewport(container).scrollTop = 600;
        await settle();
        // Still directly under the column headers, at the top of the viewport.
        expect(Math.round(rectOf(container.querySelector('.ogx__header')!).top)).toBe(Math.round(rectOf(viewport(container)).top));
        expect(Math.round(rectOf(row).top)).toBe(Math.round(rectOf(container.querySelector('.ogx__header')!).bottom));
    });

    it('lines filter cells up with their headers with pinned columns, virtualization and horizontal scroll', async () => {
        const wide: GridColDef<Row>[] = [
            ...BASE_COLS,
            ...Array.from({ length: 40 }, (_, i) => ({ field: `c${i}`, headerName: `C${i}`, width: 90 + (i % 3) * 20 })),
        ];
        const rows = makeRows(30).map(r => ({ ...r, ...Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`c${i}`, `${r.id}-${i}`])) }));
        const pinned: GridColumnPinning = { left: ['name'], right: ['paid'] };
        const { container } = render(
            <Box w={700}>
                <DataGrid rows={rows} columns={wide} height={400} headerFilters pinnedColumns={pinned} checkboxSelection />
            </Box>
        );
        await expect.poll(() => filterCell(container, 'name')).not.toBeNull();
        await settle();

        const expectAligned = () => {
            const headers = Array.from(container.querySelectorAll<HTMLElement>('.ogx__header > [data-field]'));
            const filters = Array.from(container.querySelectorAll<HTMLElement>('.ogx__header-filter-row > [data-field]'));
            expect(filters.map(f => f.dataset.field)).toEqual(headers.map(h => h.dataset.field));
            for (const header of headers) {
                const filter = filterCell(container, header.dataset.field!)!;
                const h = rectOf(header);
                const f = rectOf(filter);
                expect({ field: header.dataset.field, left: Math.round(f.left), right: Math.round(f.right) })
                    .toEqual({ field: header.dataset.field, left: Math.round(h.left), right: Math.round(h.right) });
            }
        };
        expectAligned();

        const vp = viewport(container);
        const pinnedLeft = rectOf(filterCell(container, 'name')!).left;
        const pinnedRight = rectOf(filterCell(container, 'paid')!).right;
        vp.scrollLeft = 1500;
        await settle();
        await expect.poll(() => filterCell(container, 'c0')).toBeNull();
        expectAligned();
        // Pinned filter cells stay put while the rest scrolls.
        expect(Math.round(rectOf(filterCell(container, 'name')!).left)).toBe(Math.round(pinnedLeft));
        expect(Math.round(rectOf(filterCell(container, 'paid')!).right)).toBe(Math.round(pinnedRight));

        vp.scrollLeft = vp.scrollWidth;
        await settle();
        expectAligned();
    });

    it('ArrowDown goes from a header to its filter cell and on into the first row', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(10)} columns={BASE_COLS} height={400} headerFilters /></Box>);
        await expect.poll(() => headerCell(container, 'qty')).not.toBeNull();
        await userEvent.click(headerCell(container, 'qty')!.querySelector<HTMLElement>('.ogx__header-cell-title')!);
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(filterCell(container, 'qty'));
        expect(filterCell(container, 'qty')!.classList).toContain('ogx__header-filter-cell--focused');
        await userEvent.keyboard('{Enter}');
        expect(document.activeElement).toBe(valueInput(container, 'qty'));
        await userEvent.keyboard('{Escape}');
        expect(document.activeElement).toBe(filterCell(container, 'qty'));
        await userEvent.keyboard('{ArrowDown}');
        const active = document.activeElement as HTMLElement;
        expect(active.dataset.field).toBe('qty');
        expect(active.closest('[role="row"]')?.getAttribute('data-rowindex')).toBe('0');
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(filterCell(container, 'qty'));
    });

    it('typing on a focused filter cell filters, and Tab from the input leaves the grid', async () => {
        const { container } = render(
            <div>
                <input aria-label="before" />
                <Box><DataGrid rows={makeRows(12)} columns={BASE_COLS} height={400} headerFilters /></Box>
                <input aria-label="after" />
            </div>
        );
        await expect.poll(() => headerCell(container, 'name')).not.toBeNull();
        await userEvent.click(headerCell(container, 'name')!.querySelector<HTMLElement>('.ogx__header-cell-title')!);
        await userEvent.keyboard('{ArrowDown}');
        await userEvent.keyboard('eve');
        expect(document.activeElement).toBe(valueInput(container, 'name'));
        await expect.poll(() => names(container)).toEqual(['Eve 5', 'Eve 11']);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement?.getAttribute('aria-label')).toBe('after');
    });

    it('scroll into view keeps rows clear of the taller sticky header', async () => {
        const { Grid, api } = withApi(a => <DataGrid apiRef={a} rows={makeRows(200)} columns={BASE_COLS} height={400} headerFilters headerFilterHeight={48} />);
        const { container } = render(<Box><Grid /></Box>);
        await expect.poll(() => filterCell(container, 'name')).not.toBeNull();
        const vp = viewport(container);
        vp.scrollTop = 3000;
        await settle();
        await act(async () => { api().scrollToIndexes({ rowIndex: 20 }); });
        await settle();
        const headerBottom = rectOf(container.querySelector('.ogx__header-wrap')!).bottom;
        await expect.poll(() => container.querySelector('.ogx__rows [data-rowindex="20"]')).not.toBeNull();
        expect(rectOf(container.querySelector('.ogx__rows [data-rowindex="20"]')!).top).toBeGreaterThanOrEqual(headerBottom - 1);

        // Keyboard: ArrowUp past the first fully visible row brings the row above fully under the header.
        const rowsBelowHeader = Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"]'))
            .filter(r => rectOf(r).top >= headerBottom - 1 && rectOf(r).bottom <= rectOf(vp).bottom);
        const index = Number(rowsBelowHeader[0].getAttribute('data-rowindex'));
        const middle = rowsBelowHeader[Math.floor(rowsBelowHeader.length / 2)];
        const steps = Number(middle.getAttribute('data-rowindex')) - index + 1;
        await userEvent.click(middle.querySelector<HTMLElement>('[data-field="qty"]')!);
        for (let i = 0; i < steps; i++) await userEvent.keyboard('{ArrowUp}');
        await settle();
        expect((document.activeElement as HTMLElement).closest('[role="row"]')?.getAttribute('data-rowindex')).toBe(String(index - 1));
        const above = container.querySelector(`.ogx__rows [data-rowindex="${index - 1}"]`)!;
        expect(rectOf(above).top).toBeGreaterThanOrEqual(rectOf(container.querySelector('.ogx__header-wrap')!).bottom - 1);
    });
});
