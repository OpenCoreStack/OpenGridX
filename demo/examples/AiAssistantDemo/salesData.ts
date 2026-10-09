import type { GridColDef } from '@opencorestack/opengridx';

export interface Sale {
    id: number;
    orderNo: string;
    orderDate: string;
    customer: string;
    region: string;
    product: string;
    amt_usd: number;
    units: number;
    status: 'Open' | 'Paid' | 'Overdue';
    priority: boolean;
}

export const REGIONS = ['North', 'South', 'East', 'West'];
export const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries'];
export const PRODUCTS = ['Laptop', 'Monitor', 'Dock', 'Keyboard', 'Headset'];
export const STATUSES: Sale['status'][] = ['Open', 'Paid', 'Overdue'];

/** Deterministic rows, so every visit shows the same data. */
export function makeSales(count: number): Sale[] {
    let seed = 11;
    const next = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
    return Array.from({ length: count }, (_, i) => {
        const units = 1 + Math.floor(next() * 40);
        const day = new Date(2026, 0, 1 + Math.floor(next() * 270));
        return {
            id: i + 1,
            orderNo: `SO-${String(20_000 + i)}`,
            orderDate: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
            customer: CUSTOMERS[Math.floor(next() * CUSTOMERS.length)],
            region: REGIONS[Math.floor(next() * REGIONS.length)],
            product: PRODUCTS[Math.floor(next() * PRODUCTS.length)],
            amt_usd: Math.round(units * (80 + next() * 900)),
            units,
            status: STATUSES[Math.floor(next() * STATUSES.length)],
            priority: next() > 0.7,
        };
    });
}

const usd = (value: unknown) => (typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : '');

// headerName and description go into the schema, so the model can map "revenue" to amt_usd.
export const SALES_COLUMNS: GridColDef<Sale>[] = [
    { field: 'orderNo', headerName: 'Order', width: 110, groupable: false },
    { field: 'orderDate', headerName: 'Order date', type: 'date', width: 120 },
    { field: 'customer', headerName: 'Customer', width: 160, aiExamples: ['Acme Corp', 'Globex'] },
    { field: 'region', headerName: 'Region', width: 100, aiExamples: REGIONS },
    { field: 'product', headerName: 'Product', width: 120 },
    { field: 'amt_usd', headerName: 'Revenue', description: 'Order revenue in US dollars', type: 'number', width: 130, valueFormatter: ({ value }) => usd(value) },
    { field: 'units', headerName: 'Units', type: 'number', width: 90 },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 110 },
    { field: 'priority', headerName: 'Priority', type: 'boolean', width: 90, hideable: false },
];
