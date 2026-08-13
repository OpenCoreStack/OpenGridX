import { useCallback, useMemo, useState } from 'react';
import {
    DataGrid, GridToolbar, exportToCsv, useGridApiRef,
    type GridColDef, type GridFilterModel, type ToolbarButtonRenderProps,
    type ToolbarQuickFilterRenderProps,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ToolbarCustomizationDemo.tsx?raw';
import './ToolbarCustomizationDemo.css';

interface SaleRow {
    id: number;
    product: string;
    category: string;
    region: string;
    revenue: number;
    units: number;
}

const rows: SaleRow[] = [
    { id: 1, product: 'Analytics Pro', category: 'SaaS', region: 'North America', revenue: 48000, units: 120 },
    { id: 2, product: 'Data Pipeline', category: 'Infrastructure', region: 'Europe', revenue: 31500, units: 63 },
    { id: 3, product: 'ML Workbench', category: 'SaaS', region: 'Asia Pacific', revenue: 72000, units: 180 },
    { id: 4, product: 'Cloud Storage', category: 'Infrastructure', region: 'North America', revenue: 19200, units: 96 },
    { id: 5, product: 'BI Dashboard', category: 'SaaS', region: 'Europe', revenue: 56000, units: 140 },
    { id: 6, product: 'Event Stream', category: 'Infrastructure', region: 'Asia Pacific', revenue: 24750, units: 55 },
    { id: 7, product: 'Data Catalog', category: 'SaaS', region: 'North America', revenue: 38400, units: 96 },
    { id: 8, product: 'Query Engine', category: 'Infrastructure', region: 'Europe', revenue: 61200, units: 153 },
];

const columns: GridColDef<SaleRow>[] = [
    { field: 'product', headerName: 'Product', flex: 1, minWidth: 160 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'region', headerName: 'Region', width: 160 },
    { field: 'revenue', headerName: 'Revenue ($)', width: 140, type: 'number', aggregable: true },
    { field: 'units', headerName: 'Units Sold', width: 120, type: 'number', aggregable: true },
];

// ─── Shared SVG icons ──────────────────────────────────────────────────────

function SearchIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function ColumnsIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <line x1="8.5" y1="4" x2="8.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.5" y1="4" x2="15.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function FilterIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

function SigmaIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 4H6l6 8-6 8h12" />
        </svg>
    );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

// ─── Example 1: Branded dark toolbar ──────────────────────────────────────

function BrandedSearchBar({ value, onChange }: ToolbarQuickFilterRenderProps) {
    return (
        <div className="tcd-search">
            <SearchIcon color="rgba(255,255,255,0.6)" size={15} />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Search products…"
                aria-label="Quick search"
            />
        </div>
    );
}

function BrandedColumnsButton({ onClick, isOpen }: ToolbarButtonRenderProps) {
    return (
        <button
            className={`tcd-btn${isOpen ? ' tcd-btn--active' : ''}`}
            onClick={onClick}
            aria-label="Manage columns"
        >
            <ColumnsIcon />
            Columns
        </button>
    );
}

