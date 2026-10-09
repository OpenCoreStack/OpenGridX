import { describe, it, expect, vi } from 'vitest';
import type { GridAiState, GridColDef } from '../types';
import { createGridAgentTools } from './agentTools';
import type { GridAgentApi, GridAgentTool } from './types';

const columns: GridColDef[] = [
  { field: 'region', headerName: 'Region' },
  { field: 'amount', headerName: 'Amount', type: 'number' },
  { field: 'secret', headerName: 'Secret', filterable: false, sortable: false, groupable: false, hideable: false, aggregable: false },
  { field: 'total', headerName: 'Total', type: 'number', valueGetter: ({ row }) => (row.amount as number) * 2 },
];

const ROWS = [
  { id: 1, region: 'North', amount: 10, secret: 'a', when: new Date(Date.UTC(2026, 0, 2)) },
  { id: 2, region: 'South', amount: 20, secret: 'b' },
  { id: 3, region: 'East', amount: 30, secret: 'c' },
];

function makeApi(initial: GridAiState = {}) {
  let state: GridAiState = { filterModel: { items: [] }, sortModel: [], rowGroupingModel: [], aggregationModel: {}, columnVisibilityModel: {}, ...initial };
  const api = {
    getGridAiState: vi.fn(() => state),
    setFilterModel: vi.fn((filterModel) => { state = { ...state, filterModel }; }),
    setSortModel: vi.fn((sortModel) => { state = { ...state, sortModel }; }),
    setRowGroupingModel: vi.fn((rowGroupingModel) => { state = { ...state, rowGroupingModel }; }),
    setAggregationModel: vi.fn((aggregationModel) => { state = { ...state, aggregationModel }; }),
    setColumnVisibilityModel: vi.fn((columnVisibilityModel) => { state = { ...state, columnVisibilityModel }; }),
    getAllFilteredRows: vi.fn(() => ROWS),
  } satisfies GridAgentApi;
  return { api, apiRef: { current: api }, getState: () => state };
}

const byName = (tools: GridAgentTool[], name: string) => {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`no ${name}`);
  return tool;
};

