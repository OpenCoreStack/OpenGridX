import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from '../components/DataGrid/DataGrid';
import { DataGridThemeProvider } from './DataGridThemeProvider';
import { compactTheme, darkTheme, roseTheme } from './presets';
import type { GridTheme } from './types';

afterEach(() => { cleanup(); });

const rows = [{ id: 1, a: 'x' }];
const cols = [{ field: 'a' }];

const providerVars = (theme: GridTheme) => {
    const { container } = render(<DataGridThemeProvider theme={theme}><div /></DataGridThemeProvider>);
    const el = container.querySelector<HTMLElement>('.ogx-theme-provider')!;
    return (name: string) => el.style.getPropertyValue(name);
};

describe('DataGridThemeProvider palette', () => {
    it('pins the complete light neutral scale for a light theme', () => {
        const v = providerVars(roseTheme);
        expect(v('--ogx-color-gray-50')).toBe('#f8fafc');
        expect(v('--ogx-color-gray-800')).toBe('#1e293b');
        expect(v('--ogx-color-white')).toBe('#ffffff');
    });

    it('gives darkTheme a complete dark palette, neutral scale included', () => {
        const v = providerVars(darkTheme);
        expect(v('--ogx-grid-background')).toBe('#0f172a');
        expect(v('--ogx-color-white')).toBe('#0f172a');
        expect(v('--ogx-color-gray-50')).toBe('#1e293b');
        expect(v('--ogx-overlay-background')).toBe('#1e293b');
    });

    it('lets a theme override single neutral steps', () => {
        const v = providerVars({ colors: { gray: { 50: '#fafafa' }, white: '#fefefe' } });
        expect(v('--ogx-color-gray-50')).toBe('#fafafa');
        expect(v('--ogx-color-gray-100')).toBe('#f1f5f9');
        expect(v('--ogx-color-white')).toBe('#fefefe');
    });

    it('derives toolbar, menu, selection and focus accents from the primary colour', () => {
        const v = providerVars({ colors: { primary: '#e11d48' } });
        expect(v('--ogx-color-primary')).toBe('#e11d48');
        for (const token of [
            '--ogx-toolbar-btn-primary-bg',
            '--ogx-toolbar-input-focus-border',
            '--ogx-grid-cell-focus-border',
        ]) {
            expect(v(token)).toBe('var(--ogx-color-primary)');
        }
        for (const token of ['--ogx-toolbar-chip-active-bg', '--ogx-overlay-item-selected-bg', '--ogx-toolbar-input-focus-shadow']) {
            expect(v(token)).toContain('var(--ogx-color-primary)');
        }
        expect(v('--ogx-grid-row-selected-background')).toBe('var(--ogx-color-primary-light)');
    });

    it('still lets a theme set a derived token directly', () => {
        const v = providerVars({ colors: { primary: '#e11d48' }, toolbar: { buttonPrimaryBackground: '#000000' } });
        expect(v('--ogx-toolbar-btn-primary-bg')).toBe('#000000');
    });

    it('maps grid.cellFontSize and grid.headerFontSize', () => {
        const v = providerVars({ grid: { cellFontSize: '11px', headerFontSize: '12px' } });
        expect(v('--ogx-grid-cell-font-size')).toBe('11px');
        expect(v('--ogx-grid-header-font-size')).toBe('12px');
    });
});

describe('DataGridThemeProvider row and header heights', () => {
    const renderGrid = (theme: GridTheme, props: { rowHeight?: number; headerHeight?: number; density?: 'compact' | 'standard' | 'comfortable' } = {}) => {
        const { container } = render(
            <DataGridThemeProvider theme={theme}>
                <DataGrid rows={rows} columns={cols} {...props} />
            </DataGridThemeProvider>
        );
        const root = container.querySelector<HTMLElement>('.ogx')!;
        const row = container.querySelector<HTMLElement>('.ogx__row')!;
        return {
            rowVar: root.style.getPropertyValue('--ogx-row-height'),
            headerVar: root.style.getPropertyValue('--ogx-header-height'),
            rowMinHeight: row.style.minHeight,
        };
    };

    it('lays rows and the header out at the compactTheme heights', () => {
        expect(renderGrid(compactTheme)).toEqual({ rowVar: '36px', headerVar: '40px', rowMinHeight: '36px' });
    });

    it('uses the theme compact height with density="compact"', () => {
        expect(renderGrid(compactTheme, { density: 'compact' }).rowVar).toBe('28px');
    });

    it('lets the rowHeight and headerHeight props win over the theme', () => {
        expect(renderGrid(compactTheme, { rowHeight: 44, headerHeight: 50 })).toMatchObject({ rowVar: '44px', headerVar: '50px' });
    });

    it('ignores heights that are not pixel values', () => {
        expect(renderGrid({ grid: { rowHeightStandard: '3rem' } }).rowVar).toBe('52px');
    });
});
