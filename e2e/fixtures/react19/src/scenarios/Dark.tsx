import { useMemo } from 'react';
import { DataGrid, DataGridThemeProvider, GridToolbar, darkTheme } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

export default function Dark() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(2000, 11), []);
  return (
    <div className="page">
      <DataGridThemeProvider theme={darkTheme}>
        <DataGrid rows={rows} columns={invoiceColumns} checkboxSelection slots={{ toolbar: GridToolbar }} height={600} />
      </DataGridThemeProvider>
    </div>
  );
}
