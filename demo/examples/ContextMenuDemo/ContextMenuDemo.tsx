import { useState } from 'react';
import {
    DataGrid,
    exportToCsv,
    useGridApiRef,
    type GridColDef,
    type GridContextMenuEntry,
    type GridContextMenuParams,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import { CodeBlock } from '../../components/CodeBlock';
import '../PasteDemos.css';

import sourceCode from './ContextMenuDemo.tsx?raw';

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    city: string;
}

const initialRows: Employee[] = [
    { id: 1, name: 'Ada Lovelace', department: 'Engineering', salary: 128000, city: 'London' },
    { id: 2, name: 'Grace Hopper', department: 'Engineering', salary: 134000, city: 'New York' },
    { id: 3, name: 'Alan Turing', department: 'Research', salary: 121000, city: 'Manchester' },
    { id: 4, name: 'Margaret Hamilton', department: 'Engineering', salary: 139000, city: 'Boston' },
    { id: 5, name: 'Katherine Johnson', department: 'Research', salary: 117000, city: 'Hampton' },
    { id: 6, name: 'Edsger Dijkstra', department: 'Research', salary: 125000, city: 'Austin' },
    { id: 7, name: 'Barbara Liskov', department: 'Design', salary: 119000, city: 'Cambridge' },
    { id: 8, name: 'Donald Knuth', department: 'Design', salary: 131000, city: 'Stanford' },
    { id: 9, name: 'Radia Perlman', department: 'Support', salary: 98000, city: 'Seattle' },
    { id: 10, name: 'Tim Berners-Lee', department: 'Support', salary: 102000, city: 'London' },
];

const columns: GridColDef<Employee>[] = [
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    { field: 'department', headerName: 'Department', width: 140, editable: true },
    { field: 'salary', headerName: 'Salary', type: 'number', width: 120, editable: true },
    { field: 'city', headerName: 'City', width: 140, editable: true },
];

const snippet = `<DataGrid
    rows={rows}
    columns={columns}
    cellSelection                  // Copy then copies the selected range
    undoRedo                       // adds Undo and Redo to the menu
    contextMenu
    getContextMenuItems={(params, defaultItems) => [
        ...defaultItems,
        'divider',
        { id: 'export', label: 'Export CSV',
          onClick: () => exportToCsv(params.api.getAllFilteredRows(), columns) },
        { id: 'delete', label: 'Delete row', danger: true,
          onClick: () => removeRow(params.id) },
    ]}
/>

// Return [] to show no menu (the browser menu then shows instead).`;

export default function ContextMenuDemo() {
    const apiRef = useGridApiRef<Employee>();
    const [rows, setRows] = useState(initialRows);
    const [log, setLog] = useState<string[]>([]);

    const note = (text: string) => setLog(prev => [text, ...prev].slice(0, 6));

    const getContextMenuItems = (
        params: GridContextMenuParams<Employee>,
        defaultItems: readonly GridContextMenuEntry[],
    ): GridContextMenuEntry[] => [
        ...defaultItems,
        'divider',
        {
            id: 'export',
            label: 'Export CSV',
            onClick: () => {
                exportToCsv(params.api.getAllFilteredRows(), columns, { fileName: 'employees.csv' });
                note('Exported employees.csv');
            },
        },
        {
            id: 'delete',
            label: `Delete ${params.row.name}`,
            danger: true,
            onClick: () => {
                setRows(prev => prev.filter(r => r.id !== params.id));
                note(`Deleted row ${params.id} (${params.row.name})`);
            },
        },
    ];

    return (
        <DocsLayout
            title="Context Menu"
            description={
                <>
                    With <code>contextMenu</code> on, right-clicking a body cell (or pressing <kbd>Shift + F10</kbd>)
                    opens a menu of cell actions: Copy, Copy with headers, and Undo / Redo when <code>undoRedo</code> is
                    on. <code>getContextMenuItems</code> adds your own items, here Export CSV and a danger Delete row.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="paste-demo">
                <section className="paste-demo__sample">
                    <strong>Try it</strong>
                    <ul>
                        <li>Drag over a few cells, then right-click inside the range: Copy copies the whole range and the range stays.</li>
                        <li>Right-click a cell outside the range: the range collapses to that cell.</li>
                        <li>Edit a cell, then right-click and choose Undo.</li>
                        <li>Focus a cell with the arrow keys and press <kbd>Shift + F10</kbd>; <kbd>Esc</kbd> closes the menu and returns to the cell.</li>
                        <li>Right-click a column header: the browser's own menu shows.</li>
                    </ul>
                </section>

                <DataGrid<Employee>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    undoRedo
                    contextMenu
                    getContextMenuItems={getContextMenuItems}
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                    height={380}
                />

                <section className="paste-demo__summary">
                    <strong>Actions (latest first)</strong>
                    {log.length === 0 && <p>Choose Export CSV or Delete from the menu.</p>}
                    <ol className="paste-demo__history">
                        {log.map((entry, i) => <li key={`${i}-${entry}`}>{entry}</li>)}
                    </ol>
                </section>

                <CodeBlock code={snippet} />
            </div>
        </DocsLayout>
    );
}
