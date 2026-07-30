
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Grouping.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Grouping.tsx?raw';

export default function GroupingExample() {
    return (
        <DocsLayout
            title="Row Grouping"
            description="Group rows by any column value. OpenGridX aggregates child rows automatically and shows group counts in collapsible parent rows."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                rowGroupingModel={['department', 'country']}
                pagination={true}
                pageSizeOptions={[10, 25, 50]}
            />
        </DocsLayout>
    );
}
