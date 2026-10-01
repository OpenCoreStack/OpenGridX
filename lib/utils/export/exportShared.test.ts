import { describe, it, expect } from 'vitest';
import { neutralizeFormula, sanitizeSheetName } from './exportShared';
import { parseThemePixels } from '../../hooks/core/useGridThemeDimensions';

const fast = (fn: () => void) => {
    const start = performance.now();
    fn();
    return performance.now() - start;
};

describe('neutralizeFormula', () => {
    it('leaves plain signed numbers alone and prefixes formulas', () => {
        expect(neutralizeFormula('-12.50')).toBe('-12.50');
        expect(neutralizeFormula('+1 234,5%')).toBe('+1 234,5%');
        expect(neutralizeFormula('=SUM(A1)')).toBe("'=SUM(A1)");
        expect(neutralizeFormula('- ')).toBe("'- ");
    });

    it('stays linear on long digit-and-space runs that do not match', () => {
        const text = `-${'1 '.repeat(50_000)}x`;
        expect(fast(() => neutralizeFormula(text))).toBeLessThan(200);
        expect(neutralizeFormula(text)).toBe(`'${text}`);
    });
});

describe('sanitizeSheetName', () => {
    it('drops leading and trailing apostrophes', () => {
        expect(sanitizeSheetName("''Sales'")).toBe('Sales');
        expect(sanitizeSheetName("'''")).toBe('Sheet');
        expect(sanitizeSheetName("O'Brien")).toBe("O'Brien");
    });

    it('stays linear on long apostrophe runs', () => {
        const name = `${"'".repeat(50_000)}x`;
        expect(fast(() => sanitizeSheetName(name))).toBeLessThan(200);
    });
});

describe('parseThemePixels', () => {
    it('parses pixel values with optional unit and spaces', () => {
        expect(parseThemePixels('36px')).toBe(36);
        expect(parseThemePixels(' 36 px ')).toBe(36);
        expect(parseThemePixels('40.5')).toBe(40.5);
        expect(parseThemePixels('2rem')).toBeUndefined();
        expect(parseThemePixels('0')).toBeUndefined();
    });

    it('stays linear on long whitespace runs', () => {
        const value = `1${' '.repeat(50_000)}x`;
        expect(fast(() => parseThemePixels(value))).toBeLessThan(200);
    });
});
