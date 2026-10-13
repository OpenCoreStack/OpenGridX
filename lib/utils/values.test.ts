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
