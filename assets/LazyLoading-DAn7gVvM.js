import{r as u,j as l}from"./vendor-react-f02LKZLu.js";import{D as h}from"./opengridx-EFCC82WS.js";import{D as w}from"./DocsLayout-CwTr2FWN.js";const y=`
import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import { GridColDef, GridDataSource, GridGetRowsParams, GridRowModel, GridPaginationModel } from '../../../lib/types';
import './LazyLoading.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './LazyLoading.tsx?raw';

interface Employee extends GridRowModel {
    id: number;
    name: string;
    email: string;
    department: string;
    salary: number;
}

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 280, sortable: true },
    { field: 'department', headerName: 'Department', width: 160 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 140,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (p) => p.value != null ? \`$\${Number(p.value).toLocaleString()}\` : ''
    }
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const allEmployees: Employee[] = Array.from({ length: 15000 }, (_, i) => ({
    id: i + 1,
    name: \`Employee \${i + 1}\`,
    email: \`employee\${i + 1}@company.com\`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    salary: 50000 + (i % 100) * 500,
}));

const mockDataSource: GridDataSource<Employee> = {
    getRows: async (params: GridGetRowsParams) => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const { startRow, endRow, sortModel } = params;
        const rows = [...allEmployees];

        if (sortModel.length > 0) {
            const { field, sort } = sortModel[0];
            rows.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                const cmp = typeof valA === 'number' && typeof valB === 'number'
                    ? valA - valB
                    : String(valA ?? '').localeCompare(String(valB ?? ''));
                return sort === 'asc' ? cmp : -cmp;
            });
        }

        return { rows: rows.slice(startRow, endRow), rowCount: rows.length };
    }
};

export default function LazyLoadingExample() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 100
    });

    return (
        <DocsLayout
            title="Lazy Loading"
            description="Load rows in batches as the user scrolls, with animated skeleton placeholder rows during fetch. Combine with server-side data sources for scalable list rendering."
            sourceCode={sourceCode}
        >
            <DataGrid
                columns={columns}
                rows={[]}
                dataSource={mockDataSource}
                pagination
                paginationMode="server"
                sortingMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[50, 100, 200]}
                rowHeight={52}
                headerHeight={56}
                height={400}
            />
        </DocsLayout>
    );
}
`,f=[{field:"id",headerName:"ID",width:90,align:"center",headerAlign:"center"},{field:"name",headerName:"Name",width:200,sortable:!0},{field:"email",headerName:"Email",width:280,sortable:!0},{field:"department",headerName:"Department",width:160},{field:"salary",headerName:"Salary",width:140,type:"number",align:"right",headerAlign:"right",valueFormatter:n=>n.value!=null?`$${Number(n.value).toLocaleString()}`:""}],d=["Engineering","Marketing","Sales","HR","Finance","Operations"],S=Array.from({length:15e3},(n,e)=>({id:e+1,name:`Employee ${e+1}`,email:`employee${e+1}@company.com`,department:d[e%d.length],salary:5e4+e%100*500})),M={getRows:async n=>{await new Promise(a=>setTimeout(a,600));const{startRow:e,endRow:m,sortModel:i}=n,o=[...S];if(i.length>0){const{field:a,sort:c}=i[0];o.sort((g,p)=>{const t=g[a],r=p[a],s=typeof t=="number"&&typeof r=="number"?t-r:String(t??"").localeCompare(String(r??""));return c==="asc"?s:-s})}return{rows:o.slice(e,m),rowCount:o.length}}};function b(){const[n,e]=u.useState({page:0,pageSize:100});return l.jsx(w,{title:"Lazy Loading",description:"Load rows in batches as the user scrolls, with animated skeleton placeholder rows during fetch. Combine with server-side data sources for scalable list rendering.",sourceCode:y,children:l.jsx(h,{columns:f,rows:[],dataSource:M,pagination:!0,paginationMode:"server",sortingMode:"server",paginationModel:n,onPaginationModelChange:e,pageSizeOptions:[50,100,200],rowHeight:52,headerHeight:56,height:400})})}export{b as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eUxvYWRpbmctREFuN2dWdk0uanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL0xhenlMb2FkaW5nL0xhenlMb2FkaW5nLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9MYXp5TG9hZGluZy9MYXp5TG9hZGluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgR3JpZENvbERlZiwgR3JpZERhdGFTb3VyY2UsIEdyaWRHZXRSb3dzUGFyYW1zLCBHcmlkUm93TW9kZWwsIEdyaWRQYWdpbmF0aW9uTW9kZWwgfSBmcm9tICcuLi8uLi8uLi9saWIvdHlwZXMnO1xcbmltcG9ydCAnLi9MYXp5TG9hZGluZy5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vTGF6eUxvYWRpbmcudHN4P3Jhdyc7XFxuXFxuaW50ZXJmYWNlIEVtcGxveWVlIGV4dGVuZHMgR3JpZFJvd01vZGVsIHtcXG4gICAgaWQ6IG51bWJlcjtcXG4gICAgbmFtZTogc3RyaW5nO1xcbiAgICBlbWFpbDogc3RyaW5nO1xcbiAgICBkZXBhcnRtZW50OiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbn1cXG5cXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogOTAsIGFsaWduOiAnY2VudGVyJywgaGVhZGVyQWxpZ246ICdjZW50ZXInIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMjAwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjgwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE2MCB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcXG4gICAgICAgIHdpZHRoOiAxNDAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHApID0+IHAudmFsdWUgIT0gbnVsbCA/IGAkJHtOdW1iZXIocC52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKX1gIDogJydcXG4gICAgfVxcbl07XFxuXFxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ01hcmtldGluZycsICdTYWxlcycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcXG5jb25zdCBhbGxFbXBsb3llZXM6IEVtcGxveWVlW10gPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxNTAwMCB9LCAoXywgaSkgPT4gKHtcXG4gICAgaWQ6IGkgKyAxLFxcbiAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICBlbWFpbDogYGVtcGxveWVlJHtpICsgMX1AY29tcGFueS5jb21gLFxcbiAgICBkZXBhcnRtZW50OiBERVBBUlRNRU5UU1tpICUgREVQQVJUTUVOVFMubGVuZ3RoXSxcXG4gICAgc2FsYXJ5OiA1MDAwMCArIChpICUgMTAwKSAqIDUwMCxcXG59KSk7XFxuXFxuY29uc3QgbW9ja0RhdGFTb3VyY2U6IEdyaWREYXRhU291cmNlPEVtcGxveWVlPiA9IHtcXG4gICAgZ2V0Um93czogYXN5bmMgKHBhcmFtczogR3JpZEdldFJvd3NQYXJhbXMpID0+IHtcXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA2MDApKTtcXG5cXG4gICAgICAgIGNvbnN0IHsgc3RhcnRSb3csIGVuZFJvdywgc29ydE1vZGVsIH0gPSBwYXJhbXM7XFxuICAgICAgICBjb25zdCByb3dzID0gWy4uLmFsbEVtcGxveWVlc107XFxuXFxuICAgICAgICBpZiAoc29ydE1vZGVsLmxlbmd0aCA+IDApIHtcXG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkLCBzb3J0IH0gPSBzb3J0TW9kZWxbMF07XFxuICAgICAgICAgICAgcm93cy5zb3J0KChhLCBiKSA9PiB7XFxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbEEgPSBhW2ZpZWxkXTtcXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsQiA9IGJbZmllbGRdO1xcbiAgICAgICAgICAgICAgICBjb25zdCBjbXAgPSB0eXBlb2YgdmFsQSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbEIgPT09ICdudW1iZXInXFxuICAgICAgICAgICAgICAgICAgICA/IHZhbEEgLSB2YWxCXFxuICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyh2YWxBID8/ICcnKS5sb2NhbGVDb21wYXJlKFN0cmluZyh2YWxCID8/ICcnKSk7XFxuICAgICAgICAgICAgICAgIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IGNtcCA6IC1jbXA7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9XFxuXFxuICAgICAgICByZXR1cm4geyByb3dzOiByb3dzLnNsaWNlKHN0YXJ0Um93LCBlbmRSb3cpLCByb3dDb3VudDogcm93cy5sZW5ndGggfTtcXG4gICAgfVxcbn07XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGF6eUxvYWRpbmdFeGFtcGxlKCkge1xcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGU8R3JpZFBhZ2luYXRpb25Nb2RlbD4oe1xcbiAgICAgICAgcGFnZTogMCxcXG4gICAgICAgIHBhZ2VTaXplOiAxMDBcXG4gICAgfSk7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJMYXp5IExvYWRpbmdcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkxvYWQgcm93cyBpbiBiYXRjaGVzIGFzIHRoZSB1c2VyIHNjcm9sbHMsIHdpdGggYW5pbWF0ZWQgc2tlbGV0b24gcGxhY2Vob2xkZXIgcm93cyBkdXJpbmcgZmV0Y2guIENvbWJpbmUgd2l0aCBzZXJ2ZXItc2lkZSBkYXRhIHNvdXJjZXMgZm9yIHNjYWxhYmxlIGxpc3QgcmVuZGVyaW5nLlxcXCJcXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxEYXRhR3JpZFxcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICByb3dzPXtbXX1cXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZT17bW9ja0RhdGFTb3VyY2V9XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGU9XFxcInNlcnZlclxcXCJcXG4gICAgICAgICAgICAgICAgc29ydGluZ01vZGU9XFxcInNlcnZlclxcXCJcXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGVsPXtwYWdpbmF0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzUwLCAxMDAsIDIwMF19XFxuICAgICAgICAgICAgICAgIHJvd0hlaWdodD17NTJ9XFxuICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NTZ9XFxuICAgICAgICAgICAgICAgIGhlaWdodD17NDAwfVxcbiAgICAgICAgICAgIC8+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERhdGFHcmlkIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCB7IEdyaWRDb2xEZWYsIEdyaWREYXRhU291cmNlLCBHcmlkR2V0Um93c1BhcmFtcywgR3JpZFJvd01vZGVsLCBHcmlkUGFnaW5hdGlvbk1vZGVsIH0gZnJvbSAnLi4vLi4vLi4vbGliL3R5cGVzJztcbmltcG9ydCAnLi9MYXp5TG9hZGluZy5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0xhenlMb2FkaW5nLnRzeD9yYXcnO1xuXG5pbnRlcmZhY2UgRW1wbG95ZWUgZXh0ZW5kcyBHcmlkUm93TW9kZWwge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVtYWlsOiBzdHJpbmc7XG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xuICAgIHNhbGFyeTogbnVtYmVyO1xufVxuXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xuICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA5MCwgYWxpZ246ICdjZW50ZXInLCBoZWFkZXJBbGlnbjogJ2NlbnRlcicgfSxcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDIwMCwgc29ydGFibGU6IHRydWUgfSxcbiAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjgwLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgIHsgZmllbGQ6ICdkZXBhcnRtZW50JywgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLCB3aWR0aDogMTYwIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdTYWxhcnknLFxuICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHApID0+IHAudmFsdWUgIT0gbnVsbCA/IGAkJHtOdW1iZXIocC52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKX1gIDogJydcbiAgICB9XG5dO1xuXG5jb25zdCBERVBBUlRNRU5UUyA9IFsnRW5naW5lZXJpbmcnLCAnTWFya2V0aW5nJywgJ1NhbGVzJywgJ0hSJywgJ0ZpbmFuY2UnLCAnT3BlcmF0aW9ucyddO1xuY29uc3QgYWxsRW1wbG95ZWVzOiBFbXBsb3llZVtdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTUwMDAgfSwgKF8sIGkpID0+ICh7XG4gICAgaWQ6IGkgKyAxLFxuICAgIG5hbWU6IGBFbXBsb3llZSAke2kgKyAxfWAsXG4gICAgZW1haWw6IGBlbXBsb3llZSR7aSArIDF9QGNvbXBhbnkuY29tYCxcbiAgICBkZXBhcnRtZW50OiBERVBBUlRNRU5UU1tpICUgREVQQVJUTUVOVFMubGVuZ3RoXSxcbiAgICBzYWxhcnk6IDUwMDAwICsgKGkgJSAxMDApICogNTAwLFxufSkpO1xuXG5jb25zdCBtb2NrRGF0YVNvdXJjZTogR3JpZERhdGFTb3VyY2U8RW1wbG95ZWU+ID0ge1xuICAgIGdldFJvd3M6IGFzeW5jIChwYXJhbXM6IEdyaWRHZXRSb3dzUGFyYW1zKSA9PiB7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA2MDApKTtcblxuICAgICAgICBjb25zdCB7IHN0YXJ0Um93LCBlbmRSb3csIHNvcnRNb2RlbCB9ID0gcGFyYW1zO1xuICAgICAgICBjb25zdCByb3dzID0gWy4uLmFsbEVtcGxveWVlc107XG5cbiAgICAgICAgaWYgKHNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkLCBzb3J0IH0gPSBzb3J0TW9kZWxbMF07XG4gICAgICAgICAgICByb3dzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWxBID0gYVtmaWVsZF07XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsQiA9IGJbZmllbGRdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNtcCA9IHR5cGVvZiB2YWxBID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdmFsQiA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgPyB2YWxBIC0gdmFsQlxuICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyh2YWxBID8/ICcnKS5sb2NhbGVDb21wYXJlKFN0cmluZyh2YWxCID8/ICcnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gY21wIDogLWNtcDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgcm93czogcm93cy5zbGljZShzdGFydFJvdywgZW5kUm93KSwgcm93Q291bnQ6IHJvd3MubGVuZ3RoIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGF6eUxvYWRpbmdFeGFtcGxlKCkge1xuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUGFnaW5hdGlvbk1vZGVsPih7XG4gICAgICAgIHBhZ2U6IDAsXG4gICAgICAgIHBhZ2VTaXplOiAxMDBcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkxhenkgTG9hZGluZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIkxvYWQgcm93cyBpbiBiYXRjaGVzIGFzIHRoZSB1c2VyIHNjcm9sbHMsIHdpdGggYW5pbWF0ZWQgc2tlbGV0b24gcGxhY2Vob2xkZXIgcm93cyBkdXJpbmcgZmV0Y2guIENvbWJpbmUgd2l0aCBzZXJ2ZXItc2lkZSBkYXRhIHNvdXJjZXMgZm9yIHNjYWxhYmxlIGxpc3QgcmVuZGVyaW5nLlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIHJvd3M9e1tdfVxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U9e21vY2tEYXRhU291cmNlfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZT1cInNlcnZlclwiXG4gICAgICAgICAgICAgICAgc29ydGluZ01vZGU9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbNTAsIDEwMCwgMjAwXX1cbiAgICAgICAgICAgICAgICByb3dIZWlnaHQ9ezUyfVxuICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NTZ9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiY29sdW1ucyIsInAiLCJERVBBUlRNRU5UUyIsImFsbEVtcGxveWVlcyIsIl8iLCJpIiwibW9ja0RhdGFTb3VyY2UiLCJwYXJhbXMiLCJyZXNvbHZlIiwic3RhcnRSb3ciLCJlbmRSb3ciLCJzb3J0TW9kZWwiLCJyb3dzIiwiZmllbGQiLCJzb3J0IiwiYSIsImIiLCJ2YWxBIiwidmFsQiIsImNtcCIsIkxhenlMb2FkaW5nRXhhbXBsZSIsInBhZ2luYXRpb25Nb2RlbCIsInNldFBhZ2luYXRpb25Nb2RlbCIsInVzZVN0YXRlIiwianN4IiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIl0sIm1hcHBpbmdzIjoiK0lBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQ2dCVEMsRUFBa0MsQ0FDcEMsQ0FBRSxNQUFPLEtBQU0sV0FBWSxLQUFNLE1BQU8sR0FBSSxNQUFPLFNBQVUsWUFBYSxRQUFBLEVBQzFFLENBQUUsTUFBTyxPQUFRLFdBQVksT0FBUSxNQUFPLElBQUssU0FBVSxFQUFBLEVBQzNELENBQUUsTUFBTyxRQUFTLFdBQVksUUFBUyxNQUFPLElBQUssU0FBVSxFQUFBLEVBQzdELENBQUUsTUFBTyxhQUFjLFdBQVksYUFBYyxNQUFPLEdBQUEsRUFDeEQsQ0FDSSxNQUFPLFNBQ1AsV0FBWSxTQUNaLE1BQU8sSUFDUCxLQUFNLFNBQ04sTUFBTyxRQUNQLFlBQWEsUUFDYixlQUFpQkMsR0FBTUEsRUFBRSxPQUFTLEtBQU8sSUFBSSxPQUFPQSxFQUFFLEtBQUssRUFBRSxlQUFBLENBQWdCLEdBQUssRUFBQSxDQUUxRixFQUVNQyxFQUFjLENBQUMsY0FBZSxZQUFhLFFBQVMsS0FBTSxVQUFXLFlBQVksRUFDakZDLEVBQTJCLE1BQU0sS0FBSyxDQUFFLE9BQVEsTUFBUyxDQUFDQyxFQUFHQyxLQUFPLENBQ3RFLEdBQUlBLEVBQUksRUFDUixLQUFNLFlBQVlBLEVBQUksQ0FBQyxHQUN2QixNQUFPLFdBQVdBLEVBQUksQ0FBQyxlQUN2QixXQUFZSCxFQUFZRyxFQUFJSCxFQUFZLE1BQU0sRUFDOUMsT0FBUSxJQUFTRyxFQUFJLElBQU8sR0FDaEMsRUFBRSxFQUVJQyxFQUEyQyxDQUM3QyxRQUFTLE1BQU9DLEdBQThCLENBQzFDLE1BQU0sSUFBSSxRQUFRQyxHQUFXLFdBQVdBLEVBQVMsR0FBRyxDQUFDLEVBRXJELEtBQU0sQ0FBRSxTQUFBQyxFQUFVLE9BQUFDLEVBQVEsVUFBQUMsQ0FBQSxFQUFjSixFQUNsQ0ssRUFBTyxDQUFDLEdBQUdULENBQVksRUFFN0IsR0FBSVEsRUFBVSxPQUFTLEVBQUcsQ0FDdEIsS0FBTSxDQUFFLE1BQUFFLEVBQU8sS0FBQUMsR0FBU0gsRUFBVSxDQUFDLEVBQ25DQyxFQUFLLEtBQUssQ0FBQ0csRUFBR0MsSUFBTSxDQUNoQixNQUFNQyxFQUFPRixFQUFFRixDQUFLLEVBQ2RLLEVBQU9GLEVBQUVILENBQUssRUFDZE0sRUFBTSxPQUFPRixHQUFTLFVBQVksT0FBT0MsR0FBUyxTQUNsREQsRUFBT0MsRUFDUCxPQUFPRCxHQUFRLEVBQUUsRUFBRSxjQUFjLE9BQU9DLEdBQVEsRUFBRSxDQUFDLEVBQ3pELE9BQU9KLElBQVMsTUFBUUssRUFBTSxDQUFDQSxDQUNuQyxDQUFDLENBQ0wsQ0FFQSxNQUFPLENBQUUsS0FBTVAsRUFBSyxNQUFNSCxFQUFVQyxDQUFNLEVBQUcsU0FBVUUsRUFBSyxNQUFBLENBQ2hFLENBQ0osRUFFQSxTQUF3QlEsR0FBcUIsQ0FDekMsS0FBTSxDQUFDQyxFQUFpQkMsQ0FBa0IsRUFBSUMsV0FBOEIsQ0FDeEUsS0FBTSxFQUNOLFNBQVUsR0FBQSxDQUNiLEVBRUQsT0FDSUMsRUFBQUEsSUFBQ0MsRUFBQSxDQUNHLE1BQU0sZUFDTixZQUFZLHFLQUNaLFdBQUExQixFQUVBLFNBQUF5QixFQUFBQSxJQUFDRSxFQUFBLENBQ0csUUFBQTFCLEVBQ0EsS0FBTSxDQUFBLEVBQ04sV0FBWU0sRUFDWixXQUFVLEdBQ1YsZUFBZSxTQUNmLFlBQVksU0FDWixnQkFBQWUsRUFDQSx3QkFBeUJDLEVBQ3pCLGdCQUFpQixDQUFDLEdBQUksSUFBSyxHQUFHLEVBQzlCLFVBQVcsR0FDWCxhQUFjLEdBQ2QsT0FBUSxHQUFBLENBQUEsQ0FDWixDQUFBLENBR1oifQ==
