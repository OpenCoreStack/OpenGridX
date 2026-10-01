import { useMemo, useState } from 'react';
import { DataGrid, GridToolbar, type GridRowSelectionModel } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

export default function Basic() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(5000), []);
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  return (
    <div className="page">
      <div className="bar">
        <span data-testid="selection-count">selected: {selection.length}</span>
      </div>
      <DataGrid
        rows={rows}
        columns={invoiceColumns}
        checkboxSelection
        pagination
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
        pageSizeOptions={[25, 100]}
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        slots={{ toolbar: GridToolbar }}
        height={600}
      />
    </div>
  );
}
