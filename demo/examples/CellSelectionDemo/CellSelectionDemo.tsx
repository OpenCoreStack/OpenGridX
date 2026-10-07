import { useState } from 'react';
import {
    DataGrid,
    useGridApiRef,
    type GridColDef,
    type GridCellSelectionModel,
    type GridCellSelectionReason,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './CellSelectionDemo.css';

import sourceCode from './CellSelectionDemo.tsx?raw';

interface SalesRow {
    id: number;
    region: string;
    rep: string;
    product: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
}

const REGIONS = ['North', 'South', 'East', 'West'];
const REPS = ['Ana Ruiz', 'Ben Okafor', 'Chloe Martin', 'Dev Patel', 'Elena Rossi', 'Farid Haddad'];
const PRODUCTS = ['Laptops', 'Monitors', 'Docks', 'Headsets', 'Keyboards'];

// Deterministic figures, so the totals in the status bar are the same on every visit.
const rows: SalesRow[] = Array.from({ length: 60 }, (_, i) => {
    const base = 4000 + ((i * 7919) % 9000);
    return {
        id: i + 1,
        region: REGIONS[i % REGIONS.length],
        rep: REPS[i % REPS.length],
        product: PRODUCTS[(i * 3) % PRODUCTS.length],
        q1: base,
        q2: base + ((i * 131) % 2500),
        q3: base + ((i * 271) % 3100) - 900,
        q4: base + ((i * 389) % 4200),
    };
});

const money = ({ value }: { value: unknown }) =>
    typeof value === 'number' ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '';

const columns: GridColDef<SalesRow>[] = [
    { field: 'region', headerName: 'Region', width: 110 },
    { field: 'rep', headerName: 'Sales rep', width: 150 },
    { field: 'product', headerName: 'Product', width: 130 },
    { field: 'q1', headerName: 'Q1', type: 'number', width: 110, valueFormatter: money },
    { field: 'q2', headerName: 'Q2', type: 'number', width: 110, valueFormatter: money },
    { field: 'q3', headerName: 'Q3', type: 'number', width: 110, valueFormatter: money },
    { field: 'q4', headerName: 'Q4', type: 'number', width: 110, valueFormatter: money },
    {
        field: 'total',
        headerName: 'Year',
        type: 'number',
        width: 120,
        valueGetter: ({ row }) => row.q1 + row.q2 + row.q3 + row.q4,
        valueFormatter: money,
    },
];

const GESTURES: { input: string; result: string }[] = [
    { input: 'Click', result: 'Focus the cell; the range is that cell' },
    { input: 'Press and drag', result: 'Select from the pressed cell to the cell under the pointer; scrolls near the edges' },
    { input: 'Shift + click', result: 'Extend the range from the active cell to the clicked cell' },
    { input: 'Shift + arrow keys', result: 'Move the far corner by one cell (no wrapping)' },
    { input: 'Shift + Home / End', result: 'Far corner to the first / last column of its row' },
    { input: 'Ctrl + Shift + Home / End', result: 'Far corner to the first / last cell of the page' },
    { input: 'Ctrl / ⌘ + A', result: 'Select every data cell on the page' },
    { input: 'Escape', result: 'Collapse the range to the active cell' },
    { input: 'Ctrl / ⌘ + C', result: 'Copy the range as tab-separated text (paste into Excel or Sheets)' },
];

const describeModel = (model: GridCellSelectionModel) => {
    const range = model[0];
    if (!range) return 'empty';
    return `anchor ${range.anchor.id}:${range.anchor.field} → head ${range.head.id}:${range.head.field}`;
};

export default function CellSelectionDemo() {
    const apiRef = useGridApiRef<SalesRow>();
    const [model, setModel] = useState<GridCellSelectionModel>([]);
    const [log, setLog] = useState<{ reason: GridCellSelectionReason; text: string }[]>([]);
    const [status, setStatus] = useState('');

    const handleChange = (next: GridCellSelectionModel, details: { reason: GridCellSelectionReason }) => {
        setModel(next);
        setLog(prev => [{ reason: details.reason, text: describeModel(next) }, ...prev].slice(0, 6));
    };

    const selectQ1ToQ4 = () => {
        apiRef.current.selectCellRange({ id: 1, field: 'q1' }, { id: 12, field: 'q4' });
    };

    const copyRange = async () => {
        try {
            await apiRef.current.copySelectedCells();
            setStatus(`Copied ${apiRef.current.getSelectedCells().length} cells.`);
        } catch {
            setStatus('The browser blocked the clipboard write.');
        }
    };

    return (
        <DocsLayout
            title="Cell Range Selection"
            description={
                <>
                    Select a rectangle of cells the way you do in a spreadsheet, see its count, sum and average in
                    the status bar, and copy it with <code>Ctrl / ⌘ + C</code>. Turn it on with{' '}
                    <code>cellSelection</code>; <code>showCellSelectionStats</code> adds the status bar.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="cell-selection-demo">
                <table className="cell-selection-demo__gestures">
                    <thead>
                        <tr><th>Input</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                        {GESTURES.map(g => (
                            <tr key={g.input}><td><kbd>{g.input}</kbd></td><td>{g.result}</td></tr>
                        ))}
                    </tbody>
                </table>

                <div className="cell-selection-demo__actions">
                    <button type="button" className="cell-selection-demo__btn" onClick={selectQ1ToQ4}>
                        Select Q1–Q4 of rows 1–12
                    </button>
                    <button type="button" className="cell-selection-demo__btn" onClick={copyRange}>
                        Copy selected cells
                    </button>
                    <button
                        type="button"
                        className="cell-selection-demo__btn cell-selection-demo__btn--secondary"
                        onClick={() => apiRef.current.clearCellSelection()}
                    >
                        Clear selection
                    </button>
                    {status && <span className="cell-selection-demo__status">{status}</span>}
                </div>

                <DataGrid<SalesRow>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    showCellSelectionStats
                    cellSelectionModel={model}
                    onCellSelectionModelChange={handleChange}
                    pinnedColumns={{ left: ['region'] }}
                    height={460}
                />

                <div className="cell-selection-demo__readout">
                    <div><strong>cellSelectionModel:</strong> <code>{describeModel(model)}</code></div>
                    <div className="cell-selection-demo__log-title">onCellSelectionModelChange (latest first)</div>
                    <ol className="cell-selection-demo__log">
                        {log.length === 0 && <li className="cell-selection-demo__log-empty">Click or drag in the grid.</li>}
                        {log.map((entry, i) => (
                            <li key={i}><code>{entry.reason}</code> {entry.text}</li>
                        ))}
                    </ol>
                </div>

                <pre className="cell-selection-demo__code"><code>{`import { DataGrid, useGridApiRef } from '@opencorestack/opengridx';

const apiRef = useGridApiRef();

<DataGrid
    rows={rows}
    columns={columns}
    apiRef={apiRef}
    cellSelection
    showCellSelectionStats
    onCellSelectionModelChange={(model, { reason }) => console.log(reason, model)}
    height={460}
/>

// Programmatic control
apiRef.current.selectCellRange({ id: 1, field: 'q1' }, { id: 12, field: 'q4' });
await apiRef.current.copySelectedCells();
apiRef.current.clearCellSelection();`}</code></pre>
            </div>
        </DocsLayout>
    );
}
