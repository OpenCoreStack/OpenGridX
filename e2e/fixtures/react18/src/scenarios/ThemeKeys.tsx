import { useMemo } from 'react';
import { DataGrid, DataGridThemeProvider, type GridTheme } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

// The v3.7 theme-builder keys: fonts, header padding, outer border, radius, dividers, overlay font.
const theme: GridTheme = {
  grid: {
    headerFontFamily: 'Georgia, serif',
    headerFontWeight: '800',
    cellFontFamily: 'monospace',
    cellFontWeight: '300',
    headerPaddingX: '20px',
    borderWidth: '2px',
    borderRadius: '4px',
    columnDividerWidth: '0',
    headerColumnDividerWidth: '0',
    rowDividerWidth: '2px',
    rowDividerColor: '#ff0000',
  },
  overlays: { fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: '15px' },
};

export default function ThemeKeys() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(200, 5), []);
  return (
    <div className="page">
      <DataGridThemeProvider theme={theme}>
        <DataGrid rows={rows} columns={invoiceColumns} height={500} />
      </DataGridThemeProvider>
    </div>
  );
}
