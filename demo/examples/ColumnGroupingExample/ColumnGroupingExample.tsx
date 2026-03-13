
import { useMemo } from 'react';
import { DataGrid, GridColDef, GridColumnGroupingModel } from '@opencorestack/opengridx';
import './ColumnGroupingExample.css';

// ─── Shared formatter ─────────────────────────────────────────────────────────
const fmt = (v: number) => `$${v.toLocaleString()}`;

// ─── Single-level example data ────────────────────────────────────────────────

interface QuarterlySales {
    id: number;
    product: string;
    q1Sales: number; q1Target: number;
    q2Sales: number; q2Target: number;
    q3Sales: number; q3Target: number;
    q4Sales: number; q4Target: number;
}

const rows1: QuarterlySales[] = [
    { id: 1, product: 'Laptops', q1Sales: 45000, q1Target: 50000, q2Sales: 52000, q2Target: 55000, q3Sales: 48000, q3Target: 50000, q4Sales: 55000, q4Target: 60000 },
    { id: 2, product: 'Tablets', q1Sales: 23000, q1Target: 25000, q2Sales: 28000, q2Target: 30000, q3Sales: 25000, q3Target: 27000, q4Sales: 30000, q4Target: 32000 },
    { id: 3, product: 'Phones', q1Sales: 67000, q1Target: 70000, q2Sales: 72000, q2Target: 75000, q3Sales: 69000, q3Target: 72000, q4Sales: 75000, q4Target: 80000 },
    { id: 4, product: 'Monitors', q1Sales: 12000, q1Target: 15000, q2Sales: 14000, q2Target: 16000, q3Sales: 13000, q3Target: 15000, q4Sales: 16000, q4Target: 18000 },
    { id: 5, product: 'Keyboards', q1Sales: 8000, q1Target: 10000, q2Sales: 9500, q2Target: 11000, q3Sales: 8800, q3Target: 10000, q4Sales: 10500, q4Target: 12000 },
];

