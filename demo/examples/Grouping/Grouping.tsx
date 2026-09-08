
import { DataGrid, exportToCsv, exportToJson, exportToExcel, useGridApiRef } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Grouping.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Grouping.tsx?raw';
import { Button } from '../../../lib/components/ui/Button';

// Override selected columns to demonstrate v2.0 grouping features:
//   - groupingValueFormatter: custom label for group-header rows
//   - groupable: false: prevents a column from being used as a grouping key
const groupingColumns: GridColDef[] = columnDefinitions.map((col) => {
    if (col.field === 'department') {
        return {
            ...col,
            groupingValueFormatter: ({ value }) => `📁 ${String(value)}`,
        };
    }
    if (col.field === 'country') {
        return {
            ...col,
            groupingValueFormatter: ({ value }) => `🌍 ${String(value)}`,
        };
    }
    // Prevent grouping by the id column
    if (col.field === 'id') {
        return { ...col, groupable: false };
    }
    return col;
});

export default function GroupingExample() {
    const apiRef = useGridApiRef();

    const handleGroupedCsv = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToCsv(mockRows, groupingColumns, {
            fileName: 'grouped-export.csv',
            groupedRows: groupedRows ?? undefined,
        });
    };

    const handleGroupedExcel = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToExcel(mockRows, groupingColumns, {
            fileName: 'grouped-export.xls',
            groupedRows: groupedRows ?? undefined,
        });
    };

    const handleGroupedJson = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToJson(mockRows, groupingColumns, {
            fileName: 'grouped-export.json',
            groupedRows: groupedRows ?? undefined,
        });
    };

    return (
        <DocsLayout
            title="Row Grouping"
            description="Group rows by any column value. groupingValueFormatter customizes group-header labels; groupable:false prevents a field from being used as a grouping key; groupingColDef pins the expand/collapse indicator to its own dedicated column."
            sourceCode={sourceCode}
        >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" onClick={handleGroupedCsv}>Export CSV (grouped)</Button>
                <Button variant="secondary" size="sm" onClick={handleGroupedExcel}>Export Excel (grouped)</Button>
                <Button variant="secondary" size="sm" onClick={handleGroupedJson}>Export JSON (grouped)</Button>
            </div>
            <DataGrid
                apiRef={apiRef}
                rows={mockRows}
                columns={groupingColumns}
                rowGroupingModel={['department', 'country']}
                groupingColDef={{ headerName: 'Group', width: 220 }}
                pagination={true}
                pageSizeOptions={[10, 25, 50]}
            />
        </DocsLayout>
    );
}
