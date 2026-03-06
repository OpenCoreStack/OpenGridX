import { useState, useCallback } from 'react';
import { DataGrid, GridColDef, GridCellParams, GridRowParams } from '../../../lib';
import { DocsLayout } from '../../components/DocsLayout';
import './EventsDemo.css';

import sourceCode from './EventsDemo.tsx?raw';

interface LogEntry {
    id: number;
    timestamp: string;
    event: string;
    detail: string;
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
];

const rows = [
    { id: 1, name: 'Alice Smith', email: 'alice@acme.com', role: 'Full-Stack Developer', status: 'Active' },
    { id: 2, name: 'Bob Johnson', email: 'bob@acme.com', role: 'UX Designer', status: 'On Leave' },
    { id: 3, name: 'Carol Williams', email: 'carol@acme.com', role: 'Product Manager', status: 'Active' },
    { id: 4, name: 'David Brown', email: 'david@acme.com', role: 'DevOps Engineer', status: 'Remote' },
    { id: 5, name: 'Eve Jones', email: 'eve@acme.com', role: 'QA Analyst', status: 'Active' },
];

export default function EventsDemo() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback((event: string, detail: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [
            { id: Date.now(), timestamp, event, detail },
            ...prev.slice(0, 49) // Keep last 50 entries
        ]);
    }, []);

    const handleRowClick = (params: GridRowParams) => {
        addLog('Row Click', `ID: ${params.id}, Name: ${params.row.name}`);
    };

    const handleCellClick = (params: GridCellParams) => {
        addLog('Cell Click', `Field: ${params.field}, Value: ${params.value}`);
    };

    const handleSortModelChange = (model: any) => {
        if (model.length === 0) {
            addLog('Sort Change', 'Cleared all sorting');
        } else {
            addLog('Sort Change', `Field: ${model[0].field}, Direction: ${model[0].sort}`);
        }
    };

    const handleFilterModelChange = (model: any) => {
        addLog('Filter Change', `${model.items.length} active filters`);
    };

    const handleColumnOrderChange = (params: any) => {
        addLog('Column Reorder', `Moved ${params.column.field} to index ${params.targetIndex}`);
    };

    return (
        <DocsLayout
            title="Events Observer"
            description="Track and monitor every internal grid interaction. From basic clicks to complex state changes and drag-and-drop actions, OpenGridX provides a robust event system for building reactive UIs."
            sourceCode={sourceCode}
        >
            <div className="events-container">
                <div className="events-layout">
                    <div className="events-grid">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            height={500}
                            checkboxSelection
                            onRowClick={handleRowClick}
                            onCellClick={handleCellClick}
                            onSortModelChange={handleSortModelChange}
                            onFilterModelChange={handleFilterModelChange}
                            onColumnOrderChange={handleColumnOrderChange}
                            // Using standard props to simulate and track reordering
                            rowReordering={true}
                            onRowOrderChange={(params) => addLog('Row Reorder', `Moved row ${params.row.id} from ${params.oldIndex} to ${params.targetIndex}`)}
                        />
                    </div>

                    <div className="events-log">
                        <div className="events-log-header">
                            <span className="events-log-title">🛰️ Live Event Stream</span>
                            <button className="events-log-clear" onClick={() => setLogs([])}>
                                Clear Log
                            </button>
                        </div>
                        <div className="events-log-body">
                            {logs.map((log) => (
                                <div key={log.id} className="events-log-entry">
                                    <span className="event-time">{log.timestamp}</span>
                                    <span className="event-name">{log.event}</span>
                                    <span className="event-detail">{log.detail}</span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="event-detail" style={{ textAlign: 'center', marginTop: 100 }}>
                                    No events tracked yet.<br />Try clicking rows, cells, or sorting columns.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DocsLayout>
    );
}
