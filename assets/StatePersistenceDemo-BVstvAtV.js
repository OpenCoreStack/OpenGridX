import{r as l,j as t}from"./vendor-react-LmGMyLnN.js";import{l as g,D as h}from"./opengridx-BlrvTAzD.js";import{D as f}from"./DocsLayout-BoGj89NG.js";const y=`
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
                    {params.value}
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
`,d=["Engineering","Marketing","Sales","Finance","HR","Support","Design"],c=["Developer","Manager","Analyst","Designer","Specialist","Lead","Director"],w=["active","inactive","on-leave"];function v(a){return Array.from({length:a},(s,e)=>({id:e+1,name:`Employee ${e+1}`,email:`employee${e+1}@company.com`,department:d[e%d.length],role:c[e%c.length],salary:4e4+Math.floor(Math.random()*12e4),joinDate:new Date(2020+Math.floor(e/50),e%12,e%28+1).toISOString().split("T")[0],status:w[e%3]}))}const b=v(200),D=[{field:"id",headerName:"ID",width:70},{field:"name",headerName:"Name",width:180},{field:"email",headerName:"Email",width:240},{field:"department",headerName:"Department",width:140},{field:"role",headerName:"Role",width:130},{field:"salary",headerName:"Salary",width:130,type:"number",valueFormatter:a=>`$${a.value?.toLocaleString()}`},{field:"joinDate",headerName:"Join Date",width:130},{field:"status",headerName:"Status",width:120,renderCell:a=>{const e={active:{bg:"#dcfce7",text:"#166534"},inactive:{bg:"#fee2e2",text:"#991b1b"},"on-leave":{bg:"#fef3c7",text:"#92400e"}}[a.value]??{bg:"#f3f4f6",text:"#374151"};return t.jsx("span",{className:"status-pill",style:{background:e.bg,color:e.text},children:a.value})}}],m="ogx-demo-state-persistence";function E(){const{initialState:a,onStateChange:s,clearState:e}=g(m),[o,r]=l.useState(null),p=l.useCallback(S=>{s(S),r(new Date().toLocaleTimeString())},[s]),u=()=>{e(),r(null),window.location.reload()},n=typeof window<"u"?window.localStorage.getItem(m):null,i=n?JSON.parse(n):null;return t.jsxs(f,{title:"State Persistence",description:"Save and restore complete grid configuration — column order, widths, sort model, filter model, and visibility — to localStorage or any custom storage backend.",sourceCode:y,children:[t.jsxs("div",{className:"state-persist-controls",children:[t.jsx("button",{onClick:u,className:"state-clear-btn",children:"🗑 Clear Saved State"}),o&&t.jsxs("span",{className:"state-save-indicator",children:["✓ Saved at ",o]}),a&&t.jsx("span",{className:"state-restored-tag",children:"📦 Restored from localStorage"})]}),t.jsx(h,{rows:b,columns:D,initialState:a,onStateChange:p,pagination:!0,pageSizeOptions:[10,25,50],checkboxSelection:!0,ariaLabel:"State persistence demo grid",height:600}),i&&t.jsxs("details",{className:"state-json-viewer",children:[t.jsx("summary",{children:"🔍 View stored state (JSON)"}),t.jsx("pre",{children:JSON.stringify(i,null,2)})]})]})}export{E as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVQZXJzaXN0ZW5jZURlbW8tQlZzdHZBdFYuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL1N0YXRlUGVyc2lzdGVuY2VEZW1vL1N0YXRlUGVyc2lzdGVuY2VEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9TdGF0ZVBlcnNpc3RlbmNlRGVtby9TdGF0ZVBlcnNpc3RlbmNlRGVtby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHsgRGF0YUdyaWQsIHVzZUdyaWRTdGF0ZVN0b3JhZ2UgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCB0eXBlIHsgR3JpZENvbERlZiwgR3JpZFJvd01vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgJy4vU3RhdGVQZXJzaXN0ZW5jZURlbW8uY3NzJztcXG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL1N0YXRlUGVyc2lzdGVuY2VEZW1vLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBFbXBsb3llZSBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZW1haWw6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBqb2luRGF0ZTogc3RyaW5nO1xcbiAgICBzdGF0dXM6ICdhY3RpdmUnIHwgJ2luYWN0aXZlJyB8ICdvbi1sZWF2ZSc7XFxufVxcblxcbmNvbnN0IGRlcGFydG1lbnRzID0gWydFbmdpbmVlcmluZycsICdNYXJrZXRpbmcnLCAnU2FsZXMnLCAnRmluYW5jZScsICdIUicsICdTdXBwb3J0JywgJ0Rlc2lnbiddO1xcbmNvbnN0IHJvbGVzID0gWydEZXZlbG9wZXInLCAnTWFuYWdlcicsICdBbmFseXN0JywgJ0Rlc2lnbmVyJywgJ1NwZWNpYWxpc3QnLCAnTGVhZCcsICdEaXJlY3RvciddO1xcbmNvbnN0IHN0YXR1c2VzOiBFbXBsb3llZVsnc3RhdHVzJ11bXSA9IFsnYWN0aXZlJywgJ2luYWN0aXZlJywgJ29uLWxlYXZlJ107XFxuXFxuZnVuY3Rpb24gZ2VuZXJhdGVFbXBsb3llZXMoY291bnQ6IG51bWJlcik6IEVtcGxveWVlW10ge1xcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnQgfSwgKF8sIGkpID0+ICh7XFxuICAgICAgICBpZDogaSArIDEsXFxuICAgICAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICAgICAgZW1haWw6IGBlbXBsb3llZSR7aSArIDF9QGNvbXBhbnkuY29tYCxcXG4gICAgICAgIGRlcGFydG1lbnQ6IGRlcGFydG1lbnRzW2kgJSBkZXBhcnRtZW50cy5sZW5ndGhdLFxcbiAgICAgICAgcm9sZTogcm9sZXNbaSAlIHJvbGVzLmxlbmd0aF0sXFxuICAgICAgICBzYWxhcnk6IDQwMDAwICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTIwMDAwKSxcXG4gICAgICAgIGpvaW5EYXRlOiBuZXcgRGF0ZSgyMDIwICsgTWF0aC5mbG9vcihpIC8gNTApLCBpICUgMTIsIChpICUgMjgpICsgMSlcXG4gICAgICAgICAgICAudG9JU09TdHJpbmcoKVxcbiAgICAgICAgICAgIC5zcGxpdCgnVCcpWzBdLFxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXNlc1tpICUgM10sXFxuICAgIH0pKTtcXG59XFxuXFxuY29uc3Qgcm93cyA9IGdlbmVyYXRlRW1wbG95ZWVzKDIwMCk7XFxuXFxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcXG4gICAgeyBmaWVsZDogJ2lkJywgaGVhZGVyTmFtZTogJ0lEJywgd2lkdGg6IDcwIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTgwIH0sXFxuICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHdpZHRoOiAyNDAgfSxcXG4gICAgeyBmaWVsZDogJ2RlcGFydG1lbnQnLCBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsIHdpZHRoOiAxNDAgfSxcXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxMzAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1NhbGFyeScsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQke3BhcmFtcy52YWx1ZT8udG9Mb2NhbGVTdHJpbmcoKX1gLFxcbiAgICB9LFxcbiAgICB7IGZpZWxkOiAnam9pbkRhdGUnLCBoZWFkZXJOYW1lOiAnSm9pbiBEYXRlJywgd2lkdGg6IDEzMCB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3N0YXR1cycsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcXG4gICAgICAgIHdpZHRoOiAxMjAsXFxuICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgY29uc3QgY29sb3JzOiBSZWNvcmQ8c3RyaW5nLCB7IGJnOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9PiA9IHtcXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB7IGJnOiAnI2RjZmNlNycsIHRleHQ6ICcjMTY2NTM0JyB9LFxcbiAgICAgICAgICAgICAgICBpbmFjdGl2ZTogeyBiZzogJyNmZWUyZTInLCB0ZXh0OiAnIzk5MWIxYicgfSxcXG4gICAgICAgICAgICAgICAgJ29uLWxlYXZlJzogeyBiZzogJyNmZWYzYzcnLCB0ZXh0OiAnIzkyNDAwZScgfSxcXG4gICAgICAgICAgICB9O1xcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gY29sb3JzW3BhcmFtcy52YWx1ZSBhcyBzdHJpbmddID8/IHsgYmc6ICcjZjNmNGY2JywgdGV4dDogJyMzNzQxNTEnIH07XFxuICAgICAgICAgICAgcmV0dXJuIChcXG4gICAgICAgICAgICAgICAgPHNwYW5cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwic3RhdHVzLXBpbGxcXFwiXFxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0eWxlLmJnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdHlsZS50ZXh0LFxcbiAgICAgICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAge3BhcmFtcy52YWx1ZX1cXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICk7XFxuICAgICAgICB9LFxcbiAgICB9LFxcbl07XFxuXFxuY29uc3QgU1RPUkFHRV9LRVkgPSAnb2d4LWRlbW8tc3RhdGUtcGVyc2lzdGVuY2UnO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFN0YXRlUGVyc2lzdGVuY2VEZW1vKCkge1xcbiAgICBjb25zdCB7IGluaXRpYWxTdGF0ZSwgb25TdGF0ZUNoYW5nZSwgY2xlYXJTdGF0ZSB9ID0gdXNlR3JpZFN0YXRlU3RvcmFnZShTVE9SQUdFX0tFWSk7XFxuICAgIGNvbnN0IFtsYXN0U2F2ZWQsIHNldExhc3RTYXZlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcXG5cXG4gICAgY29uc3QgaGFuZGxlU3RhdGVDaGFuZ2UgPSB1c2VDYWxsYmFjayhcXG4gICAgICAgIChzdGF0ZTogaW1wb3J0KCcuLi8uLi8uLi9saWIvc3RhdGUvdHlwZXMnKS5HcmlkU3RhdGUpID0+IHtcXG4gICAgICAgICAgICBvblN0YXRlQ2hhbmdlKHN0YXRlKTtcXG4gICAgICAgICAgICBzZXRMYXN0U2F2ZWQobmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKSk7XFxuICAgICAgICB9LFxcbiAgICAgICAgW29uU3RhdGVDaGFuZ2VdXFxuICAgICk7XFxuXFxuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gKCkgPT4ge1xcbiAgICAgICAgY2xlYXJTdGF0ZSgpO1xcbiAgICAgICAgc2V0TGFzdFNhdmVkKG51bGwpO1xcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xcbiAgICB9O1xcblxcbiAgICBjb25zdCByYXcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSkgOiBudWxsO1xcbiAgICBjb25zdCBzdG9yZWRTdGF0ZSA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IG51bGw7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJTdGF0ZSBQZXJzaXN0ZW5jZVxcXCJcXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cXFwiU2F2ZSBhbmQgcmVzdG9yZSBjb21wbGV0ZSBncmlkIGNvbmZpZ3VyYXRpb24g4oCUIGNvbHVtbiBvcmRlciwgd2lkdGhzLCBzb3J0IG1vZGVsLCBmaWx0ZXIgbW9kZWwsIGFuZCB2aXNpYmlsaXR5IOKAlCB0byBsb2NhbFN0b3JhZ2Ugb3IgYW55IGN1c3RvbSBzdG9yYWdlIGJhY2tlbmQuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInN0YXRlLXBlcnNpc3QtY29udHJvbHNcXFwiPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbGVhcn1cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwic3RhdGUtY2xlYXItYnRuXFxcIlxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICDwn5eRIENsZWFyIFNhdmVkIFN0YXRlXFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcblxcbiAgICAgICAgICAgICAgICB7bGFzdFNhdmVkICYmIChcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwic3RhdGUtc2F2ZS1pbmRpY2F0b3JcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIOKckyBTYXZlZCBhdCB7bGFzdFNhdmVkfVxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICApfVxcblxcbiAgICAgICAgICAgICAgICB7aW5pdGlhbFN0YXRlICYmIChcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwic3RhdGUtcmVzdG9yZWQtdGFnXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICDwn5OmIFJlc3RvcmVkIGZyb20gbG9jYWxTdG9yYWdlXFxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICl9XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPERhdGFHcmlkXFxuICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XFxuICAgICAgICAgICAgICAgIGluaXRpYWxTdGF0ZT17aW5pdGlhbFN0YXRlfVxcbiAgICAgICAgICAgICAgICBvblN0YXRlQ2hhbmdlPXtoYW5kbGVTdGF0ZUNoYW5nZX1cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwXX1cXG4gICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cXG4gICAgICAgICAgICAgICAgYXJpYUxhYmVsPVxcXCJTdGF0ZSBwZXJzaXN0ZW5jZSBkZW1vIGdyaWRcXFwiXFxuICAgICAgICAgICAgICAgIGhlaWdodD17NjAwfVxcbiAgICAgICAgICAgIC8+XFxuXFxuICAgICAgICAgICAge3N0b3JlZFN0YXRlICYmIChcXG4gICAgICAgICAgICAgICAgPGRldGFpbHMgY2xhc3NOYW1lPVxcXCJzdGF0ZS1qc29uLXZpZXdlclxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3VtbWFyeT7wn5SNIFZpZXcgc3RvcmVkIHN0YXRlIChKU09OKTwvc3VtbWFyeT5cXG4gICAgICAgICAgICAgICAgICAgIDxwcmU+e0pTT04uc3RyaW5naWZ5KHN0b3JlZFN0YXRlLCBudWxsLCAyKX08L3ByZT5cXG4gICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxcbiAgICAgICAgICAgICl9XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhR3JpZCwgdXNlR3JpZFN0YXRlU3RvcmFnZSB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgdHlwZSB7IEdyaWRDb2xEZWYsIEdyaWRSb3dNb2RlbCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgJy4vU3RhdGVQZXJzaXN0ZW5jZURlbW8uY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9TdGF0ZVBlcnNpc3RlbmNlRGVtby50c3g/cmF3JztcblxuaW50ZXJmYWNlIEVtcGxveWVlIGV4dGVuZHMgR3JpZFJvd01vZGVsIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbWFpbDogc3RyaW5nO1xuICAgIGRlcGFydG1lbnQ6IHN0cmluZztcbiAgICByb2xlOiBzdHJpbmc7XG4gICAgc2FsYXJ5OiBudW1iZXI7XG4gICAgam9pbkRhdGU6IHN0cmluZztcbiAgICBzdGF0dXM6ICdhY3RpdmUnIHwgJ2luYWN0aXZlJyB8ICdvbi1sZWF2ZSc7XG59XG5cbmNvbnN0IGRlcGFydG1lbnRzID0gWydFbmdpbmVlcmluZycsICdNYXJrZXRpbmcnLCAnU2FsZXMnLCAnRmluYW5jZScsICdIUicsICdTdXBwb3J0JywgJ0Rlc2lnbiddO1xuY29uc3Qgcm9sZXMgPSBbJ0RldmVsb3BlcicsICdNYW5hZ2VyJywgJ0FuYWx5c3QnLCAnRGVzaWduZXInLCAnU3BlY2lhbGlzdCcsICdMZWFkJywgJ0RpcmVjdG9yJ107XG5jb25zdCBzdGF0dXNlczogRW1wbG95ZWVbJ3N0YXR1cyddW10gPSBbJ2FjdGl2ZScsICdpbmFjdGl2ZScsICdvbi1sZWF2ZSddO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUVtcGxveWVlcyhjb3VudDogbnVtYmVyKTogRW1wbG95ZWVbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50IH0sIChfLCBpKSA9PiAoe1xuICAgICAgICBpZDogaSArIDEsXG4gICAgICAgIG5hbWU6IGBFbXBsb3llZSAke2kgKyAxfWAsXG4gICAgICAgIGVtYWlsOiBgZW1wbG95ZWUke2kgKyAxfUBjb21wYW55LmNvbWAsXG4gICAgICAgIGRlcGFydG1lbnQ6IGRlcGFydG1lbnRzW2kgJSBkZXBhcnRtZW50cy5sZW5ndGhdLFxuICAgICAgICByb2xlOiByb2xlc1tpICUgcm9sZXMubGVuZ3RoXSxcbiAgICAgICAgc2FsYXJ5OiA0MDAwMCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEyMDAwMCksXG4gICAgICAgIGpvaW5EYXRlOiBuZXcgRGF0ZSgyMDIwICsgTWF0aC5mbG9vcihpIC8gNTApLCBpICUgMTIsIChpICUgMjgpICsgMSlcbiAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgc3RhdHVzOiBzdGF0dXNlc1tpICUgM10sXG4gICAgfSkpO1xufVxuXG5jb25zdCByb3dzID0gZ2VuZXJhdGVFbXBsb3llZXMoMjAwKTtcblxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogNzAgfSxcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDE4MCB9LFxuICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHdpZHRoOiAyNDAgfSxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE0MCB9LFxuICAgIHsgZmllbGQ6ICdyb2xlJywgaGVhZGVyTmFtZTogJ1JvbGUnLCB3aWR0aDogMTMwIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdTYWxhcnknLFxuICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkJHtwYXJhbXMudmFsdWU/LnRvTG9jYWxlU3RyaW5nKCl9YCxcbiAgICB9LFxuICAgIHsgZmllbGQ6ICdqb2luRGF0ZScsIGhlYWRlck5hbWU6ICdKb2luIERhdGUnLCB3aWR0aDogMTMwIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3N0YXR1cycsXG4gICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xvcnM6IFJlY29yZDxzdHJpbmcsIHsgYmc6IHN0cmluZzsgdGV4dDogc3RyaW5nIH0+ID0ge1xuICAgICAgICAgICAgICAgIGFjdGl2ZTogeyBiZzogJyNkY2ZjZTcnLCB0ZXh0OiAnIzE2NjUzNCcgfSxcbiAgICAgICAgICAgICAgICBpbmFjdGl2ZTogeyBiZzogJyNmZWUyZTInLCB0ZXh0OiAnIzk5MWIxYicgfSxcbiAgICAgICAgICAgICAgICAnb24tbGVhdmUnOiB7IGJnOiAnI2ZlZjNjNycsIHRleHQ6ICcjOTI0MDBlJyB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gY29sb3JzW3BhcmFtcy52YWx1ZSBhcyBzdHJpbmddID8/IHsgYmc6ICcjZjNmNGY2JywgdGV4dDogJyMzNzQxNTEnIH07XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInN0YXR1cy1waWxsXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0eWxlLmJnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0eWxlLnRleHQsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7cGFyYW1zLnZhbHVlfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgfSxcbl07XG5cbmNvbnN0IFNUT1JBR0VfS0VZID0gJ29neC1kZW1vLXN0YXRlLXBlcnNpc3RlbmNlJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3RhdGVQZXJzaXN0ZW5jZURlbW8oKSB7XG4gICAgY29uc3QgeyBpbml0aWFsU3RhdGUsIG9uU3RhdGVDaGFuZ2UsIGNsZWFyU3RhdGUgfSA9IHVzZUdyaWRTdGF0ZVN0b3JhZ2UoU1RPUkFHRV9LRVkpO1xuICAgIGNvbnN0IFtsYXN0U2F2ZWQsIHNldExhc3RTYXZlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcblxuICAgIGNvbnN0IGhhbmRsZVN0YXRlQ2hhbmdlID0gdXNlQ2FsbGJhY2soXG4gICAgICAgIChzdGF0ZTogaW1wb3J0KCcuLi8uLi8uLi9saWIvc3RhdGUvdHlwZXMnKS5HcmlkU3RhdGUpID0+IHtcbiAgICAgICAgICAgIG9uU3RhdGVDaGFuZ2Uoc3RhdGUpO1xuICAgICAgICAgICAgc2V0TGFzdFNhdmVkKG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCkpO1xuICAgICAgICB9LFxuICAgICAgICBbb25TdGF0ZUNoYW5nZV1cbiAgICApO1xuXG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFyU3RhdGUoKTtcbiAgICAgICAgc2V0TGFzdFNhdmVkKG51bGwpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IHJhdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFNUT1JBR0VfS0VZKSA6IG51bGw7XG4gICAgY29uc3Qgc3RvcmVkU3RhdGUgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiBudWxsO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiU3RhdGUgUGVyc2lzdGVuY2VcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJTYXZlIGFuZCByZXN0b3JlIGNvbXBsZXRlIGdyaWQgY29uZmlndXJhdGlvbiDigJQgY29sdW1uIG9yZGVyLCB3aWR0aHMsIHNvcnQgbW9kZWwsIGZpbHRlciBtb2RlbCwgYW5kIHZpc2liaWxpdHkg4oCUIHRvIGxvY2FsU3RvcmFnZSBvciBhbnkgY3VzdG9tIHN0b3JhZ2UgYmFja2VuZC5cIlxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGF0ZS1wZXJzaXN0LWNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbGVhcn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3RhdGUtY2xlYXItYnRuXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIPCfl5EgQ2xlYXIgU2F2ZWQgU3RhdGVcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICAgIHtsYXN0U2F2ZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJzdGF0ZS1zYXZlLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAg4pyTIFNhdmVkIGF0IHtsYXN0U2F2ZWR9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAge2luaXRpYWxTdGF0ZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInN0YXRlLXJlc3RvcmVkLXRhZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAg8J+TpiBSZXN0b3JlZCBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgaW5pdGlhbFN0YXRlPXtpbml0aWFsU3RhdGV9XG4gICAgICAgICAgICAgICAgb25TdGF0ZUNoYW5nZT17aGFuZGxlU3RhdGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyNSwgNTBdfVxuICAgICAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgYXJpYUxhYmVsPVwiU3RhdGUgcGVyc2lzdGVuY2UgZGVtbyBncmlkXCJcbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezYwMH1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIHtzdG9yZWRTdGF0ZSAmJiAoXG4gICAgICAgICAgICAgICAgPGRldGFpbHMgY2xhc3NOYW1lPVwic3RhdGUtanNvbi12aWV3ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN1bW1hcnk+8J+UjSBWaWV3IHN0b3JlZCBzdGF0ZSAoSlNPTik8L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgICAgIDxwcmU+e0pTT04uc3RyaW5naWZ5KHN0b3JlZFN0YXRlLCBudWxsLCAyKX08L3ByZT5cbiAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICApfVxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiZGVwYXJ0bWVudHMiLCJyb2xlcyIsInN0YXR1c2VzIiwiZ2VuZXJhdGVFbXBsb3llZXMiLCJjb3VudCIsIl8iLCJpIiwicm93cyIsImNvbHVtbnMiLCJwYXJhbXMiLCJzdHlsZSIsImpzeCIsIlNUT1JBR0VfS0VZIiwiU3RhdGVQZXJzaXN0ZW5jZURlbW8iLCJpbml0aWFsU3RhdGUiLCJvblN0YXRlQ2hhbmdlIiwiY2xlYXJTdGF0ZSIsInVzZUdyaWRTdGF0ZVN0b3JhZ2UiLCJsYXN0U2F2ZWQiLCJzZXRMYXN0U2F2ZWQiLCJ1c2VTdGF0ZSIsImhhbmRsZVN0YXRlQ2hhbmdlIiwidXNlQ2FsbGJhY2siLCJzdGF0ZSIsImhhbmRsZUNsZWFyIiwicmF3Iiwic3RvcmVkU3RhdGUiLCJqc3hzIiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIl0sIm1hcHBpbmdzIjoic0pBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDbUJUQyxFQUFjLENBQUMsY0FBZSxZQUFhLFFBQVMsVUFBVyxLQUFNLFVBQVcsUUFBUSxFQUN4RkMsRUFBUSxDQUFDLFlBQWEsVUFBVyxVQUFXLFdBQVksYUFBYyxPQUFRLFVBQVUsRUFDeEZDLEVBQWlDLENBQUMsU0FBVSxXQUFZLFVB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
