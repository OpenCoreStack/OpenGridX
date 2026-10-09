import { useMemo, useState } from 'react';
import { DataGrid, type GridFilterModel } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

export default function HeaderFilters() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(2000), []);
  const [model, setModel] = useState<GridFilterModel>({ items: [] });
  return (
    <div className="page">
      <div className="bar">
        <span data-testid="filter-log">
          {(model.items ?? []).map((item) => ('field' in item ? `${String(item.id)} ${item.operator} ${String(item.value)}` : 'group')).join('; ') || 'none'}
        </span>
      </div>
      <DataGrid
        rows={rows}
        columns={invoiceColumns}
        headerFilters
        filterModel={model}
        onFilterModelChange={setModel}
        pinnedColumns={{ left: ['docNo'] }}
        height={600}
      />
    </div>
  );
}
