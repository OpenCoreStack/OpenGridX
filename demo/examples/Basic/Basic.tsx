
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Basic.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Basic.tsx?raw';

export default function BasicExample() {
    return (
        <DocsLayout
            title="Basic Usage"
            description="The starting point for OpenGridX. Demonstrates pagination, checkbox selection, sorting, and column configuration with a real-world employee dataset."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                pagination={true}
                height={500}
                checkboxSelection
                initialState={{
                    pagination: { paginationModel: { pageSize: 25, page: 0 } }
                }}
            />
        </DocsLayout>
    );
}
