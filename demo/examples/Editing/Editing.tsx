
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Editing.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Editing.tsx?raw';

type MockRow = (typeof mockRows)[number];

export default function EditingExample() {
    const handleProcessRowUpdate = (newRow: MockRow) => {
        console.log('Row updated:', newRow);
        return newRow;
    };

    return (
        <DocsLayout
            title="Cell Editing"
            description="Inline cell editing with text, number, and dropdown inputs. Double-click any cell to enter edit mode; press Enter or click outside to confirm."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                pageSizeOptions={[5, 10, 25, 50]}
                pagination={true}
                processRowUpdate={handleProcessRowUpdate}
                initialState={{
                    pagination: { paginationModel: { pageSize: 15, page: 0 } }
                }}
            />
        </DocsLayout>
    );
}
