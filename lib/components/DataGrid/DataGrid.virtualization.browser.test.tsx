import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';

// Runs in real Chromium (vitest browser project). jsdom has no layout engine, so the
// container-height behaviour these tests pin down cannot be reproduced there.

type Row = { id: number; region: string; amount: number };

const makeRows = (total: number, northCount: number): Row[] =>
    Array.from({ length: total }, (_, i) => ({ id: i + 1, region: i < northCount ? 'North' : 'South', amount: i }));

const columns: GridColDef<Row>[] = [
    { field: 'region', width: 200 },
    { field: 'amount', width: 150 },
];

// Bounded: a flex child with min-height: 0 cannot grow past the 600px parent.
const Bounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

// Unbounded: the classic trap — a flex child without min-height: 0 grows to fit its content.
const Unbounded = ({ children }: { children: ReactNode }) => (
    <div style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>{children}</div>
    </div>
);

const domRowCount = (container: HTMLElement) => container.querySelectorAll('.ogx__rows [role="row"]').length;
const firstRow = (container: HTMLElement) => container.querySelector<HTMLElement>('.ogx__rows [role="row"]')!;

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('DataGrid virtualization in a real browser', () => {
    it('virtualizes a large flat dataset in a bounded container', async () => {
        const { container } = render(<Bounded><DataGrid rows={makeRows(30000, 30000)} columns={columns} height="100%" /></Bounded>);
        await expect.poll(() => domRowCount(container)).toBeGreaterThan(0);
        expect(domRowCount(container)).toBeLessThan(60);
    });

    it('keeps DOM rows bounded after expanding a 25,000-row group', async () => {
        const { container } = render(
            <Bounded><DataGrid rows={makeRows(30000, 25000)} columns={columns} height="100%" rowGroupingModel={['region']} /></Bounded>
        );
        await expect.poll(() => domRowCount(container)).toBe(2);

        firstRow(container).click();

        await expect.poll(() => domRowCount(container)).toBeGreaterThan(2);
        expect(domRowCount(container)).toBeLessThan(60);

        const viewport = container.querySelector<HTMLElement>('.ogx__viewport')!;
        viewport.scrollTop = viewport.scrollHeight / 2;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => container.querySelector('.ogx__rows [role="row"]')?.getAttribute('data-rowindex')).not.toBe('0');
        expect(domRowCount(container)).toBeLessThan(80);
    });

    it('warns in development when an unbounded container defeats virtualization', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(
            <Unbounded><DataGrid rows={makeRows(3000, 2500)} columns={columns} height="100%" rowGroupingModel={['region']} /></Unbounded>
        );
        await expect.poll(() => domRowCount(container)).toBe(2);
        firstRow(container).click();

        await expect.poll(() => warn.mock.calls.some(([msg]) => String(msg).includes('virtualization is effectively off'))).toBe(true);
    });

    it('warns in development that pagination is ignored under row grouping', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render(<Bounded><DataGrid rows={makeRows(100, 50)} columns={columns} height="100%" pagination rowGroupingModel={['region']} /></Bounded>);
        await expect.poll(() => warn.mock.calls.some(([msg]) => String(msg).includes('`pagination` is ignored'))).toBe(true);
    });
});
