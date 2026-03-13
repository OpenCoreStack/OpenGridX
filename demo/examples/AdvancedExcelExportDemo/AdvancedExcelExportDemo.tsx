
import { useState } from 'react';
import {
    DataGrid,
    GridColDef,
    exportToExcelAdvanced,
    exportToCsv,
    exportToJson,
    printGrid,
    useAggregation,
} from '@opencorestack/opengridx';
import './AdvancedExcelExportDemo.css';

// ─── Data ─────────────────────────────────────────────────────────────────────

const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal', 'Operations'];
const roles = ['Manager', 'Developer', 'Designer', 'Analyst', 'Specialist', 'Director', 'Intern'];
const statuses = ['Active', 'On Leave', 'Remote'];

// ─── Avatar generation ─────────────────────────────────────────────────────────

function makeAvatarDataUri(initials: string, bgHex: string): string {
    const size = 40;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = `#${bgHex}`;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.38)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2 + 1);
    return canvas.toDataURL('image/png');
}

const AVATAR_PEOPLE = [
    { name: 'Alice Smith', initials: 'AS', bg: '0f172a' },
    { name: 'Bob Johnson', initials: 'BJ', bg: '1e3a5f' },
    { name: 'Carol Williams', initials: 'CW', bg: '10b981' },
    { name: 'David Brown', initials: 'DB', bg: '6366f1' },
    { name: 'Eve Jones', initials: 'EJ', bg: 'f59e0b' },
    { name: 'Frank Garcia', initials: 'FG', bg: 'ef4444' },
    { name: 'Grace Miller', initials: 'GM', bg: '3b82f6' },
    { name: 'Henry Davis', initials: 'HD', bg: '8b5cf6' },
];

const AVATAR_URIS = AVATAR_PEOPLE.map(p => makeAvatarDataUri(p.initials, p.bg));

const rows = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    avatarUrl: AVATAR_URIS[i % AVATAR_PEOPLE.length],
    employeeId: `EMP-${String(i + 1001).padStart(5, '0')}`,
    name: `${AVATAR_PEOPLE[i % 8].name.split(' ')[0]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'][i % 7]}`,
    email: `employee${i + 1}@acme.com`,
    department: departments[i % departments.length],
    role: roles[i % roles.length],
    salary: 55000 + (i % 50) * 2000,
    bonus: Math.round((4000 + (i % 20) * 500) / 100) * 100,
    yearsExperience: 1 + (i % 15),
    joinDate: new Date(2018 + (i % 6), i % 12, (i % 28) + 1),
    isFullTime: i % 5 !== 0,
    performanceScore: parseFloat((3.0 + (i % 20) / 10).toFixed(1)),
    status: statuses[i % statuses.length],
    location: ['New York', 'London', 'Berlin', 'Singapore', 'Sydney'][i % 5],
}));

const columns: GridColDef[] = [
    {
        field: 'avatarUrl',
        headerName: 'Avatar',
        width: 60,
        sortable: false,
        renderCell: ({ value }) => (
            <img
                src={value}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', display: 'block' }}
            />
        ),
    },
    { field: 'employeeId', headerName: 'Employee ID', width: 130 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'role', headerName: 'Role', width: 110 },
    { field: 'location', headerName: 'Location', width: 110 },
    {
        field: 'salary',
        headerName: 'Salary',
        type: 'number',
        width: 120,
        valueFormatter: ({ value }) => `$${value.toLocaleString()}`,
    },
    {
        field: 'bonus',
        headerName: 'Bonus',
        type: 'number',
        width: 110,
        valueFormatter: ({ value }) => `$${value.toLocaleString()}`,
    },
    { field: 'yearsExperience', headerName: 'Exp (yrs)', type: 'number', width: 110 },
    {
        field: 'joinDate',
        headerName: 'Join Date',
        type: 'date',
        width: 120,
        valueFormatter: ({ value }) =>
            value instanceof Date ? value.toISOString().split('T')[0] : String(value),
    },
    {
        field: 'isFullTime',
        headerName: 'Full Time',
        type: 'boolean',
        width: 120,
        valueFormatter: ({ value }) => (value ? 'Yes' : 'No'),
    },
    {
        field: 'performanceScore',
        headerName: 'Score',
        type: 'number',
        width: 120,
        valueFormatter: ({ value }) => `${value}/5`,
    },
    { field: 'status', headerName: 'Status', width: 100 },
];

