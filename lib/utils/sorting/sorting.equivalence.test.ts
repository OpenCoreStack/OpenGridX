import { describe, it, expect } from 'vitest';
import { sortRows, sortItemsBySortModel, callSortComparator, applySortDirection, type GridSortValue } from './index';
import { buildColumnLookup } from '../columnLookup';
import { getCellValue, toDate, toNumber } from '../values';
import type { GridColDef, GridRowModel, GridSortItem } from '../../types';

// ── Reference oracle: the v3.5.1 sort (one SortKey object per value, collator in every comparison) ──
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'accent' });
type RefKey = { rank: number; num: number; str: string } | null;

function refKey(value: unknown, type?: GridColDef['type']): RefKey {
    if (value == null) return null;
    if (type === 'number') {
        const n = toNumber(value);
        return n === null ? null : { rank: 0, num: n, str: '' };
    }
    if (type === 'date') {
        const date = toDate(value);
        return date ? { rank: 1, num: date.getTime(), str: '' } : null;
    }
    switch (typeof value) {
        case 'number':
            return Number.isNaN(value) ? null : { rank: 0, num: value, str: '' };
        case 'bigint':
            return { rank: 0, num: Number(value), str: '' };
        case 'boolean':
            return { rank: 2, num: value ? 1 : 0, str: '' };
        case 'string':
            return { rank: 3, num: 0, str: value };
        default:
            break;
    }
    if (value instanceof Date) {
        const t = value.getTime();
        return Number.isNaN(t) ? null : { rank: 1, num: t, str: '' };
    }
    return { rank: 4, num: 0, str: String(value) };
}

function refCompare(a: RefKey, b: RefKey): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.rank >= 3) return collator.compare(a.str, b.str);
    return a.num < b.num ? -1 : a.num > b.num ? 1 : 0;
}

function refSortItems<T>(items: readonly T[], sortModel: readonly GridSortItem[], readValue: (item: T, s: GridSortItem) => GridSortValue): T[] {
    if (sortModel.length === 0 || items.length < 2) return [...items];
    const values = sortModel.map(s => items.map(item => readValue(item, s)));
    const keys = values.map(column => column.map(({ value, type }) => refKey(value, type)));
    const order = items.map((_, i) => i);
    order.sort((ia, ib) => {
        for (let k = 0; k < sortModel.length; k++) {
            const a = values[k][ia];
            const b = values[k][ib];
            const asc = a.comparator && a.comparator === b.comparator && a.params && b.params
                ? callSortComparator(a.comparator, a.params, b.params)
                : refCompare(keys[k][ia], keys[k][ib]);
            const c = applySortDirection(asc, sortModel[k].sort);
            if (c !== 0) return c;
        }
        return ia - ib;
    });
    return order.map(i => items[i]);
}

function refSortRows(rows: GridRowModel[], sortModel: GridSortItem[], columns: ReturnType<typeof buildColumnLookup>): GridRowModel[] {
    if (sortModel.length === 0) return rows;
    return refSortItems(rows, sortModel, (row, s) => {
        const colDef = columns.byField.get(s.field);
        const value = getCellValue(row, s.field, colDef);
        return { value, type: colDef?.type, comparator: colDef?.sortComparator, params: colDef?.sortComparator ? { id: row.id, field: s.field, row, value } : undefined };
    });
}

// ── Random data ──────────────────────────────────────────────────────────────────────────────
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

const ALPHABET = ['a', 'b', 'Z', 'z', 'é', 'e', 'E', 'É', 'ß', 'ø', 'ñ', 'n', '0', '1', '9', '10', ' ', '-', '_', 'ǅ', 'İ', 'ı', '́', '中', '😀', '.'];

function makeValue(rand: () => number, kind: string): unknown {
    const r = rand();
    if (r < 0.06) return null;
    if (r < 0.09) return undefined;
    if (r < 0.1) return '';
    switch (kind) {
        case 'number':
            return rand() < 0.1 ? NaN : rand() < 0.05 ? -0 : rand() < 0.05 ? Infinity : Math.round((rand() - 0.5) * 2000) / 10;
        case 'numericString':
            return rand() < 0.2 ? 'abc' : ` ${Math.round(rand() * 100)} `;
        case 'date':
            return rand() < 0.1 ? new Date(NaN) : rand() < 0.3 ? `2024-0${1 + Math.floor(rand() * 9)}-1${Math.floor(rand() * 9)}` : new Date(Date.UTC(2024, 0, 1 + Math.floor(rand() * 40)));
        case 'boolean':
            return rand() < 0.5;
        case 'string': {
            const len = Math.floor(rand() * 5);
            let s = '';
            for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];
            return s;
        }
        default: {
            // A mix of every kind, including objects.
            const kinds = ['number', 'date', 'boolean', 'string', 'string'];
            if (rand() < 0.08) return rand() < 0.5 ? { toString: () => 'obj' } : [1, 'é'];
            if (rand() < 0.03) return BigInt(Math.floor(rand() * 100));
            return makeValue(rand, kinds[Math.floor(rand() * kinds.length)]);
        }
    }
}

const FIELDS = ['num', 'numStr', 'date', 'bool', 'str', 'mixed', 'sel'] as const;
const KIND: Record<string, string> = { num: 'number', numStr: 'numericString', date: 'date', bool: 'boolean', str: 'string', mixed: 'mixed', sel: 'string' };

function makeRows(count: number, seed: number): GridRowModel[] {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, id) => {
        const row: GridRowModel = { id };
        for (const field of FIELDS) row[field] = field === 'sel' ? ['North', 'south', 'Éast', null][Math.floor(rand() * 4)] : makeValue(rand, KIND[field]);
        return row;
    });
}

