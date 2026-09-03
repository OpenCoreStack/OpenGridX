
import { useState } from 'react';
import { DataGrid, GridPaginationModel, GridRowId, GridColDef, GridRenderCellParams } from '@opencorestack/opengridx';
import { generateEmployees, Employee } from '../../data/mockData';
import { allColumns } from '../../data/columns';
import './TreeData.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './TreeData.tsx?raw';

const treeColumns: GridColDef<Employee>[] = allColumns.map((col) => {
    if (col.field !== 'name') return col;
    return {
        ...col,
        renderCell: (params: GridRenderCellParams<Employee>) => {
            const depth        = params.rowMeta?.treeDepth    ?? 0;
            const hasChildren  = params.rowMeta?.hasChildren  ?? false;
            const isExpanded   = params.rowMeta?.isExpanded   ?? false;
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: depth * 16 }}>
                    {hasChildren && (
                        <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    )}
                    <span>{params.value as string}</span>
                    {params.rowMeta && hasChildren && (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: 4 }}>
                            ({params.rowMeta.descendantCount ?? 0} items)
                        </span>
                    )}
                </div>
            );
        },
    };
});

export default function TreeDataExample() {

    const [rows] = useState(() => generateEmployees(100));
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25
    });
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

    return (
        <DocsLayout
            title="Tree Data"
            description="Hierarchical data display with expand/collapse controls. Define parent-child relationships and OpenGridX renders the tree structure automatically."
            sourceCode={sourceCode}
        >
            <p style={{ marginBottom: 12, color: '#475569', fontSize: '0.875rem' }}>
                The <strong>Name</strong> column uses <code>params.rowMeta</code> (v1.1.0) to read{' '}
                <code>treeDepth</code>, <code>hasChildren</code>, and <code>isExpanded</code> — rendered
                without touching the row object&apos;s underscore fields.
            </p>
            <DataGrid
                rows={rows}
                columns={treeColumns}
                autoHeight
                treeData
                getTreeDataPath={(row: Employee) => row.path}
                checkboxSelection
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={setSelectedRows}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />
        </DocsLayout>
    );
}