const aggregationModel = {
    salary: 'sum',
    bonus: 'sum',
    yearsExperience: 'avg',
    performanceScore: 'avg',
} as const;

export default function AdvancedExcelExportDemo() {
    const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);
    const [exporting, setExporting] = useState(false);

    const { aggregationResult: aggResult } = useAggregation({
        rows,
        aggregationModel,
        isServerSide: false,
    });

    const handleBasicExcel = async () => {
        setExporting(true);
        try {
            await exportToExcelAdvanced(rows, columns, {
                fileName: 'employees-basic.xlsx',
                columnStyles: {
                    avatarUrl: { embedImage: true, imageWidth: 40, imageHeight: 40, width: 8 },
                    salary: { numFmt: '$#,##0.00' },
                    bonus: { numFmt: '$#,##0.00' },
                },
                aggregationResult: aggResult,
                aggregationModel,
                selectedRows: selectedRowIds.length > 0 ? selectedRowIds : undefined,
            });
        } finally { setExporting(false); }
    };

    const handleMultiSheetExcel = async () => {
        setExporting(true);
        try {
            await exportToExcelAdvanced(rows, columns, {
                fileName: 'employees-full-report.xlsx',
                sheets: [
                    {
                        name: 'All Employees',
                        rows: 'all',
                        includeHeaders: true,
                        includeSummary: true,
                        autoFilter: true,
                        frozenHeader: true,
                        alternateRowColor: '#f8fafc',
                    },
                    ...(selectedRowIds.length > 0
                        ? [{
                            name: 'Selected Only',
                            rows: 'selected' as const,
                            includeHeaders: true,
                            includeSummary: false,
                        }]
                        : []
                    ),
                    { type: 'summary' as const, name: 'Aggregation Summary' },
                ],
                columnStyles: {
                    avatarUrl: { embedImage: true, imageWidth: 40, imageHeight: 40, width: 8 },
                    salary: { numFmt: '$#,##0.00', alignment: 'right' },
                    bonus: { numFmt: '$#,##0.00', alignment: 'right' },
                    performanceScore: { numFmt: '0.0', alignment: 'right' },
                    joinDate: { numFmt: 'yyyy-mm-dd' },
                },
                headerFillColor: '#1e3a5f',
                headerTextColor: '#e2e8f0',
                headerFontSize: 11,
                aggregationResult: aggResult,
                aggregationModel,
                selectedRows: selectedRowIds.length > 0 ? selectedRowIds : undefined,
            });
        } finally { setExporting(false); }
    };

    return (
        <div className="adv-excel-export-container">
            {/* Header */}
            <div className="adv-excel-export-header">
                <div className="adv-excel-export-title-box">
                    <h1>📊 Advanced Excel Export</h1>
                    <p>Real .xlsx files — typed cells, styled headers, multi-sheet, aggregation totals</p>
                </div>

                <div className="adv-excel-export-actions">
                    <ExportButton
                        emoji="📋"
                        label="Basic Excel"
                        sublabel="1 sheet, styled"
                        color="#10b981"
                        onClick={handleBasicExcel}
                        disabled={exporting}
                    />

                    <ExportButton
                        emoji="📚"
                        label="Full Report"
                        sublabel={selectedRowIds.length > 0
                            ? `${selectedRowIds.length} sel + summary`
                            : '2 sheets + summary'}
                        color="#6366f1"
                        onClick={handleMultiSheetExcel}
                        disabled={exporting}
                    />

                    <div className="adv-excel-action-divider" />

                    <ExportButton
                        emoji="📄"
                        label="CSV"
                        sublabel="UTF-8"
                        color="#64748b"
                        onClick={() => exportToCsv(rows, columns, {
                            fileName: 'employees.csv',
                            aggregationResult: aggResult,
                            aggregationModel,
                            selectedRows: selectedRowIds.length > 0 ? selectedRowIds : undefined,
                        })}
                        disabled={exporting}
                    />

                    <ExportButton
                        emoji="🔧"
                        label="JSON"
                        sublabel="pretty"
                        color="#64748b"
                        onClick={() => exportToJson(rows, columns, {
                            fileName: 'employees.json',
                            pretty: true,
                            aggregationResult: aggResult,
                            aggregationModel,
                        })}
                        disabled={exporting}
                    />

                    <ExportButton
                        emoji="🖨️"
                        label="Print"
                        sublabel="dialog"
                        color="#64748b"
                        onClick={() => printGrid(rows, columns, 'Employee Report')}
                        disabled={exporting}
                    />
                </div>

                {exporting && (
                    <div className="adv-excel-exporting-status">
                        <span className="adv-excel-spinning-icon">⚙️</span>
                        Generating…
                    </div>
                )}
            </div>

            {/* Feature callouts */}
            <div className="adv-excel-features">
                {[
                    { icon: '🎨', text: 'Styled headers & alternating rows' },
                    { icon: '🔢', text: 'Native number/date/boolean cell types' },
                    { icon: '📐', text: 'Column widths from colDef.width' },
                    { icon: '❄️', text: 'Frozen header row' },
                    { icon: '🔽', text: 'Auto-filter dropdowns' },
                    { icon: '📚', text: 'Multi-sheet workbooks' },
                    { icon: '∑', text: 'Aggregation totals row' },
                ].map(f => (
                    <div key={f.text} className="adv-excel-feature-item">
                        <span>{f.icon}</span> {f.text}
                    </div>
                ))}
                {selectedRowIds.length > 0 && (
                    <div className="adv-excel-selection-indicator">
                        ✅ {selectedRowIds.length} rows selected — Full Report will include a "Selected Only" sheet
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="adv-excel-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    rowSelectionModel={selectedRowIds}
                    onRowSelectionModelChange={setSelectedRowIds}
                    pagination
                    height={500}
                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 50 } } }}
                    pageSizeOptions={[25, 50, 100]}
                    aggregationModel={aggregationModel}
                    slots={{
                        toolbar: () => null,
                    }}
                />
            </div>

            <DeveloperNotes />
        </div>
    );
}

