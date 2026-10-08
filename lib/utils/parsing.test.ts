import { describe, it, expect } from 'vitest';
import {
    parseBooleanText,
    parseCellText,
    parseDateText,
    parseNumberText,
    parseSingleSelectText,
    parseTsv,
    parseValueByType,
} from './parsing';
import { escapeTsvField } from '../hooks/features/useGridClipboard';
import type { GridColDef } from '../types';

const value = (r: { ok: boolean; value?: unknown }) => (r.ok ? (r as { value: unknown }).value : 'INVALID');

describe('parseTsv', () => {
    it('splits tabs and line breaks (LF, CRLF and CR)', () => {
        expect(parseTsv('a\tb\nc\td')).toEqual([['a', 'b'], ['c', 'd']]);
        expect(parseTsv('a\tb\r\nc\td\r\n')).toEqual([['a', 'b'], ['c', 'd']]);
        expect(parseTsv('a\rb')).toEqual([['a'], ['b']]);
    });

    it('ignores one trailing empty line only', () => {
        expect(parseTsv('a\n')).toEqual([['a']]);
        expect(parseTsv('a\n\n')).toEqual([['a'], ['']]);
        expect(parseTsv('')).toEqual([]);
    });

    it('keeps empty fields', () => {
        expect(parseTsv('\tb\t')).toEqual([['', 'b', '']]);
        expect(parseTsv('a\t\n\tb')).toEqual([['a', ''], ['', 'b']]);
    });

    it('reads quoted fields with tabs, line breaks and doubled quotes', () => {
        expect(parseTsv('"a\tb"\tc')).toEqual([['a\tb', 'c']]);
        expect(parseTsv('"line1\nline2"\tx\ny\tz')).toEqual([['line1\nline2', 'x'], ['y', 'z']]);
        expect(parseTsv('"say ""hi"""')).toEqual([['say "hi"']]);
        expect(parseTsv('""\tb')).toEqual([['', 'b']]);
    });

    it('keeps a quote inside an unquoted field, and an unclosed quote as text', () => {
        expect(parseTsv('5" screen\tok')).toEqual([['5" screen', 'ok']]);
        expect(parseTsv('"open\tb')).toEqual([['"open', 'b']]);
    });

    it('is the reverse of escapeTsvField', () => {
        const fields = ['plain', 'tab\there', 'line\nbreak', 'quote"d', '', '"lead'];
        const text = fields.map(escapeTsvField).join('\t');
        expect(parseTsv(text)).toEqual([fields]);
    });

    it('stays linear on a long unclosed quote', () => {
        const text = '"' + 'x'.repeat(50_000);
        const start = performance.now();
        expect(parseTsv(text)[0][0]).toHaveLength(50_001);
        expect(performance.now() - start).toBeLessThan(1000);
    });
});

describe('parseNumberText', () => {
    it.each([
        ['1234.5', 1234.5],
        ['1,234.5', 1234.5],
        ['1,234,567', 1234567],
        ['-12', -12],
        ['+7', 7],
        ['12%', 0.12],
        ['-5%', -0.05],
        ['$1,234.50', 1234.5],
        ['€ 99', 99],
        ['1 234', 1234],
        ['(42)', -42],
        ['.5', 0.5],
        ['1e3', 1000],
        ['  8  ', 8],
    ])('reads %j as %j', (text, expected) => {
        expect(value(parseNumberText(text))).toBeCloseTo(expected);
    });

    it('reads empty text as null', () => {
        expect(value(parseNumberText(''))).toBeNull();
        expect(value(parseNumberText('   '))).toBeNull();
    });

    it.each(['abc', '1,5', '12,34', '1.2.3', '0x10', 'Infinity', '--1', '1,2345', '$'])('rejects %j', (text) => {
        expect(parseNumberText(text).ok).toBe(false);
    });
});

