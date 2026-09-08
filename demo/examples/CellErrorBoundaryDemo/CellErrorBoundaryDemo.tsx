
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

const NAMES = ['Widget Alpha', 'Gadget Beta', 'Device Gamma', 'Tool Delta', 'Unit Epsilon',
    'Module Zeta', 'Part Eta', 'Block Theta', 'Core Iota', 'Chip Kappa'];

function makeRows(): Product[] {
    return Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `${NAMES[i % NAMES.length]} ${i + 1}`,
        price: parseFloat((9.99 + (i % 20) * 5).toFixed(2)),
        rating: (i % 5) + 1,
    }));
}

const THROW_IDS = new Set([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

const staticColumns: GridColDef<Product>[] = [
    { field: 'id',    headerName: 'ID',    width: 70,  type: 'number' },
    { field: 'name',  headerName: 'Name',  width: 220 },
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
    const [throwingIds, setThrowingIds] = useState<Set<number>>(new Set());
    const [rows, setRows] = useState<Product[]>(makeRows);

    const columns = useMemo<GridColDef<Product>[]>(() => [
        ...staticColumns,
        {
            field: 'rating',
            headerName: 'Rating',
            width: 160,
            renderCell: (params) => {
                if (throwingIds.has(params.row.id)) {
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
    ], [throwingIds]);

    const handleMakeThrow = () => {
        setThrowingIds(THROW_IDS);
        setRows(r => r.map(row => ({ ...row })));
    };

    const handleRestore = () => {
        setThrowingIds(new Set());
        // New row object references are required — resetKey={row} in Cell.tsx resets
        // the per-cell error boundary only when the row object reference changes.
        setRows(makeRows());
    };

    const isThrowActive = throwingIds.size > 0;

    return (
        <DocsLayout
            title="Cell Error Boundary"
            description="A renderCell that throws is caught per-cell — the rest of the grid continues rendering normally. Click 'Make 10 rows throw' to trigger errors, then 'Restore' to watch auto-recovery."
            sourceCode={sourceCode}
        >
            <p style={{ marginBottom: 12, color: '#475569', fontSize: '0.875rem' }}>
                Rows 10, 20, 30 … 100 have a <code>renderCell</code> that throws.{' '}
                <strong>CellErrorBoundary</strong> catches each throw and shows ⚠ in that cell
                only — the rest of the grid keeps rendering. Click <strong>Restore</strong> to
                reset all boundaries by providing fresh row references.
            </p>

            <div style={{ marginBottom: 16 }}>
                <button
                    onClick={isThrowActive ? handleRestore : handleMakeThrow}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: isThrowActive ? '#ef4444' : '#fff',
                        color:      isThrowActive ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: isThrowActive ? 600 : 400,
                    }}
                >
                    {isThrowActive ? 'Restore' : 'Make 10 rows throw'}
                </button>
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                height={460}
                pagination
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            />
        </DocsLayout>
    );
}
