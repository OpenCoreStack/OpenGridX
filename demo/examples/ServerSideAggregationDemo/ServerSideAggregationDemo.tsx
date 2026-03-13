
import { useState, useMemo } from 'react';
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,
    GridAggregationModel,
    GridAggregationResult,
} from '@opencorestack/opengridx';
import './ServerSideAggregationDemo.css';

type Employee = {
    id: number;
    name: string;
    department: string;
    role: string;
    location: string;
    salary: number;
    bonus: number;
    totalComp: number;
    age: number;
    yearsExp: number;
    projectsCompleted: number;
    performanceScore: number;
    active: boolean;
};

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const ROLES = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'];
const LOCATIONS = ['New York', 'San Francisco', 'Austin', 'Chicago', 'London', 'Berlin'];

function seededRandom(seed: number) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

const ALL_EMPLOYEES: Employee[] = Array.from({ length: 500 }, (_, i) => {
    const salary = 40_000 + Math.floor(seededRandom(i * 3) * 120_000);
    const bonus = Math.floor(seededRandom(i * 7 + 1) * 25_000);
    const projects = 1 + Math.floor(seededRandom(i * 11 + 2) * 30);
    const perfScore = Math.round((2 + seededRandom(i * 13 + 3) * 3) * 10) / 10;
    return {
        id: i + 1,
        name: `Employee ${i + 1}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        role: ROLES[i % ROLES.length],
        location: LOCATIONS[Math.floor(seededRandom(i * 5) * LOCATIONS.length)],
        salary,
        bonus,
        totalComp: salary + bonus,
        age: 22 + Math.floor(seededRandom(i * 17 + 4) * 40),
        yearsExp: Math.floor(seededRandom(i * 19 + 5) * 20),
        projectsCompleted: projects,
        performanceScore: perfScore,
        active: i % 5 !== 0,
    };
});

const mockServer = {
    async getRows(params: GridGetRowsParams): Promise<GridGetRowsResponse<Employee>> {
        await new Promise((r) => setTimeout(r, 500));

        let data = [...ALL_EMPLOYEES];

        if (params.sortModel.length > 0) {
            const { field, sort } = params.sortModel[0];
            data.sort((a, b) => {
                const av = (a as any)[field];
                const bv = (b as any)[field];
                if (av < bv) return sort === 'asc' ? -1 : 1;
                if (av > bv) return sort === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const rowCount = data.length;

        const aggregationResults: GridAggregationResult = {};
        if (params.aggregationModel) {
            for (const [field, fn] of Object.entries(params.aggregationModel)) {
                const values = data.map((r) => (r as any)[field]).filter((v) => v != null);
                if (fn === 'sum') aggregationResults[field] = values.reduce((a, b) => a + Number(b), 0);
                else if (fn === 'avg') aggregationResults[field] = values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : null;
                else if (fn === 'count') aggregationResults[field] = values.length;
                else if (fn === 'min') aggregationResults[field] = Math.min(...values.map(Number));
                else if (fn === 'max') aggregationResults[field] = Math.max(...values.map(Number));
            }
        }

        const page = data.slice(params.startRow, params.endRow);
        return { rows: page, rowCount, aggregationResults };
    },
};

const fmt$ = ({ value }: { value: any }) =>
    typeof value === 'number' ? `$${Math.round(value).toLocaleString('en-US')}` : String(value ?? '');

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 65 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'role', headerName: 'Role', width: 100 },
    { field: 'location', headerName: 'Location', width: 130 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'bonus',
        headerName: 'Bonus',
        width: 110,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'totalComp',
        headerName: 'Total Comp',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'age',
        headerName: 'Age',
        width: 80,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'yearsExp',
        headerName: 'Experience (yrs)',
        width: 150,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'projectsCompleted',
        headerName: 'Projects',
        width: 100,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'performanceScore',
        headerName: 'Perf. Score',
        width: 115,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: ({ value }) => typeof value === 'number' ? value.toFixed(2) : String(value ?? ''),
    },
    {
        field: 'active',
        headerName: 'Active',
        width: 80,
        type: 'boolean',
        renderCell: ({ value }) => (value ? '✅' : '❌'),
    },
];

export default function ServerSideAggregationDemo() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
        salary: 'sum',
        bonus: 'sum',
        totalComp: 'sum',
        age: 'avg',
        yearsExp: 'avg',
        performanceScore: 'avg',
    });

    const dataSource: GridDataSource<Employee> = useMemo(
        () => ({ getRows: (p) => mockServer.getRows(p) }),
        []
    );

    return (
        <div className="ss-agg-container">
            <div className="ss-agg-header">
                <h2>Server-Side Aggregation</h2>
                <p>
                    Aggregations are computed by the server over the <strong>full dataset</strong> (500 rows),
                    not just the current page. Click the <strong>Σ icon</strong> in the toolbar to configure.
                </p>
            </div>

            <div className="ss-agg-grid-wrapper">
                <DataGrid<Employee>
                    rows={[]}
                    columns={columns}
                    dataSource={dataSource}
                    pagination
                    paginationMode="server"
                    sortingMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    aggregationModel={aggregationModel}
                    onAggregationModelChange={setAggregationModel}
                    getAggregationPosition={() => 'footer'}
                    slots={{ toolbar: GridToolbar }}
                    height={520}
                />
            </div>

            <div className="ss-agg-info-box">
                <strong>How it works:</strong> Each page request sends the <code>aggregationModel</code> to
                the server. The server computes aggregations over all 500 rows and returns{' '}
                <code>aggregationResults</code> — so the footer total is always accurate regardless of the
                current page.
            </div>
        </div>
    );
}
