import { useMemo } from 'react';
import { DataGrid, DataGridThemeProvider, GridToolbar, type GridTheme } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

const erpTheme: GridTheme = { colors: { primary: '#0f766e' } };

/** ERP shell: no height prop. The grid must fill the flex region and still virtualize 50k rows. */
export default function Flex() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(50000, 13), []);
  return (
    <div className="erp-shell">
      <div className="erp-header">ERP - Sales Register</div>
      <div className="erp-body">
        <div className="erp-side">side nav</div>
        <div className="erp-main">
          <div className="erp-title">Invoices (50,000)</div>
          <div className="erp-grid" data-testid="grid-region">
            <DataGridThemeProvider theme={erpTheme}>
              <DataGrid rows={rows} columns={invoiceColumns} checkboxSelection slots={{ toolbar: GridToolbar }} />
            </DataGridThemeProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
