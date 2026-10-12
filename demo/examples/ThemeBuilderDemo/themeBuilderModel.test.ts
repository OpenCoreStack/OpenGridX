import { describe, it, expect } from 'vitest';
import { darkTheme } from '@opencorestack/opengridx';
import {
    contrastRatio,
    decodeShare,
    defaultValue,
    diffFromDefaults,
    effectiveValue,
    encodeShare,
    parseColor,
    presetForMode,
    themeCode,
    toHex6,
    writePaths,
} from './themeBuilderModel';

describe('themeBuilderModel', () => {
    it('resolves defaults per mode, and derived defaults from the theme', () => {
        expect(effectiveValue({}, 'grid.headerText')).toBe('#334155');
        expect(effectiveValue({ mode: 'dark' }, 'grid.headerText')).toBe('#e2e8f0');
        expect(effectiveValue({ grid: { cellPaddingX: '4px' } }, 'grid.headerPaddingX')).toBe('4px');
        expect(effectiveValue({ colors: { primary: '#ff0000' } }, 'grid.cellFocusBorder')).toBe('#ff0000');
        expect(defaultValue({ grid: { borderColor: '#111111', rowDividerColor: '#222222' } }, 'grid.rowDividerColor')).toBe('#111111');
    });

    it('writes and removes paths, dropping empty sections', () => {
        const t = writePaths({}, [['grid', 'borderColor'], ['borders', 'color']], '#000000');
        expect(t).toEqual({ grid: { borderColor: '#000000' }, borders: { color: '#000000' } });
        expect(writePaths(t, [['grid', 'borderColor'], ['borders', 'color']], undefined)).toEqual({});
    });

    it('keeps only values that differ from the defaults in the generated code', () => {
        const theme = { grid: { headerText: '#334155', headerFontWeight: '700' }, toolbar: {} };
        expect(diffFromDefaults(theme)).toEqual({ grid: { headerFontWeight: '700' } });
        const code = themeCode({ light: theme, dark: { mode: 'dark', grid: { rowText: '#ffffff' } } }, 'both');
        expect(code).toContain("export const myTheme: GridTheme = {\n  grid: {\n    headerFontWeight: '700',\n  },\n};");
        expect(code).toContain("export const myDarkTheme: GridTheme = {\n  mode: 'dark',\n  grid: {\n    rowText: '#ffffff',\n  },\n};");
        expect(themeCode({ light: {}, dark: { mode: 'dark' } }, 'light')).not.toContain('myDarkTheme');
    });

    it('round-trips the share hash and drops anything that is not a string', () => {
        const hash = encodeShare({ light: { grid: { headerFontWeight: '800' } }, dark: { mode: 'dark', grid: { rowText: '#fff' } }, mode: 'dark' });
        expect(decodeShare(`#${hash}`)).toEqual({
            light: { grid: { headerFontWeight: '800' } },
            dark: { mode: 'dark', grid: { rowText: '#fff' } },
            mode: 'dark',
        });
        expect(decodeShare('#theme=%%%')).toBeNull();
        expect(decodeShare('#other')).toBeNull();
        const evil = btoa(JSON.stringify({ l: { grid: { x: 1, y: ['a'], z: 'ok' } }, d: [], m: 'x' })).replace(/=+$/, '');
        expect(decodeShare(`#theme=${evil}`)).toEqual({ light: { grid: { z: 'ok' } }, dark: { mode: 'dark' }, mode: 'light' });
    });

    it('parses colours and computes WCAG contrast', () => {
        expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
        expect(parseColor('rgba(0, 0, 0, 0.5)')?.a).toBe(0.5);
        expect(parseColor('color-mix(in srgb, #3b82f6 12%, transparent)')?.a).toBeCloseTo(0.12);
        expect(parseColor('hsl(0 0% 0%)')).toBeNull();
        expect(toHex6('rgb(255, 0, 0)')).toBe('#ff0000');
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
        expect(contrastRatio('#777777', '#ffffff')).toBeLessThan(4.5);
        // A transparent background shows the grid background underneath.
        expect(contrastRatio('#ffffff', 'transparent', '#000000')).toBeCloseTo(21, 1);
    });

    it('loads a preset into the requested slot with that slot’s mode', () => {
        expect(presetForMode(darkTheme, 'light').mode).toBeUndefined();
        expect(presetForMode({}, 'dark')).toEqual({ mode: 'dark' });
    });
});
