import { DataGrid, Button } from '../../../lib';
import type { GridColDef, GridFilterModel } from '../../../lib';
import { useState } from 'react';

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
    const [showStandalone, setShowStandalone] = useState(false);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    return (
        <div style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2 style={{ marginBottom: '16px' }}>Component: Filter Panel</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                OpenGridX provides an advanced Filter Panel with multi-logic support (AND/OR). It can be used via the toolbar or applied programmatically.
            </p>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <Button variant="outlined" onClick={() => setShowStandalone(!showStandalone)}>
                    {showStandalone ? 'Hide Filter State Panel' : 'Show Active Filter State'}
                </Button>
            </div>

            {showStandalone && (
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc',
                }}>
                    <h4 style={{ marginBottom: '8px' }}>Active Filter Model (JSON):</h4>
                    <pre style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                        {JSON.stringify(filterModel, null, 2)}
                    </pre>
                    <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        Active Filters: <strong>{filterModel.items?.length ?? 0}</strong>. Use the filter icon in the toolbar to add filters.
                    </p>
                </div>
            )}

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                />
            </div>
        </div>
    );
}