describe('parseDateText', () => {
    it('reads an ISO date as that local day', () => {
        const d = value(parseDateText('2026-10-07')) as Date;
        expect(d).toBeInstanceOf(Date);
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 7]);
    });

    it('accepts what Date.parse accepts', () => {
        expect(value(parseDateText('October 7, 2026'))).toBeInstanceOf(Date);
    });

    it('keeps the kind of the current value', () => {
        expect(value(parseDateText('2026-10-07', '2020-01-01'))).toBe('2026-10-07');
        expect(value(parseDateText('2026-10-07', '2020-01-01T10:30:00'))).toBe('2026-10-07T10:30:00');
        expect(value(parseDateText('2026-10-07', 0))).toBe(new Date(2026, 9, 7).getTime());
    });

    it('reads empty as null and rejects garbage and roll-overs', () => {
        expect(value(parseDateText(''))).toBeNull();
        expect(parseDateText('not a date').ok).toBe(false);
        expect(parseDateText('2026-02-31').ok).toBe(false);
    });
});

describe('parseBooleanText', () => {
    it.each([['true', true], ['FALSE', false], ['Yes', true], ['no', false], ['1', true], ['0', false]])('reads %j', (text, expected) => {
        expect(value(parseBooleanText(text))).toBe(expected);
    });

    it('accepts extra labels, reads empty as null and rejects other text', () => {
        expect(value(parseBooleanText('Oui', { trueLabel: 'oui', falseLabel: 'non' }))).toBe(true);
        expect(value(parseBooleanText('NON', { trueLabel: 'oui', falseLabel: 'non' }))).toBe(false);
        expect(value(parseBooleanText(''))).toBeNull();
        expect(parseBooleanText('maybe').ok).toBe(false);
    });
});

describe('parseSingleSelectText', () => {
    const options = ['Open', 'Closed', { value: 3, label: 'Three' }];
    it('matches a value or a label, case-insensitive, and returns the option value', () => {
        expect(value(parseSingleSelectText('open', options))).toBe('Open');
        expect(value(parseSingleSelectText('three', options))).toBe(3);
        expect(value(parseSingleSelectText('3', options))).toBe(3);
    });
    it('reads empty as null and rejects an unknown option', () => {
        expect(value(parseSingleSelectText('', options))).toBeNull();
        expect(parseSingleSelectText('Pending', options).ok).toBe(false);
        expect(parseSingleSelectText('x', undefined).ok).toBe(false);
    });
});

describe('parseValueByType / parseCellText', () => {
    it('keeps text as is for string and image columns (empty is "")', () => {
        expect(value(parseValueByType(' a ', { type: 'string' }))).toBe(' a ');
        expect(value(parseValueByType('', undefined))).toBe('');
        expect(value(parseValueByType('https://x/y.png', { type: 'image' }))).toBe('https://x/y.png');
    });

    it('dispatches on the column type', () => {
        expect(value(parseValueByType('1,000', { type: 'number' }))).toBe(1000);
        expect(value(parseValueByType('yes', { type: 'boolean' }))).toBe(true);
        expect(value(parseValueByType('b', { type: 'singleSelect', valueOptions: ['a', 'b'] }))).toBe('b');
    });

    type Row = { id: number; price: number };
    const row: Row = { id: 1, price: 1 };

    it('uses valueParser when the column has one, with the row, field and column', () => {
        const col: GridColDef<Row> = {
            field: 'price',
            type: 'number',
            valueParser: (text, params) => {
                expect(params.row).toBe(row);
                expect(params.field).toBe('price');
                return Number(text.split('.').join('').replace(',', '.'));
            },
        };
        expect(value(parseCellText('1.234,5', col, row))).toBe(1234.5);
    });

    it('rejects text when valueParser throws or returns undefined', () => {
        expect(parseCellText('x', { field: 'price', valueParser: () => { throw new Error('bad'); } }, row).ok).toBe(false);
        expect(parseCellText('x', { field: 'price', valueParser: () => undefined }, row).ok).toBe(false);
    });
});
