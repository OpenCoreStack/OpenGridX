import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid, DataGridThemeProvider } from '../../index';
import type { GridColDef } from '../../types';

// Real browsers: whether the grid root fills its container is pure layout, invisible in jsdom.

type Row = { id: number; name: string; amount: number };

const rows: Row[] = Array.from({ length: 20000 }, (_, i) => ({ id: i + 1, name: `n${i + 1}`, amount: i }));
const columns: GridColDef<Row>[] = [{ field: 'name', width: 200 }, { field: 'amount', width: 150 }];

const domRowCount = (c: HTMLElement) => c.querySelectorAll('.ogx__rows [role="row"]').length;
const UNBOUNDED = 'virtualization is effectively off';
const unboundedMessage = (warn: { mock: { calls: unknown[][] } }) =>
    warn.mock.calls.map(([msg]) => String(msg)).find(msg => msg.includes(UNBOUNDED));

/**
 * The layout of a typical app shell: a fixed-height column, a flex body, a flex main column and a
 * grid wrapper. `wrapperMinHeight` false reproduces a flex child without `min-height: 0`.
 */
const Shell = ({ children, wrapperMinHeight = true }: { children: ReactNode; wrapperMinHeight?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 700 }}>
        <div style={{ height: 48, flexShrink: 0 }}>header</div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <div style={{ width: 180, flexShrink: 0 }}>side</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
                <div style={{ padding: 8, flexShrink: 0 }}>title</div>
                <div className="wrapper" style={wrapperMinHeight ? { flex: 1, minHeight: 0 } : { flex: 1 }}>{children}</div>
            </div>
        </div>
    </div>
);

const rootHeight = (c: HTMLElement) => Math.round(c.querySelector<HTMLElement>('.ogx')!.getBoundingClientRect().height);

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('DataGrid without a height prop fills its container', () => {
    it('virtualizes inside a bounded flex shell with a theme provider', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(
            <Shell>
                <DataGridThemeProvider theme={{ colors: { primary: '#0f766e' } }} style={{ height: '100%' }}>
                    <DataGrid rows={rows} columns={columns} />
                </DataGridThemeProvider>
            </Shell>
        );
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(domRowCount(container)).toBeLessThan(60);
        const wrapper = container.querySelector<HTMLElement>('.wrapper')!.getBoundingClientRect();
        expect(Math.abs(rootHeight(container) - wrapper.height)).toBeLessThanOrEqual(1);
        expect(unboundedMessage(warn)).toBeUndefined();
    });

    it('virtualizes inside a bounded flex shell without a theme provider', async () => {
        const { container } = render(<Shell><DataGrid rows={rows} columns={columns} /></Shell>);
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(domRowCount(container)).toBeLessThan(60);
        const wrapper = container.querySelector<HTMLElement>('.wrapper')!.getBoundingClientRect();
        expect(Math.abs(rootHeight(container) - wrapper.height)).toBeLessThanOrEqual(1);
    });

    it('fills a flex column parent directly, next to a sibling', async () => {
        const { container } = render(
            <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 40, flexShrink: 0 }}>bar</div>
                <DataGrid rows={rows} columns={columns} />
            </div>
        );
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(domRowCount(container)).toBeLessThan(60);
        expect(rootHeight(container)).toBe(460);
    });

    it('keeps an explicit height instead of growing in a flex column', async () => {
        const { container } = render(
            <div style={{ height: 800, display: 'flex', flexDirection: 'column' }}>
                <DataGrid rows={rows} columns={columns} height={300} />
            </div>
        );
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(rootHeight(container)).toBe(300);
    });

    it('still warns, naming min-height: 0, when the wrapper is a flex child without it', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(<Shell wrapperMinHeight={false}><DataGrid rows={rows.slice(0, 500)} columns={columns} /></Shell>);
        await expect.poll(() => unboundedMessage(warn)).toBeDefined();
        expect(unboundedMessage(warn)).toContain('min-height: 0');
    });

    it('does not warn with autoHeight', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(<div><DataGrid rows={rows.slice(0, 300)} columns={columns} autoHeight /></div>);
        await expect.poll(() => domRowCount(container)).toBe(300);
        expect(unboundedMessage(warn)).toBeUndefined();
    });
});
