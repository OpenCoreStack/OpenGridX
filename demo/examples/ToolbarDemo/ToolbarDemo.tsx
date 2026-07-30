import { DataGrid, GridToolbar, Button } from '@opencorestack/opengridx';
import { useMemo } from 'react';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ToolbarDemo.tsx?raw';

const rows = [
    { id: 1, name: 'Project Alpha', status: 'In Progress', priority: 'High', budget: 50000 },
    { id: 2, name: 'Project Beta', status: 'Completed', priority: 'Medium', budget: 25000 },
    { id: 3, name: 'Project Gamma', status: 'Planning', priority: 'Low', budget: 12000 },
    { id: 4, name: 'Project Delta', status: 'On Hold', priority: 'High', budget: 85000 },
];

const columns = [
    { field: 'name', headerName: 'Project Name', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'priority', headerName: 'Priority', width: 120 },
    { field: 'budget', headerName: 'Budget', width: 150, type: 'number' as const },
];

function CustomToolbar() {
    return (
        <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <GridToolbar />
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }} />
                <Button size="small" variant="outlined" onClick={() => alert('Custom Action!')}>
                    🚀 Custom Action
                </Button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Total Projects: {rows.length}
            </div>
        </div>
    );
}

export default function ToolbarDemo() {
    const slots = useMemo(() => ({
        toolbar: CustomToolbar
    }), []);

    return (
        <DocsLayout
            title="Toolbar"
            description="The built-in GridToolbar provides global search, column visibility management, advanced filters, aggregation panel, and pivot mode — all configurable via slots."
            sourceCode={sourceCode}
        >
            <div style={{ height: 400 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    slots={slots}
                />
            </div>
        </DocsLayout>
    );
}
