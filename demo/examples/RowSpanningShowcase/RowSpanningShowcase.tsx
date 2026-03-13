
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './RowSpanningShowcase.css';

interface OrderItem {
    id: number;
    itemCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isUpgrade?: boolean;
    itemCodeRowSpan?: number;
    isFirstInGroup?: boolean;
}

function OrderItemsExample() {
    const [rows] = useState<OrderItem[]>([
        { id: 1, itemCode: 'A101', description: 'Wireless Mouse', quantity: 2, unitPrice: 50, totalPrice: 100, itemCodeRowSpan: 1, isFirstInGroup: true },
        { id: 2, itemCode: 'A102', description: 'Mechanical Keyboard', quantity: 1, unitPrice: 75, totalPrice: 75, itemCodeRowSpan: 1, isFirstInGroup: true },
        { id: 3, itemCode: 'A103', description: 'USB Dock Station', quantity: 1, unitPrice: 400, totalPrice: 400, itemCodeRowSpan: 1, isFirstInGroup: true },
        { id: 4, itemCode: 'A104', description: 'Laptop', quantity: 1, unitPrice: 1800, totalPrice: 2050, itemCodeRowSpan: 3, isFirstInGroup: true },
        { id: 5, itemCode: 'A104', description: '- 16GB RAM Upgrade', quantity: 1, unitPrice: 100, totalPrice: 0, isUpgrade: true, itemCodeRowSpan: 0 },
        { id: 6, itemCode: 'A104', description: '- 512GB SSD Upgrade', quantity: 1, unitPrice: 150, totalPrice: 0, isUpgrade: true, itemCodeRowSpan: 0 },
        { id: 7, itemCode: 'TOTAL', description: '', quantity: 0, unitPrice: 0, totalPrice: 2625, itemCodeRowSpan: 1, isFirstInGroup: true }
    ]);

    const columns = useMemo<GridColDef<OrderItem>[]>(() => [
        {
            field: 'itemCode',
            headerName: 'Item Code',
            width: 120,
            sortable: false,
            rowSpan: (params) => params.row.itemCodeRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstInGroup) return null;
                const style: React.CSSProperties = {};
                if (params.value === 'TOTAL') {
                    style.fontWeight = 700;
                }
                return <div style={style}>{params.value}</div>;
            }
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 220,
            sortable: false,
            renderCell: (params) => {
                if (params.row.isUpgrade) {
                    return <div className="upgrade-item">{params.value}</div>;
                }
                return <div>{params.value}</div>;
            }
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            width: 100,
            sortable: false,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => params.value || ''
        },
        {
            field: 'unitPrice',
            headerName: 'Unit Price',
            width: 120,
            sortable: false,
            type: 'number',
            align: 'right',
            headerAlign: 'right',
            valueFormatter: ({ value }) => value ? `$${value.toFixed(2)}` : ''
        },
        {
            field: 'totalPrice',
            headerName: 'Total Price',
            width: 120,
            sortable: false,
            type: 'number',
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                if (params.row.isUpgrade) return '';
                const style: React.CSSProperties = { textAlign: 'right' };
                if (params.row.itemCode === 'TOTAL') {
                    style.fontWeight = 700;
                    style.fontSize = '1.05em';
                }
                return <div style={style}>${params.value.toFixed(2)}</div>;
            }
        }
    ], []);

    return (
        <div className="example-section">
            <h3>1. Order Items with Upgrades</h3>
            <p>
                Item Code column spans across the main product and its upgrade options.
            </p>
            <div className="example-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    rowHeight={48}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

interface EmployeeRole {
    id: number;
    name: string;
    designation: string;
    department: string;
    age: string;
    nameRowSpan?: number;
    ageRowSpan?: number;
    departmentRowSpan?: number;
    isFirstRole?: boolean;
}

function EmployeeRolesExample() {
    const [rows] = useState<EmployeeRole[]>([
        { id: 1, name: 'Andrew Clark', designation: 'React Engineer', department: 'Engineering', age: '25 yo', nameRowSpan: 2, ageRowSpan: 2, isFirstRole: true },
        { id: 2, name: 'Andrew Clark', designation: 'Technical Interviewer', department: 'Human resource', age: '25 yo', nameRowSpan: 0, ageRowSpan: 0, departmentRowSpan: 1 },
        { id: 3, name: 'Cynthia Duke', designation: 'Technical Team Lead', department: 'Engineering', departmentRowSpan: 2, age: '25 yo', nameRowSpan: 1, ageRowSpan: 1, isFirstRole: true },
        { id: 4, name: 'Jordyn Black', designation: 'React Engineer', department: '', departmentRowSpan: 2, age: '31 yo', nameRowSpan: 1, ageRowSpan: 1, isFirstRole: true },
        { id: 5, name: 'Rene Glass', designation: 'Ops Lead', department: 'Operations', age: '31 yo', nameRowSpan: 1, ageRowSpan: 1, isFirstRole: true }
    ]);

    const columns = useMemo<GridColDef<EmployeeRole>[]>(() => [
        {
            field: 'name',
            headerName: 'Name',
            width: 150,
            sortable: false,
            rowSpan: (params) => params.row.nameRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstRole) return null;
                return params.value;
            }
        },
        {
            field: 'designation',
            headerName: 'Designation',
            width: 200,
            sortable: false
        },
        {
            field: 'department',
            headerName: 'Department',
            width: 180,
            sortable: false,
            rowSpan: (params) => params.row.departmentRowSpan || 1
        },
        {
            field: 'age',
            headerName: 'Age',
            width: 100,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            rowSpan: (params) => params.row.ageRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstRole) return null;
                return params.value;
            }
        }
    ], []);

    return (
        <div className="example-section">
            <h3>2. Employee with Multiple Roles</h3>
            <p>
                Name and Age columns span across multiple rows when an employee has multiple roles.
            </p>
            <div className="example-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    rowHeight={52}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

interface CourseSchedule {
    id: number;
    day: string;
    time: string;
    course: string;
    instructor: string;
    room: string;
    notes: string;
    courseRowSpan?: number;
    instructorRowSpan?: number;
    roomRowSpan?: number;
    isFirstSlot?: boolean;
}

function CourseScheduleExample() {
    const [rows] = useState<CourseSchedule[]>([
        { id: 1, day: 'Monday', time: '9:00 AM - 10:30 AM', course: 'Advanced Mathematics (Dr. Smith)', instructor: 'Dr. Smith', room: 'Room 101', notes: 'Midterm exam', courseRowSpan: 2, instructorRowSpan: 2, roomRowSpan: 2, isFirstSlot: true },
        { id: 2, day: 'Monday', time: '10:30 AM - 12:00 PM', course: '', instructor: '', room: '', notes: '', courseRowSpan: 0, instructorRowSpan: 0, roomRowSpan: 0 },
        { id: 3, day: 'Tuesday', time: '9:00 AM - 10:30 AM', course: '', instructor: '', room: '', notes: 'Practical and lab', courseRowSpan: 0, instructorRowSpan: 0, roomRowSpan: 0 },
        { id: 4, day: 'Tuesday', time: '10:30 AM - 12:00 PM', course: 'Introduction to Biology (Dr. Johnson)', instructor: 'Dr. Johnson', room: 'Room 107', notes: 'Lab session', courseRowSpan: 1, instructorRowSpan: 1, roomRowSpan: 1, isFirstSlot: true },
        { id: 5, day: 'Wednesday', time: '9:00 AM - 10:30 AM', course: 'Computer Science 101 (Dr. Lee)', instructor: 'Dr. Lee', room: 'Room 303', notes: 'Class', courseRowSpan: 2, instructorRowSpan: 2, roomRowSpan: 2, isFirstSlot: true },
        { id: 6, day: 'Wednesday', time: '10:30 AM - 12:00 PM', course: '', instructor: '', room: '', notes: 'Lab session', courseRowSpan: 0, instructorRowSpan: 0, roomRowSpan: 0 },
        { id: 7, day: 'Thursday', time: '9:00 AM - 11:00 AM', course: 'Physics II (Dr. Carter)', instructor: 'Dr. Carter', room: 'Room 104', notes: 'Project Discussion', courseRowSpan: 2, instructorRowSpan: 2, roomRowSpan: 2, isFirstSlot: true },
        { id: 8, day: 'Thursday', time: '11:00 AM - 12:30 PM', course: '', instructor: '', room: '', notes: '', courseRowSpan: 0, instructorRowSpan: 0, roomRowSpan: 0 },
        { id: 9, day: 'Friday', time: '9:00 AM - 11:00 AM', course: '', instructor: '', room: '', notes: 'Project Submission', courseRowSpan: 0, instructorRowSpan: 0, roomRowSpan: 0 },
        { id: 10, day: 'Friday', time: '11:00 AM - 12:30 PM', course: 'Literature & Composition (Prof. Adams)', instructor: 'Prof. Adams', room: 'Lecture Hall 1', notes: 'Reading Assignment', courseRowSpan: 1, instructorRowSpan: 1, roomRowSpan: 1, isFirstSlot: true }
    ]);

    const columns = useMemo<GridColDef<CourseSchedule>[]>(() => [
        {
            field: 'day',
            headerName: 'Day',
            width: 110,
            sortable: false
        },
        {
            field: 'time',
            headerName: 'Time',
            width: 160,
            sortable: false
        },
        {
            field: 'course',
            headerName: 'Course',
            width: 280,
            sortable: false,
            rowSpan: (params) => params.row.courseRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstSlot) return null;
                return <div style={{ fontWeight: 500 }}>{params.value}</div>;
            }
        },
        {
            field: 'instructor',
            headerName: 'Instructor',
            width: 130,
            sortable: false,
            rowSpan: (params) => params.row.instructorRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstSlot) return null;
                return params.value;
            }
        },
        {
            field: 'room',
            headerName: 'Room',
            width: 140,
            sortable: false,
            rowSpan: (params) => params.row.roomRowSpan || 1,
            renderCell: (params) => {
                if (!params.row.isFirstSlot) return null;
                return params.value;
            }
        },
        {
            field: 'notes',
            headerName: 'Notes',
            width: 160,
            sortable: false
        }
    ], []);

    return (
        <div className="example-section">
            <h3>3. Course Schedule</h3>
            <p>
                Course, Instructor, and Room columns span across multiple time slots for the same class.
            </p>
            <div className="example-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    rowHeight={52}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

interface TimetableSlot {
    id: number;
    time: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;

    mondayRowSpan?: number;
    tuesdayRowSpan?: number;
    wednesdayRowSpan?: number;
    thursdayRowSpan?: number;
    fridayRowSpan?: number;

    mondayColSpan?: number;
    tuesdayColSpan?: number;
    wednesdayColSpan?: number;
    thursdayColSpan?: number;
    fridayColSpan?: number;
    isFirstInSpan?: Record<string, boolean>;
}

function WeeklyTimetableExample() {
    const [rows] = useState<TimetableSlot[]>([
        {
            id: 1,
            time: '09:00 - 10:00',
            monday: 'Maths',
            tuesday: 'Chemistry',
            wednesday: 'Physics',
            thursday: 'Music',
            friday: 'Maths',
            tuesdayRowSpan: 2,
            isFirstInSpan: { tuesday: true }
        },
        {
            id: 2,
            time: '10:00 - 11:00',
            monday: 'English',
            tuesday: '',
            wednesday: 'English',
            thursday: 'English',
            friday: 'Dance',
            mondayRowSpan: 2,
            thursdayRowSpan: 2,
            fridayRowSpan: 3,
            isFirstInSpan: { monday: true, thursday: true, friday: true }
        },
        {
            id: 3,
            time: '11:00 - 12:00',
            monday: '',
            tuesday: 'Physics',
            wednesday: 'Maths',
            thursday: '',
            friday: '',
            tuesdayRowSpan: 3,
            wednesdayRowSpan: 3,
            isFirstInSpan: { tuesday: true, wednesday: true }
        },
        {
            id: 4,
            time: '12:00 - 13:00',
            monday: 'Lab',
            tuesday: '',
            wednesday: '',
            thursday: 'Chemistry',
            friday: '',
            mondayRowSpan: 2,
            thursdayRowSpan: 2,
            isFirstInSpan: { monday: true, thursday: true }
        },
        {
            id: 5,
            time: '13:00 - 14:00',
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: 'Physics'
        },
        {
            id: 6,
            time: '14:00 - 15:00',
            monday: 'Lab',
            tuesday: 'Maths',
            wednesday: 'Chemistry',
            thursday: 'Chemistry',
            friday: 'English',
            wednesdayRowSpan: 2,
            thursdayRowSpan: 2,
            fridayRowSpan: 3,
            isFirstInSpan: { wednesday: true, thursday: true, friday: true }
        },
        {
            id: 7,
            time: '15:00 - 16:00',
            monday: 'Music',
            tuesday: 'Lab',
            wednesday: '',
            thursday: '',
            friday: '',
            mondayRowSpan: 2,
            tuesdayRowSpan: 2,
            isFirstInSpan: { monday: true, tuesday: true, friday: true }
        },
        {
            id: 8,
            time: '16:00 - 17:00',
            monday: '',
            tuesday: 'Dance',
            wednesday: '',
            thursday: '',
            friday: ''
        }
    ]);

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
    });

    const createDayColumn = (field: keyof TimetableSlot, headerName: string): GridColDef<TimetableSlot> => ({
        field: field as string,
        headerName,
        width: 140,
        sortable: false,
        rowSpan: (params) => {
            const spanKey = `${field}RowSpan` as keyof TimetableSlot;
            return (params.row[spanKey] as number) || 1;
        },
        renderCell: (params) => {
            const value = params.value as string;
            if (!value) return null;

            const isFirst = params.row.isFirstInSpan?.[field as string];
            if (params.row[`${field}RowSpan` as keyof TimetableSlot] && !isFirst) {
                return null;
            }

            return <div className="subject-cell" style={getSubjectStyle(value)}>{value}</div>;
        }
    });

    const columns: GridColDef<TimetableSlot>[] = [
        {
            field: 'time',
            headerName: 'Time',
            width: 130,
            sortable: false
        },
        createDayColumn('monday', 'Monday'),
        createDayColumn('tuesday', 'Tuesday'),
        createDayColumn('wednesday', 'Wednesday'),
        createDayColumn('thursday', 'Thursday'),
        createDayColumn('friday', 'Friday')
    ];

    return (
        <div className="example-section">
            <h3>4. Weekly Timetable (Row Spanning)</h3>
            <p>
                Subjects span across multiple time slots vertically. Each subject has a distinct color.
            </p>
            <div className="example-grid-wrapper">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    rowHeight={56}
                    headerHeight={48}
                />
            </div>
        </div>
    );
}

