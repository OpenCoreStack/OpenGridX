
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
} from '../../../lib';
import type { GridTheme } from '../../../lib';
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

export default function ThemingDemo() {
    const [rows] = useState(() => generateEmployees(500));
    const [selectedTheme, setSelectedTheme] = useState('Default');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

    const theme = presetThemes[selectedTheme];
    const isDark = selectedTheme === 'Dark' || selectedTheme === 'Dark + Compact';

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