function BrandedFilterButton({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
    return (
        <button
            className={`tcd-btn${isOpen ? ' tcd-btn--active' : ''}`}
            onClick={onClick}
            aria-label="Filters"
        >
            <FilterIcon />
            Filters
            {activeCount > 0 && <span className="tcd-btn__badge">{activeCount}</span>}
        </button>
    );
}

function BrandedAggregationButton({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
    return (
        <button
            className={`tcd-btn${isOpen ? ' tcd-btn--active' : ''}`}
            onClick={onClick}
            aria-label="Summaries"
        >
            <SigmaIcon />
            Summaries
            {activeCount > 0 && <span className="tcd-btn__badge">{activeCount}</span>}
        </button>
    );
}

function BrandedExportButton({ apiRef }: { apiRef: ReturnType<typeof useGridApiRef> }) {
    const handleExport = useCallback(() => {
        exportToCsv(apiRef.current?.getAllRows?.() ?? rows, columns, { filename: 'sales-report' });
    }, [apiRef]);

    return (
        <button className="tcd-export-btn" onClick={handleExport} aria-label="Export to CSV">
            <DownloadIcon />
            Export CSV
        </button>
    );
}

function BrandedToolbarDemo() {
    const apiRef = useGridApiRef();
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] });
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});
    const [aggregationModel, setAggregationModel] = useState<Record<string, string>>({});

    const renderExportButton = useCallback(
        () => <BrandedExportButton apiRef={apiRef} />,
        [apiRef]
    );

    const slots = useMemo(() => ({ toolbar: GridToolbar }), []);
    const slotProps = useMemo(() => ({
        toolbar: {
            className: 'tcd-toolbar-branded',
            filterModel,
            onFilterModelChange: setFilterModel,
            columnVisibilityModel,
            onColumnVisibilityModelChange: setColumnVisibilityModel,
            aggregationModel,
            onAggregationModelChange: setAggregationModel,
            renderQuickFilter: (props: ToolbarQuickFilterRenderProps) => <BrandedSearchBar {...props} />,
            renderColumnsButton: (props: ToolbarButtonRenderProps) => <BrandedColumnsButton {...props} />,
            renderFilterButton: (props: ToolbarButtonRenderProps) => <BrandedFilterButton {...props} />,
            renderAggregationButton: (props: ToolbarButtonRenderProps) => <BrandedAggregationButton {...props} />,
            renderExportButton,
        },
    }), [filterModel, columnVisibilityModel, aggregationModel, renderExportButton]);

    return (
        <div style={{ height: 380, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                apiRef={apiRef}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                aggregationModel={aggregationModel}
                onAggregationModelChange={setAggregationModel}
                slots={slots}
                slotProps={slotProps}
            />
        </div>
    );
}

// ─── Example 2: Custom search + export on a plain-themed toolbar ───────────

function PlainSearchBar({ value, onChange }: ToolbarQuickFilterRenderProps) {
    return (
        <div className="tcd-plain-search">
            <SearchIcon size={15} color="#94a3b8" />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Search…"
                aria-label="Quick search"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

function PlainColumnsButton({ onClick, isOpen }: ToolbarButtonRenderProps) {
    return (
        <button className={`tcd-plain-btn${isOpen ? ' tcd-plain-btn--active' : ''}`} onClick={onClick}>
            <ColumnsIcon /> Columns
        </button>
    );
}

function PlainFilterButton({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
    return (
        <button className={`tcd-plain-btn${isOpen ? ' tcd-plain-btn--active' : ''}`} onClick={onClick}>
            <FilterIcon /> Filters
            {activeCount > 0 && <span className="tcd-plain-btn__count">{activeCount}</span>}
        </button>
    );
}

function PlainAggButton({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
    return (
        <button className={`tcd-plain-btn${isOpen ? ' tcd-plain-btn--active' : ''}`} onClick={onClick}>
            <SigmaIcon /> Summaries
            {activeCount > 0 && <span className="tcd-plain-btn__count">{activeCount}</span>}
        </button>
    );
}

function PlainExportButton() {
    const handleExport = useCallback(() => {
        exportToCsv(rows, columns, { filename: 'sales-data' });
    }, []);

    return (
        <button className="tcd-plain-export-btn" onClick={handleExport}>
            <DownloadIcon /> Export CSV
        </button>
    );
}

function PlainToolbarDemo() {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] });
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});
    const [aggregationModel, setAggregationModel] = useState<Record<string, string>>({});

    const slots = useMemo(() => ({ toolbar: GridToolbar }), []);
    const slotProps = useMemo(() => ({
        toolbar: {
            filterModel,
            onFilterModelChange: setFilterModel,
            columnVisibilityModel,
            onColumnVisibilityModelChange: setColumnVisibilityModel,
            aggregationModel,
            onAggregationModelChange: setAggregationModel,
            renderQuickFilter: (props: ToolbarQuickFilterRenderProps) => <PlainSearchBar {...props} />,
            renderColumnsButton: (props: ToolbarButtonRenderProps) => <PlainColumnsButton {...props} />,
            renderFilterButton: (props: ToolbarButtonRenderProps) => <PlainFilterButton {...props} />,
            renderAggregationButton: (props: ToolbarButtonRenderProps) => <PlainAggButton {...props} />,
            renderExportButton: () => <PlainExportButton />,
        },
    }), [filterModel, columnVisibilityModel, aggregationModel]);

    return (
        <div style={{ height: 360, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                aggregationModel={aggregationModel}
                onAggregationModelChange={setAggregationModel}
                slots={slots}
                slotProps={slotProps}
            />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ToolbarCustomizationDemo() {
    return (
        <DocsLayout
            title="Toolbar Customization"
            description="Replace individual toolbar controls — search bar, column button, filter button, aggregation button — with your own components using render prop slots. The panels continue to work; only the trigger elements change."
            sourceCode={sourceCode}
        >
            <div className="tcd-section">
                <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>Branded dark toolbar</h3>
                    <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#64748b' }}>
                        Uses <code>className="tcd-toolbar-branded"</code> on <code>GridToolbar</code> plus render props for every control.
                        Panels (columns, filters, aggregation) open normally — only the buttons are swapped.
                    </p>
                    <BrandedToolbarDemo />
                </div>

                <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>Custom buttons, light theme</h3>
                    <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#64748b' }}>
                        Same render props, different styles — and an Export CSV button added via <code>renderExportButton</code>.
                    </p>
                    <PlainToolbarDemo />
                </div>
            </div>
        </DocsLayout>
    );
}
