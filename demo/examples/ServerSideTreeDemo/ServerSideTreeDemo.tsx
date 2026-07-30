
import { useState, useMemo, useCallback } from 'react';
import {
    DataGrid,
    GridColDef,
    GridRowModel,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,
} from '@opencorestack/opengridx';
import './ServerSideTreeDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ServerSideTreeDemo.tsx?raw';

interface MockServerRow extends GridRowModel {
    id: string;
    name: string;
    size: string;
    type: 'folder' | 'file';
    lastModified: string;
    path: string[];
    serverChildrenCount?: number;
}

const generateData = (path: string[]): MockServerRow[] => {
    const parentPath = path.join('/');
    const count = 5;
    const rows: MockServerRow[] = [];

    for (let i = 0; i < count; i++) {
        const isFolder = i < 2;
        const name = isFolder ? `Folder ${parentPath}-${i}` : `File ${parentPath}-${i}`;
        const id = parentPath ? `${parentPath}/${name}` : name;

        rows.push({
            id,
            name,
            size: isFolder ? '--' : `${Math.floor(Math.random() * 100)} KB`,
            type: isFolder ? 'folder' : 'file',
            lastModified: new Date().toISOString().split('T')[0],
            path: [...path, name],
            serverChildrenCount: isFolder ? 5 : 0
        });
    }
    return rows;
};

const mockServer = {
    getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse<MockServerRow>> => {
        console.log('Server Request:', params);
        await new Promise(resolve => setTimeout(resolve, 500));
        const { groupKeys } = params;
        const rows = generateData(groupKeys);
        return {
            rows,
            rowCount: 100
        };
    }
};

export function ServerSideTreeDemo() {
    const [rows] = useState<GridRowModel[]>([]);

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 250 },
        { field: 'size', headerName: 'Size', width: 100 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'lastModified', headerName: 'Last Modified', width: 150 }
    ];

    const dataSource: GridDataSource = useMemo(() => {
        return {
            getRows: (params) => mockServer.getRows(params)
        };
    }, []);

    const getTreeDataPath = useCallback((row: GridRowModel) => {
        return (row as MockServerRow).path;
    }, []);

    return (
        <DocsLayout
            title="Server-Side Tree"
            description="Tree data with lazy server-side child fetching. Child nodes are loaded on demand when the user expands a parent row."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                dataSource={dataSource}
                treeData
                getTreeDataPath={getTreeDataPath}
                groupingColDef={{ field: 'name', headerName: 'File System', width: 300 }}
                paginationMode="server"
                rowCount={100}
                height={600}
            />
        </DocsLayout>
    );
}
