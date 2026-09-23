import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Editing.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Editing.tsx?raw';

type MockRow = (typeof mockRows)[number];

// A computed column: valueGetter derives the value, valueSetter writes an edit back to its source fields.
const fullNameColumn: GridColDef = {
    field: 'fullName',
    headerName: 'Full name',
    width: 180,
    editable: true,
    valueGetter: ({ row }) => `${String(row.firstName ?? '')} ${String(row.lastName ?? '')}`.trim(),
    valueSetter: ({ value, row }): GridRowModel => {
        const [firstName = '', ...rest] = String(value ?? '').trim().split(/\s+/);
        return { ...row, firstName, lastName: rest.join(' ') };
    },
};

const columns: GridColDef[] = [columnDefinitions[0], fullNameColumn, ...columnDefinitions.slice(1)];

export default function EditingExample() {
    const handleProcessRowUpdate = (newRow: MockRow) => {
        console.log('Row updated:', newRow);
        return newRow;
    };

    return (
        <DocsLayout
            title="Cell Editing"
            description="Inline cell editing with text, number, and dropdown inputs. Double-click any cell (or press Enter) to enter edit mode; press Enter, Tab or click outside to confirm, Escape to cancel. 'Full name' is a computed column edited through valueSetter."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columns}
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