const byLength = (a: unknown, b: unknown) => String(a ?? '').length - String(b ?? '').length;

const COLUMN_SETS: Record<string, GridColDef[]> = {
    typed: [
        { field: 'num', type: 'number' },
        { field: 'numStr', type: 'number' },
        { field: 'date', type: 'date' },
        { field: 'bool', type: 'boolean' },
        { field: 'str' },
        { field: 'mixed' },
        { field: 'sel', type: 'singleSelect', valueOptions: ['North', 'south', 'Éast'] },
    ],
    untyped: FIELDS.map(field => ({ field })),
    getters: [
        { field: 'num', type: 'number', valueGetter: ({ row }) => (row.num as number) * -1 },
        { field: 'numStr' },
        { field: 'date', type: 'date', sortComparator: (a, b) => byLength(a, b) },
        { field: 'bool', type: 'boolean' },
        { field: 'str', sortComparator: (a, b) => byLength(a, b) },
        { field: 'mixed', valueGetter: ({ row }) => { if (row.id === 7) throw new Error('boom'); return row.mixed; } },
        { field: 'sel', type: 'singleSelect' },
    ],
};

const ids = (rows: readonly GridRowModel[]) => rows.map(r => r.id);

describe('sortRows matches the reference sort', () => {
    for (const [setName, columnDefs] of Object.entries(COLUMN_SETS)) {
        const lookup = buildColumnLookup(columnDefs);
        for (let seed = 1; seed <= 6; seed++) {
            const rows = makeRows(seed === 1 ? 2000 : 400, seed);
            it(`${setName}, seed ${seed}: every single key, both directions`, () => {
                for (const field of FIELDS) {
                    for (const sort of ['asc', 'desc'] as const) {
                        const model = [{ field, sort }];
                        expect(ids(sortRows(rows, model, lookup))).toEqual(ids(refSortRows(rows, model, lookup)));
                    }
                }
            });
            it(`${setName}, seed ${seed}: multi-key models`, () => {
                const rand = mulberry32(seed * 101);
                for (let m = 0; m < 12; m++) {
                    const length = 2 + Math.floor(rand() * 3);
                    const model: GridSortItem[] = Array.from({ length }, () => ({ field: FIELDS[Math.floor(rand() * FIELDS.length)], sort: rand() < 0.5 ? 'asc' : 'desc' }));
                    expect(ids(sortRows(rows, model, lookup))).toEqual(ids(refSortRows(rows, model, lookup)));
                }
            });
        }
    }

    it('without a column lookup', () => {
        const rows = makeRows(500, 42);
        const lookup = buildColumnLookup([]);
        for (const field of FIELDS) {
            for (const sort of ['asc', 'desc'] as const) {
                expect(ids(sortRows(rows, [{ field, sort }]))).toEqual(ids(refSortRows(rows, [{ field, sort }], lookup)));
            }
        }
    });

    it('a sort direction other than asc/desc is treated as desc, as before', () => {
        const rows = makeRows(200, 9);
        const lookup = buildColumnLookup(COLUMN_SETS.typed);
        const model = [{ field: 'num', sort: null }] as unknown as GridSortItem[];
        expect(ids(sortRows(rows, model, lookup))).toEqual(ids(refSortRows(rows, model, lookup)));
    });
});

describe('sortItemsBySortModel matches the reference sort', () => {
    it('items that mix a comparator with plain values', () => {
        const rand = mulberry32(77);
        const comparator = (a: unknown, b: unknown) => byLength(a, b);
        const items = Array.from({ length: 600 }, (_, i) => ({ i, v: makeValue(rand, 'mixed'), withComparator: rand() < 0.5 }));
        const read = (item: (typeof items)[number]): GridSortValue => ({
            value: item.v,
            comparator: item.withComparator ? comparator : undefined,
            params: item.withComparator ? { id: item.i, field: 'v', row: { id: item.i }, value: item.v } : undefined,
        });
        for (const sort of ['asc', 'desc'] as const) {
            const model = [{ field: 'v', sort }, { field: 'w', sort: 'asc' as const }];
            expect(sortItemsBySortModel(items, model, read).map(x => x.i)).toEqual(refSortItems(items, model, read).map(x => x.i));
        }
    });

    it('items with a per-item column type', () => {
        const rand = mulberry32(5);
        const types: Array<GridColDef['type']> = ['number', 'date', undefined, 'boolean'];
        const items = Array.from({ length: 800 }, (_, i) => ({ i, v: makeValue(rand, 'mixed'), t: types[i % 4] }));
        const read = (item: (typeof items)[number]): GridSortValue => ({ value: item.v, type: item.t });
        for (const sort of ['asc', 'desc'] as const) {
            const model = [{ field: 'v', sort }];
            expect(sortItemsBySortModel(items, model, read).map(x => x.i)).toEqual(refSortItems(items, model, read).map(x => x.i));
        }
    });
});

describe('string order', () => {
    it('random strings over accents, case, digits and symbols sort exactly as the collator orders them', () => {
        const rand = mulberry32(2026);
        const rows = Array.from({ length: 5000 }, (_, id) => ({ id, s: makeValue(rand, 'string') }));
        const lookup = buildColumnLookup([{ field: 's' }]);
        for (const sort of ['asc', 'desc'] as const) {
            expect(ids(sortRows(rows, [{ field: 's', sort }], lookup))).toEqual(ids(refSortRows(rows, [{ field: 's', sort }], lookup)));
        }
    });
});
