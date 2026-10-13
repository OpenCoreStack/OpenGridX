import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import '../styles/opengridx.css';
import { DataGrid, DataGridThemeProvider } from '../index';
import type { GridTheme } from './types';

// Each theme key added for the Theme Builder (v3.7) reaches the elements it is meant to style.

afterEach(() => { cleanup(); });

const rows = [
    { id: 1, name: 'Alpha', amount: 1 },
    { id: 2, name: 'Beta', amount: 2 },
];
const columns = [{ field: 'name', width: 150 }, { field: 'amount', width: 150 }];

function renderGrid(theme: GridTheme, extra: Record<string, unknown> = {}) {
    const { container } = render(
        <div style={{ width: 500 }}>
            <DataGridThemeProvider theme={theme}>
                <DataGrid rows={rows} columns={columns} height={300} {...extra} />
            </DataGridThemeProvider>
        </div>
    );
    const q = <T extends Element = HTMLElement>(sel: string) => container.ownerDocument.querySelector<T>(sel)!;
    return { container, q };
}

const css = (el: Element, prop: string, pseudo?: string) => getComputedStyle(el, pseudo).getPropertyValue(prop);

describe('theme-builder keys', () => {
    it('applies header and body cell fonts', () => {
        const { q } = renderGrid({
            grid: { headerFontFamily: 'Georgia', headerFontWeight: '800', cellFontFamily: 'monospace', cellFontWeight: '300' },
        });
        const header = q('.ogx__header-cell');
        const cell = q('.ogx__row .ogx__cell');
        expect(css(header, 'font-family')).toContain('Georgia');
        expect(css(header, 'font-weight')).toBe('800');
        expect(css(cell, 'font-family')).toContain('monospace');
        expect(css(cell, 'font-weight')).toBe('300');
    });

    it('applies the overlay font to the column menu', async () => {
        const { q } = renderGrid({ overlays: { fontFamily: 'Georgia', fontWeight: '700', fontSize: '17px' } });
        await userEvent.click(q('.ogx__menu-icon-btn'));
        await expect.poll(() => document.querySelector('.ogx-column-menu .ogx-menu-item')).not.toBeNull();
        const item = q('.ogx-column-menu .ogx-menu-item:not(.ogx-menu-item--active)');
        expect(css(item, 'font-family')).toContain('Georgia');
        expect(css(item, 'font-weight')).toBe('700');
        expect(css(item, 'font-size')).toBe('17px');
    });

    it('hides dividers when their widths are 0', () => {
        const { q } = renderGrid({ grid: { columnDividerWidth: '0', headerColumnDividerWidth: '0', rowDividerWidth: '0' } });
        const cell = q('.ogx__row .ogx__cell');
        expect(css(cell, 'border-right-width')).toBe('0px');
        expect(css(q('.ogx__row'), 'border-bottom-width')).toBe('0px');
        expect(css(q('.ogx__header'), 'border-bottom-width')).toBe('0px');
        expect(css(q('.ogx__header-cell'), 'width', '::after')).toBe('0px');
    });

    it('applies divider widths and colours', () => {
        const { q } = renderGrid({ grid: { columnDividerWidth: '3px', columnDividerColor: 'rgb(255, 0, 0)', rowDividerWidth: '2px', rowDividerColor: 'rgb(0, 128, 0)' } });
        const cell = q('.ogx__row .ogx__cell');
        expect(css(cell, 'border-right-width')).toBe('3px');
        expect(css(cell, 'border-right-color')).toBe('rgb(255, 0, 0)');
        expect(css(q('.ogx__row'), 'border-bottom-width')).toBe('2px');
        expect(css(q('.ogx__row'), 'border-bottom-color')).toBe('rgb(0, 128, 0)');
    });

    it('applies the outer border width and the corner radius', () => {
        const { q } = renderGrid({ grid: { borderWidth: '3px', borderRadius: '2px' } });
        const root = q('.ogx');
        expect(css(root, 'border-top-width')).toBe('3px');
        expect(css(root, 'border-top-left-radius')).toBe('2px');
        // Inner corners never go negative.
        expect(css(root.firstElementChild!, 'border-top-left-radius')).toBe('0px');
    });

    it('pads header cells with headerPaddingX, and with cellPaddingX when it is unset', () => {
        expect(css(renderGrid({ grid: { headerPaddingX: '24px', cellPaddingX: '4px' } }).q('.ogx__header-cell'), 'padding-left')).toBe('24px');
        cleanup();
        expect(css(renderGrid({ grid: { cellPaddingX: '4px' } }).q('.ogx__header-cell'), 'padding-left')).toBe('4px');
    });

    it('applies the checkbox and expand chevron keys (v3.9)', () => {
        const grid = { checkboxCheckedBackground: 'rgb(1, 2, 3)', checkboxCheckmark: 'rgb(4, 5, 6)', expandIconColor: 'rgb(7, 8, 9)' };
        const { q } = renderGrid({ grid }, { checkboxSelection: true, rowSelectionModel: [1] });
        const checked = q('.ogx-checkbox__input:checked + .ogx-checkbox__box');
        expect(css(checked, 'background-color')).toBe('rgb(1, 2, 3)');
        expect(css(checked, 'color')).toBe('rgb(4, 5, 6)');
        cleanup();
        const grouped = renderGrid({ grid }, { rowGroupingModel: ['name'] });
        expect(css(grouped.q('.ogx-expand-icon'), 'color')).toBe('rgb(7, 8, 9)');
    });

    it('applies the menu icon, section label, selected icon, selection dot and divider keys (v3.9)', async () => {
        const { q } = renderGrid({
            overlays: {
                iconColor: 'rgb(10, 11, 12)', sectionLabelText: 'rgb(13, 14, 15)', itemSelectedIcon: 'rgb(16, 17, 18)',
                itemIndicatorColor: 'rgb(19, 20, 21)', dividerColor: 'rgb(22, 23, 24)',
            },
        });
        await userEvent.click(q('.ogx__menu-icon-btn'));
        await expect.poll(() => document.querySelector('.ogx-column-menu .ogx-menu-item')).not.toBeNull();
        expect(css(q('.ogx-column-menu .ogx-menu-item:not(.ogx-menu-item--active) .ogx-menu-item__icon'), 'color')).toBe('rgb(10, 11, 12)');
        expect(css(q('.ogx-column-menu .ogx-menu-section-label'), 'color')).toBe('rgb(13, 14, 15)');
        expect(css(q('.ogx-column-menu .ogx-menu-item--active .ogx-menu-item__icon'), 'color')).toBe('rgb(16, 17, 18)');
        expect(css(q('.ogx-column-menu .ogx-menu-item__indicator'), 'color')).toBe('rgb(19, 20, 21)');
        expect(css(q('.ogx-column-menu .ogx-menu-divider'), 'background-color')).toBe('rgb(22, 23, 24)');
    });
});
