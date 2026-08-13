import{r as a,j as t}from"./vendor-react-LmGMyLnN.js";import{B as n,D as p,G as w}from"./opengridx-DRhFeO2U.js";import{D as h}from"./DocsLayout-BoGj89NG.js";const b=`import { DataGrid, GridToolbar, Button, GridRenderCellParams } from '@opencorestack/opengridx';
import { useState, useCallback, useMemo } from 'react';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CRUDTutorial.tsx?raw';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const initialRows: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Developer' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Manager' },
];

export default function CRUDTutorial() {
    const [rows, setRows] = useState<User[]>(initialRows);

    const deleteUser = useCallback((id: number) => {
        setRows(prev => prev.filter(row => row.id !== id));
    }, []);

    const addUser = useCallback(() => {
        const id = Math.max(...rows.map(r => r.id), 0) + 1;
        const newUser = { id, name: 'New User', email: 'new@example.com', role: 'Contributor' };
        setRows(prev => [newUser, ...prev]);
    }, [rows]);

    const processRowUpdate = useCallback((newRow: User, oldRow: User) => {
        setRows(prev => prev.map(r => r.id === oldRow.id ? newRow : r));
        return newRow;
    }, []);

    const columns = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', width: 200, editable: true },
        { field: 'email', headerName: 'Email', width: 250, editable: true },
        { field: 'role', headerName: 'Role', width: 150, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params: GridRenderCellParams<User>) => (
                <Button
                    size="small"
                    variant="outlined"
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => deleteUser(params.row.id)}
                >
                    Delete
                </Button>
            )
        }
    ], [deleteUser]);

    return (
        <DocsLayout
            title="Interactive CRUD"
            description="A complete create-read-update-delete tutorial. Add rows, inline-edit any cell, and delete rows — with optimistic updates and type-safe row processing."
            sourceCode={sourceCode}
        >
            <Button onClick={addUser}>➕ Add User</Button>
            <DataGrid
                rows={rows}
                columns={columns}
                processRowUpdate={processRowUpdate}
                height={400}
                slots={{ toolbar: GridToolbar }}
            />
        </DocsLayout>
    );
}
`,f=[{id:1,name:"Alice Smith",email:"alice@example.com",role:"Developer"},{id:2,name:"Bob Jones",email:"bob@example.com",role:"Designer"},{id:3,name:"Charlie Davis",email:"charlie@example.com",role:"Manager"}];function D(){const[i,s]=a.useState(f),l=a.useCallback(e=>{s(r=>r.filter(o=>o.id!==e))},[]),m=a.useCallback(()=>{const r={id:Math.max(...i.map(o=>o.id),0)+1,name:"New User",email:"new@example.com",role:"Contributor"};s(o=>[r,...o])},[i]),c=a.useCallback((e,r)=>(s(o=>o.map(d=>d.id===r.id?e:d)),e),[]),u=a.useMemo(()=>[{field:"id",headerName:"ID",width:80},{field:"name",headerName:"Name",width:200,editable:!0},{field:"email",headerName:"Email",width:250,editable:!0},{field:"role",headerName:"Role",width:150,editable:!0},{field:"actions",headerName:"Actions",width:100,renderCell:e=>t.jsx(n,{size:"small",variant:"outlined",style:{color:"#ef4444",borderColor:"#fca5a5"},onClick:()=>l(e.row.id),children:"Delete"})}],[l]);return t.jsxs(h,{title:"Interactive CRUD",description:"A complete create-read-update-delete tutorial. Add rows, inline-edit any cell, and delete rows — with optimistic updates and type-safe row processing.",sourceCode:b,children:[t.jsx(n,{onClick:m,children:"➕ Add User"}),t.jsx(p,{rows:i,columns:u,processRowUpdate:c,height:400,slots:{toolbar:w}})]})}export{D as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1JVRFR1dG9yaWFsLUNYSmNKNTJsLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9DUlVEVHV0b3JpYWwvQ1JVRFR1dG9yaWFsLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DUlVEVHV0b3JpYWwvQ1JVRFR1dG9yaWFsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IERhdGFHcmlkLCBHcmlkVG9vbGJhciwgQnV0dG9uLCBHcmlkUmVuZGVyQ2VsbFBhcmFtcyB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vQ1JVRFR1dG9yaWFsLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBVc2VyIHtcXG4gICAgaWQ6IG51bWJlcjtcXG4gICAgbmFtZTogc3RyaW5nO1xcbiAgICBlbWFpbDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxufVxcblxcbmNvbnN0IGluaXRpYWxSb3dzOiBVc2VyW10gPSBbXFxuICAgIHsgaWQ6IDEsIG5hbWU6ICdBbGljZSBTbWl0aCcsIGVtYWlsOiAnYWxpY2VAZXhhbXBsZS5jb20nLCByb2xlOiAnRGV2ZWxvcGVyJyB9LFxcbiAgICB7IGlkOiAyLCBuYW1lOiAnQm9iIEpvbmVzJywgZW1haWw6ICdib2JAZXhhbXBsZS5jb20nLCByb2xlOiAnRGVzaWduZXInIH0sXFxuICAgIHsgaWQ6IDMsIG5hbWU6ICdDaGFybGllIERhdmlzJywgZW1haWw6ICdjaGFybGllQGV4YW1wbGUuY29tJywgcm9sZTogJ01hbmFnZXInIH0sXFxuXTtcXG5cXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDUlVEVHV0b3JpYWwoKSB7XFxuICAgIGNvbnN0IFtyb3dzLCBzZXRSb3dzXSA9IHVzZVN0YXRlPFVzZXJbXT4oaW5pdGlhbFJvd3MpO1xcblxcbiAgICBjb25zdCBkZWxldGVVc2VyID0gdXNlQ2FsbGJhY2soKGlkOiBudW1iZXIpID0+IHtcXG4gICAgICAgIHNldFJvd3MocHJldiA9PiBwcmV2LmZpbHRlcihyb3cgPT4gcm93LmlkICE9PSBpZCkpO1xcbiAgICB9LCBbXSk7XFxuXFxuICAgIGNvbnN0IGFkZFVzZXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XFxuICAgICAgICBjb25zdCBpZCA9IE1hdGgubWF4KC4uLnJvd3MubWFwKHIgPT4gci5pZCksIDApICsgMTtcXG4gICAgICAgIGNvbnN0IG5ld1VzZXIgPSB7IGlkLCBuYW1lOiAnTmV3IFVzZXInLCBlbWFpbDogJ25ld0BleGFtcGxlLmNvbScsIHJvbGU6ICdDb250cmlidXRvcicgfTtcXG4gICAgICAgIHNldFJvd3MocHJldiA9PiBbbmV3VXNlciwgLi4ucHJldl0pO1xcbiAgICB9LCBbcm93c10pO1xcblxcbiAgICBjb25zdCBwcm9jZXNzUm93VXBkYXRlID0gdXNlQ2FsbGJhY2soKG5ld1JvdzogVXNlciwgb2xkUm93OiBVc2VyKSA9PiB7XFxuICAgICAgICBzZXRSb3dzKHByZXYgPT4gcHJldi5tYXAociA9PiByLmlkID09PSBvbGRSb3cuaWQgPyBuZXdSb3cgOiByKSk7XFxuICAgICAgICByZXR1cm4gbmV3Um93O1xcbiAgICB9LCBbXSk7XFxuXFxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcXG4gICAgICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA4MCB9LFxcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAyMDAsIGVkaXRhYmxlOiB0cnVlIH0sXFxuICAgICAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjUwLCBlZGl0YWJsZTogdHJ1ZSB9LFxcbiAgICAgICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxNTAsIGVkaXRhYmxlOiB0cnVlIH0sXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdhY3Rpb25zJyxcXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9ucycsXFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zOiBHcmlkUmVuZGVyQ2VsbFBhcmFtczxVc2VyPikgPT4gKFxcbiAgICAgICAgICAgICAgICA8QnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBzaXplPVxcXCJzbWFsbFxcXCJcXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XFxcIm91dGxpbmVkXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgY29sb3I6ICcjZWY0NDQ0JywgYm9yZGVyQ29sb3I6ICcjZmNhNWE1JyB9fVxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZGVsZXRlVXNlcihwYXJhbXMucm93LmlkKX1cXG4gICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgRGVsZXRlXFxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxcbiAgICAgICAgICAgIClcXG4gICAgICAgIH1cXG4gICAgXSwgW2RlbGV0ZVVzZXJdKTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIkludGVyYWN0aXZlIENSVURcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkEgY29tcGxldGUgY3JlYXRlLXJlYWQtdXBkYXRlLWRlbGV0ZSB0dXRvcmlhbC4gQWRkIHJvd3MsIGlubGluZS1lZGl0IGFueSBjZWxsLCBhbmQgZGVsZXRlIHJvd3Mg4oCUIHdpdGggb3B0aW1pc3RpYyB1cGRhdGVzIGFuZCB0eXBlLXNhZmUgcm93IHByb2Nlc3NpbmcuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXthZGRVc2VyfT7inpUgQWRkIFVzZXI8L0J1dHRvbj5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jvd1VwZGF0ZT17cHJvY2Vzc1Jvd1VwZGF0ZX1cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XFxuICAgICAgICAgICAgICAgIHNsb3RzPXt7IHRvb2xiYXI6IEdyaWRUb29sYmFyIH19XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJpbXBvcnQgeyBEYXRhR3JpZCwgR3JpZFRvb2xiYXIsIEJ1dHRvbiwgR3JpZFJlbmRlckNlbGxQYXJhbXMgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NSVURUdXRvcmlhbC50c3g/cmF3JztcblxuaW50ZXJmYWNlIFVzZXIge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVtYWlsOiBzdHJpbmc7XG4gICAgcm9sZTogc3RyaW5nO1xufVxuXG5jb25zdCBpbml0aWFsUm93czogVXNlcltdID0gW1xuICAgIHsgaWQ6IDEsIG5hbWU6ICdBbGljZSBTbWl0aCcsIGVtYWlsOiAnYWxpY2VAZXhhbXBsZS5jb20nLCByb2xlOiAnRGV2ZWxvcGVyJyB9LFxuICAgIHsgaWQ6IDIsIG5hbWU6ICdCb2IgSm9uZXMnLCBlbWFpbDogJ2JvYkBleGFtcGxlLmNvbScsIHJvbGU6ICdEZXNpZ25lcicgfSxcbiAgICB7IGlkOiAzLCBuYW1lOiAnQ2hhcmxpZSBEYXZpcycsIGVtYWlsOiAnY2hhcmxpZUBleGFtcGxlLmNvbScsIHJvbGU6ICdNYW5hZ2VyJyB9LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ1JVRFR1dG9yaWFsKCkge1xuICAgIGNvbnN0IFtyb3dzLCBzZXRSb3dzXSA9IHVzZVN0YXRlPFVzZXJbXT4oaW5pdGlhbFJvd3MpO1xuXG4gICAgY29uc3QgZGVsZXRlVXNlciA9IHVzZUNhbGxiYWNrKChpZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHNldFJvd3MocHJldiA9PiBwcmV2LmZpbHRlcihyb3cgPT4gcm93LmlkICE9PSBpZCkpO1xuICAgIH0sIFtdKTtcblxuICAgIGNvbnN0IGFkZFVzZXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gTWF0aC5tYXgoLi4ucm93cy5tYXAociA9PiByLmlkKSwgMCkgKyAxO1xuICAgICAgICBjb25zdCBuZXdVc2VyID0geyBpZCwgbmFtZTogJ05ldyBVc2VyJywgZW1haWw6ICduZXdAZXhhbXBsZS5jb20nLCByb2xlOiAnQ29udHJpYnV0b3InIH07XG4gICAgICAgIHNldFJvd3MocHJldiA9PiBbbmV3VXNlciwgLi4ucHJldl0pO1xuICAgIH0sIFtyb3dzXSk7XG5cbiAgICBjb25zdCBwcm9jZXNzUm93VXBkYXRlID0gdXNlQ2FsbGJhY2soKG5ld1JvdzogVXNlciwgb2xkUm93OiBVc2VyKSA9PiB7XG4gICAgICAgIHNldFJvd3MocHJldiA9PiBwcmV2Lm1hcChyID0+IHIuaWQgPT09IG9sZFJvdy5pZCA/IG5ld1JvdyA6IHIpKTtcbiAgICAgICAgcmV0dXJuIG5ld1JvdztcbiAgICB9LCBbXSk7XG5cbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA4MCB9LFxuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDIwMCwgZWRpdGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDI1MCwgZWRpdGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxNTAsIGVkaXRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWN0aW9ucycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9ucycsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtczogR3JpZFJlbmRlckNlbGxQYXJhbXM8VXNlcj4pID0+IChcbiAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGNvbG9yOiAnI2VmNDQ0NCcsIGJvcmRlckNvbG9yOiAnI2ZjYTVhNScgfX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZGVsZXRlVXNlcihwYXJhbXMucm93LmlkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIERlbGV0ZVxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgXSwgW2RlbGV0ZVVzZXJdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkludGVyYWN0aXZlIENSVURcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJBIGNvbXBsZXRlIGNyZWF0ZS1yZWFkLXVwZGF0ZS1kZWxldGUgdHV0b3JpYWwuIEFkZCByb3dzLCBpbmxpbmUtZWRpdCBhbnkgY2VsbCwgYW5kIGRlbGV0ZSByb3dzIOKAlCB3aXRoIG9wdGltaXN0aWMgdXBkYXRlcyBhbmQgdHlwZS1zYWZlIHJvdyBwcm9jZXNzaW5nLlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e2FkZFVzZXJ9PuKelSBBZGQgVXNlcjwvQnV0dG9uPlxuICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIHByb2Nlc3NSb3dVcGRhdGU9e3Byb2Nlc3NSb3dVcGRhdGV9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XG4gICAgICAgICAgICAgICAgc2xvdHM9e3sgdG9vbGJhcjogR3JpZFRvb2xiYXIgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJpbml0aWFsUm93cyIsIkNSVURUdXRvcmlhbCIsInJvd3MiLCJzZXRSb3dzIiwidXNlU3RhdGUiLCJkZWxldGVVc2VyIiwidXNlQ2FsbGJhY2siLCJpZCIsInByZXYiLCJyb3ciLCJhZGRVc2VyIiwibmV3VXNlciIsInIiLCJwcm9jZXNzUm93VXBkYXRlIiwibmV3Um93Iiwib2xkUm93IiwiY29sdW1ucyIsInVzZU1lbW8iLCJwYXJhbXMiLCJqc3giLCJCdXR0b24iLCJqc3hzIiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIiwiR3JpZFRvb2xiYXIiXSwibWFwcGluZ3MiOiI2SkFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDWVRDLEVBQXNCLENBQ3hCLENBQUUsR0FBSSxFQUFHLEtBQU0sY0FBZSxNQUFPLG9CQUFxQixLQUFNLFdBQUEsRUFDaEUsQ0FBRSxHQUFJLEVBQUcsS0FBTSxZQUFhLE1BQU8sa0JBQW1CLEtBQU0sVUFBQSxFQUM1RCxDQUFFLEdBQUksRUFBRyxLQUFNLGdCQUFpQixNQUFPLHNCQUF1QixLQUFNLFNBQUEsQ0FDeEUsRUFFQSxTQUF3QkMsR0FBZSxDQUNuQyxLQUFNLENBQUNDLEVBQU1DLENBQU8sRUFBSUMsRUFBQUEsU0FBaUJKLENBQVcsRUFFOUNLLEVBQWFDLGNBQWFDLEdBQWUsQ0FDM0NKLEtBQWdCSyxFQUFLLFVBQWNDLEVBQUksS0FBT0YsQ0FBRSxDQUFDLENBQ3JELEVBQUcsQ0FBQSxDQUFFLEVBRUNHLEVBQVVKLEVBQUFBLFlBQVksSUFBTSxDQUU5QixNQUFNSyxFQUFVLENBQUUsR0FEUCxLQUFLLElBQUksR0FBR1QsRUFBSyxJQUFJVSxHQUFLQSxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUksRUFDM0IsS0FBTSxXQUFZLE1BQU8sa0JBQW1CLEtBQU0sYUFBQSxFQUN4RVQsRUFBUUssR0FBUSxDQUFDRyxFQUFTLEdBQUdILENBQUksQ0FBQyxDQUN0QyxFQUFHLENBQUNOLENBQUksQ0FBQyxFQUVIVyxFQUFtQlAsRUFBQUEsWUFBWSxDQUFDUSxFQUFjQyxLQUNoRFosRUFBUUssR0FBUUEsRUFBSyxJQUFJSSxHQUFLQSxFQUFFLEtBQU9HLEVBQU8sR0FBS0QsRUFBU0YsQ0FBQyxDQUFDLEVBQ3ZERSxHQUNSLENBQUEsQ0FBRSxFQUVDRSxFQUFVQyxFQUFBQSxRQUFRLElBQU0sQ0FDMUIsQ0FBRSxNQUFPLEtBQU0sV0FBWSxLQUFNLE1BQU8sRUFBQSxFQUN4QyxDQUFFLE1BQU8sT0FBUSxXQUFZLE9BQVEsTUFBTyxJQUFLLFNBQVUsRUFBQSxFQUMzRCxDQUFFLE1BQU8sUUFBUyxXQUFZLFFBQVMsTUFBTyxJQUFLLFNBQVUsRUFBQSxFQUM3RCxDQUFFLE1BQU8sT0FBUSxXQUFZLE9BQVEsTUFBTyxJQUFLLFNBQVUsRUFBQSxFQUMzRCxDQUNJLE1BQU8sVUFDUCxXQUFZLFVBQ1osTUFBTyxJQUNQLFdBQWFDLEdBQ1RDLEVBQUFBLElBQUNDLEVBQUEsQ0FDRyxLQUFLLFFBQ0wsUUFBUSxXQUNSLE1BQU8sQ0FBRSxNQUFPLFVBQVcsWUFBYSxTQUFBLEVBQ3hDLFFBQVMsSUFBTWYsRUFBV2EsRUFBTyxJQUFJLEVBQUUsRUFDMUMsU0FBQSxRQUFBLENBQUEsQ0FFRCxDQUVSLEVBQ0QsQ0FBQ2IsQ0FBVSxDQUFDLEVBRWYsT0FDSWdCLEVBQUFBLEtBQUNDLEVBQUEsQ0FDRyxNQUFNLG1CQUNOLFlBQVkseUpBQ1osV0FBQXZCLEVBRUEsU0FBQSxDQUFBb0IsRUFBQUEsSUFBQ0MsRUFBQSxDQUFPLFFBQVNWLEVBQVMsU0FBQSxhQUFVLEVBQ3BDUyxFQUFBQSxJQUFDSSxFQUFBLENBQ0csS0FBQXJCLEVBQ0EsUUFBQWMsRUFDQSxpQkFBQUgsRUFDQSxPQUFRLElBQ1IsTUFBTyxDQUFFLFFBQVNXLENBQUEsQ0FBWSxDQUFBLENBQ2xDLENBQUEsQ0FBQSxDQUdaIn0=
