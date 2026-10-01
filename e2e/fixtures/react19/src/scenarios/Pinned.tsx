import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridColumnGroupingModel } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, money, type Invoice } from '../data';

const groups: GridColumnGroupingModel = [
  { groupId: 'party', headerName: 'Party', children: ['customer', 'region'] },
  { groupId: 'money', headerName: 'Financials', children: ['amount', 'tax'] },
];

export default function Pinned() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(5000, 3), []);
  const columns = useMemo<GridColDef<Invoice>[]>(
    () => invoiceColumns.map((c) => (c.field === 'customer' ? { ...c, colSpan: ({ row }) => (row.id === 5 ? 2 : 1) } : c)),
    [],
  );
  return (
    <div className="page narrow">
      <DataGrid
        rows={rows}
        columns={columns}
        pinnedColumns={{ left: ['docNo'], right: ['amount'] }}
        pinnedRows={{ top: [1], bottom: [2] }}
        columnGroupingModel={groups}
        getDetailPanelContent={({ row }) => (
          <div className="detail" data-testid="detail">Detail for {row.docNo}: {money(row.amount)}</div>
        )}
        getDetailPanelHeight={() => 80}
        height={600}
      />
    </div>
  );
}
