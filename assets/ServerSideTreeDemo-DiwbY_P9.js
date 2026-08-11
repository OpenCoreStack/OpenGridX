import{r as i,j as d}from"./vendor-react-LmGMyLnN.js";import{D as l}from"./opengridx-n2IDO9t6.js";import{D as m}from"./DocsLayout-BoGj89NG.js";const u=`
import { useState, useMemo, useCallback } from 'react';
import {
    DataGrid,
    GridColDef,
    GridRowModel,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,
} from '@opencorestack/opengridx';
import './ServerSideTreeDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ServerSideTreeDemo.tsx?raw';

interface MockServerRow extends GridRowModel {
    id: string;
    name: string;
    size: string;
    type: 'folder' | 'file';
    lastModified: string;
    path: string[];
    serverChildrenCount?: number;
}

const generateData = (path: string[]): MockServerRow[] => {
    const parentPath = path.join('/');
    const count = 5;
    const rows: MockServerRow[] = [];

    for (let i = 0; i < count; i++) {
        const isFolder = i < 2;
        const name = isFolder ? \`Folder \${parentPath}-\${i}\` : \`File \${parentPath}-\${i}\`;
        const id = parentPath ? \`\${parentPath}/\${name}\` : name;

        rows.push({
            id,
            name,
            size: isFolder ? '--' : \`\${Math.floor(Math.random() * 100)} KB\`,
            type: isFolder ? 'folder' : 'file',
            lastModified: new Date().toISOString().split('T')[0],
            path: [...path, name],
            serverChildrenCount: isFolder ? 5 : 0
        });
    }
    return rows;
};

const mockServer = {
    getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse<MockServerRow>> => {
        console.log('Server Request:', params);
        await new Promise(resolve => setTimeout(resolve, 500));
        const { groupKeys } = params;
        const rows = generateData(groupKeys);
        return {
            rows,
            rowCount: 100
        };
    }
};

export function ServerSideTreeDemo() {
    const [rows] = useState<GridRowModel[]>([]);

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 250 },
        { field: 'size', headerName: 'Size', width: 100 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'lastModified', headerName: 'Last Modified', width: 150 }
    ];

    const dataSource: GridDataSource = useMemo(() => {
        return {
            getRows: (params) => mockServer.getRows(params)
        };
    }, []);

    const getTreeDataPath = useCallback((row: GridRowModel) => {
        return (row as MockServerRow).path;
    }, []);

    return (
        <DocsLayout
            title="Server-Side Tree"
            description="Tree data with lazy server-side child fetching. Child nodes are loaded on demand when the user expands a parent row."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                dataSource={dataSource}
                treeData
                getTreeDataPath={getTreeDataPath}
                groupingColDef={{ field: 'name', headerName: 'File System', width: 300 }}
                paginationMode="server"
                rowCount={100}
                height={600}
            />
        </DocsLayout>
    );
}
`,h=r=>{const n=r.join("/"),t=5,o=[];for(let e=0;e<t;e++){const a=e<2,s=a?`Folder ${n}-${e}`:`File ${n}-${e}`,c=n?`${n}/${s}`:s;o.push({id:c,name:s,size:a?"--":`${Math.floor(Math.random()*100)} KB`,type:a?"folder":"file",lastModified:new Date().toISOString().split("T")[0],path:[...r,s],serverChildrenCount:a?5:0})}return o},w={getRows:async r=>{console.log("Server Request:",r),await new Promise(o=>setTimeout(o,500));const{groupKeys:n}=r;return{rows:h(n),rowCount:100}}};function g(){const[r]=i.useState([]),n=[{field:"name",headerName:"Name",width:250},{field:"size",headerName:"Size",width:100},{field:"type",headerName:"Type",width:100},{field:"lastModified",headerName:"Last Modified",width:150}],t=i.useMemo(()=>({getRows:e=>w.getRows(e)}),[]),o=i.useCallback(e=>e.path,[]);return d.jsx(m,{title:"Server-Side Tree",description:"Tree data with lazy server-side child fetching. Child nodes are loaded on demand when the user expands a parent row.",sourceCode:u,children:d.jsx(l,{rows:r,columns:n,dataSource:t,treeData:!0,getTreeDataPath:o,groupingColDef:{field:"name",headerName:"File System",width:300},paginationMode:"server",rowCount:100,height:600})})}export{g as ServerSideTreeDemo};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyU2lkZVRyZWVEZW1vLURpd2JZX1A5LmpzIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlcy9TZXJ2ZXJTaWRlVHJlZURlbW8vU2VydmVyU2lkZVRyZWVEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9TZXJ2ZXJTaWRlVHJlZURlbW8vU2VydmVyU2lkZVRyZWVEZW1vLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcIlxcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQge1xcbiAgICBEYXRhR3JpZCxcXG4gICAgR3JpZENvbERlZixcXG4gICAgR3JpZFJvd01vZGVsLFxcbiAgICBHcmlkRGF0YVNvdXJjZSxcXG4gICAgR3JpZEdldFJvd3NQYXJhbXMsXFxuICAgIEdyaWRHZXRSb3dzUmVzcG9uc2UsXFxufSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9TZXJ2ZXJTaWRlVHJlZURlbW8uY3NzJztcXG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcXG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL1NlcnZlclNpZGVUcmVlRGVtby50c3g/cmF3JztcXG5cXG5pbnRlcmZhY2UgTW9ja1NlcnZlclJvdyBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XFxuICAgIGlkOiBzdHJpbmc7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgc2l6ZTogc3RyaW5nO1xcbiAgICB0eXBlOiAnZm9sZGVyJyB8ICdmaWxlJztcXG4gICAgbGFzdE1vZGlmaWVkOiBzdHJpbmc7XFxuICAgIHBhdGg6IHN0cmluZ1tdO1xcbiAgICBzZXJ2ZXJDaGlsZHJlbkNvdW50PzogbnVtYmVyO1xcbn1cXG5cXG5jb25zdCBnZW5lcmF0ZURhdGEgPSAocGF0aDogc3RyaW5nW10pOiBNb2NrU2VydmVyUm93W10gPT4ge1xcbiAgICBjb25zdCBwYXJlbnRQYXRoID0gcGF0aC5qb2luKCcvJyk7XFxuICAgIGNvbnN0IGNvdW50ID0gNTtcXG4gICAgY29uc3Qgcm93czogTW9ja1NlcnZlclJvd1tdID0gW107XFxuXFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xcbiAgICAgICAgY29uc3QgaXNGb2xkZXIgPSBpIDwgMjtcXG4gICAgICAgIGNvbnN0IG5hbWUgPSBpc0ZvbGRlciA/IGBGb2xkZXIgJHtwYXJlbnRQYXRofS0ke2l9YCA6IGBGaWxlICR7cGFyZW50UGF0aH0tJHtpfWA7XFxuICAgICAgICBjb25zdCBpZCA9IHBhcmVudFBhdGggPyBgJHtwYXJlbnRQYXRofS8ke25hbWV9YCA6IG5hbWU7XFxuXFxuICAgICAgICByb3dzLnB1c2goe1xcbiAgICAgICAgICAgIGlkLFxcbiAgICAgICAgICAgIG5hbWUsXFxuICAgICAgICAgICAgc2l6ZTogaXNGb2xkZXIgPyAnLS0nIDogYCR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKX0gS0JgLFxcbiAgICAgICAgICAgIHR5cGU6IGlzRm9sZGVyID8gJ2ZvbGRlcicgOiAnZmlsZScsXFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGF0aCwgbmFtZV0sXFxuICAgICAgICAgICAgc2VydmVyQ2hpbGRyZW5Db3VudDogaXNGb2xkZXIgPyA1IDogMFxcbiAgICAgICAgfSk7XFxuICAgIH1cXG4gICAgcmV0dXJuIHJvd3M7XFxufTtcXG5cXG5jb25zdCBtb2NrU2VydmVyID0ge1xcbiAgICBnZXRSb3dzOiBhc3luYyAocGFyYW1zOiBHcmlkR2V0Um93c1BhcmFtcyk6IFByb21pc2U8R3JpZEdldFJvd3NSZXNwb25zZTxNb2NrU2VydmVyUm93Pj4gPT4ge1xcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZlciBSZXF1ZXN0OicsIHBhcmFtcyk7XFxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XFxuICAgICAgICBjb25zdCB7IGdyb3VwS2V5cyB9ID0gcGFyYW1zO1xcbiAgICAgICAgY29uc3Qgcm93cyA9IGdlbmVyYXRlRGF0YShncm91cEtleXMpO1xcbiAgICAgICAgcmV0dXJuIHtcXG4gICAgICAgICAgICByb3dzLFxcbiAgICAgICAgICAgIHJvd0NvdW50OiAxMDBcXG4gICAgICAgIH07XFxuICAgIH1cXG59O1xcblxcbmV4cG9ydCBmdW5jdGlvbiBTZXJ2ZXJTaWRlVHJlZURlbW8oKSB7XFxuICAgIGNvbnN0IFtyb3dzXSA9IHVzZVN0YXRlPEdyaWRSb3dNb2RlbFtdPihbXSk7XFxuXFxuICAgIGNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWZbXSA9IFtcXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMjUwIH0sXFxuICAgICAgICB7IGZpZWxkOiAnc2l6ZScsIGhlYWRlck5hbWU6ICdTaXplJywgd2lkdGg6IDEwMCB9LFxcbiAgICAgICAgeyBmaWVsZDogJ3R5cGUnLCBoZWFkZXJOYW1lOiAnVHlwZScsIHdpZHRoOiAxMDAgfSxcXG4gICAgICAgIHsgZmllbGQ6ICdsYXN0TW9kaWZpZWQnLCBoZWFkZXJOYW1lOiAnTGFzdCBNb2RpZmllZCcsIHdpZHRoOiAxNTAgfVxcbiAgICBdO1xcblxcbiAgICBjb25zdCBkYXRhU291cmNlOiBHcmlkRGF0YVNvdXJjZSA9IHVzZU1lbW8oKCkgPT4ge1xcbiAgICAgICAgcmV0dXJuIHtcXG4gICAgICAgICAgICBnZXRSb3dzOiAocGFyYW1zKSA9PiBtb2NrU2VydmVyLmdldFJvd3MocGFyYW1zKVxcbiAgICAgICAgfTtcXG4gICAgfSwgW10pO1xcblxcbiAgICBjb25zdCBnZXRUcmVlRGF0YVBhdGggPSB1c2VDYWxsYmFjaygocm93OiBHcmlkUm93TW9kZWwpID0+IHtcXG4gICAgICAgIHJldHVybiAocm93IGFzIE1vY2tTZXJ2ZXJSb3cpLnBhdGg7XFxuICAgIH0sIFtdKTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIlNlcnZlci1TaWRlIFRyZWVcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIlRyZWUgZGF0YSB3aXRoIGxhenkgc2VydmVyLXNpZGUgY2hpbGQgZmV0Y2hpbmcuIENoaWxkIG5vZGVzIGFyZSBsb2FkZWQgb24gZGVtYW5kIHdoZW4gdGhlIHVzZXIgZXhwYW5kcyBhIHBhcmVudCByb3cuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPERhdGFHcmlkXFxuICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XFxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U9e2RhdGFTb3VyY2V9XFxuICAgICAgICAgICAgICAgIHRyZWVEYXRhXFxuICAgICAgICAgICAgICAgIGdldFRyZWVEYXRhUGF0aD17Z2V0VHJlZURhdGFQYXRofVxcbiAgICAgICAgICAgICAgICBncm91cGluZ0NvbERlZj17eyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnRmlsZSBTeXN0ZW0nLCB3aWR0aDogMzAwIH19XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlPVxcXCJzZXJ2ZXJcXFwiXFxuICAgICAgICAgICAgICAgIHJvd0NvdW50PXsxMDB9XFxuICAgICAgICAgICAgICAgIGhlaWdodD17NjAwfVxcbiAgICAgICAgICAgIC8+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICAgIERhdGFHcmlkLFxuICAgIEdyaWRDb2xEZWYsXG4gICAgR3JpZFJvd01vZGVsLFxuICAgIEdyaWREYXRhU291cmNlLFxuICAgIEdyaWRHZXRSb3dzUGFyYW1zLFxuICAgIEdyaWRHZXRSb3dzUmVzcG9uc2UsXG59IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgJy4vU2VydmVyU2lkZVRyZWVEZW1vLmNzcyc7XG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vU2VydmVyU2lkZVRyZWVEZW1vLnRzeD9yYXcnO1xuXG5pbnRlcmZhY2UgTW9ja1NlcnZlclJvdyBleHRlbmRzIEdyaWRSb3dNb2RlbCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgc2l6ZTogc3RyaW5nO1xuICAgIHR5cGU6ICdmb2xkZXInIHwgJ2ZpbGUnO1xuICAgIGxhc3RNb2RpZmllZDogc3RyaW5nO1xuICAgIHBhdGg6IHN0cmluZ1tdO1xuICAgIHNlcnZlckNoaWxkcmVuQ291bnQ/OiBudW1iZXI7XG59XG5cbmNvbnN0IGdlbmVyYXRlRGF0YSA9IChwYXRoOiBzdHJpbmdbXSk6IE1vY2tTZXJ2ZXJSb3dbXSA9PiB7XG4gICAgY29uc3QgcGFyZW50UGF0aCA9IHBhdGguam9pbignLycpO1xuICAgIGNvbnN0IGNvdW50ID0gNTtcbiAgICBjb25zdCByb3dzOiBNb2NrU2VydmVyUm93W10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpc0ZvbGRlciA9IGkgPCAyO1xuICAgICAgICBjb25zdCBuYW1lID0gaXNGb2xkZXIgPyBgRm9sZGVyICR7cGFyZW50UGF0aH0tJHtpfWAgOiBgRmlsZSAke3BhcmVudFBhdGh9LSR7aX1gO1xuICAgICAgICBjb25zdCBpZCA9IHBhcmVudFBhdGggPyBgJHtwYXJlbnRQYXRofS8ke25hbWV9YCA6IG5hbWU7XG5cbiAgICAgICAgcm93cy5wdXNoKHtcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHNpemU6IGlzRm9sZGVyID8gJy0tJyA6IGAke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCl9IEtCYCxcbiAgICAgICAgICAgIHR5cGU6IGlzRm9sZGVyID8gJ2ZvbGRlcicgOiAnZmlsZScsXG4gICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhdGgsIG5hbWVdLFxuICAgICAgICAgICAgc2VydmVyQ2hpbGRyZW5Db3VudDogaXNGb2xkZXIgPyA1IDogMFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJvd3M7XG59O1xuXG5jb25zdCBtb2NrU2VydmVyID0ge1xuICAgIGdldFJvd3M6IGFzeW5jIChwYXJhbXM6IEdyaWRHZXRSb3dzUGFyYW1zKTogUHJvbWlzZTxHcmlkR2V0Um93c1Jlc3BvbnNlPE1vY2tTZXJ2ZXJSb3c+PiA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2ZXIgUmVxdWVzdDonLCBwYXJhbXMpO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICAgIGNvbnN0IHsgZ3JvdXBLZXlzIH0gPSBwYXJhbXM7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBnZW5lcmF0ZURhdGEoZ3JvdXBLZXlzKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJvd3MsXG4gICAgICAgICAgICByb3dDb3VudDogMTAwXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlcnZlclNpZGVUcmVlRGVtbygpIHtcbiAgICBjb25zdCBbcm93c10gPSB1c2VTdGF0ZTxHcmlkUm93TW9kZWxbXT4oW10pO1xuXG4gICAgY29uc3QgY29sdW1uczogR3JpZENvbERlZltdID0gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnc2l6ZScsIGhlYWRlck5hbWU6ICdTaXplJywgd2lkdGg6IDEwMCB9LFxuICAgICAgICB7IGZpZWxkOiAndHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgd2lkdGg6IDEwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnbGFzdE1vZGlmaWVkJywgaGVhZGVyTmFtZTogJ0xhc3QgTW9kaWZpZWQnLCB3aWR0aDogMTUwIH1cbiAgICBdO1xuXG4gICAgY29uc3QgZGF0YVNvdXJjZTogR3JpZERhdGFTb3VyY2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldFJvd3M6IChwYXJhbXMpID0+IG1vY2tTZXJ2ZXIuZ2V0Um93cyhwYXJhbXMpXG4gICAgICAgIH07XG4gICAgfSwgW10pO1xuXG4gICAgY29uc3QgZ2V0VHJlZURhdGFQYXRoID0gdXNlQ2FsbGJhY2soKHJvdzogR3JpZFJvd01vZGVsKSA9PiB7XG4gICAgICAgIHJldHVybiAocm93IGFzIE1vY2tTZXJ2ZXJSb3cpLnBhdGg7XG4gICAgfSwgW10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiU2VydmVyLVNpZGUgVHJlZVwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIlRyZWUgZGF0YSB3aXRoIGxhenkgc2VydmVyLXNpZGUgY2hpbGQgZmV0Y2hpbmcuIENoaWxkIG5vZGVzIGFyZSBsb2FkZWQgb24gZGVtYW5kIHdoZW4gdGhlIHVzZXIgZXhwYW5kcyBhIHBhcmVudCByb3cuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICBkYXRhU291cmNlPXtkYXRhU291cmNlfVxuICAgICAgICAgICAgICAgIHRyZWVEYXRhXG4gICAgICAgICAgICAgICAgZ2V0VHJlZURhdGFQYXRoPXtnZXRUcmVlRGF0YVBhdGh9XG4gICAgICAgICAgICAgICAgZ3JvdXBpbmdDb2xEZWY9e3sgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0ZpbGUgU3lzdGVtJywgd2lkdGg6IDMwMCB9fVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlPVwic2VydmVyXCJcbiAgICAgICAgICAgICAgICByb3dDb3VudD17MTAwfVxuICAgICAgICAgICAgICAgIGhlaWdodD17NjAwfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsImdlbmVyYXRlRGF0YSIsInBhdGgiLCJwYXJlbnRQYXRoIiwiY291bnQiLCJyb3dzIiwiaSIsImlzRm9sZGVyIiwibmFtZSIsImlkIiwibW9ja1NlcnZlciIsInBhcmFtcyIsInJlc29sdmUiLCJncm91cEtleXMiLCJTZXJ2ZXJTaWRlVHJlZURlbW8iLCJ1c2VTdGF0ZSIsImNvbHVtbnMiLCJkYXRhU291cmNlIiwidXNlTWVtbyIsImdldFRyZWVEYXRhUGF0aCIsInVzZUNhbGxiYWNrIiwicm93IiwianN4IiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIl0sIm1hcHBpbmdzIjoiK0lBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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
