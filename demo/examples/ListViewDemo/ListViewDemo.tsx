
import { useState, useMemo } from 'react';
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridFilterModel,
    GridListViewColDef,
    GridRenderCellParams,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './ListViewDemo.css';

import sourceCode from './ListViewDemo.tsx?raw';

// ─── Sample data ─────────────────────────────────────────────────────────────
interface Employee {
    id: number;
    name: string;
    role: string;
    department: string;
    location: string;
    salary: number;
    active: boolean;
    avatar: string;
}

const rows: Employee[] = [
    { id: 1, name: 'Jon Snow', role: 'Software Engineer', department: 'Engineering', location: 'New York', salary: 95000, active: true, avatar: 'JS' },
    { id: 2, name: 'Cersei Lannister', role: 'VP of Management', department: 'Management', location: 'London', salary: 140000, active: false, avatar: 'CL' },
    { id: 3, name: 'Jaime Lannister', role: 'Security Lead', department: 'Security', location: 'Berlin', salary: 88000, active: true, avatar: 'JL' },
    { id: 4, name: 'Arya Stark', role: 'Junior Engineer', department: 'Engineering', location: 'Austin', salary: 52000, active: true, avatar: 'AS' },
    { id: 5, name: 'Daenerys Targaryen', role: 'CEO', department: 'Management', location: 'Los Angeles', salary: 155000, active: true, avatar: 'DT' },
    { id: 6, name: 'Melisandre', role: 'Senior Consultant', department: 'Consulting', location: 'Paris', salary: 120000, active: true, avatar: 'ME' },
    { id: 7, name: 'Ferrara Clifford', role: 'Account Executive', department: 'Sales', location: 'Chicago', salary: 74000, active: true, avatar: 'FC' },
    { id: 8, name: 'Rossini Frances', role: 'IT Specialist', department: 'IT', location: 'Seattle', salary: 83000, active: true, avatar: 'RF' },
    { id: 9, name: 'Harvey Roxie', role: 'Sales Representative', department: 'Sales', location: 'Denver', salary: 68000, active: false, avatar: 'HR' },
    { id: 10, name: 'Tyrion Lannister', role: 'Strategic Advisor', department: 'Consulting', location: 'London', salary: 112000, active: true, avatar: 'TL' },
    { id: 11, name: 'Sansa Stark', role: 'HR Manager', department: 'HR', location: 'Boston', salary: 60000, active: true, avatar: 'SS' },
    { id: 12, name: 'Bran Stark', role: 'IT Analyst', department: 'IT', location: 'Portland', salary: 55000, active: false, avatar: 'BS' },
];

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 80, type: 'number' },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'role', headerName: 'Role', width: 200 },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'location', headerName: 'Location', width: 130 },
    {
        field: 'salary', headerName: 'Salary', width: 120, type: 'number', align: 'right',
        valueFormatter: ({ value }) => `$${value.toLocaleString()}`
    },
    { field: 'active', headerName: 'Active', width: 90, type: 'boolean' },
];

const deptColors: Record<string, { bg: string; text: string }> = {
    Engineering: { bg: '#dbeafe', text: '#1d4ed8' },
    Management: { bg: '#ede9fe', text: '#6d28d9' },
    Security: { bg: '#fce7f3', text: '#9d174d' },
    Consulting: { bg: '#fef3c7', text: '#92400e' },
    Sales: { bg: '#d1fae5', text: '#065f46' },
    IT: { bg: '#e0f2fe', text: '#0369a1' },
    HR: { bg: '#fee2e2', text: '#991b1b' },
};

function EmployeeCard({ row }: GridRenderCellParams<Employee>) {
    const dept = deptColors[row.department] ?? { bg: '#f3f4f6', text: '#374151' };

    return (
        <div className="employee-card-root">
            <div
                className="employee-avatar-box"
                style={{ background: dept.bg, color: dept.text, border: `2px solid ${dept.text}33` }}
            >
                {row.avatar}
            </div>

            <div className="employee-info-main">
                <div className="employee-info-top">
                    <span className="employee-name">{row.name}</span>
                    <span
                        className="employee-dept-tag"
                        style={{ background: dept.bg, color: dept.text }}
                    >
                        {row.department}
                    </span>
                    {!row.active && (
                        <span className="employee-inactive-tag">
                            Inactive
                        </span>
                    )}
                </div>
                <div className="employee-info-bottom">
                    {row.role} · {row.location}
                </div>
            </div>

            <div className="employee-salary-box">
                <div className="employee-salary-amount">
                    ${row.salary.toLocaleString()}
                </div>
                <div className="employee-salary-period">/ year</div>
            </div>
        </div>
    );
}

export default function ListViewDemo() {
    const [isListView, setIsListView] = useState(false);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const slots = useMemo(() => ({ toolbar: GridToolbar }), []);
    const listViewColDef: GridListViewColDef<Employee> = useMemo(() => ({
        field: 'listColumn',
        renderCell: (params) => <EmployeeCard {...params} />,
    }), []);


    return (
        <DocsLayout
            title="List View"
            description="Toggle between the standard data grid layout and a single-column card list layout. Ideal for mobile and small-screen experiences."
            sourceCode={sourceCode}
        >
            <div className="list-view-demo-container">
                <div className="list-view-controls">
                    <span className="list-view-label">
                        View mode:
                    </span>
                    <div className="list-view-toggle-group">
                        {[
                            {
                                mode: 'Grid',
                                icon: (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                                    </svg>
                                ),
                            },
                            {
                                mode: 'List',
                                icon: (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                                        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                                    </svg>
                                ),
                            },
                        ].map(({ mode, icon }) => {
                            const active = mode === 'List' ? isListView : !isListView;
                            return (
                                <button
                                    key={mode}
                                    onClick={() => setIsListView(mode === 'List')}
                                    className={`list-view-toggle-btn ${active ? 'active' : ''}`}
                                >
                                    {icon}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="list-view-grid-wrapper">
                    <DataGrid<Employee>
                        rows={rows}
                        columns={columns}
                        filterModel={filterModel}
                        onFilterModelChange={setFilterModel}
                        checkboxSelection
                        pagination
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 25]}
                        listView={isListView}
                        listViewColumn={listViewColDef}
                        slots={slots}
                        height={400}
                    />
                </div>

                <div className="list-view-how-it-works">
                    <strong>How it works:</strong> Pass <code>listView=&#123;true&#125;</code> and a <code>listViewColumn</code>{' '}
                    prop to switch the grid into single-column card layout. The <code>listViewColumn.renderCell</code> function
                    receives the full row data, letting you design fully custom cards.
                    Filtering, sorting, pagination and row selection all continue to work normally.
                </div>
            </div>
        </DocsLayout>
    );
}
