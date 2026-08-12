import{r as p,j as l}from"./vendor-react-LmGMyLnN.js";import{D as u}from"./opengridx-DRbmQSJO.js";import{D as h}from"./DocsLayout-BoGj89NG.js";const w=`
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
                if (valA < valB) return sort === 'asc' ? -1 : 1;
                if (valA > valB) return sort === 'asc' ? 1 : -1;
                return 0;
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
`,f=[{field:"id",headerName:"ID",width:90,align:"center",headerAlign:"center"},{field:"name",headerName:"Name",width:200,sortable:!0},{field:"email",headerName:"Email",width:280,sortable:!0},{field:"department",headerName:"Department",width:160},{field:"salary",headerName:"Salary",width:140,type:"number",align:"right",headerAlign:"right",valueFormatter:n=>n.value!=null?`$${Number(n.value).toLocaleString()}`:""}],d=["Engineering","Marketing","Sales","HR","Finance","Operations"],y=Array.from({length:15e3},(n,e)=>({id:e+1,name:`Employee ${e+1}`,email:`employee${e+1}@company.com`,department:d[e%d.length],salary:5e4+e%100*500})),M={getRows:async n=>{await new Promise(a=>setTimeout(a,600));const{startRow:e,endRow:m,sortModel:o}=n,t=[...y];if(o.length>0){const{field:a,sort:r}=o[0];t.sort((c,g)=>{const i=c[a],s=g[a];return i<s?r==="asc"?-1:1:i>s?r==="asc"?1:-1:0})}return{rows:t.slice(e,m),rowCount:t.length}}};function v(){const[n,e]=p.useState({page:0,pageSize:100});return l.jsx(h,{title:"Lazy Loading",description:"Load rows in batches as the user scrolls, with animated skeleton placeholder rows during fetch. Combine with server-side data sources for scalable list rendering.",sourceCode:w,children:l.jsx(u,{columns:f,rows:[],dataSource:M,pagination:!0,paginationMode:"server",sortingMode:"server",paginationModel:n,onPaginationModelChange:e,pageSizeOptions:[50,100,200],rowHeight:52,headerHeight:56,height:400})})}export{v as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF6eUxvYWRpbmctRDhacklRaWouanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL0xhenlMb2FkaW5nL0xhenlMb2FkaW5nLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9MYXp5TG9hZGluZy9MYXp5TG9hZGluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgR3JpZENvbERlZiwgR3JpZERhdGFTb3VyY2UsIEdyaWRHZXRSb3dzUGFyYW1zLCBHcmlkUm93TW9kZWwsIEdyaWRQYWdpbmF0aW9uTW9kZWwgfSBmcm9tICcuLi8uLi8uLi9saWIvdHlwZXMnO1xcbmltcG9ydCAnLi9MYXp5TG9hZGluZy5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vTGF6eUxvYWRpbmcudHN4P3Jhdyc7XFxuXFxuaW50ZXJmYWNlIEVtcGxveWVlIGV4dGVuZHMgR3JpZFJvd01vZGVsIHtcXG4gICAgaWQ6IG51bWJlcjtcXG4gICAgbmFtZTogc3RyaW5nO1xcbiAgICBlbWFpbDogc3RyaW5nO1xcbiAgICBkZXBhcnRtZW50OiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbn1cXG5cXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogOTAsIGFsaWduOiAnY2VudGVyJywgaGVhZGVyQWxpZ246ICdjZW50ZXInIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMjAwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjgwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE2MCB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcXG4gICAgICAgIHdpZHRoOiAxNDAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHApID0+IHAudmFsdWUgIT0gbnVsbCA/IGAkJHtOdW1iZXIocC52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKX1gIDogJydcXG4gICAgfVxcbl07XFxuXFxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ01hcmtldGluZycsICdTYWxlcycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcXG5jb25zdCBhbGxFbXBsb3llZXM6IEVtcGxveWVlW10gPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxNTAwMCB9LCAoXywgaSkgPT4gKHtcXG4gICAgaWQ6IGkgKyAxLFxcbiAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICBlbWFpbDogYGVtcGxveWVlJHtpICsgMX1AY29tcGFueS5jb21gLFxcbiAgICBkZXBhcnRtZW50OiBERVBBUlRNRU5UU1tpICUgREVQQVJUTUVOVFMubGVuZ3RoXSxcXG4gICAgc2FsYXJ5OiA1MDAwMCArIChpICUgMTAwKSAqIDUwMCxcXG59KSk7XFxuXFxuY29uc3QgbW9ja0RhdGFTb3VyY2U6IEdyaWREYXRhU291cmNlPEVtcGxveWVlPiA9IHtcXG4gICAgZ2V0Um93czogYXN5bmMgKHBhcmFtczogR3JpZEdldFJvd3NQYXJhbXMpID0+IHtcXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA2MDApKTtcXG5cXG4gICAgICAgIGNvbnN0IHsgc3RhcnRSb3csIGVuZFJvdywgc29ydE1vZGVsIH0gPSBwYXJhbXM7XFxuICAgICAgICBjb25zdCByb3dzID0gWy4uLmFsbEVtcGxveWVlc107XFxuXFxuICAgICAgICBpZiAoc29ydE1vZGVsLmxlbmd0aCA+IDApIHtcXG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkLCBzb3J0IH0gPSBzb3J0TW9kZWxbMF07XFxuICAgICAgICAgICAgcm93cy5zb3J0KChhLCBiKSA9PiB7XFxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbEEgPSBhW2ZpZWxkXTtcXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsQiA9IGJbZmllbGRdO1xcbiAgICAgICAgICAgICAgICBpZiAodmFsQSA8IHZhbEIpIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IC0xIDogMTtcXG4gICAgICAgICAgICAgICAgaWYgKHZhbEEgPiB2YWxCKSByZXR1cm4gc29ydCA9PT0gJ2FzYycgPyAxIDogLTE7XFxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgcmV0dXJuIHsgcm93czogcm93cy5zbGljZShzdGFydFJvdywgZW5kUm93KSwgcm93Q291bnQ6IHJvd3MubGVuZ3RoIH07XFxuICAgIH1cXG59O1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIExhenlMb2FkaW5nRXhhbXBsZSgpIHtcXG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlPEdyaWRQYWdpbmF0aW9uTW9kZWw+KHtcXG4gICAgICAgIHBhZ2U6IDAsXFxuICAgICAgICBwYWdlU2l6ZTogMTAwXFxuICAgIH0pO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiTGF6eSBMb2FkaW5nXFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJMb2FkIHJvd3MgaW4gYmF0Y2hlcyBhcyB0aGUgdXNlciBzY3JvbGxzLCB3aXRoIGFuaW1hdGVkIHNrZWxldG9uIHBsYWNlaG9sZGVyIHJvd3MgZHVyaW5nIGZldGNoLiBDb21iaW5lIHdpdGggc2VydmVyLXNpZGUgZGF0YSBzb3VyY2VzIGZvciBzY2FsYWJsZSBsaXN0IHJlbmRlcmluZy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgcm93cz17W119XFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U9e21vY2tEYXRhU291cmNlfVxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlPVxcXCJzZXJ2ZXJcXFwiXFxuICAgICAgICAgICAgICAgIHNvcnRpbmdNb2RlPVxcXCJzZXJ2ZXJcXFwiXFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1s1MCwgMTAwLCAyMDBdfVxcbiAgICAgICAgICAgICAgICByb3dIZWlnaHQ9ezUyfVxcbiAgICAgICAgICAgICAgICBoZWFkZXJIZWlnaHQ9ezU2fVxcbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezQwMH1cXG4gICAgICAgICAgICAvPlxcbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxcbiAgICApO1xcbn1cXG5cIiIsIlxuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgeyBHcmlkQ29sRGVmLCBHcmlkRGF0YVNvdXJjZSwgR3JpZEdldFJvd3NQYXJhbXMsIEdyaWRSb3dNb2RlbCwgR3JpZFBhZ2luYXRpb25Nb2RlbCB9IGZyb20gJy4uLy4uLy4uL2xpYi90eXBlcyc7XG5pbXBvcnQgJy4vTGF6eUxvYWRpbmcuY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9MYXp5TG9hZGluZy50c3g/cmF3JztcblxuaW50ZXJmYWNlIEVtcGxveWVlIGV4dGVuZHMgR3JpZFJvd01vZGVsIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbWFpbDogc3RyaW5nO1xuICAgIGRlcGFydG1lbnQ6IHN0cmluZztcbiAgICBzYWxhcnk6IG51bWJlcjtcbn1cblxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogOTAsIGFsaWduOiAnY2VudGVyJywgaGVhZGVyQWxpZ246ICdjZW50ZXInIH0sXG4gICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAyMDAsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDI4MCwgc29ydGFibGU6IHRydWUgfSxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE2MCB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcbiAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwKSA9PiBwLnZhbHVlICE9IG51bGwgPyBgJCR7TnVtYmVyKHAudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCl9YCA6ICcnXG4gICAgfVxuXTtcblxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ01hcmtldGluZycsICdTYWxlcycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcbmNvbnN0IGFsbEVtcGxveWVlczogRW1wbG95ZWVbXSA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDE1MDAwIH0sIChfLCBpKSA9PiAoe1xuICAgIGlkOiBpICsgMSxcbiAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxuICAgIGVtYWlsOiBgZW1wbG95ZWUke2kgKyAxfUBjb21wYW55LmNvbWAsXG4gICAgZGVwYXJ0bWVudDogREVQQVJUTUVOVFNbaSAlIERFUEFSVE1FTlRTLmxlbmd0aF0sXG4gICAgc2FsYXJ5OiA1MDAwMCArIChpICUgMTAwKSAqIDUwMCxcbn0pKTtcblxuY29uc3QgbW9ja0RhdGFTb3VyY2U6IEdyaWREYXRhU291cmNlPEVtcGxveWVlPiA9IHtcbiAgICBnZXRSb3dzOiBhc3luYyAocGFyYW1zOiBHcmlkR2V0Um93c1BhcmFtcykgPT4ge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNjAwKSk7XG5cbiAgICAgICAgY29uc3QgeyBzdGFydFJvdywgZW5kUm93LCBzb3J0TW9kZWwgfSA9IHBhcmFtcztcbiAgICAgICAgY29uc3Qgcm93cyA9IFsuLi5hbGxFbXBsb3llZXNdO1xuXG4gICAgICAgIGlmIChzb3J0TW9kZWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZCwgc29ydCB9ID0gc29ydE1vZGVsWzBdO1xuICAgICAgICAgICAgcm93cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsQSA9IGFbZmllbGRdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbEIgPSBiW2ZpZWxkXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsQSA8IHZhbEIpIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBpZiAodmFsQSA+IHZhbEIpIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IDEgOiAtMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgcm93czogcm93cy5zbGljZShzdGFydFJvdywgZW5kUm93KSwgcm93Q291bnQ6IHJvd3MubGVuZ3RoIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGF6eUxvYWRpbmdFeGFtcGxlKCkge1xuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUGFnaW5hdGlvbk1vZGVsPih7XG4gICAgICAgIHBhZ2U6IDAsXG4gICAgICAgIHBhZ2VTaXplOiAxMDBcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkxhenkgTG9hZGluZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIkxvYWQgcm93cyBpbiBiYXRjaGVzIGFzIHRoZSB1c2VyIHNjcm9sbHMsIHdpdGggYW5pbWF0ZWQgc2tlbGV0b24gcGxhY2Vob2xkZXIgcm93cyBkdXJpbmcgZmV0Y2guIENvbWJpbmUgd2l0aCBzZXJ2ZXItc2lkZSBkYXRhIHNvdXJjZXMgZm9yIHNjYWxhYmxlIGxpc3QgcmVuZGVyaW5nLlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICAgICAgICAgIHJvd3M9e1tdfVxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U9e21vY2tEYXRhU291cmNlfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZT1cInNlcnZlclwiXG4gICAgICAgICAgICAgICAgc29ydGluZ01vZGU9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbNTAsIDEwMCwgMjAwXX1cbiAgICAgICAgICAgICAgICByb3dIZWlnaHQ9ezUyfVxuICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17NTZ9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiY29sdW1ucyIsInAiLCJERVBBUlRNRU5UUyIsImFsbEVtcGxveWVlcyIsIl8iLCJpIiwibW9ja0RhdGFTb3VyY2UiLCJwYXJhbXMiLCJyZXNvbHZlIiwic3RhcnRSb3ciLCJlbmRSb3ciLCJzb3J0TW9kZWwiLCJyb3dzIiwiZmllbGQiLCJzb3J0IiwiYSIsImIiLCJ2YWxBIiwidmFsQiIsIkxhenlMb2FkaW5nRXhhbXBsZSIsInBhZ2luYXRpb25Nb2RlbCIsInNldFBhZ2luYXRpb25Nb2RlbCIsInVzZVN0YXRlIiwianN4IiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIl0sIm1hcHBpbmdzIjoiK0lBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtB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
