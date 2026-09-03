import{r as o,j as r}from"./vendor-react-LmGMyLnN.js";import{D as h}from"./opengridx-BlrvTAzD.js";import{D as m}from"./DocsLayout-BoGj89NG.js";const u=`
import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CellErrorBoundaryDemo.tsx?raw';
import './CellErrorBoundaryDemo.css';

interface Product {
    id: number;
    name: string;
    price: number;
    rating: number;
}

const baseRows: Product[] = [
    { id: 1, name: 'Widget Alpha',  price: 29.99,  rating: 4 },
    { id: 2, name: 'Gadget Beta',   price: 49.99,  rating: 3 },
    { id: 3, name: 'Device Gamma',  price: 99.99,  rating: 5 },
    { id: 4, name: 'Tool Delta',    price: 19.99,  rating: 2 },
    { id: 5, name: 'Unit Epsilon',  price: 74.99,  rating: 4 },
    { id: 6, name: 'Module Zeta',   price: 39.99,  rating: 5 },
    { id: 7, name: 'Part Eta',      price: 14.99,  rating: 3 },
    { id: 8, name: 'Block Theta',   price: 59.99,  rating: 1 },
];

const staticColumns: GridColDef<Product>[] = [
    { field: 'id',    headerName: 'ID',    width: 70,  type: 'number' },
    { field: 'name',  headerName: 'Name',  width: 200 },
    {
        field: 'price',
        headerName: 'Price',
        width: 110,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (params) => \`$\${(params.value as number).toFixed(2)}\`,
    },
];

export default function CellErrorBoundaryDemo() {
    const [forceThrow, setForceThrow] = useState(false);
    // Changing rows reference resets the per-cell error boundaries (resetKey).
    const [rows, setRows] = useState<Product[]>(baseRows);

    const columns = useMemo<GridColDef<Product>[]>(() => [
        ...staticColumns,
        {
            field: 'rating',
            headerName: 'Rating',
            width: 160,
            renderCell: (params) => {
                if (forceThrow || params.row.id % 3 === 0) {
                    throw new Error(\`Cannot render rating for row \${params.row.id}\`);
                }
                const rating = params.value as number;
                return (
                    <span>
                        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                    </span>
                );
            },
        },
    ], [forceThrow]);

    const handleToggle = () => {
        const next = !forceThrow;
        setForceThrow(next);
        // Produce a new rows array so the grid sees fresh data and resets boundaries.
        setRows(baseRows.map((r) => ({ ...r })));
    };

    return (
        <DocsLayout
            title="Cell Error Boundary"
            description="A renderCell that throws is caught per-cell by CellErrorBoundary (v1.1.0) — the rest of the grid continues rendering normally. When data changes the boundary auto-recovers."
            sourceCode={sourceCode}
        >
            <p style={{ marginBottom: 12, color: '#475569', fontSize: '0.875rem' }}>
                Rows 3 and 6 have a <code>renderCell</code> that throws. The{' '}
                <strong>CellErrorBoundary</strong> (v1.1.0) catches the error and shows ⚠ in that cell
                only — the rest of the grid keeps rendering. Click &quot;Make all rows throw&quot; to see
                every rating cell fail, then &quot;Restore&quot; to watch the auto-recovery via the
                internal <code>resetKey</code>.
            </p>

            <div style={{ marginBottom: 16 }}>
                <button
                    onClick={handleToggle}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: forceThrow ? '#ef4444' : '#fff',
                        color:      forceThrow ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: forceThrow ? 600 : 400,
                    }}
                >
                    {forceThrow ? 'Restore' : 'Make all rows throw'}
                </button>
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                height={400}
                pagination
                pageSizeOptions={[8, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 8, page: 0 } } }}
            />
        </DocsLayout>
    );
}
`,a=[{id:1,name:"Widget Alpha",price:29.99,rating:4},{id:2,name:"Gadget Beta",price:49.99,rating:3},{id:3,name:"Device Gamma",price:99.99,rating:5},{id:4,name:"Tool Delta",price:19.99,rating:2},{id:5,name:"Unit Epsilon",price:74.99,rating:4},{id:6,name:"Module Zeta",price:39.99,rating:5},{id:7,name:"Part Eta",price:14.99,rating:3},{id:8,name:"Block Theta",price:59.99,rating:1}],g=[{field:"id",headerName:"ID",width:70,type:"number"},{field:"name",headerName:"Name",width:200},{field:"price",headerName:"Price",width:110,type:"number",align:"right",headerAlign:"right",valueFormatter:e=>`$${e.value.toFixed(2)}`}];function y(){const[e,i]=o.useState(!1),[s,d]=o.useState(a),l=o.useMemo(()=>[...g,{field:"rating",headerName:"Rating",width:160,renderCell:n=>{if(e||n.row.id%3===0)throw new Error(`Cannot render rating for row ${n.row.id}`);const t=n.value;return r.jsxs("span",{children:["★".repeat(t),"☆".repeat(5-t)]})}}],[e]),c=()=>{i(!e),d(a.map(t=>({...t})))};return r.jsxs(m,{title:"Cell Error Boundary",description:"A renderCell that throws is caught per-cell by CellErrorBoundary (v1.1.0) — the rest of the grid continues rendering normally. When data changes the boundary auto-recovers.",sourceCode:u,children:[r.jsxs("p",{style:{marginBottom:12,color:"#475569",fontSize:"0.875rem"},children:["Rows 3 and 6 have a ",r.jsx("code",{children:"renderCell"})," that throws. The"," ",r.jsx("strong",{children:"CellErrorBoundary"}),' (v1.1.0) catches the error and shows ⚠ in that cell only — the rest of the grid keeps rendering. Click "Make all rows throw" to see every rating cell fail, then "Restore" to watch the auto-recovery via the internal ',r.jsx("code",{children:"resetKey"}),"."]}),r.jsx("div",{style:{marginBottom:16},children:r.jsx("button",{onClick:c,style:{padding:"6px 16px",borderRadius:6,border:"1px solid #e2e8f0",background:e?"#ef4444":"#fff",color:e?"#fff":"#374151",cursor:"pointer",fontSize:"0.875rem",fontWeight:e?600:400},children:e?"Restore":"Make all rows throw"})}),r.jsx(h,{rows:s,columns:l,height:400,pagination:!0,pageSizeOptions:[8,25],initialState:{pagination:{paginationModel:{pageSize:8,page:0}}}})]})}export{y as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2VsbEVycm9yQm91bmRhcnlEZW1vLURTdHBTZGpXLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9DZWxsRXJyb3JCb3VuZGFyeURlbW8vQ2VsbEVycm9yQm91bmRhcnlEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DZWxsRXJyb3JCb3VuZGFyeURlbW8vQ2VsbEVycm9yQm91bmRhcnlEZW1vLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERhdGFHcmlkLCBHcmlkQ29sRGVmIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NlbGxFcnJvckJvdW5kYXJ5RGVtby50c3g/cmF3JztcXG5pbXBvcnQgJy4vQ2VsbEVycm9yQm91bmRhcnlEZW1vLmNzcyc7XFxuXFxuaW50ZXJmYWNlIFByb2R1Y3Qge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICBuYW1lOiBzdHJpbmc7XFxuICAgIHByaWNlOiBudW1iZXI7XFxuICAgIHJhdGluZzogbnVtYmVyO1xcbn1cXG5cXG5jb25zdCBiYXNlUm93czogUHJvZHVjdFtdID0gW1xcbiAgICB7IGlkOiAxLCBuYW1lOiAnV2lkZ2V0IEFscGhhJywgIHByaWNlOiAyOS45OSwgIHJhdGluZzogNCB9LFxcbiAgICB7IGlkOiAyLCBuYW1lOiAnR2FkZ2V0IEJldGEnLCAgIHByaWNlOiA0OS45OSwgIHJhdGluZzogMyB9LFxcbiAgICB7IGlkOiAzLCBuYW1lOiAnRGV2aWNlIEdhbW1hJywgIHByaWNlOiA5OS45OSwgIHJhdGluZzogNSB9LFxcbiAgICB7IGlkOiA0LCBuYW1lOiAnVG9vbCBEZWx0YScsICAgIHByaWNlOiAxOS45OSwgIHJhdGluZzogMiB9LFxcbiAgICB7IGlkOiA1LCBuYW1lOiAnVW5pdCBFcHNpbG9uJywgIHByaWNlOiA3NC45OSwgIHJhdGluZzogNCB9LFxcbiAgICB7IGlkOiA2LCBuYW1lOiAnTW9kdWxlIFpldGEnLCAgIHByaWNlOiAzOS45OSwgIHJhdGluZzogNSB9LFxcbiAgICB7IGlkOiA3LCBuYW1lOiAnUGFydCBFdGEnLCAgICAgIHByaWNlOiAxNC45OSwgIHJhdGluZzogMyB9LFxcbiAgICB7IGlkOiA4LCBuYW1lOiAnQmxvY2sgVGhldGEnLCAgIHByaWNlOiA1OS45OSwgIHJhdGluZzogMSB9LFxcbl07XFxuXFxuY29uc3Qgc3RhdGljQ29sdW1uczogR3JpZENvbERlZjxQcm9kdWN0PltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCAgICBoZWFkZXJOYW1lOiAnSUQnLCAgICB3aWR0aDogNzAsICB0eXBlOiAnbnVtYmVyJyB9LFxcbiAgICB7IGZpZWxkOiAnbmFtZScsICBoZWFkZXJOYW1lOiAnTmFtZScsICB3aWR0aDogMjAwIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAncHJpY2UnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1ByaWNlJyxcXG4gICAgICAgIHdpZHRoOiAxMTAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQkeyhwYXJhbXMudmFsdWUgYXMgbnVtYmVyKS50b0ZpeGVkKDIpfWAsXFxuICAgIH0sXFxuXTtcXG5cXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDZWxsRXJyb3JCb3VuZGFyeURlbW8oKSB7XFxuICAgIGNvbnN0IFtmb3JjZVRocm93LCBzZXRGb3JjZVRocm93XSA9IHVzZVN0YXRlKGZhbHNlKTtcXG4gICAgLy8gQ2hhbmdpbmcgcm93cyByZWZlcmVuY2UgcmVzZXRzIHRoZSBwZXItY2VsbCBlcnJvciBib3VuZGFyaWVzIChyZXNldEtleSkuXFxuICAgIGNvbnN0IFtyb3dzLCBzZXRSb3dzXSA9IHVzZVN0YXRlPFByb2R1Y3RbXT4oYmFzZVJvd3MpO1xcblxcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbzxHcmlkQ29sRGVmPFByb2R1Y3Q+W10+KCgpID0+IFtcXG4gICAgICAgIC4uLnN0YXRpY0NvbHVtbnMsXFxuICAgICAgICB7XFxuICAgICAgICAgICAgZmllbGQ6ICdyYXRpbmcnLFxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSYXRpbmcnLFxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXFxuICAgICAgICAgICAgcmVuZGVyQ2VsbDogKHBhcmFtcykgPT4ge1xcbiAgICAgICAgICAgICAgICBpZiAoZm9yY2VUaHJvdyB8fCBwYXJhbXMucm93LmlkICUgMyA9PT0gMCkge1xcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVuZGVyIHJhdGluZyBmb3Igcm93ICR7cGFyYW1zLnJvdy5pZH1gKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgICAgICBjb25zdCByYXRpbmcgPSBwYXJhbXMudmFsdWUgYXMgbnVtYmVyO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgeyfimIUnLnJlcGVhdChyYXRpbmcpfXsn4piGJy5yZXBlYXQoNSAtIHJhdGluZyl9XFxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgICk7XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgIH0sXFxuICAgIF0sIFtmb3JjZVRocm93XSk7XFxuXFxuICAgIGNvbnN0IGhhbmRsZVRvZ2dsZSA9ICgpID0+IHtcXG4gICAgICAgIGNvbnN0IG5leHQgPSAhZm9yY2VUaHJvdztcXG4gICAgICAgIHNldEZvcmNlVGhyb3cobmV4dCk7XFxuICAgICAgICAvLyBQcm9kdWNlIGEgbmV3IHJvd3MgYXJyYXkgc28gdGhlIGdyaWQgc2VlcyBmcmVzaCBkYXRhIGFuZCByZXNldHMgYm91bmRhcmllcy5cXG4gICAgICAgIHNldFJvd3MoYmFzZVJvd3MubWFwKChyKSA9PiAoeyAuLi5yIH0pKSk7XFxuICAgIH07XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJDZWxsIEVycm9yIEJvdW5kYXJ5XFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJBIHJlbmRlckNlbGwgdGhhdCB0aHJvd3MgaXMgY2F1Z2h0IHBlci1jZWxsIGJ5IENlbGxFcnJvckJvdW5kYXJ5ICh2MS4xLjApIOKAlCB0aGUgcmVzdCBvZiB0aGUgZ3JpZCBjb250aW51ZXMgcmVuZGVyaW5nIG5vcm1hbGx5LiBXaGVuIGRhdGEgY2hhbmdlcyB0aGUgYm91bmRhcnkgYXV0by1yZWNvdmVycy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDEyLCBjb2xvcjogJyM0NzU1NjknLCBmb250U2l6ZTogJzAuODc1cmVtJyB9fT5cXG4gICAgICAgICAgICAgICAgUm93cyAzIGFuZCA2IGhhdmUgYSA8Y29kZT5yZW5kZXJDZWxsPC9jb2RlPiB0aGF0IHRocm93cy4gVGhleycgJ31cXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5DZWxsRXJyb3JCb3VuZGFyeTwvc3Ryb25nPiAodjEuMS4wKSBjYXRjaGVzIHRoZSBlcnJvciBhbmQgc2hvd3Mg4pqgIGluIHRoYXQgY2VsbFxcbiAgICAgICAgICAgICAgICBvbmx5IOKAlCB0aGUgcmVzdCBvZiB0aGUgZ3JpZCBrZWVwcyByZW5kZXJpbmcuIENsaWNrICZxdW90O01ha2UgYWxsIHJvd3MgdGhyb3cmcXVvdDsgdG8gc2VlXFxuICAgICAgICAgICAgICAgIGV2ZXJ5IHJhdGluZyBjZWxsIGZhaWwsIHRoZW4gJnF1b3Q7UmVzdG9yZSZxdW90OyB0byB3YXRjaCB0aGUgYXV0by1yZWNvdmVyeSB2aWEgdGhlXFxuICAgICAgICAgICAgICAgIGludGVybmFsIDxjb2RlPnJlc2V0S2V5PC9jb2RlPi5cXG4gICAgICAgICAgICA8L3A+XFxuXFxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDE2IH19PlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVUb2dnbGV9XFxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMTZweCcsXFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA2LFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTJlOGYwJyxcXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBmb3JjZVRocm93ID8gJyNlZjQ0NDQnIDogJyNmZmYnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAgICAgIGZvcmNlVGhyb3cgPyAnI2ZmZicgOiAnIzM3NDE1MScsXFxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcwLjg3NXJlbScsXFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogZm9yY2VUaHJvdyA/IDYwMCA6IDQwMCxcXG4gICAgICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIHtmb3JjZVRocm93ID8gJ1Jlc3RvcmUnIDogJ01ha2UgYWxsIHJvd3MgdGhyb3cnfVxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbOCwgMjVdfVxcbiAgICAgICAgICAgICAgICBpbml0aWFsU3RhdGU9e3sgcGFnaW5hdGlvbjogeyBwYWdpbmF0aW9uTW9kZWw6IHsgcGFnZVNpemU6IDgsIHBhZ2U6IDAgfSB9IH19XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NlbGxFcnJvckJvdW5kYXJ5RGVtby50c3g/cmF3JztcbmltcG9ydCAnLi9DZWxsRXJyb3JCb3VuZGFyeURlbW8uY3NzJztcblxuaW50ZXJmYWNlIFByb2R1Y3Qge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHByaWNlOiBudW1iZXI7XG4gICAgcmF0aW5nOiBudW1iZXI7XG59XG5cbmNvbnN0IGJhc2VSb3dzOiBQcm9kdWN0W10gPSBbXG4gICAgeyBpZDogMSwgbmFtZTogJ1dpZGdldCBBbHBoYScsICBwcmljZTogMjkuOTksICByYXRpbmc6IDQgfSxcbiAgICB7IGlkOiAyLCBuYW1lOiAnR2FkZ2V0IEJldGEnLCAgIHByaWNlOiA0OS45OSwgIHJhdGluZzogMyB9LFxuICAgIHsgaWQ6IDMsIG5hbWU6ICdEZXZpY2UgR2FtbWEnLCAgcHJpY2U6IDk5Ljk5LCAgcmF0aW5nOiA1IH0sXG4gICAgeyBpZDogNCwgbmFtZTogJ1Rvb2wgRGVsdGEnLCAgICBwcmljZTogMTkuOTksICByYXRpbmc6IDIgfSxcbiAgICB7IGlkOiA1LCBuYW1lOiAnVW5pdCBFcHNpbG9uJywgIHByaWNlOiA3NC45OSwgIHJhdGluZzogNCB9LFxuICAgIHsgaWQ6IDYsIG5hbWU6ICdNb2R1bGUgWmV0YScsICAgcHJpY2U6IDM5Ljk5LCAgcmF0aW5nOiA1IH0sXG4gICAgeyBpZDogNywgbmFtZTogJ1BhcnQgRXRhJywgICAgICBwcmljZTogMTQuOTksICByYXRpbmc6IDMgfSxcbiAgICB7IGlkOiA4LCBuYW1lOiAnQmxvY2sgVGhldGEnLCAgIHByaWNlOiA1OS45OSwgIHJhdGluZzogMSB9LFxuXTtcblxuY29uc3Qgc3RhdGljQ29sdW1uczogR3JpZENvbERlZjxQcm9kdWN0PltdID0gW1xuICAgIHsgZmllbGQ6ICdpZCcsICAgIGhlYWRlck5hbWU6ICdJRCcsICAgIHdpZHRoOiA3MCwgIHR5cGU6ICdudW1iZXInIH0sXG4gICAgeyBmaWVsZDogJ25hbWUnLCAgaGVhZGVyTmFtZTogJ05hbWUnLCAgd2lkdGg6IDIwMCB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdwcmljZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdQcmljZScsXG4gICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJCR7KHBhcmFtcy52YWx1ZSBhcyBudW1iZXIpLnRvRml4ZWQoMil9YCxcbiAgICB9LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2VsbEVycm9yQm91bmRhcnlEZW1vKCkge1xuICAgIGNvbnN0IFtmb3JjZVRocm93LCBzZXRGb3JjZVRocm93XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICAvLyBDaGFuZ2luZyByb3dzIHJlZmVyZW5jZSByZXNldHMgdGhlIHBlci1jZWxsIGVycm9yIGJvdW5kYXJpZXMgKHJlc2V0S2V5KS5cbiAgICBjb25zdCBbcm93cywgc2V0Um93c10gPSB1c2VTdGF0ZTxQcm9kdWN0W10+KGJhc2VSb3dzKTtcblxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vPEdyaWRDb2xEZWY8UHJvZHVjdD5bXT4oKCkgPT4gW1xuICAgICAgICAuLi5zdGF0aWNDb2x1bW5zLFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3JhdGluZycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUmF0aW5nJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZvcmNlVGhyb3cgfHwgcGFyYW1zLnJvdy5pZCAlIDMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVuZGVyIHJhdGluZyBmb3Igcm93ICR7cGFyYW1zLnJvdy5pZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmF0aW5nID0gcGFyYW1zLnZhbHVlIGFzIG51bWJlcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsn4piFJy5yZXBlYXQocmF0aW5nKX17J+KYhicucmVwZWF0KDUgLSByYXRpbmcpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXSwgW2ZvcmNlVGhyb3ddKTtcblxuICAgIGNvbnN0IGhhbmRsZVRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9ICFmb3JjZVRocm93O1xuICAgICAgICBzZXRGb3JjZVRocm93KG5leHQpO1xuICAgICAgICAvLyBQcm9kdWNlIGEgbmV3IHJvd3MgYXJyYXkgc28gdGhlIGdyaWQgc2VlcyBmcmVzaCBkYXRhIGFuZCByZXNldHMgYm91bmRhcmllcy5cbiAgICAgICAgc2V0Um93cyhiYXNlUm93cy5tYXAoKHIpID0+ICh7IC4uLnIgfSkpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiQ2VsbCBFcnJvciBCb3VuZGFyeVwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIkEgcmVuZGVyQ2VsbCB0aGF0IHRocm93cyBpcyBjYXVnaHQgcGVyLWNlbGwgYnkgQ2VsbEVycm9yQm91bmRhcnkgKHYxLjEuMCkg4oCUIHRoZSByZXN0IG9mIHRoZSBncmlkIGNvbnRpbnVlcyByZW5kZXJpbmcgbm9ybWFsbHkuIFdoZW4gZGF0YSBjaGFuZ2VzIHRoZSBib3VuZGFyeSBhdXRvLXJlY292ZXJzLlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDEyLCBjb2xvcjogJyM0NzU1NjknLCBmb250U2l6ZTogJzAuODc1cmVtJyB9fT5cbiAgICAgICAgICAgICAgICBSb3dzIDMgYW5kIDYgaGF2ZSBhIDxjb2RlPnJlbmRlckNlbGw8L2NvZGU+IHRoYXQgdGhyb3dzLiBUaGV7JyAnfVxuICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2VsbEVycm9yQm91bmRhcnk8L3N0cm9uZz4gKHYxLjEuMCkgY2F0Y2hlcyB0aGUgZXJyb3IgYW5kIHNob3dzIOKaoCBpbiB0aGF0IGNlbGxcbiAgICAgICAgICAgICAgICBvbmx5IOKAlCB0aGUgcmVzdCBvZiB0aGUgZ3JpZCBrZWVwcyByZW5kZXJpbmcuIENsaWNrICZxdW90O01ha2UgYWxsIHJvd3MgdGhyb3cmcXVvdDsgdG8gc2VlXG4gICAgICAgICAgICAgICAgZXZlcnkgcmF0aW5nIGNlbGwgZmFpbCwgdGhlbiAmcXVvdDtSZXN0b3JlJnF1b3Q7IHRvIHdhdGNoIHRoZSBhdXRvLXJlY292ZXJ5IHZpYSB0aGVcbiAgICAgICAgICAgICAgICBpbnRlcm5hbCA8Y29kZT5yZXNldEtleTwvY29kZT4uXG4gICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNiB9fT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVRvZ2dsZX1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMTZweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDYsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2UyZThmMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBmb3JjZVRocm93ID8gJyNlZjQ0NDQnIDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICAgICAgZm9yY2VUaHJvdyA/ICcjZmZmJyA6ICcjMzc0MTUxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcwLjg3NXJlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBmb3JjZVRocm93ID8gNjAwIDogNDAwLFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2ZvcmNlVGhyb3cgPyAnUmVzdG9yZScgOiAnTWFrZSBhbGwgcm93cyB0aHJvdyd9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIGhlaWdodD17NDAwfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1s4LCAyNV19XG4gICAgICAgICAgICAgICAgaW5pdGlhbFN0YXRlPXt7IHBhZ2luYXRpb246IHsgcGFnaW5hdGlvbk1vZGVsOiB7IHBhZ2VTaXplOiA4LCBwYWdlOiAwIH0gfSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsImJhc2VSb3dzIiwic3RhdGljQ29sdW1ucyIsInBhcmFtcyIsIkNlbGxFcnJvckJvdW5kYXJ5RGVtbyIsImZvcmNlVGhyb3ciLCJzZXRGb3JjZVRocm93IiwidXNlU3RhdGUiLCJyb3dzIiwic2V0Um93cyIsImNvbHVtbnMiLCJ1c2VNZW1vIiwicmF0aW5nIiwiaGFuZGxlVG9nZ2xlIiwiciIsImpzeHMiLCJEb2NzTGF5b3V0IiwianN4IiwiRGF0YUdyaWQiXSwibWFwcGluZ3MiOiIrSUFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDY1RDLEVBQXNCLENBQ3hCLENBQUUsR0FBSSxFQUFHLEtBQU0sZUFBaUIsTUFBTyxNQUFRLE9BQVEsQ0FBQSxFQUN2RCxDQUFFLEdBQUksRUFBRyxLQUFNLGNBQWlCLE1BQU8sTUFBUSxPQUFRLENBQUEsRUFDdkQsQ0FBRSxHQUFJLEVBQUcsS0FBTSxlQUFpQixNQUFPLE1BQVEsT0FBUSxDQUFBLEVBQ3ZELENBQUUsR0FBSSxFQUFHLEtBQU0sYUFBaUIsTUFBTyxNQUFRLE9BQVEsQ0FBQSxFQUN2RCxDQUFFLEdBQUksRUFBRyxLQUFNLGVBQWlCLE1BQU8sTUFBUSxPQUFRLENBQUEsRUFDdkQsQ0FBRSxHQUFJLEVBQUcsS0FBTSxjQUFpQixNQUFPLE1BQVEsT0FBUSxDQUFBLEVBQ3ZELENBQUUsR0FBSSxFQUFHLEtBQU0sV0FBaUIsTUFBTyxNQUFRLE9BQVEsQ0FBQSxFQUN2RCxDQUFFLEdBQUksRUFBRyxLQUFNLGNBQWlCLE1BQU8sTUFBUSxPQUFRLENBQUEsQ0FDM0QsRUFFTUMsRUFBdUMsQ0FDekMsQ0FBRSxNQUFPLEtBQVMsV0FBWSxLQUFTLE1BQU8sR0FBSyxLQUFNLFFBQUEsRUFDekQsQ0FBRSxNQUFPLE9BQVMsV0FBWSxPQUFTLE1BQU8sR0FBQSxFQUM5QyxDQUNJLE1BQU8sUUFDUCxXQUFZLFFBQ1osTUFBTyxJQUNQLEtBQU0sU0FDTixNQUFPLFFBQ1AsWUFBYSxRQUNiLGVBQWlCQyxHQUFXLElBQUtBLEVBQU8sTUFBaUIsUUFBUSxDQUFDLENBQUMsRUFBQSxDQUUzRSxFQUVBLFNBQXdCQyxHQUF3QixDQUM1QyxLQUFNLENBQUNDLEVBQVlDLENBQWEsRUFBSUMsRUFBQUEsU0FBUyxFQUFLLEVBRTVDLENBQUNDLEVBQU1DLENBQU8sRUFBSUYsRUFBQUEsU0FBb0JOLENBQVEsRUFFOUNTLEVBQVVDLEVBQUFBLFFBQStCLElBQU0sQ0FDakQsR0FBR1QsRUFDSCxDQUNJLE1BQU8sU0FDUCxXQUFZLFNBQ1osTUFBTyxJQUNQLFdBQWFDLEdBQVcsQ0FDcEIsR0FBSUUsR0FBY0YsRUFBTyxJQUFJLEdBQUssSUFBTSxFQUNwQyxNQUFNLElBQUksTUFBTSxnQ0FBZ0NBLEVBQU8sSUFBSSxFQUFFLEVBQUUsRUFFbkUsTUFBTVMsRUFBU1QsRUFBTyxNQUN0QixjQUNLLE9BQUEsQ0FDSSxTQUFBLENBQUEsSUFBSSxPQUFPUyxDQUFNLEVBQUcsSUFBSSxPQUFPLEVBQUlBLENBQU0sQ0FBQSxFQUM5QyxDQUVSLENBQUEsQ0FDSixFQUNELENBQUNQLENBQVUsQ0FBQyxFQUVUUSxFQUFlLElBQU0sQ0FFdkJQLEVBRGEsQ0FBQ0QsQ0FDSSxFQUVsQkksRUFBUVIsRUFBUyxJQUFLYSxJQUFPLENBQUUsR0FBR0EsQ0FBQSxFQUFJLENBQUMsQ0FDM0MsRUFFQSxPQUNJQyxFQUFBQSxLQUFDQyxFQUFBLENBQ0csTUFBTSxzQkFDTixZQUFZLCtLQUNaLFdBQUFoQixFQUVBLFNBQUEsQ0FBQWUsRUFBQUEsS0FBQyxJQUFBLENBQUUsTUFBTyxDQUFFLGFBQWMsR0FBSSxNQUFPLFVBQVcsU0FBVSxVQUFBLEVBQWMsU0FBQSxDQUFBLHVCQUNoREUsRUFBQUEsSUFBQyxRQUFLLFNBQUEsWUFBQSxDQUFVLEVBQU8sb0JBQWtCLElBQzdEQSxFQUFBQSxJQUFDLFVBQU8sU0FBQSxtQkFBQSxDQUFpQixFQUFTLDJOQUd6QkEsRUFBQUEsSUFBQyxRQUFLLFNBQUEsVUFBQSxDQUFRLEVBQU8sR0FBQSxFQUNsQyxRQUVDLE1BQUEsQ0FBSSxNQUFPLENBQUUsYUFBYyxJQUN4QixTQUFBQSxFQUFBQSxJQUFDLFNBQUEsQ0FDRyxRQUFTSixFQUNULE1BQU8sQ0FDSCxRQUFTLFdBQ1QsYUFBYyxFQUNkLE9BQVEsb0JBQ1IsV0FBWVIsRUFBYSxVQUFZLE9BQ3JDLE1BQVlBLEVBQWEsT0FBUyxVQUNsQyxPQUFRLFVBQ1IsU0FBVSxXQUNWLFdBQVlBLEVBQWEsSUFBTSxHQUFBLEVBR2xDLFdBQWEsVUFBWSxxQkFBQSxDQUFBLEVBRWxDLEVBRUFZLEVBQUFBLElBQUNDLEVBQUEsQ0FDRyxLQUFBVixFQUNBLFFBQUFFLEVBQ0EsT0FBUSxJQUNSLFdBQVUsR0FDVixnQkFBaUIsQ0FBQyxFQUFHLEVBQUUsRUFDdkIsYUFBYyxDQUFFLFdBQVksQ0FBRSxnQkFBaUIsQ0FBRSxTQUFVLEVBQUcsS0FBTSxFQUFFLENBQUUsQ0FBRSxDQUFBLENBQzlFLENBQUEsQ0FBQSxDQUdaIn0=
