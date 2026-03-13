
import { useState, useCallback } from 'react';
import { DataGrid, useGridStateStorage } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';
import './StatePersistenceDemo.css';

interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    joinDate: string;
    status: 'active' | 'inactive' | 'on-leave';
}

const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Support', 'Design'];
const roles = ['Developer', 'Manager', 'Analyst', 'Designer', 'Specialist', 'Lead', 'Director'];
const statuses: Employee['status'][] = ['active', 'inactive', 'on-leave'];

function generateEmployees(count: number): Employee[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@company.com`,
        department: departments[i % departments.length],
        role: roles[i % roles.length],
        salary: 40000 + Math.floor(Math.random() * 120000),
        joinDate: new Date(2020 + Math.floor(i / 50), i % 12, (i % 28) + 1)
            .toISOString()
            .split('T')[0],
        status: statuses[i % 3],
    }));
}

const rows = generateEmployees(200);

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'email', headerName: 'Email', width: 240 },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'role', headerName: 'Role', width: 130 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    { field: 'joinDate', headerName: 'Join Date', width: 130 },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
            const colors: Record<string, { bg: string; text: string }> = {
                active: { bg: '#dcfce7', text: '#166534' },
                inactive: { bg: '#fee2e2', text: '#991b1b' },
                'on-leave': { bg: '#fef3c7', text: '#92400e' },
            };
            const style = colors[params.value as string] ?? { bg: '#f3f4f6', text: '#374151' };
            return (
                <span
                    className="status-pill"
                    style={{
                        background: style.bg,
                        color: style.text,
                    }}
                >
                    {params.value}
                </span>
            );
        },
    },
];

const STORAGE_KEY = 'ogx-demo-state-persistence';

export default function StatePersistenceDemo() {
    const { initialState, onStateChange, clearState } = useGridStateStorage(STORAGE_KEY);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const handleStateChange = useCallback(
        (state: import('../../../lib/state/types').GridState) => {
            onStateChange(state);
            setLastSaved(new Date().toLocaleTimeString());
        },
        [onStateChange]
    );

    const handleClear = () => {
        clearState();
        setLastSaved(null);
        window.location.reload();
    };

    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const storedState = raw ? JSON.parse(raw) : null;

    return (
        <div className="state-persist-container">
            <h2>State Persistence</h2>
            <p className="state-persist-description">
                Sort columns, resize them, reorder them, or change pages — then <strong>reload the page</strong>.
                The grid will restore exactly where you left off. State is saved to{' '}
                <code className="state-persist-code">localStorage</code>{' '}
                via the <code className="state-persist-code">useGridStateStorage</code> hook.
            </p>

            <div className="state-persist-controls">
                <button
                    onClick={handleClear}
                    className="state-clear-btn"
                >
                    🗑 Clear Saved State
                </button>

                {lastSaved && (
                    <span className="state-save-indicator">
                        ✓ Saved at {lastSaved}
                    </span>
                )}

                {initialState && (
                    <span className="state-restored-tag">
                        📦 Restored from localStorage
                    </span>
                )}
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                initialState={initialState}
                onStateChange={handleStateChange}
                pagination
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                ariaLabel="State persistence demo grid"
                height={600}
            />

            {storedState && (
                <details className="state-json-viewer">
                    <summary>🔍 View stored state (JSON)</summary>
                    <pre>{JSON.stringify(storedState, null, 2)}</pre>
                </details>
            )}
        </div>
    );
}
