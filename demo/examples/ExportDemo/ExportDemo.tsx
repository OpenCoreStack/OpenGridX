
import { useState, useRef } from 'react';
import { DataGrid, GridColDef, GridTooltip, exportToCsv, exportToExcel, exportToJson, printGrid, useGridApiRef } from '@opencorestack/opengridx';
import { Button } from '../../../lib/components/ui/Button';
import './ExportDemo.css';

const rows = Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`Employee ${i + 1}`)}&background=random`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    age: 20 + (i % 40),
    department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal', 'Operations'][i % 7],
    role: ['Manager', 'Developer', 'Designer', 'Analyst', 'Specialist', 'Director', 'Intern'][i % 7],
    salary: 50000 + (Math.floor(Math.random() * 50) * 1000),
    bonus: Math.floor(Math.random() * 10000),
    joinDate: new Date(2020, i % 12, (i % 28) + 1).toISOString().split('T')[0],
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleString(),
    isFullTime: i % 5 !== 0,
    rating: '⭐'.repeat((i % 5) + 1),
    performanceScore: (Math.random() * 5).toFixed(1),
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'On Leave' : 'Remote',
    notes: i % 7 === 0
        ? 'Exceptional performance in Q1. Promoted recently.'
        : i % 5 === 0
            ? 'Needs improvement in communication skills.'
            : 'Standard performance review pending.'
}));

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
        field: 'avatar',
        headerName: 'Avatar',
        width: 80,
        type: 'image',
        renderCell: (params) => (
            <div className="avatar-cell">
                <img
                    src={params.value}
                    alt="avatar"
                    className="avatar-image"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            </div>
        )
    },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'role', headerName: 'Role', width: 120 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 120,
        type: 'number',
        valueFormatter: ({ value }) => `$${value.toLocaleString()}`
    },
    {
        field: 'bonus',
        headerName: 'Bonus',
        width: 110,
        type: 'number',
        valueFormatter: ({ value }) => `$${value.toLocaleString()}`
    },
    { field: 'age', headerName: 'Age', width: 80, type: 'number' },
    { field: 'joinDate', headerName: 'Join Date', width: 110 },
    { field: 'lastLogin', headerName: 'Last Login', width: 180 },
    {
        field: 'isFullTime',
        headerName: 'Full Time',
        width: 100,
        type: 'boolean',
        valueFormatter: ({ value }) => value ? 'Yes' : 'No'
    },
    { field: 'rating', headerName: 'Rating', width: 120 },
    { field: 'performanceScore', headerName: 'Score', width: 80, type: 'number' },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'notes', headerName: 'Notes', width: 300 },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        hideable: false,
        pinnable: false,
        exportable: false, // This column is excluded from exports
        renderCell: (params) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                <button
                    className="demo-action-btn demo-action-btn--edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        alert(`Editing employee: ${params.row.name}`);
                    }}
                    title="Edit"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button
                    className="demo-action-btn demo-action-btn--delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        alert(`Deleting employee: ${params.row.name}`);
                    }}
                    title="Delete"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        )
    }
];

interface ExportOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (option: 'all' | 'current' | 'range', from?: number, to?: number) => void;
    paginationModel: { page: number; pageSize: number };
    totalRows: number;
    title?: string;
}

function ExportOptionsDialog({ open, onClose, onConfirm, paginationModel, totalRows, title = 'Export Options' }: ExportOptionsDialogProps) {
    if (!open) return null;

    const [option, setOption] = useState<'all' | 'current' | 'range'>('all');
    const [from, setFrom] = useState(1);
    const [to, setTo] = useState(1);

    const totalPages = Math.ceil(totalRows / paginationModel.pageSize);
    const currentPage = paginationModel.page + 1;

    const handleConfirm = () => {
        onConfirm(option, from, to);
    };

    const OptionCard = ({ label, description, checked, onClick, children }: any) => (
        <div
            onClick={onClick}
            className={`option-card ${checked ? 'option-card--checked' : ''}`}
        >
            <div className="option-card-header">
                <input
                    type="radio"
                    name="exportOption"
                    checked={checked}
                    onChange={onClick}
                    className="option-card-radio"
                />
                <div style={{ flex: 1 }}>
                    <div className="option-card-title">{label}</div>
                    {description && <div className="option-card-desc">{description}</div>}
                </div>
            </div>
            {checked && children && (
                <div className="option-card-content">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="export-overlay">
            <div className="export-dialog export-dialog--options">
                <div>
                    <h3 className="export-dialog-title" style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600 }}>{title}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Select the range of data you want to export.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <OptionCard
                        label="All Rows"
                        description={`Export all ${totalRows.toLocaleString()} records`}
                        checked={option === 'all'}
                        onClick={() => setOption('all')}
                    />

                    <OptionCard
                        label="Current Page"
                        description={`Page ${currentPage} (${paginationModel.pageSize} rows)`}
                        checked={option === 'current'}
                        onClick={() => setOption('current')}
                    />

                    <OptionCard
                        label="Page Range"
                        description={`Total ${totalPages} pages available`}
                        checked={option === 'range'}
                        onClick={() => setOption('range')}
                    >
                        <div className="page-range-inputs" onClick={e => e.stopPropagation()}>
                            <div className="input-field-group">
                                <label>From</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={from}
                                    onChange={e => setFrom(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                                />
                            </div>
                            <span className="range-separator">—</span>
                            <div className="input-field-group">
                                <label>To</label>
                                <input
                                    type="number"
                                    min={from}
                                    max={totalPages}
                                    value={to}
                                    onChange={e => setTo(Math.max(from, Math.min(totalPages, Number(e.target.value))))}
                                />
                            </div>
                        </div>
                    </OptionCard>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button variant="text" onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm}>Export</Button>
                </div>
            </div>
        </div>
    );
}

interface ExportToolbarProps {
    rows: any[];
    columns: GridColDef[];
    selectedRows?: number[];
    paginationModel: { page: number; pageSize: number };
    options?: {
        csv?: boolean;
        excel?: boolean;
        json?: boolean;
        print?: boolean;
    };
    apiRef?: any;
}

function ExportToolbar({ rows, columns, selectedRows, paginationModel, options, apiRef }: ExportToolbarProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | 'print' | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const downloadButtonRef = useRef<HTMLButtonElement>(null);

    const config = { csv: true, excel: true, json: true, print: true, ...options };
    const hasExportOption = config.csv || config.excel || config.json || config.print;
    const getAgg = () => apiRef?.current?.getAggregationResult?.() || null;
    const getAggModel = () => apiRef?.current?.getAggregationModel?.() || null;

    const performPrint = async (rowsToPrint: any[], titleSuffix: string = '') => {
        setIsPrinting(true);
        try {
            await printGrid(rowsToPrint, columns, {
                title: `Employee Directory${titleSuffix}`,
                selectedRows: selectedRows && selectedRows.length > 0 ? selectedRows : undefined,
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
        const aggResult = getAgg();
        const aggModel = getAggModel();
        if (selectedRows && selectedRows.length > 0) {
            const selectedData = rows.filter(row => selectedRows.includes(row.id));
            if (format === 'csv') exportToCsv(selectedData, columns, { fileName: 'employees.csv', aggregationResult: aggResult, aggregationModel: aggModel });
            else if (format === 'excel') exportToExcel(selectedData, columns, { fileName: 'employees.xlsx', sheetName: 'Employees', aggregationResult: aggResult, aggregationModel: aggModel });
            else if (format === 'json') exportToJson(selectedData, columns, { fileName: 'employees.json', pretty: true, aggregationResult: aggResult, aggregationModel: aggModel });
            else if (format === 'print') performPrint(rows, ' - Selected');
        } else {
            setExportFormat(format);
        }
        setShowMenu(false);
    };

    const handleDialogConfirm = (option: 'all' | 'current' | 'range', from?: number, to?: number) => {
        const format = exportFormat;
        setExportFormat(null);

        if (!format) return;

        let rowsToExport = rows;
        let suffix = '';

        if (option === 'current') {
            const start = paginationModel.page * paginationModel.pageSize;
            rowsToExport = rows.slice(start, start + paginationModel.pageSize);
            suffix = ` - Page ${paginationModel.page + 1}`;
        } else if (option === 'range' && from !== undefined && to !== undefined) {
            const start = (from - 1) * paginationModel.pageSize;
            const end = to * paginationModel.pageSize;
            rowsToExport = rows.slice(start, end);
            suffix = ` - Pages ${from}-${to}`;
        }

        const aggResult = getAgg();
        const aggModel = getAggModel();

        if (format === 'csv') exportToCsv(rowsToExport, columns, { fileName: `employees${suffix}.csv`, aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'excel') exportToExcel(rowsToExport, columns, { fileName: `employees${suffix}.xlsx`, sheetName: 'Employees', aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'json') exportToJson(rowsToExport, columns, { fileName: `employees${suffix}.json`, pretty: true, aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'print') performPrint(rowsToExport, suffix);
    };

    const Icons = {
        Csv: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h8"></path></svg>,
        Excel: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><rect x="8" y="13" width="8" height="4"></rect></svg>,
        Json: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"></path></svg>,
        Print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
        Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    };

    return (
        <div className="export-toolbar">
            <ExportOptionsDialog
                open={!!exportFormat}
                onClose={() => setExportFormat(null)}
                onConfirm={handleDialogConfirm}
                paginationModel={paginationModel}
                totalRows={rows.length}
                title={exportFormat === 'print' ? 'Print Options' : `Export ${exportFormat?.toUpperCase()} Options`}
            />

            {showMenu && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                    onClick={() => setShowMenu(false)}
                />
            )}

            <div className="export-toolbar-title-box">
                <h3 className="export-toolbar-title">
                    Employee Directory
                </h3>
                {selectedRows && selectedRows.length > 0 && (
                    <span className="selection-badge">
                        {selectedRows.length} selected
                    </span>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                {hasExportOption && (
                    <GridTooltip title="Export">
                        <button
                            ref={downloadButtonRef}
                            className={`ogx-toolbar__icon-btn${showMenu ? ' ogx-toolbar__icon-btn--active' : ''}`}
                            onClick={() => setShowMenu(!showMenu)}
                            disabled={isPrinting}
                            style={{
                                color: isPrinting ? '#9ca3af' : '#4b5563',
                            }}
                        >
                            {isPrinting ? (
                                <span className="export-spinner"></span>
                            ) : (
                                Icons.Download
                            )}
                        </button>
                    </GridTooltip>
                )}

                {showMenu && (
                    <div className="ogx-toolbar__panel" style={{
                        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                        width: '160px', padding: '4px 0',
                    }}>
                        {config.csv && (
                            <div
                                onClick={() => handleExportClick('csv')}
                                className="menu-item-custom"
                            >
                                {Icons.Csv} CSV
                            </div>
                        )}
                        {config.excel && (
                            <div
                                onClick={() => handleExportClick('excel')}
                                className="menu-item-custom"
                            >
                                {Icons.Excel} Excel
                            </div>
                        )}
                        {config.json && (
                            <div
                                onClick={() => handleExportClick('json')}
                                className="menu-item-custom"
                            >
                                {Icons.Json} JSON
                            </div>
                        )}

                        {config.print && (config.csv || config.excel || config.json) && (
                            <div className="ogx-menu-divider" />
                        )}

                        {config.print && (
                            <div
                                onClick={() => handleExportClick('print')}
                                className="menu-item-custom"
                            >
                                {Icons.Print} Print
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExportDemo() {
    const apiRef = useGridApiRef();
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 500
    });

    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [showSelectionExportDialog, setShowSelectionExportDialog] = useState(false);

    const handleExportConfirm = (format: 'csv' | 'excel' | 'json' | 'print') => {
        const selectedData = rows.filter(row => selectedRows.includes(row.id));
        const aggResult = apiRef.current?.getAggregationResult?.() || null;
        const aggModel = apiRef.current?.getAggregationModel?.() || null;

        const options = {
            aggregationResult: aggResult,
            aggregationModel: aggModel
        };

        if (format === 'csv') {
            exportToCsv(selectedData, columns, { fileName: 'selected-employees.csv', ...options });
        } else if (format === 'excel') {
            exportToExcel(selectedData, columns, { fileName: 'selected-employees.xlsx', sheetName: 'Selected', ...options });
        } else if (format === 'json') {
            exportToJson(selectedData, columns, { fileName: 'selected-employees.json', pretty: true, ...options });
        } else if (format === 'print') {
            printGrid(selectedData, columns, { title: 'Selected Employees', ...options });
        }
        setShowSelectionExportDialog(false);
    };

    const handleExportSelectedClick = () => {
        if (selectedRows.length === 0) {
            alert('Please select rows to export');
            return;
        }
        setShowSelectionExportDialog(true);
    };

    return (
        <div className="export-demo-container">
            {showSelectionExportDialog && (
                <div className="export-overlay">
                    <div className="export-dialog">
                        <div className="export-dialog-header">
                            <h3>Export Selected Data</h3>
                            <p>
                                Choose a format for exporting {selectedRows.length} rows.
                            </p>
                        </div>

                        <div className="export-format-grid">
                            {[
                                { id: 'csv', name: 'CSV', color: '#10b981', desc: 'Text format' },
                                { id: 'excel', name: 'Excel', color: '#16a34a', desc: 'Native table' },
                                { id: 'json', name: 'JSON', color: '#8b5cf6', desc: 'Data structure' },
                                { id: 'print', name: 'Print', color: '#3b82f6', desc: 'Hard copy' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleExportConfirm(item.id as any)}
                                    className="export-format-btn"
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = item.color;
                                        e.currentTarget.style.backgroundColor = `${item.color}05`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.backgroundColor = '#fff';
                                    }}
                                >
                                    <div className="export-format-name">{item.name}</div>
                                    <div className="export-format-desc">{item.desc}</div>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                            <Button variant="text" onClick={() => setShowSelectionExportDialog(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="export-demo-header">
                <h2>Export Functionality Demo</h2>
                <p>
                    Export data to CSV, Excel, JSON, or print. Select rows to export only selected data.
                </p>
            </div>

            <div className="export-demo-grid-wrapper">
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[500, 1000, 2500, 5000]}
                    checkboxSelection
                    rowSelectionModel={selectedRows}
                    onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as number[])}
                    slots={{
                        toolbar: ExportToolbar
                    }}
                    slotProps={{
                        toolbar: {
                            rows,
                            columns,
                            selectedRows,
                            paginationModel,
                            options: { json: true }
                        }
                    }}
                    height={500}
                />
            </div>

            {selectedRows.length > 0 && (
                <div className="selection-info-bar">
                    <span className="selection-info-text">
                        {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleExportSelectedClick}
                    >
                        Export Selected
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedRows([])}
                    >
                        Clear Selection
                    </Button>
                </div>
            )}

            <div className="export-features-box">
                <h4>Export Features:</h4>
                <ul>
                    <li><strong>CSV Export:</strong> Plain text format, opens in Excel/Google Sheets</li>
                    <li><strong>Excel Export:</strong> Native Excel format with formatting</li>
                    <li><strong>JSON Export:</strong> Structured data for APIs and applications</li>
                    <li><strong>Print:</strong> Optimized print layout with proper formatting</li>
                    <li><strong>Selected Export:</strong> Export only selected rows</li>
                    <li><strong>Value Formatters:</strong> Exported data respects column formatters (e.g., salary formatting)</li>
                    <li><strong>Excluded Columns:</strong> Use `exportable: false` to skip columns like 'Actions' in the generated files.</li>
                </ul>
            </div>
        </div>
    );
}
