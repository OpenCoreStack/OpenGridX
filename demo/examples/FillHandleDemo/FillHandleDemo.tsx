import { useState } from 'react';
import {
    Button,
    DataGrid,
    useGridApiRef,
    type GridColDef,
    type GridFillResult,
    type GridHistoryChangeParams,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import '../PasteDemos.css';

import sourceCode from './FillHandleDemo.tsx?raw';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
type Month = typeof MONTHS[number];

type BudgetLine = {
    id: number;
    department: string;
    /** Next budget review: two dates a month apart continue by months. */
    review: Date | null;
} & Record<Month, number | null>;

const emptyMonths = () => Object.fromEntries(MONTHS.map(m => [m, null])) as Record<Month, number | null>;

const initialRows: BudgetLine[] = [
    { id: 1, department: 'Engineering', review: new Date(2026, 0, 15), ...emptyMonths(), jan: 42000, feb: 44000 },
    { id: 2, department: 'Design', review: new Date(2026, 1, 15), ...emptyMonths(), jan: 18000, feb: 18000 },
    { id: 3, department: 'Marketing', review: null, ...emptyMonths(), jan: 25000, feb: 27500, mar: 30000 },
    { id: 4, department: 'Sales', review: null, ...emptyMonths(), jan: 31000 },
    { id: 5, department: 'Support', review: null, ...emptyMonths(), jan: 12000, feb: 15000, mar: 13000 },
    { id: 6, department: 'Finance', review: null, ...emptyMonths() },
    { id: 7, department: 'Legal', review: null, ...emptyMonths() },
    { id: 8, department: 'Operations', review: null, ...emptyMonths() },
];

const money = ({ value }: { value: unknown }) =>
    typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '';

const columns: GridColDef<BudgetLine>[] = [
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'review', headerName: 'Next review', type: 'date', width: 130, editable: true },
    ...MONTHS.map((m): GridColDef<BudgetLine> => ({
        field: m,
        headerName: m[0].toUpperCase() + m.slice(1),
        type: 'number',
        width: 96,
        editable: true,
        valueFormatter: money,
        // Budgets are whole dollars: a fill never writes cents or negative amounts.
        fillValue: ({ value }) => (typeof value === 'number' ? Math.max(0, Math.round(value)) : value),
    })),
];

interface FillEntry {
    id: number;
    text: string;
}

export default function FillHandleDemo() {
    const apiRef = useGridApiRef<BudgetLine>();
    const [rows, setRows] = useState(initialRows);
    const [history, setHistory] = useState<GridHistoryChangeParams>({ canUndo: false, canRedo: false, size: 0 });
    const [fills, setFills] = useState<FillEntry[]>([]);

    const onFill = (result: GridFillResult) => {
        const skipped = result.skipped.length > 0
            ? `, ${result.skipped.length} skipped (${[...new Set(result.skipped.map(s => s.reason))].join(', ')})`
            : '';
        const failed = result.failed.length > 0 ? `, ${result.failed.length} rows failed` : '';
        setFills(prev => [
            { id: Date.now() + Math.random(), text: `Filled ${result.direction}: ${result.updated.length} rows saved${skipped}${failed}` },
            ...prev,
        ].slice(0, 8));
    };

    return (
        <DocsLayout
            title="Fill Handle"
            description={
                <>
                    With <code>cellSelection</code> on, the selected range has a small square on its bottom-right
                    corner. Drag it to fill the next cells, as in Excel: numbers and dates with an equal step continue
                    as a series, anything else repeats. <code>Ctrl / ⌘ + D</code> fills down and{' '}
                    <code>Ctrl / ⌘ + R</code> fills right. Every fill is one undo step.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="paste-demo">
                <section className="paste-demo__sample">
                    <strong>Try it</strong>
                    <ul>
                        <li>Select <em>Jan</em> and <em>Feb</em> of Engineering and drag the handle right to <em>Jun</em>: 46,000, 48,000, … continue the series.</li>
                        <li>Select Marketing's Jan to Mar and drag right: the step is 2,500 a month.</li>
                        <li>Support's Jan to Mar has no equal step, so dragging right repeats it. Hold <kbd>Alt</kbd> as you release to copy a series instead of continuing it.</li>
                        <li>Select Sales' Jan down to Operations' Jan and press <kbd>Ctrl / ⌘ + D</kbd> to copy 31,000 down.</li>
                        <li>Select both review dates and drag down: they continue by month (15 March, 15 April, …).</li>
                        <li><kbd>Ctrl / ⌘ + Z</kbd> undoes a whole fill in one step.</li>
                    </ul>
                </section>

                <div className="paste-demo__toolbar" role="toolbar" aria-label="History">
                    <Button variant="contained" color="primary" size="small" disabled={!history.canUndo} onClick={() => apiRef.current.undo()}>
                        Undo
                    </Button>
                    <Button variant="contained" color="primary" size="small" disabled={!history.canRedo} onClick={() => apiRef.current.redo()}>
                        Redo
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => { setRows(initialRows); setFills([]); apiRef.current.clearHistory(); }}>
                        Reset
                    </Button>
                </div>

                <DataGrid<BudgetLine>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    undoRedo
                    onHistoryChange={setHistory}
                    onFill={onFill}
                    pinnedColumns={{ left: ['department'] }}
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                    height={380}
                />

                <section className="paste-demo__summary">
                    <strong>onFill (latest first)</strong>
                    {fills.length === 0 && <p>Drag the fill handle or press Ctrl / ⌘ + D.</p>}
                    <ol className="paste-demo__history">
                        {fills.map(entry => <li key={entry.id}>{entry.text}</li>)}
                    </ol>
                </section>

                <p className="paste-demo__note">
                    Department is not editable, so a fill across it skips those cells with reason{' '}
                    <code>'notEditable'</code>. Each filled row is saved once through <code>processRowUpdate</code>.
                    The month columns use <code>fillValue</code> to keep amounts whole and non-negative.
                </p>

                <pre className="paste-demo__code"><code>{`<DataGrid
    rows={rows}
    columns={columns}
    cellSelection                    // the fill handle comes with range selection
    undoRedo                         // one fill = one undo step
    onFill={(result) => console.log(result.direction, result.updated, result.skipped)}
    processRowUpdate={saveRow}       // called once per filled row
/>

// Per column: decide what a fill writes (params.value is the grid's own choice)
{ field: 'jan', type: 'number', editable: true,
  fillValue: ({ value }) => Math.max(0, Math.round(value as number)) }

// Opt out: no handle, no Ctrl/Cmd+D or Ctrl/Cmd+R
<DataGrid cellSelection disableFillHandle ... />`}</code></pre>
            </div>
        </DocsLayout>
    );
}
