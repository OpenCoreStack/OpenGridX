import { DataGrid, Button, GridColDef } from '@opencorestack/opengridx';
import { useMemo } from 'react';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './SlotsDemo.tsx?raw';

interface EmployeeRow {
    id: number;
    name: string;
    email: string;
    performance: number;
    color: string;
}

const rows: EmployeeRow[] = [
    { id: 1, name: 'Asif Ansari', email: 'asif@example.com', performance: 95, color: '#4f46e5' },
    { id: 2, name: 'John Doe', email: 'john@example.com', performance: 88, color: '#10b981' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', performance: 92, color: '#f59e0b' },
];

export default function SlotsDemo() {
    const columns = useMemo<GridColDef<EmployeeRow>[]>(() => [
        { field: 'name', headerName: 'Employee', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        {
            field: 'performance',
            headerName: 'Performance',
            width: 150,
            renderCell: (params) => (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${params.value}%`,
                            height: '100%',
                            background: params.row.color,
                            transition: 'width 0.5s ease-in-out'
                        }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{params.value}%</span>
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Quick Actions',
            width: 150,
            renderCell: (params) => (
                <Button size="small" onClick={() => alert(`Reviewing ${params.row.name}`)}>
                    View Profile
                </Button>
            )
        }
    ], []);

    const slots = useMemo(() => ({
        // You can replace internal parts here
        // NoRowsOverlay: () => <div>No Data Found</div>,
        // LoadingOverlay: () => <div>Syncing...</div>,
    }), []);

    return (
        <DocsLayout
            title="Slots & Renderers"
            description="Replace any internal component with your own via the slots API. Custom cell renderers, header renderers, toolbar, no-rows overlay, and loading overlay."
            sourceCode={sourceCode}
        >
            <div style={{ height: 300, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    slots={slots}
                />
            </div>

            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <h4 style={{ color: '#0369a1', marginBottom: '8px' }}>Architecture Note:</h4>
                <p style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>
                    Unlike traditional tables, OpenGridX uses a "Headless" mindset. We manage the scrolling, selection, and state, but YOU decide how the data looks.
                </p>
            </div>
        </DocsLayout>
    );
}
