import { useMemo, useState } from 'react';
import { DataGrid, type GridCellSelectionModel, type GridCellSelectionReason } from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

export default function Range() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(2000), []);
  const [model, setModel] = useState<GridCellSelectionModel>([]);
  const [reason, setReason] = useState<GridCellSelectionReason | ''>('');
  const range = model[0];
  return (
    <div className="page">
      <div className="bar">
        <span data-testid="range-log">
          {range ? `${reason} ${range.anchor.id}:${range.anchor.field}-${range.head.id}:${range.head.field}` : 'none'}
        </span>
      </div>
      <DataGrid
        rows={rows}
        columns={invoiceColumns}
        cellSelection
        showCellSelectionStats
        cellSelectionModel={model}
        onCellSelectionModelChange={(next, details) => {
          setModel(next);
          setReason(details.reason);
        }}
        height={600}
      />
    </div>
  );
}
