import { describe, it, expect } from 'vitest';
import { coerceBoolean, coerceDate, coerceNumber, coerceSingleSelect, coerceString, coerceValue } from './coerce';

const invalid = { ok: false, reason: 'invalidValue' };

describe('coerceNumber', () => {
  it.each([
    ['1234.5', 1234.5],
    ['1,234.5', 1234.5],
    ['1,234,567', 1234567],
    ['-12', -12],
    ['+7', 7],
    ['.5', 0.5],
    ['12%', 0.12],
    ['-2.5%', -0.025],
    ['$1,200', 1200],
    ['€ 99.90', 99.9],
    ['1 200', 1200],
    ['£-3', -3],
    ['1e3', 1000],
    ['  42  ', 42],
    [42, 42],
    [-0.5, -0.5],
  ])('%j → %j', (text, value) => {
    expect(coerceNumber(text)).toEqual({ ok: true, value });
  });

  it.each(['', '   ', null, undefined])('empty %j → null', (text) => {
    expect(coerceNumber(text)).toEqual({ ok: true, value: null });
  });

  it.each(['abc', '12abc', '1.2,3', '--1', '1e', '%', '$', 'Infinity', '0x10', '1e400', NaN, Infinity, true, {}, [], '١٢'])('%j is invalid', (text) => {
    expect(coerceNumber(text)).toEqual(invalid);
  });

  it('runs in linear time on long input', () => {
    const start = performance.now();
    expect(coerceNumber(`${'1,'.repeat(50_000)}x`)).toEqual(invalid);
    expect(coerceNumber('9'.repeat(50_000)).ok).toBe(false);
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('coerceDate', () => {
  it('reads ISO dates as a local calendar day', () => {
    const r = coerceDate('2026-10-07');
    expect(r.ok && r.value instanceof Date && [r.value.getFullYear(), r.value.getMonth(), r.value.getDate()]).toEqual([2026, 9, 7]);
  });

  it('accepts what Date.parse accepts, Date objects and epoch milliseconds', () => {
    expect(coerceDate('2026-10-07T10:30:00Z')).toEqual({ ok: true, value: new Date(Date.UTC(2026, 9, 7, 10, 30)) });
    expect(coerceDate('October 7, 2026').ok).toBe(true);
    const d = new Date(2026, 0, 1);
    expect(coerceDate(d)).toEqual({ ok: true, value: d });
    expect(coerceDate(0)).toEqual({ ok: true, value: new Date(0) });
  });

  it('gives null for empty input', () => {
    expect(coerceDate('')).toEqual({ ok: true, value: null });
    expect(coerceDate(null)).toEqual({ ok: true, value: null });
  });

  it.each(['2026-02-31', 'not a date', true, {}, new Date(NaN)])('%j is invalid', (text) => {
    expect(coerceDate(text)).toEqual(invalid);
  });
});

describe('coerceBoolean', () => {
  it.each([
    ['true', true], ['TRUE', true], ['yes', true], ['Yes', true], ['1', true], [1, true], [true, true],
    ['false', false], ['No', false], ['0', false], [0, false], [false, false], [' no ', false],
  ])('%j → %j', (text, value) => {
    expect(coerceBoolean(text)).toEqual({ ok: true, value });
  });

  it('gives null for empty input', () => {
    expect(coerceBoolean('')).toEqual({ ok: true, value: null });
  });

  it.each(['y', 'on', '2', 2, {}, []])('%j is invalid', (text) => {
    expect(coerceBoolean(text)).toEqual(invalid);
  });
});

describe('coerceSingleSelect', () => {
  const col = { type: 'singleSelect', valueOptions: ['Open', 'Paid', { value: 'od', label: 'Overdue' }, { value: 3, label: 'Three' }] };

  it('matches an option value or label, case-insensitively, and returns the value', () => {
    expect(coerceSingleSelect('Open', col)).toEqual({ ok: true, value: 'Open' });
    expect(coerceSingleSelect('paid', col)).toEqual({ ok: true, value: 'Paid' });
    expect(coerceSingleSelect('OD', col)).toEqual({ ok: true, value: 'od' });
    expect(coerceSingleSelect('overdue', col)).toEqual({ ok: true, value: 'od' });
    expect(coerceSingleSelect(3, col)).toEqual({ ok: true, value: 3 });
    expect(coerceSingleSelect('3', col)).toEqual({ ok: true, value: 3 });
    expect(coerceSingleSelect('three', col)).toEqual({ ok: true, value: 3 });
  });

  it('rejects other text, and gives null for empty input', () => {
    expect(coerceSingleSelect('Closed', col)).toEqual(invalid);
    expect(coerceSingleSelect({}, col)).toEqual(invalid);
    expect(coerceSingleSelect('', col)).toEqual({ ok: true, value: null });
  });

  it('accepts any text without valueOptions', () => {
    expect(coerceSingleSelect('Anything', { type: 'singleSelect' })).toEqual({ ok: true, value: 'Anything' });
  });
});

describe('coerceString and coerceValue', () => {
  it('takes text as is and gives empty text for empty input', () => {
    expect(coerceString('  a  ')).toEqual({ ok: true, value: '  a  ' });
    expect(coerceString(5)).toEqual({ ok: true, value: '5' });
    expect(coerceString(null)).toEqual({ ok: true, value: '' });
    expect(coerceString({})).toEqual(invalid);
  });

  it('dispatches on the column type; string and image columns take text', () => {
    expect(coerceValue('1,200', { type: 'number' })).toEqual({ ok: true, value: 1200 });
    expect(coerceValue('yes', { type: 'boolean' })).toEqual({ ok: true, value: true });
    expect(coerceValue('paid', { type: 'singleSelect', valueOptions: ['Paid'] })).toEqual({ ok: true, value: 'Paid' });
    expect(coerceValue('2026-10-07', { type: 'date' }).ok).toBe(true);
    expect(coerceValue('https://x/y.png', { type: 'image' })).toEqual({ ok: true, value: 'https://x/y.png' });
    expect(coerceValue('', {})).toEqual({ ok: true, value: '' });
    expect(coerceValue('', { type: 'number' })).toEqual({ ok: true, value: null });
  });
});
