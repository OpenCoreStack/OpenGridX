'use client';

import { useState } from 'react';
import { DataGrid, GridToolbar, exportToExcelAdvanced, type GridColDef } from '@opencorestack/opengridx';
import type { Order } from '../lib/orders';

// Column functions such as valueFormatter cannot cross from a Server Component: columns live here.
const columns: GridColDef<Order>[] = [
    { field: 'id', headerName: 'ID', type: 'number', width: 80 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 140, valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` },
    { field: 'shipped', headerName: 'Shipped', type: 'boolean', width: 110 },
];

export function OrdersGrid({ rows }: { rows: Order[] }) {
    const [status, setStatus] = useState('');
    return (
        <>
            <button
                type="button"
                data-testid="export-xlsx"
                onClick={() => {
                    exportToExcelAdvanced(rows, columns).then(() => setStatus('exported'), (e: unknown) => setStatus(e instanceof Error ? e.message : String(e)));
                }}
            >
                Export .xlsx
            </button>
            <output data-testid="status">{status}</output>
            <DataGrid rows={rows} columns={columns} height={480} checkboxSelection headerFilters slots={{ toolbar: GridToolbar }} />
        </>
    );
}
