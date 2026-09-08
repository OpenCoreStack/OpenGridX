import { useState, useCallback, useMemo } from 'react';
import {
    DataGrid,
    GridColDef,
    useGridApiRef,
    GridToolbar,
    exportToPdf,
    GridAggregationModel,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './PdfExportDemo.tsx?raw';

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    startDate: string;
    status: string;
}

const ALL_ROWS: Employee[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: ['Alice Chen', 'Bob Smith', 'Carol Davis', 'Dan Lee', 'Eve Park'][i % 5] + ` ${i + 1}`,
    department: ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations'][i % 5],
    salary: 60000 + (i % 10) * 5000,
    startDate: `${2019 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
    status: i % 3 === 0 ? 'active' : 'inactive',
}));

const COLUMNS: GridColDef<Employee>[] = [
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'department', headerName: 'Department', width: 140 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 120,
        type: 'number',
        aggregable: true,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`,
    },
    { field: 'startDate', headerName: 'Start Date', width: 120 },
    { field: 'status', headerName: 'Status', width: 100 },
];

const inputStyle: React.CSSProperties = {
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    background: '#fff',
    color: '#1e293b',
    width: 220,
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '0.8rem',
    color: '#64748b',
};

const checkLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#374151',
    userSelect: 'none',
};

export default function PdfExportDemo() {
    const apiRef = useGridApiRef();
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({ salary: 'sum' });

    const [title, setTitle] = useState('Employee Report');
    const [includeTitle, setIncludeTitle] = useState(true);
    const [logoUrl, setLogoUrl] = useState('');
    const [includeLogo, setIncludeLogo] = useState(false);
    const [includeFilters, setIncludeFilters] = useState(true);
    const [includeAgg, setIncludeAgg] = useState(true);
    const [selectedOnly, setSelectedOnly] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (!apiRef.current) return;
        setIsExporting(true);
        try {
            // getAllFilteredRows returns all filtered+sorted rows regardless of pagination,
            // so the PDF includes every row, not just the current page.
            const rows = apiRef.current.getAllFilteredRows?.() ?? apiRef.current.getVisibleRows();
            const columns = apiRef.current.getVisibleColumns();
            const filterModel = includeFilters ? (apiRef.current.getFilterModel?.() ?? null) : null;
            const selected = selectedOnly
                ? ((apiRef.current.getSelectedRows?.() ?? []) as (string | number)[])
                : undefined;

            // Compute aggregation directly from the exported rows so the footer
            // always matches the exported data, regardless of pagination state.
            let aggResult: Record<string, unknown> | null = null;
            const hasAgg = includeAgg && Object.keys(aggregationModel).length > 0;
            if (hasAgg) {
                aggResult = {};
                const rowData = rows as Record<string, unknown>[];
                for (const [field, fn] of Object.entries(aggregationModel)) {
                    const vals = rowData.map(r => r[field]);
                    if (fn === 'sum') {
                        aggResult[field] = vals.reduce((acc: number, v) => acc + Number(v ?? 0), 0);
                    } else if (fn === 'avg') {
                        const nums = vals.filter(v => v != null);
                        aggResult[field] = nums.length ? nums.reduce((acc: number, v) => acc + Number(v), 0) / nums.length : null;
                    } else if (fn === 'count') {
                        aggResult[field] = vals.filter(v => v != null).length;
                    } else if (fn === 'min') {
                        const ns = vals.map(v => Number(v)).filter(n => !isNaN(n));
                        aggResult[field] = ns.length ? Math.min(...ns) : null;
                    } else if (fn === 'max') {
                        const ns = vals.map(v => Number(v)).filter(n => !isNaN(n));
                        aggResult[field] = ns.length ? Math.max(...ns) : null;
                    }
                }
            }

            await exportToPdf(rows, columns, {
                fileName: 'employee-report',
                title: includeTitle && title.trim() ? title.trim() : undefined,
                logoUrl: includeLogo && logoUrl.trim() ? logoUrl.trim() : undefined,
                aggregationResult: aggResult,
                aggregationModel: hasAgg ? aggregationModel : null,
                filterModel,
                selectedRows: selected,
            });
        } finally {
            setIsExporting(false);
        }
    }, [apiRef, aggregationModel, includeAgg, includeFilters, includeTitle, includeLogo, selectedOnly, title, logoUrl]);

    const renderExportButton = useCallback(() => (
        <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
                padding: '6px 14px',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                opacity: isExporting ? 0.7 : 1,
            }}
        >
            {isExporting ? 'Generating…' : '⬇ Export PDF'}
        </button>
    ), [handleExport, isExporting]);

    const toolbarSlots = useMemo(() => ({ toolbar: GridToolbar }), []);
    const toolbarSlotProps = useMemo(
        () => ({ toolbar: { renderExportButton } }),
        [renderExportButton]
    );

    return (
        <DocsLayout
            title="PDF Export"
            description={`Generates a styled PDF using exportToPdf() with jsPDF + autotable. Configure options below then click Export PDF.`}
            sourceCode={sourceCode}
        >
            {/* Options panel */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginBottom: 20,
            }}>
                {/* Title */}
                <label style={labelStyle}>
                    <span>Report title</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Employee Report"
                            style={inputStyle}
                            disabled={!includeTitle}
                        />
                        <label style={checkLabelStyle}>
                            <input type="checkbox" checked={includeTitle} onChange={e => setIncludeTitle(e.target.checked)} />
                            Include
                        </label>
                    </div>
                </label>

                {/* Logo */}
                <label style={labelStyle}>
                    <span>Logo URL (PNG/JPEG)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="url"
                            value={logoUrl}
                            onChange={e => setLogoUrl(e.target.value)}
                            placeholder="https://…/logo.png"
                            style={inputStyle}
                            disabled={!includeLogo}
                        />
                        <label style={checkLabelStyle}>
                            <input type="checkbox" checked={includeLogo} onChange={e => setIncludeLogo(e.target.checked)} />
                            Include
                        </label>
                    </div>
                </label>

                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                    <label style={checkLabelStyle}>
                        <input type="checkbox" checked={includeFilters} onChange={e => setIncludeFilters(e.target.checked)} />
                        Include active filters summary
                    </label>
                    <label style={checkLabelStyle}>
                        <input type="checkbox" checked={includeAgg} onChange={e => setIncludeAgg(e.target.checked)} />
                        Include aggregation footer
                    </label>
                    <label style={checkLabelStyle}>
                        <input type="checkbox" checked={selectedOnly} onChange={e => setSelectedOnly(e.target.checked)} />
                        Export selected rows only
                    </label>
                </div>
            </div>

            <DataGrid
                apiRef={apiRef}
                rows={ALL_ROWS}
                columns={COLUMNS}
                pagination
                paginationModel={{ page: 0, pageSize: 10 }}
                checkboxSelection
                aggregationModel={aggregationModel}
                onAggregationModelChange={setAggregationModel}
                filtering
                height={480}
                slots={toolbarSlots}
                slotProps={toolbarSlotProps}
            />
        </DocsLayout>
    );
}
