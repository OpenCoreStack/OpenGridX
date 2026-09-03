import{r,j as c}from"./vendor-react-LmGMyLnN.js";import{D as S}from"./opengridx-BlrvTAzD.js";import{D}from"./DocsLayout-BoGj89NG.js";const M=`
import { useState, useMemo, useCallback } from 'react';
import { DataGrid, GridColDef, GridDataSource, GridGetRowsParams, GridPaginationModel } from '@opencorestack/opengridx';
import './InfiniteScrollDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './InfiniteScrollDemo.tsx?raw';

interface PersonRow {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    joined: string;
}

const TOTAL = 15000;
const mockServerData: PersonRow[] = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    name: \`Person \${i + 1}\`,
    email: \`person\${i + 1}@example.com\`,
    role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    joined: new Date(2020, 0, 1 + (i % 365)).toLocaleDateString(),
}));

const columns: GridColDef<PersonRow>[] = [
    { field: 'id', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'email', headerName: 'Email', width: 280, sortable: true },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'joined', headerName: 'Joined', width: 150 },
];

const EMPTY_ROWS: PersonRow[] = [];

export default function InfiniteScrollDemo() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 50,
    });

    const dataSource: GridDataSource<PersonRow> = useMemo(() => ({
        getRows: async (params: GridGetRowsParams) => {
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 400));

            const { startRow, endRow, sortModel } = params;
            const rows = [...mockServerData];

            if (sortModel && sortModel.length > 0) {
                const { field, sort } = sortModel[0];
                rows.sort((a: PersonRow, b: PersonRow) => {
                    const valA = a[field as keyof PersonRow] as string | number;
                    const valB = b[field as keyof PersonRow] as string | number;
                    if (valA < valB) return sort === 'asc' ? -1 : 1;
                    if (valA > valB) return sort === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            return {
                rows: rows.slice(startRow, endRow),
                rowCount: TOTAL,
            };
        }
    }), []);

    // When user scrolls to the bottom, increment page to fetch next chunk
    const handleScrollEnd = useCallback(() => {
        setPaginationModel(prev => ({ ...prev, page: prev.page + 1 }));
    }, []);

    return (
        <DocsLayout
            title="Infinite Scroll"
            description="Automatically fetch the next page of rows as the user scrolls toward the bottom. No pagination UI — the grid grows seamlessly as data loads."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={EMPTY_ROWS}
                columns={columns}
                dataSource={dataSource}
                paginationMode="infinite"
                sortingMode="server"
                pagination={false}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onRowsScrollEnd={handleScrollEnd}
                rowHeight={48}
                height={400}
            />
        </DocsLayout>
    );
}
`,m=15e3,R=Array.from({length:m},(n,e)=>({id:e+1,name:`Person ${e+1}`,email:`person${e+1}@example.com`,role:e%3===0?"Admin":e%3===1?"Editor":"Viewer",status:e%2===0?"Active":"Inactive",joined:new Date(2020,0,1+e%365).toLocaleDateString()})),P=[{field:"id",headerName:"ID",width:90,align:"center",headerAlign:"center"},{field:"name",headerName:"Name",width:200,sortable:!0},{field:"email",headerName:"Email",width:280,sortable:!0},{field:"role",headerName:"Role",width:120},{field:"status",headerName:"Status",width:120},{field:"joined",headerName:"Joined",width:150}],v=[];function b(){const[n,e]=r.useState({page:0,pageSize:50}),u=r.useMemo(()=>({getRows:async o=>{await new Promise(t=>setTimeout(t,400));const{startRow:w,endRow:h,sortModel:a}=o,i=[...R];if(a&&a.length>0){const{field:t,sort:s}=a[0];i.sort((f,p)=>{const l=f[t],d=p[t];return l<d?s==="asc"?-1:1:l>d?s==="asc"?1:-1:0})}return{rows:i.slice(w,h),rowCount:m}}}),[]),g=r.useCallback(()=>{e(o=>({...o,page:o.page+1}))},[]);return c.jsx(D,{title:"Infinite Scroll",description:"Automatically fetch the next page of rows as the user scrolls toward the bottom. No pagination UI — the grid grows seamlessly as data loads.",sourceCode:M,children:c.jsx(S,{rows:v,columns:P,dataSource:u,paginationMode:"infinite",sortingMode:"server",pagination:!1,paginationModel:n,onPaginationModelChange:e,onRowsScrollEnd:g,rowHeight:48,height:400})})}export{b as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5maW5pdGVTY3JvbGxEZW1vLUNlZzB3eGh6LmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9JbmZpbml0ZVNjcm9sbERlbW8vSW5maW5pdGVTY3JvbGxEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9JbmZpbml0ZVNjcm9sbERlbW8vSW5maW5pdGVTY3JvbGxEZW1vLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQgeyBEYXRhR3JpZCwgR3JpZENvbERlZiwgR3JpZERhdGFTb3VyY2UsIEdyaWRHZXRSb3dzUGFyYW1zLCBHcmlkUGFnaW5hdGlvbk1vZGVsIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5pbXBvcnQgJy4vSW5maW5pdGVTY3JvbGxEZW1vLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9JbmZpbml0ZVNjcm9sbERlbW8udHN4P3Jhdyc7XFxuXFxuaW50ZXJmYWNlIFBlcnNvblJvdyB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZW1haWw6IHN0cmluZztcXG4gICAgcm9sZTogc3RyaW5nO1xcbiAgICBzdGF0dXM6IHN0cmluZztcXG4gICAgam9pbmVkOiBzdHJpbmc7XFxufVxcblxcbmNvbnN0IFRPVEFMID0gMTUwMDA7XFxuY29uc3QgbW9ja1NlcnZlckRhdGE6IFBlcnNvblJvd1tdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogVE9UQUwgfSwgKF8sIGkpID0+ICh7XFxuICAgIGlkOiBpICsgMSxcXG4gICAgbmFtZTogYFBlcnNvbiAke2kgKyAxfWAsXFxuICAgIGVtYWlsOiBgcGVyc29uJHtpICsgMX1AZXhhbXBsZS5jb21gLFxcbiAgICByb2xlOiBpICUgMyA9PT0gMCA/ICdBZG1pbicgOiBpICUgMyA9PT0gMSA/ICdFZGl0b3InIDogJ1ZpZXdlcicsXFxuICAgIHN0YXR1czogaSAlIDIgPT09IDAgPyAnQWN0aXZlJyA6ICdJbmFjdGl2ZScsXFxuICAgIGpvaW5lZDogbmV3IERhdGUoMjAyMCwgMCwgMSArIChpICUgMzY1KSkudG9Mb2NhbGVEYXRlU3RyaW5nKCksXFxufSkpO1xcblxcbmNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWY8UGVyc29uUm93PltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogOTAsIGFsaWduOiAnY2VudGVyJywgaGVhZGVyQWxpZ246ICdjZW50ZXInIH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMjAwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjgwLCBzb3J0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAncm9sZScsIGhlYWRlck5hbWU6ICdSb2xlJywgd2lkdGg6IDEyMCB9LFxcbiAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHdpZHRoOiAxMjAgfSxcXG4gICAgeyBmaWVsZDogJ2pvaW5lZCcsIGhlYWRlck5hbWU6ICdKb2luZWQnLCB3aWR0aDogMTUwIH0sXFxuXTtcXG5cXG5jb25zdCBFTVBUWV9ST1dTOiBQZXJzb25Sb3dbXSA9IFtdO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEluZmluaXRlU2Nyb2xsRGVtbygpIHtcXG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlPEdyaWRQYWdpbmF0aW9uTW9kZWw+KHtcXG4gICAgICAgIHBhZ2U6IDAsXFxuICAgICAgICBwYWdlU2l6ZTogNTAsXFxuICAgIH0pO1xcblxcbiAgICBjb25zdCBkYXRhU291cmNlOiBHcmlkRGF0YVNvdXJjZTxQZXJzb25Sb3c+ID0gdXNlTWVtbygoKSA9PiAoe1xcbiAgICAgICAgZ2V0Um93czogYXN5bmMgKHBhcmFtczogR3JpZEdldFJvd3NQYXJhbXMpID0+IHtcXG4gICAgICAgICAgICAvLyBTaW11bGF0ZSBuZXR3b3JrIGxhdGVuY3lcXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNDAwKSk7XFxuXFxuICAgICAgICAgICAgY29uc3QgeyBzdGFydFJvdywgZW5kUm93LCBzb3J0TW9kZWwgfSA9IHBhcmFtcztcXG4gICAgICAgICAgICBjb25zdCByb3dzID0gWy4uLm1vY2tTZXJ2ZXJEYXRhXTtcXG5cXG4gICAgICAgICAgICBpZiAoc29ydE1vZGVsICYmIHNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XFxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZmllbGQsIHNvcnQgfSA9IHNvcnRNb2RlbFswXTtcXG4gICAgICAgICAgICAgICAgcm93cy5zb3J0KChhOiBQZXJzb25Sb3csIGI6IFBlcnNvblJvdykgPT4ge1xcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsQSA9IGFbZmllbGQgYXMga2V5b2YgUGVyc29uUm93XSBhcyBzdHJpbmcgfCBudW1iZXI7XFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWxCID0gYltmaWVsZCBhcyBrZXlvZiBQZXJzb25Sb3ddIGFzIHN0cmluZyB8IG51bWJlcjtcXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWxBIDwgdmFsQikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gLTEgOiAxO1xcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbEEgPiB2YWxCKSByZXR1cm4gc29ydCA9PT0gJ2FzYycgPyAxIDogLTE7XFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgfVxcblxcbiAgICAgICAgICAgIHJldHVybiB7XFxuICAgICAgICAgICAgICAgIHJvd3M6IHJvd3Muc2xpY2Uoc3RhcnRSb3csIGVuZFJvdyksXFxuICAgICAgICAgICAgICAgIHJvd0NvdW50OiBUT1RBTCxcXG4gICAgICAgICAgICB9O1xcbiAgICAgICAgfVxcbiAgICB9KSwgW10pO1xcblxcbiAgICAvLyBXaGVuIHVzZXIgc2Nyb2xscyB0byB0aGUgYm90dG9tLCBpbmNyZW1lbnQgcGFnZSB0byBmZXRjaCBuZXh0IGNodW5rXFxuICAgIGNvbnN0IGhhbmRsZVNjcm9sbEVuZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcXG4gICAgICAgIHNldFBhZ2luYXRpb25Nb2RlbChwcmV2ID0+ICh7IC4uLnByZXYsIHBhZ2U6IHByZXYucGFnZSArIDEgfSkpO1xcbiAgICB9LCBbXSk7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJJbmZpbml0ZSBTY3JvbGxcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkF1dG9tYXRpY2FsbHkgZmV0Y2ggdGhlIG5leHQgcGFnZSBvZiByb3dzIGFzIHRoZSB1c2VyIHNjcm9sbHMgdG93YXJkIHRoZSBib3R0b20uIE5vIHBhZ2luYXRpb24gVUkg4oCUIHRoZSBncmlkIGdyb3dzIHNlYW1sZXNzbHkgYXMgZGF0YSBsb2Fkcy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17RU1QVFlfUk9XU31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZT17ZGF0YVNvdXJjZX1cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGU9XFxcImluZmluaXRlXFxcIlxcbiAgICAgICAgICAgICAgICBzb3J0aW5nTW9kZT1cXFwic2VydmVyXFxcIlxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uPXtmYWxzZX1cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGVsPXtwYWdpbmF0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgIG9uUm93c1Njcm9sbEVuZD17aGFuZGxlU2Nyb2xsRW5kfVxcbiAgICAgICAgICAgICAgICByb3dIZWlnaHQ9ezQ4fVxcbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezQwMH1cXG4gICAgICAgICAgICAvPlxcbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxcbiAgICApO1xcbn1cXG5cIiIsIlxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYsIEdyaWREYXRhU291cmNlLCBHcmlkR2V0Um93c1BhcmFtcywgR3JpZFBhZ2luYXRpb25Nb2RlbCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgJy4vSW5maW5pdGVTY3JvbGxEZW1vLmNzcyc7XG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vSW5maW5pdGVTY3JvbGxEZW1vLnRzeD9yYXcnO1xuXG5pbnRlcmZhY2UgUGVyc29uUm93IHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBlbWFpbDogc3RyaW5nO1xuICAgIHJvbGU6IHN0cmluZztcbiAgICBzdGF0dXM6IHN0cmluZztcbiAgICBqb2luZWQ6IHN0cmluZztcbn1cblxuY29uc3QgVE9UQUwgPSAxNTAwMDtcbmNvbnN0IG1vY2tTZXJ2ZXJEYXRhOiBQZXJzb25Sb3dbXSA9IEFycmF5LmZyb20oeyBsZW5ndGg6IFRPVEFMIH0sIChfLCBpKSA9PiAoe1xuICAgIGlkOiBpICsgMSxcbiAgICBuYW1lOiBgUGVyc29uICR7aSArIDF9YCxcbiAgICBlbWFpbDogYHBlcnNvbiR7aSArIDF9QGV4YW1wbGUuY29tYCxcbiAgICByb2xlOiBpICUgMyA9PT0gMCA/ICdBZG1pbicgOiBpICUgMyA9PT0gMSA/ICdFZGl0b3InIDogJ1ZpZXdlcicsXG4gICAgc3RhdHVzOiBpICUgMiA9PT0gMCA/ICdBY3RpdmUnIDogJ0luYWN0aXZlJyxcbiAgICBqb2luZWQ6IG5ldyBEYXRlKDIwMjAsIDAsIDEgKyAoaSAlIDM2NSkpLnRvTG9jYWxlRGF0ZVN0cmluZygpLFxufSkpO1xuXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPFBlcnNvblJvdz5bXSA9IFtcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogOTAsIGFsaWduOiAnY2VudGVyJywgaGVhZGVyQWxpZ246ICdjZW50ZXInIH0sXG4gICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAyMDAsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDI4MCwgc29ydGFibGU6IHRydWUgfSxcbiAgICB7IGZpZWxkOiAncm9sZScsIGhlYWRlck5hbWU6ICdSb2xlJywgd2lkdGg6IDEyMCB9LFxuICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDEyMCB9LFxuICAgIHsgZmllbGQ6ICdqb2luZWQnLCBoZWFkZXJOYW1lOiAnSm9pbmVkJywgd2lkdGg6IDE1MCB9LFxuXTtcblxuY29uc3QgRU1QVFlfUk9XUzogUGVyc29uUm93W10gPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSW5maW5pdGVTY3JvbGxEZW1vKCkge1xuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUGFnaW5hdGlvbk1vZGVsPih7XG4gICAgICAgIHBhZ2U6IDAsXG4gICAgICAgIHBhZ2VTaXplOiA1MCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRhdGFTb3VyY2U6IEdyaWREYXRhU291cmNlPFBlcnNvblJvdz4gPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIGdldFJvd3M6IGFzeW5jIChwYXJhbXM6IEdyaWRHZXRSb3dzUGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW11bGF0ZSBuZXR3b3JrIGxhdGVuY3lcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA0MDApKTtcblxuICAgICAgICAgICAgY29uc3QgeyBzdGFydFJvdywgZW5kUm93LCBzb3J0TW9kZWwgfSA9IHBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbLi4ubW9ja1NlcnZlckRhdGFdO1xuXG4gICAgICAgICAgICBpZiAoc29ydE1vZGVsICYmIHNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBmaWVsZCwgc29ydCB9ID0gc29ydE1vZGVsWzBdO1xuICAgICAgICAgICAgICAgIHJvd3Muc29ydCgoYTogUGVyc29uUm93LCBiOiBQZXJzb25Sb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsQSA9IGFbZmllbGQgYXMga2V5b2YgUGVyc29uUm93XSBhcyBzdHJpbmcgfCBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbEIgPSBiW2ZpZWxkIGFzIGtleW9mIFBlcnNvblJvd10gYXMgc3RyaW5nIHwgbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsQSA8IHZhbEIpIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbEEgPiB2YWxCKSByZXR1cm4gc29ydCA9PT0gJ2FzYycgPyAxIDogLTE7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJvd3M6IHJvd3Muc2xpY2Uoc3RhcnRSb3csIGVuZFJvdyksXG4gICAgICAgICAgICAgICAgcm93Q291bnQ6IFRPVEFMLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pLCBbXSk7XG5cbiAgICAvLyBXaGVuIHVzZXIgc2Nyb2xscyB0byB0aGUgYm90dG9tLCBpbmNyZW1lbnQgcGFnZSB0byBmZXRjaCBuZXh0IGNodW5rXG4gICAgY29uc3QgaGFuZGxlU2Nyb2xsRW5kID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRQYWdpbmF0aW9uTW9kZWwocHJldiA9PiAoeyAuLi5wcmV2LCBwYWdlOiBwcmV2LnBhZ2UgKyAxIH0pKTtcbiAgICB9LCBbXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RG9jc0xheW91dFxuICAgICAgICAgICAgdGl0bGU9XCJJbmZpbml0ZSBTY3JvbGxcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJBdXRvbWF0aWNhbGx5IGZldGNoIHRoZSBuZXh0IHBhZ2Ugb2Ygcm93cyBhcyB0aGUgdXNlciBzY3JvbGxzIHRvd2FyZCB0aGUgYm90dG9tLiBObyBwYWdpbmF0aW9uIFVJIOKAlCB0aGUgZ3JpZCBncm93cyBzZWFtbGVzc2x5IGFzIGRhdGEgbG9hZHMuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e0VNUFRZX1JPV1N9XG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICBkYXRhU291cmNlPXtkYXRhU291cmNlfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlPVwiaW5maW5pdGVcIlxuICAgICAgICAgICAgICAgIHNvcnRpbmdNb2RlPVwic2VydmVyXCJcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uUm93c1Njcm9sbEVuZD17aGFuZGxlU2Nyb2xsRW5kfVxuICAgICAgICAgICAgICAgIHJvd0hlaWdodD17NDh9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MDB9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiVE9UQUwiLCJtb2NrU2VydmVyRGF0YSIsIl8iLCJpIiwiY29sdW1ucyIsIkVNUFRZX1JPV1MiLCJJbmZpbml0ZVNjcm9sbERlbW8iLCJwYWdpbmF0aW9uTW9kZWwiLCJzZXRQYWdpbmF0aW9uTW9kZWwiLCJ1c2VTdGF0ZSIsImRhdGFTb3VyY2UiLCJ1c2VNZW1vIiwicGFyYW1zIiwicmVzb2x2ZSIsInN0YXJ0Um93IiwiZW5kUm93Iiwic29ydE1vZGVsIiwicm93cyIsImZpZWxkIiwic29ydCIsImEiLCJiIiwidmFsQSIsInZhbEIiLCJoYW5kbGVTY3JvbGxFbmQiLCJ1c2VDYWxsYmFjayIsInByZXYiLCJqc3giLCJEb2NzTGF5b3V0IiwiRGF0YUdyaWQiXSwibWFwcGluZ3MiOiJxSUFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtB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
