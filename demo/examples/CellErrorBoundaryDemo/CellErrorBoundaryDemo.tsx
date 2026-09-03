
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CellErrorBoundaryDemo.tsx?raw';
import './CellErrorBoundaryDemo.css';

interface Product {
    id: number;
    name: string;
    price: number;
    rating: number;
}

const baseRows: Product[] = [
    { id: 1, name: 'Widget Alpha',  price: 29.99,  rating: 4 },
    { id: 2, name: 'Gadget Beta',   price: 49.99,  rating: 3 },
    { id: 3, name: 'Device Gamma',  price: 99.99,  rating: 5 },
    { id: 4, name: 'Tool Delta',    price: 19.99,  rating: 2 },
    { id: 5, name: 'Unit Epsilon',  price: 74.99,  rating: 4 },
    { id: 6, name: 'Module Zeta',   price: 39.99,  rating: 5 },
    { id: 7, name: 'Part Eta',      price: 14.99,  rating: 3 },
    { id: 8, name: 'Block Theta',   price: 59.99,  rating: 1 },
];

const staticColumns: GridColDef<Product>[] = [
    { field: 'id',    headerName: 'ID',    width: 70,  type: 'number' },
    { field: 'name',  headerName: 'Name',  width: 200 },
    {
        field: 'price',
        headerName: 'Price',
        width: 110,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (params) => `$${(params.value as number).toFixed(2)}`,
    },
];

export default function CellErrorBoundaryDemo() {
    const [forceThrow, setForceThrow] = useState(false);
    // Changing rows reference resets the per-cell error boundaries (resetKey).
    const [rows, setRows] = useState<Product[]>(baseRows);

    const columns = useMemo<GridColDef<Product>[]>(() => [
        ...staticColumns,
        {
            field: 'rating',
            headerName: 'Rating',
            width: 160,
            renderCell: (params) => {
                if (forceThrow || params.row.id % 3 === 0) {
                    throw new Error(`Cannot render rating for row ${params.row.id}`);
                }
                const rating = params.value as number;
                return (
                    <span>
                        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    </span>
                );
            },
        },
    ], [forceThrow]);

    const handleToggle = () => {
        const next = !forceThrow;
        setForceThrow(next);
        // Produce a new rows array so the grid sees fresh data and resets boundaries.
        setRows(baseRows.map((r) => ({ ...r })));
    };

    return (
        <DocsLayout
            title="Cell Error Boundary"
            description="A renderCell that throws is caught per-cell by CellErrorBoundary (v1.1.0) — the rest of the grid continues rendering normally. When data changes the boundary auto-recovers."
            sourceCode={sourceCode}
        >
            <p style={{ marginBottom: 12, color: '#475569', fontSize: '0.875rem' }}>
                Rows 3 and 6 have a <code>renderCell</code> that throws. The{' '}
                <strong>CellErrorBoundary</strong> (v1.1.0) catches the error and shows ⚠ in that cell
                only — the rest of the grid keeps rendering. Click &quot;Make all rows throw&quot; to see
                every rating cell fail, then &quot;Restore&quot; to watch the auto-recovery via the
                internal <code>resetKey</code>.
            </p>

            <div style={{ marginBottom: 16 }}>
                <button
                    onClick={handleToggle}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: forceThrow ? '#ef4444' : '#fff',
                        color:      forceThrow ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: forceThrow ? 600 : 400,
                    }}
                >
                    {forceThrow ? 'Restore' : 'Make all rows throw'}
                </button>
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                height={400}
                pagination
                pageSizeOptions={[8, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 8, page: 0 } } }}
            />
        </DocsLayout>
    );
}
