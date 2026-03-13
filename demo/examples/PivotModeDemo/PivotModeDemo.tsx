
import React, { useState } from 'react';
import { DataGrid, GridToolbar, GridTooltip } from '@opencorestack/opengridx';
import type { GridColDef, GridPivotModel, GridPivotValueField } from '@opencorestack/opengridx';
import { exportToCsv, exportToExcel, exportToJson, printGrid } from '@opencorestack/opengridx';
import './PivotModeDemo.css';

type SaleRow = {
    id: number;
    region: string;
    country: string;
    product: string;
    category: string;
    quarter: string;
    year: number;
    revenue: number;
    units: number;
    cost: number;
    profit: number;
    margin: number;
    rep: string;
};

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
const COUNTRIES: Record<string, string[]> = {
    'North America': ['USA', 'Canada', 'Mexico'],
    'Europe': ['UK', 'Germany', 'France', 'Spain'],
    'Asia Pacific': ['Japan', 'Australia', 'Singapore', 'India'],
    'Latin America': ['Brazil', 'Argentina', 'Chile'],
};
const PRODUCTS = ['Laptop Pro', 'Tablet Plus', 'Phone Ultra', 'Monitor 4K', 'Keyboard Elite'];
const CATEGORIES: Record<string, string> = {
    'Laptop Pro': 'Computing',
    'Tablet Plus': 'Mobile',
    'Phone Ultra': 'Mobile',
    'Monitor 4K': 'Peripherals',
    'Keyboard Elite': 'Peripherals',
};
const REPS = ['Alice Johnson', 'Bob Martinez', 'Carol Smith', 'David Lee', 'Emma Wilson',
    'Frank Chen', 'Grace Kim', 'Henry Brown'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const YEARS = [2022, 2023, 2024];

function seededRand(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

let idCounter = 1;
const rng = seededRand(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

const RAW_ROWS: SaleRow[] = [];
for (const year of YEARS) {
    for (const quarter of QUARTERS) {
        for (const region of REGIONS) {
            const countries = COUNTRIES[region];
            for (const country of countries) {
                for (const product of PRODUCTS) {
                    const units = Math.round(rng() * 500 + 50);
                    const revenue = Math.round(units * (rng() * 2000 + 500));
                    const cost = Math.round(revenue * (rng() * 0.3 + 0.45));
                    const profit = revenue - cost;
                    const margin = parseFloat(((profit / revenue) * 100).toFixed(1));
                    RAW_ROWS.push({
                        id: idCounter++,
                        region,
                        country,
                        product,
                        category: CATEGORIES[product],
                        quarter,
                        year,
                        revenue,
                        units,
                        cost,
                        profit,
                        margin,
                        rep: pick(REPS),
                    });
                }
            }
        }
    }
}

const SOURCE_COLUMNS: GridColDef<SaleRow>[] = [
    { field: 'region', headerName: 'Region', width: 150 },
    { field: 'country', headerName: 'Country', width: 130 },
    { field: 'product', headerName: 'Product', width: 140 },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'quarter', headerName: 'Quarter', width: 90 },
    { field: 'year', headerName: 'Year', width: 80, type: 'number' },
    {
        field: 'revenue',
        headerName: 'Revenue ($)',
        width: 130,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => value != null ? `$${Number(value).toLocaleString()}` : '—',
    },
    {
        field: 'units',
        headerName: 'Units Sold',
        width: 120,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => value != null ? Number(value).toLocaleString() : '—',
    },
    {
        field: 'cost',
        headerName: 'Cost ($)',
        width: 120,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => value != null ? `$${Number(value).toLocaleString()}` : '—',
    },
    {
        field: 'profit',
        headerName: 'Profit ($)',
        width: 120,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => value != null ? `$${Number(value).toLocaleString()}` : '—',
    },
    {
        field: 'margin',
        headerName: 'Margin %',
        width: 110,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => value != null ? `${Number(value).toFixed(1)}%` : '—',
    },
    { field: 'rep', headerName: 'Sales Rep', width: 150 },
];

const PRESETS: { label: string; model: GridPivotModel }[] = [
    {
        label: 'Revenue by Region & Quarter',
        model: {
            rowFields: ['region'],
            columnFields: ['quarter'],
            valueFields: [{ field: 'revenue', aggFn: 'sum' }],
        },
    },
    {
        label: 'Revenue & Profit by Product & Year',
        model: {
            rowFields: ['product'],
            columnFields: ['year'],
            valueFields: [
                { field: 'revenue', aggFn: 'sum' },
                { field: 'profit', aggFn: 'sum' },
            ],
        },
    },
    {
        label: 'Units by Category & Quarter',
        model: {
            rowFields: ['category'],
            columnFields: ['quarter'],
            valueFields: [{ field: 'units', aggFn: 'sum' }],
        },
    },
    {
        label: 'Avg Margin by Region & Product',
        model: {
            rowFields: ['region', 'product'],
            columnFields: [],
            valueFields: [{ field: 'margin', aggFn: 'avg' }],
        },
    },
];

interface ExportToolbarProps {
    apiRef?: any;
    fallbackRows: any[];
    fallbackColumns: GridColDef[];
}

function ExportToolbar({ apiRef, fallbackRows, fallbackColumns }: ExportToolbarProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const getRows = () => apiRef?.current?.getVisibleRows?.() || fallbackRows;
    const getColumns = () => apiRef?.current?.getVisibleColumns?.() || fallbackColumns;
    const getAgg = () => apiRef?.current?.getAggregationResult?.() || null;
    const getAggModel = () => apiRef?.current?.getAggregationModel?.() || null;

    const performPrint = async () => {
        setIsPrinting(true);
        try {
            await printGrid(getRows(), getColumns(), {
                title: 'Pivot Data Export',
                aggregationResult: getAgg(),
                aggregationModel: getAggModel(),
            });
        } catch (error) {
            console.error('Print failed:', error);
        } finally {
            setIsPrinting(false);
        }
    };

    const handleExportClick = (format: 'csv' | 'excel' | 'json' | 'print') => {
        const currentRows = getRows();
        const currentCols = getColumns();
        const aggResult = getAgg();
        const aggModel = getAggModel();

        if (format === 'csv') exportToCsv(currentRows, currentCols, { fileName: 'pivot-export.csv', aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'excel') exportToExcel(currentRows, currentCols, { fileName: 'pivot-export.xlsx', sheetName: 'Pivot Data', aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'json') exportToJson(currentRows, currentCols, { fileName: 'pivot-export.json', pretty: true, aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'print') performPrint();
        setShowMenu(false);
    };

    const Icons = {
        Csv: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h8"></path></svg>,
        Excel: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><rect x="8" y="13" width="8" height="4"></rect></svg>,
        Json: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"></path></svg>,
        Print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
        Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    };

    return (
        <React.Fragment>
            {showMenu && (
                <div
                    className="pivot-export-overlay"
                    onClick={() => setShowMenu(false)}
                />
            )}
            <div className="ogx-toolbar__dropdown-wrapper">
                <GridTooltip title="Export">
                    <button
                        className={`ogx-toolbar__icon-btn${showMenu ? ' ogx-toolbar__icon-btn--active' : ''}`}
                        onClick={() => setShowMenu(!showMenu)}
                        disabled={isPrinting}
                        aria-label="Export Options"
                    >
                        {isPrinting ? (
                            <span className="toolbar-spinner"></span>
                        ) : (
                            Icons.Download
                        )}
                    </button>
                </GridTooltip>

                {showMenu && (
                    <div className="ogx-toolbar__panel pivot-export-menu">
                        <button
                            onClick={() => handleExportClick('csv')}
                            className="ogx-menu-item"
                        >
                            <span className="ogx-menu-item__icon">{Icons.Csv}</span>
                            CSV
                        </button>
                        <button
                            onClick={() => handleExportClick('excel')}
                            className="ogx-menu-item"
                        >
                            <span className="ogx-menu-item__icon">{Icons.Excel}</span>
                            Excel
                        </button>
                        <button
                            onClick={() => handleExportClick('json')}
                            className="ogx-menu-item"
                        >
                            <span className="ogx-menu-item__icon">{Icons.Json}</span>
                            JSON
                        </button>
                        <div className="ogx-menu-divider" />
                        <button
                            onClick={() => handleExportClick('print')}
                            className="ogx-menu-item"
                        >
                            <span className="ogx-menu-item__icon">{Icons.Print}</span>
                            Print
                        </button>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}

export default function PivotModeDemo() {
    const [pivotMode, setPivotMode] = useState(true);
    const [pivotModel, setPivotModel] = useState<GridPivotModel>(PRESETS[0].model);

    const CustomToolbar = (props: any) => {
        return (
            <GridToolbar
                {...props}
                rightContent={
                    <div className="pivot-toolbar-right">
                        <ExportToolbar
                            apiRef={props.apiRef}
                            fallbackRows={RAW_ROWS}
                            fallbackColumns={SOURCE_COLUMNS as any}
                        />
                    </div>
                }
            />
        );
    };

    return (
        <div className="pivot-demo-container">

            {/* Header */}
            <div className="pivot-demo-header">
                <h2>Pivot Mode</h2>
                <p>
                    {RAW_ROWS.length.toLocaleString()} rows · {SOURCE_COLUMNS.length} columns.
                    Use the <strong>toolbar icon</strong> to configure Row / Column / Value fields,
                    or pick a preset below.
                </p>
            </div>

            {/* Controls */}
            <div className="pivot-demo-controls">
                <label className="pivot-mode-toggle">
                    <input
                        type="checkbox"
                        checked={pivotMode}
                        onChange={(e) => setPivotMode(e.target.checked)}
                    />
                    Pivot Mode
                </label>

                <span className="pivot-control-separator">|</span>

                <span className="pivot-preset-label">
                    Presets:
                </span>

                {PRESETS.map((p) => {
                    const isActive = JSON.stringify(pivotModel) === JSON.stringify(p.model);
                    return (
                        <button
                            key={p.label}
                            onClick={() => { setPivotModel(p.model); setPivotMode(true); }}
                            className={`pivot-preset-btn ${isActive ? 'pivot-preset-btn--active' : ''}`}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Pivot State Chips */}
            {pivotMode && (
                <div className="pivot-state-chips">
                    {pivotModel.rowFields.length > 0 && (
                        <span className="pivot-chip pivot-chip--row">
                            Rows: {pivotModel.rowFields.join(', ')}
                        </span>
                    )}
                    {pivotModel.columnFields.length > 0 && (
                        <span className="pivot-chip pivot-chip--col">
                            Cols: {pivotModel.columnFields.join(', ')}
                        </span>
                    )}
                    {pivotModel.valueFields.map((v: GridPivotValueField) => (
                        <span key={v.field} className="pivot-chip pivot-chip--val">
                            {v.field} ({v.aggFn})
                        </span>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="pivot-grid-wrapper">
                <DataGrid
                    rows={RAW_ROWS}
                    columns={SOURCE_COLUMNS}
                    pivotMode={pivotMode}
                    pivotModel={pivotModel}
                    onPivotModelChange={setPivotModel}
                    pagination
                    paginationModel={{ page: 0, pageSize: 50 }}
                    pageSizeOptions={[25, 50, 100]}
                    slots={{ toolbar: CustomToolbar }}
                    height={500}
                />
            </div>
        </div>
    );
}
