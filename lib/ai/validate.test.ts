import { describe, it, expect, afterEach } from 'vitest';
import type { GridColDef } from '../types';
import { validateGridAiState } from './validate';
import type { GridAiState } from './types';

const columns: GridColDef[] = [
  { field: 'region', headerName: 'Region' },
  { field: 'amount', headerName: 'Amount', type: 'number' },
  { field: 'date', headerName: 'Date', type: 'date', sortable: false },
  { field: 'paid', headerName: 'Paid', type: 'boolean', hideable: false },
  { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Open', { value: 'pd', label: 'Paid' }], groupable: false },
  { field: 'qty', type: 'number', filterable: false, availableAggregationFunctions: ['sum'] },
  { field: 'note', aggregable: false },
  { field: 'constructor' },
];

const FIELDS = new Set(columns.map((c) => c.field));

describe('validateGridAiState', () => {
  it('passes a valid reply through, with canonical spellings', () => {
    const { state, errors } = validateGridAiState({
      schemaVersion: 1,
      filterModel: {
        logicOperator: 'AND',
        items: [
          { field: 'amount', operator: '>', value: 1000 },
          { logicOperator: 'or', items: [{ field: 'region', operator: 'equals', value: 'North' }, { field: 'region', operator: 'isEmpty' }] },
        ],
        quickFilterValues: ['acme', 7, '  '],
      },
      sortModel: [{ field: 'amount', sort: 'DESC' }],
      rowGroupingModel: ['region'],
      aggregationModel: { amount: 'sum', region: 'count', qty: 'none' },
      pivotModel: { rowFields: ['region'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'avg' }] },
      columnVisibilityModel: { note: false, region: 'yes' },
    }, columns);
    expect(errors).toEqual([]);
    expect(state).toEqual<GridAiState>({
      filterModel: {
        items: [
          { field: 'amount', operator: '>', value: 1000 },
          { logicOperator: 'or', items: [{ field: 'region', operator: 'equals', value: 'North' }, { field: 'region', operator: 'isEmpty' }] },
        ],
        logicOperator: 'and',
        quickFilterValues: ['acme', '7'],
      },
      sortModel: [{ field: 'amount', sort: 'desc' }],
      rowGroupingModel: ['region'],
      aggregationModel: { amount: 'sum', region: 'count' },
      pivotModel: { rowFields: ['region'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'avg' }] },
      columnVisibilityModel: { note: false, region: true },
    });
  });

  it('parses a JSON string, and gives one error and an empty state for bad JSON', () => {
    expect(validateGridAiState('{"sortModel":[{"field":"amount","sort":"asc"}]}', columns).state).toEqual({ sortModel: [{ field: 'amount', sort: 'asc' }] });
    expect(validateGridAiState('{"sortModel": [', columns)).toEqual({ state: {}, errors: [{ path: '', message: 'Not valid JSON' }] });
    expect(validateGridAiState('[1]', columns).errors).toEqual([{ path: '', message: 'Expected an object, got a list' }]);
  });

  it('drops unknown parts and parts outside include / exclude', () => {
    const { state, errors } = validateGridAiState({ rowModel: {}, sortModel: [], rowGroupingModel: ['region'] }, columns, { exclude: ['grouping'] });
    expect(state).toEqual({ sortModel: [] });
    expect(errors.map((e) => e.path)).toEqual(['rowModel', 'rowGroupingModel']);
    expect(validateGridAiState({ schemaVersion: 2 }, columns).errors).toEqual([{ path: 'schemaVersion', message: 'Unsupported schemaVersion 2' }]);
  });

  it('drops unknown fields and fields a column does not allow', () => {
    const { state, errors } = validateGridAiState({
      filterModel: { items: [{ field: 'revenue', operator: '>', value: 1 }, { field: 'qty', operator: '>', value: 1 }] },
      sortModel: [{ field: 'date', sort: 'asc' }, { field: 'toString', sort: 'asc' }],
      rowGroupingModel: ['status', 'region', 'region'],
      aggregationModel: { note: 'count', qty: 'avg', ghost: 'sum' },
      columnVisibilityModel: { paid: false },
    }, columns);
    expect(state).toEqual({ filterModel: { items: [] }, sortModel: [], rowGroupingModel: ['region'], aggregationModel: {}, columnVisibilityModel: {} });
    expect(errors.map((e) => e.path)).toEqual([
      'filterModel.items[0].field',
      'filterModel.items[1].field',
      'sortModel[0].field',
      'sortModel[1].field',
      'rowGroupingModel[0]',
      'aggregationModel.note',
      'aggregationModel.qty',
      'aggregationModel.ghost',
      'columnVisibilityModel.paid',
    ]);
    expect(errors[0].message).toBe('Unknown field "revenue"');
  });

  it('drops operators that do not fit the column type', () => {
    const { state, errors } = validateGridAiState({ filterModel: { items: [{ field: 'amount', operator: 'contains', value: '5' }, { field: 'date', operator: 'ONORAFTER', value: '2026-10-07' }] } }, columns);
    expect(state.filterModel?.items).toEqual([{ field: 'date', operator: 'onOrAfter', value: '2026-10-07' }]);
    expect(errors).toEqual([{ path: 'filterModel.items[0].operator', message: '"contains" is not one of =, !=, >, >=, <, <=, isEmpty, isNotEmpty' }]);
  });

  it('coerces values to the column type', () => {
    const { state, errors } = validateGridAiState({
      filterModel: {
        items: [
          { field: 'amount', operator: '>=', value: '1,200' },
          { field: 'amount', operator: '<', value: '$5k' },
          { field: 'date', operator: 'is', value: '2026-10-07T08:00:00' },
          { field: 'paid', operator: 'is', value: 'yes' },
          { field: 'status', operator: 'isAnyOf', value: ['paid', 'OPEN', 'Closed', 'Paid'] },
          { field: 'status', operator: 'is', value: 'paid' },
          { field: 'region', operator: 'contains', value: 42 },
          { field: 'region', operator: 'equals', value: ['a'] },
          { field: 'region', operator: 'equals' },
        ],
      },
    }, columns);
    expect(state.filterModel?.items).toEqual([
      { field: 'amount', operator: '>=', value: 1200 },
      { field: 'date', operator: 'is', value: '2026-10-07' },
      { field: 'paid', operator: 'is', value: true },
      { field: 'status', operator: 'isAnyOf', value: ['pd', 'Open'] },
      { field: 'status', operator: 'is', value: 'pd' },
      { field: 'region', operator: 'contains', value: '42' },
    ]);
    expect(errors.map((e) => e.path)).toEqual([
      'filterModel.items[1].value',
      'filterModel.items[4].value[2]',
      'filterModel.items[7].value',
      'filterModel.items[8].value',
    ]);
  });

  it('removes groups left empty and groups nested deeper than three levels', () => {
    const deep = (n: number): unknown => (n === 0 ? { field: 'region', operator: 'equals', value: 'x' } : { logicOperator: 'and', items: [deep(n - 1)] });
    const { state, errors } = validateGridAiState({
      filterModel: { items: [{ logicOperator: 'or', items: [{ field: 'nope', operator: 'equals', value: 1 }] }, deep(3), deep(4)] },
    }, columns);
    expect(state.filterModel?.items).toEqual([deep(3)]);
    expect(errors.map((e) => e.message)).toEqual(['Unknown field "nope"', 'Empty group removed', 'Groups nest at most 3 levels', 'Empty group removed', 'Empty group removed', 'Empty group removed']);
  });

  it('only reads the first 200 entries of a list', () => {
    const items = Array.from({ length: 1000 }, () => ({ field: 'region', operator: 'contains', value: 'a' }));
    const { state, errors } = validateGridAiState({ filterModel: { items } }, columns);
    expect(state.filterModel?.items).toHaveLength(200);
    expect(errors).toEqual([{ path: 'filterModel.items', message: 'Only the first 200 entries are read' }]);
  });

  it('caps the error list', () => {
    const items = Array.from({ length: 200 }, () => ({ field: 'x' }));
    expect(validateGridAiState({ filterModel: { items } }, columns).errors).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------------------------
// Fuzz: random malformed replies must never throw, never pollute a prototype, and never return a
// field the columns do not allow.

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const KEYS = ['filterModel', 'sortModel', 'rowGroupingModel', 'aggregationModel', 'pivotModel', 'columnVisibilityModel', 'schemaVersion',
  'items', 'logicOperator', 'quickFilterValues', 'field', 'operator', 'value', 'sort', 'rowFields', 'columnFields', 'valueFields', 'aggFn',
  '__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty', 'amount', 'region', 'status', 'paid', 'date', 'qty', 'polluted'];
const STRINGS = ['', 'and', 'OR', 'asc', 'desc', 'sum', 'count', 'none', '>', 'contains', 'isAnyOf', 'is', 'onOrAfter', '1,200', '12%',
  '2026-10-07', 'yes', 'paid', 'NaN', '__proto__', 'constructor', '{"a":1}', 'amount', 'region', 'x'.repeat(100_000)];

function randomValue(next: () => number, depth: number): unknown {
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)];
  const roll = next();
  if (depth > 6 || roll < 0.25) return pick<unknown>([null, undefined, true, false, 0, -1, 1e308, NaN, Infinity, 3.5, ...STRINGS]);
  if (roll < 0.55) return Array.from({ length: Math.floor(next() * 5) }, () => randomValue(next, depth + 1));
  const obj: Record<string, unknown> = {};
  const n = Math.floor(next() * 6);
  for (let i = 0; i < n; i++) {
    const key = pick(KEYS);
    // A literal __proto__ key in JSON.parse output is an own property; defineProperty does the same here.
    Object.defineProperty(obj, key, { value: randomValue(next, depth + 1), enumerable: true, configurable: true, writable: true });
  }
  return obj;
}

function deepNest(depth: number): string {
  return `${'{"filterModel":{"items":['.repeat(1)}${'{"logicOperator":"and","items":['.repeat(depth)}${']}'.repeat(depth)}]}}`;
}

/** Every field name the state mentions, wherever it appears. */
function fieldsOf(state: GridAiState): string[] {
  const out: string[] = [];
  const walk = (items: unknown[] | undefined) => items?.forEach((it) => {
    const node = it as { field?: string; items?: unknown[] };
    if (node.items) walk(node.items);
    else if (node.field !== undefined) out.push(node.field);
  });
  walk(state.filterModel?.items);
  state.sortModel?.forEach((s) => out.push(s.field));
  out.push(...(state.rowGroupingModel ?? []));
  out.push(...Object.keys(state.aggregationModel ?? {}), ...Object.keys(state.columnVisibilityModel ?? {}));
  if (state.pivotModel) out.push(...state.pivotModel.rowFields, ...state.pivotModel.columnFields, ...state.pivotModel.valueFields.map((v) => v.field));
  return out;
}

describe('validateGridAiState fuzz', () => {
  afterEach(() => {
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  const next = rng(20261007);
  const inputs: unknown[] = [];
  for (let i = 0; i < 240; i++) {
    const value = randomValue(next, 0);
    inputs.push(i % 3 === 0 ? JSON.stringify(value) ?? 'undefined' : value);
  }
  inputs.push(
    deepNest(5000),
    deepNest(50),
    '{"__proto__":{"polluted":true},"aggregationModel":{"__proto__":"sum","constructor":"count"}}',
    '{"columnVisibilityModel":{"__proto__":{"polluted":true}}}',
    `{"filterModel":{"quickFilterValues":["${'y'.repeat(1_000_000)}"]}}`,
    'x'.repeat(2_000_000),
    { filterModel: { items: new Array(1_000_000).fill(null) } },
  );

  it(`never throws, pollutes or leaks a field over ${inputs.length} malformed inputs`, () => {
    for (const input of inputs) {
      const result = validateGridAiState(input, columns);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeLessThanOrEqual(100);
      for (const field of fieldsOf(result.state)) expect(FIELDS.has(field)).toBe(true);
      for (const key of Object.keys(result.state)) {
        expect(['filterModel', 'sortModel', 'rowGroupingModel', 'aggregationModel', 'pivotModel', 'columnVisibilityModel']).toContain(key);
      }
      expect(Object.getPrototypeOf(result.state)).toBe(Object.prototype);
      expect(JSON.stringify(result.state)).not.toContain('polluted');
    }
  });

  it('writes a "constructor" field only as an own property of a plain object', () => {
    const { state } = validateGridAiState('{"aggregationModel":{"constructor":"count","__proto__":"sum"}}', columns);
    expect(Object.keys(state.aggregationModel ?? {})).toEqual(['constructor']);
    expect(Object.getPrototypeOf(state.aggregationModel)).toBe(Object.prototype);
  });
});
