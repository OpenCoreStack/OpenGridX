import { useState } from 'react';
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';
import type { GridColDef, GridFilterModel } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';

import sourceCode from './FilterPanelDemo.tsx?raw';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
}

const rows: Product[] = [
    { id: 1, name: 'iPhone 15', category: 'Electronics', price: 999, stock: 45 },
    { id: 2, name: 'MacBook Pro', category: 'Electronics', price: 1999, stock: 12 },
    { id: 3, name: 'Office Chair', category: 'Furniture', price: 299, stock: 8 },
    { id: 4, name: 'Coffee Mug', category: 'Kitchen', price: 15, stock: 120 },
    { id: 5, name: 'Standing Desk', category: 'Furniture', price: 549, stock: 15 },
];

const columns: GridColDef<Product>[] = [
    { field: 'name', headerName: 'Product', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'price', headerName: 'Price', width: 120, type: 'number' },
    { field: 'stock', headerName: 'In Stock', width: 120, type: 'number' },
];

export default function FilterPanelDemo() {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    return (
        <DocsLayout
            title="Filter Panel"
            description="OpenGridX provides an advanced Filter Panel with multi-logic support (AND/OR). Click the filter icon in the toolbar to open the panel and apply filters per column."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                height={420}
                slots={{ toolbar: GridToolbar }}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
            />

            {filterModel.items.length > 0 && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc',
                }}>
                    <strong style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Active Filter Model ({filterModel.items.length} filter{filterModel.items.length !== 1 ? 's' : ''})
                    </strong>
                    <pre style={{ fontSize: '0.75rem', color: '#475569', margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(filterModel, null, 2)}
                    </pre>
                </div>
            )}
        </DocsLayout>
    );
}
