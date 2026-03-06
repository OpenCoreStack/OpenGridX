
import { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridColumnGroupingModel } from '../../../lib';
import './EmployeeCalendarDemo.css';

// --- Mock Data ---

interface EmployeeRow {
    id: string;
    name: string;
    role: string;
    avatar: string;
    events: Record<string, string>; // Maps YYYY-MM-DD to event type ('sick', 'vacation')
}

const generateMockEmployees = (): EmployeeRow[] => {
    return [
        { id: '1', name: 'Faustino Shields', role: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=faustino', events: { '08-11': 'vacation', '08-12': 'vacation', '08-13': 'vacation' } },
        { id: '2', name: 'Pat Schneider', role: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=pat', events: {} },
        { id: '3', name: 'Aliya Schinner', role: 'Product', avatar: 'https://i.pravatar.cc/150?u=aliya', events: { '08-15': 'sick', '08-16': 'sick' } },
        { id: '4', name: 'Daan Aarden', role: 'Design', avatar: 'https://i.pravatar.cc/150?u=daan', events: { '08-20': 'vacation', '08-21': 'vacation', '08-22': 'vacation', '08-23': 'vacation', '08-24': 'vacation' } },
        { id: '5', name: 'Marie Renault', role: 'Marketing', avatar: 'https://i.pravatar.cc/150?u=marie', events: { '08-11': 'sick' } },
        { id: '6', name: 'John Doe', role: 'Sales', avatar: 'https://i.pravatar.cc/150?u=john', events: { '08-18': 'vacation', '08-19': 'vacation' } },
        { id: '7', name: 'Jane Smith', role: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=jane', events: {} },
        { id: '8', name: 'Bob Johnson', role: 'Product', avatar: 'https://i.pravatar.cc/150?u=bob', events: { '08-14': 'sick' } },
    ];
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Build columns for days 11 through 24 of August
const START_DATE = 11;
const END_DATE = 24;

export default function EmployeeCalendarDemo() {
    const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

    // Create Base Columns
    const columns = useMemo<GridColDef<EmployeeRow>[]>(() => {
        const cols: GridColDef<EmployeeRow>[] = [
            {
                field: 'employee', headerName: `Employees (8)`, width: 220,
                renderCell: ({ row }) => (
                    <div className="calendar-emp-cell">
                        <img src={row.avatar} alt={row.name} className="calendar-emp-avatar" />
                        <div className="calendar-emp-info">
                            <span className="calendar-emp-name">{row.name}</span>
                            <span className="calendar-emp-role">{row.role}</span>
                        </div>
                    </div>
                )
            }
        ];

        // Generate columns for each date
        let currentDate = new Date(2026, 7, START_DATE); // August 2026

        for (let i = START_DATE; i <= END_DATE; i++) {
            const dateStr = `08-${i.toString().padStart(2, '0')}`;
            const dayName = days[currentDate.getDay()];

            cols.push({
                field: dateStr,
                headerName: `${dayName} ${i}`,
                width: density === 'compact' ? 70 : 100,
                align: 'center',
                headerAlign: 'center',
                disableColumnMenu: true,
                sortable: false,
                cellClassName: 'calendar-date-cell',
                renderCell: ({ row }) => {
                    const event = row.events[dateStr];
                    if (!event) return null;

                    const isSick = event === 'sick';
                    const bg = isSick ? '#fee2e2' : '#dcfce7';
                    const color = isSick ? '#991b1b' : '#166534';
                    const label = isSick ? 'Sick' : 'Vacation';

                    return (
                        <div
                            className="calendar-event-pill"
                            style={{ background: bg, color: color }}
                        >
                            {density === 'comfortable' ? label : label[0]}
                        </div>
                    );
                },
                valueFormatter: (p) => p.row.events[dateStr] || ''
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return cols;
    }, [density]);


    // Build Column Grouping Model
    const columnGroupingModel = useMemo<GridColumnGroupingModel>(() => {
        const week1: string[] = [];
        const week2: string[] = [];

        for (let i = 11; i <= 17; i++) week1.push(`08-${i}`);
        for (let i = 18; i <= 24; i++) week2.push(`08-${i}`);

        return [
            {
                groupId: 'month',
                headerName: 'August 2026',
                children: [
                    { groupId: 'week1', headerName: 'Week 2', children: week1 },
                    { groupId: 'week2', headerName: 'Week 3', children: week2 },
                ]
            }
        ];
    }, []);

    const rows = useMemo(() => generateMockEmployees(), []);

    return (
        <div className="calendar-demo-container">
            <h2>Time Off Calendar</h2>
            <p className="calendar-demo-description">A custom calendar using pinned columns and dense inline event cell rendering.</p>

            <div className="calendar-grid-wrapper">
                {/* Custom Toolbar */}
                <div className="calendar-toolbar">
                    <div className="calendar-legend">
                        <span className="legend-item vacation">✓ Vacation</span>
                        <span className="legend-item sick">✕ Sick leave</span>
                    </div>

                    <div className="calendar-density-switch">
                        {(['compact', 'comfortable'] as const).map(opt => (
                            <button
                                key={opt}
                                onClick={() => setDensity(opt)}
                                className={`density-btn ${density === opt ? 'active' : ''}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="calendar-grid">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnGroupingModel={columnGroupingModel}
                        pinnedColumns={{ left: ['employee'] }}
                        rowHeight={density === 'compact' ? 52 : 72}
                        headerHeight={48}
                        height={600}
                    />
                </div>
            </div>
        </div>
    );
}
