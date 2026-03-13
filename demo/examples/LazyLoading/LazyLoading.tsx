
import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import { GridColDef, GridDataSource, GridGetRowsParams, GridRowModel, GridPaginationModel } from '../../../lib/types';
import './LazyLoading.css';

interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    salary: number;
}

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 280, sortable: true },
    { field: 'department', headerName: 'Department', width: 160 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 140,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (p) => p.value != null ? `$${Number(p.value).toLocaleString()}` : ''
    }
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const allEmployees: Employee[] = Array.from({ length: 15000 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    salary: 50000 + (i % 100) * 500,
}));

const mockDataSource: GridDataSource<Employee> = {
    getRows: async (params: GridGetRowsParams) => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const { startRow, endRow, sortModel } = params;
        let rows = [...allEmployees];

        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            rows.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return sort === 'asc' ? -1 : 1;
                if (valA > valB) return sort === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return { rows: rows.slice(startRow, endRow), rowCount: rows.length };
    }
};

export default function LazyLoadingExample() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 100
    });

    return (
        <div className="lazy-loading-container">
            <h2>Lazy Loading (Server-Side Pagination)</h2>
            <p className="lazy-loading-description">
                Data is fetched page-by-page from the server. Total: 15,000 records.
                Change page or page size to trigger a new fetch.
            </p>
            <div className="lazy-loading-grid-wrapper">
                <DataGrid
                    columns={columns}
                    rows={[]}
                    dataSource={mockDataSource}
                    pagination
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[50, 100, 200]}
                    rowHeight={52}
                    headerHeight={56}
                    height={400}
                />
            </div>
        </div>
    );
}
