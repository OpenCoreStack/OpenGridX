import { useMemo, useState } from 'react';
import { DataGrid, type GridFilterModel, type GridSortItem } from '@opencorestack/opengridx';
import { getGridAiSchema, validateGridAiState, type GridAiState } from '@opencorestack/opengridx/ai';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

// What a model might return: two good filters and a sort, plus an unknown field, an operator the
// column does not take, a string number to coerce and a part that does not exist.
const MODEL_OUTPUT = JSON.stringify({
  schemaVersion: 1,
  filterModel: {
    items: [
      { field: 'region', operator: 'equals', value: 'North' },
      { field: 'amount', operator: '>', value: '5,000' },
      { field: 'revenue', operator: '>', value: 1 },
      { field: 'status', operator: 'contains', value: 'Pa' },
    ],
  },
  sortModel: [{ field: 'amount', sort: 'DESC' }],
  rowModel: { ignored: true },
});

export default function Ai() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(5000), []);
  const schema = useMemo(() => getGridAiSchema(invoiceColumns, { include: ['filter', 'sort', 'grouping', 'aggregation'] }), []);
  const result = useMemo(() => validateGridAiState(MODEL_OUTPUT, invoiceColumns, { include: ['filter', 'sort'] }), []);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = useState<GridSortItem[]>([]);

  const apply = (state: GridAiState) => {
    if (state.filterModel) setFilterModel(state.filterModel);
    if (state.sortModel) setSortModel(state.sortModel);
  };

  return (
    <div className="page">
      <div className="bar">
        <span data-testid="ai-schema">{`v${schema.schemaVersion}: ${Object.keys(schema.properties).join(',')}`}</span>
        <span data-testid="ai-state">{JSON.stringify(result.state)}</span>
        <ul data-testid="ai-errors">
          {result.errors.map((e) => <li key={e.path}>{`${e.path}: ${e.message}`}</li>)}
        </ul>
        <button type="button" data-testid="ai-apply" onClick={() => apply(result.state)}>Apply</button>
      </div>
      <DataGrid
        rows={rows}
        columns={invoiceColumns}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        height={600}
      />
    </div>
  );
}
