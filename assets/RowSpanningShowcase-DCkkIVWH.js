import{j as e,r as n}from"./vendor-react-LmGMyLnN.js";import{D as l}from"./opengridx-BlrvTAzD.js";import{D as p}from"./DocsLayout-BoGj89NG.js";const y=`
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './RowSpanningShowcase.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './RowSpanningShowcase.tsx?raw';

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
            valueFormatter: ({ value }) => value ? \`$\${value.toFixed(2)}\` : ''
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
                return <div style={style}>\${params.value.toFixed(2)}</div>;
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
            const spanKey = \`\${field}RowSpan\` as keyof TimetableSlot;
            return (params.row[spanKey] as number) || 1;
        },
        renderCell: (params) => {
            const value = params.value as string;
            if (!value) return null;

            const isFirst = params.row.isFirstInSpan?.[field as string];
            if (params.row[\`\${field}RowSpan\` as keyof TimetableSlot] && !isFirst) {
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
        <DocsLayout
            title="Row Spanning"
            description="Merge cells vertically across multiple rows using the rowSpan callback. Group visually related data without restructuring your underlying dataset."
            sourceCode={sourceCode}
        >
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
        </DocsLayout>
    );
}
`;function w(){const[t]=n.useState([{id:1,itemCode:"A101",description:"Wireless Mouse",quantity:2,unitPrice:50,totalPrice:100,itemCodeRowSpan:1,isFirstInGroup:!0},{id:2,itemCode:"A102",description:"Mechanical Keyboard",quantity:1,unitPrice:75,totalPrice:75,itemCodeRowSpan:1,isFirstInGroup:!0},{id:3,itemCode:"A103",description:"USB Dock Station",quantity:1,unitPrice:400,totalPrice:400,itemCodeRowSpan:1,isFirstInGroup:!0},{id:4,itemCode:"A104",description:"Laptop",quantity:1,unitPrice:1800,totalPrice:2050,itemCodeRowSpan:3,isFirstInGroup:!0},{id:5,itemCode:"A104",description:"- 16GB RAM Upgrade",quantity:1,unitPrice:100,totalPrice:0,isUpgrade:!0,itemCodeRowSpan:0},{id:6,itemCode:"A104",description:"- 512GB SSD Upgrade",quantity:1,unitPrice:150,totalPrice:0,isUpgrade:!0,itemCodeRowSpan:0},{id:7,itemCode:"TOTAL",description:"",quantity:0,unitPrice:0,totalPrice:2625,itemCodeRowSpan:1,isFirstInGroup:!0}]),o=n.useMemo(()=>[{field:"itemCode",headerName:"Item Code",width:120,sortable:!1,rowSpan:r=>r.row.itemCodeRowSpan||1,renderCell:r=>{if(!r.row.isFirstInGroup)return null;const a={};return r.value==="TOTAL"&&(a.fontWeight=700),e.jsx("div",{style:a,children:r.value})}},{field:"description",headerName:"Description",width:220,sortable:!1,renderCell:r=>r.row.isUpgrade?e.jsx("div",{className:"upgrade-item",children:r.value}):e.jsx("div",{children:r.value})},{field:"quantity",headerName:"Quantity",width:100,sortable:!1,type:"number",align:"center",headerAlign:"center",renderCell:r=>r.value||""},{field:"unitPrice",headerName:"Unit Price",width:120,sortable:!1,type:"number",align:"right",headerAlign:"right",valueFormatter:({value:r})=>r?`$${r.toFixed(2)}`:""},{field:"totalPrice",headerName:"Total Price",width:120,sortable:!1,type:"number",align:"right",headerAlign:"right",renderCell:r=>{if(r.row.isUpgrade)return"";const a={textAlign:"right"};return r.row.itemCode==="TOTAL"&&(a.fontWeight=700,a.fontSize="1.05em"),e.jsxs("div",{style:a,children:["$",r.value.toFixed(2)]})}}],[]);return e.jsxs("div",{className:"example-section",children:[e.jsx("h3",{children:"1. Order Items with Upgrades"}),e.jsx("p",{children:"Item Code column spans across the main product and its upgrade options."}),e.jsx("div",{className:"example-grid-wrapper",children:e.jsx(l,{rows:t,columns:o,autoHeight:!0,rowHeight:48,headerHeight:48})})]})}function h(){const[t]=n.useState([{id:1,name:"Andrew Clark",designation:"React Engineer",department:"Engineering",age:"25 yo",nameRowSpan:2,ageRowSpan:2,isFirstRole:!0},{id:2,name:"Andrew Clark",designation:"Technical Interviewer",department:"Human resource",age:"25 yo",nameRowSpan:0,ageRowSpan:0,departmentRowSpan:1},{id:3,name:"Cynthia Duke",designation:"Technical Team Lead",department:"Engineering",departmentRowSpan:2,age:"25 yo",nameRowSpan:1,ageRowSpan:1,isFirstRole:!0},{id:4,name:"Jordyn Black",designation:"React Engineer",department:"",departmentRowSpan:2,age:"31 yo",nameRowSpan:1,ageRowSpan:1,isFirstRole:!0},{id:5,name:"Rene Glass",designation:"Ops Lead",department:"Operations",age:"31 yo",nameRowSpan:1,ageRowSpan:1,isFirstRole:!0}]),o=n.useMemo(()=>[{field:"name",headerName:"Name",width:150,sortable:!1,rowSpan:r=>r.row.nameRowSpan||1,renderCell:r=>r.row.isFirstRole?r.value:null},{field:"designation",headerName:"Designation",width:200,sortable:!1},{field:"department",headerName:"Department",width:180,sortable:!1,rowSpan:r=>r.row.departmentRowSpan||1},{field:"age",headerName:"Age",width:100,sortable:!1,align:"center",headerAlign:"center",rowSpan:r=>r.row.ageRowSpan||1,renderCell:r=>r.row.isFirstRole?r.value:null}],[]);return e.jsxs("div",{className:"example-section",children:[e.jsx("h3",{children:"2. Employee with Multiple Roles"}),e.jsx("p",{children:"Name and Age columns span across multiple rows when an employee has multiple roles."}),e.jsx("div",{className:"example-grid-wrapper",children:e.jsx(l,{rows:t,columns:o,autoHeight:!0,rowHeight:52,headerHeight:48})})]})}function S(){const[t]=n.useState([{id:1,day:"Monday",time:"9:00 AM - 10:30 AM",course:"Advanced Mathematics (Dr. Smith)",instructor:"Dr. Smith",room:"Room 101",notes:"Midterm exam",courseRowSpan:2,instructorRowSpan:2,roomRowSpan:2,isFirstSlot:!0},{id:2,day:"Monday",time:"10:30 AM - 12:00 PM",course:"",instructor:"",room:"",notes:"",courseRowSpan:0,instructorRowSpan:0,roomRowSpan:0},{id:3,day:"Tuesday",time:"9:00 AM - 10:30 AM",course:"",instructor:"",room:"",notes:"Practical and lab",courseRowSpan:0,instructorRowSpan:0,roomRowSpan:0},{id:4,day:"Tuesday",time:"10:30 AM - 12:00 PM",course:"Introduction to Biology (Dr. Johnson)",instructor:"Dr. Johnson",room:"Room 107",notes:"Lab session",courseRowSpan:1,instructorRowSpan:1,roomRowSpan:1,isFirstSlot:!0},{id:5,day:"Wednesday",time:"9:00 AM - 10:30 AM",course:"Computer Science 101 (Dr. Lee)",instructor:"Dr. Lee",room:"Room 303",notes:"Class",courseRowSpan:2,instructorRowSpan:2,roomRowSpan:2,isFirstSlot:!0},{id:6,day:"Wednesday",time:"10:30 AM - 12:00 PM",course:"",instructor:"",room:"",notes:"Lab session",courseRowSpan:0,instructorRowSpan:0,roomRowSpan:0},{id:7,day:"Thursday",time:"9:00 AM - 11:00 AM",course:"Physics II (Dr. Carter)",instructor:"Dr. Carter",room:"Room 104",notes:"Project Discussion",courseRowSpan:2,instructorRowSpan:2,roomRowSpan:2,isFirstSlot:!0},{id:8,day:"Thursday",time:"11:00 AM - 12:30 PM",course:"",instructor:"",room:"",notes:"",courseRowSpan:0,instructorRowSpan:0,roomRowSpan:0},{id:9,day:"Friday",time:"9:00 AM - 11:00 AM",course:"",instructor:"",room:"",notes:"Project Submission",courseRowSpan:0,instructorRowSpan:0,roomRowSpan:0},{id:10,day:"Friday",time:"11:00 AM - 12:30 PM",course:"Literature & Composition (Prof. Adams)",instructor:"Prof. Adams",room:"Lecture Hall 1",notes:"Reading Assignment",courseRowSpan:1,instructorRowSpan:1,roomRowSpan:1,isFirstSlot:!0}]),o=n.useMemo(()=>[{field:"day",headerName:"Day",width:110,sortable:!1},{field:"time",headerName:"Time",width:160,sortable:!1},{field:"course",headerName:"Course",width:280,sortable:!1,rowSpan:r=>r.row.courseRowSpan||1,renderCell:r=>r.row.isFirstSlot?e.jsx("div",{style:{fontWeight:500},children:r.value}):null},{field:"instructor",headerName:"Instructor",width:130,sortable:!1,rowSpan:r=>r.row.instructorRowSpan||1,renderCell:r=>r.row.isFirstSlot?r.value:null},{field:"room",headerName:"Room",width:140,sortable:!1,rowSpan:r=>r.row.roomRowSpan||1,renderCell:r=>r.row.isFirstSlot?r.value:null},{field:"notes",headerName:"Notes",width:160,sortable:!1}],[]);return e.jsxs("div",{className:"example-section",children:[e.jsx("h3",{children:"3. Course Schedule"}),e.jsx("p",{children:"Course, Instructor, and Room columns span across multiple time slots for the same class."}),e.jsx("div",{className:"example-grid-wrapper",children:e.jsx(l,{rows:t,columns:o,autoHeight:!0,rowHeight:52,headerHeight:48})})]})}function g(){const[t]=n.useState([{id:1,time:"09:00 - 10:00",monday:"Maths",tuesday:"Chemistry",wednesday:"Physics",thursday:"Music",friday:"Maths",tuesdayRowSpan:2,isFirstInSpan:{tuesday:!0}},{id:2,time:"10:00 - 11:00",monday:"English",tuesday:"",wednesday:"English",thursday:"English",friday:"Dance",mondayRowSpan:2,thursdayRowSpan:2,fridayRowSpan:3,isFirstInSpan:{monday:!0,thursday:!0,friday:!0}},{id:3,time:"11:00 - 12:00",monday:"",tuesday:"Physics",wednesday:"Maths",thursday:"",friday:"",tuesdayRowSpan:3,wednesdayRowSpan:3,isFirstInSpan:{tuesday:!0,wednesday:!0}},{id:4,time:"12:00 - 13:00",monday:"Lab",tuesday:"",wednesday:"",thursday:"Chemistry",friday:"",mondayRowSpan:2,thursdayRowSpan:2,isFirstInSpan:{monday:!0,thursday:!0}},{id:5,time:"13:00 - 14:00",monday:"",tuesday:"",wednesday:"",thursday:"",friday:"Physics"},{id:6,time:"14:00 - 15:00",monday:"Lab",tuesday:"Maths",wednesday:"Chemistry",thursday:"Chemistry",friday:"English",wednesdayRowSpan:2,thursdayRowSpan:2,fridayRowSpan:3,isFirstInSpan:{wednesday:!0,thursday:!0,friday:!0}},{id:7,time:"15:00 - 16:00",monday:"Music",tuesday:"Lab",wednesday:"",thursday:"",friday:"",mondayRowSpan:2,tuesdayRowSpan:2,isFirstInSpan:{monday:!0,tuesday:!0,friday:!0}},{id:8,time:"16:00 - 17:00",monday:"",tuesday:"Dance",wednesday:"",thursday:"",friday:""}]),o={Maths:"#4caf50",English:"#9c9c00",Physics:"#2196f3",Chemistry:"#c17171",Lab:"#757575",Music:"#b8860b",Dance:"#9575cd"},r=i=>({backgroundColor:o[i]||"#666"}),a=(i,m)=>({field:i,headerName:m,width:140,sortable:!1,rowSpan:s=>{const d=`${i}RowSpan`;return s.row[d]||1},renderCell:s=>{const d=s.value;if(!d)return null;const c=s.row.isFirstInSpan?.[i];return s.row[`${i}RowSpan`]&&!c?null:e.jsx("div",{className:"subject-cell",style:r(d),children:d})}}),u=[{field:"time",headerName:"Time",width:130,sortable:!1},a("monday","Monday"),a("tuesday","Tuesday"),a("wednesday","Wednesday"),a("thursday","Thursday"),a("friday","Friday")];return e.jsxs("div",{className:"example-section",children:[e.jsx("h3",{children:"4. Weekly Timetable (Row Spanning)"}),e.jsx("p",{children:"Subjects span across multiple time slots vertically. Each subject has a distinct color."}),e.jsx("div",{className:"example-grid-wrapper",children:e.jsx(l,{rows:t,columns:u,autoHeight:!0,rowHeight:56,headerHeight:48})})]})}function C(){return e.jsxs(p,{title:"Row Spanning",description:"Merge cells vertically across multiple rows using the rowSpan callback. Group visually related data without restructuring your underlying dataset.",sourceCode:y,children:[e.jsx(w,{}),e.jsx(h,{}),e.jsx(S,{}),e.jsx(g,{}),e.jsxs("div",{className:"spanning-info-box",children:[e.jsx("strong",{children:"⚠️ Important: Feature Compatibility with Row Spanning"}),e.jsxs("p",{children:["When using ",e.jsx("code",{children:"rowSpan"}),", some features may be pointless or may not work as expected. To avoid a confusing grid layout, consider ",e.jsx("strong",{children:"disabling the following features"})," for any columns affected by ",e.jsx("code",{children:"rowSpan"}),":"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Sorting"})," - Set ",e.jsx("code",{children:"sortable: false"})," (all examples above disable this)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Filtering"})," - Avoid using filters on spanned columns"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Column Reorder"})," - Reordering can break the spanning logic"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hiding Columns"})," - Hidden columns can cause misalignment"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Column Pinning"})," - Pinning spanned columns may cause layout issues"]})]}),e.jsxs("p",{style:{fontSize:"0.95em",fontStyle:"italic"},children:["💡 ",e.jsx("strong",{children:"Best Practice:"})," Use row spanning primarily for display purposes in read-only grids or tables where interactive features are not required. For dynamic hierarchical data, consider using the Tree Data feature instead."]})]})]})}export{C as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93U3Bhbm5pbmdTaG93Y2FzZS1EQ2trSVZXSC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvUm93U3Bhbm5pbmdTaG93Y2FzZS9Sb3dTcGFubmluZ1Nob3djYXNlLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9Sb3dTcGFubmluZ1Nob3djYXNlL1Jvd1NwYW5uaW5nU2hvd2Nhc2UudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9Sb3dTcGFubmluZ1Nob3djYXNlLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9Sb3dTcGFubmluZ1Nob3djYXNlLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBPcmRlckl0ZW0ge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICBpdGVtQ29kZTogc3RyaW5nO1xcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xcbiAgICBxdWFudGl0eTogbnVtYmVyO1xcbiAgICB1bml0UHJpY2U6IG51bWJlcjtcXG4gICAgdG90YWxQcmljZTogbnVtYmVyO1xcbiAgICBpc1VwZ3JhZGU/OiBib29sZWFuO1xcbiAgICBpdGVtQ29kZVJvd1NwYW4/OiBudW1iZXI7XFxuICAgIGlzRmlyc3RJbkdyb3VwPzogYm9vbGVhbjtcXG59XFxuXFxuZnVuY3Rpb24gT3JkZXJJdGVtc0V4YW1wbGUoKSB7XFxuICAgIGNvbnN0IFtyb3dzXSA9IHVzZVN0YXRlPE9yZGVySXRlbVtdPihbXFxuICAgICAgICB7IGlkOiAxLCBpdGVtQ29kZTogJ0ExMDEnLCBkZXNjcmlwdGlvbjogJ1dpcmVsZXNzIE1vdXNlJywgcXVhbnRpdHk6IDIsIHVuaXRQcmljZTogNTAsIHRvdGFsUHJpY2U6IDEwMCwgaXRlbUNvZGVSb3dTcGFuOiAxLCBpc0ZpcnN0SW5Hcm91cDogdHJ1ZSB9LFxcbiAgICAgICAgeyBpZDogMiwgaXRlbUNvZGU6ICdBMTAyJywgZGVzY3JpcHRpb246ICdNZWNoYW5pY2FsIEtleWJvYXJkJywgcXVhbnRpdHk6IDEsIHVuaXRQcmljZTogNzUsIHRvdGFsUHJpY2U6IDc1LCBpdGVtQ29kZVJvd1NwYW46IDEsIGlzRmlyc3RJbkdyb3VwOiB0cnVlIH0sXFxuICAgICAgICB7IGlkOiAzLCBpdGVtQ29kZTogJ0ExMDMnLCBkZXNjcmlwdGlvbjogJ1VTQiBEb2NrIFN0YXRpb24nLCBxdWFudGl0eTogMSwgdW5pdFByaWNlOiA0MDAsIHRvdGFsUHJpY2U6IDQwMCwgaXRlbUNvZGVSb3dTcGFuOiAxLCBpc0ZpcnN0SW5Hcm91cDogdHJ1ZSB9LFxcbiAgICAgICAgeyBpZDogNCwgaXRlbUNvZGU6ICdBMTA0JywgZGVzY3JpcHRpb246ICdMYXB0b3AnLCBxdWFudGl0eTogMSwgdW5pdFByaWNlOiAxODAwLCB0b3RhbFByaWNlOiAyMDUwLCBpdGVtQ29kZVJvd1NwYW46IDMsIGlzRmlyc3RJbkdyb3VwOiB0cnVlIH0sXFxuICAgICAgICB7IGlkOiA1LCBpdGVtQ29kZTogJ0ExMDQnLCBkZXNjcmlwdGlvbjogJy0gMTZHQiBSQU0gVXBncmFkZScsIHF1YW50aXR5OiAxLCB1bml0UHJpY2U6IDEwMCwgdG90YWxQcmljZTogMCwgaXNVcGdyYWRlOiB0cnVlLCBpdGVtQ29kZVJvd1NwYW46IDAgfSxcXG4gICAgICAgIHsgaWQ6IDYsIGl0ZW1Db2RlOiAnQTEwNCcsIGRlc2NyaXB0aW9uOiAnLSA1MTJHQiBTU0QgVXBncmFkZScsIHF1YW50aXR5OiAxLCB1bml0UHJpY2U6IDE1MCwgdG90YWxQcmljZTogMCwgaXNVcGdyYWRlOiB0cnVlLCBpdGVtQ29kZVJvd1NwYW46IDAgfSxcXG4gICAgICAgIHsgaWQ6IDcsIGl0ZW1Db2RlOiAnVE9UQUwnLCBkZXNjcmlwdGlvbjogJycsIHF1YW50aXR5OiAwLCB1bml0UHJpY2U6IDAsIHRvdGFsUHJpY2U6IDI2MjUsIGl0ZW1Db2RlUm93U3BhbjogMSwgaXNGaXJzdEluR3JvdXA6IHRydWUgfVxcbiAgICBdKTtcXG5cXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW88R3JpZENvbERlZjxPcmRlckl0ZW0+W10+KCgpID0+IFtcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ2l0ZW1Db2RlJyxcXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSXRlbSBDb2RlJyxcXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93Lml0ZW1Db2RlUm93U3BhbiB8fCAxLFxcbiAgICAgICAgICAgIHJlbmRlckNlbGw6IChwYXJhbXMpID0+IHtcXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMucm93LmlzRmlyc3RJbkdyb3VwKSByZXR1cm4gbnVsbDtcXG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7fTtcXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA9PT0gJ1RPVEFMJykge1xcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuZm9udFdlaWdodCA9IDcwMDtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBzdHlsZT17c3R5bGV9PntwYXJhbXMudmFsdWV9PC9kaXY+O1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdkZXNjcmlwdGlvbicsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcXG4gICAgICAgICAgICB3aWR0aDogMjIwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMucm93LmlzVXBncmFkZSkge1xcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVxcXCJ1cGdyYWRlLWl0ZW1cXFwiPntwYXJhbXMudmFsdWV9PC9kaXY+O1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2PntwYXJhbXMudmFsdWV9PC9kaXY+O1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdxdWFudGl0eScsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1F1YW50aXR5JyxcXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgICAgICBhbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICAgICAgaGVhZGVyQWxpZ246ICdjZW50ZXInLFxcbiAgICAgICAgICAgIHJlbmRlckNlbGw6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSB8fCAnJ1xcbiAgICAgICAgfSxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ3VuaXRQcmljZScsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VuaXQgUHJpY2UnLFxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAoeyB2YWx1ZSB9KSA9PiB2YWx1ZSA/IGAkJHt2YWx1ZS50b0ZpeGVkKDIpfWAgOiAnJ1xcbiAgICAgICAgfSxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ3RvdGFsUHJpY2UnLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBQcmljZScsXFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnJvdy5pc1VwZ3JhZGUpIHJldHVybiAnJztcXG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IHRleHRBbGlnbjogJ3JpZ2h0JyB9O1xcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnJvdy5pdGVtQ29kZSA9PT0gJ1RPVEFMJykge1xcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuZm9udFdlaWdodCA9IDcwMDtcXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmZvbnRTaXplID0gJzEuMDVlbSc7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYgc3R5bGU9e3N0eWxlfT4ke3BhcmFtcy52YWx1ZS50b0ZpeGVkKDIpfTwvZGl2PjtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9XFxuICAgIF0sIFtdKTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJleGFtcGxlLXNlY3Rpb25cXFwiPlxcbiAgICAgICAgICAgIDxoMz4xLiBPcmRlciBJdGVtcyB3aXRoIFVwZ3JhZGVzPC9oMz5cXG4gICAgICAgICAgICA8cD5cXG4gICAgICAgICAgICAgICAgSXRlbSBDb2RlIGNvbHVtbiBzcGFucyBhY3Jvc3MgdGhlIG1haW4gcHJvZHVjdCBhbmQgaXRzIHVwZ3JhZGUgb3B0aW9ucy5cXG4gICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImV4YW1wbGUtZ3JpZC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgPERhdGFHcmlkXFxuICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgIGF1dG9IZWlnaHRcXG4gICAgICAgICAgICAgICAgICAgIHJvd0hlaWdodD17NDh9XFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJIZWlnaHQ9ezQ4fVxcbiAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICk7XFxufVxcblxcbmludGVyZmFjZSBFbXBsb3llZVJvbGUge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICBuYW1lOiBzdHJpbmc7XFxuICAgIGRlc2lnbmF0aW9uOiBzdHJpbmc7XFxuICAgIGRlcGFydG1lbnQ6IHN0cmluZztcXG4gICAgYWdlOiBzdHJpbmc7XFxuICAgIG5hbWVSb3dTcGFuPzogbnVtYmVyO1xcbiAgICBhZ2VSb3dTcGFuPzogbnVtYmVyO1xcbiAgICBkZXBhcnRtZW50Um93U3Bhbj86IG51bWJlcjtcXG4gICAgaXNGaXJzdFJvbGU/OiBib29sZWFuO1xcbn1cXG5cXG5mdW5jdGlvbiBFbXBsb3llZVJvbGVzRXhhbXBsZSgpIHtcXG4gICAgY29uc3QgW3Jvd3NdID0gdXNlU3RhdGU8RW1wbG95ZWVSb2xlW10+KFtcXG4gICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdBbmRyZXcgQ2xhcmsnLCBkZXNpZ25hdGlvbjogJ1JlYWN0IEVuZ2luZWVyJywgZGVwYXJ0bWVudDogJ0VuZ2luZWVyaW5nJywgYWdlOiAnMjUgeW8nLCBuYW1lUm93U3BhbjogMiwgYWdlUm93U3BhbjogMiwgaXNGaXJzdFJvbGU6IHRydWUgfSxcXG4gICAgICAgIHsgaWQ6IDIsIG5hbWU6ICdBbmRyZXcgQ2xhcmsnLCBkZXNpZ25hdGlvbjogJ1RlY2huaWNhbCBJbnRlcnZpZXdlcicsIGRlcGFydG1lbnQ6ICdIdW1hbiByZXNvdXJjZScsIGFnZTogJzI1IHlvJywgbmFtZVJvd1NwYW46IDAsIGFnZVJvd1NwYW46IDAsIGRlcGFydG1lbnRSb3dTcGFuOiAxIH0sXFxuICAgICAgICB7IGlkOiAzLCBuYW1lOiAnQ3ludGhpYSBEdWtlJywgZGVzaWduYXRpb246ICdUZWNobmljYWwgVGVhbSBMZWFkJywgZGVwYXJ0bWVudDogJ0VuZ2luZWVyaW5nJywgZGVwYXJ0bWVudFJvd1NwYW46IDIsIGFnZTogJzI1IHlvJywgbmFtZVJvd1NwYW46IDEsIGFnZVJvd1NwYW46IDEsIGlzRmlyc3RSb2xlOiB0cnVlIH0sXFxuICAgICAgICB7IGlkOiA0LCBuYW1lOiAnSm9yZHluIEJsYWNrJywgZGVzaWduYXRpb246ICdSZWFjdCBFbmdpbmVlcicsIGRlcGFydG1lbnQ6ICcnLCBkZXBhcnRtZW50Um93U3BhbjogMiwgYWdlOiAnMzEgeW8nLCBuYW1lUm93U3BhbjogMSwgYWdlUm93U3BhbjogMSwgaXNGaXJzdFJvbGU6IHRydWUgfSxcXG4gICAgICAgIHsgaWQ6IDUsIG5hbWU6ICdSZW5lIEdsYXNzJywgZGVzaWduYXRpb246ICdPcHMgTGVhZCcsIGRlcGFydG1lbnQ6ICdPcGVyYXRpb25zJywgYWdlOiAnMzEgeW8nLCBuYW1lUm93U3BhbjogMSwgYWdlUm93U3BhbjogMSwgaXNGaXJzdFJvbGU6IHRydWUgfVxcbiAgICBdKTtcXG5cXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW88R3JpZENvbERlZjxFbXBsb3llZVJvbGU+W10+KCgpID0+IFtcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ25hbWUnLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdOYW1lJyxcXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93Lm5hbWVSb3dTcGFuIHx8IDEsXFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy5yb3cuaXNGaXJzdFJvbGUpIHJldHVybiBudWxsO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnZhbHVlO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdkZXNpZ25hdGlvbicsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2lnbmF0aW9uJyxcXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZVxcbiAgICAgICAgfSxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ2RlcGFydG1lbnQnLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50JyxcXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93LmRlcGFydG1lbnRSb3dTcGFuIHx8IDFcXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdhZ2UnLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBZ2UnLFxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxcbiAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcXG4gICAgICAgICAgICBoZWFkZXJBbGlnbjogJ2NlbnRlcicsXFxuICAgICAgICAgICAgcm93U3BhbjogKHBhcmFtcykgPT4gcGFyYW1zLnJvdy5hZ2VSb3dTcGFuIHx8IDEsXFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy5yb3cuaXNGaXJzdFJvbGUpIHJldHVybiBudWxsO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnZhbHVlO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH1cXG4gICAgXSwgW10pO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImV4YW1wbGUtc2VjdGlvblxcXCI+XFxuICAgICAgICAgICAgPGgzPjIuIEVtcGxveWVlIHdpdGggTXVsdGlwbGUgUm9sZXM8L2gzPlxcbiAgICAgICAgICAgIDxwPlxcbiAgICAgICAgICAgICAgICBOYW1lIGFuZCBBZ2UgY29sdW1ucyBzcGFuIGFjcm9zcyBtdWx0aXBsZSByb3dzIHdoZW4gYW4gZW1wbG95ZWUgaGFzIG11bHRpcGxlIHJvbGVzLlxcbiAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZXhhbXBsZS1ncmlkLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0hlaWdodFxcbiAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXs1Mn1cXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NDh9XFxuICAgICAgICAgICAgICAgIC8+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgKTtcXG59XFxuXFxuaW50ZXJmYWNlIENvdXJzZVNjaGVkdWxlIHtcXG4gICAgaWQ6IG51bWJlcjtcXG4gICAgZGF5OiBzdHJpbmc7XFxuICAgIHRpbWU6IHN0cmluZztcXG4gICAgY291cnNlOiBzdHJpbmc7XFxuICAgIGluc3RydWN0b3I6IHN0cmluZztcXG4gICAgcm9vbTogc3RyaW5nO1xcbiAgICBub3Rlczogc3RyaW5nO1xcbiAgICBjb3Vyc2VSb3dTcGFuPzogbnVtYmVyO1xcbiAgICBpbnN0cnVjdG9yUm93U3Bhbj86IG51bWJlcjtcXG4gICAgcm9vbVJvd1NwYW4/OiBudW1iZXI7XFxuICAgIGlzRmlyc3RTbG90PzogYm9vbGVhbjtcXG59XFxuXFxuZnVuY3Rpb24gQ291cnNlU2NoZWR1bGVFeGFtcGxlKCkge1xcbiAgICBjb25zdCBbcm93c10gPSB1c2VTdGF0ZTxDb3Vyc2VTY2hlZHVsZVtdPihbXFxuICAgICAgICB7IGlkOiAxLCBkYXk6ICdNb25kYXknLCB0aW1lOiAnOTowMCBBTSAtIDEwOjMwIEFNJywgY291cnNlOiAnQWR2YW5jZWQgTWF0aGVtYXRpY3MgKERyLiBTbWl0aCknLCBpbnN0cnVjdG9yOiAnRHIuIFNtaXRoJywgcm9vbTogJ1Jvb20gMTAxJywgbm90ZXM6ICdNaWR0ZXJtIGV4YW0nLCBjb3Vyc2VSb3dTcGFuOiAyLCBpbnN0cnVjdG9yUm93U3BhbjogMiwgcm9vbVJvd1NwYW46IDIsIGlzRmlyc3RTbG90OiB0cnVlIH0sXFxuICAgICAgICB7IGlkOiAyLCBkYXk6ICdNb25kYXknLCB0aW1lOiAnMTA6MzAgQU0gLSAxMjowMCBQTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICcnLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcXG4gICAgICAgIHsgaWQ6IDMsIGRheTogJ1R1ZXNkYXknLCB0aW1lOiAnOTowMCBBTSAtIDEwOjMwIEFNJywgY291cnNlOiAnJywgaW5zdHJ1Y3RvcjogJycsIHJvb206ICcnLCBub3RlczogJ1ByYWN0aWNhbCBhbmQgbGFiJywgY291cnNlUm93U3BhbjogMCwgaW5zdHJ1Y3RvclJvd1NwYW46IDAsIHJvb21Sb3dTcGFuOiAwIH0sXFxuICAgICAgICB7IGlkOiA0LCBkYXk6ICdUdWVzZGF5JywgdGltZTogJzEwOjMwIEFNIC0gMTI6MDAgUE0nLCBjb3Vyc2U6ICdJbnRyb2R1Y3Rpb24gdG8gQmlvbG9neSAoRHIuIEpvaG5zb24pJywgaW5zdHJ1Y3RvcjogJ0RyLiBKb2huc29uJywgcm9vbTogJ1Jvb20gMTA3Jywgbm90ZXM6ICdMYWIgc2Vzc2lvbicsIGNvdXJzZVJvd1NwYW46IDEsIGluc3RydWN0b3JSb3dTcGFuOiAxLCByb29tUm93U3BhbjogMSwgaXNGaXJzdFNsb3Q6IHRydWUgfSxcXG4gICAgICAgIHsgaWQ6IDUsIGRheTogJ1dlZG5lc2RheScsIHRpbWU6ICc5OjAwIEFNIC0gMTA6MzAgQU0nLCBjb3Vyc2U6ICdDb21wdXRlciBTY2llbmNlIDEwMSAoRHIuIExlZSknLCBpbnN0cnVjdG9yOiAnRHIuIExlZScsIHJvb206ICdSb29tIDMwMycsIG5vdGVzOiAnQ2xhc3MnLCBjb3Vyc2VSb3dTcGFuOiAyLCBpbnN0cnVjdG9yUm93U3BhbjogMiwgcm9vbVJvd1NwYW46IDIsIGlzRmlyc3RTbG90OiB0cnVlIH0sXFxuICAgICAgICB7IGlkOiA2LCBkYXk6ICdXZWRuZXNkYXknLCB0aW1lOiAnMTA6MzAgQU0gLSAxMjowMCBQTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICdMYWIgc2Vzc2lvbicsIGNvdXJzZVJvd1NwYW46IDAsIGluc3RydWN0b3JSb3dTcGFuOiAwLCByb29tUm93U3BhbjogMCB9LFxcbiAgICAgICAgeyBpZDogNywgZGF5OiAnVGh1cnNkYXknLCB0aW1lOiAnOTowMCBBTSAtIDExOjAwIEFNJywgY291cnNlOiAnUGh5c2ljcyBJSSAoRHIuIENhcnRlciknLCBpbnN0cnVjdG9yOiAnRHIuIENhcnRlcicsIHJvb206ICdSb29tIDEwNCcsIG5vdGVzOiAnUHJvamVjdCBEaXNjdXNzaW9uJywgY291cnNlUm93U3BhbjogMiwgaW5zdHJ1Y3RvclJvd1NwYW46IDIsIHJvb21Sb3dTcGFuOiAyLCBpc0ZpcnN0U2xvdDogdHJ1ZSB9LFxcbiAgICAgICAgeyBpZDogOCwgZGF5OiAnVGh1cnNkYXknLCB0aW1lOiAnMTE6MDAgQU0gLSAxMjozMCBQTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICcnLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcXG4gICAgICAgIHsgaWQ6IDksIGRheTogJ0ZyaWRheScsIHRpbWU6ICc5OjAwIEFNIC0gMTE6MDAgQU0nLCBjb3Vyc2U6ICcnLCBpbnN0cnVjdG9yOiAnJywgcm9vbTogJycsIG5vdGVzOiAnUHJvamVjdCBTdWJtaXNzaW9uJywgY291cnNlUm93U3BhbjogMCwgaW5zdHJ1Y3RvclJvd1NwYW46IDAsIHJvb21Sb3dTcGFuOiAwIH0sXFxuICAgICAgICB7IGlkOiAxMCwgZGF5OiAnRnJpZGF5JywgdGltZTogJzExOjAwIEFNIC0gMTI6MzAgUE0nLCBjb3Vyc2U6ICdMaXRlcmF0dXJlICYgQ29tcG9zaXRpb24gKFByb2YuIEFkYW1zKScsIGluc3RydWN0b3I6ICdQcm9mLiBBZGFtcycsIHJvb206ICdMZWN0dXJlIEhhbGwgMScsIG5vdGVzOiAnUmVhZGluZyBBc3NpZ25tZW50JywgY291cnNlUm93U3BhbjogMSwgaW5zdHJ1Y3RvclJvd1NwYW46IDEsIHJvb21Sb3dTcGFuOiAxLCBpc0ZpcnN0U2xvdDogdHJ1ZSB9XFxuICAgIF0pO1xcblxcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbzxHcmlkQ29sRGVmPENvdXJzZVNjaGVkdWxlPltdPigoKSA9PiBbXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdkYXknLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEYXknLFxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGZpZWxkOiAndGltZScsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWUnLFxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGZpZWxkOiAnY291cnNlJyxcXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ291cnNlJyxcXG4gICAgICAgICAgICB3aWR0aDogMjgwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93LmNvdXJzZVJvd1NwYW4gfHwgMSxcXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnJvdy5pc0ZpcnN0U2xvdCkgcmV0dXJuIG51bGw7XFxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDUwMCB9fT57cGFyYW1zLnZhbHVlfTwvZGl2PjtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGZpZWxkOiAnaW5zdHJ1Y3RvcicsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0luc3RydWN0b3InLFxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxcbiAgICAgICAgICAgIHJvd1NwYW46IChwYXJhbXMpID0+IHBhcmFtcy5yb3cuaW5zdHJ1Y3RvclJvd1NwYW4gfHwgMSxcXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnJvdy5pc0ZpcnN0U2xvdCkgcmV0dXJuIG51bGw7XFxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXMudmFsdWU7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgfSxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ3Jvb20nLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSb29tJyxcXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93LnJvb21Sb3dTcGFuIHx8IDEsXFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy5yb3cuaXNGaXJzdFNsb3QpIHJldHVybiBudWxsO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnZhbHVlO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdub3RlcycsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ05vdGVzJyxcXG4gICAgICAgICAgICB3aWR0aDogMTYwLFxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZVxcbiAgICAgICAgfVxcbiAgICBdLCBbXSk7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZXhhbXBsZS1zZWN0aW9uXFxcIj5cXG4gICAgICAgICAgICA8aDM+My4gQ291cnNlIFNjaGVkdWxlPC9oMz5cXG4gICAgICAgICAgICA8cD5cXG4gICAgICAgICAgICAgICAgQ291cnNlLCBJbnN0cnVjdG9yLCBhbmQgUm9vbSBjb2x1bW5zIHNwYW4gYWNyb3NzIG11bHRpcGxlIHRpbWUgc2xvdHMgZm9yIHRoZSBzYW1lIGNsYXNzLlxcbiAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiZXhhbXBsZS1ncmlkLXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0hlaWdodFxcbiAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXs1Mn1cXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NDh9XFxuICAgICAgICAgICAgICAgIC8+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgKTtcXG59XFxuXFxuaW50ZXJmYWNlIFRpbWV0YWJsZVNsb3Qge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICB0aW1lOiBzdHJpbmc7XFxuICAgIG1vbmRheTogc3RyaW5nO1xcbiAgICB0dWVzZGF5OiBzdHJpbmc7XFxuICAgIHdlZG5lc2RheTogc3RyaW5nO1xcbiAgICB0aHVyc2RheTogc3RyaW5nO1xcbiAgICBmcmlkYXk6IHN0cmluZztcXG5cXG4gICAgbW9uZGF5Um93U3Bhbj86IG51bWJlcjtcXG4gICAgdHVlc2RheVJvd1NwYW4/OiBudW1iZXI7XFxuICAgIHdlZG5lc2RheVJvd1NwYW4/OiBudW1iZXI7XFxuICAgIHRodXJzZGF5Um93U3Bhbj86IG51bWJlcjtcXG4gICAgZnJpZGF5Um93U3Bhbj86IG51bWJlcjtcXG5cXG4gICAgbW9uZGF5Q29sU3Bhbj86IG51bWJlcjtcXG4gICAgdHVlc2RheUNvbFNwYW4/OiBudW1iZXI7XFxuICAgIHdlZG5lc2RheUNvbFNwYW4/OiBudW1iZXI7XFxuICAgIHRodXJzZGF5Q29sU3Bhbj86IG51bWJlcjtcXG4gICAgZnJpZGF5Q29sU3Bhbj86IG51bWJlcjtcXG4gICAgaXNGaXJzdEluU3Bhbj86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xcbn1cXG5cXG5mdW5jdGlvbiBXZWVrbHlUaW1ldGFibGVFeGFtcGxlKCkge1xcbiAgICBjb25zdCBbcm93c10gPSB1c2VTdGF0ZTxUaW1ldGFibGVTbG90W10+KFtcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBpZDogMSxcXG4gICAgICAgICAgICB0aW1lOiAnMDk6MDAgLSAxMDowMCcsXFxuICAgICAgICAgICAgbW9uZGF5OiAnTWF0aHMnLFxcbiAgICAgICAgICAgIHR1ZXNkYXk6ICdDaGVtaXN0cnknLFxcbiAgICAgICAgICAgIHdlZG5lc2RheTogJ1BoeXNpY3MnLFxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnTXVzaWMnLFxcbiAgICAgICAgICAgIGZyaWRheTogJ01hdGhzJyxcXG4gICAgICAgICAgICB0dWVzZGF5Um93U3BhbjogMixcXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IHR1ZXNkYXk6IHRydWUgfVxcbiAgICAgICAgfSxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBpZDogMixcXG4gICAgICAgICAgICB0aW1lOiAnMTA6MDAgLSAxMTowMCcsXFxuICAgICAgICAgICAgbW9uZGF5OiAnRW5nbGlzaCcsXFxuICAgICAgICAgICAgdHVlc2RheTogJycsXFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnRW5nbGlzaCcsXFxuICAgICAgICAgICAgdGh1cnNkYXk6ICdFbmdsaXNoJyxcXG4gICAgICAgICAgICBmcmlkYXk6ICdEYW5jZScsXFxuICAgICAgICAgICAgbW9uZGF5Um93U3BhbjogMixcXG4gICAgICAgICAgICB0aHVyc2RheVJvd1NwYW46IDIsXFxuICAgICAgICAgICAgZnJpZGF5Um93U3BhbjogMyxcXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IG1vbmRheTogdHJ1ZSwgdGh1cnNkYXk6IHRydWUsIGZyaWRheTogdHJ1ZSB9XFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGlkOiAzLFxcbiAgICAgICAgICAgIHRpbWU6ICcxMTowMCAtIDEyOjAwJyxcXG4gICAgICAgICAgICBtb25kYXk6ICcnLFxcbiAgICAgICAgICAgIHR1ZXNkYXk6ICdQaHlzaWNzJyxcXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICdNYXRocycsXFxuICAgICAgICAgICAgdGh1cnNkYXk6ICcnLFxcbiAgICAgICAgICAgIGZyaWRheTogJycsXFxuICAgICAgICAgICAgdHVlc2RheVJvd1NwYW46IDMsXFxuICAgICAgICAgICAgd2VkbmVzZGF5Um93U3BhbjogMyxcXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IHR1ZXNkYXk6IHRydWUsIHdlZG5lc2RheTogdHJ1ZSB9XFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGlkOiA0LFxcbiAgICAgICAgICAgIHRpbWU6ICcxMjowMCAtIDEzOjAwJyxcXG4gICAgICAgICAgICBtb25kYXk6ICdMYWInLFxcbiAgICAgICAgICAgIHR1ZXNkYXk6ICcnLFxcbiAgICAgICAgICAgIHdlZG5lc2RheTogJycsXFxuICAgICAgICAgICAgdGh1cnNkYXk6ICdDaGVtaXN0cnknLFxcbiAgICAgICAgICAgIGZyaWRheTogJycsXFxuICAgICAgICAgICAgbW9uZGF5Um93U3BhbjogMixcXG4gICAgICAgICAgICB0aHVyc2RheVJvd1NwYW46IDIsXFxuICAgICAgICAgICAgaXNGaXJzdEluU3BhbjogeyBtb25kYXk6IHRydWUsIHRodXJzZGF5OiB0cnVlIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgaWQ6IDUsXFxuICAgICAgICAgICAgdGltZTogJzEzOjAwIC0gMTQ6MDAnLFxcbiAgICAgICAgICAgIG1vbmRheTogJycsXFxuICAgICAgICAgICAgdHVlc2RheTogJycsXFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnJyxcXG4gICAgICAgICAgICB0aHVyc2RheTogJycsXFxuICAgICAgICAgICAgZnJpZGF5OiAnUGh5c2ljcydcXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgaWQ6IDYsXFxuICAgICAgICAgICAgdGltZTogJzE0OjAwIC0gMTU6MDAnLFxcbiAgICAgICAgICAgIG1vbmRheTogJ0xhYicsXFxuICAgICAgICAgICAgdHVlc2RheTogJ01hdGhzJyxcXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICdDaGVtaXN0cnknLFxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnQ2hlbWlzdHJ5JyxcXG4gICAgICAgICAgICBmcmlkYXk6ICdFbmdsaXNoJyxcXG4gICAgICAgICAgICB3ZWRuZXNkYXlSb3dTcGFuOiAyLFxcbiAgICAgICAgICAgIHRodXJzZGF5Um93U3BhbjogMixcXG4gICAgICAgICAgICBmcmlkYXlSb3dTcGFuOiAzLFxcbiAgICAgICAgICAgIGlzRmlyc3RJblNwYW46IHsgd2VkbmVzZGF5OiB0cnVlLCB0aHVyc2RheTogdHJ1ZSwgZnJpZGF5OiB0cnVlIH1cXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgaWQ6IDcsXFxuICAgICAgICAgICAgdGltZTogJzE1OjAwIC0gMTY6MDAnLFxcbiAgICAgICAgICAgIG1vbmRheTogJ011c2ljJyxcXG4gICAgICAgICAgICB0dWVzZGF5OiAnTGFiJyxcXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICcnLFxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnJyxcXG4gICAgICAgICAgICBmcmlkYXk6ICcnLFxcbiAgICAgICAgICAgIG1vbmRheVJvd1NwYW46IDIsXFxuICAgICAgICAgICAgdHVlc2RheVJvd1NwYW46IDIsXFxuICAgICAgICAgICAgaXNGaXJzdEluU3BhbjogeyBtb25kYXk6IHRydWUsIHR1ZXNkYXk6IHRydWUsIGZyaWRheTogdHJ1ZSB9XFxuICAgICAgICB9LFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGlkOiA4LFxcbiAgICAgICAgICAgIHRpbWU6ICcxNjowMCAtIDE3OjAwJyxcXG4gICAgICAgICAgICBtb25kYXk6ICcnLFxcbiAgICAgICAgICAgIHR1ZXNkYXk6ICdEYW5jZScsXFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnJyxcXG4gICAgICAgICAgICB0aHVyc2RheTogJycsXFxuICAgICAgICAgICAgZnJpZGF5OiAnJ1xcbiAgICAgICAgfVxcbiAgICBdKTtcXG5cXG4gICAgY29uc3Qgc3ViamVjdENvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcXG4gICAgICAgICdNYXRocyc6ICcjNGNhZjUwJyxcXG4gICAgICAgICdFbmdsaXNoJzogJyM5YzljMDAnLFxcbiAgICAgICAgJ1BoeXNpY3MnOiAnIzIxOTZmMycsXFxuICAgICAgICAnQ2hlbWlzdHJ5JzogJyNjMTcxNzEnLFxcbiAgICAgICAgJ0xhYic6ICcjNzU3NTc1JyxcXG4gICAgICAgICdNdXNpYyc6ICcjYjg4NjBiJyxcXG4gICAgICAgICdEYW5jZSc6ICcjOTU3NWNkJ1xcbiAgICB9O1xcblxcbiAgICBjb25zdCBnZXRTdWJqZWN0U3R5bGUgPSAoc3ViamVjdDogc3RyaW5nKTogUmVhY3QuQ1NTUHJvcGVydGllcyA9PiAoe1xcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzdWJqZWN0Q29sb3JzW3N1YmplY3RdIHx8ICcjNjY2JyxcXG4gICAgfSk7XFxuXFxuICAgIGNvbnN0IGNyZWF0ZURheUNvbHVtbiA9IChmaWVsZDoga2V5b2YgVGltZXRhYmxlU2xvdCwgaGVhZGVyTmFtZTogc3RyaW5nKTogR3JpZENvbERlZjxUaW1ldGFibGVTbG90PiA9PiAoe1xcbiAgICAgICAgZmllbGQ6IGZpZWxkIGFzIHN0cmluZyxcXG4gICAgICAgIGhlYWRlck5hbWUsXFxuICAgICAgICB3aWR0aDogMTQwLFxcbiAgICAgICAgc29ydGFibGU6IGZhbHNlLFxcbiAgICAgICAgcm93U3BhbjogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgIGNvbnN0IHNwYW5LZXkgPSBgJHtmaWVsZH1Sb3dTcGFuYCBhcyBrZXlvZiBUaW1ldGFibGVTbG90O1xcbiAgICAgICAgICAgIHJldHVybiAocGFyYW1zLnJvd1tzcGFuS2V5XSBhcyBudW1iZXIpIHx8IDE7XFxuICAgICAgICB9LFxcbiAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlIGFzIHN0cmluZztcXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gbnVsbDtcXG5cXG4gICAgICAgICAgICBjb25zdCBpc0ZpcnN0ID0gcGFyYW1zLnJvdy5pc0ZpcnN0SW5TcGFuPy5bZmllbGQgYXMgc3RyaW5nXTtcXG4gICAgICAgICAgICBpZiAocGFyYW1zLnJvd1tgJHtmaWVsZH1Sb3dTcGFuYCBhcyBrZXlvZiBUaW1ldGFibGVTbG90XSAmJiAhaXNGaXJzdCkge1xcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVxcXCJzdWJqZWN0LWNlbGxcXFwiIHN0eWxlPXtnZXRTdWJqZWN0U3R5bGUodmFsdWUpfT57dmFsdWV9PC9kaXY+O1xcbiAgICAgICAgfVxcbiAgICB9KTtcXG5cXG4gICAgY29uc3QgY29sdW1uczogR3JpZENvbERlZjxUaW1ldGFibGVTbG90PltdID0gW1xcbiAgICAgICAge1xcbiAgICAgICAgICAgIGZpZWxkOiAndGltZScsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWUnLFxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXFxuICAgICAgICB9LFxcbiAgICAgICAgY3JlYXRlRGF5Q29sdW1uKCdtb25kYXknLCAnTW9uZGF5JyksXFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ3R1ZXNkYXknLCAnVHVlc2RheScpLFxcbiAgICAgICAgY3JlYXRlRGF5Q29sdW1uKCd3ZWRuZXNkYXknLCAnV2VkbmVzZGF5JyksXFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ3RodXJzZGF5JywgJ1RodXJzZGF5JyksXFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ2ZyaWRheScsICdGcmlkYXknKVxcbiAgICBdO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImV4YW1wbGUtc2VjdGlvblxcXCI+XFxuICAgICAgICAgICAgPGgzPjQuIFdlZWtseSBUaW1ldGFibGUgKFJvdyBTcGFubmluZyk8L2gzPlxcbiAgICAgICAgICAgIDxwPlxcbiAgICAgICAgICAgICAgICBTdWJqZWN0cyBzcGFuIGFjcm9zcyBtdWx0aXBsZSB0aW1lIHNsb3RzIHZlcnRpY2FsbHkuIEVhY2ggc3ViamVjdCBoYXMgYSBkaXN0aW5jdCBjb2xvci5cXG4gICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImV4YW1wbGUtZ3JpZC13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgPERhdGFHcmlkXFxuICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgIGF1dG9IZWlnaHRcXG4gICAgICAgICAgICAgICAgICAgIHJvd0hlaWdodD17NTZ9XFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJIZWlnaHQ9ezQ4fVxcbiAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICk7XFxufVxcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJvd1NwYW5uaW5nU2hvd2Nhc2UoKSB7XFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJSb3cgU3Bhbm5pbmdcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIk1lcmdlIGNlbGxzIHZlcnRpY2FsbHkgYWNyb3NzIG11bHRpcGxlIHJvd3MgdXNpbmcgdGhlIHJvd1NwYW4gY2FsbGJhY2suIEdyb3VwIHZpc3VhbGx5IHJlbGF0ZWQgZGF0YSB3aXRob3V0IHJlc3RydWN0dXJpbmcgeW91ciB1bmRlcmx5aW5nIGRhdGFzZXQuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPE9yZGVySXRlbXNFeGFtcGxlIC8+XFxuICAgICAgICAgICAgPEVtcGxveWVlUm9sZXNFeGFtcGxlIC8+XFxuICAgICAgICAgICAgPENvdXJzZVNjaGVkdWxlRXhhbXBsZSAvPlxcbiAgICAgICAgICAgIDxXZWVrbHlUaW1ldGFibGVFeGFtcGxlIC8+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInNwYW5uaW5nLWluZm8tYm94XFxcIj5cXG4gICAgICAgICAgICAgICAgPHN0cm9uZz7imqDvuI8gSW1wb3J0YW50OiBGZWF0dXJlIENvbXBhdGliaWxpdHkgd2l0aCBSb3cgU3Bhbm5pbmc8L3N0cm9uZz5cXG4gICAgICAgICAgICAgICAgPHA+XFxuICAgICAgICAgICAgICAgICAgICBXaGVuIHVzaW5nIDxjb2RlPnJvd1NwYW48L2NvZGU+LCBzb21lIGZlYXR1cmVzIG1heSBiZSBwb2ludGxlc3Mgb3IgbWF5IG5vdCB3b3JrIGFzIGV4cGVjdGVkLlxcbiAgICAgICAgICAgICAgICAgICAgVG8gYXZvaWQgYSBjb25mdXNpbmcgZ3JpZCBsYXlvdXQsIGNvbnNpZGVyIDxzdHJvbmc+ZGlzYWJsaW5nIHRoZSBmb2xsb3dpbmcgZmVhdHVyZXM8L3N0cm9uZz4gZm9yIGFueSBjb2x1bW5zIGFmZmVjdGVkIGJ5IDxjb2RlPnJvd1NwYW48L2NvZGU+OlxcbiAgICAgICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgICAgIDx1bD5cXG4gICAgICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPlNvcnRpbmc8L3N0cm9uZz4gLSBTZXQgPGNvZGU+c29ydGFibGU6IGZhbHNlPC9jb2RlPiAoYWxsIGV4YW1wbGVzIGFib3ZlIGRpc2FibGUgdGhpcyk8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+RmlsdGVyaW5nPC9zdHJvbmc+IC0gQXZvaWQgdXNpbmcgZmlsdGVycyBvbiBzcGFubmVkIGNvbHVtbnM8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+Q29sdW1uIFJlb3JkZXI8L3N0cm9uZz4gLSBSZW9yZGVyaW5nIGNhbiBicmVhayB0aGUgc3Bhbm5pbmcgbG9naWM8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+SGlkaW5nIENvbHVtbnM8L3N0cm9uZz4gLSBIaWRkZW4gY29sdW1ucyBjYW4gY2F1c2UgbWlzYWxpZ25tZW50PC9saT5cXG4gICAgICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPkNvbHVtbiBQaW5uaW5nPC9zdHJvbmc+IC0gUGlubmluZyBzcGFubmVkIGNvbHVtbnMgbWF5IGNhdXNlIGxheW91dCBpc3N1ZXM8L2xpPlxcbiAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzAuOTVlbScsIGZvbnRTdHlsZTogJ2l0YWxpYycgfX0+XFxuICAgICAgICAgICAgICAgICAgICDwn5KhIDxzdHJvbmc+QmVzdCBQcmFjdGljZTo8L3N0cm9uZz4gVXNlIHJvdyBzcGFubmluZyBwcmltYXJpbHkgZm9yIGRpc3BsYXkgcHVycG9zZXMgaW4gcmVhZC1vbmx5IGdyaWRzXFxuICAgICAgICAgICAgICAgICAgICBvciB0YWJsZXMgd2hlcmUgaW50ZXJhY3RpdmUgZmVhdHVyZXMgYXJlIG5vdCByZXF1aXJlZC4gRm9yIGR5bmFtaWMgaGllcmFyY2hpY2FsIGRhdGEsIGNvbnNpZGVyIHVzaW5nIHRoZSBUcmVlIERhdGEgZmVhdHVyZSBpbnN0ZWFkLlxcbiAgICAgICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERhdGFHcmlkLCBHcmlkQ29sRGVmIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCAnLi9Sb3dTcGFubmluZ1Nob3djYXNlLmNzcyc7XG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vUm93U3Bhbm5pbmdTaG93Y2FzZS50c3g/cmF3JztcblxuaW50ZXJmYWNlIE9yZGVySXRlbSB7XG4gICAgaWQ6IG51bWJlcjtcbiAgICBpdGVtQ29kZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcXVhbnRpdHk6IG51bWJlcjtcbiAgICB1bml0UHJpY2U6IG51bWJlcjtcbiAgICB0b3RhbFByaWNlOiBudW1iZXI7XG4gICAgaXNVcGdyYWRlPzogYm9vbGVhbjtcbiAgICBpdGVtQ29kZVJvd1NwYW4/OiBudW1iZXI7XG4gICAgaXNGaXJzdEluR3JvdXA/OiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBPcmRlckl0ZW1zRXhhbXBsZSgpIHtcbiAgICBjb25zdCBbcm93c10gPSB1c2VTdGF0ZTxPcmRlckl0ZW1bXT4oW1xuICAgICAgICB7IGlkOiAxLCBpdGVtQ29kZTogJ0ExMDEnLCBkZXNjcmlwdGlvbjogJ1dpcmVsZXNzIE1vdXNlJywgcXVhbnRpdHk6IDIsIHVuaXRQcmljZTogNTAsIHRvdGFsUHJpY2U6IDEwMCwgaXRlbUNvZGVSb3dTcGFuOiAxLCBpc0ZpcnN0SW5Hcm91cDogdHJ1ZSB9LFxuICAgICAgICB7IGlkOiAyLCBpdGVtQ29kZTogJ0ExMDInLCBkZXNjcmlwdGlvbjogJ01lY2hhbmljYWwgS2V5Ym9hcmQnLCBxdWFudGl0eTogMSwgdW5pdFByaWNlOiA3NSwgdG90YWxQcmljZTogNzUsIGl0ZW1Db2RlUm93U3BhbjogMSwgaXNGaXJzdEluR3JvdXA6IHRydWUgfSxcbiAgICAgICAgeyBpZDogMywgaXRlbUNvZGU6ICdBMTAzJywgZGVzY3JpcHRpb246ICdVU0IgRG9jayBTdGF0aW9uJywgcXVhbnRpdHk6IDEsIHVuaXRQcmljZTogNDAwLCB0b3RhbFByaWNlOiA0MDAsIGl0ZW1Db2RlUm93U3BhbjogMSwgaXNGaXJzdEluR3JvdXA6IHRydWUgfSxcbiAgICAgICAgeyBpZDogNCwgaXRlbUNvZGU6ICdBMTA0JywgZGVzY3JpcHRpb246ICdMYXB0b3AnLCBxdWFudGl0eTogMSwgdW5pdFByaWNlOiAxODAwLCB0b3RhbFByaWNlOiAyMDUwLCBpdGVtQ29kZVJvd1NwYW46IDMsIGlzRmlyc3RJbkdyb3VwOiB0cnVlIH0sXG4gICAgICAgIHsgaWQ6IDUsIGl0ZW1Db2RlOiAnQTEwNCcsIGRlc2NyaXB0aW9uOiAnLSAxNkdCIFJBTSBVcGdyYWRlJywgcXVhbnRpdHk6IDEsIHVuaXRQcmljZTogMTAwLCB0b3RhbFByaWNlOiAwLCBpc1VwZ3JhZGU6IHRydWUsIGl0ZW1Db2RlUm93U3BhbjogMCB9LFxuICAgICAgICB7IGlkOiA2LCBpdGVtQ29kZTogJ0ExMDQnLCBkZXNjcmlwdGlvbjogJy0gNTEyR0IgU1NEIFVwZ3JhZGUnLCBxdWFudGl0eTogMSwgdW5pdFByaWNlOiAxNTAsIHRvdGFsUHJpY2U6IDAsIGlzVXBncmFkZTogdHJ1ZSwgaXRlbUNvZGVSb3dTcGFuOiAwIH0sXG4gICAgICAgIHsgaWQ6IDcsIGl0ZW1Db2RlOiAnVE9UQUwnLCBkZXNjcmlwdGlvbjogJycsIHF1YW50aXR5OiAwLCB1bml0UHJpY2U6IDAsIHRvdGFsUHJpY2U6IDI2MjUsIGl0ZW1Db2RlUm93U3BhbjogMSwgaXNGaXJzdEluR3JvdXA6IHRydWUgfVxuICAgIF0pO1xuXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW88R3JpZENvbERlZjxPcmRlckl0ZW0+W10+KCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpdGVtQ29kZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSXRlbSBDb2RlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93Lml0ZW1Db2RlUm93U3BhbiB8fCAxLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnJvdy5pc0ZpcnN0SW5Hcm91cCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnZhbHVlID09PSAnVE9UQUwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmZvbnRXZWlnaHQgPSA3MDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IHN0eWxlPXtzdHlsZX0+e3BhcmFtcy52YWx1ZX08L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHdpZHRoOiAyMjAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy5yb3cuaXNVcGdyYWRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cInVwZ3JhZGUtaXRlbVwiPntwYXJhbXMudmFsdWV9PC9kaXY+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj57cGFyYW1zLnZhbHVlfTwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdxdWFudGl0eScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUXVhbnRpdHknLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgaGVhZGVyQWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlIHx8ICcnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndW5pdFByaWNlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVbml0IFByaWNlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHsgdmFsdWUgfSkgPT4gdmFsdWUgPyBgJCR7dmFsdWUudG9GaXhlZCgyKX1gIDogJydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0b3RhbFByaWNlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBQcmljZScsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMucm93LmlzVXBncmFkZSkgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0geyB0ZXh0QWxpZ246ICdyaWdodCcgfTtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnJvdy5pdGVtQ29kZSA9PT0gJ1RPVEFMJykge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS5mb250V2VpZ2h0ID0gNzAwO1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS5mb250U2l6ZSA9ICcxLjA1ZW0nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBzdHlsZT17c3R5bGV9PiR7cGFyYW1zLnZhbHVlLnRvRml4ZWQoMil9PC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXSwgW10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJleGFtcGxlLXNlY3Rpb25cIj5cbiAgICAgICAgICAgIDxoMz4xLiBPcmRlciBJdGVtcyB3aXRoIFVwZ3JhZGVzPC9oMz5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIEl0ZW0gQ29kZSBjb2x1bW4gc3BhbnMgYWNyb3NzIHRoZSBtYWluIHByb2R1Y3QgYW5kIGl0cyB1cGdyYWRlIG9wdGlvbnMuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV4YW1wbGUtZ3JpZC13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9IZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXs0OH1cbiAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0PXs0OH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmludGVyZmFjZSBFbXBsb3llZVJvbGUge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlc2lnbmF0aW9uOiBzdHJpbmc7XG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xuICAgIGFnZTogc3RyaW5nO1xuICAgIG5hbWVSb3dTcGFuPzogbnVtYmVyO1xuICAgIGFnZVJvd1NwYW4/OiBudW1iZXI7XG4gICAgZGVwYXJ0bWVudFJvd1NwYW4/OiBudW1iZXI7XG4gICAgaXNGaXJzdFJvbGU/OiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBFbXBsb3llZVJvbGVzRXhhbXBsZSgpIHtcbiAgICBjb25zdCBbcm93c10gPSB1c2VTdGF0ZTxFbXBsb3llZVJvbGVbXT4oW1xuICAgICAgICB7IGlkOiAxLCBuYW1lOiAnQW5kcmV3IENsYXJrJywgZGVzaWduYXRpb246ICdSZWFjdCBFbmdpbmVlcicsIGRlcGFydG1lbnQ6ICdFbmdpbmVlcmluZycsIGFnZTogJzI1IHlvJywgbmFtZVJvd1NwYW46IDIsIGFnZVJvd1NwYW46IDIsIGlzRmlyc3RSb2xlOiB0cnVlIH0sXG4gICAgICAgIHsgaWQ6IDIsIG5hbWU6ICdBbmRyZXcgQ2xhcmsnLCBkZXNpZ25hdGlvbjogJ1RlY2huaWNhbCBJbnRlcnZpZXdlcicsIGRlcGFydG1lbnQ6ICdIdW1hbiByZXNvdXJjZScsIGFnZTogJzI1IHlvJywgbmFtZVJvd1NwYW46IDAsIGFnZVJvd1NwYW46IDAsIGRlcGFydG1lbnRSb3dTcGFuOiAxIH0sXG4gICAgICAgIHsgaWQ6IDMsIG5hbWU6ICdDeW50aGlhIER1a2UnLCBkZXNpZ25hdGlvbjogJ1RlY2huaWNhbCBUZWFtIExlYWQnLCBkZXBhcnRtZW50OiAnRW5naW5lZXJpbmcnLCBkZXBhcnRtZW50Um93U3BhbjogMiwgYWdlOiAnMjUgeW8nLCBuYW1lUm93U3BhbjogMSwgYWdlUm93U3BhbjogMSwgaXNGaXJzdFJvbGU6IHRydWUgfSxcbiAgICAgICAgeyBpZDogNCwgbmFtZTogJ0pvcmR5biBCbGFjaycsIGRlc2lnbmF0aW9uOiAnUmVhY3QgRW5naW5lZXInLCBkZXBhcnRtZW50OiAnJywgZGVwYXJ0bWVudFJvd1NwYW46IDIsIGFnZTogJzMxIHlvJywgbmFtZVJvd1NwYW46IDEsIGFnZVJvd1NwYW46IDEsIGlzRmlyc3RSb2xlOiB0cnVlIH0sXG4gICAgICAgIHsgaWQ6IDUsIG5hbWU6ICdSZW5lIEdsYXNzJywgZGVzaWduYXRpb246ICdPcHMgTGVhZCcsIGRlcGFydG1lbnQ6ICdPcGVyYXRpb25zJywgYWdlOiAnMzEgeW8nLCBuYW1lUm93U3BhbjogMSwgYWdlUm93U3BhbjogMSwgaXNGaXJzdFJvbGU6IHRydWUgfVxuICAgIF0pO1xuXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW88R3JpZENvbERlZjxFbXBsb3llZVJvbGU+W10+KCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdOYW1lJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93Lm5hbWVSb3dTcGFuIHx8IDEsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMucm93LmlzRmlyc3RSb2xlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rlc2lnbmF0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXNpZ25hdGlvbicsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVwYXJ0bWVudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcm93U3BhbjogKHBhcmFtcykgPT4gcGFyYW1zLnJvdy5kZXBhcnRtZW50Um93U3BhbiB8fCAxXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWdlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBZ2UnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGhlYWRlckFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHJvd1NwYW46IChwYXJhbXMpID0+IHBhcmFtcy5yb3cuYWdlUm93U3BhbiB8fCAxLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnJvdy5pc0ZpcnN0Um9sZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF0sIFtdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXhhbXBsZS1zZWN0aW9uXCI+XG4gICAgICAgICAgICA8aDM+Mi4gRW1wbG95ZWUgd2l0aCBNdWx0aXBsZSBSb2xlczwvaDM+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICBOYW1lIGFuZCBBZ2UgY29sdW1ucyBzcGFuIGFjcm9zcyBtdWx0aXBsZSByb3dzIHdoZW4gYW4gZW1wbG95ZWUgaGFzIG11bHRpcGxlIHJvbGVzLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJleGFtcGxlLWdyaWQtd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgICAgICBhdXRvSGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHJvd0hlaWdodD17NTJ9XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NDh9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuXG5pbnRlcmZhY2UgQ291cnNlU2NoZWR1bGUge1xuICAgIGlkOiBudW1iZXI7XG4gICAgZGF5OiBzdHJpbmc7XG4gICAgdGltZTogc3RyaW5nO1xuICAgIGNvdXJzZTogc3RyaW5nO1xuICAgIGluc3RydWN0b3I6IHN0cmluZztcbiAgICByb29tOiBzdHJpbmc7XG4gICAgbm90ZXM6IHN0cmluZztcbiAgICBjb3Vyc2VSb3dTcGFuPzogbnVtYmVyO1xuICAgIGluc3RydWN0b3JSb3dTcGFuPzogbnVtYmVyO1xuICAgIHJvb21Sb3dTcGFuPzogbnVtYmVyO1xuICAgIGlzRmlyc3RTbG90PzogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gQ291cnNlU2NoZWR1bGVFeGFtcGxlKCkge1xuICAgIGNvbnN0IFtyb3dzXSA9IHVzZVN0YXRlPENvdXJzZVNjaGVkdWxlW10+KFtcbiAgICAgICAgeyBpZDogMSwgZGF5OiAnTW9uZGF5JywgdGltZTogJzk6MDAgQU0gLSAxMDozMCBBTScsIGNvdXJzZTogJ0FkdmFuY2VkIE1hdGhlbWF0aWNzIChEci4gU21pdGgpJywgaW5zdHJ1Y3RvcjogJ0RyLiBTbWl0aCcsIHJvb206ICdSb29tIDEwMScsIG5vdGVzOiAnTWlkdGVybSBleGFtJywgY291cnNlUm93U3BhbjogMiwgaW5zdHJ1Y3RvclJvd1NwYW46IDIsIHJvb21Sb3dTcGFuOiAyLCBpc0ZpcnN0U2xvdDogdHJ1ZSB9LFxuICAgICAgICB7IGlkOiAyLCBkYXk6ICdNb25kYXknLCB0aW1lOiAnMTA6MzAgQU0gLSAxMjowMCBQTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICcnLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcbiAgICAgICAgeyBpZDogMywgZGF5OiAnVHVlc2RheScsIHRpbWU6ICc5OjAwIEFNIC0gMTA6MzAgQU0nLCBjb3Vyc2U6ICcnLCBpbnN0cnVjdG9yOiAnJywgcm9vbTogJycsIG5vdGVzOiAnUHJhY3RpY2FsIGFuZCBsYWInLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcbiAgICAgICAgeyBpZDogNCwgZGF5OiAnVHVlc2RheScsIHRpbWU6ICcxMDozMCBBTSAtIDEyOjAwIFBNJywgY291cnNlOiAnSW50cm9kdWN0aW9uIHRvIEJpb2xvZ3kgKERyLiBKb2huc29uKScsIGluc3RydWN0b3I6ICdEci4gSm9obnNvbicsIHJvb206ICdSb29tIDEwNycsIG5vdGVzOiAnTGFiIHNlc3Npb24nLCBjb3Vyc2VSb3dTcGFuOiAxLCBpbnN0cnVjdG9yUm93U3BhbjogMSwgcm9vbVJvd1NwYW46IDEsIGlzRmlyc3RTbG90OiB0cnVlIH0sXG4gICAgICAgIHsgaWQ6IDUsIGRheTogJ1dlZG5lc2RheScsIHRpbWU6ICc5OjAwIEFNIC0gMTA6MzAgQU0nLCBjb3Vyc2U6ICdDb21wdXRlciBTY2llbmNlIDEwMSAoRHIuIExlZSknLCBpbnN0cnVjdG9yOiAnRHIuIExlZScsIHJvb206ICdSb29tIDMwMycsIG5vdGVzOiAnQ2xhc3MnLCBjb3Vyc2VSb3dTcGFuOiAyLCBpbnN0cnVjdG9yUm93U3BhbjogMiwgcm9vbVJvd1NwYW46IDIsIGlzRmlyc3RTbG90OiB0cnVlIH0sXG4gICAgICAgIHsgaWQ6IDYsIGRheTogJ1dlZG5lc2RheScsIHRpbWU6ICcxMDozMCBBTSAtIDEyOjAwIFBNJywgY291cnNlOiAnJywgaW5zdHJ1Y3RvcjogJycsIHJvb206ICcnLCBub3RlczogJ0xhYiBzZXNzaW9uJywgY291cnNlUm93U3BhbjogMCwgaW5zdHJ1Y3RvclJvd1NwYW46IDAsIHJvb21Sb3dTcGFuOiAwIH0sXG4gICAgICAgIHsgaWQ6IDcsIGRheTogJ1RodXJzZGF5JywgdGltZTogJzk6MDAgQU0gLSAxMTowMCBBTScsIGNvdXJzZTogJ1BoeXNpY3MgSUkgKERyLiBDYXJ0ZXIpJywgaW5zdHJ1Y3RvcjogJ0RyLiBDYXJ0ZXInLCByb29tOiAnUm9vbSAxMDQnLCBub3RlczogJ1Byb2plY3QgRGlzY3Vzc2lvbicsIGNvdXJzZVJvd1NwYW46IDIsIGluc3RydWN0b3JSb3dTcGFuOiAyLCByb29tUm93U3BhbjogMiwgaXNGaXJzdFNsb3Q6IHRydWUgfSxcbiAgICAgICAgeyBpZDogOCwgZGF5OiAnVGh1cnNkYXknLCB0aW1lOiAnMTE6MDAgQU0gLSAxMjozMCBQTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICcnLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcbiAgICAgICAgeyBpZDogOSwgZGF5OiAnRnJpZGF5JywgdGltZTogJzk6MDAgQU0gLSAxMTowMCBBTScsIGNvdXJzZTogJycsIGluc3RydWN0b3I6ICcnLCByb29tOiAnJywgbm90ZXM6ICdQcm9qZWN0IFN1Ym1pc3Npb24nLCBjb3Vyc2VSb3dTcGFuOiAwLCBpbnN0cnVjdG9yUm93U3BhbjogMCwgcm9vbVJvd1NwYW46IDAgfSxcbiAgICAgICAgeyBpZDogMTAsIGRheTogJ0ZyaWRheScsIHRpbWU6ICcxMTowMCBBTSAtIDEyOjMwIFBNJywgY291cnNlOiAnTGl0ZXJhdHVyZSAmIENvbXBvc2l0aW9uIChQcm9mLiBBZGFtcyknLCBpbnN0cnVjdG9yOiAnUHJvZi4gQWRhbXMnLCByb29tOiAnTGVjdHVyZSBIYWxsIDEnLCBub3RlczogJ1JlYWRpbmcgQXNzaWdubWVudCcsIGNvdXJzZVJvd1NwYW46IDEsIGluc3RydWN0b3JSb3dTcGFuOiAxLCByb29tUm93U3BhbjogMSwgaXNGaXJzdFNsb3Q6IHRydWUgfVxuICAgIF0pO1xuXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW88R3JpZENvbERlZjxDb3Vyc2VTY2hlZHVsZT5bXT4oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2RheScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGF5JyxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0aW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUaW1lJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdjb3Vyc2UnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NvdXJzZScsXG4gICAgICAgICAgICB3aWR0aDogMjgwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcm93U3BhbjogKHBhcmFtcykgPT4gcGFyYW1zLnJvdy5jb3Vyc2VSb3dTcGFuIHx8IDEsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMucm93LmlzRmlyc3RTbG90KSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA1MDAgfX0+e3BhcmFtcy52YWx1ZX08L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaW5zdHJ1Y3RvcicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSW5zdHJ1Y3RvcicsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgcm93U3BhbjogKHBhcmFtcykgPT4gcGFyYW1zLnJvdy5pbnN0cnVjdG9yUm93U3BhbiB8fCAxLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnJvdy5pc0ZpcnN0U2xvdCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdyb29tJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSb29tJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiBwYXJhbXMucm93LnJvb21Sb3dTcGFuIHx8IDEsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMucm93LmlzRmlyc3RTbG90KSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ25vdGVzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdOb3RlcycsXG4gICAgICAgICAgICB3aWR0aDogMTYwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV4YW1wbGUtc2VjdGlvblwiPlxuICAgICAgICAgICAgPGgzPjMuIENvdXJzZSBTY2hlZHVsZTwvaDM+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICBDb3Vyc2UsIEluc3RydWN0b3IsIGFuZCBSb29tIGNvbHVtbnMgc3BhbiBhY3Jvc3MgbXVsdGlwbGUgdGltZSBzbG90cyBmb3IgdGhlIHNhbWUgY2xhc3MuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV4YW1wbGUtZ3JpZC13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9IZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXs1Mn1cbiAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0PXs0OH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmludGVyZmFjZSBUaW1ldGFibGVTbG90IHtcbiAgICBpZDogbnVtYmVyO1xuICAgIHRpbWU6IHN0cmluZztcbiAgICBtb25kYXk6IHN0cmluZztcbiAgICB0dWVzZGF5OiBzdHJpbmc7XG4gICAgd2VkbmVzZGF5OiBzdHJpbmc7XG4gICAgdGh1cnNkYXk6IHN0cmluZztcbiAgICBmcmlkYXk6IHN0cmluZztcblxuICAgIG1vbmRheVJvd1NwYW4/OiBudW1iZXI7XG4gICAgdHVlc2RheVJvd1NwYW4/OiBudW1iZXI7XG4gICAgd2VkbmVzZGF5Um93U3Bhbj86IG51bWJlcjtcbiAgICB0aHVyc2RheVJvd1NwYW4/OiBudW1iZXI7XG4gICAgZnJpZGF5Um93U3Bhbj86IG51bWJlcjtcblxuICAgIG1vbmRheUNvbFNwYW4/OiBudW1iZXI7XG4gICAgdHVlc2RheUNvbFNwYW4/OiBudW1iZXI7XG4gICAgd2VkbmVzZGF5Q29sU3Bhbj86IG51bWJlcjtcbiAgICB0aHVyc2RheUNvbFNwYW4/OiBudW1iZXI7XG4gICAgZnJpZGF5Q29sU3Bhbj86IG51bWJlcjtcbiAgICBpc0ZpcnN0SW5TcGFuPzogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG59XG5cbmZ1bmN0aW9uIFdlZWtseVRpbWV0YWJsZUV4YW1wbGUoKSB7XG4gICAgY29uc3QgW3Jvd3NdID0gdXNlU3RhdGU8VGltZXRhYmxlU2xvdFtdPihbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgdGltZTogJzA5OjAwIC0gMTA6MDAnLFxuICAgICAgICAgICAgbW9uZGF5OiAnTWF0aHMnLFxuICAgICAgICAgICAgdHVlc2RheTogJ0NoZW1pc3RyeScsXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICdQaHlzaWNzJyxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnTXVzaWMnLFxuICAgICAgICAgICAgZnJpZGF5OiAnTWF0aHMnLFxuICAgICAgICAgICAgdHVlc2RheVJvd1NwYW46IDIsXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IHR1ZXNkYXk6IHRydWUgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgIHRpbWU6ICcxMDowMCAtIDExOjAwJyxcbiAgICAgICAgICAgIG1vbmRheTogJ0VuZ2xpc2gnLFxuICAgICAgICAgICAgdHVlc2RheTogJycsXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICdFbmdsaXNoJyxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnRW5nbGlzaCcsXG4gICAgICAgICAgICBmcmlkYXk6ICdEYW5jZScsXG4gICAgICAgICAgICBtb25kYXlSb3dTcGFuOiAyLFxuICAgICAgICAgICAgdGh1cnNkYXlSb3dTcGFuOiAyLFxuICAgICAgICAgICAgZnJpZGF5Um93U3BhbjogMyxcbiAgICAgICAgICAgIGlzRmlyc3RJblNwYW46IHsgbW9uZGF5OiB0cnVlLCB0aHVyc2RheTogdHJ1ZSwgZnJpZGF5OiB0cnVlIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICB0aW1lOiAnMTE6MDAgLSAxMjowMCcsXG4gICAgICAgICAgICBtb25kYXk6ICcnLFxuICAgICAgICAgICAgdHVlc2RheTogJ1BoeXNpY3MnLFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnTWF0aHMnLFxuICAgICAgICAgICAgdGh1cnNkYXk6ICcnLFxuICAgICAgICAgICAgZnJpZGF5OiAnJyxcbiAgICAgICAgICAgIHR1ZXNkYXlSb3dTcGFuOiAzLFxuICAgICAgICAgICAgd2VkbmVzZGF5Um93U3BhbjogMyxcbiAgICAgICAgICAgIGlzRmlyc3RJblNwYW46IHsgdHVlc2RheTogdHJ1ZSwgd2VkbmVzZGF5OiB0cnVlIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICB0aW1lOiAnMTI6MDAgLSAxMzowMCcsXG4gICAgICAgICAgICBtb25kYXk6ICdMYWInLFxuICAgICAgICAgICAgdHVlc2RheTogJycsXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICcnLFxuICAgICAgICAgICAgdGh1cnNkYXk6ICdDaGVtaXN0cnknLFxuICAgICAgICAgICAgZnJpZGF5OiAnJyxcbiAgICAgICAgICAgIG1vbmRheVJvd1NwYW46IDIsXG4gICAgICAgICAgICB0aHVyc2RheVJvd1NwYW46IDIsXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IG1vbmRheTogdHJ1ZSwgdGh1cnNkYXk6IHRydWUgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogNSxcbiAgICAgICAgICAgIHRpbWU6ICcxMzowMCAtIDE0OjAwJyxcbiAgICAgICAgICAgIG1vbmRheTogJycsXG4gICAgICAgICAgICB0dWVzZGF5OiAnJyxcbiAgICAgICAgICAgIHdlZG5lc2RheTogJycsXG4gICAgICAgICAgICB0aHVyc2RheTogJycsXG4gICAgICAgICAgICBmcmlkYXk6ICdQaHlzaWNzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogNixcbiAgICAgICAgICAgIHRpbWU6ICcxNDowMCAtIDE1OjAwJyxcbiAgICAgICAgICAgIG1vbmRheTogJ0xhYicsXG4gICAgICAgICAgICB0dWVzZGF5OiAnTWF0aHMnLFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnQ2hlbWlzdHJ5JyxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnQ2hlbWlzdHJ5JyxcbiAgICAgICAgICAgIGZyaWRheTogJ0VuZ2xpc2gnLFxuICAgICAgICAgICAgd2VkbmVzZGF5Um93U3BhbjogMixcbiAgICAgICAgICAgIHRodXJzZGF5Um93U3BhbjogMixcbiAgICAgICAgICAgIGZyaWRheVJvd1NwYW46IDMsXG4gICAgICAgICAgICBpc0ZpcnN0SW5TcGFuOiB7IHdlZG5lc2RheTogdHJ1ZSwgdGh1cnNkYXk6IHRydWUsIGZyaWRheTogdHJ1ZSB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgdGltZTogJzE1OjAwIC0gMTY6MDAnLFxuICAgICAgICAgICAgbW9uZGF5OiAnTXVzaWMnLFxuICAgICAgICAgICAgdHVlc2RheTogJ0xhYicsXG4gICAgICAgICAgICB3ZWRuZXNkYXk6ICcnLFxuICAgICAgICAgICAgdGh1cnNkYXk6ICcnLFxuICAgICAgICAgICAgZnJpZGF5OiAnJyxcbiAgICAgICAgICAgIG1vbmRheVJvd1NwYW46IDIsXG4gICAgICAgICAgICB0dWVzZGF5Um93U3BhbjogMixcbiAgICAgICAgICAgIGlzRmlyc3RJblNwYW46IHsgbW9uZGF5OiB0cnVlLCB0dWVzZGF5OiB0cnVlLCBmcmlkYXk6IHRydWUgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogOCxcbiAgICAgICAgICAgIHRpbWU6ICcxNjowMCAtIDE3OjAwJyxcbiAgICAgICAgICAgIG1vbmRheTogJycsXG4gICAgICAgICAgICB0dWVzZGF5OiAnRGFuY2UnLFxuICAgICAgICAgICAgd2VkbmVzZGF5OiAnJyxcbiAgICAgICAgICAgIHRodXJzZGF5OiAnJyxcbiAgICAgICAgICAgIGZyaWRheTogJydcbiAgICAgICAgfVxuICAgIF0pO1xuXG4gICAgY29uc3Qgc3ViamVjdENvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgJ01hdGhzJzogJyM0Y2FmNTAnLFxuICAgICAgICAnRW5nbGlzaCc6ICcjOWM5YzAwJyxcbiAgICAgICAgJ1BoeXNpY3MnOiAnIzIxOTZmMycsXG4gICAgICAgICdDaGVtaXN0cnknOiAnI2MxNzE3MScsXG4gICAgICAgICdMYWInOiAnIzc1NzU3NScsXG4gICAgICAgICdNdXNpYyc6ICcjYjg4NjBiJyxcbiAgICAgICAgJ0RhbmNlJzogJyM5NTc1Y2QnXG4gICAgfTtcblxuICAgIGNvbnN0IGdldFN1YmplY3RTdHlsZSA9IChzdWJqZWN0OiBzdHJpbmcpOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0+ICh7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogc3ViamVjdENvbG9yc1tzdWJqZWN0XSB8fCAnIzY2NicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBjcmVhdGVEYXlDb2x1bW4gPSAoZmllbGQ6IGtleW9mIFRpbWV0YWJsZVNsb3QsIGhlYWRlck5hbWU6IHN0cmluZyk6IEdyaWRDb2xEZWY8VGltZXRhYmxlU2xvdD4gPT4gKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkIGFzIHN0cmluZyxcbiAgICAgICAgaGVhZGVyTmFtZSxcbiAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICByb3dTcGFuOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzcGFuS2V5ID0gYCR7ZmllbGR9Um93U3BhbmAgYXMga2V5b2YgVGltZXRhYmxlU2xvdDtcbiAgICAgICAgICAgIHJldHVybiAocGFyYW1zLnJvd1tzcGFuS2V5XSBhcyBudW1iZXIpIHx8IDE7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlckNlbGw6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlIGFzIHN0cmluZztcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBpc0ZpcnN0ID0gcGFyYW1zLnJvdy5pc0ZpcnN0SW5TcGFuPy5bZmllbGQgYXMgc3RyaW5nXTtcbiAgICAgICAgICAgIGlmIChwYXJhbXMucm93W2Ake2ZpZWxkfVJvd1NwYW5gIGFzIGtleW9mIFRpbWV0YWJsZVNsb3RdICYmICFpc0ZpcnN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cInN1YmplY3QtY2VsbFwiIHN0eWxlPXtnZXRTdWJqZWN0U3R5bGUodmFsdWUpfT57dmFsdWV9PC9kaXY+O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPFRpbWV0YWJsZVNsb3Q+W10gPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndGltZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVGltZScsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZURheUNvbHVtbignbW9uZGF5JywgJ01vbmRheScpLFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ3R1ZXNkYXknLCAnVHVlc2RheScpLFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ3dlZG5lc2RheScsICdXZWRuZXNkYXknKSxcbiAgICAgICAgY3JlYXRlRGF5Q29sdW1uKCd0aHVyc2RheScsICdUaHVyc2RheScpLFxuICAgICAgICBjcmVhdGVEYXlDb2x1bW4oJ2ZyaWRheScsICdGcmlkYXknKVxuICAgIF07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV4YW1wbGUtc2VjdGlvblwiPlxuICAgICAgICAgICAgPGgzPjQuIFdlZWtseSBUaW1ldGFibGUgKFJvdyBTcGFubmluZyk8L2gzPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgU3ViamVjdHMgc3BhbiBhY3Jvc3MgbXVsdGlwbGUgdGltZSBzbG90cyB2ZXJ0aWNhbGx5LiBFYWNoIHN1YmplY3QgaGFzIGEgZGlzdGluY3QgY29sb3IuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImV4YW1wbGUtZ3JpZC13cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9IZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXs1Nn1cbiAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0PXs0OH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJvd1NwYW5uaW5nU2hvd2Nhc2UoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiUm93IFNwYW5uaW5nXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiTWVyZ2UgY2VsbHMgdmVydGljYWxseSBhY3Jvc3MgbXVsdGlwbGUgcm93cyB1c2luZyB0aGUgcm93U3BhbiBjYWxsYmFjay4gR3JvdXAgdmlzdWFsbHkgcmVsYXRlZCBkYXRhIHdpdGhvdXQgcmVzdHJ1Y3R1cmluZyB5b3VyIHVuZGVybHlpbmcgZGF0YXNldC5cIlxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPE9yZGVySXRlbXNFeGFtcGxlIC8+XG4gICAgICAgICAgICA8RW1wbG95ZWVSb2xlc0V4YW1wbGUgLz5cbiAgICAgICAgICAgIDxDb3Vyc2VTY2hlZHVsZUV4YW1wbGUgLz5cbiAgICAgICAgICAgIDxXZWVrbHlUaW1ldGFibGVFeGFtcGxlIC8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3Bhbm5pbmctaW5mby1ib3hcIj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPuKaoO+4jyBJbXBvcnRhbnQ6IEZlYXR1cmUgQ29tcGF0aWJpbGl0eSB3aXRoIFJvdyBTcGFubmluZzwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICBXaGVuIHVzaW5nIDxjb2RlPnJvd1NwYW48L2NvZGU+LCBzb21lIGZlYXR1cmVzIG1heSBiZSBwb2ludGxlc3Mgb3IgbWF5IG5vdCB3b3JrIGFzIGV4cGVjdGVkLlxuICAgICAgICAgICAgICAgICAgICBUbyBhdm9pZCBhIGNvbmZ1c2luZyBncmlkIGxheW91dCwgY29uc2lkZXIgPHN0cm9uZz5kaXNhYmxpbmcgdGhlIGZvbGxvd2luZyBmZWF0dXJlczwvc3Ryb25nPiBmb3IgYW55IGNvbHVtbnMgYWZmZWN0ZWQgYnkgPGNvZGU+cm93U3BhbjwvY29kZT46XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+U29ydGluZzwvc3Ryb25nPiAtIFNldCA8Y29kZT5zb3J0YWJsZTogZmFsc2U8L2NvZGU+IChhbGwgZXhhbXBsZXMgYWJvdmUgZGlzYWJsZSB0aGlzKTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPkZpbHRlcmluZzwvc3Ryb25nPiAtIEF2b2lkIHVzaW5nIGZpbHRlcnMgb24gc3Bhbm5lZCBjb2x1bW5zPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPjxzdHJvbmc+Q29sdW1uIFJlb3JkZXI8L3N0cm9uZz4gLSBSZW9yZGVyaW5nIGNhbiBicmVhayB0aGUgc3Bhbm5pbmcgbG9naWM8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PHN0cm9uZz5IaWRpbmcgQ29sdW1uczwvc3Ryb25nPiAtIEhpZGRlbiBjb2x1bW5zIGNhbiBjYXVzZSBtaXNhbGlnbm1lbnQ8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+PHN0cm9uZz5Db2x1bW4gUGlubmluZzwvc3Ryb25nPiAtIFBpbm5pbmcgc3Bhbm5lZCBjb2x1bW5zIG1heSBjYXVzZSBsYXlvdXQgaXNzdWVzPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMC45NWVtJywgZm9udFN0eWxlOiAnaXRhbGljJyB9fT5cbiAgICAgICAgICAgICAgICAgICAg8J+SoSA8c3Ryb25nPkJlc3QgUHJhY3RpY2U6PC9zdHJvbmc+IFVzZSByb3cgc3Bhbm5pbmcgcHJpbWFyaWx5IGZvciBkaXNwbGF5IHB1cnBvc2VzIGluIHJlYWQtb25seSBncmlkc1xuICAgICAgICAgICAgICAgICAgICBvciB0YWJsZXMgd2hlcmUgaW50ZXJhY3RpdmUgZmVhdHVyZXMgYXJlIG5vdCByZXF1aXJlZC4gRm9yIGR5bmFtaWMgaGllcmFyY2hpY2FsIGRhdGEsIGNvbnNpZGVyIHVzaW5nIHRoZSBUcmVlIERhdGEgZmVhdHVyZSBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiT3JkZXJJdGVtc0V4YW1wbGUiLCJyb3dzIiwidXNlU3RhdGUiLCJjb2x1bW5zIiwidXNlTWVtbyIsInBhcmFtcyIsInN0eWxlIiwianN4IiwidmFsdWUiLCJqc3hzIiwiRGF0YUdyaWQiLCJFbXBsb3llZVJvbGVzRXhhbXBsZSIsIkNvdXJzZVNjaGVkdWxlRXhhbXBsZSIsIldlZWtseVRpbWV0YWJsZUV4YW1wbGUiLCJzdWJqZWN0Q29sb3JzIiwiZ2V0U3ViamVjdFN0eWxlIiwic3ViamVjdCIsImNyZWF0ZURheUNvbHVtbiIsImZpZWxkIiwiaGVhZGVyTmFtZSIsInNwYW5LZXkiLCJpc0ZpcnN0IiwiUm93U3Bhbm5pbmdTaG93Y2FzZSIsIkRvY3NMYXlvdXQiXSwibWFwcGluZ3MiOiIrSUFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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
