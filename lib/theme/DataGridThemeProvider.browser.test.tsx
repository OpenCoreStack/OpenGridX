import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { commands } from 'vitest/browser';
import '../styles/opengridx.css';
import { DataGrid, DataGridThemeProvider, GridToolbar, darkTheme, roseTheme, compactTheme } from '../index';
import type { GridTheme } from './types';

afterEach(() => { cleanup(); });

const rows = [
    { id: 1, region: 'North', amount: 1 },
    { id: 2, region: 'South', amount: 2 },
];
const cols = [{ field: 'region', width: 150 }, { field: 'amount', width: 150 }];

const groupedGrid = (theme: GridTheme) => render(
    <div style={{ height: 400, width: 600 }}>
        <DataGridThemeProvider theme={theme} style={{ height: '100%' }}>
            <DataGrid rows={rows} columns={cols} rowGroupingModel={['region']} height="100%" />
        </DataGridThemeProvider>
    </div>
);

const groupRowColors = (container: HTMLElement) => {
    const group = container.querySelector<HTMLElement>('.ogx__row--group')!;
    const cell = group.querySelector<HTMLElement>('.ogx__cell:not(.ogx__cell--checkbox)')!;
    return {
        bg: getComputedStyle(group).backgroundColor,
        text: getComputedStyle(cell.querySelector('*') ?? cell).color,
    };
};

declare module 'vitest/browser' {
    interface BrowserCommands {
        // Defined in vitest.config.ts: Playwright emulateMedia, which every engine supports.
        setColorScheme: (colorScheme: 'light' | 'dark' | null) => Promise<void>;
    }
}

async function withColorScheme(value: 'dark' | 'light', run: () => void | Promise<void>) {
    await commands.setColorScheme(value);
    try {
        // Firefox applies the emulated scheme to the test iframe a moment later, so wait for it.
        await expect.poll(() => window.matchMedia(`(prefers-color-scheme: ${value})`).matches).toBe(true);
        await run();
    } finally {
        await commands.setColorScheme(null);
    }
}

describe('DataGridThemeProvider in the browser', () => {
    it('gives darkTheme dark group rows in a light-scheme browser', async () => {
        await withColorScheme('light', () => {
            const { container } = groupedGrid(darkTheme);
            expect(groupRowColors(container)).toEqual({ bg: 'rgb(30, 41, 59)', text: 'rgb(203, 213, 225)' });
        });
    });

    it('keeps a light preset light in a dark-scheme browser', async () => {
        await withColorScheme('dark', () => {
            const { container } = groupedGrid(roseTheme);
            expect(groupRowColors(container)).toEqual({ bg: 'rgb(248, 250, 252)', text: 'rgb(30, 41, 59)' });
        });
    });

    it('recolours toolbar accents from colors.primary', () => {
        const { container } = render(
            <DataGridThemeProvider theme={{ colors: { primary: '#e11d48', primaryDark: '#be123c' } }}>
                <div className="probe-btn" style={{ background: 'var(--ogx-toolbar-btn-primary-bg)' }} />
                <div className="probe-focus" style={{ color: 'var(--ogx-toolbar-input-focus-border)' }} />
                <div className="probe-chip" style={{ color: 'var(--ogx-toolbar-chip-active-text)' }} />
                <div className="probe-selected" style={{ color: 'var(--ogx-overlay-item-selected-text)' }} />
            </DataGridThemeProvider>
        );
        const probe = (cls: string) => container.querySelector<HTMLElement>(`.${cls}`)!;
        expect(getComputedStyle(probe('probe-btn')).backgroundColor).toBe('rgb(225, 29, 72)');
        expect(getComputedStyle(probe('probe-focus')).color).toBe('rgb(225, 29, 72)');
        expect(getComputedStyle(probe('probe-chip')).color).toBe('rgb(190, 18, 60)');
        expect(getComputedStyle(probe('probe-selected')).color).toBe('rgb(190, 18, 60)');
    });

    it('applies toolbar.background to the toolbar', () => {
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <DataGridThemeProvider theme={{ toolbar: { background: 'rgb(255, 0, 0)' } }} style={{ height: '100%' }}>
                    <DataGrid rows={rows} columns={cols} height="100%" slots={{ toolbar: GridToolbar }} />
                </DataGridThemeProvider>
            </div>
        );
        expect(getComputedStyle(container.querySelector<HTMLElement>('.ogx-toolbar')!).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('renders compactTheme rows, header and text at its sizes', () => {
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <DataGridThemeProvider theme={compactTheme} style={{ height: '100%' }}>
                    <DataGrid rows={rows} columns={cols} height="100%" />
                </DataGridThemeProvider>
            </div>
        );
        const row = container.querySelector<HTMLElement>('.ogx__row')!;
        const header = container.querySelector<HTMLElement>('.ogx__header')!;
        expect(Math.round(row.getBoundingClientRect().height)).toBe(36);
        expect(Math.round(header.getBoundingClientRect().height)).toBe(40);
        expect(getComputedStyle(container.querySelector<HTMLElement>('.ogx__cell')!).fontSize).toBe('12px');
        expect(getComputedStyle(container.querySelector<HTMLElement>('.ogx__header-cell')!).fontSize).toBe('12px');
    });
});
