import { useState } from 'react';
import { DataGrid, GridColDef, useGridApiRef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './ClipboardDemo.css';

import sourceCode from './ClipboardDemo.tsx?raw';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 140 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 120, type: 'number', valueFormatter: ({ value }) => `$${value.toLocaleString()}` },
];

const rows = [
    { id: 1, firstName: 'Jon', lastName: 'Snow', email: 'jon.snow@winterfell.com', department: 'Defense', salary: 95000 },
    { id: 2, firstName: 'Cersei', lastName: 'Lannister', email: 'cersei@kingslanding.com', department: 'Management', salary: 140000 },
    { id: 3, firstName: 'Jaime', lastName: 'Lannister', email: 'jaime@kingslanding.com', department: 'Security', salary: 91000 },
    { id: 4, firstName: 'Arya', lastName: 'Stark', email: 'arya.stark@nowhere.com', department: 'Special Ops', salary: 65000 },
    { id: 5, firstName: 'Daenerys', lastName: 'Targaryen', email: 'dany@dragonstone.com', department: 'Leadership', salary: 155000 },
];

export default function ClipboardDemo() {
    const apiRef = useGridApiRef();
    const [lastCopied, setLastCopied] = useState<number | null>(null);

    const handleCopy = async () => {
        const selectedIds = apiRef.current.getSelectedRows();
        if (selectedIds.length === 0) {
            alert('Please select some rows first!');
            return;
        }

        await apiRef.current.copySelectedRows();

        setLastCopied(selectedIds.length);
        setTimeout(() => setLastCopied(null), 3000);
    };

    return (
        <DocsLayout
            title="Clipboard & Copy/Paste"
            description="Copy grid data directly to external applications like Excel or Google Sheets. Features include selection-only copying and preservation of formatted values."
            sourceCode={sourceCode}
        >
            <div className="clipboard-container">
                <div className="clipboard-instructions">
                    💡 <strong>How to use:</strong> Select one or more rows and press <code>Ctrl + C</code> (or <code>⌘ + C</code> on Mac).
                    The data will be copied in TSV format, ready to be pasted into any spreadsheet.
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button className="clipboard-btn" onClick={handleCopy}>
                        📋 Programmatic Copy
                    </button>

                    {lastCopied !== null && (
                        <div className="clipboard-status">
                            ✅ Succesfully copied {lastCopied} rows to clipboard!
                        </div>
                    )}
                </div>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    apiRef={apiRef}
                    height={400}
                />
            </div>
        </DocsLayout>
    );
}
