import { useMemo, useState } from 'react';
import { DataGrid, FilterPanel, GridToolbar } from '@opencorestack/opengridx';
import type { GridColDef, GridFilterModel } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './HeaderFiltersDemo.css';
import sourceCode from './HeaderFiltersDemo.tsx?raw';

type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Returned';

interface Order {
    id: number;
    orderNo: string;
    customer: string;
    quantity: number;
    total: number;
    ordered: Date;
    paid: boolean;
    status: OrderStatus;
    notes: string;
}

const STATUSES: OrderStatus[] = ['Pending', 'Shipped', 'Delivered', 'Returned'];
const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries', 'Wayne Enterprises', 'Wonka', 'Tyrell', 'Cyberdyne'];
const NOTES = ['', 'Gift wrap', 'Leave at door', '', 'Fragile', '', 'Call on arrival', ''];

/** Deterministic rows, so the page looks the same on every visit. */
function makeOrders(count: number): Order[] {
    let seed = 7;
    const next = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
    const start = new Date(2026, 0, 1).getTime();
    return Array.from({ length: count }, (_, i) => {
        const quantity = 1 + Math.floor(next() * 20);
        return {
            id: i + 1,
            orderNo: `SO-${String(10001 + i)}`,
            customer: CUSTOMERS[Math.floor(next() * CUSTOMERS.length)],
            quantity,
            total: Math.round(quantity * (5 + next() * 95) * 100) / 100,
            ordered: new Date(start + Math.floor(next() * 270) * 86400000),
            paid: next() > 0.35,
            status: STATUSES[Math.floor(next() * STATUSES.length)],
            notes: NOTES[Math.floor(next() * NOTES.length)],
        };
    });
}

const COLUMNS: GridColDef<Order>[] = [
    { field: 'orderNo', headerName: 'Order', width: 120 },
    { field: 'customer', headerName: 'Customer', width: 180 },
    { field: 'quantity', headerName: 'Qty', type: 'number', width: 110 },
    // Starts with ">=" instead of the number default "=".
    { field: 'total', headerName: 'Total', type: 'number', width: 130, headerFilterOperator: '>=',
      valueFormatter: ({ value }) => (typeof value === 'number' ? `$${value.toFixed(2)}` : '') },
    { field: 'ordered', headerName: 'Ordered', type: 'date', width: 150 },
    { field: 'paid', headerName: 'Paid', type: 'boolean', width: 110 },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 140 },
    // No filter cell for this column.
    { field: 'notes', headerName: 'Notes', width: 160, headerFilter: false },
];

/** A model the row cannot show: OR at the root. The cells show "Custom filter" and leave it alone. */
const OR_MODEL: GridFilterModel = {
    logicOperator: 'or',
    items: [
        { id: 'panel-1', field: 'status', operator: 'is', value: 'Returned' },
        { id: 'panel-2', field: 'total', operator: '>', value: 1500 },
    ],
};

const EMPTY_MODEL: GridFilterModel = { items: [] };

export default function HeaderFiltersDemo() {
    const rows = useMemo(() => makeOrders(500), []);
    const [headerFilters, setHeaderFilters] = useState(true);
    const [filterModel, setFilterModel] = useState<GridFilterModel>(EMPTY_MODEL);

    return (
        <DocsLayout
            title="Header Filters"
            description="A filter row under the column headers: a text box, number, date or select per column, an operator menu and a clear button. It edits the same filterModel as the filter panel and the quick filter, so all three stay in sync."
            sourceCode={sourceCode}
        >
            <div className="header-filters-controls">
                <label className="header-filters-control">
                    <input type="checkbox" checked={headerFilters} onChange={(e) => setHeaderFilters(e.target.checked)} />
                    <code>headerFilters</code>
                </label>
                <button type="button" className="header-filters-button" onClick={() => setFilterModel(OR_MODEL)}>
                    Apply an OR model
                </button>
                <button type="button" className="header-filters-button" onClick={() => setFilterModel(EMPTY_MODEL)}>
                    Clear all
                </button>
            </div>
            <div className="header-filters-hint">
                Type in a filter cell, or focus a header and press <kbd>↓</kbd> then <kbd>Enter</kbd>. The small button left of each
                box picks the operator (<kbd>Alt</kbd>+<kbd>↓</kbd> from the keyboard). <em>Order</em> is pinned left, <em>Total</em> starts
                with <code>&gt;=</code> and <em>Notes</em> sets <code>headerFilter: false</code>. After <em>Apply an OR model</em> the cells show
                &ldquo;Custom filter&rdquo;; click one to open the toolbar&rsquo;s filter panel.
            </div>

            <div className="header-filters-layout">
                <div className="header-filters-grid">
                    <DataGrid
                        rows={rows}
                        columns={COLUMNS}
                        headerFilters={headerFilters}
                        filterModel={filterModel}
                        onFilterModelChange={setFilterModel}
                        pinnedColumns={{ left: ['orderNo'] }}
                        slots={{ toolbar: GridToolbar }}
                        height={560}
                    />
                </div>
                <aside className="header-filters-side" aria-label="Shared filter model">
                    <section>
                        <h3>Filter panel</h3>
                        <p>The same model, edited here. Items the header row owns have <code>id: &quot;header:&lt;field&gt;&quot;</code>.</p>
                        <div className="header-filters-panel">
                            <FilterPanel
                                columns={COLUMNS as unknown as GridColDef[]}
                                filterModel={filterModel}
                                onFilterModelChange={setFilterModel}
                            />
                        </div>
                    </section>
                    <section>
                        <h3>filterModel</h3>
                        <pre className="header-filters-model" data-testid="filter-model">{JSON.stringify(filterModel, null, 2)}</pre>
                    </section>
                </aside>
            </div>

            <div className="header-filters-usage">
                <strong>Usage:</strong>
                <pre>{`const columns: GridColDef[] = [
  { field: 'customer', headerName: 'Customer' },                       // text, "contains"
  { field: 'total', type: 'number', headerFilterOperator: '>=' },      // starts with >=
  { field: 'status', type: 'singleSelect', valueOptions: STATUSES },   // select, "is"
  { field: 'notes', headerFilter: false },                             // no filter cell
];

<DataGrid
  rows={rows}
  columns={columns}
  headerFilters
  headerFilterHeight={40}
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
/>`}</pre>
            </div>
        </DocsLayout>
    );
}
