import { describe, it, expect } from 'vitest';
import { filterRows } from './index';
import { buildColumnLookup } from '../columnLookup';
import { getCellValue, getFormattedValue, toLocalDateString } from '../values';
import type { GridColDef, GridFilterItem, GridRowModel } from '../../types';

// ── Reference oracle: the v3.5.1 quick filter (an array of texts per row, `some(includes)`) ──
function refPush(out: string[], value: unknown): void {
    if (value == null) return;
    switch (typeof value) {
        case 'string':
            out.push(value.toLowerCase());
            return;
        case 'number':
            if (!Number.isNaN(value)) out.push(String(value));
            return;
        case 'boolean':
        case 'bigint':
            out.push(String(value));
            return;
        default:
            break;
    }
    if (value instanceof Date) {
        const day = toLocalDateString(value);
        if (day) out.push(day);
        return;
    }
    if (Array.isArray(value)) {
        for (const entry of value) if (entry == null || typeof entry !== 'object') refPush(out, entry);
    }
}

function refQuickFilter(rows: GridRowModel[], values: string[], columns: GridColDef[]): GridRowModel[] {
    const lookup = buildColumnLookup(columns);
    const terms = values.map(v => String(v ?? '').trim().toLowerCase()).filter(t => t !== '');
    if (terms.length === 0) return rows;
    return rows.filter(row => {
        const texts: string[] = [];
        for (const col of lookup.quickFilterColumns) {
            const value = getCellValue(row, col.field, col);
            const formatted = getFormattedValue(row, col.field, value, col);
            if (formatted != null && formatted !== '') texts.push(String(formatted).toLowerCase());
            refPush(texts, value);
        }
        return terms.every(term => texts.some(text => text.includes(term)));
    });
}

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const PIECES = ['ab', 'b', 'É', 'é', 'x', '1', '0', ' ', '\u0000', 'a\u0000b', '-', 'Zz'];

function randomText(rand: () => number): string {
    let s = '';
    const n = Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) s += PIECES[Math.floor(rand() * PIECES.length)];
    return s;
}

function makeRows(count: number, seed: number): GridRowModel[] {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, id) => ({
        id,
        a: rand() < 0.1 ? null : randomText(rand),
        b: rand() < 0.1 ? undefined : Math.round(rand() * 100) / 10,
        c: rand() < 0.5,
        d: rand() < 0.1 ? new Date(NaN) : new Date(2024, 0, 1 + Math.floor(rand() * 30)),
        e: rand() < 0.2 ? [randomText(rand), 3, { x: 1 }] : randomText(rand),
    }));
}

const COLUMNS: GridColDef[] = [
    { field: 'a' },
    { field: 'b', type: 'number', valueFormatter: ({ value }) => (typeof value === 'number' ? `$${value.toFixed(1)}` : '') },
    { field: 'c', type: 'boolean' },
    { field: 'd', type: 'date' },
    { field: 'e', valueGetter: ({ row }) => row.e },
];

const TERMS = [['a'], ['b'], ['ab'], ['é'], ['\u0000'], ['a\u0000b'], ['b\u0000'], ['1', 'a'], ['$1'], ['true'], ['2024-01'], [' x '], ['zz', 'É'], ['nothing'], ['', ' ']];

describe('quick filter matches the reference', () => {
    for (let seed = 1; seed <= 5; seed++) {
        it(`seed ${seed}: every term set, typed twice (cached texts)`, () => {
            const rows = makeRows(800, seed);
            const lookup = buildColumnLookup(COLUMNS);
            for (const terms of TERMS) {
                const expected = refQuickFilter(rows, terms, COLUMNS).map(r => r.id);
                for (let pass = 0; pass < 2; pass++) {
                    expect(filterRows(rows, { items: [], quickFilterValues: terms }, lookup).map(r => r.id)).toEqual(expected);
                }
            }
        });
    }
});

describe('plain columns read cells exactly as columns with a valueGetter', () => {
    const plain: GridColDef[] = COLUMNS.map(({ field, type }) => ({ field, type }));
    const withGetter: GridColDef[] = plain.map(col => ({ ...col, valueGetter: ({ value }) => value }));
    const ITEMS: GridFilterItem[] = [
        { field: 'a', operator: 'contains', value: 'b' },
        { field: 'a', operator: 'isEmpty' },
        { field: 'b', operator: '>', value: 5 },
        { field: 'b', operator: '<=', value: '3' },
        { field: 'c', operator: 'is', value: 'true' },
        { field: 'd', operator: 'after', value: '2024-01-15' },
        { field: 'e', operator: 'startsWith', value: 'a' },
    ];
    it('filter items and the quick filter', () => {
        const rows = makeRows(1000, 11);
        for (const item of ITEMS) {
            const model = { items: [item] };
            expect(filterRows(rows, model, buildColumnLookup(plain)).map(r => r.id))
                .toEqual(filterRows(rows, model, buildColumnLookup(withGetter)).map(r => r.id));
        }
        for (const terms of TERMS) {
            const model = { items: [], quickFilterValues: terms };
            expect(filterRows(rows, model, buildColumnLookup(plain)).map(r => r.id))
                .toEqual(filterRows(rows, model, buildColumnLookup(withGetter)).map(r => r.id));
        }
    });
});

describe('quick filter after the rows change', () => {
    it('a new rows array with replaced, inserted and removed rows searches the current rows', () => {
        const rows = makeRows(600, 21);
        const lookup = buildColumnLookup(COLUMNS);
        const model = { items: [], quickFilterValues: ['ab'] };
        filterRows(rows, model, lookup);
        const edited = [...rows];
        edited[3] = { ...edited[3], a: 'zzab' };
        edited[10] = { ...edited[10], a: 'none' };
        edited.splice(20, 0, { id: 9999, a: 'xab', b: 1, c: true, d: new Date(2024, 0, 2), e: '' });
        edited.splice(500, 5);
        for (const current of [edited, rows, edited]) {
            expect(filterRows(current, model, lookup).map(r => r.id)).toEqual(refQuickFilter(current, ['ab'], COLUMNS).map(r => r.id));
        }
    });

    it('quick filter combined with items', () => {
        const rows = makeRows(600, 22);
        const lookup = buildColumnLookup(COLUMNS);
        const items: GridFilterItem[] = [{ field: 'c', operator: 'is', value: 'true' }];
        const expected = refQuickFilter(rows, ['a'], COLUMNS).filter(r => r.c === true).map(r => r.id);
        expect(filterRows(rows, { items, quickFilterValues: ['a'] }, lookup).map(r => r.id)).toEqual(expected);
    });
});
