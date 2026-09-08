import{r as i,j as e}from"./vendor-react-C_pufFxG.js";import{D as g}from"./opengridx-BuV2tXug.js";import{D as p}from"./DocsLayout-BC5LvnMN.js";const w=`
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

const NAMES = ['Widget Alpha', 'Gadget Beta', 'Device Gamma', 'Tool Delta', 'Unit Epsilon',
    'Module Zeta', 'Part Eta', 'Block Theta', 'Core Iota', 'Chip Kappa'];

function makeRows(): Product[] {
    return Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: \`\${NAMES[i % NAMES.length]} \${i + 1}\`,
        price: parseFloat((9.99 + (i % 20) * 5).toFixed(2)),
        rating: (i % 5) + 1,
    }));
}

const THROW_IDS = new Set([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

const staticColumns: GridColDef<Product>[] = [
    { field: 'id',    headerName: 'ID',    width: 70,  type: 'number' },
    { field: 'name',  headerName: 'Name',  width: 220 },
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
    const [throwingIds, setThrowingIds] = useState<Set<number>>(new Set());
    const [rows, setRows] = useState<Product[]>(makeRows);

    const columns = useMemo<GridColDef<Product>[]>(() => [
        ...staticColumns,
        {
            field: 'rating',
            headerName: 'Rating',
            width: 160,
            renderCell: (params) => {
                if (throwingIds.has(params.row.id)) {
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
    ], [throwingIds]);

    const handleMakeThrow = () => {
        setThrowingIds(THROW_IDS);
        setRows(r => r.map(row => ({ ...row })));
    };

    const handleRestore = () => {
        setThrowingIds(new Set());
        // New row object references are required — resetKey={row} in Cell.tsx resets
        // the per-cell error boundary only when the row object reference changes.
        setRows(makeRows());
    };

    const isThrowActive = throwingIds.size > 0;

    return (
        <DocsLayout
            title="Cell Error Boundary"
            description="A renderCell that throws is caught per-cell — the rest of the grid continues rendering normally. Click 'Make 10 rows throw' to trigger errors, then 'Restore' to watch auto-recovery."
            sourceCode={sourceCode}
        >
            <p style={{ marginBottom: 12, color: '#475569', fontSize: '0.875rem' }}>
                Rows 10, 20, 30 … 100 have a <code>renderCell</code> that throws.{' '}
                <strong>CellErrorBoundary</strong> catches each throw and shows ⚠ in that cell
                only — the rest of the grid keeps rendering. Click <strong>Restore</strong> to
                reset all boundaries by providing fresh row references.
            </p>

            <div style={{ marginBottom: 16 }}>
                <button
                    onClick={isThrowActive ? handleRestore : handleMakeThrow}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: isThrowActive ? '#ef4444' : '#fff',
                        color:      isThrowActive ? '#fff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: isThrowActive ? 600 : 400,
                    }}
                >
                    {isThrowActive ? 'Restore' : 'Make 10 rows throw'}
                </button>
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                height={460}
                pagination
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            />
        </DocsLayout>
    );
}
`,d=["Widget Alpha","Gadget Beta","Device Gamma","Tool Delta","Unit Epsilon","Module Zeta","Part Eta","Block Theta","Core Iota","Chip Kappa"];function l(){return Array.from({length:100},(r,n)=>({id:n+1,name:`${d[n%d.length]} ${n+1}`,price:parseFloat((9.99+n%20*5).toFixed(2)),rating:n%5+1}))}const f=new Set([10,20,30,40,50,60,70,80,90,100]),C=[{field:"id",headerName:"ID",width:70,type:"number"},{field:"name",headerName:"Name",width:220},{field:"price",headerName:"Price",width:110,type:"number",align:"right",headerAlign:"right",valueFormatter:r=>`$${r.value.toFixed(2)}`}];function R(){const[r,n]=i.useState(new Set),[c,s]=i.useState(l),h=i.useMemo(()=>[...C,{field:"rating",headerName:"Rating",width:160,renderCell:o=>{if(r.has(o.row.id))throw new Error(`Cannot render rating for row ${o.row.id}`);const a=o.value;return e.jsxs("span",{children:["★".repeat(a),"☆".repeat(5-a)]})}}],[r]),m=()=>{n(f),s(o=>o.map(a=>({...a})))},u=()=>{n(new Set),s(l())},t=r.size>0;return e.jsxs(p,{title:"Cell Error Boundary",description:"A renderCell that throws is caught per-cell — the rest of the grid continues rendering normally. Click 'Make 10 rows throw' to trigger errors, then 'Restore' to watch auto-recovery.",sourceCode:w,children:[e.jsxs("p",{style:{marginBottom:12,color:"#475569",fontSize:"0.875rem"},children:["Rows 10, 20, 30 … 100 have a ",e.jsx("code",{children:"renderCell"})," that throws."," ",e.jsx("strong",{children:"CellErrorBoundary"})," catches each throw and shows ⚠ in that cell only — the rest of the grid keeps rendering. Click ",e.jsx("strong",{children:"Restore"})," to reset all boundaries by providing fresh row references."]}),e.jsx("div",{style:{marginBottom:16},children:e.jsx("button",{onClick:t?u:m,style:{padding:"6px 16px",borderRadius:6,border:"1px solid #e2e8f0",background:t?"#ef4444":"#fff",color:t?"#fff":"#374151",cursor:"pointer",fontSize:"0.875rem",fontWeight:t?600:400},children:t?"Restore":"Make 10 rows throw"})}),e.jsx(g,{rows:c,columns:h,height:460,pagination:!0,pageSizeOptions:[10,25,50],initialState:{pagination:{paginationModel:{pageSize:10,page:0}}}})]})}export{R as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2VsbEVycm9yQm91bmRhcnlEZW1vLUN3alRHWE0yLmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9DZWxsRXJyb3JCb3VuZGFyeURlbW8vQ2VsbEVycm9yQm91bmRhcnlEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DZWxsRXJyb3JCb3VuZGFyeURlbW8vQ2VsbEVycm9yQm91bmRhcnlEZW1vLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERhdGFHcmlkLCBHcmlkQ29sRGVmIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NlbGxFcnJvckJvdW5kYXJ5RGVtby50c3g/cmF3JztcXG5pbXBvcnQgJy4vQ2VsbEVycm9yQm91bmRhcnlEZW1vLmNzcyc7XFxuXFxuaW50ZXJmYWNlIFByb2R1Y3Qge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICBuYW1lOiBzdHJpbmc7XFxuICAgIHByaWNlOiBudW1iZXI7XFxuICAgIHJhdGluZzogbnVtYmVyO1xcbn1cXG5cXG5jb25zdCBOQU1FUyA9IFsnV2lkZ2V0IEFscGhhJywgJ0dhZGdldCBCZXRhJywgJ0RldmljZSBHYW1tYScsICdUb29sIERlbHRhJywgJ1VuaXQgRXBzaWxvbicsXFxuICAgICdNb2R1bGUgWmV0YScsICdQYXJ0IEV0YScsICdCbG9jayBUaGV0YScsICdDb3JlIElvdGEnLCAnQ2hpcCBLYXBwYSddO1xcblxcbmZ1bmN0aW9uIG1ha2VSb3dzKCk6IFByb2R1Y3RbXSB7XFxuICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMDAgfSwgKF8sIGkpID0+ICh7XFxuICAgICAgICBpZDogaSArIDEsXFxuICAgICAgICBuYW1lOiBgJHtOQU1FU1tpICUgTkFNRVMubGVuZ3RoXX0gJHtpICsgMX1gLFxcbiAgICAgICAgcHJpY2U6IHBhcnNlRmxvYXQoKDkuOTkgKyAoaSAlIDIwKSAqIDUpLnRvRml4ZWQoMikpLFxcbiAgICAgICAgcmF0aW5nOiAoaSAlIDUpICsgMSxcXG4gICAgfSkpO1xcbn1cXG5cXG5jb25zdCBUSFJPV19JRFMgPSBuZXcgU2V0KFsxMCwgMjAsIDMwLCA0MCwgNTAsIDYwLCA3MCwgODAsIDkwLCAxMDBdKTtcXG5cXG5jb25zdCBzdGF0aWNDb2x1bW5zOiBHcmlkQ29sRGVmPFByb2R1Y3Q+W10gPSBbXFxuICAgIHsgZmllbGQ6ICdpZCcsICAgIGhlYWRlck5hbWU6ICdJRCcsICAgIHdpZHRoOiA3MCwgIHR5cGU6ICdudW1iZXInIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgIGhlYWRlck5hbWU6ICdOYW1lJywgIHdpZHRoOiAyMjAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdwcmljZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnUHJpY2UnLFxcbiAgICAgICAgd2lkdGg6IDExMCxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJCR7KHBhcmFtcy52YWx1ZSBhcyBudW1iZXIpLnRvRml4ZWQoMil9YCxcXG4gICAgfSxcXG5dO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENlbGxFcnJvckJvdW5kYXJ5RGVtbygpIHtcXG4gICAgY29uc3QgW3Rocm93aW5nSWRzLCBzZXRUaHJvd2luZ0lkc10gPSB1c2VTdGF0ZTxTZXQ8bnVtYmVyPj4obmV3IFNldCgpKTtcXG4gICAgY29uc3QgW3Jvd3MsIHNldFJvd3NdID0gdXNlU3RhdGU8UHJvZHVjdFtdPihtYWtlUm93cyk7XFxuXFxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vPEdyaWRDb2xEZWY8UHJvZHVjdD5bXT4oKCkgPT4gW1xcbiAgICAgICAgLi4uc3RhdGljQ29sdW1ucyxcXG4gICAgICAgIHtcXG4gICAgICAgICAgICBmaWVsZDogJ3JhdGluZycsXFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JhdGluZycsXFxuICAgICAgICAgICAgd2lkdGg6IDE2MCxcXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XFxuICAgICAgICAgICAgICAgIGlmICh0aHJvd2luZ0lkcy5oYXMocGFyYW1zLnJvdy5pZCkpIHtcXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlbmRlciByYXRpbmcgZm9yIHJvdyAke3BhcmFtcy5yb3cuaWR9YCk7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAgICAgY29uc3QgcmF0aW5nID0gcGFyYW1zLnZhbHVlIGFzIG51bWJlcjtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsn4piFJy5yZXBlYXQocmF0aW5nKX17J+KYhicucmVwZWF0KDUgLSByYXRpbmcpfVxcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICApO1xcbiAgICAgICAgICAgIH0sXFxuICAgICAgICB9LFxcbiAgICBdLCBbdGhyb3dpbmdJZHNdKTtcXG5cXG4gICAgY29uc3QgaGFuZGxlTWFrZVRocm93ID0gKCkgPT4ge1xcbiAgICAgICAgc2V0VGhyb3dpbmdJZHMoVEhST1dfSURTKTtcXG4gICAgICAgIHNldFJvd3MociA9PiByLm1hcChyb3cgPT4gKHsgLi4ucm93IH0pKSk7XFxuICAgIH07XFxuXFxuICAgIGNvbnN0IGhhbmRsZVJlc3RvcmUgPSAoKSA9PiB7XFxuICAgICAgICBzZXRUaHJvd2luZ0lkcyhuZXcgU2V0KCkpO1xcbiAgICAgICAgLy8gTmV3IHJvdyBvYmplY3QgcmVmZXJlbmNlcyBhcmUgcmVxdWlyZWQg4oCUIHJlc2V0S2V5PXtyb3d9IGluIENlbGwudHN4IHJlc2V0c1xcbiAgICAgICAgLy8gdGhlIHBlci1jZWxsIGVycm9yIGJvdW5kYXJ5IG9ubHkgd2hlbiB0aGUgcm93IG9iamVjdCByZWZlcmVuY2UgY2hhbmdlcy5cXG4gICAgICAgIHNldFJvd3MobWFrZVJvd3MoKSk7XFxuICAgIH07XFxuXFxuICAgIGNvbnN0IGlzVGhyb3dBY3RpdmUgPSB0aHJvd2luZ0lkcy5zaXplID4gMDtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIkNlbGwgRXJyb3IgQm91bmRhcnlcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkEgcmVuZGVyQ2VsbCB0aGF0IHRocm93cyBpcyBjYXVnaHQgcGVyLWNlbGwg4oCUIHRoZSByZXN0IG9mIHRoZSBncmlkIGNvbnRpbnVlcyByZW5kZXJpbmcgbm9ybWFsbHkuIENsaWNrICdNYWtlIDEwIHJvd3MgdGhyb3cnIHRvIHRyaWdnZXIgZXJyb3JzLCB0aGVuICdSZXN0b3JlJyB0byB3YXRjaCBhdXRvLXJlY292ZXJ5LlxcXCJcXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogMTIsIGNvbG9yOiAnIzQ3NTU2OScsIGZvbnRTaXplOiAnMC44NzVyZW0nIH19PlxcbiAgICAgICAgICAgICAgICBSb3dzIDEwLCAyMCwgMzAg4oCmIDEwMCBoYXZlIGEgPGNvZGU+cmVuZGVyQ2VsbDwvY29kZT4gdGhhdCB0aHJvd3MueycgJ31cXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5DZWxsRXJyb3JCb3VuZGFyeTwvc3Ryb25nPiBjYXRjaGVzIGVhY2ggdGhyb3cgYW5kIHNob3dzIOKaoCBpbiB0aGF0IGNlbGxcXG4gICAgICAgICAgICAgICAgb25seSDigJQgdGhlIHJlc3Qgb2YgdGhlIGdyaWQga2VlcHMgcmVuZGVyaW5nLiBDbGljayA8c3Ryb25nPlJlc3RvcmU8L3N0cm9uZz4gdG9cXG4gICAgICAgICAgICAgICAgcmVzZXQgYWxsIGJvdW5kYXJpZXMgYnkgcHJvdmlkaW5nIGZyZXNoIHJvdyByZWZlcmVuY2VzLlxcbiAgICAgICAgICAgIDwvcD5cXG5cXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogMTYgfX0+XFxuICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2lzVGhyb3dBY3RpdmUgPyBoYW5kbGVSZXN0b3JlIDogaGFuZGxlTWFrZVRocm93fVxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNnB4IDE2cHgnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNixcXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2UyZThmMCcsXFxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogaXNUaHJvd0FjdGl2ZSA/ICcjZWY0NDQ0JyA6ICcjZmZmJyxcXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICBpc1Rocm93QWN0aXZlID8gJyNmZmYnIDogJyMzNzQxNTEnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMC44NzVyZW0nLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IGlzVGhyb3dBY3RpdmUgPyA2MDAgOiA0MDAsXFxuICAgICAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICB7aXNUaHJvd0FjdGl2ZSA/ICdSZXN0b3JlJyA6ICdNYWtlIDEwIHJvd3MgdGhyb3cnfVxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0NjB9XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDI1LCA1MF19XFxuICAgICAgICAgICAgICAgIGluaXRpYWxTdGF0ZT17eyBwYWdpbmF0aW9uOiB7IHBhZ2luYXRpb25Nb2RlbDogeyBwYWdlU2l6ZTogMTAsIHBhZ2U6IDAgfSB9IH19XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0NlbGxFcnJvckJvdW5kYXJ5RGVtby50c3g/cmF3JztcbmltcG9ydCAnLi9DZWxsRXJyb3JCb3VuZGFyeURlbW8uY3NzJztcblxuaW50ZXJmYWNlIFByb2R1Y3Qge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHByaWNlOiBudW1iZXI7XG4gICAgcmF0aW5nOiBudW1iZXI7XG59XG5cbmNvbnN0IE5BTUVTID0gWydXaWRnZXQgQWxwaGEnLCAnR2FkZ2V0IEJldGEnLCAnRGV2aWNlIEdhbW1hJywgJ1Rvb2wgRGVsdGEnLCAnVW5pdCBFcHNpbG9uJyxcbiAgICAnTW9kdWxlIFpldGEnLCAnUGFydCBFdGEnLCAnQmxvY2sgVGhldGEnLCAnQ29yZSBJb3RhJywgJ0NoaXAgS2FwcGEnXTtcblxuZnVuY3Rpb24gbWFrZVJvd3MoKTogUHJvZHVjdFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTAwIH0sIChfLCBpKSA9PiAoe1xuICAgICAgICBpZDogaSArIDEsXG4gICAgICAgIG5hbWU6IGAke05BTUVTW2kgJSBOQU1FUy5sZW5ndGhdfSAke2kgKyAxfWAsXG4gICAgICAgIHByaWNlOiBwYXJzZUZsb2F0KCg5Ljk5ICsgKGkgJSAyMCkgKiA1KS50b0ZpeGVkKDIpKSxcbiAgICAgICAgcmF0aW5nOiAoaSAlIDUpICsgMSxcbiAgICB9KSk7XG59XG5cbmNvbnN0IFRIUk9XX0lEUyA9IG5ldyBTZXQoWzEwLCAyMCwgMzAsIDQwLCA1MCwgNjAsIDcwLCA4MCwgOTAsIDEwMF0pO1xuXG5jb25zdCBzdGF0aWNDb2x1bW5zOiBHcmlkQ29sRGVmPFByb2R1Y3Q+W10gPSBbXG4gICAgeyBmaWVsZDogJ2lkJywgICAgaGVhZGVyTmFtZTogJ0lEJywgICAgd2lkdGg6IDcwLCAgdHlwZTogJ251bWJlcicgfSxcbiAgICB7IGZpZWxkOiAnbmFtZScsICBoZWFkZXJOYW1lOiAnTmFtZScsICB3aWR0aDogMjIwIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3ByaWNlJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1ByaWNlJyxcbiAgICAgICAgd2lkdGg6IDExMCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkJHsocGFyYW1zLnZhbHVlIGFzIG51bWJlcikudG9GaXhlZCgyKX1gLFxuICAgIH0sXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDZWxsRXJyb3JCb3VuZGFyeURlbW8oKSB7XG4gICAgY29uc3QgW3Rocm93aW5nSWRzLCBzZXRUaHJvd2luZ0lkc10gPSB1c2VTdGF0ZTxTZXQ8bnVtYmVyPj4obmV3IFNldCgpKTtcbiAgICBjb25zdCBbcm93cywgc2V0Um93c10gPSB1c2VTdGF0ZTxQcm9kdWN0W10+KG1ha2VSb3dzKTtcblxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vPEdyaWRDb2xEZWY8UHJvZHVjdD5bXT4oKCkgPT4gW1xuICAgICAgICAuLi5zdGF0aWNDb2x1bW5zLFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3JhdGluZycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUmF0aW5nJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXG4gICAgICAgICAgICByZW5kZXJDZWxsOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRocm93aW5nSWRzLmhhcyhwYXJhbXMucm93LmlkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZW5kZXIgcmF0aW5nIGZvciByb3cgJHtwYXJhbXMucm93LmlkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByYXRpbmcgPSBwYXJhbXMudmFsdWUgYXMgbnVtYmVyO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyfimIUnLnJlcGVhdChyYXRpbmcpfXsn4piGJy5yZXBlYXQoNSAtIHJhdGluZyl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICBdLCBbdGhyb3dpbmdJZHNdKTtcblxuICAgIGNvbnN0IGhhbmRsZU1ha2VUaHJvdyA9ICgpID0+IHtcbiAgICAgICAgc2V0VGhyb3dpbmdJZHMoVEhST1dfSURTKTtcbiAgICAgICAgc2V0Um93cyhyID0+IHIubWFwKHJvdyA9PiAoeyAuLi5yb3cgfSkpKTtcbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlUmVzdG9yZSA9ICgpID0+IHtcbiAgICAgICAgc2V0VGhyb3dpbmdJZHMobmV3IFNldCgpKTtcbiAgICAgICAgLy8gTmV3IHJvdyBvYmplY3QgcmVmZXJlbmNlcyBhcmUgcmVxdWlyZWQg4oCUIHJlc2V0S2V5PXtyb3d9IGluIENlbGwudHN4IHJlc2V0c1xuICAgICAgICAvLyB0aGUgcGVyLWNlbGwgZXJyb3IgYm91bmRhcnkgb25seSB3aGVuIHRoZSByb3cgb2JqZWN0IHJlZmVyZW5jZSBjaGFuZ2VzLlxuICAgICAgICBzZXRSb3dzKG1ha2VSb3dzKCkpO1xuICAgIH07XG5cbiAgICBjb25zdCBpc1Rocm93QWN0aXZlID0gdGhyb3dpbmdJZHMuc2l6ZSA+IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RG9jc0xheW91dFxuICAgICAgICAgICAgdGl0bGU9XCJDZWxsIEVycm9yIEJvdW5kYXJ5XCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiQSByZW5kZXJDZWxsIHRoYXQgdGhyb3dzIGlzIGNhdWdodCBwZXItY2VsbCDigJQgdGhlIHJlc3Qgb2YgdGhlIGdyaWQgY29udGludWVzIHJlbmRlcmluZyBub3JtYWxseS4gQ2xpY2sgJ01ha2UgMTAgcm93cyB0aHJvdycgdG8gdHJpZ2dlciBlcnJvcnMsIHRoZW4gJ1Jlc3RvcmUnIHRvIHdhdGNoIGF1dG8tcmVjb3ZlcnkuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogMTIsIGNvbG9yOiAnIzQ3NTU2OScsIGZvbnRTaXplOiAnMC44NzVyZW0nIH19PlxuICAgICAgICAgICAgICAgIFJvd3MgMTAsIDIwLCAzMCDigKYgMTAwIGhhdmUgYSA8Y29kZT5yZW5kZXJDZWxsPC9jb2RlPiB0aGF0IHRocm93cy57JyAnfVxuICAgICAgICAgICAgICAgIDxzdHJvbmc+Q2VsbEVycm9yQm91bmRhcnk8L3N0cm9uZz4gY2F0Y2hlcyBlYWNoIHRocm93IGFuZCBzaG93cyDimqAgaW4gdGhhdCBjZWxsXG4gICAgICAgICAgICAgICAgb25seSDigJQgdGhlIHJlc3Qgb2YgdGhlIGdyaWQga2VlcHMgcmVuZGVyaW5nLiBDbGljayA8c3Ryb25nPlJlc3RvcmU8L3N0cm9uZz4gdG9cbiAgICAgICAgICAgICAgICByZXNldCBhbGwgYm91bmRhcmllcyBieSBwcm92aWRpbmcgZnJlc2ggcm93IHJlZmVyZW5jZXMuXG4gICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAxNiB9fT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2lzVGhyb3dBY3RpdmUgPyBoYW5kbGVSZXN0b3JlIDogaGFuZGxlTWFrZVRocm93fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzZweCAxNnB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTJlOGYwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGlzVGhyb3dBY3RpdmUgPyAnI2VmNDQ0NCcgOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogICAgICBpc1Rocm93QWN0aXZlID8gJyNmZmYnIDogJyMzNzQxNTEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuODc1cmVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IGlzVGhyb3dBY3RpdmUgPyA2MDAgOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7aXNUaHJvd0FjdGl2ZSA/ICdSZXN0b3JlJyA6ICdNYWtlIDEwIHJvd3MgdGhyb3cnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezQ2MH1cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDI1LCA1MF19XG4gICAgICAgICAgICAgICAgaW5pdGlhbFN0YXRlPXt7IHBhZ2luYXRpb246IHsgcGFnaW5hdGlvbk1vZGVsOiB7IHBhZ2VTaXplOiAxMCwgcGFnZTogMCB9IH0gfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJOQU1FUyIsIm1ha2VSb3dzIiwiXyIsImkiLCJUSFJPV19JRFMiLCJzdGF0aWNDb2x1bW5zIiwicGFyYW1zIiwiQ2VsbEVycm9yQm91bmRhcnlEZW1vIiwidGhyb3dpbmdJZHMiLCJzZXRUaHJvd2luZ0lkcyIsInVzZVN0YXRlIiwicm93cyIsInNldFJvd3MiLCJjb2x1bW5zIiwidXNlTWVtbyIsInJhdGluZyIsImhhbmRsZU1ha2VUaHJvdyIsInIiLCJyb3ciLCJoYW5kbGVSZXN0b3JlIiwiaXNUaHJvd0FjdGl2ZSIsImpzeHMiLCJEb2NzTGF5b3V0IiwianN4IiwiRGF0YUdyaWQiXSwibWFwcGluZ3MiOiIrSUFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
