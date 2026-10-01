import{r as l,j as t}from"./vendor-react-f02LKZLu.js";import{l as u,D as h}from"./opengridx-ZNEXlhmV.js";import{D as f}from"./DocsLayout-CwTr2FWN.js";const y=`
import { useState, useCallback } from 'react';
import { DataGrid, useGridStateStorage } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';
import './StatePersistenceDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './StatePersistenceDemo.tsx?raw';

interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    joinDate: string;
    status: 'active' | 'inactive' | 'on-leave';
}

const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Support', 'Design'];
const roles = ['Developer', 'Manager', 'Analyst', 'Designer', 'Specialist', 'Lead', 'Director'];
const statuses: Employee['status'][] = ['active', 'inactive', 'on-leave'];

function generateEmployees(count: number): Employee[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: \`Employee \${i + 1}\`,
        email: \`employee\${i + 1}@company.com\`,
        department: departments[i % departments.length],
        role: roles[i % roles.length],
        salary: 40000 + Math.floor(Math.random() * 120000),
        joinDate: new Date(2020 + Math.floor(i / 50), i % 12, (i % 28) + 1)
            .toISOString()
            .split('T')[0],
        status: statuses[i % 3],
    }));
}

const rows = generateEmployees(200);

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'email', headerName: 'Email', width: 240 },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'role', headerName: 'Role', width: 130 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        valueFormatter: (params) => \`$\${params.value?.toLocaleString()}\`,
    },
    { field: 'joinDate', headerName: 'Join Date', width: 130 },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
            const colors: Record<string, { bg: string; text: string }> = {
                active: { bg: '#dcfce7', text: '#166534' },
                inactive: { bg: '#fee2e2', text: '#991b1b' },
                'on-leave': { bg: '#fef3c7', text: '#92400e' },
            };
            const style = colors[params.value as string] ?? { bg: '#f3f4f6', text: '#374151' };
            return (
                <span
                    className="status-pill"
                    style={{
                        background: style.bg,
                        color: style.text,
                    }}
                >
                    {String(params.value)}
                </span>
            );
        },
    },
];

const STORAGE_KEY = 'ogx-demo-state-persistence';

export default function StatePersistenceDemo() {
    const { initialState, onStateChange, clearState } = useGridStateStorage(STORAGE_KEY);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const handleStateChange = useCallback(
        (state: import('../../../lib/state/types').GridState) => {
            onStateChange(state);
            setLastSaved(new Date().toLocaleTimeString());
        },
        [onStateChange]
    );

    const handleClear = () => {
        clearState();
        setLastSaved(null);
        window.location.reload();
    };

    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const storedState = raw ? JSON.parse(raw) : null;

    return (
        <DocsLayout
            title="State Persistence"
            description="Save and restore complete grid configuration — column order, widths, sort model, filter model, and visibility — to localStorage or any custom storage backend."
            sourceCode={sourceCode}
        >
            <div className="state-persist-controls">
                <button
                    onClick={handleClear}
                    className="state-clear-btn"
                >
                    🗑 Clear Saved State
                </button>

                {lastSaved && (
                    <span className="state-save-indicator">
                        ✓ Saved at {lastSaved}
                    </span>
                )}

                {initialState && (
                    <span className="state-restored-tag">
                        📦 Restored from localStorage
                    </span>
                )}
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                initialState={initialState}
                onStateChange={handleStateChange}
                pagination
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                ariaLabel="State persistence demo grid"
                height={600}
            />

            {storedState && (
                <details className="state-json-viewer">
                    <summary>🔍 View stored state (JSON)</summary>
                    <pre>{JSON.stringify(storedState, null, 2)}</pre>
                </details>
            )}
        </DocsLayout>
    );
}
`,d=["Engineering","Marketing","Sales","Finance","HR","Support","Design"],c=["Developer","Manager","Analyst","Designer","Specialist","Lead","Director"],w=["active","inactive","on-leave"];function v(a){return Array.from({length:a},(s,e)=>({id:e+1,name:`Employee ${e+1}`,email:`employee${e+1}@company.com`,department:d[e%d.length],role:c[e%c.length],salary:4e4+Math.floor(Math.random()*12e4),joinDate:new Date(2020+Math.floor(e/50),e%12,e%28+1).toISOString().split("T")[0],status:w[e%3]}))}const b=v(200),D=[{field:"id",headerName:"ID",width:70},{field:"name",headerName:"Name",width:180},{field:"email",headerName:"Email",width:240},{field:"department",headerName:"Department",width:140},{field:"role",headerName:"Role",width:130},{field:"salary",headerName:"Salary",width:130,type:"number",valueFormatter:a=>`$${a.value?.toLocaleString()}`},{field:"joinDate",headerName:"Join Date",width:130},{field:"status",headerName:"Status",width:120,renderCell:a=>{const e={active:{bg:"#dcfce7",text:"#166534"},inactive:{bg:"#fee2e2",text:"#991b1b"},"on-leave":{bg:"#fef3c7",text:"#92400e"}}[a.value]??{bg:"#f3f4f6",text:"#374151"};return t.jsx("span",{className:"status-pill",style:{background:e.bg,color:e.text},children:String(a.value)})}}],m="ogx-demo-state-persistence";function E(){const{initialState:a,onStateChange:s,clearState:e}=u(m),[o,r]=l.useState(null),p=l.useCallback(g=>{s(g),r(new Date().toLocaleTimeString())},[s]),S=()=>{e(),r(null),window.location.reload()},n=typeof window<"u"?window.localStorage.getItem(m):null,i=n?JSON.parse(n):null;return t.jsxs(f,{title:"State Persistence",description:"Save and restore complete grid configuration — column order, widths, sort model, filter model, and visibility — to localStorage or any custom storage backend.",sourceCode:y,children:[t.jsxs("div",{className:"state-persist-controls",children:[t.jsx("button",{onClick:S,className:"state-clear-btn",children:"🗑 Clear Saved State"}),o&&t.jsxs("span",{className:"state-save-indicator",children:["✓ Saved at ",o]}),a&&t.jsx("span",{className:"state-restored-tag",children:"📦 Restored from localStorage"})]}),t.jsx(h,{rows:b,columns:D,initialState:a,onStateChange:p,pagination:!0,pageSizeOptions:[10,25,50],checkboxSelection:!0,ariaLabel:"State persistence demo grid",height:600}),i&&t.jsxs("details",{className:"state-json-viewer",children:[t.jsx("summary",{children:"🔍 View stored state (JSON)"}),t.jsx("pre",{children:JSON.stringify(i,null,2)})]})]})}export{E as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVQZXJzaXN0ZW5jZURlbW8tQlJfNzV4dUEuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL1N0YXRlUGVyc2lzdGVuY2VEZW1vL1N0YXRlUGVyc2lzdGVuY2VEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9TdGF0ZVBlcnNpc3RlbmNlRGVtby9TdGF0ZVBlcnNpc3RlbmNlRGVtby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHsgRGF0YUdyaWQsIHVzZUdyaWRTdGF0ZVN0b3JhZ2UgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCB0eXBlIHsgR3JpZENvbERlZiwgR3JpZFJvd01vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgJy4vU3RhdGVQZXJzaXN0ZW5jZURlbW8uY3NzJztcXG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL1N0YXRlUGVyc2lzdGVuY2VEZW1vLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBFbXBsb3llZSBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZW1haWw6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBqb2luRGF0ZTogc3RyaW5nO1xcbiAgICBzdGF0dXM6ICdhY3RpdmUnIHwgJ2luYWN0aXZlJyB8ICdvbi1sZWF2ZSc7XFxufVxcblxcbmNvbnN0IGRlcGFydG1lbnRzID0gWydFbmdpbmVlcmluZycsICdNYXJrZXRpbmcnLCAnU2FsZXMnLCAnRmluYW5jZScsICdIUicsICdTdXBwb3J0JywgJ0Rlc2lnbiddO1xcbmNvbnN0IHJvbGVzID0gWydEZXZlbG9wZXInLCAnTWFuYWdlcicsICdBbmFseXN0JywgJ0Rlc2lnbmVyJywgJ1NwZWNpYWxpc3QnLCAnTGVhZCcsICdEaXJlY3RvciddO1xcbmNvbnN0IHN0YXR1c2VzOiBFbXBsb3llZVsnc3RhdHVzJ11bXSA9IFsnYWN0aXZlJywgJ2luYWN0aXZlJywgJ29uLWxlYXZlJ107XFxuXFxuZnVuY3Rpb24gZ2VuZXJhdGVFbXBsb3llZXMoY291bnQ6IG51bWJlcik6IEVtcGxveWVlW10ge1xcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnQgfSwgKF8sIGkpID0+ICh7XFxuICAgICAgICBpZDogaSArIDEsXFxuICAgICAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICAgICAgZW1haWw6IGBlbXBsb3llZSR7aSArIDF9QGNvbXBhbnkuY29tYCxcXG4gICAgICAgIGRlcGFydG1lbnQ6IGRlcGFydG1lbnRzW2kgJSBkZXBhcnRtZW50cy5sZW5ndGhdLFxcbiAgICAgICAgcm9sZTogcm9sZXNbaSAlIHJvbGVzLmxlbmd0aF0sXFxuICAgICAgICBzYWxhcnk6IDQwMDAwICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTIwMDAwKSxcXG4gICAgICAgIGpvaW5EYXRlOiBuZXcgRGF0ZSgyMDIwICsgTWF0aC5mbG9vcihpIC8gNTApLCBpICUgMTIsIChpICUgMjgpICsgMSlcXG4gICAgICAgICAgICAudG9JU09TdHJpbmcoKVxcbiAgICAgICAgICAgIC5zcGxpdCgnVCcpWzBdLFxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXNlc1tpICUgM10sXFxuICAgIH0pKTtcXG59XFxuXFxuY29uc3Qgcm93cyA9IGdlbmVyYXRlRW1wbG95ZWVzKDIwMCk7XFxuXFxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcXG4gICAgeyBmaWVsZDogJ2lkJywgaGVhZGVyTmFtZTogJ0lEJywgd2lkdGg6IDcwIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTgwIH0sXFxuICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHdpZHRoOiAyNDAgfSxcXG4gICAgeyBmaWVsZDogJ2RlcGFydG1lbnQnLCBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsIHdpZHRoOiAxNDAgfSxcXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxMzAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1NhbGFyeScsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQke3BhcmFtcy52YWx1ZT8udG9Mb2NhbGVTdHJpbmcoKX1gLFxcbiAgICB9LFxcbiAgICB7IGZpZWxkOiAnam9pbkRhdGUnLCBoZWFkZXJOYW1lOiAnSm9pbiBEYXRlJywgd2lkdGg6IDEzMCB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3N0YXR1cycsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcXG4gICAgICAgIHdpZHRoOiAxMjAsXFxuICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgY29uc3QgY29sb3JzOiBSZWNvcmQ8c3RyaW5nLCB7IGJnOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9PiA9IHtcXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB7IGJnOiAnI2RjZmNlNycsIHRleHQ6ICcjMTY2NTM0JyB9LFxcbiAgICAgICAgICAgICAgICBpbmFjdGl2ZTogeyBiZzogJyNmZWUyZTInLCB0ZXh0OiAnIzk5MWIxYicgfSxcXG4gICAgICAgICAgICAgICAgJ29uLWxlYXZlJzogeyBiZzogJyNmZWYzYzcnLCB0ZXh0OiAnIzkyNDAwZScgfSxcXG4gICAgICAgICAgICB9O1xcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gY29sb3JzW3BhcmFtcy52YWx1ZSBhcyBzdHJpbmddID8/IHsgYmc6ICcjZjNmNGY2JywgdGV4dDogJyMzNzQxNTEnIH07XFxuICAgICAgICAgICAgcmV0dXJuIChcXG4gICAgICAgICAgICAgICAgPHNwYW5cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwic3RhdHVzLXBpbGxcXFwiXFxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0eWxlLmJnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdHlsZS50ZXh0LFxcbiAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAge1N0cmluZyhwYXJhbXMudmFsdWUpfVxcbiAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgKTtcXG4gICAgICAgIH0sXFxuICAgIH0sXFxuXTtcXG5cXG5jb25zdCBTVE9SQUdFX0tFWSA9ICdvZ3gtZGVtby1zdGF0ZS1wZXJzaXN0ZW5jZSc7XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3RhdGVQZXJzaXN0ZW5jZURlbW8oKSB7XFxuICAgIGNvbnN0IHsgaW5pdGlhbFN0YXRlLCBvblN0YXRlQ2hhbmdlLCBjbGVhclN0YXRlIH0gPSB1c2VHcmlkU3RhdGVTdG9yYWdlKFNUT1JBR0VfS0VZKTtcXG4gICAgY29uc3QgW2xhc3RTYXZlZCwgc2V0TGFzdFNhdmVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xcblxcbiAgICBjb25zdCBoYW5kbGVTdGF0ZUNoYW5nZSA9IHVzZUNhbGxiYWNrKFxcbiAgICAgICAgKHN0YXRlOiBpbXBvcnQoJy4uLy4uLy4uL2xpYi9zdGF0ZS90eXBlcycpLkdyaWRTdGF0ZSkgPT4ge1xcbiAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2Uoc3RhdGUpO1xcbiAgICAgICAgICAgIHNldExhc3RTYXZlZChuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpKTtcXG4gICAgICAgIH0sXFxuICAgICAgICBbb25TdGF0ZUNoYW5nZV1cXG4gICAgKTtcXG5cXG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSAoKSA9PiB7XFxuICAgICAgICBjbGVhclN0YXRlKCk7XFxuICAgICAgICBzZXRMYXN0U2F2ZWQobnVsbCk7XFxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XFxuICAgIH07XFxuXFxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFNUT1JBR0VfS0VZKSA6IG51bGw7XFxuICAgIGNvbnN0IHN0b3JlZFN0YXRlID0gcmF3ID8gSlNPTi5wYXJzZShyYXcpIDogbnVsbDtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIlN0YXRlIFBlcnNpc3RlbmNlXFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJTYXZlIGFuZCByZXN0b3JlIGNvbXBsZXRlIGdyaWQgY29uZmlndXJhdGlvbiDigJQgY29sdW1uIG9yZGVyLCB3aWR0aHMsIHNvcnQgbW9kZWwsIGZpbHRlciBtb2RlbCwgYW5kIHZpc2liaWxpdHkg4oCUIHRvIGxvY2FsU3RvcmFnZSBvciBhbnkgY3VzdG9tIHN0b3JhZ2UgYmFja2VuZC5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwic3RhdGUtcGVyc2lzdC1jb250cm9sc1xcXCI+XFxuICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsZWFyfVxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJzdGF0ZS1jbGVhci1idG5cXFwiXFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIPCfl5EgQ2xlYXIgU2F2ZWQgU3RhdGVcXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XFxuXFxuICAgICAgICAgICAgICAgIHtsYXN0U2F2ZWQgJiYgKFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJzdGF0ZS1zYXZlLWluZGljYXRvclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAg4pyTIFNhdmVkIGF0IHtsYXN0U2F2ZWR9XFxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICl9XFxuXFxuICAgICAgICAgICAgICAgIHtpbml0aWFsU3RhdGUgJiYgKFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVxcXCJzdGF0ZS1yZXN0b3JlZC10YWdcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk6YgUmVzdG9yZWQgZnJvbSBsb2NhbFN0b3JhZ2VcXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgKX1cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgaW5pdGlhbFN0YXRlPXtpbml0aWFsU3RhdGV9XFxuICAgICAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2U9e2hhbmRsZVN0YXRlQ2hhbmdlfVxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyNSwgNTBdfVxcbiAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWw9XFxcIlN0YXRlIHBlcnNpc3RlbmNlIGRlbW8gZ3JpZFxcXCJcXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XFxuICAgICAgICAgICAgLz5cXG5cXG4gICAgICAgICAgICB7c3RvcmVkU3RhdGUgJiYgKFxcbiAgICAgICAgICAgICAgICA8ZGV0YWlscyBjbGFzc05hbWU9XFxcInN0YXRlLWpzb24tdmlld2VyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PvCflI0gVmlldyBzdG9yZWQgc3RhdGUgKEpTT04pPC9zdW1tYXJ5PlxcbiAgICAgICAgICAgICAgICAgICAgPHByZT57SlNPTi5zdHJpbmdpZnkoc3RvcmVkU3RhdGUsIG51bGwsIDIpfTwvcHJlPlxcbiAgICAgICAgICAgICAgICA8L2RldGFpbHM+XFxuICAgICAgICAgICAgKX1cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERhdGFHcmlkLCB1c2VHcmlkU3RhdGVTdG9yYWdlIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCB0eXBlIHsgR3JpZENvbERlZiwgR3JpZFJvd01vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCAnLi9TdGF0ZVBlcnNpc3RlbmNlRGVtby5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL1N0YXRlUGVyc2lzdGVuY2VEZW1vLnRzeD9yYXcnO1xuXG5pbnRlcmZhY2UgRW1wbG95ZWUgZXh0ZW5kcyBHcmlkUm93TW9kZWwge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVtYWlsOiBzdHJpbmc7XG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xuICAgIHJvbGU6IHN0cmluZztcbiAgICBzYWxhcnk6IG51bWJlcjtcbiAgICBqb2luRGF0ZTogc3RyaW5nO1xuICAgIHN0YXR1czogJ2FjdGl2ZScgfCAnaW5hY3RpdmUnIHwgJ29uLWxlYXZlJztcbn1cblxuY29uc3QgZGVwYXJ0bWVudHMgPSBbJ0VuZ2luZWVyaW5nJywgJ01hcmtldGluZycsICdTYWxlcycsICdGaW5hbmNlJywgJ0hSJywgJ1N1cHBvcnQnLCAnRGVzaWduJ107XG5jb25zdCByb2xlcyA9IFsnRGV2ZWxvcGVyJywgJ01hbmFnZXInLCAnQW5hbHlzdCcsICdEZXNpZ25lcicsICdTcGVjaWFsaXN0JywgJ0xlYWQnLCAnRGlyZWN0b3InXTtcbmNvbnN0IHN0YXR1c2VzOiBFbXBsb3llZVsnc3RhdHVzJ11bXSA9IFsnYWN0aXZlJywgJ2luYWN0aXZlJywgJ29uLWxlYXZlJ107XG5cbmZ1bmN0aW9uIGdlbmVyYXRlRW1wbG95ZWVzKGNvdW50OiBudW1iZXIpOiBFbXBsb3llZVtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnQgfSwgKF8sIGkpID0+ICh7XG4gICAgICAgIGlkOiBpICsgMSxcbiAgICAgICAgbmFtZTogYEVtcGxveWVlICR7aSArIDF9YCxcbiAgICAgICAgZW1haWw6IGBlbXBsb3llZSR7aSArIDF9QGNvbXBhbnkuY29tYCxcbiAgICAgICAgZGVwYXJ0bWVudDogZGVwYXJ0bWVudHNbaSAlIGRlcGFydG1lbnRzLmxlbmd0aF0sXG4gICAgICAgIHJvbGU6IHJvbGVzW2kgJSByb2xlcy5sZW5ndGhdLFxuICAgICAgICBzYWxhcnk6IDQwMDAwICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTIwMDAwKSxcbiAgICAgICAgam9pbkRhdGU6IG5ldyBEYXRlKDIwMjAgKyBNYXRoLmZsb29yKGkgLyA1MCksIGkgJSAxMiwgKGkgJSAyOCkgKyAxKVxuICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIC5zcGxpdCgnVCcpWzBdLFxuICAgICAgICBzdGF0dXM6IHN0YXR1c2VzW2kgJSAzXSxcbiAgICB9KSk7XG59XG5cbmNvbnN0IHJvd3MgPSBnZW5lcmF0ZUVtcGxveWVlcygyMDApO1xuXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xuICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA3MCB9LFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTgwIH0sXG4gICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDI0MCB9LFxuICAgIHsgZmllbGQ6ICdkZXBhcnRtZW50JywgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLCB3aWR0aDogMTQwIH0sXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxMzAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnc2FsYXJ5JyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1NhbGFyeScsXG4gICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQke3BhcmFtcy52YWx1ZT8udG9Mb2NhbGVTdHJpbmcoKX1gLFxuICAgIH0sXG4gICAgeyBmaWVsZDogJ2pvaW5EYXRlJywgaGVhZGVyTmFtZTogJ0pvaW4gRGF0ZScsIHdpZHRoOiAxMzAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgIHJlbmRlckNlbGw6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yczogUmVjb3JkPHN0cmluZywgeyBiZzogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfT4gPSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlOiB7IGJnOiAnI2RjZmNlNycsIHRleHQ6ICcjMTY2NTM0JyB9LFxuICAgICAgICAgICAgICAgIGluYWN0aXZlOiB7IGJnOiAnI2ZlZTJlMicsIHRleHQ6ICcjOTkxYjFiJyB9LFxuICAgICAgICAgICAgICAgICdvbi1sZWF2ZSc6IHsgYmc6ICcjZmVmM2M3JywgdGV4dDogJyM5MjQwMGUnIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBjb2xvcnNbcGFyYW1zLnZhbHVlIGFzIHN0cmluZ10gPz8geyBiZzogJyNmM2Y0ZjYnLCB0ZXh0OiAnIzM3NDE1MScgfTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3RhdHVzLXBpbGxcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3R5bGUuYmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogc3R5bGUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtTdHJpbmcocGFyYW1zLnZhbHVlKX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgIH0sXG5dO1xuXG5jb25zdCBTVE9SQUdFX0tFWSA9ICdvZ3gtZGVtby1zdGF0ZS1wZXJzaXN0ZW5jZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN0YXRlUGVyc2lzdGVuY2VEZW1vKCkge1xuICAgIGNvbnN0IHsgaW5pdGlhbFN0YXRlLCBvblN0YXRlQ2hhbmdlLCBjbGVhclN0YXRlIH0gPSB1c2VHcmlkU3RhdGVTdG9yYWdlKFNUT1JBR0VfS0VZKTtcbiAgICBjb25zdCBbbGFzdFNhdmVkLCBzZXRMYXN0U2F2ZWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgICBjb25zdCBoYW5kbGVTdGF0ZUNoYW5nZSA9IHVzZUNhbGxiYWNrKFxuICAgICAgICAoc3RhdGU6IGltcG9ydCgnLi4vLi4vLi4vbGliL3N0YXRlL3R5cGVzJykuR3JpZFN0YXRlKSA9PiB7XG4gICAgICAgICAgICBvblN0YXRlQ2hhbmdlKHN0YXRlKTtcbiAgICAgICAgICAgIHNldExhc3RTYXZlZChuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpKTtcbiAgICAgICAgfSxcbiAgICAgICAgW29uU3RhdGVDaGFuZ2VdXG4gICAgKTtcblxuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gKCkgPT4ge1xuICAgICAgICBjbGVhclN0YXRlKCk7XG4gICAgICAgIHNldExhc3RTYXZlZChudWxsKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH07XG5cbiAgICBjb25zdCByYXcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSkgOiBudWxsO1xuICAgIGNvbnN0IHN0b3JlZFN0YXRlID0gcmF3ID8gSlNPTi5wYXJzZShyYXcpIDogbnVsbDtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIlN0YXRlIFBlcnNpc3RlbmNlXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiU2F2ZSBhbmQgcmVzdG9yZSBjb21wbGV0ZSBncmlkIGNvbmZpZ3VyYXRpb24g4oCUIGNvbHVtbiBvcmRlciwgd2lkdGhzLCBzb3J0IG1vZGVsLCBmaWx0ZXIgbW9kZWwsIGFuZCB2aXNpYmlsaXR5IOKAlCB0byBsb2NhbFN0b3JhZ2Ugb3IgYW55IGN1c3RvbSBzdG9yYWdlIGJhY2tlbmQuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RhdGUtcGVyc2lzdC1jb250cm9sc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ2xlYXJ9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInN0YXRlLWNsZWFyLWJ0blwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICDwn5eRIENsZWFyIFNhdmVkIFN0YXRlXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgICAgICB7bGFzdFNhdmVkICYmIChcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic3RhdGUtc2F2ZS1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIOKckyBTYXZlZCBhdCB7bGFzdFNhdmVkfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICAgIHtpbml0aWFsU3RhdGUgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzdGF0ZS1yZXN0b3JlZC10YWdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIPCfk6YgUmVzdG9yZWQgZnJvbSBsb2NhbFN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIGluaXRpYWxTdGF0ZT17aW5pdGlhbFN0YXRlfVxuICAgICAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2U9e2hhbmRsZVN0YXRlQ2hhbmdlfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwXX1cbiAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD1cIlN0YXRlIHBlcnNpc3RlbmNlIGRlbW8gZ3JpZFwiXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICB7c3RvcmVkU3RhdGUgJiYgKFxuICAgICAgICAgICAgICAgIDxkZXRhaWxzIGNsYXNzTmFtZT1cInN0YXRlLWpzb24tdmlld2VyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PvCflI0gVmlldyBzdG9yZWQgc3RhdGUgKEpTT04pPC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8cHJlPntKU09OLnN0cmluZ2lmeShzdG9yZWRTdGF0ZSwgbnVsbCwgMil9PC9wcmU+XG4gICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsImRlcGFydG1lbnRzIiwicm9sZXMiLCJzdGF0dXNlcyIsImdlbmVyYXRlRW1wbG95ZWVzIiwiY291bnQiLCJfIiwiaSIsInJvd3MiLCJjb2x1bW5zIiwicGFyYW1zIiwic3R5bGUiLCJqc3giLCJTVE9SQUdFX0tFWSIsIlN0YXRlUGVyc2lzdGVuY2VEZW1vIiwiaW5pdGlhbFN0YXRlIiwib25TdGF0ZUNoYW5nZSIsImNsZWFyU3RhdGUiLCJ1c2VHcmlkU3RhdGVTdG9yYWdlIiwibGFzdFNhdmVkIiwic2V0TGFzdFNhdmVkIiwidXNlU3RhdGUiLCJoYW5kbGVTdGF0ZUNoYW5nZSIsInVzZUNhbGxiYWNrIiwic3RhdGUiLCJoYW5kbGVDbGVhciIsInJhdyIsInN0b3JlZFN0YXRlIiwianN4cyIsIkRvY3NMYXlvdXQiLCJEYXRhR3JpZCJdLCJt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
