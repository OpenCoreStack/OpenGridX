
import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridSortModel } from '@opencorestack/opengridx';
import './MultiSortDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './MultiSortDemo.tsx?raw';

// Focused dataset: 4 departments, distinct salaries — makes multi-sort result
// immediately readable: dept ASC + salary DESC → highest-paid per dept appears first.
const ROWS = [
    { id:  1, name: 'Alice Chen',      department: 'Engineering', salary: 120000, level: 'Senior' },
    { id:  2, name: 'Bob Martin',      department: 'Engineering', salary:  95000, level: 'Mid'    },
    { id:  3, name: 'Carol White',     department: 'Engineering', salary: 145000, level: 'Staff'  },
    { id:  4, name: 'David Kim',       department: 'Engineering', salary:  80000, level: 'Junior' },
    { id:  5, name: 'Eva Patel',       department: 'HR',          salary:  72000, level: 'Senior' },
    { id:  6, name: 'Frank Lee',       department: 'HR',          salary:  58000, level: 'Mid'    },
    { id:  7, name: 'Grace Nguyen',    department: 'HR',          salary:  65000, level: 'Senior' },
    { id:  8, name: 'Henry Walsh',     department: 'Marketing',   salary:  88000, level: 'Staff'  },
    { id:  9, name: 'Iris Santos',     department: 'Marketing',   salary:  75000, level: 'Senior' },
    { id: 10, name: 'Jack Okafor',     department: 'Marketing',   salary:  62000, level: 'Mid'    },
    { id: 11, name: 'Karen Zhou',      department: 'Sales',       salary: 105000, level: 'Staff'  },
    { id: 12, name: 'Liam Ross',       department: 'Sales',       salary:  91000, level: 'Senior' },
    { id: 13, name: 'Mia Torres',      department: 'Sales',       salary:  77000, level: 'Mid'    },
    { id: 14, name: 'Noah Bakker',     department: 'Sales',       salary:  68000, level: 'Junior' },
    { id: 15, name: 'Olivia Grant',    department: 'Engineering', salary: 110000, level: 'Senior' },
    { id: 16, name: 'Paul Dubois',     department: 'Marketing',   salary:  93000, level: 'Staff'  },
    { id: 17, name: 'Quinn Tran',      department: 'HR',          salary:  55000, level: 'Junior' },
    { id: 18, name: 'Rosa Ferreira',   department: 'Sales',       salary: 115000, level: 'Staff'  },
    { id: 19, name: 'Sam Johansson',   department: 'Engineering', salary:  70000, level: 'Junior' },
    { id: 20, name: 'Tina Yamamoto',   department: 'Marketing',   salary:  85000, level: 'Senior' },
];

const columns: GridColDef[] = [
    { field: 'name',       headerName: 'Name',       width: 170 },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'level',      headerName: 'Level',      width: 110 },
    { field: 'salary',     headerName: 'Salary',     width: 110, type: 'number' },
    { field: 'id',         headerName: 'ID',         width: 60,  sortable: false,
      description: 'Row ID — sortable: false, click should do nothing' },
];

export default function MultiSortDemo() {
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'department', sort: 'asc' },
        { field: 'salary',     sort: 'desc' },
    ]);

    return (
        <DocsLayout
            title="Multi-Column Sorting"
            description="Pass multiSort to enable single-click multi-column sorting — every click appends or cycles a column instead of replacing the sort. Numbered badges show sort priority. Clicking a column again cycles asc → desc → removed without touching other keys."
            sourceCode={sourceCode}
        >
            <div className="multi-sort-hint">
                <strong>How to verify:</strong> The grid starts sorted by Department ① asc + Salary ② desc.
                Click <em>Level</em> to add a third sort key — note the existing two stay active.
                Click <em>Department</em> again to cycle it desc, then again to remove it.
                Clicking <em>ID</em> should do nothing (sortable: false).
            </div>
            <div className="multi-sort-state">
                <span className="multi-sort-label">sortModel:</span>
                <code>{JSON.stringify(sortModel)}</code>
            </div>
            <DataGrid
                rows={ROWS}
                columns={columns}
                multiSort
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                pagination
                pageSizeOptions={[10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
                height={520}
            />
        </DocsLayout>
    );
}
