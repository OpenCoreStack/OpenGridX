
import { useState } from 'react';
import { DataGrid, GridToolbar, GridColDef, GridFilterModel, GridTooltip, exportToCsv, exportToExcel, exportToJson, printGrid } from '../../../lib';
import { DocsLayout } from '../../components/DocsLayout';
import './AdvancedFilteringDemo.css';

import sourceCode from './AdvancedFilteringDemo.tsx?raw';

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
                title: 'Data Export',
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

        if (format === 'csv') exportToCsv(currentRows, currentCols, { fileName: 'export.csv', aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'excel') exportToExcel(currentRows, currentCols, { fileName: 'export.xlsx', sheetName: 'Data', aggregationResult: aggResult, aggregationModel: aggModel });
        else if (format === 'json') exportToJson(currentRows, currentCols, { fileName: 'export.json', pretty: true, aggregationResult: aggResult, aggregationModel: aggModel });
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
        <div className="ogx-toolbar__dropdown-wrapper">
            <GridTooltip title="Export">
                <button
                    className={`ogx-toolbar__icon-btn${showMenu ? ' ogx-toolbar__icon-btn--active' : ''} ${isPrinting ? 'filtering-export-btn--disabled' : 'filtering-export-btn'}`}
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isPrinting}
                    aria-label="Export Menu"
                >
                    {isPrinting ? (
                        <span className="toolbar-spinner"></span>
                    ) : (
                        Icons.Download
                    )}
                </button>
            </GridTooltip>

            {showMenu && (
                <>
                    <div
                        className="filtering-export-overlay"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="ogx-toolbar__panel filtering-export-menu">
                        <div
                            onClick={() => handleExportClick('csv')}
                            className="ogx-menu-item"
                        >
                            {Icons.Csv} Export as CSV
                        </div>
                        <div
                            onClick={() => handleExportClick('excel')}
                            className="ogx-menu-item"
                        >
                            {Icons.Excel} Export as Excel
                        </div>
                        <div
                            onClick={() => handleExportClick('json')}
                            className="ogx-menu-item"
                        >
                            {Icons.Json} Export as JSON
                        </div>
                        <div className="ogx-menu-divider" />
                        <div
                            onClick={() => handleExportClick('print')}
                            className="ogx-menu-item"
                        >
                            {Icons.Print} Print View
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const rows = [
    { id: 1, firstName: 'Jon', lastName: 'Snow', age: 35, department: 'Engineering', salary: 95000, active: true },
    { id: 2, firstName: 'Cersei', lastName: 'Lannister', age: 42, department: 'Management', salary: 140000, active: false },
    { id: 3, firstName: 'Jaime', lastName: 'Lannister', age: 45, department: 'Security', salary: 88000, active: true },
    { id: 4, firstName: 'Arya', lastName: 'Stark', age: 16, department: 'Engineering', salary: 52000, active: true },
    { id: 5, firstName: 'Daenerys', lastName: 'Targaryen', age: 30, department: 'Management', salary: 155000, active: true },
    { id: 6, firstName: 'Melisandre', lastName: 'of Asshai', age: 150, department: 'Consulting', salary: 120000, active: true },
    { id: 7, firstName: 'Ferrara', lastName: 'Clifford', age: 44, department: 'Sales', salary: 74000, active: true },
    { id: 8, firstName: 'Rossini', lastName: 'Frances', age: 36, department: 'IT', salary: 83000, active: true },
    { id: 9, firstName: 'Harvey', lastName: 'Roxie', age: 65, department: 'Sales', salary: 68000, active: false },
    { id: 10, firstName: 'Tyrion', lastName: 'Lannister', age: 39, department: 'Consulting', salary: 112000, active: true },
    { id: 11, firstName: 'Sansa', lastName: 'Stark', age: 20, department: 'HR', salary: 60000, active: true },
    { id: 12, firstName: 'Bran', lastName: 'Stark', age: 17, department: 'IT', salary: 55000, active: false },
    { id: 13, firstName: 'Samwell', lastName: 'Tarly', age: 27, department: 'Engineering', salary: 78000, active: true },
    { id: 14, firstName: 'Brienne', lastName: 'of Tarth', age: 32, department: 'Security', salary: 91000, active: true },
    { id: 15, firstName: 'Petyr', lastName: 'Baelish', age: 48, department: 'Management', salary: 130000, active: false },
    { id: 16, firstName: 'Varys', lastName: 'The Spider', age: 55, department: 'Consulting', salary: 108000, active: true },
    { id: 17, firstName: 'Theon', lastName: 'Greyjoy', age: 25, department: 'HR', salary: 58000, active: false },
    { id: 18, firstName: 'Robb', lastName: 'Stark', age: 22, department: 'Management', salary: 115000, active: true },
    { id: 19, firstName: 'Gendry', lastName: 'Waters', age: 23, department: 'Engineering', salary: 67000, active: true },
    { id: 20, firstName: 'Margaery', lastName: 'Tyrell', age: 28, department: 'Sales', salary: 82000, active: true },
    { id: 21, firstName: 'Jorah', lastName: 'Mormont', age: 50, department: 'Security', salary: 88000, active: false },
    { id: 22, firstName: 'Davos', lastName: 'Seaworth', age: 53, department: 'Consulting', salary: 97000, active: true },
    { id: 23, firstName: 'Oberyn', lastName: 'Martell', age: 41, department: 'Sales', salary: 105000, active: true },
    { id: 24, firstName: 'Stannis', lastName: 'Baratheon', age: 46, department: 'Management', salary: 135000, active: false },
    { id: 25, firstName: 'Tormund', lastName: 'Giantsbane', age: 38, department: 'Security', salary: 72000, active: true },
];

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, type: 'number' },
    { field: 'firstName', headerName: 'First Name', width: 140 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90, type: 'number' },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 120, type: 'number' },
    { field: 'active', headerName: 'Active', width: 90, type: 'boolean' },
];

function ToolbarWithExport(props: any) {
    return (
        <GridToolbar
            {...props}
            rightContent={
                <ExportToolbar
                    apiRef={props.apiRef}
                    fallbackRows={rows}
                    fallbackColumns={columns}
                />
            }
        />
    );
}

export default function AdvancedFilteringDemo() {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
        logicOperator: 'and'
    });

    return (
        <DocsLayout
            title="Advanced Filtering"
            description="Click the filter icon (▽) in the toolbar to open the filter builder. Set per-column conditions — click a Value field to activate that row's filter."
            sourceCode={sourceCode}
        >
            <div className="filtering-demo-container">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    slots={{ toolbar: ToolbarWithExport }}
                    checkboxSelection
                    pagination
                    height={500}
                    paginationModel={{ page: 0, pageSize: 25 }}
                />

                <div className="filtering-model-preview">
                    <strong>Current Filter Model:</strong>
                    <pre>{JSON.stringify(filterModel, null, 2)}</pre>
                </div>
            </div>
        </DocsLayout>
    );
}
