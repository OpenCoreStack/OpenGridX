import { useState } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridClipboardPasteResult,
  type GridHistoryChangeParams,
} from '@opencorestack/opengridx';

interface Item {
  id: number;
  sku: string;
  qty: number;
  price: number;
}

const initialItems: Item[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  sku: `SKU-${i + 1}`,
  qty: i + 1,
  price: (i + 1) * 10,
}));

const columns: GridColDef<Item>[] = [
  { field: 'sku', headerName: 'SKU', width: 140, editable: true },
  { field: 'qty', headerName: 'Qty', type: 'number', width: 100, editable: true },
  { field: 'price', headerName: 'Price', type: 'number', width: 120, editable: true },
];

export default function Paste() {
  const [rows, setRows] = useState(initialItems);
  const [pasted, setPasted] = useState('none');
  const [history, setHistory] = useState<GridHistoryChangeParams>({ canUndo: false, canRedo: false, size: 0 });
  return (
    <div className="page">
      <div className="bar">
        <textarea data-testid="source" defaultValue={'Widget\t1,200\t9.50\nGadget\t3\t4'} rows={2} />
        <span data-testid="paste-log">{pasted}</span>
        <span data-testid="history-log">{`${history.size} ${history.canUndo} ${history.canRedo}`}</span>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        cellSelection
        undoRedo
        onHistoryChange={setHistory}
        onClipboardPaste={(result: GridClipboardPasteResult) => {
          setPasted(`updated ${result.updated.length} skipped ${result.skipped.length}`);
        }}
        processRowUpdate={(row: Item) => {
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
          return row;
        }}
        height={400}
      />
    </div>
  );
}