describe('createGridAgentTools', () => {
  it('returns plain tools with JSON schemas, and no row access by default', () => {
    const { apiRef } = makeApi();
    const tools = createGridAgentTools(apiRef, columns);
    expect(tools.map((t) => t.name)).toEqual([
      'get_grid_state', 'set_filter', 'set_sort', 'set_grouping', 'set_aggregation', 'set_column_visibility', 'clear_filters',
    ]);
    for (const tool of tools) {
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.execute).toBe('function');
      // Serialisable as is, for any tool-calling API.
      expect(JSON.parse(JSON.stringify(tool.inputSchema))).toEqual(tool.inputSchema);
    }
    expect(byName(tools, 'set_sort').inputSchema.required).toEqual(['sortModel']);
    expect(JSON.stringify(byName(tools, 'set_sort').inputSchema)).not.toContain('secret');
  });

  it('get_grid_state returns the models and the columns', async () => {
    const { apiRef } = makeApi({ sortModel: [{ field: 'amount', sort: 'asc' }] });
    const result = await byName(createGridAgentTools(apiRef, columns), 'get_grid_state').execute({});
    expect(result.ok).toBe(true);
    expect(result.state?.sortModel).toEqual([{ field: 'amount', sort: 'asc' }]);
    expect(result.columns).toEqual([
      { field: 'region', headerName: 'Region', type: 'string' },
      { field: 'amount', headerName: 'Amount', type: 'number' },
      { field: 'secret', headerName: 'Secret', type: 'string' },
      { field: 'total', headerName: 'Total', type: 'number' },
    ]);
  });

  it('set_* tools validate and apply through the api', async () => {
    const { api, apiRef, getState } = makeApi({ columnVisibilityModel: { region: false } });
    const tools = createGridAgentTools(apiRef, columns);
    expect(await byName(tools, 'set_filter').execute({ filterModel: { items: [{ field: 'amount', operator: '>', value: '15' }] } }))
      .toEqual({ ok: true, applied: { filterModel: { items: [{ field: 'amount', operator: '>', value: 15 }] } } });
    expect(await byName(tools, 'set_sort').execute({ sortModel: [{ field: 'amount', sort: 'DESC' }] }))
      .toEqual({ ok: true, applied: { sortModel: [{ field: 'amount', sort: 'desc' }] } });
    expect((await byName(tools, 'set_grouping').execute({ rowGroupingModel: ['region'] })).ok).toBe(true);
    expect((await byName(tools, 'set_aggregation').execute({ aggregationModel: { amount: 'sum' } })).ok).toBe(true);
    // Visibility merges over the current model.
    expect(await byName(tools, 'set_column_visibility').execute({ columnVisibilityModel: { amount: false } }))
      .toEqual({ ok: true, applied: { columnVisibilityModel: { region: false, amount: false } } });
    expect(getState()).toMatchObject({
      sortModel: [{ field: 'amount', sort: 'desc' }],
      rowGroupingModel: ['region'],
      aggregationModel: { amount: 'sum' },
      columnVisibilityModel: { region: false, amount: false },
    });
    expect(await byName(tools, 'clear_filters').execute(undefined)).toEqual({ ok: true, applied: { filterModel: { items: [] } } });
    expect(api.setFilterModel).toHaveBeenLastCalledWith({ items: [] });
  });

  it('applies nothing when the input has errors, and returns them', async () => {
    const { api, apiRef } = makeApi();
    const tools = createGridAgentTools(apiRef, columns);
    const result = await byName(tools, 'set_sort').execute({ sortModel: [{ field: 'amount', sort: 'asc' }, { field: 'secret', sort: 'asc' }] });
    expect(result).toEqual({ ok: false, errors: [{ path: 'sortModel[1].field', message: 'Field "secret" cannot be sorted' }] });
    expect(api.setSortModel).not.toHaveBeenCalled();
    expect(await byName(tools, 'set_grouping').execute({ grouping: ['region'] }))
      .toEqual({ ok: false, errors: [{ path: 'rowGroupingModel', message: 'Expected an object with "rowGroupingModel"' }] });
  });

  it('get_row_summary exists only with allowRowAccess and limits rows and fields', async () => {
    const { apiRef } = makeApi();
    expect(createGridAgentTools(apiRef, columns, { fields: ['region'] }).some((t) => t.name === 'get_row_summary')).toBe(false);
    const tools = createGridAgentTools(apiRef, columns, { allowRowAccess: true, fields: ['region', 'total', 'nope'], maxRows: 2 });
    const tool = byName(tools, 'get_row_summary');
    expect(await tool.execute({})).toEqual({ ok: true, rowCount: 3, rows: [{ region: 'North', total: 20 }, { region: 'South', total: 40 }] });
    expect(await tool.execute({ limit: 1 })).toEqual({ ok: true, rowCount: 3, rows: [{ region: 'North', total: 20 }] });
    expect((await tool.execute({ limit: 99 })).rows).toHaveLength(2);
    const all = byName(createGridAgentTools(apiRef, columns, { allowRowAccess: true }), 'get_row_summary');
    expect((await all.execute({})).rows?.[0]).toEqual({ region: 'North', amount: 10, secret: 'a', total: 20 });
  });

  it('reports a grid that is not mounted', async () => {
    const tools = createGridAgentTools({ current: null }, columns, { allowRowAccess: true });
    for (const tool of tools) {
      expect(await tool.execute({})).toEqual({ ok: false, errors: [{ path: '', message: 'The grid is not ready' }] });
    }
  });

  it('never throws or rejects, whatever the input or the api does (fuzz)', async () => {
    let seed = 11;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const atoms: unknown[] = [null, undefined, 0, -1, 1e308, NaN, '', 'amount', 'region', '__proto__', 'constructor', true, [], {}, 'asc', '>', Symbol('s'), () => 1];
    const keys = ['filterModel', 'sortModel', 'rowGroupingModel', 'aggregationModel', 'columnVisibilityModel', 'items', 'field', 'operator', 'value', 'sort', 'limit', '__proto__'];
    const gen = (depth: number): unknown => {
      const r = rand();
      if (depth > 3 || r < 0.4) return atoms[Math.floor(rand() * atoms.length)];
      if (r < 0.7) return Array.from({ length: Math.floor(rand() * 4) }, () => gen(depth + 1));
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < 3; i++) obj[keys[Math.floor(rand() * keys.length)]] = gen(depth + 1);
      return obj;
    };
    const { api, apiRef } = makeApi();
    const throwingApi = { ...api, setSortModel: () => { throw new Error('controlled parent threw'); }, getAllFilteredRows: () => { throw new Error('x'); } };
    const toolSets = [
      createGridAgentTools(apiRef, columns, { allowRowAccess: true }),
      createGridAgentTools({ current: throwingApi }, columns, { allowRowAccess: true }),
      createGridAgentTools({ current: {} as GridAgentApi }, columns, { allowRowAccess: true }),
    ];
    for (let i = 0; i < 400; i++) {
      const input = gen(0);
      for (const tools of toolSets) {
        for (const tool of tools) {
          const result = await tool.execute(input);
          expect(typeof result.ok).toBe('boolean');
        }
      }
    }
    expect(Object.prototype).not.toHaveProperty('sortModel');
  });
});
