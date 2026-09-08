
import { DataGrid, exportToCsv, exportToJson, exportToExcel, useGridApiRef } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Grouping.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Grouping.tsx?raw';
import { Button } from '../../../lib/components/ui/Button';

export default function GroupingExample() {
    const apiRef = useGridApiRef();

    const handleGroupedCsv = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToCsv(mockRows, columnDefinitions, {
            fileName: 'grouped-export.csv',
            groupedRows: groupedRows ?? undefined,
        });
    };

    const handleGroupedExcel = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToExcel(mockRows, columnDefinitions, {
            fileName: 'grouped-export.xls',
            groupedRows: groupedRows ?? undefined,
        });
    };

    const handleGroupedJson = () => {
        const groupedRows = apiRef.current.getGroupedExportRows();
        exportToJson(mockRows, columnDefinitions, {
            fileName: 'grouped-export.json',
            groupedRows: groupedRows ?? undefined,
        });
    };

    return (
        <DocsLayout
            title="Row Grouping"
            description="Group rows by any column value. OpenGridX aggregates child rows automatically and shows group counts in collapsible parent rows. The grouped structure can be preserved in exports via getGroupedExportRows()."
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
                columns={columnDefinitions}
                rowGroupingModel={['department', 'country']}
                pagination={true}
                pageSizeOptions={[10, 25, 50]}
            />
        </DocsLayout>
    );
}
