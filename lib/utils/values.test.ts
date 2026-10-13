import { describe, it, expect } from 'vitest';
import { toNumber } from './values';

describe('toNumber — text that only Number() reads as a number', () => {
    it('rejects radix prefixes and infinities in text', () => {
        for (const text of ['0x10', '0X1f', '-0b1', '0o7', 'Infinity', '-Infinity', '1e999']) {
            expect(toNumber(text)).toBeNull();
        }
    });
    it('still reads plain numbers', () => {
        expect(toNumber(' 0.5 ')).toBe(0.5);
        expect(toNumber('-12')).toBe(-12);
        expect(toNumber('1e3')).toBe(1000);
        expect(toNumber('007')).toBe(7);
    });
});

describe('formatLocalDate (memoized per day)', () => {
    it('matches Intl.DateTimeFormat for every date, including different times on one day', async () => {
        const { formatLocalDate } = await import('./values');
        const intl = new Intl.DateTimeFormat();
        const dates = [new Date(2024, 0, 5, 1, 0), new Date(2024, 0, 5, 23, 59), new Date(1999, 11, 31), new Date(2024, 1, 29)];
        for (const d of dates) expect(formatLocalDate(d)).toBe(intl.format(d));
        // An invalid date throws like Intl does (callers pass only dates from toDate, never invalid ones).
        expect(() => formatLocalDate(new Date(NaN))).toThrow(RangeError);
    });
});
