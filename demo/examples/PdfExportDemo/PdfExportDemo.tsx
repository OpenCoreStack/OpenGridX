import { useState } from 'react';
import {
    DataGrid,
    GridColDef,
    useGridApiRef,
    GridToolbar,
    exportToPdf,
} from '@opencorestack/opengridx';

// 50 employee rows
const ALL_ROWS = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: ['Alice Chen', 'Bob Smith', 'Carol Davis', 'Dan Lee', 'Eve Park'][i % 5] + ` ${i + 1}`,
    department: ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations'][i % 5],
    salary: 60000 + (i % 10) * 5000,
    startDate: `${2019 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
    status: i % 3 === 0 ? 'active' : 'inactive',
}));

const COLUMNS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'department', headerName: 'Department', width: 140 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 120,
        type: 'number',
        valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`,
    },
    { field: 'startDate', headerName: 'Start Date', width: 120 },
    { field: 'status', headerName: 'Status', width: 100 },
];

// Small base64 placeholder logo (10x10 px indigo square)
const PLACEHOLDER_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+A9IAAIBBQABIgwEAABmAAFXTAMRAAAAAElFTkSuQmCC';

export default function PdfExportDemo() {
    const apiRef = useGridApiRef();
    const [includeTitle, setIncludeTitle] = useState(true);
    const [includeLogo, setIncludeLogo] = useState(false);
    const [includeFilters, setIncludeFilters] = useState(true);
    const [selectedOnly, setSelectedOnly] = useState(false);
    const [includeAgg, setIncludeAgg] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!apiRef.current) return;
        setIsExporting(true);
        try {
            const rows = apiRef.current.getAllRows();
            const columns = apiRef.current.getVisibleColumns();
            const aggResult = includeAgg ? (apiRef.current.getAggregationResult?.() ?? null) : null;
            const aggModel = includeAgg ? (apiRef.current.getAggregationModel?.() ?? null) : null;
            const filterModel = includeFilters ? (apiRef.current.getFilterModel?.() ?? null) : null;
            const selected = selectedOnly ? apiRef.current.getSelectedRows().map(r => r.id as string | number) : undefined;

            await exportToPdf(rows, columns, {
                fileName: 'employee-report',
                title: includeTitle ? 'Employee Report' : undefined,
                logoUrl: includeLogo ? PLACEHOLDER_LOGO : undefined,
                aggregationResult: aggResult,
                aggregationModel: aggModel,
                filterModel,
                selectedRows: selected,
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2>PDF Export</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Generates a styled PDF report using <code>exportToPdf()</code> — jsPDF + autotable.
                Requires <code>npm install jspdf jspdf-autotable</code>.
            </p>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeTitle} onChange={e => setIncludeTitle(e.target.checked)} />
                    Include title
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeLogo} onChange={e => setIncludeLogo(e.target.checked)} />
                    Include logo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeFilters} onChange={e => setIncludeFilters(e.target.checked)} />
                    Include filter summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeAgg} onChange={e => setIncludeAgg(e.target.checked)} />
                    Include aggregation footer
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedOnly} onChange={e => setSelectedOnly(e.target.checked)} />
                    Selected rows only
                </label>
            </div>

            <DataGrid
                apiRef={apiRef}
                rows={ALL_ROWS}
                columns={COLUMNS}
                pagination
                paginationModel={{ page: 0, pageSize: 10 }}
                checkboxSelection
                aggregation={{ salary: 'sum' }}
                filtering
                height={480}
                slots={{
                    toolbar: () => (
                        <GridToolbar
                            renderExportButton={() => (
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
                            )}
                        />
                    ),
                }}
            />
        </div>
    );
}
