
import { useState } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './CustomPagination.css';

function CustomPaginationComponent(props: any) {
    const {
        page,
        pageSize,
        rowCount,
        pageSizeOptions,
        onPageChange,
        onPageSizeChange
    } = props;

    const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
    const currentPage = Math.min(page, pageCount - 1);
    const firstRowIndex = currentPage * pageSize;
    const lastRowIndex = Math.min(firstRowIndex + pageSize, rowCount);

    return (
        <div className="custom-pagination-root">
            <div className="pagination-page-size-select">
                <label className="pagination-label">
                    Rows per page:
                </label>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                    className="pagination-select"
                >
                    {pageSizeOptions.map((option: number) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pagination-info">
                {firstRowIndex + 1}–{lastRowIndex} of {rowCount}
            </div>

            <div className="pagination-actions">
                <button
                    onClick={() => onPageChange(0)}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                >
                    First
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                >
                    Prev
                </button>
                <span className="pagination-current-text">
                    Page {currentPage + 1} of {pageCount}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= pageCount - 1}
                    className="pagination-btn"
                >
                    Next
                </button>
                <button
                    onClick={() => onPageChange(pageCount - 1)}
                    disabled={currentPage >= pageCount - 1}
                    className="pagination-btn"
                >
                    Last
                </button>
            </div>
        </div>
    );
}

const rows = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: 20 + (i % 50),
    city: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][i % 5],
    department: ['HR', 'IT', 'Finance', 'Marketing', 'Sales'][i % 5],
    role: ['Manager', 'Developer', 'Designer', 'Tester', 'Analyst'][i % 5],
    salary: 5000 + (i % 10000)
}));

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 150 }
];

export default function CustomPaginationDemo() {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });

    return (
        <div className="custom-pagination-demo-container">
            <h2>Custom Pagination Example</h2>
            <p>
                This example shows how to use a custom pagination component.
                Replace <code>CustomPaginationComponent</code> with your own specialized pagination UI.
            </p>

            <DataGrid
                rows={rows}
                columns={columns}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
                height={600}
                slots={{
                    pagination: CustomPaginationComponent
                }}
            />
        </div>
    );
}
