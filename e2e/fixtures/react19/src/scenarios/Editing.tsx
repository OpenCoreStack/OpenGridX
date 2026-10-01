import { useCallback, useMemo, useState } from 'react';
import { DataGrid, type GridColDef } from '@opencorestack/opengridx';
import { STATUSES, makeInvoices, money, type Invoice } from '../data';

export default function Editing() {
  const [rows, setRows] = useState<Invoice[]>(() => makeInvoices(500, 7));
  const [log, setLog] = useState<string[]>([]);

  const columns = useMemo<GridColDef<Invoice>[]>(() => [
    { field: 'docNo', headerName: 'Doc No', width: 130 },
    { field: 'customer', headerName: 'Customer', width: 160, editable: true },
    { field: 'date', headerName: 'Date', type: 'date', width: 150, editable: true },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 130, editable: true, valueFormatter: ({ value }) => money(value) },
    {
      field: 'net',
      headerName: 'Net',
      type: 'number',
      width: 130,
      editable: true,
      valueGetter: ({ row }) => row.amount - row.tax,
      valueSetter: ({ value, row }) => ({ ...row, amount: Number(value) + row.tax }),
      valueFormatter: ({ value }) => money(value),
    },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 130, editable: true },
    { field: 'posted', headerName: 'Posted', type: 'boolean', width: 90, editable: true },
  ], []);

  const processRowUpdate = useCallback((newRow: Invoice, oldRow: Invoice): Invoice => {
    setRows((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
    const date = newRow.date instanceof Date ? newRow.date.toISOString().slice(0, 10) : String(newRow.date);
    setLog((l) => [
      ...l,
      `${oldRow.id} customer=${newRow.customer} amount=${newRow.amount.toFixed(2)} status=${newRow.status} posted=${String(newRow.posted)} date=${date}`,
    ]);
    return newRow;
  }, []);

  return (
    <div className="page">
      <DataGrid rows={rows} columns={columns} processRowUpdate={processRowUpdate} height={500} />
      <pre data-testid="edit-log">{log.join('\n')}</pre>
    </div>
  );
}