// ─── Developer Notes (tab layout) ───────────────────────────────────────────

const DEV_TABS = [
    {
        id: 'install',
        label: 'Installation',
        icon: '📦',
        accent: '#f59e0b',
        rows: [
            {
                tag: 'REQUIRED',
                tagColor: '#ef4444',
                title: 'Install the peer dependency',
                body: 'exceljs is NOT bundled with OpenGridX. Install it separately:',
                code: 'npm install exceljs\n# or\nyarn add exceljs\n# or\npnpm add exceljs',
            },
            {
                tag: 'VERSION',
                tagColor: '#f59e0b',
                title: 'Supported versions',
                body: 'exceljs ≥ 4.x is required. Tested on 4.4.x. Earlier versions have a different API and will not work.',
            },
            {
                tag: 'BUNDLE',
                tagColor: '#10b981',
                title: 'Bundle impact is zero by default',
                body: 'ExcelJS is loaded lazily with a dynamic import() — it is NOT included in your initial JS bundle. The ~3 MB cost is only paid the first time exportToExcelAdvanced() is called, and browsers cache it after that.',
            },
            {
                tag: 'ZERO-DEP',
                tagColor: '#6366f1',
                title: 'Other exports need no dependency',
                body: 'exportToCsv, exportToExcel (basic), exportToJson, and printGrid all work with zero additional packages. Only exportToExcelAdvanced() requires exceljs.',
            },
        ],
    },
    {
        id: 'async',
        label: 'Async Usage',
        icon: '⏳',
        accent: '#6366f1',
        rows: [
            {
                tag: 'ASYNC',
                tagColor: '#6366f1',
                title: 'The function is async — always await it',
                body: 'exportToExcelAdvanced dynamically imports ExcelJS and then serialises the workbook to a binary buffer. Both steps are async. Omitting await means the file download may silently never happen.',
                code: '// ✅ Correct\nawait exportToExcelAdvanced(rows, columns, opts);\n\n// ❌ Wrong — download may not start\nexportToExcelAdvanced(rows, columns, opts);',
            },
            {
                tag: 'PATTERN',
                tagColor: '#3b82f6',
                title: 'Recommended loading-state pattern',
                code: 'const handleExport = async () => {\n  setExporting(true);\n  try {\n    await exportToExcelAdvanced(rows, columns, {\n      fileName: \'report.xlsx\',\n    });\n  } catch (err) {\n    console.error(\'Export failed:\', err);\n  } finally {\n    setExporting(false);\n  }\n};',
            },
            {
                tag: 'SSR',
                tagColor: '#ef4444',
                title: 'Browser-only — not compatible with SSR or Node.js',
                body: 'The download step uses document.createElement and URL.createObjectURL, which are browser APIs. Do not call this function during server-side rendering or in a Node.js script.',
            },
        ],
    },
    {
        id: 'cells',
        label: 'Cell Types & numFmt',
        icon: '🔢',
        accent: '#10b981',
        rows: [
            {
                tag: 'KEY RULE',
                tagColor: '#10b981',
                title: 'Typed columns keep their raw value',
                body: 'For columns declared as type: "number", "date", or "boolean" — the raw JS value is written directly to Excel. The valueFormatter is intentionally skipped so Excel can apply its own native cell formatting (via numFmt).',
            },
            {
                tag: 'STRING',
                tagColor: '#64748b',
                title: 'String columns use valueFormatter',
                body: 'For type: "string" (the default), valueFormatter IS applied before writing. Computed display strings like "Alice Smith" or "$55,000" are exported as text exactly as they appear in the grid.',
            },
            {
                tag: 'NUMFMT',
                tagColor: '#3b82f6',
                title: 'Apply Excel number formatting with columnStyles.numFmt',
                body: 'Pass Excel format strings to control how native-typed cells display in the spreadsheet:',
                code: "await exportToExcelAdvanced(rows, columns, {\n  columnStyles: {\n    salary:    { numFmt: '$#,##0.00' },\n    rate:      { numFmt: '0.00%' },\n    quantity:  { numFmt: '#,##0' },\n    joinDate:  { numFmt: 'yyyy-mm-dd' },\n    invoiceAt: { numFmt: 'dd/mm/yyyy' },\n    score:     { numFmt: '0.0' },\n  },\n});",
            },
            {
                tag: 'DATES',
                tagColor: '#f59e0b',
                title: 'Date values must be JS Date objects',
                body: 'For type: "date" columns, the raw value must be a JavaScript Date instance. If you store ISO strings ("2024-01-15"), Excel will see them as plain text. Use a valueGetter to convert: valueGetter: ({ row }) => new Date(row.dateField)',
            },
            {
                tag: 'IMAGES',
                tagColor: '#6366f1',
                title: 'Embed images with embedImage: true',
                body: 'Set embedImage: true in columnStyles for any URL-valued column. The URL is fetched and the binary image is written directly into the cell. Requires CORS headers on the image server. Falls back to plain URL text if the fetch fails.',
                code: "columnStyles: {\n  avatarUrl: {\n    embedImage: true,\n    imageWidth:  40,\n    imageHeight: 40,\n  },\n}",
            },
        ],
    },
    {
        id: 'sheets',
        label: 'Multi-Sheet',
        icon: '📚',
        accent: '#3b82f6',
        rows: [
            {
                tag: 'DEFAULT',
                tagColor: '#64748b',
                title: 'Default: one sheet called "Data"',
                body: 'If you omit the sheets option, a single sheet named "Data" is created with all rows, headers, frozen row, and auto-filter enabled.',
            },
            {
                tag: 'DATA SHEET',
                tagColor: '#3b82f6',
                title: 'Data sheet options',
                code: "sheets: [\n  {\n    name: 'All Employees',\n    rows: 'all',\n    includeHeaders: true,\n    includeSummary: true,\n    frozenHeader: true,\n    autoFilter: true,\n    alternateRowColor: '#f8fafc',\n  },\n]",
            },
            {
                tag: 'SELECTION',
                tagColor: '#6366f1',
                title: 'Selection-only sheet',
                body: 'Use rows: "selected" to export only the rows whose IDs are in the selectedRows option. If no rows are selected, the sheet will be empty.',
                code: "{ name: 'Selected Rows', rows: 'selected', includeHeaders: true }",
            },
            {
                tag: 'SUMMARY',
                tagColor: '#10b981',
                title: 'Standalone aggregation summary sheet',
                body: 'The special type: "summary" sheet produces a formatted 3-column table: Column | Function | Value. Requires aggregationResult and aggregationModel to be passed.',
                code: "{ type: 'summary', name: 'Aggregation Totals' }",
            },
        ],
    },
    {
        id: 'gotchas',
        label: 'Gotchas',
        icon: '⚠️',
        accent: '#ef4444',
        rows: [
            {
                tag: 'IMAGES',
                tagColor: '#f59e0b',
                title: 'embedImage requires CORS headers on the image server',
                body: 'The browser fetches each image URL with mode: "cors". If the server does not include Access-Control-Allow-Origin, the fetch will fail and the URL is written as plain text instead. Check your image host\'s CORS policy before relying on embedding.',
            },
            {
                tag: 'AGGREGATION',
                tagColor: '#ef4444',
                title: 'includeSummary silently skips without data',
                body: 'If includeSummary: true is set or a { type: "summary" } sheet is defined, but aggregationResult or aggregationModel is null/undefined, those features are silently no-ops. Always pass both.',
            },
            {
                tag: 'COLORS',
                tagColor: '#8b5cf6',
                title: 'Colors must be #rrggbb hex — no CSS names or functions',
                body: 'headerFillColor, headerTextColor, and alternateRowColor only accept 6-digit hex strings. "blue", "rgb(30,58,95)", "hsl(215,52%,24%)" will silently produce wrong colors.',
                code: "// ✅ Correct\nheaderFillColor: '#1e3a5f'\n\n// ❌ Wrong\nheaderFillColor: 'navy'\nheaderFillColor: 'rgb(30, 58, 95)'",
            },
            {
                tag: 'EXTENSION',
                tagColor: '#64748b',
                title: '.xlsx extension is added automatically',
                body: 'If fileName does not end with .xlsx, the extension is appended. Pass "Q1-Report" and the download will be "Q1-Report.xlsx". Do not use .xls — that is the legacy format generated by the basic exportToExcel function.',
            },
            {
                tag: 'SHEET NAMES',
                tagColor: '#3b82f6',
                title: 'Excel sheet name restrictions',
                body: 'Sheet tab names are limited to 31 characters by the Excel file format spec. The characters / \\ ? * [ ] are forbidden in tab names. Names that exceed 31 chars are silently truncated by ExcelJS.',
            },
        ],
    },
] as const;

