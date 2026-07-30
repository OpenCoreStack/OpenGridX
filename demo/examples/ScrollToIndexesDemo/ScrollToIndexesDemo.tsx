import { useState, useRef } from 'react';
import { DataGrid, useGridApiRef } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';
import './ScrollToIndexesDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ScrollToIndexesDemo.tsx?raw';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Legal', 'Design', 'Operations'];
const STATUSES = ['Active', 'On Leave', 'Remote', 'Contractor'];

const columns: GridColDef[] = [
    { field: 'id',         headerName: 'ID',         width: 80 },
    { field: 'name',       headerName: 'Full Name',  width: 160 },
    { field: 'email',      headerName: 'Email',      width: 220 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'role',       headerName: 'Job Title',  width: 180 },
    { field: 'salary',     headerName: 'Salary',     width: 120, type: 'number' },
    { field: 'startDate',  headerName: 'Start Date', width: 140 },
    { field: 'status',     headerName: 'Status',     width: 130 },
    { field: 'location',   headerName: 'Location',   width: 150 },
    { field: 'manager',    headerName: 'Manager',    width: 160 },
];

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
const LAST_NAMES  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];
const LOCATIONS   = ['New York', 'San Francisco', 'Austin', 'Chicago', 'London', 'Berlin', 'Tokyo', 'Sydney'];

function seed(n: number) {
    return ((n * 1103515245 + 12345) & 0x7fffffff) % 100;
}

const rows = Array.from({ length: 200 }, (_, i) => {
    const id = i + 1;
    const fn = FIRST_NAMES[seed(id * 3) % FIRST_NAMES.length];
    const ln = LAST_NAMES[seed(id * 7) % LAST_NAMES.length];
    const dept = DEPARTMENTS[seed(id * 11) % DEPARTMENTS.length];
    return {
        id,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@company.com`,
        department: dept,
        role: `${dept} Specialist`,
        salary: 50000 + (seed(id * 13) * 700),
        startDate: `2018-${String((seed(id * 17) % 12) + 1).padStart(2, '0')}-${String((seed(id * 19) % 28) + 1).padStart(2, '0')}`,
        status: STATUSES[seed(id * 23) % STATUSES.length],
        location: LOCATIONS[seed(id * 29) % LOCATIONS.length],
        manager: `${FIRST_NAMES[seed(id * 31) % FIRST_NAMES.length]} ${LAST_NAMES[seed(id * 37) % LAST_NAMES.length]}`,
    };
});

export default function ScrollToIndexesDemo() {
    const apiRef = useGridApiRef();
    const [rowInput, setRowInput] = useState('99');
    const [colInput, setColInput] = useState('7');
    const [lastJump, setLastJump] = useState<{ row: number; col: number } | null>(null);
    const rowInputRef = useRef<HTMLInputElement>(null);

    const jump = () => {
        const rowIndex = Math.max(0, Math.min(rows.length - 1, parseInt(rowInput, 10) || 0));
        const colIndex = Math.max(0, Math.min(columns.length - 1, parseInt(colInput, 10) || 0));
        apiRef.current.scrollToIndexes({ rowIndex, colIndex });
        setLastJump({ row: rowIndex, col: colIndex });
        rowInputRef.current?.blur();
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') jump();
    };

    const targetCol = lastJump !== null ? columns[lastJump.col] : null;

    return (
        <DocsLayout
            title="Scroll To Indexes"
            description="Programmatically scroll the viewport to any row or column using apiRef.current.scrollToIndexes. Useful for search-result highlighting and navigation shortcuts."
            sourceCode={sourceCode}
        >
            <div className="scroll-demo-controls">
                <label className="scroll-demo-field">
                    <span>Row index <em>(0 – {rows.length - 1})</em></span>
                    <input
                        ref={rowInputRef}
                        type="number"
                        min={0}
                        max={rows.length - 1}
                        value={rowInput}
                        onChange={e => setRowInput(e.target.value)}
                        onKeyDown={handleKey}
                        className="scroll-demo-input"
                    />
                </label>
                <label className="scroll-demo-field">
                    <span>Column index <em>(0 – {columns.length - 1})</em></span>
                    <input
                        type="number"
                        min={0}
                        max={columns.length - 1}
                        value={colInput}
                        onChange={e => setColInput(e.target.value)}
                        onKeyDown={handleKey}
                        className="scroll-demo-input"
                    />
                </label>
                <button className="scroll-demo-btn" onClick={jump}>
                    Jump →
                </button>
                {lastJump !== null && (
                    <span className="scroll-demo-result">
                        Scrolled to row <strong>{lastJump.row}</strong>,
                        column <strong>{lastJump.col}</strong>
                        {targetCol && <> ({targetCol.headerName})</>}
                    </span>
                )}
            </div>

            <div className="scroll-demo-grid-wrapper">
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    height={520}
                    checkboxSelection
                    pageSizeOptions={[25, 50, 100]}
                    pagination
                    initialState={{ pagination: { paginationModel: { pageSize: 50, page: 0 } } }}
                />
            </div>

            <div className="scroll-demo-notes">
                <h3>How it works</h3>
                <ul>
                    <li><code>apiRef.current.scrollToIndexes({'{ rowIndex, colIndex }'})</code> — both params are optional.</li>
                    <li>Row scrolling uses cumulative row heights so variable-height rows (expanded detail panels) are handled correctly.</li>
                    <li>Column index counts all visible data columns left-to-right. Pinned columns are skipped — they are always in view.</li>
                </ul>
            </div>
        </DocsLayout>
    );
}
