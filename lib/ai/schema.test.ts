import { describe, it, expect } from 'vitest';
import type { GridColDef } from '../types';
import { getOperatorsForType } from '../utils/filtering';
import { AGGREGATION_FUNCTIONS } from '../utils/aggregation';
import { AGGREGATION_FNS } from './columns';
import { getGridAiSchema } from './schema';

interface Sale {
  id: number;
  amt_usd: number;
  region: string;
}

const salesColumns: GridColDef<Sale>[] = [
  { field: 'region', headerName: 'Region', description: 'Sales region', aiExamples: ['North', 'South', { not: 'json' }] },
  { field: 'amt_usd', headerName: 'Revenue', description: 'Order revenue in USD', type: 'number', renderCell: () => null },
  { field: 'date', headerName: 'Order date', type: 'date', sortable: false },
  { field: 'paid', headerName: 'Paid', type: 'boolean', hideable: false },
  {
    field: 'status',
    headerName: 'Status',
    type: 'singleSelect',
    valueOptions: ['Open', { value: 'pd', label: 'Paid' }],
    groupable: false,
  },
  { field: 'qty', headerName: 'Qty', type: 'number', availableAggregationFunctions: ['sum', 'max', 'median'], filterable: false },
  { field: '__check__', headerName: 'Select' },
];

const minimalColumns = [{ field: 'name' }, { field: 'n', type: 'number', aggregable: false, sortable: false, groupable: false, hideable: false, filterable: false }];

type Node = Record<string, unknown>;
const props = (node: unknown): Node => (node as Node).properties as Node;

describe('getGridAiSchema', () => {
  it('matches the snapshot for a sales column set', () => {
    expect(getGridAiSchema(salesColumns)).toMatchSnapshot();
  });

  it('matches the snapshot for a minimal column set without descriptions', () => {
    expect(getGridAiSchema(minimalColumns, { descriptions: false })).toMatchSnapshot();
  });

  it('is deterministic: same columns, same schema', () => {
    expect(JSON.stringify(getGridAiSchema(salesColumns))).toBe(JSON.stringify(getGridAiSchema([...salesColumns])));
  });

  it('is a draft 2020-12 schema with schemaVersion 1 and JSON-serialisable', () => {
    const schema = getGridAiSchema(salesColumns);
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.schemaVersion).toBe(1);
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema);
  });

  it('offers the operators of getOperatorsForType per column', () => {
    const schema = getGridAiSchema(salesColumns);
    const items = ((schema.$defs as Node).filterItem as Node).oneOf as Node[];
    const byField = new Map(items.map((i) => [(props(i).field as Node).const, (props(i).operator as Node).enum]));
    expect(byField.get('amt_usd')).toEqual(getOperatorsForType('number'));
    expect(byField.get('date')).toEqual(getOperatorsForType('date'));
    expect(byField.get('region')).toEqual(getOperatorsForType('string'));
    expect(byField.has('qty')).toBe(false); // filterable: false
    expect(byField.has('__check__')).toBe(false); // system column
  });

  it('honours sortable, groupable, hideable and availableAggregationFunctions', () => {
    const p = getGridAiSchema(salesColumns).properties;
    expect(((p.sortModel.items as Node).properties as Node).field).toEqual({ enum: ['region', 'amt_usd', 'paid', 'status', 'qty'] });
    expect(p.rowGroupingModel.items).toEqual({ enum: ['region', 'amt_usd', 'date', 'paid', 'qty'] });
    expect(Object.keys(props(p.columnVisibilityModel))).toEqual(['region', 'amt_usd', 'date', 'status', 'qty']);
    const agg = props(p.aggregationModel);
    expect((agg.amt_usd as Node).enum).toEqual(AGGREGATION_FNS);
    expect((agg.region as Node).enum).toEqual(['count']);
    expect((agg.qty as Node).enum).toEqual(['sum', 'max']);
  });

  it('keeps AGGREGATION_FNS in step with the built-in aggregation functions', () => {
    expect([...AGGREGATION_FNS]).toEqual(Object.keys(AGGREGATION_FUNCTIONS));
  });

  it('chooses parts with include and exclude, and omits parts no column allows', () => {
    expect(Object.keys(getGridAiSchema(salesColumns, { include: ['filter', 'sort'] }).properties)).toEqual(['filterModel', 'sortModel']);
    expect(Object.keys(getGridAiSchema(salesColumns, { exclude: ['pivot', 'columnVisibility'] }).properties))
      .toEqual(['filterModel', 'sortModel', 'rowGroupingModel', 'aggregationModel']);
    // Only the quick filter is left when the one column allows nothing.
    expect(Object.keys(getGridAiSchema([minimalColumns[1]]).properties)).toEqual(['filterModel']);
  });

  it('sends aiExamples only when present and allowed, primitives only', () => {
    const json = JSON.stringify(getGridAiSchema(salesColumns));
    expect(json).toContain('"examples":["North","South"]');
    expect(JSON.stringify(getGridAiSchema(salesColumns, { examples: false }))).not.toContain('examples');
  });

  it('puts headerName and description in by default, and leaves them out on request', () => {
    expect(JSON.stringify(getGridAiSchema(salesColumns))).toContain('Revenue (Order revenue in USD)');
    expect(JSON.stringify(getGridAiSchema(salesColumns, { descriptions: false }))).not.toContain('description');
  });

  it('limits filter groups to three levels', () => {
    const defs = getGridAiSchema(salesColumns).$defs as Node;
    expect(Object.keys(defs).sort()).toEqual(['filterGroup1', 'filterGroup2', 'filterGroup3', 'filterItem']);
    expect(JSON.stringify(defs.filterGroup3)).not.toContain('filterGroup');
  });

  it('never throws on unusual column input', () => {
    expect(() => getGridAiSchema(null as unknown as [])).not.toThrow();
    expect(getGridAiSchema([null, 1, { field: 5 }, { field: '' }] as unknown as []).properties).toEqual({
      filterModel: { type: 'object', properties: { quickFilterValues: { type: 'array', items: { type: 'string' }, description: 'Words a row must contain, in any column' } }, additionalProperties: false },
    });
  });
});