export default function RowSpanningShowcase() {
    return (
        <div className="row-spanning-container">
            <div className="row-spanning-header">
                <h2>Row Spanning Examples</h2>
                <p>
                    Comprehensive examples demonstrating various row spanning use cases,
                    inspired by MUI X DataGrid documentation.
                </p>
            </div>

            <OrderItemsExample />
            <EmployeeRolesExample />
            <CourseScheduleExample />
            <WeeklyTimetableExample />

            <div className="spanning-info-box">
                <strong>⚠️ Important: Feature Compatibility with Row Spanning</strong>
                <p>
                    When using <code>rowSpan</code>, some features may be pointless or may not work as expected.
                    To avoid a confusing grid layout, consider <strong>disabling the following features</strong> for any columns affected by <code>rowSpan</code>:
                </p>
                <ul>
                    <li><strong>Sorting</strong> - Set <code>sortable: false</code> (all examples above disable this)</li>
                    <li><strong>Filtering</strong> - Avoid using filters on spanned columns</li>
                    <li><strong>Column Reorder</strong> - Reordering can break the spanning logic</li>
                    <li><strong>Hiding Columns</strong> - Hidden columns can cause misalignment</li>
                    <li><strong>Column Pinning</strong> - Pinning spanned columns may cause layout issues</li>
                </ul>
                <p style={{ fontSize: '0.95em', fontStyle: 'italic' }}>
                    💡 <strong>Best Practice:</strong> Use row spanning primarily for display purposes in read-only grids
                    or tables where interactive features are not required. For dynamic hierarchical data, consider using the Tree Data feature instead.
                </p>
            </div>
        </div>
    );
}
