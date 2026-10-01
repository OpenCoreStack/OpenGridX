import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from '../DataGrid/DataGrid';
import type { DataGridProps, GridColDef, GridRowModel } from '../../types';
import { HEADER_WRAP_LINE_HEIGHT } from '../../utils/headerWrap';

const TITLE = 'Weighted average cost of capital';
const LONG_TITLE = 'Unrealised gain or loss on foreign exchange forward contracts at period end';
const ROWS: GridRowModel[] = [
    { id: 1, wacc: 0.071, fx: 1200, plain: 'x' },
    { id: 2, wacc: 0.064, fx: -300, plain: 'y' },
];

function renderGrid(props: Partial<DataGridProps> & { columns: GridColDef[] }) {
    const utils = render(
        <div style={{ width: 900, height: 300 }}>
            <DataGrid rows={ROWS} {...props} />
        </div>
    );
    const header = (field: string) => utils.container.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
    const title = (field: string) => header(field).querySelector('.ogx__header-cell-title') as HTMLElement;
    // The header row, border included, is exactly headerHeight when nothing makes it grow.
    const headerRowHeight = () => (utils.container.querySelector('.ogx__header') as HTMLElement).getBoundingClientRect().height;
    return { ...utils, header, title, headerRowHeight };
}

/** Lines a title takes, from its rendered height and the wrapped line height. */
const lines = (el: HTMLElement) => Math.round(el.getBoundingClientRect().height / HEADER_WRAP_LINE_HEIGHT);

/** True when `inner` lies within `outer` (1px tolerance for sub-pixel layout). */
function inside(inner: HTMLElement, outer: HTMLElement): boolean {
    const a = inner.getBoundingClientRect();
    const b = outer.getBoundingClientRect();
    return a.width > 0 && a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
}

/** The width `text` takes on one line in the header title's font. */
function oneLineWidth(reference: HTMLElement, text: string): number {
    const probe = document.createElement('span');
    probe.style.whiteSpace = 'nowrap';
    probe.style.font = getComputedStyle(reference).font;
    probe.style.letterSpacing = getComputedStyle(reference).letterSpacing;
    probe.textContent = text;
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
}

const settle = () => new Promise(r => setTimeout(r, 50));

afterEach(() => { cleanup(); });

describe('wrapHeaderText', () => {
    it('wraps a long title onto 2 lines in a narrow column at headerHeight 56, header height unchanged', async () => {
        const { header, title, headerRowHeight } = renderGrid({
            wrapHeaderText: true,
            headerHeight: 56,
            columns: [
                { field: 'wacc', headerName: TITLE, width: 150 },
                { field: 'plain', headerName: TITLE, width: 150, wrapHeaderText: false },
            ],
        });
        await settle();
        expect(header('wacc').classList.contains('ogx__header-cell--wrap')).toBe(true);
        expect(lines(title('wacc'))).toBe(2);
        expect(headerRowHeight()).toBeCloseTo(56, 0);
        // The opted-out column keeps one line with an ellipsis.
        expect(header('plain').classList.contains('ogx__header-cell--wrap')).toBe(false);
        expect(title('plain').scrollWidth).toBeGreaterThan(title('plain').clientWidth);
        expect(title('plain').getBoundingClientRect().height).toBeLessThan(HEADER_WRAP_LINE_HEIGHT * 1.5);
        expect(header('wacc').getAttribute('title')).toBe(TITLE);
    });

    it('clamps a title longer than the header to the lines that fit, without growing the header', async () => {
        const { title, headerRowHeight } = renderGrid({
            wrapHeaderText: true,
            headerHeight: 72,
            columns: [{ field: 'fx', headerName: LONG_TITLE, width: 140 }, { field: 'plain', width: 100 }],
        });
        await settle();
        expect(lines(title('fx'))).toBe(3);
        expect(title('fx').scrollHeight).toBeGreaterThan(title('fx').clientHeight);
        expect(headerRowHeight()).toBeCloseTo(72, 0);
    });

    it('keeps the sort icon, menu button and resize handle inside the cell and clickable', async () => {
        const { container, header } = renderGrid({
            wrapHeaderText: true,
            columns: [{ field: 'fx', headerName: LONG_TITLE, width: 140 }, { field: 'plain', width: 100 }],
            sortModel: [{ field: 'fx', sort: 'asc' }],
        });
        await settle();
        const cell = header('fx');
        const sortIcon = cell.querySelector('.ogx__sort-icon') as HTMLElement;
        const menuButton = cell.querySelector('.ogx__menu-icon-btn') as HTMLElement;
        const handle = cell.querySelector('.ogx-column-resize-handle') as HTMLElement;
        expect(inside(sortIcon, cell)).toBe(true);
        expect(inside(menuButton, cell)).toBe(true);
        expect(inside(handle, cell)).toBe(true);

        const centre = (el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        };
        expect(menuButton.contains(centre(menuButton))).toBe(true);
        expect(handle.contains(centre(handle))).toBe(true);

        await userEvent.click(menuButton);
        await settle();
        expect(container.ownerDocument.querySelector('.ogx-column-menu')).not.toBeNull();
    });

    it('auto-size measures the one-line width of a wrapped title', async () => {
        const { header, title } = renderGrid({
            wrapHeaderText: true,
            columns: [{ field: 'wacc', headerName: TITLE, width: 120 }, { field: 'plain', width: 100 }],
        });
        await settle();
        expect(lines(title('wacc'))).toBe(2);
        const handle = header('wacc').querySelector('.ogx-column-resize-handle') as HTMLElement;
        await userEvent.dblClick(handle);
        await settle();
        expect(header('wacc').getBoundingClientRect().width).toBeGreaterThan(oneLineWidth(title('wacc'), TITLE));
        expect(lines(title('wacc'))).toBe(1);
    });
});
