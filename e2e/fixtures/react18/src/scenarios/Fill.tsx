import { useState } from 'react';
import { DataGrid, type GridColDef, type GridFillResult } from '@opencorestack/opengridx';

interface Line {
  id: number;
  account: string;
  jan: number;
  feb: number;
  mar: number;
}

const initialLines: Line[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  account: `Account ${i + 1}`,
  jan: i === 0 ? 100 : i === 1 ? 110 : 0,
  feb: 0,
  mar: 0,
}));

const columns: GridColDef<Line>[] = [
  { field: 'account', headerName: 'Account', width: 160, editable: true },
  { field: 'jan', headerName: 'Jan', type: 'number', width: 110, editable: true },
  { field: 'feb', headerName: 'Feb', type: 'number', width: 110, editable: true },
  { field: 'mar', headerName: 'Mar', type: 'number', width: 110, editable: true },
];

export default function Fill() {
  const [rows, setRows] = useState(initialLines);
  const [log, setLog] = useState('none');
  return (
    <div className="page">
      <div className="bar">
        <span data-testid="fill-log">{log}</span>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        cellSelection
        undoRedo
        onFill={(result: GridFillResult) => {
          setLog(`${result.direction} updated ${result.updated.length} skipped ${result.skipped.length}`);
        }}
        processRowUpdate={(row: Line) => {
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
          return row;
        }}
        height={440}
      />
    </div>
  );
}
