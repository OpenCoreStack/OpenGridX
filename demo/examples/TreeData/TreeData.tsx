
import { useState } from 'react';
import { DataGrid, GridPaginationModel, GridRowId } from '@opencorestack/opengridx';
import { generateEmployees, Employee } from '../../data/mockData';
import { allColumns } from '../../data/columns';
import './TreeData.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './TreeData.tsx?raw';

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
            <DataGrid
                rows={rows}
                columns={allColumns}
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
