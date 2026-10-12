// Plain JavaScript (no JSX), so the fixture needs no compiler beyond webpack itself.
import { createElement as h, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DataGrid, exportToExcelAdvanced, exportToPdf } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles';

const rows = [
  { id: 1, name: 'Alpha', amount: 120 },
  { id: 2, name: 'Beta', amount: 80 },
  { id: 3, name: 'Gamma', amount: 45 },
];
const columns = [
  { field: 'id', headerName: 'ID', type: 'number', width: 80 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'amount', headerName: 'Amount', type: 'number', width: 120 },
];

function App() {
  const [status, setStatus] = useState('idle');
  const run = (exportFn) => () => {
    setStatus('running');
    exportFn().then(
      () => setStatus('exported'),
      (e) => setStatus(String(e instanceof Error ? e.message : e)),
    );
  };
  return h('div', null,
    h('button', { type: 'button', 'data-testid': 'export-xlsx', onClick: run(() => exportToExcelAdvanced(rows, columns)) }, 'Excel'),
    h('button', { type: 'button', 'data-testid': 'export-pdf', onClick: run(() => exportToPdf(rows, columns)) }, 'PDF'),
    h('output', { 'data-testid': 'status' }, status),
    h(DataGrid, { rows, columns, height: 300 }),
  );
}

createRoot(document.getElementById('root')).render(h(StrictMode, null, h(App)));
