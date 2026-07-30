
import { useState, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef, GridDataSource, GridGetRowsParams, GridPaginationModel } from '@opencorestack/opengridx';
import './InfiniteScrollDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './InfiniteScrollDemo.tsx?raw';

interface PersonRow {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    joined: string;
}

const TOTAL = 15000;
const mockServerData: PersonRow[] = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    joined: new Date(2020, 0, 1 + (i % 365)).toLocaleDateString(),
}));

const columns: GridColDef<PersonRow>[] = [
    { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 280, sortable: true },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'joined', headerName: 'Joined', width: 150 },
];

const EMPTY_ROWS: PersonRow[] = [];

export default function InfiniteScrollDemo() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 50,
    });

    const dataSource: GridDataSource<PersonRow> = useMemo(() => ({
        getRows: async (params: GridGetRowsParams) => {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 400));

            const { startRow, endRow, sortModel } = params;
            const rows = [...mockServerData];

            if (sortModel && sortModel.length > 0) {
                const { field, sort } = sortModel[0];
                rows.sort((a: PersonRow, b: PersonRow) => {
                    const valA = a[field as keyof PersonRow] as string | number;
                    const valB = b[field as keyof PersonRow] as string | number;
                    if (valA < valB) return sort === 'asc' ? -1 : 1;
                    if (valA > valB) return sort === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            return {
                rows: rows.slice(startRow, endRow),
                rowCount: TOTAL,
            };
        }
    }), []);

    // When user scrolls to the bottom, increment page to fetch next chunk
    const handleScrollEnd = useCallback(() => {
        setPaginationModel(prev => ({ ...prev, page: prev.page + 1 }));
    }, []);

    return (
        <DocsLayout
            title="Infinite Scroll"
            description="Automatically fetch the next page of rows as the user scrolls toward the bottom. No pagination UI — the grid grows seamlessly as data loads."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={EMPTY_ROWS}
                columns={columns}
                dataSource={dataSource}
                paginationMode="infinite"
                sortingMode="server"
                pagination={false}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onRowsScrollEnd={handleScrollEnd}
                rowHeight={48}
                height={400}
            />
        </DocsLayout>
    );
}
