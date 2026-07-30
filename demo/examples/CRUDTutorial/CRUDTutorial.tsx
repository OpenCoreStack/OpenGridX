import { DataGrid, GridToolbar, Button, GridRenderCellParams } from '@opencorestack/opengridx';
import { useState, useCallback, useMemo } from 'react';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CRUDTutorial.tsx?raw';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const initialRows: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Developer' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Manager' },
];

export default function CRUDTutorial() {
    const [rows, setRows] = useState<User[]>(initialRows);

    const deleteUser = useCallback((id: number) => {
        setRows(prev => prev.filter(row => row.id !== id));
    }, []);

    const addUser = useCallback(() => {
        const id = Math.max(...rows.map(r => r.id), 0) + 1;
        const newUser = { id, name: 'New User', email: 'new@example.com', role: 'Contributor' };
        setRows(prev => [newUser, ...prev]);
    }, [rows]);

    const processRowUpdate = useCallback((newRow: User, oldRow: User) => {
        setRows(prev => prev.map(r => r.id === oldRow.id ? newRow : r));
        return newRow;
    }, []);

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', width: 200, editable: true },
        { field: 'email', headerName: 'Email', width: 250, editable: true },
        { field: 'role', headerName: 'Role', width: 150, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params: GridRenderCellParams<User>) => (
                <Button
                    size="small"
                    variant="outlined"
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => deleteUser(params.row.id)}
                >
                    Delete
                </Button>
            )
        }
    ], [deleteUser]);

    return (
        <DocsLayout
            title="Interactive CRUD"
            description="A complete create-read-update-delete tutorial. Add rows, inline-edit any cell, and delete rows — with optimistic updates and type-safe row processing."
            sourceCode={sourceCode}
        >
            <Button onClick={addUser}>➕ Add User</Button>
            <DataGrid
                rows={rows}
                columns={columns}
                processRowUpdate={processRowUpdate}
                height={400}
                slots={{ toolbar: GridToolbar }}
            />
        </DocsLayout>
    );
}