function DeveloperNotes() {
    const [activeTab, setActiveTab] = useState<string>('install');
    const tab = DEV_TABS.find(t => t.id === activeTab) ?? DEV_TABS[0];

    return (
        <div className="dev-notes-container">
            <div className="dev-notes-header">
                <div className="dev-notes-header-title">
                    <span className="dev-notes-tag">DEV NOTES</span>
                    <span className="dev-notes-main-title">Developer Reference</span>
                    <span className="dev-notes-subtitle">— everything you need to know</span>
                </div>

                <div className="dev-notes-tabs">
                    {DEV_TABS.map(t => {
                        const active = t.id === activeTab;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className="dev-notes-tab-btn"
                                style={{
                                    borderBottom: active ? `2px solid ${t.accent}` : '2px solid transparent',
                                    fontWeight: active ? 700 : 500,
                                    color: active ? t.accent : '#64748b',
                                }}
                            >
                                <span>{t.icon}</span>
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="dev-notes-rows">
                {tab.rows.map((row, i) => (
                    <div
                        key={i}
                        className="dev-notes-row"
                        style={{ borderBottom: i < tab.rows.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                        <div className="dev-notes-row-sidebar">
                            <span className="dev-notes-row-tag" style={{ color: row.tagColor }}>{row.tag}</span>
                            <span className="dev-notes-row-title">{row.title}</span>
                        </div>

                        <div className="dev-notes-row-content">
                            {'body' in row && row.body && (
                                <p className="dev-notes-row-body">{row.body}</p>
                            )}
                            {'code' in row && row.code && (
                                <pre className="dev-notes-row-code">{row.code}</pre>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ExportButton({
    emoji, label, sublabel, color, onClick, disabled,
}: {
    emoji: string;
    label: string;
    sublabel: string;
    color: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="export-btn-root"
            style={{ background: color }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
        >
            <span className="export-btn-emoji">{emoji}</span>
            <span className="export-btn-label">{label}</span>
            <span className="export-btn-sublabel">{sublabel}</span>
        </button>
    );
}
