import{r as i,j as e}from"./vendor-react-f02LKZLu.js";import{u,D as y,e as g}from"./opengridx-CQd0a-SV.js";import{D as x,C as w}from"./DocsLayout-D9-vLSZk.js";/* empty css                   */const C=`import { useState } from 'react';
import {
    DataGrid,
    exportToCsv,
    useGridApiRef,
    type GridColDef,
    type GridContextMenuEntry,
    type GridContextMenuParams,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import { CodeBlock } from '../../components/CodeBlock';
import '../PasteDemos.css';

import sourceCode from './ContextMenuDemo.tsx?raw';

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    city: string;
}

const initialRows: Employee[] = [
    { id: 1, name: 'Ada Lovelace', department: 'Engineering', salary: 128000, city: 'London' },
    { id: 2, name: 'Grace Hopper', department: 'Engineering', salary: 134000, city: 'New York' },
    { id: 3, name: 'Alan Turing', department: 'Research', salary: 121000, city: 'Manchester' },
    { id: 4, name: 'Margaret Hamilton', department: 'Engineering', salary: 139000, city: 'Boston' },
    { id: 5, name: 'Katherine Johnson', department: 'Research', salary: 117000, city: 'Hampton' },
    { id: 6, name: 'Edsger Dijkstra', department: 'Research', salary: 125000, city: 'Austin' },
    { id: 7, name: 'Barbara Liskov', department: 'Design', salary: 119000, city: 'Cambridge' },
    { id: 8, name: 'Donald Knuth', department: 'Design', salary: 131000, city: 'Stanford' },
    { id: 9, name: 'Radia Perlman', department: 'Support', salary: 98000, city: 'Seattle' },
    { id: 10, name: 'Tim Berners-Lee', department: 'Support', salary: 102000, city: 'London' },
];

const columns: GridColDef<Employee>[] = [
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    { field: 'department', headerName: 'Department', width: 140, editable: true },
    { field: 'salary', headerName: 'Salary', type: 'number', width: 120, editable: true },
    { field: 'city', headerName: 'City', width: 140, editable: true },
];

const snippet = \`<DataGrid
    rows={rows}
    columns={columns}
    cellSelection                  // Copy then copies the selected range
    undoRedo                       // adds Undo and Redo to the menu
    contextMenu
    getContextMenuItems={(params, defaultItems) => [
        ...defaultItems,
        'divider',
        { id: 'export', label: 'Export CSV',
          onClick: () => exportToCsv(params.api.getAllFilteredRows(), columns) },
        { id: 'delete', label: 'Delete row', danger: true,
          onClick: () => removeRow(params.id) },
    ]}
/>

// Return [] to show no menu (the browser menu then shows instead).\`;

export default function ContextMenuDemo() {
    const apiRef = useGridApiRef<Employee>();
    const [rows, setRows] = useState(initialRows);
    const [log, setLog] = useState<string[]>([]);

    const note = (text: string) => setLog(prev => [text, ...prev].slice(0, 6));

    const getContextMenuItems = (
        params: GridContextMenuParams<Employee>,
        defaultItems: readonly GridContextMenuEntry[],
    ): GridContextMenuEntry[] => [
        ...defaultItems,
        'divider',
        {
            id: 'export',
            label: 'Export CSV',
            onClick: () => {
                exportToCsv(params.api.getAllFilteredRows(), columns, { fileName: 'employees.csv' });
                note('Exported employees.csv');
            },
        },
        {
            id: 'delete',
            label: \`Delete \${params.row.name}\`,
            danger: true,
            onClick: () => {
                setRows(prev => prev.filter(r => r.id !== params.id));
                note(\`Deleted row \${params.id} (\${params.row.name})\`);
            },
        },
    ];

    return (
        <DocsLayout
            title="Context Menu"
            description={
                <>
                    With <code>contextMenu</code> on, right-clicking a body cell (or pressing <kbd>Shift + F10</kbd>)
                    opens a menu of cell actions: Copy, Copy with headers, and Undo / Redo when <code>undoRedo</code> is
                    on. <code>getContextMenuItems</code> adds your own items, here Export CSV and a danger Delete row.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="paste-demo">
                <section className="paste-demo__sample">
                    <strong>Try it</strong>
                    <ul>
                        <li>Drag over a few cells, then right-click inside the range: Copy copies the whole range and the range stays.</li>
                        <li>Right-click a cell outside the range: the range collapses to that cell.</li>
                        <li>Edit a cell, then right-click and choose Undo.</li>
                        <li>Focus a cell with the arrow keys and press <kbd>Shift + F10</kbd>; <kbd>Esc</kbd> closes the menu and returns to the cell.</li>
                        <li>Right-click a column header: the browser's own menu shows.</li>
                    </ul>
                </section>

                <DataGrid<Employee>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    undoRedo
                    contextMenu
                    getContextMenuItems={getContextMenuItems}
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                    height={380}
                />

                <section className="paste-demo__summary">
                    <strong>Actions (latest first)</strong>
                    {log.length === 0 && <p>Choose Export CSV or Delete from the menu.</p>}
                    <ol className="paste-demo__history">
                        {log.map((entry, i) => <li key={\`\${i}-\${entry}\`}>{entry}</li>)}
                    </ol>
                </section>

                <CodeBlock code={snippet} />
            </div>
        </DocsLayout>
    );
}
`,f=[{id:1,name:"Ada Lovelace",department:"Engineering",salary:128e3,city:"London"},{id:2,name:"Grace Hopper",department:"Engineering",salary:134e3,city:"New York"},{id:3,name:"Alan Turing",department:"Research",salary:121e3,city:"Manchester"},{id:4,name:"Margaret Hamilton",department:"Engineering",salary:139e3,city:"Boston"},{id:5,name:"Katherine Johnson",department:"Research",salary:117e3,city:"Hampton"},{id:6,name:"Edsger Dijkstra",department:"Research",salary:125e3,city:"Austin"},{id:7,name:"Barbara Liskov",department:"Design",salary:119e3,city:"Cambridge"},{id:8,name:"Donald Knuth",department:"Design",salary:131e3,city:"Stanford"},{id:9,name:"Radia Perlman",department:"Support",salary:98e3,city:"Seattle"},{id:10,name:"Tim Berners-Lee",department:"Support",salary:102e3,city:"London"}],d=[{field:"name",headerName:"Name",width:180,editable:!0},{field:"department",headerName:"Department",width:140,editable:!0},{field:"salary",headerName:"Salary",type:"number",width:120,editable:!0},{field:"city",headerName:"City",width:140,editable:!0}],R=`<DataGrid
    rows={rows}
    columns={columns}
    cellSelection                  // Copy then copies the selected range
    undoRedo                       // adds Undo and Redo to the menu
    contextMenu
    getContextMenuItems={(params, defaultItems) => [
        ...defaultItems,
        'divider',
        { id: 'export', label: 'Export CSV',
          onClick: () => exportToCsv(params.api.getAllFilteredRows(), columns) },
        { id: 'delete', label: 'Delete row', danger: true,
          onClick: () => removeRow(params.id) },
    ]}
/>

// Return [] to show no menu (the browser menu then shows instead).`;function S(){const l=u(),[c,r]=i.useState(f),[a,m]=i.useState([]),s=n=>m(t=>[n,...t].slice(0,6)),p=(n,t)=>[...t,"divider",{id:"export",label:"Export CSV",onClick:()=>{g(n.api.getAllFilteredRows(),d,{fileName:"employees.csv"}),s("Exported employees.csv")}},{id:"delete",label:`Delete ${n.row.name}`,danger:!0,onClick:()=>{r(o=>o.filter(h=>h.id!==n.id)),s(`Deleted row ${n.id} (${n.row.name})`)}}];return e.jsx(x,{title:"Context Menu",description:e.jsxs(e.Fragment,{children:["With ",e.jsx("code",{children:"contextMenu"})," on, right-clicking a body cell (or pressing ",e.jsx("kbd",{children:"Shift + F10"}),") opens a menu of cell actions: Copy, Copy with headers, and Undo / Redo when ",e.jsx("code",{children:"undoRedo"})," is on. ",e.jsx("code",{children:"getContextMenuItems"})," adds your own items, here Export CSV and a danger Delete row."]}),sourceCode:C,children:e.jsxs("div",{className:"paste-demo",children:[e.jsxs("section",{className:"paste-demo__sample",children:[e.jsx("strong",{children:"Try it"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Drag over a few cells, then right-click inside the range: Copy copies the whole range and the range stays."}),e.jsx("li",{children:"Right-click a cell outside the range: the range collapses to that cell."}),e.jsx("li",{children:"Edit a cell, then right-click and choose Undo."}),e.jsxs("li",{children:["Focus a cell with the arrow keys and press ",e.jsx("kbd",{children:"Shift + F10"}),"; ",e.jsx("kbd",{children:"Esc"})," closes the menu and returns to the cell."]}),e.jsx("li",{children:"Right-click a column header: the browser's own menu shows."})]})]}),e.jsx(y,{rows:c,columns:d,apiRef:l,cellSelection:!0,undoRedo:!0,contextMenu:!0,getContextMenuItems:p,processRowUpdate:n=>(r(t=>t.map(o=>o.id===n.id?n:o)),n),height:380}),e.jsxs("section",{className:"paste-demo__summary",children:[e.jsx("strong",{children:"Actions (latest first)"}),a.length===0&&e.jsx("p",{children:"Choose Export CSV or Delete from the menu."}),e.jsx("ol",{className:"paste-demo__history",children:a.map((n,t)=>e.jsx("li",{children:n},`${t}-${n}`))})]}),e.jsx(w,{code:R})]})})}export{S as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dE1lbnVEZW1vLUJtZGpqVGdZLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9Db250ZXh0TWVudURlbW8vQ29udGV4dE1lbnVEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9Db250ZXh0TWVudURlbW8vQ29udGV4dE1lbnVEZW1vLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7XFxuICAgIERhdGFHcmlkLFxcbiAgICBleHBvcnRUb0NzdixcXG4gICAgdXNlR3JpZEFwaVJlZixcXG4gICAgdHlwZSBHcmlkQ29sRGVmLFxcbiAgICB0eXBlIEdyaWRDb250ZXh0TWVudUVudHJ5LFxcbiAgICB0eXBlIEdyaWRDb250ZXh0TWVudVBhcmFtcyxcXG59IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHsgQ29kZUJsb2NrIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Db2RlQmxvY2snO1xcbmltcG9ydCAnLi4vUGFzdGVEZW1vcy5jc3MnO1xcblxcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vQ29udGV4dE1lbnVEZW1vLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBFbXBsb3llZSB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICBzYWxhcnk6IG51bWJlcjtcXG4gICAgY2l0eTogc3RyaW5nO1xcbn1cXG5cXG5jb25zdCBpbml0aWFsUm93czogRW1wbG95ZWVbXSA9IFtcXG4gICAgeyBpZDogMSwgbmFtZTogJ0FkYSBMb3ZlbGFjZScsIGRlcGFydG1lbnQ6ICdFbmdpbmVlcmluZycsIHNhbGFyeTogMTI4MDAwLCBjaXR5OiAnTG9uZG9uJyB9LFxcbiAgICB7IGlkOiAyLCBuYW1lOiAnR3JhY2UgSG9wcGVyJywgZGVwYXJ0bWVudDogJ0VuZ2luZWVyaW5nJywgc2FsYXJ5OiAxMzQwMDAsIGNpdHk6ICdOZXcgWW9yaycgfSxcXG4gICAgeyBpZDogMywgbmFtZTogJ0FsYW4gVHVyaW5nJywgZGVwYXJ0bWVudDogJ1Jlc2VhcmNoJywgc2FsYXJ5OiAxMjEwMDAsIGNpdHk6ICdNYW5jaGVzdGVyJyB9LFxcbiAgICB7IGlkOiA0LCBuYW1lOiAnTWFyZ2FyZXQgSGFtaWx0b24nLCBkZXBhcnRtZW50OiAnRW5naW5lZXJpbmcnLCBzYWxhcnk6IDEzOTAwMCwgY2l0eTogJ0Jvc3RvbicgfSxcXG4gICAgeyBpZDogNSwgbmFtZTogJ0thdGhlcmluZSBKb2huc29uJywgZGVwYXJ0bWVudDogJ1Jlc2VhcmNoJywgc2FsYXJ5OiAxMTcwMDAsIGNpdHk6ICdIYW1wdG9uJyB9LFxcbiAgICB7IGlkOiA2LCBuYW1lOiAnRWRzZ2VyIERpamtzdHJhJywgZGVwYXJ0bWVudDogJ1Jlc2VhcmNoJywgc2FsYXJ5OiAxMjUwMDAsIGNpdHk6ICdBdXN0aW4nIH0sXFxuICAgIHsgaWQ6IDcsIG5hbWU6ICdCYXJiYXJhIExpc2tvdicsIGRlcGFydG1lbnQ6ICdEZXNpZ24nLCBzYWxhcnk6IDExOTAwMCwgY2l0eTogJ0NhbWJyaWRnZScgfSxcXG4gICAgeyBpZDogOCwgbmFtZTogJ0RvbmFsZCBLbnV0aCcsIGRlcGFydG1lbnQ6ICdEZXNpZ24nLCBzYWxhcnk6IDEzMTAwMCwgY2l0eTogJ1N0YW5mb3JkJyB9LFxcbiAgICB7IGlkOiA5LCBuYW1lOiAnUmFkaWEgUGVybG1hbicsIGRlcGFydG1lbnQ6ICdTdXBwb3J0Jywgc2FsYXJ5OiA5ODAwMCwgY2l0eTogJ1NlYXR0bGUnIH0sXFxuICAgIHsgaWQ6IDEwLCBuYW1lOiAnVGltIEJlcm5lcnMtTGVlJywgZGVwYXJ0bWVudDogJ1N1cHBvcnQnLCBzYWxhcnk6IDEwMjAwMCwgY2l0eTogJ0xvbmRvbicgfSxcXG5dO1xcblxcbmNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWY8RW1wbG95ZWU+W10gPSBbXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTgwLCBlZGl0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE0MCwgZWRpdGFibGU6IHRydWUgfSxcXG4gICAgeyBmaWVsZDogJ3NhbGFyeScsIGhlYWRlck5hbWU6ICdTYWxhcnknLCB0eXBlOiAnbnVtYmVyJywgd2lkdGg6IDEyMCwgZWRpdGFibGU6IHRydWUgfSxcXG4gICAgeyBmaWVsZDogJ2NpdHknLCBoZWFkZXJOYW1lOiAnQ2l0eScsIHdpZHRoOiAxNDAsIGVkaXRhYmxlOiB0cnVlIH0sXFxuXTtcXG5cXG5jb25zdCBzbmlwcGV0ID0gYDxEYXRhR3JpZFxcbiAgICByb3dzPXtyb3dzfVxcbiAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICBjZWxsU2VsZWN0aW9uICAgICAgICAgICAgICAgICAgLy8gQ29weSB0aGVuIGNvcGllcyB0aGUgc2VsZWN0ZWQgcmFuZ2VcXG4gICAgdW5kb1JlZG8gICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgVW5kbyBhbmQgUmVkbyB0byB0aGUgbWVudVxcbiAgICBjb250ZXh0TWVudVxcbiAgICBnZXRDb250ZXh0TWVudUl0ZW1zPXsocGFyYW1zLCBkZWZhdWx0SXRlbXMpID0+IFtcXG4gICAgICAgIC4uLmRlZmF1bHRJdGVtcyxcXG4gICAgICAgICdkaXZpZGVyJyxcXG4gICAgICAgIHsgaWQ6ICdleHBvcnQnLCBsYWJlbDogJ0V4cG9ydCBDU1YnLFxcbiAgICAgICAgICBvbkNsaWNrOiAoKSA9PiBleHBvcnRUb0NzdihwYXJhbXMuYXBpLmdldEFsbEZpbHRlcmVkUm93cygpLCBjb2x1bW5zKSB9LFxcbiAgICAgICAgeyBpZDogJ2RlbGV0ZScsIGxhYmVsOiAnRGVsZXRlIHJvdycsIGRhbmdlcjogdHJ1ZSxcXG4gICAgICAgICAgb25DbGljazogKCkgPT4gcmVtb3ZlUm93KHBhcmFtcy5pZCkgfSxcXG4gICAgXX1cXG4vPlxcblxcbi8vIFJldHVybiBbXSB0byBzaG93IG5vIG1lbnUgKHRoZSBicm93c2VyIG1lbnUgdGhlbiBzaG93cyBpbnN0ZWFkKS5gO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbnRleHRNZW51RGVtbygpIHtcXG4gICAgY29uc3QgYXBpUmVmID0gdXNlR3JpZEFwaVJlZjxFbXBsb3llZT4oKTtcXG4gICAgY29uc3QgW3Jvd3MsIHNldFJvd3NdID0gdXNlU3RhdGUoaW5pdGlhbFJvd3MpO1xcbiAgICBjb25zdCBbbG9nLCBzZXRMb2ddID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcXG5cXG4gICAgY29uc3Qgbm90ZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHNldExvZyhwcmV2ID0+IFt0ZXh0LCAuLi5wcmV2XS5zbGljZSgwLCA2KSk7XFxuXFxuICAgIGNvbnN0IGdldENvbnRleHRNZW51SXRlbXMgPSAoXFxuICAgICAgICBwYXJhbXM6IEdyaWRDb250ZXh0TWVudVBhcmFtczxFbXBsb3llZT4sXFxuICAgICAgICBkZWZhdWx0SXRlbXM6IHJlYWRvbmx5IEdyaWRDb250ZXh0TWVudUVudHJ5W10sXFxuICAgICk6IEdyaWRDb250ZXh0TWVudUVudHJ5W10gPT4gW1xcbiAgICAgICAgLi4uZGVmYXVsdEl0ZW1zLFxcbiAgICAgICAgJ2RpdmlkZXInLFxcbiAgICAgICAge1xcbiAgICAgICAgICAgIGlkOiAnZXhwb3J0JyxcXG4gICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBDU1YnLFxcbiAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcXG4gICAgICAgICAgICAgICAgZXhwb3J0VG9Dc3YocGFyYW1zLmFwaS5nZXRBbGxGaWx0ZXJlZFJvd3MoKSwgY29sdW1ucywgeyBmaWxlTmFtZTogJ2VtcGxveWVlcy5jc3YnIH0pO1xcbiAgICAgICAgICAgICAgICBub3RlKCdFeHBvcnRlZCBlbXBsb3llZXMuY3N2Jyk7XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxcbiAgICAgICAgICAgIGxhYmVsOiBgRGVsZXRlICR7cGFyYW1zLnJvdy5uYW1lfWAsXFxuICAgICAgICAgICAgZGFuZ2VyOiB0cnVlLFxcbiAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcXG4gICAgICAgICAgICAgICAgc2V0Um93cyhwcmV2ID0+IHByZXYuZmlsdGVyKHIgPT4gci5pZCAhPT0gcGFyYW1zLmlkKSk7XFxuICAgICAgICAgICAgICAgIG5vdGUoYERlbGV0ZWQgcm93ICR7cGFyYW1zLmlkfSAoJHtwYXJhbXMucm93Lm5hbWV9KWApO1xcbiAgICAgICAgICAgIH0sXFxuICAgICAgICB9LFxcbiAgICBdO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiQ29udGV4dCBNZW51XFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtcXG4gICAgICAgICAgICAgICAgPD5cXG4gICAgICAgICAgICAgICAgICAgIFdpdGggPGNvZGU+Y29udGV4dE1lbnU8L2NvZGU+IG9uLCByaWdodC1jbGlja2luZyBhIGJvZHkgY2VsbCAob3IgcHJlc3NpbmcgPGtiZD5TaGlmdCArIEYxMDwva2JkPilcXG4gICAgICAgICAgICAgICAgICAgIG9wZW5zIGEgbWVudSBvZiBjZWxsIGFjdGlvbnM6IENvcHksIENvcHkgd2l0aCBoZWFkZXJzLCBhbmQgVW5kbyAvIFJlZG8gd2hlbiA8Y29kZT51bmRvUmVkbzwvY29kZT4gaXNcXG4gICAgICAgICAgICAgICAgICAgIG9uLiA8Y29kZT5nZXRDb250ZXh0TWVudUl0ZW1zPC9jb2RlPiBhZGRzIHlvdXIgb3duIGl0ZW1zLCBoZXJlIEV4cG9ydCBDU1YgYW5kIGEgZGFuZ2VyIERlbGV0ZSByb3cuXFxuICAgICAgICAgICAgICAgIDwvPlxcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJwYXN0ZS1kZW1vXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVxcXCJwYXN0ZS1kZW1vX19zYW1wbGVcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5UcnkgaXQ8L3N0cm9uZz5cXG4gICAgICAgICAgICAgICAgICAgIDx1bD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+RHJhZyBvdmVyIGEgZmV3IGNlbGxzLCB0aGVuIHJpZ2h0LWNsaWNrIGluc2lkZSB0aGUgcmFuZ2U6IENvcHkgY29waWVzIHRoZSB3aG9sZSByYW5nZSBhbmQgdGhlIHJhbmdlIHN0YXlzLjwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlJpZ2h0LWNsaWNrIGEgY2VsbCBvdXRzaWRlIHRoZSByYW5nZTogdGhlIHJhbmdlIGNvbGxhcHNlcyB0byB0aGF0IGNlbGwuPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+RWRpdCBhIGNlbGwsIHRoZW4gcmlnaHQtY2xpY2sgYW5kIGNob29zZSBVbmRvLjwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPkZvY3VzIGEgY2VsbCB3aXRoIHRoZSBhcnJvdyBrZXlzIGFuZCBwcmVzcyA8a2JkPlNoaWZ0ICsgRjEwPC9rYmQ+OyA8a2JkPkVzYzwva2JkPiBjbG9zZXMgdGhlIG1lbnUgYW5kIHJldHVybnMgdG8gdGhlIGNlbGwuPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+UmlnaHQtY2xpY2sgYSBjb2x1bW4gaGVhZGVyOiB0aGUgYnJvd3NlcidzIG93biBtZW51IHNob3dzLjwvbGk+XFxuICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICA8L3NlY3Rpb24+XFxuXFxuICAgICAgICAgICAgICAgIDxEYXRhR3JpZDxFbXBsb3llZT5cXG4gICAgICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICAgICAgYXBpUmVmPXthcGlSZWZ9XFxuICAgICAgICAgICAgICAgICAgICBjZWxsU2VsZWN0aW9uXFxuICAgICAgICAgICAgICAgICAgICB1bmRvUmVkb1xcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dE1lbnVcXG4gICAgICAgICAgICAgICAgICAgIGdldENvbnRleHRNZW51SXRlbXM9e2dldENvbnRleHRNZW51SXRlbXN9XFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUm93VXBkYXRlPXsocm93KSA9PiB7XFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Um93cyhwcmV2ID0+IHByZXYubWFwKHIgPT4gKHIuaWQgPT09IHJvdy5pZCA/IHJvdyA6IHIpKSk7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcXG4gICAgICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezM4MH1cXG4gICAgICAgICAgICAgICAgLz5cXG5cXG4gICAgICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVxcXCJwYXN0ZS1kZW1vX19zdW1tYXJ5XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+QWN0aW9ucyAobGF0ZXN0IGZpcnN0KTwvc3Ryb25nPlxcbiAgICAgICAgICAgICAgICAgICAge2xvZy5sZW5ndGggPT09IDAgJiYgPHA+Q2hvb3NlIEV4cG9ydCBDU1Ygb3IgRGVsZXRlIGZyb20gdGhlIG1lbnUuPC9wPn1cXG4gICAgICAgICAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XFxcInBhc3RlLWRlbW9fX2hpc3RvcnlcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtsb2cubWFwKChlbnRyeSwgaSkgPT4gPGxpIGtleT17YCR7aX0tJHtlbnRyeX1gfT57ZW50cnl9PC9saT4pfVxcbiAgICAgICAgICAgICAgICAgICAgPC9vbD5cXG4gICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxcblxcbiAgICAgICAgICAgICAgICA8Q29kZUJsb2NrIGNvZGU9e3NuaXBwZXR9IC8+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICAgIERhdGFHcmlkLFxuICAgIGV4cG9ydFRvQ3N2LFxuICAgIHVzZUdyaWRBcGlSZWYsXG4gICAgdHlwZSBHcmlkQ29sRGVmLFxuICAgIHR5cGUgR3JpZENvbnRleHRNZW51RW50cnksXG4gICAgdHlwZSBHcmlkQ29udGV4dE1lbnVQYXJhbXMsXG59IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcbmltcG9ydCB7IENvZGVCbG9jayB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvQ29kZUJsb2NrJztcbmltcG9ydCAnLi4vUGFzdGVEZW1vcy5jc3MnO1xuXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NvbnRleHRNZW51RGVtby50c3g/cmF3JztcblxuaW50ZXJmYWNlIEVtcGxveWVlIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXBhcnRtZW50OiBzdHJpbmc7XG4gICAgc2FsYXJ5OiBudW1iZXI7XG4gICAgY2l0eTogc3RyaW5nO1xufVxuXG5jb25zdCBpbml0aWFsUm93czogRW1wbG95ZWVbXSA9IFtcbiAgICB7IGlkOiAxLCBuYW1lOiAnQWRhIExvdmVsYWNlJywgZGVwYXJ0bWVudDogJ0VuZ2luZWVyaW5nJywgc2FsYXJ5OiAxMjgwMDAsIGNpdHk6ICdMb25kb24nIH0sXG4gICAgeyBpZDogMiwgbmFtZTogJ0dyYWNlIEhvcHBlcicsIGRlcGFydG1lbnQ6ICdFbmdpbmVlcmluZycsIHNhbGFyeTogMTM0MDAwLCBjaXR5OiAnTmV3IFlvcmsnIH0sXG4gICAgeyBpZDogMywgbmFtZTogJ0FsYW4gVHVyaW5nJywgZGVwYXJ0bWVudDogJ1Jlc2VhcmNoJywgc2FsYXJ5OiAxMjEwMDAsIGNpdHk6ICdNYW5jaGVzdGVyJyB9LFxuICAgIHsgaWQ6IDQsIG5hbWU6ICdNYXJnYXJldCBIYW1pbHRvbicsIGRlcGFydG1lbnQ6ICdFbmdpbmVlcmluZycsIHNhbGFyeTogMTM5MDAwLCBjaXR5OiAnQm9zdG9uJyB9LFxuICAgIHsgaWQ6IDUsIG5hbWU6ICdLYXRoZXJpbmUgSm9obnNvbicsIGRlcGFydG1lbnQ6ICdSZXNlYXJjaCcsIHNhbGFyeTogMTE3MDAwLCBjaXR5OiAnSGFtcHRvbicgfSxcbiAgICB7IGlkOiA2LCBuYW1lOiAnRWRzZ2VyIERpamtzdHJhJywgZGVwYXJ0bWVudDogJ1Jlc2VhcmNoJywgc2FsYXJ5OiAxMjUwMDAsIGNpdHk6ICdBdXN0aW4nIH0sXG4gICAgeyBpZDogNywgbmFtZTogJ0JhcmJhcmEgTGlza292JywgZGVwYXJ0bWVudDogJ0Rlc2lnbicsIHNhbGFyeTogMTE5MDAwLCBjaXR5OiAnQ2FtYnJpZGdlJyB9LFxuICAgIHsgaWQ6IDgsIG5hbWU6ICdEb25hbGQgS251dGgnLCBkZXBhcnRtZW50OiAnRGVzaWduJywgc2FsYXJ5OiAxMzEwMDAsIGNpdHk6ICdTdGFuZm9yZCcgfSxcbiAgICB7IGlkOiA5LCBuYW1lOiAnUmFkaWEgUGVybG1hbicsIGRlcGFydG1lbnQ6ICdTdXBwb3J0Jywgc2FsYXJ5OiA5ODAwMCwgY2l0eTogJ1NlYXR0bGUnIH0sXG4gICAgeyBpZDogMTAsIG5hbWU6ICdUaW0gQmVybmVycy1MZWUnLCBkZXBhcnRtZW50OiAnU3VwcG9ydCcsIHNhbGFyeTogMTAyMDAwLCBjaXR5OiAnTG9uZG9uJyB9LFxuXTtcblxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDE4MCwgZWRpdGFibGU6IHRydWUgfSxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE0MCwgZWRpdGFibGU6IHRydWUgfSxcbiAgICB7IGZpZWxkOiAnc2FsYXJ5JywgaGVhZGVyTmFtZTogJ1NhbGFyeScsIHR5cGU6ICdudW1iZXInLCB3aWR0aDogMTIwLCBlZGl0YWJsZTogdHJ1ZSB9LFxuICAgIHsgZmllbGQ6ICdjaXR5JywgaGVhZGVyTmFtZTogJ0NpdHknLCB3aWR0aDogMTQwLCBlZGl0YWJsZTogdHJ1ZSB9LFxuXTtcblxuY29uc3Qgc25pcHBldCA9IGA8RGF0YUdyaWRcbiAgICByb3dzPXtyb3dzfVxuICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgY2VsbFNlbGVjdGlvbiAgICAgICAgICAgICAgICAgIC8vIENvcHkgdGhlbiBjb3BpZXMgdGhlIHNlbGVjdGVkIHJhbmdlXG4gICAgdW5kb1JlZG8gICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgVW5kbyBhbmQgUmVkbyB0byB0aGUgbWVudVxuICAgIGNvbnRleHRNZW51XG4gICAgZ2V0Q29udGV4dE1lbnVJdGVtcz17KHBhcmFtcywgZGVmYXVsdEl0ZW1zKSA9PiBbXG4gICAgICAgIC4uLmRlZmF1bHRJdGVtcyxcbiAgICAgICAgJ2RpdmlkZXInLFxuICAgICAgICB7IGlkOiAnZXhwb3J0JywgbGFiZWw6ICdFeHBvcnQgQ1NWJyxcbiAgICAgICAgICBvbkNsaWNrOiAoKSA9PiBleHBvcnRUb0NzdihwYXJhbXMuYXBpLmdldEFsbEZpbHRlcmVkUm93cygpLCBjb2x1bW5zKSB9LFxuICAgICAgICB7IGlkOiAnZGVsZXRlJywgbGFiZWw6ICdEZWxldGUgcm93JywgZGFuZ2VyOiB0cnVlLFxuICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHJlbW92ZVJvdyhwYXJhbXMuaWQpIH0sXG4gICAgXX1cbi8+XG5cbi8vIFJldHVybiBbXSB0byBzaG93IG5vIG1lbnUgKHRoZSBicm93c2VyIG1lbnUgdGhlbiBzaG93cyBpbnN0ZWFkKS5gO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb250ZXh0TWVudURlbW8oKSB7XG4gICAgY29uc3QgYXBpUmVmID0gdXNlR3JpZEFwaVJlZjxFbXBsb3llZT4oKTtcbiAgICBjb25zdCBbcm93cywgc2V0Um93c10gPSB1c2VTdGF0ZShpbml0aWFsUm93cyk7XG4gICAgY29uc3QgW2xvZywgc2V0TG9nXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihbXSk7XG5cbiAgICBjb25zdCBub3RlID0gKHRleHQ6IHN0cmluZykgPT4gc2V0TG9nKHByZXYgPT4gW3RleHQsIC4uLnByZXZdLnNsaWNlKDAsIDYpKTtcblxuICAgIGNvbnN0IGdldENvbnRleHRNZW51SXRlbXMgPSAoXG4gICAgICAgIHBhcmFtczogR3JpZENvbnRleHRNZW51UGFyYW1zPEVtcGxveWVlPixcbiAgICAgICAgZGVmYXVsdEl0ZW1zOiByZWFkb25seSBHcmlkQ29udGV4dE1lbnVFbnRyeVtdLFxuICAgICk6IEdyaWRDb250ZXh0TWVudUVudHJ5W10gPT4gW1xuICAgICAgICAuLi5kZWZhdWx0SXRlbXMsXG4gICAgICAgICdkaXZpZGVyJyxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdleHBvcnQnLFxuICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQ1NWJyxcbiAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBvcnRUb0NzdihwYXJhbXMuYXBpLmdldEFsbEZpbHRlcmVkUm93cygpLCBjb2x1bW5zLCB7IGZpbGVOYW1lOiAnZW1wbG95ZWVzLmNzdicgfSk7XG4gICAgICAgICAgICAgICAgbm90ZSgnRXhwb3J0ZWQgZW1wbG95ZWVzLmNzdicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxuICAgICAgICAgICAgbGFiZWw6IGBEZWxldGUgJHtwYXJhbXMucm93Lm5hbWV9YCxcbiAgICAgICAgICAgIGRhbmdlcjogdHJ1ZSxcbiAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRSb3dzKHByZXYgPT4gcHJldi5maWx0ZXIociA9PiByLmlkICE9PSBwYXJhbXMuaWQpKTtcbiAgICAgICAgICAgICAgICBub3RlKGBEZWxldGVkIHJvdyAke3BhcmFtcy5pZH0gKCR7cGFyYW1zLnJvdy5uYW1lfSlgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkNvbnRleHQgTWVudVwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj17XG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgV2l0aCA8Y29kZT5jb250ZXh0TWVudTwvY29kZT4gb24sIHJpZ2h0LWNsaWNraW5nIGEgYm9keSBjZWxsIChvciBwcmVzc2luZyA8a2JkPlNoaWZ0ICsgRjEwPC9rYmQ+KVxuICAgICAgICAgICAgICAgICAgICBvcGVucyBhIG1lbnUgb2YgY2VsbCBhY3Rpb25zOiBDb3B5LCBDb3B5IHdpdGggaGVhZGVycywgYW5kIFVuZG8gLyBSZWRvIHdoZW4gPGNvZGU+dW5kb1JlZG88L2NvZGU+IGlzXG4gICAgICAgICAgICAgICAgICAgIG9uLiA8Y29kZT5nZXRDb250ZXh0TWVudUl0ZW1zPC9jb2RlPiBhZGRzIHlvdXIgb3duIGl0ZW1zLCBoZXJlIEV4cG9ydCBDU1YgYW5kIGEgZGFuZ2VyIERlbGV0ZSByb3cuXG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhc3RlLWRlbW9cIj5cbiAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJwYXN0ZS1kZW1vX19zYW1wbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5UcnkgaXQ8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPkRyYWcgb3ZlciBhIGZldyBjZWxscywgdGhlbiByaWdodC1jbGljayBpbnNpZGUgdGhlIHJhbmdlOiBDb3B5IGNvcGllcyB0aGUgd2hvbGUgcmFuZ2UgYW5kIHRoZSByYW5nZSBzdGF5cy48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlJpZ2h0LWNsaWNrIGEgY2VsbCBvdXRzaWRlIHRoZSByYW5nZTogdGhlIHJhbmdlIGNvbGxhcHNlcyB0byB0aGF0IGNlbGwuPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5FZGl0IGEgY2VsbCwgdGhlbiByaWdodC1jbGljayBhbmQgY2hvb3NlIFVuZG8uPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5Gb2N1cyBhIGNlbGwgd2l0aCB0aGUgYXJyb3cga2V5cyBhbmQgcHJlc3MgPGtiZD5TaGlmdCArIEYxMDwva2JkPjsgPGtiZD5Fc2M8L2tiZD4gY2xvc2VzIHRoZSBtZW51IGFuZCByZXR1cm5zIHRvIHRoZSBjZWxsLjwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+UmlnaHQtY2xpY2sgYSBjb2x1bW4gaGVhZGVyOiB0aGUgYnJvd3NlcidzIG93biBtZW51IHNob3dzLjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICAgICAgPERhdGFHcmlkPEVtcGxveWVlPlxuICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgICAgICBhcGlSZWY9e2FwaVJlZn1cbiAgICAgICAgICAgICAgICAgICAgY2VsbFNlbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICB1bmRvUmVkb1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICBnZXRDb250ZXh0TWVudUl0ZW1zPXtnZXRDb250ZXh0TWVudUl0ZW1zfVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUm93VXBkYXRlPXsocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRSb3dzKHByZXYgPT4gcHJldi5tYXAociA9PiAoci5pZCA9PT0gcm93LmlkID8gcm93IDogcikpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD17MzgwfVxuICAgICAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJwYXN0ZS1kZW1vX19zdW1tYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+QWN0aW9ucyAobGF0ZXN0IGZpcnN0KTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICB7bG9nLmxlbmd0aCA9PT0gMCAmJiA8cD5DaG9vc2UgRXhwb3J0IENTViBvciBEZWxldGUgZnJvbSB0aGUgbWVudS48L3A+fVxuICAgICAgICAgICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwicGFzdGUtZGVtb19faGlzdG9yeVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2xvZy5tYXAoKGVudHJ5LCBpKSA9PiA8bGkga2V5PXtgJHtpfS0ke2VudHJ5fWB9PntlbnRyeX08L2xpPil9XG4gICAgICAgICAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgICAgICAgPENvZGVCbG9jayBjb2RlPXtzbmlwcGV0fSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJpbml0aWFsUm93cyIsImNvbHVtbnMiLCJzbmlwcGV0IiwiQ29udGV4dE1lbnVEZW1vIiwiYXBpUmVmIiwidXNlR3JpZEFwaVJlZiIsInJvd3MiLCJzZXRSb3dzIiwidXNlU3RhdGUiLCJsb2ciLCJzZXRMb2ciLCJub3RlIiwidGV4dCIsInByZXYiLCJnZXRDb250ZXh0TWVudUl0ZW1zIiwicGFyYW1zIiwiZGVmYXVsdEl0ZW1zIiwiZXhwb3J0VG9Dc3YiLCJyIiwianN4IiwiRG9jc0xheW91dCIsImpzeHMiLCJGcmFnbWVudCIsIkRhdGFHcmlkIiwicm93IiwiZW50cnkiLCJpIiwiQ29kZUJsb2NrIl0sIm1hcHBpbmdzIjoiZ01BQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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
