import { useRef, useState } from 'react';
import type React from 'react';
import {
    Button,
    DataGrid,
    useGridApiRef,
    type GridBatchEditResult,
    type GridColDef,
    type GridHistoryChangeParams,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import '../PasteDemos.css';

import sourceCode from './UndoRedoDemo.tsx?raw';

interface BudgetRow {
    id: number;
    department: string;
    owner: string;
    budget: number;
    spent: number;
    /** Recomputed by processRowUpdate: not recorded by the history, recomputed again on undo. */
    remaining: number;
}

const withRemaining = (row: BudgetRow): BudgetRow => ({ ...row, remaining: row.budget - row.spent });

const initialRows: BudgetRow[] = [
    { id: 1, department: 'Engineering', owner: 'Priya Shah', budget: 420000, spent: 312000, remaining: 0 },
    { id: 2, department: 'Design', owner: 'Tom Becker', budget: 140000, spent: 98000, remaining: 0 },
    { id: 3, department: 'Marketing', owner: 'Lena Ortiz', budget: 260000, spent: 241000, remaining: 0 },
    { id: 4, department: 'Sales', owner: 'Omar Haddad', budget: 310000, spent: 199000, remaining: 0 },
    { id: 5, department: 'Support', owner: 'Mia Chen', budget: 120000, spent: 87000, remaining: 0 },
    { id: 6, department: 'Finance', owner: 'Jonas Weber', budget: 90000, spent: 54000, remaining: 0 },
].map(withRemaining);

const money = ({ value }: { value: unknown }) =>
    typeof value === 'number' ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '';

const columns: GridColDef<BudgetRow>[] = [
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'owner', headerName: 'Owner', width: 150, editable: true },
    { field: 'budget', headerName: 'Budget', type: 'number', width: 130, editable: true, valueFormatter: money },
    { field: 'spent', headerName: 'Spent', type: 'number', width: 130, editable: true, valueFormatter: money },
    { field: 'remaining', headerName: 'Remaining', type: 'number', width: 130, valueFormatter: money },
];

interface LogEntry {
    id: number;
    text: string;
    kind: 'edit' | 'undo' | 'redo';
}

const fieldName = (field: string) => columns.find(c => c.field === field)?.headerName ?? field;
const show = (value: unknown) => (typeof value === 'number' ? value.toLocaleString() : String(value ?? '∅'));

export default function UndoRedoDemo() {
    const apiRef = useGridApiRef<BudgetRow>();
    const [rows, setRows] = useState(initialRows);
    const [history, setHistory] = useState<GridHistoryChangeParams>({ canUndo: false, canRedo: false, size: 0 });
    const [log, setLog] = useState<LogEntry[]>([]);
    // Set while a toolbar or keyboard undo / redo runs, so the saves it makes are labelled.
    const pendingRef = useRef<'undo' | 'redo' | null>(null);

    const addLog = (text: string, kind: LogEntry['kind']) =>
        setLog(prev => [{ id: Date.now() + Math.random(), text, kind }, ...prev].slice(0, 12));

    const run = async (action: 'undo' | 'redo') => {
        pendingRef.current = action;
        const result: GridBatchEditResult = action === 'undo' ? await apiRef.current.undo() : await apiRef.current.redo();
        pendingRef.current = null;
        if (result.skipped.length > 0) addLog(`${result.skipped.length} cells skipped (changed since)`, action);
    };

    // The grid handles the keys itself; this only labels the saves they make in the list below.
    const labelShortcut = (event: React.KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
        const key = event.key.toLowerCase();
        const kind = key === 'z' ? (event.shiftKey ? 'redo' : 'undo') : key === 'y' ? 'redo' : null;
        if (!kind) return;
        pendingRef.current = kind;
        setTimeout(() => { pendingRef.current = null; }, 50);
    };

    return (
        <DocsLayout
            title="Undo & Redo"
            description={
                <>
                    Turn on <code>undoRedo</code> to undo cell edits, pastes and range clears with{' '}
                    <code>Ctrl / ⌘ + Z</code> and redo them with <code>Ctrl / ⌘ + Shift + Z</code> or{' '}
                    <code>Ctrl + Y</code>. Undo and redo save through <code>processRowUpdate</code>, so your app
                    persists them like any edit.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="paste-demo" onKeyDownCapture={labelShortcut}>
                <div className="paste-demo__toolbar" role="toolbar" aria-label="History">
                    <Button variant="contained" color="primary" size="small" disabled={!history.canUndo} onClick={() => run('undo')}>
                        Undo
                    </Button>
                    <Button variant="contained" color="primary" size="small" disabled={!history.canRedo} onClick={() => run('redo')}>
                        Redo
                    </Button>
                    <Button variant="outlined" size="small" disabled={!history.canUndo && !history.canRedo} onClick={() => apiRef.current.clearHistory()}>
                        Clear history
                    </Button>
                    <span className="paste-demo__status">
                        onHistoryChange: <code>{`{ canUndo: ${history.canUndo}, canRedo: ${history.canRedo}, size: ${history.size} }`}</code>
                    </span>
                </div>

                <DataGrid<BudgetRow>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    undoRedo={{ limit: 50 }}
                    onHistoryChange={setHistory}
                    processRowUpdate={(newRow, oldRow) => {
                        const stored = withRemaining(newRow);
                        const changed = (Object.keys(newRow) as (keyof BudgetRow)[])
                            .filter(k => k !== 'remaining' && newRow[k] !== oldRow[k])
                            .map(k => `${fieldName(k)} ${show(oldRow[k])} → ${show(newRow[k])}`);
                        if (changed.length > 0) addLog(`${oldRow.department}: ${changed.join(', ')}`, pendingRef.current ?? 'edit');
                        setRows(prev => prev.map(r => (r.id === stored.id ? stored : r)));
                        return stored;
                    }}
                    height={360}
                />

                <section className="paste-demo__summary">
                    <strong>Saved changes (latest first)</strong>
                    {log.length === 0 && <p>Edit a cell (double-click or Enter), paste, or select cells and press Delete.</p>}
                    <ol className="paste-demo__history">
                        {log.map(entry => (
                            <li key={entry.id}>
                                <span className={`paste-demo__tag paste-demo__tag--${entry.kind}`}>{entry.kind}</span> {entry.text}
                            </li>
                        ))}
                    </ol>
                </section>

                <p className="paste-demo__note">
                    Only the cells you changed are recorded; <em>Remaining</em> is recomputed by{' '}
                    <code>processRowUpdate</code> each time. If a cell changed since it was recorded (edited again,
                    or new <code>rows</code> arrived), undo skips that cell with reason <code>'changed'</code> and
                    applies the rest. Inside an open editor, <code>Ctrl / ⌘ + Z</code> is the input's own undo.
                </p>

                <pre className="paste-demo__code"><code>{`const apiRef = useGridApiRef();
const [history, setHistory] = useState({ canUndo: false, canRedo: false, size: 0 });

<button disabled={!history.canUndo} onClick={() => apiRef.current.undo()}>Undo</button>
<button disabled={!history.canRedo} onClick={() => apiRef.current.redo()}>Redo</button>

<DataGrid
    rows={rows}
    columns={columns}
    apiRef={apiRef}
    cellSelection
    undoRedo={{ limit: 50 }}          // default limit: 100 actions
    onHistoryChange={setHistory}
    processRowUpdate={saveRow}        // undo and redo save through it too
/>`}</code></pre>
            </div>
        </DocsLayout>
    );
}
