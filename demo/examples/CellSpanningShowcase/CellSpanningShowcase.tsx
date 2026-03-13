
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './CellSpanningShowcase.css';

interface User {
    id: number;
    username: string;
    email: string;
    organization: string;
    role: string;
    location: string;
    age: number;
}

function SimpleColumnSpanExample() {
    const [rows] = useState<User[]>([
        { id: 1, username: 'Ash', email: 'ash@example.com', organization: '', role: 'Lead', location: 'London', age: 20 },
        { id: 2, username: 'John', email: 'john@example.com', organization: '', role: 'Senior', location: 'New York', age: 25 },
        { id: 3, username: 'Alice', email: 'alice@google.com', organization: 'Google', role: 'Engineer', location: 'Mountain View', age: 28 },
        { id: 4, username: 'Bob', email: 'bob@example.com', organization: '', role: 'Junior', location: 'Berlin', age: 32 },
        { id: 5, username: 'Charlie', email: 'charlie@openai.com', organization: 'OpenAI', role: 'Scientist', location: 'San Francisco', age: 35 },
        { id: 6, username: 'Diana', email: 'diana@example.com', organization: '', role: 'Manager', location: 'Paris', age: 29 },
        { id: 7, username: 'Edward', email: 'ed@microsoft.com', organization: 'Microsoft', role: 'Architect', location: 'Seattle', age: 40 },
        { id: 8, username: 'Fay', email: 'fay@apple.com', organization: 'Apple', role: 'Designer', location: 'Cupertino', age: 31 },
        { id: 9, username: 'George', email: 'george@meta.com', organization: 'Meta', role: 'Director', location: 'Menlo Park', age: 45 },
        { id: 10, username: 'Hannah', email: 'hannah@example.com', organization: '', role: 'Intern', location: 'Tokyo', age: 21 },
        { id: 11, username: 'Ian', email: 'ian@amazon.com', organization: 'Amazon', role: 'Manager', location: 'Seattle', age: 38 },
        { id: 12, username: 'Julia', email: 'julia@netflix.com', organization: 'Netflix', role: 'Engine', location: 'Los Gatos', age: 27 },
        { id: 13, username: 'Kevin', email: 'kevin@example.com', organization: '', role: 'Specialist', location: 'Dublin', age: 33 },
        { id: 14, username: 'Laura', email: 'laura@tesla.com', organization: 'Tesla', role: 'Engineer', location: 'Austin', age: 26 },
        { id: 15, username: 'Mike', email: 'mike@example.com', organization: '', role: 'Admin', location: 'Sydney', age: 30 }
    ]);

    const columns = useMemo<GridColDef<User>[]>(() => [
        { field: 'id', headerName: 'ID', width: 60 },
        { field: 'username', headerName: 'Username', width: 130 },
        {
            field: 'email',
            headerName: 'Email',
            width: 180,
            renderCell: (params) => params.row.organization === '' ? null : params.value
        },
        {
            field: 'organization',
            headerName: 'Organization / Full Span Info',
            width: 250,
            colSpan: (params) => {
                if (params.row.organization === '') {
                    return 3; // Span Email, Organization, and Role
                }
                return 1;
            },
            renderCell: (params) => {
                if (params.row.organization === '') {
                    return (
                        <div className="self-employed-cell">
                            Self-Employed / Personal Contact: {params.row.email}
                        </div>
                    );
                }
                return params.value;
            }
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 130,
            renderCell: (params) => params.row.organization === '' ? null : params.value
        },
        { field: 'location', headerName: 'Location', width: 140 },
        { field: 'age', headerName: 'Age', width: 80, type: 'number' }
    ], []);

    return (
        <div className="spanning-section">
            <h3>1. Simple Column Spanning</h3>
            <p>
                When the organization field is empty, it spans across both organization and age columns.
            </p>
            <div className="spanning-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height={450}
                    rowHeight={48}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

interface InvoiceItem {
    id: number;
    sku?: string;
    item: string;
    category?: string;
    quantity?: number;
    price?: number;
    discount?: number;
    total?: number;
    isSubtotal?: boolean;
    isTax?: boolean;
    isTotal?: boolean;
    taxRate?: string;
}

function InvoiceExample() {
    const [rows] = useState<InvoiceItem[]>([
        { id: 1, sku: 'ACC-001', item: 'Paperclip', category: 'Stationery', quantity: 100, price: 1.99, discount: 0, total: 199.00 },
        { id: 2, sku: 'ACC-002', item: 'Paper', category: 'Stationery', quantity: 10, price: 30.00, discount: 0, total: 300.00 },
        { id: 3, sku: 'ACC-003', item: 'Pencil', category: 'Stationery', quantity: 100, price: 1.25, discount: 0, total: 125.00 },
        { id: 7, sku: 'HW-001', item: 'Keyboard', category: 'Hardware', quantity: 5, price: 49.99, discount: 10, total: 249.95 },
        { id: 8, sku: 'HW-002', item: 'Mouse', category: 'Hardware', quantity: 15, price: 25.00, discount: 5, total: 375.00 },
        { id: 9, sku: 'HW-003', item: 'Monitor', category: 'Hardware', quantity: 2, price: 199.99, discount: 50, total: 399.98 },
        { id: 10, sku: 'ACC-004', item: 'Charger', category: 'Accessories', quantity: 20, price: 15.99, discount: 0, total: 319.80 },
        { id: 11, sku: 'ACC-005', item: 'Case', category: 'Accessories', quantity: 30, price: 12.50, discount: 5, total: 375.00 },
        { id: 12, sku: 'ACC-006', item: 'Screen Protector', category: 'Accessories', quantity: 50, price: 8.99, discount: 0, total: 449.50 },
        { id: 13, sku: 'HW-004', item: 'USB Hub', category: 'Hardware', quantity: 8, price: 35.00, discount: 8, total: 280.00 },
        { id: 14, sku: 'ACC-007', item: 'Notebook', category: 'Stationery', quantity: 25, price: 5.50, discount: 0, total: 137.50 },
        { id: 4, item: 'Subtotal', total: 3210.73, isSubtotal: true },
        { id: 5, item: 'Tax', taxRate: '12%', total: 385.29, isTax: true },
        { id: 6, item: 'Grand Total', total: 3596.02, isTotal: true }
    ]);

    const columns = useMemo<GridColDef<InvoiceItem>[]>(() => [
        { field: 'id', headerName: 'ID', width: 60 },
        { field: 'sku', headerName: 'SKU', width: 100 },
        {
            field: 'item',
            headerName: 'Item/Description',
            width: 220,
            colSpan: (params) => {
                if (params.row.isSubtotal || params.row.isTotal) return 5;
                if (params.row.isTax) return 4;
                return 1;
            },
            renderCell: (params) => {
                const isSummary = params.row.isSubtotal || params.row.isTax || params.row.isTotal;
                const isTotal = params.row.isTotal;
                return (
                    <div style={{
                        fontWeight: isTotal ? 700 : (isSummary ? 600 : 400),
                        fontSize: isTotal ? '1.1em' : '1em'
                    }}>
                        {params.value}
                    </div>
                );
            }
        },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'quantity', headerName: 'Qty', width: 80, type: 'number', align: 'right' },
        {
            field: 'price',
            headerName: 'Price',
            width: 100,
            type: 'number',
            align: 'right',
            valueFormatter: ({ value }) => value != null ? `$${value.toFixed(2)}` : ''
        },
        {
            field: 'discount',
            headerName: 'Discount',
            width: 100,
            type: 'number',
            align: 'right',
            renderCell: (params) => {
                if (params.row.isTax) return <div className="invoice-tax-rate">Rate: {params.row.taxRate}</div>;
                return params.value != null ? `$${params.value.toFixed(2)}` : '';
            }
        },
        {
            field: 'total',
            headerName: 'Total ($)',
            width: 120,
            type: 'number',
            align: 'right',
            renderCell: (params) => {
                const isSummary = params.row.isSubtotal || params.row.isTax || params.row.isTotal;
                return (
                    <div className="invoice-summary-cell" style={{
                        fontWeight: isSummary ? 700 : 400,
                        fontSize: params.row.isTotal ? '1.1em' : '1em',
                        color: params.row.isTotal ? '#1e293b' : 'inherit'
                    }}>
                        {params.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                );
            }
        }
    ], []);

    return (
        <div className="spanning-section">
            <h3>2. Invoice with Subtotal, Tax, and Total</h3>
            <p>
                Summary rows (Subtotal, Tax, Total) use column spanning to merge cells for a cleaner invoice layout.
            </p>
            <div className="spanning-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height={400}
                    rowHeight={48}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

interface ScheduleSlot {
    id: number;
    day: string;
    slot1: string;
    slot2: string;
    slot3: string;
    slot4: string;
    slot5: string;

    slot1ColSpan?: number;
    slot2ColSpan?: number;
    slot3ColSpan?: number;
    slot4ColSpan?: number;
    slot5ColSpan?: number;
}

const subjectColors: Record<string, string> = {
    'Maths': '#4caf50',
    'English': '#9c9c00',
    'Physics': '#2196f3',
    'Chemistry': '#c17171',
    'Lab': '#757575',
    'Music': '#b8860b',
    'Dance': '#9575cd'
};

const getSubjectStyle = (subject: string): React.CSSProperties => ({
    backgroundColor: subjectColors[subject] || '#666',
    color: 'white',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '0 8px'
});

function TimetableExample() {
    const [rows] = useState<ScheduleSlot[]>([
        {
            id: 1,
            day: 'Monday',
            slot1: 'Maths',
            slot2: 'English',
            slot3: 'English',
            slot4: 'Lab',
            slot5: '',
            slot2ColSpan: 2 // English spans 2 slots
        },
        {
            id: 2,
            day: 'Tuesday',
            slot1: 'Chemistry',
            slot2: 'Chemistry',
            slot3: 'Chemistry',
            slot4: 'Physics',
            slot5: '',
            slot1ColSpan: 3 // Chemistry spans 3 slots
        },
        {
            id: 3,
            day: 'Wednesday',
            slot1: 'Physics',
            slot2: 'English',
            slot3: 'Maths',
            slot4: 'Maths',
            slot5: '',
            slot3ColSpan: 2 // Maths spans 2 slots
        },
        {
            id: 4,
            day: 'Thursday',
            slot1: 'Music',
            slot2: 'Music',
            slot3: 'Chemistry',
            slot4: 'Chemistry',
            slot5: '',
            slot1ColSpan: 2, // Music spans 2 slots
            slot3ColSpan: 2  // Chemistry spans 2 slots
        },
        {
            id: 5,
            day: 'Friday',
            slot1: 'Maths',
            slot2: 'Dance',
            slot3: 'Physics',
            slot4: 'Physics',
            slot5: 'Chemistry',
            slot3ColSpan: 2
        },
        {
            id: 6,
            day: 'Saturday',
            slot1: 'Music',
            slot2: 'Music',
            slot3: 'Music',
            slot4: 'Lab',
            slot5: 'Lab',
            slot1ColSpan: 3,
            slot4ColSpan: 2
        },
        {
            id: 7,
            day: 'Sunday',
            slot1: 'Dance',
            slot2: 'Dance',
            slot3: 'English',
            slot4: 'English',
            slot5: 'Maths',
            slot1ColSpan: 2,
            slot3ColSpan: 2
        }
    ]);

    const columns = useMemo<GridColDef<ScheduleSlot>[]>(() => [
        {
            field: 'day',
            headerName: 'Day',
            width: 120,
            sortable: false
        },
        {
            field: 'slot1',
            headerName: '09:00 - 10:00',
            width: 140,
            sortable: false,
            colSpan: (params) => params.row.slot1ColSpan || 1,
            renderCell: (params) => {
                if (!params.value) return null;
                return <div style={getSubjectStyle(params.value)}>{params.value}</div>;
            }
        },
        {
            field: 'slot2',
            headerName: '10:00 - 11:00',
            width: 140,
            sortable: false,
            colSpan: (params) => params.row.slot2ColSpan || 1,
            renderCell: (params) => {
                if (!params.value) return null;

                if (params.row.slot1ColSpan && params.row.slot1ColSpan > 1) {
                    return null;
                }
                return <div style={getSubjectStyle(params.value)}>{params.value}</div>;
            }
        },
        {
            field: 'slot3',
            headerName: '11:00 - 12:00',
            width: 140,
            sortable: false,
            colSpan: (params) => params.row.slot3ColSpan || 1,
            renderCell: (params) => {
                if (!params.value) return null;

                if (params.row.slot1ColSpan && params.row.slot1ColSpan > 2) return null;
                if (params.row.slot2ColSpan && params.row.slot2ColSpan > 1) return null;
                return <div style={getSubjectStyle(params.value)}>{params.value}</div>;
            }
        },
        {
            field: 'slot4',
            headerName: '12:00 - 13:00',
            width: 140,
            sortable: false,
            colSpan: (params) => params.row.slot4ColSpan || 1,
            renderCell: (params) => {
                if (!params.value) return null;

                if (params.row.slot1ColSpan && params.row.slot1ColSpan > 3) return null;
                if (params.row.slot3ColSpan && params.row.slot3ColSpan > 1) return null;
                return <div style={getSubjectStyle(params.value)}>{params.value}</div>;
            }
        },
        {
            field: 'slot5',
            headerName: '13:00 - 14:00',
            width: 140,
            sortable: false,
            renderCell: (params) => {
                if (!params.value) return null;
                return <div style={getSubjectStyle(params.value)}>{params.value}</div>;
            }
        }
    ], []);

    return (
        <div className="spanning-section">
            <h3>3. Class Schedule / Timetable</h3>
            <p>
                A weekly class schedule showing subjects spanning multiple time slots with color coding.
            </p>
            <div className="spanning-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height={400}
                    rowHeight={60}
                    headerHeight={56}
                />
            </div>
        </div>
    );
}

function RowSpanningExample() {
    interface ProjectRow {
        id: number;
        category: string;
        project: string;
        manager: string;
        priority: 'High' | 'Medium' | 'Low';
        status: string;
        timeline: string;
        budget: number;
    }

    const [rows] = useState<ProjectRow[]>([
        { id: 1, category: 'Development', project: 'Grid Engine', manager: 'Alice Smith', priority: 'High', status: 'In Progress', timeline: 'Q1 2024', budget: 50000 },
        { id: 2, category: 'Development', project: 'Theme Builder', manager: 'Alice Smith', priority: 'Medium', status: 'Planning', timeline: 'Q2 2024', budget: 30000 },
        { id: 3, category: 'Development', project: 'Icon Set', manager: 'Bob Jones', priority: 'Low', status: 'Completed', timeline: 'Q4 2023', budget: 15000 },
        { id: 4, category: 'Development', project: 'API Gateway', manager: 'Bob Jones', priority: 'High', status: 'Review', timeline: 'Q1 2024', budget: 45000 },
        { id: 5, category: 'Marketing', project: 'Social Campaign', manager: 'Charlie Brown', priority: 'Medium', status: 'Active', timeline: 'Jan-Mar', budget: 25000 },
        { id: 6, category: 'Marketing', project: 'Email Blast', manager: 'Charlie Brown', priority: 'Low', status: 'Scheduled', timeline: 'Feb 2024', budget: 12000 },
        { id: 7, category: 'Marketing', project: 'SEO Audit', manager: 'Charlie Brown', priority: 'Medium', status: 'On Hold', timeline: 'Ongoing', budget: 8000 },
        { id: 8, category: 'Operations', project: 'Infrastructure', manager: 'David Wilson', priority: 'High', status: 'In Progress', timeline: 'Year-long', budget: 85000 },
        { id: 9, category: 'Operations', project: 'Security Patch', manager: 'David Wilson', priority: 'High', status: 'Critical', timeline: 'Immediate', budget: 20000 },
        { id: 10, category: 'HR', project: 'Recruitment', manager: 'Emma Stone', priority: 'Medium', status: 'Active', timeline: 'Q1-Q2', budget: 60000 },
        { id: 11, category: 'HR', project: 'Training', manager: 'Emma Stone', priority: 'Low', status: 'Proposed', timeline: 'Q3 2024', budget: 15000 },
        { id: 12, category: 'HR', project: 'Payroll Sync', manager: 'Frank Miller', priority: 'High', status: 'Testing', timeline: 'Q1 2024', budget: 35000 }
    ]);

    const columns = useMemo<GridColDef<ProjectRow>[]>(() => [
        {
            field: 'category',
            headerName: 'Category',
            width: 150,
            rowSpan: (params) => {
                const { rowIndex } = params;
                if (rowIndex === 0) return 4; // Development
                if (rowIndex === 4) return 3; // Marketing
                if (rowIndex === 7) return 2; // Operations
                if (rowIndex === 9) return 3; // HR
                return 1;
            },
            renderCell: (params) => {
                const isFirst = [0, 4, 7, 9].includes(params.rowIndex);
                if (!isFirst) return null;
                return (
                    <div className="row-span-category-cell">
                        {params.value}
                    </div>
                );
            }
        },
        {
            field: 'manager',
            headerName: 'Manager',
            width: 150,
            rowSpan: (params) => {
                const r = params.rowIndex;
                if (r === 0) return 2; // Alice
                if (r === 2) return 2; // Bob
                if (r === 4) return 3; // Charlie
                if (r === 7) return 2; // Wilson
                if (r === 9) return 2; // Stone
                return 1; // Miller
            }
        },
        { field: 'project', headerName: 'Project Name', width: 180 },
        {
            field: 'priority',
            headerName: 'Priority',
            width: 100,
            renderCell: (params) => {
                const className = params.value === 'High' ? 'priority-high' : (params.value === 'Medium' ? 'priority-medium' : 'priority-low');
                return (
                    <span className={className} style={{ fontWeight: 600 }}>
                        {params.value}
                    </span>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <div className="status-badge">
                    {params.value}
                </div>
            )
        },
        { field: 'timeline', headerName: 'Timeline', width: 120 },
        {
            field: 'budget',
            headerName: 'Budget ($)',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`
        },
    ], []);

    return (
        <div className="spanning-section">
            <h3>4. Vertical Row Spanning (Row Groups)</h3>
            <p>
                Demonstrates <code>rowSpan</code> to group related items vertically, such as common Categories or Project Managers.
            </p>
            <div className="spanning-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    rowHeight={52}
                    headerHeight={52}
                />
            </div>
        </div>
    );
}

export default function CellSpanningShowcase() {
    return (
        <div className="spanning-showcase-container">
            <div className="spanning-showcase-header">
                <h2>Cell Spanning Examples</h2>
                <p>
                    Comprehensive examples demonstrating various cell spanning use cases,
                    inspired by MUI X DataGrid documentation.
                </p>
            </div>

            <SimpleColumnSpanExample />
            <InvoiceExample />
            <TimetableExample />
            <RowSpanningExample />

            <div className="spanning-warning-box">
                <strong>⚠️ Important: Feature Compatibility with Column Spanning</strong>
                <p>
                    When using <code>colSpan</code>, some features may be pointless or may not work as expected.
                    To avoid a confusing grid layout, consider <strong>disabling the following features</strong> for any columns affected by <code>colSpan</code>:
                </p>
                <ul>
                    <li><strong>Sorting</strong> - Set <code>sortable: false</code> (all examples above disable this)</li>
                    <li><strong>Filtering</strong> - Avoid using filters on spanned columns</li>
                    <li><strong>Column Reorder</strong> - Reordering can break the spanning logic</li>
                    <li><strong>Hiding Columns</strong> - Hidden columns can cause misalignment</li>
                    <li><strong>Column Pinning</strong> - Pinning spanned columns may cause layout issues</li>
                </ul>
                <p style={{ fontSize: '0.95em', fontStyle: 'italic' }}>
                    💡 <strong>Best Practice:</strong> Use column spanning primarily for display purposes in read-only grids
                    or tables where interactive features are not required.
                </p>
            </div>
        </div>
    );
}