const columns1: GridColDef<QuarterlySales>[] = [
    { field: 'product', headerName: 'Product', width: 140 },
    { field: 'q1Sales', headerName: 'Sales', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q1Target', headerName: 'Target', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q2Sales', headerName: 'Sales', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q2Target', headerName: 'Target', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q3Sales', headerName: 'Sales', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q3Target', headerName: 'Target', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q4Sales', headerName: 'Sales', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
    { field: 'q4Target', headerName: 'Target', width: 110, type: 'number', headerAlign: 'right', align: 'right', valueFormatter: (p) => fmt(p.value) },
];

const groupModel1: GridColumnGroupingModel = [
    { groupId: 'q1', headerName: 'Q1 2024', children: ['q1Sales', 'q1Target'] },
    { groupId: 'q2', headerName: 'Q2 2024', children: ['q2Sales', 'q2Target'] },
    { groupId: 'q3', headerName: 'Q3 2024', children: ['q3Sales', 'q3Target'] },
    { groupId: 'q4', headerName: 'Q4 2024', children: ['q4Sales', 'q4Target'] },
];

// ─── Multi-level example data ─────────────────────────────────────────────────

interface YearlySales {
    id: number;
    product: string;
    y23q1s: number; y23q1t: number;
    y23q2s: number; y23q2t: number;
    y24q1s: number; y24q1t: number;
    y24q2s: number; y24q2t: number;
}

const rows2: YearlySales[] = [
    { id: 1, product: 'Laptops', y23q1s: 45000, y23q1t: 50000, y23q2s: 52000, y23q2t: 55000, y24q1s: 58000, y24q1t: 60000, y24q2s: 62000, y24q2t: 65000 },
    { id: 2, product: 'Tablets', y23q1s: 23000, y23q1t: 25000, y23q2s: 28000, y23q2t: 30000, y24q1s: 32000, y24q1t: 35000, y24q2s: 36000, y24q2t: 38000 },
    { id: 3, product: 'Phones', y23q1s: 67000, y23q1t: 70000, y23q2s: 72000, y23q2t: 75000, y24q1s: 78000, y24q1t: 80000, y24q2s: 82000, y24q2t: 85000 },
    { id: 4, product: 'Monitors', y23q1s: 12000, y23q1t: 15000, y23q2s: 14000, y23q2t: 16000, y24q1s: 16000, y24q1t: 18000, y24q2s: 18000, y24q2t: 20000 },
];

const columns2: GridColDef<YearlySales>[] = [
    { field: 'product', headerName: 'Product', width: 140 },
    { field: 'y23q1s', headerName: 'Sales', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y23q1t', headerName: 'Target', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y23q2s', headerName: 'Sales', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y23q2t', headerName: 'Target', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y24q1s', headerName: 'Sales', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y24q1t', headerName: 'Target', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y24q2s', headerName: 'Sales', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
    { field: 'y24q2t', headerName: 'Target', type: 'number', headerAlign: 'right', align: 'right', width: 150, valueFormatter: (p) => fmt(p.value) },
];

// Two-level nesting: Year → Quarter → leaf columns
const groupModel2: GridColumnGroupingModel = [
    {
        groupId: 'y2023',
        headerName: '📊 2023',
        children: [
            { groupId: 'y23q1', headerName: 'Q1', children: ['y23q1s', 'y23q1t'] },
            { groupId: 'y23q2', headerName: 'Q2', children: ['y23q2s', 'y23q2t'] },
        ],
    },
    {
        groupId: 'y2024',
        headerName: '🚀 2024',
        children: [
            { groupId: 'y24q1', headerName: 'Q1', children: ['y24q1s', 'y24q1t'] },
            { groupId: 'y24q2', headerName: 'Q2', children: ['y24q2s', 'y24q2t'] },
        ],
    },
];

// ─── Demo component ───────────────────────────────────────────────────────────

export default function ColumnGroupingExample() {
    // Stable column references (module-level consts are already stable, useMemo
    // here just for consistency with other demos)
    const stableColumns1 = useMemo(() => columns1, []);
    const stableColumns2 = useMemo(() => columns2, []);

    return (
        <div className="col-group-container">
            <h2>Column Grouping</h2>
            <p className="col-group-description">
                Native column group headers rendered inside the DataGrid's sticky header block.
                Group spans update live on column resize. Reordering is disabled while groups are active.
            </p>

            {/* ── Single level ── */}
            <div className="col-group-section">
                <h3>1. Single-level grouping</h3>
                <p className="col-group-subtext">
                    Quarterly sales data — Q1–Q4 groups, each spanning Sales &amp; Target columns.
                    Try resizing any column to see the group header adjust.
                </p>
                <DataGrid<QuarterlySales>
                    rows={rows1}
                    columns={stableColumns1}
                    columnGroupingModel={groupModel1}
                    autoHeight
                    rowHeight={48}
                    headerHeight={48}
                />
            </div>

            {/* ── Multi level ── */}
            <div className="col-group-section">
                <h3>2. Multi-level grouping (Year → Quarter → Metric)</h3>
                <p className="col-group-subtext">
                    Three header levels rendered natively: Year at the top, Quarter in the middle,
                    individual column headers at the bottom.
                </p>
                <DataGrid<YearlySales>
                    rows={rows2}
                    columns={stableColumns2}
                    columnGroupingModel={groupModel2}
                    autoHeight
                    rowHeight={48}
                    headerHeight={48}
                />
            </div>

            <div className="col-group-usage">
                <strong>Usage:</strong>
                <pre>{`<DataGrid
  columns={columns}
  rows={rows}
  columnGroupingModel={[
    { groupId: 'q1', headerName: 'Q1 2024', children: ['q1Sales', 'q1Target'] },
    // nested groups:
    { groupId: 'y2023', headerName: '2023', children: [
        { groupId: 'y23q1', headerName: 'Q1', children: ['field1', 'field2'] },
    ]},
  ]}
/>`}</pre>
            </div>
        </div>
    );
}
