import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '../../styles/opengridx.css';
import { DataGrid, GridToolbar, GridTooltip, DataGridThemeProvider, darkTheme } from '../../index';

afterEach(() => { cleanup(); window.scrollTo(0, 0); });

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('GridTooltip in a real browser', () => {
    it('uses the DataGridThemeProvider overlay colours, like the toolbar panels', async () => {
        const cols = [{ field: 'name', width: 150 }, { field: 'amount', type: 'number' as const, width: 150 }];
        const rows = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `r${i}`, amount: i }));
        const { getByLabelText } = render(
            <DataGridThemeProvider theme={darkTheme} style={{ height: 400 }}>
                <DataGrid rows={rows} columns={cols} height={400} slots={{ toolbar: GridToolbar as never }} />
            </DataGridThemeProvider>
        );
        const btn = getByLabelText('Configure summaries');
        fireEvent.mouseEnter(btn.parentElement as HTMLElement);
        const tip = await vi.waitFor(() => {
            const el = document.querySelector<HTMLElement>('.ogx-tooltip');
            if (!el) throw new Error('tooltip not shown yet');
            return el;
        }, { timeout: 3000 });
        fireEvent.click(btn);
        await wait(50);
        const panel = document.querySelector<HTMLElement>('.ogx-toolbar__panel')!;
        expect(getComputedStyle(tip).backgroundColor).toBe(getComputedStyle(panel).backgroundColor);
        expect(getComputedStyle(tip).color).not.toBe('rgb(51, 65, 85)');
    });

    it.each(['top', 'bottom', 'left', 'right'] as const)('places a %s tooltip next to its child, also after the page scrolls', async (placement) => {
        const spacer = document.createElement('div');
        spacer.style.height = '2000px';
        document.body.appendChild(spacer);
        try {
            const { getByText } = render(
                <div style={{ position: 'absolute', top: 600, left: 300 }}>
                    <GridTooltip title="tip" placement={placement}><button type="button">anchor</button></GridTooltip>
                </div>
            );
            window.scrollTo(0, 400);
            const btn = getByText('anchor');
            fireEvent.mouseEnter(btn);
            const tip = (await vi.waitFor(() => {
                const el = document.querySelector<HTMLElement>('.ogx-tooltip');
                if (!el) throw new Error('tooltip not shown yet');
                return el;
            }, { timeout: 3000 })).getBoundingClientRect();
            const anchor = btn.getBoundingClientRect();
            if (placement === 'top') expect(tip.bottom).toBeLessThanOrEqual(anchor.top);
            if (placement === 'bottom') expect(tip.top).toBeGreaterThanOrEqual(anchor.bottom);
            if (placement === 'left') expect(tip.right).toBeLessThanOrEqual(anchor.left);
            if (placement === 'right') expect(tip.left).toBeGreaterThanOrEqual(anchor.right);
            // Beside the child, not at the page origin.
            const tipCenter = placement === 'left' || placement === 'right'
                ? (tip.top + tip.bottom) / 2 - (anchor.top + anchor.bottom) / 2
                : (tip.left + tip.right) / 2 - (anchor.left + anchor.right) / 2;
            expect(Math.abs(tipCenter)).toBeLessThan(2);
            expect(Math.max(tip.top - anchor.bottom, anchor.top - tip.bottom, tip.left - anchor.right, anchor.left - tip.right)).toBeLessThan(12);
        } finally {
            spacer.remove();
        }
    });
});
