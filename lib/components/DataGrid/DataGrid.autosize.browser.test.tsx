import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useEffect } from 'react';
import { userEvent, page } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridColDef, GridRowModel } from '../../types';

type GridApiRef = ReturnType<typeof useGridApiRef>;

const LONG = 'A rather long piece of cell content that needs room';
const ROWS: GridRowModel[] = [
    { id: 1, name: LONG, short: 'ab', age: 2 },
    { id: 2, name: 'short', short: 'cd', age: 1 },
];

function renderGrid(props: Partial<DataGridProps> & { columns: GridColDef[] }, width = 1000) {
    const utils = render(
        <div style={{ width, height: 400 }}>
            <DataGrid rows={ROWS} {...props} />
        </div>
    );
    const header = (field: string) => utils.container.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
    const handle = (field: string) => header(field).querySelector('.ogx-column-resize-handle') as HTMLElement;
    const widthOf = (field: string) => header(field).getBoundingClientRect().width;
    return { ...utils, header, handle, widthOf };
}

/** The width the text needs in the grid's cell font, for a lower bound on the autosized width. */
function textWidth(container: HTMLElement, text: string): number {
    const cell = container.querySelector('[role="gridcell"] .ogx__cell-content') as HTMLElement;
    const probe = document.createElement('span');
    probe.style.whiteSpace = 'nowrap';
    probe.style.font = getComputedStyle(cell).font;
    probe.textContent = text;
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
}

/** True when no cell of the column clips its content. */
function fits(container: HTMLElement, field: string): boolean {
    return Array.from(container.querySelectorAll<HTMLElement>(`[role="gridcell"][data-field="${field}"] .ogx__cell-content`))
        .every(c => c.scrollWidth <= c.clientWidth + 1);
}

afterEach(() => { cleanup(); });

const settle = () => new Promise(r => setTimeout(r, 50));

describe('column autosize (double-click the resize handle)', () => {
    it('grows a column narrower than its content until nothing is clipped', async () => {
        const { container, handle, widthOf } = renderGrid({ columns: [{ field: 'name', width: 80 }, { field: 'age', width: 80 }] });
        expect(fits(container, 'name')).toBe(false);
        await userEvent.dblClick(handle('name'));
        await settle();
        expect(widthOf('name')).toBeGreaterThan(textWidth(container, LONG));
        expect(fits(container, 'name')).toBe(true);
    });

    it('shrinks a column wider than its content', async () => {
        const { handle, widthOf } = renderGrid({ columns: [{ field: 'short', headerName: 'S', width: 400 }, { field: 'age', width: 80 }] });
        await userEvent.dblClick(handle('short'));
        await settle();
        expect(widthOf('short')).toBeLessThan(120);
        expect(widthOf('short')).toBeGreaterThanOrEqual(50);
    });

    it('fits the header text too', async () => {
        const headerName = 'A very long header name for a tiny column';
        const { container, handle, widthOf } = renderGrid({ columns: [{ field: 'short', headerName, width: 60 }, { field: 'age', width: 80 }] });
        await userEvent.dblClick(handle('short'));
        await settle();
        const title = container.querySelector('[role="columnheader"][data-field="short"] .ogx__header-cell-title') as HTMLElement;
        expect(widthOf('short')).toBeGreaterThan(textWidth(container, headerName) * 0.9);
        expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
    });

    it('clamps to maxWidth', async () => {
        const { handle, widthOf } = renderGrid({ columns: [{ field: 'name', width: 80, maxWidth: 150 }, { field: 'age', width: 80 }] });
        await userEvent.dblClick(handle('name'));
        await settle();
        expect(widthOf('name')).toBeCloseTo(150, 0);
    });

    it('turns a flex column into a fixed width', async () => {
        const { handle, widthOf } = renderGrid({ columns: [{ field: 'short', headerName: 'S', flex: 1 }, { field: 'age', width: 80 }] });
        expect(widthOf('short')).toBeGreaterThan(500);
        await userEvent.dblClick(handle('short'));
        await settle();
        expect(widthOf('short')).toBeLessThan(120);
    });

    it('works on a right-pinned column', async () => {
        await page.viewport(1200, 800);
        const { container, handle, widthOf } = renderGrid({
            columns: [{ field: 'age', width: 100 }, { field: 'short', width: 100 }, { field: 'name', width: 90 }],
            pinnedColumns: { right: ['name'] },
        });
        await userEvent.dblClick(handle('name'));
        await settle();
        expect(widthOf('name')).toBeGreaterThan(textWidth(container, LONG));
        expect(fits(container, 'name')).toBe(true);
    });

    it('works under column groups', async () => {
        const { container, handle, widthOf } = renderGrid({
            columns: [{ field: 'name', width: 80 }, { field: 'age', width: 80 }],
            columnGroupingModel: [{ groupId: 'g', headerName: 'Group', children: ['name', 'age'] }],
        });
        await userEvent.dblClick(handle('name'));
        await settle();
        expect(widthOf('name')).toBeGreaterThan(textWidth(container, LONG));
    });

    it('does not sort the column', async () => {
        const onSortModelChange = vi.fn();
        const { container, handle } = renderGrid({ columns: [{ field: 'name', width: 80 }, { field: 'age', width: 80 }], onSortModelChange });
        await userEvent.dblClick(handle('name'));
        await settle();
        expect(onSortModelChange).not.toHaveBeenCalled();
        expect(container.querySelector('[role="columnheader"][data-field="name"]')?.getAttribute('aria-sort') ?? 'none').toBe('none');
    });

    it('Enter on the focused handle autosizes', async () => {
        const { container, handle, widthOf } = renderGrid({ columns: [{ field: 'name', width: 80 }, { field: 'age', width: 80 }] });
        handle('name').focus();
        await userEvent.keyboard('{Enter}');
        await settle();
        expect(widthOf('name')).toBeGreaterThan(textWidth(container, LONG));
    });

    it('apiRef.autosizeColumn / autosizeColumns size columns and ignore resizable: false', async () => {
        let api: GridApiRef | null = null;
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { api = apiRef; }, [apiRef]);
            return (
                <div style={{ width: 1000, height: 400 }}>
                    <DataGrid apiRef={apiRef} rows={ROWS} columns={[
                        { field: 'name', width: 80 },
                        { field: 'short', headerName: 'S', width: 300, resizable: false },
                        { field: 'age', headerName: 'A', width: 300 },
                    ]} />
                </div>
            );
        }
        const { container } = render(<Harness />);
        const widthOf = (field: string) => (container.querySelector(`[role="columnheader"][data-field="${field}"]`) as HTMLElement).getBoundingClientRect().width;
        await settle();
        api!.current.autosizeColumn('name');
        await settle();
        expect(widthOf('name')).toBeGreaterThan(textWidth(container, LONG));
        api!.current.autosizeColumns();
        await settle();
        expect(widthOf('short')).toBeCloseTo(300, 0);
        expect(widthOf('age')).toBeLessThan(120);
    });
});
