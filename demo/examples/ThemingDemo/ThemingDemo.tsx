
import { useState } from 'react';
import {
    DataGrid,
    DataGridThemeProvider,
    darkTheme,
    roseTheme,
    emeraldTheme,
    amberTheme,
    compactTheme,
    GridPaginationModel,
    GridRowId,
    GridToolbar,
    GridColDef,
    GridFilterModel,
    GridAggregationModel,
    GridPivotModel,
    GridTooltip,
    exportToCsv,
    exportToExcel,
    exportToJson,
    printGrid,
} from '@opencorestack/opengridx';
import type { GridTheme } from '@opencorestack/opengridx';
import { generateEmployees } from '../../data/mockData';
import { allColumns } from '../../data/columns';
import { DocsLayout } from '../../components/DocsLayout';
import './ThemingDemo.css';

import sourceCode from './ThemingDemo.tsx?raw';

const presetThemes: Record<string, GridTheme> = {
    'Default': {},
    'Dark': darkTheme,
    'Rose': roseTheme,
    'Emerald': emeraldTheme,
    'Amber': amberTheme,
    'Compact': compactTheme,
    'Custom Purple': {
        colors: {
            primary: '#7c3aed',
            primaryDark: '#6d28d9',
            primaryLight: '#f5f3ff',
            primaryFocus: 'rgba(124, 58, 237, 0.4)',
        },
        grid: {
            headerBackground: '#f5f3ff',
            rowSelectedBackground: '#ede9fe',
            rowSelectedHoverBackground: '#ddd6fe',
            cellFocusBorder: '#7c3aed',
        },
        borders: {
            radiusLg: '16px',
        },
    },
    'Dark + Compact': {
        ...darkTheme,
        grid: {
            ...darkTheme.grid,
            ...compactTheme.grid,
        },
        typography: compactTheme.typography,
    },
};

const themeColors: Record<string, string> = {
    'Default': '#3b82f6',
    'Dark': '#60a5fa',
    'Rose': '#e11d48',
    'Emerald': '#059669',
    'Amber': '#d97706',
    'Compact': '#3b82f6',
    'Custom Purple': '#7c3aed',
    'Dark + Compact': '#60a5fa',
};

const Icons = {
    Csv: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h8"></path></svg>,
    Excel: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><rect x="8" y="13" width="8" height="4"></rect></svg>,
    Json: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"></path></svg>,
    Print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
    Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

interface ExportToolbarProps {
    apiRef?: any;
    fallbackRows: any[];
    fallbackColumns: GridColDef<any>[];
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

    return (
        <div className="ogx-toolbar__dropdown-wrapper">
            <GridTooltip title="Export">
                <button
                    className={`ogx-toolbar__icon-btn${showMenu ? ' ogx-toolbar__icon-btn--active' : ''} ${isPrinting ? 'theming-btn--disabled' : ''}`}
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isPrinting}
                    aria-label="Export Menu"
                >
                    {isPrinting ? (
                        <span className="theming-spinner"></span>
                    ) : (
                        Icons.Download
                    )}
                </button>
            </GridTooltip>

            {showMenu && (
                <>
                    <div
                        className="theming-export-overlay"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="ogx-toolbar__panel theming-export-menu">
                        <div onClick={() => handleExportClick('csv')} className="ogx-menu-item">
                            {Icons.Csv} Export as CSV
                        </div>
                        <div onClick={() => handleExportClick('excel')} className="ogx-menu-item">
                            {Icons.Excel} Export as Excel
                        </div>
                        <div onClick={() => handleExportClick('json')} className="ogx-menu-item">
                            {Icons.Json} Export as JSON
                        </div>
                        <div className="ogx-menu-divider" />
                        <div onClick={() => handleExportClick('print')} className="ogx-menu-item">
                            {Icons.Print} Print View
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ThemingDemo() {
    const [rows] = useState(() => generateEmployees(500));
    const [selectedTheme, setSelectedTheme] = useState('Default');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], logicOperator: 'and' });
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({});
    const [pivotMode, setPivotMode] = useState(false);
    const [pivotModel, setPivotModel] = useState<GridPivotModel>({ rowFields: [], columnFields: [], valueFields: [] });
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});

    const theme = presetThemes[selectedTheme];
    const isDark = selectedTheme === 'Dark' || selectedTheme === 'Dark + Compact';

    const ToolbarWithExport = (props: any) => (
        <GridToolbar
            {...props}
            globalSearch={true}
            rightContent={<ExportToolbar apiRef={props.apiRef} fallbackRows={rows} fallbackColumns={allColumns} />}
        />
    );

    return (
        <DocsLayout
            title="Theming"
            description="Customize the DataGrid appearance using CSS variables via the DataGridThemeProvider component. Supports built-in presets (Dark, Compact, Emerald) or fully custom themes."
            sourceCode={sourceCode}
        >
            <div className="theming-container">
                <p className="theming-description">
                    Click a theme preset below. Each one sets <code>--ogx-*</code> CSS
                    variables via <code>&lt;DataGridThemeProvider&gt;</code> — no CSS
                    files, no CSS-in-JS, just inline custom properties.
                </p>

                <div className="theming-controls">
                    {Object.keys(presetThemes).map(name => (
                        <button
                            key={name}
                            onClick={() => setSelectedTheme(name)}
                            className={`theme-preset-btn ${selectedTheme === name ? 'active' : ''}`}
                            style={{
                                border: selectedTheme === name
                                    ? `2px solid ${themeColors[name]}`
                                    : '2px solid #e0e0e0',
                                background: selectedTheme === name
                                    ? `${themeColors[name]}15`
                                    : '#fff',
                                color: selectedTheme === name
                                    ? themeColors[name]
                                    : '#555',
                            }}
                        >
                            <span
                                className="theme-indicator"
                                style={{ background: themeColors[name] }}
                            />
                            {name}
                        </button>
                    ))}
                </div>

                <div
                    className="grid-theme-preview-box"
                    style={{ background: isDark ? '#020617' : '#fff' }}
                >
                    <DataGridThemeProvider theme={theme}>
                        <DataGrid
                            rows={rows}
                            columns={allColumns}
                            checkboxSelection
                            rowSelectionModel={selectedRows}
                            onRowSelectionModelChange={setSelectedRows}
                            pagination
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            
                            filterModel={filterModel}
                            onFilterModelChange={setFilterModel}
                            aggregationModel={aggregationModel}
                            onAggregationModelChange={setAggregationModel}
                            pivotMode={pivotMode}
                            pivotModel={pivotModel}
                            onPivotModelChange={(m) => {
                                setPivotModel(m);
                                setPivotMode(true);
                            }}
                            columnVisibilityModel={columnVisibilityModel}
                            onColumnVisibilityModelChange={setColumnVisibilityModel}
                            
                            slots={{ toolbar: ToolbarWithExport }}

                            height={500}
                            rowHeight={selectedTheme.includes('Compact') ? 36 : undefined}
                            headerHeight={selectedTheme.includes('Compact') ? 40 : undefined}
                        />
                    </DataGridThemeProvider>
                </div>

                <details className="theme-json-toggle">
                    <summary>View theme object</summary>
                    <pre>{JSON.stringify(theme, null, 2)}</pre>
                </details>
            </div>
        </DocsLayout>
    );
}
