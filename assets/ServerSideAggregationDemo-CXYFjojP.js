import{r as u,j as d}from"./vendor-react-f02LKZLu.js";import{D as v,G as S}from"./opengridx-ZNEXlhmV.js";import{D as M}from"./DocsLayout-CwTr2FWN.js";const y=`
import { useState, useMemo } from 'react';
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,
    GridAggregationModel,
    GridAggregationResult,
} from '@opencorestack/opengridx';
import './ServerSideAggregationDemo.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './ServerSideAggregationDemo.tsx?raw';

type Employee = {
    id: number;
    name: string;
    department: string;
    role: string;
    location: string;
    salary: number;
    bonus: number;
    totalComp: number;
    age: number;
    yearsExp: number;
    projectsCompleted: number;
    performanceScore: number;
    active: boolean;
};

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const ROLES = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'];
const LOCATIONS = ['New York', 'San Francisco', 'Austin', 'Chicago', 'London', 'Berlin'];

function seededRandom(seed: number) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

const ALL_EMPLOYEES: Employee[] = Array.from({ length: 500 }, (_, i) => {
    const salary = 40_000 + Math.floor(seededRandom(i * 3) * 120_000);
    const bonus = Math.floor(seededRandom(i * 7 + 1) * 25_000);
    const projects = 1 + Math.floor(seededRandom(i * 11 + 2) * 30);
    const perfScore = Math.round((2 + seededRandom(i * 13 + 3) * 3) * 10) / 10;
    return {
        id: i + 1,
        name: \`Employee \${i + 1}\`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        role: ROLES[i % ROLES.length],
        location: LOCATIONS[Math.floor(seededRandom(i * 5) * LOCATIONS.length)],
        salary,
        bonus,
        totalComp: salary + bonus,
        age: 22 + Math.floor(seededRandom(i * 17 + 4) * 40),
        yearsExp: Math.floor(seededRandom(i * 19 + 5) * 20),
        projectsCompleted: projects,
        performanceScore: perfScore,
        active: i % 5 !== 0,
    };
});

const mockServer = {
    async getRows(params: GridGetRowsParams): Promise<GridGetRowsResponse<Employee>> {
        await new Promise((r) => setTimeout(r, 500));

        const data = [...ALL_EMPLOYEES];

        if (params.sortModel.length > 0) {
            const { field, sort } = params.sortModel[0];
            data.sort((a, b) => {
                const av = a[field as keyof Employee] as string | number;
                const bv = b[field as keyof Employee] as string | number;
                if (av < bv) return sort === 'asc' ? -1 : 1;
                if (av > bv) return sort === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const rowCount = data.length;

        const aggregationResults: GridAggregationResult = {};
        if (params.aggregationModel) {
            for (const [field, fn] of Object.entries(params.aggregationModel)) {
                const values = data.map((r) => r[field as keyof Employee]).filter((v) => v != null);
                if (fn === 'sum') aggregationResults[field] = values.reduce<number>((a, b) => a + Number(b), 0);
                else if (fn === 'avg') aggregationResults[field] = values.length ? values.reduce<number>((a, b) => a + Number(b), 0) / values.length : null;
                else if (fn === 'count') aggregationResults[field] = values.length;
                else if (fn === 'min') aggregationResults[field] = Math.min(...values.map(Number));
                else if (fn === 'max') aggregationResults[field] = Math.max(...values.map(Number));
            }
        }

        const page = data.slice(params.startRow, params.endRow);
        return { rows: page, rowCount, aggregationResults };
    },
};

const fmt$ = ({ value }: { value: unknown }) =>
    typeof value === 'number' ? \`$\${Math.round(value).toLocaleString('en-US')}\` : String(value ?? '');

const columns: GridColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 65 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'role', headerName: 'Role', width: 100 },
    { field: 'location', headerName: 'Location', width: 130 },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'bonus',
        headerName: 'Bonus',
        width: 110,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'totalComp',
        headerName: 'Total Comp',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'age',
        headerName: 'Age',
        width: 80,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'yearsExp',
        headerName: 'Experience (yrs)',
        width: 150,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'projectsCompleted',
        headerName: 'Projects',
        width: 100,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
    },
    {
        field: 'performanceScore',
        headerName: 'Perf. Score',
        width: 115,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: ({ value }) => typeof value === 'number' ? value.toFixed(2) : String(value ?? ''),
    },
    {
        field: 'active',
        headerName: 'Active',
        width: 80,
        type: 'boolean',
        renderCell: ({ value }) => (value ? '✅' : '❌'),
    },
];

export default function ServerSideAggregationDemo() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
        salary: 'sum',
        bonus: 'sum',
        totalComp: 'sum',
        age: 'avg',
        yearsExp: 'avg',
        performanceScore: 'avg',
    });

    const dataSource: GridDataSource<Employee> = useMemo(
        () => ({ getRows: (p) => mockServer.getRows(p) }),
        []
    );

    return (
        <DocsLayout
            title="Server-Side Aggregation"
            description="Aggregation computed server-side over the full dataset, bypassing client-side pagination. Results arrive via the dataSource and render in a sticky totals row."
            sourceCode={sourceCode}
        >
            <DataGrid<Employee>
                rows={[]}
                columns={columns}
                dataSource={dataSource}
                pagination
                paginationMode="server"
                sortingMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 20, 50]}
                aggregationModel={aggregationModel}
                onAggregationModelChange={setAggregationModel}
                getAggregationPosition={() => 'footer'}
                slots={{ toolbar: GridToolbar }}
                height={520}
            />

            <div className="ss-agg-info-box">
                <strong>How it works:</strong> Each page request sends the <code>aggregationModel</code> to
                the server. The server computes aggregations over all 500 rows and returns{' '}
                <code>aggregationResults</code> — so the footer total is always accurate regardless of the
                current page.
            </div>
        </DocsLayout>
    );
}
`,p=["Engineering","Sales","Marketing","HR","Finance","Operations"],f=["Junior","Mid","Senior","Lead","Manager","Director"],b=["New York","San Francisco","Austin","Chicago","London","Berlin"];function s(r){const e=Math.sin(r+1)*1e4;return e-Math.floor(e)}const w=Array.from({length:500},(r,e)=>{const g=4e4+Math.floor(s(e*3)*12e4),t=Math.floor(s(e*7+1)*25e3),m=1+Math.floor(s(e*11+2)*30),a=Math.round((2+s(e*13+3)*3)*10)/10;return{id:e+1,name:`Employee ${e+1}`,department:p[e%p.length],role:f[e%f.length],location:b[Math.floor(s(e*5)*b.length)],salary:g,bonus:t,totalComp:g+t,age:22+Math.floor(s(e*17+4)*40),yearsExp:Math.floor(s(e*19+5)*20),projectsCompleted:m,performanceScore:a,active:e%5!==0}}),A={async getRows(r){await new Promise(a=>setTimeout(a,500));const e=[...w];if(r.sortModel.length>0){const{field:a,sort:i}=r.sortModel[0];e.sort((o,n)=>{const l=o[a],h=n[a];return l<h?i==="asc"?-1:1:l>h?i==="asc"?1:-1:0})}const g=e.length,t={};if(r.aggregationModel)for(const[a,i]of Object.entries(r.aggregationModel)){const o=e.map(n=>n[a]).filter(n=>n!=null);i==="sum"?t[a]=o.reduce((n,l)=>n+Number(l),0):i==="avg"?t[a]=o.length?o.reduce((n,l)=>n+Number(l),0)/o.length:null:i==="count"?t[a]=o.length:i==="min"?t[a]=Math.min(...o.map(Number)):i==="max"&&(t[a]=Math.max(...o.map(Number)))}return{rows:e.slice(r.startRow,r.endRow),rowCount:g,aggregationResults:t}}},c=({value:r})=>typeof r=="number"?`$${Math.round(r).toLocaleString("en-US")}`:String(r??""),R=[{field:"id",headerName:"ID",width:65},{field:"name",headerName:"Name",width:150},{field:"department",headerName:"Department",width:130},{field:"role",headerName:"Role",width:100},{field:"location",headerName:"Location",width:130},{field:"salary",headerName:"Salary",width:130,type:"number",align:"right",headerAlign:"right",aggregable:!0,valueFormatter:c},{field:"bonus",headerName:"Bonus",width:110,type:"number",align:"right",headerAlign:"right",aggregable:!0,valueFormatter:c},{field:"totalComp",headerName:"Total Comp",width:130,type:"number",align:"right",headerAlign:"right",aggregable:!0,valueFormatter:c},{field:"age",headerName:"Age",width:80,type:"number",align:"right",headerAlign:"right",aggregable:!0},{field:"yearsExp",headerName:"Experience (yrs)",width:150,type:"number",align:"right",headerAlign:"right",aggregable:!0},{field:"projectsCompleted",headerName:"Projects",width:100,type:"number",align:"right",headerAlign:"right",aggregable:!0},{field:"performanceScore",headerName:"Perf. Score",width:115,type:"number",align:"right",headerAlign:"right",aggregable:!0,valueFormatter:({value:r})=>typeof r=="number"?r.toFixed(2):String(r??"")},{field:"active",headerName:"Active",width:80,type:"boolean",renderCell:({value:r})=>r?"✅":"❌"}];function x(){const[r,e]=u.useState({page:0,pageSize:20}),[g,t]=u.useState({salary:"sum",bonus:"sum",totalComp:"sum",age:"avg",yearsExp:"avg",performanceScore:"avg"}),m=u.useMemo(()=>({getRows:a=>A.getRows(a)}),[]);return d.jsxs(M,{title:"Server-Side Aggregation",description:"Aggregation computed server-side over the full dataset, bypassing client-side pagination. Results arrive via the dataSource and render in a sticky totals row.",sourceCode:y,children:[d.jsx(v,{rows:[],columns:R,dataSource:m,pagination:!0,paginationMode:"server",sortingMode:"server",paginationModel:r,onPaginationModelChange:e,pageSizeOptions:[10,20,50],aggregationModel:g,onAggregationModelChange:t,getAggregationPosition:()=>"footer",slots:{toolbar:S},height:520}),d.jsxs("div",{className:"ss-agg-info-box",children:[d.jsx("strong",{children:"How it works:"})," Each page request sends the ",d.jsx("code",{children:"aggregationModel"})," to the server. The server computes aggregations over all 500 rows and returns"," ",d.jsx("code",{children:"aggregationResults"})," — so the footer total is always accurate regardless of the current page."]})]})}export{x as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtby1DWFlGam9qUC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtby9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vL1NlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHtcXG4gICAgRGF0YUdyaWQsXFxuICAgIEdyaWRUb29sYmFyLFxcbiAgICBHcmlkQ29sRGVmLFxcbiAgICBHcmlkRGF0YVNvdXJjZSxcXG4gICAgR3JpZEdldFJvd3NQYXJhbXMsXFxuICAgIEdyaWRHZXRSb3dzUmVzcG9uc2UsXFxuICAgIEdyaWRBZ2dyZWdhdGlvbk1vZGVsLFxcbiAgICBHcmlkQWdncmVnYXRpb25SZXN1bHQsXFxufSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLnRzeD9yYXcnO1xcblxcbnR5cGUgRW1wbG95ZWUgPSB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIGxvY2F0aW9uOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBib251czogbnVtYmVyO1xcbiAgICB0b3RhbENvbXA6IG51bWJlcjtcXG4gICAgYWdlOiBudW1iZXI7XFxuICAgIHllYXJzRXhwOiBudW1iZXI7XFxuICAgIHByb2plY3RzQ29tcGxldGVkOiBudW1iZXI7XFxuICAgIHBlcmZvcm1hbmNlU2NvcmU6IG51bWJlcjtcXG4gICAgYWN0aXZlOiBib29sZWFuO1xcbn07XFxuXFxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ1NhbGVzJywgJ01hcmtldGluZycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcXG5jb25zdCBST0xFUyA9IFsnSnVuaW9yJywgJ01pZCcsICdTZW5pb3InLCAnTGVhZCcsICdNYW5hZ2VyJywgJ0RpcmVjdG9yJ107XFxuY29uc3QgTE9DQVRJT05TID0gWydOZXcgWW9yaycsICdTYW4gRnJhbmNpc2NvJywgJ0F1c3RpbicsICdDaGljYWdvJywgJ0xvbmRvbicsICdCZXJsaW4nXTtcXG5cXG5mdW5jdGlvbiBzZWVkZWRSYW5kb20oc2VlZDogbnVtYmVyKSB7XFxuICAgIGNvbnN0IHggPSBNYXRoLnNpbihzZWVkICsgMSkgKiAxMDAwMDtcXG4gICAgcmV0dXJuIHggLSBNYXRoLmZsb29yKHgpO1xcbn1cXG5cXG5jb25zdCBBTExfRU1QTE9ZRUVTOiBFbXBsb3llZVtdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogNTAwIH0sIChfLCBpKSA9PiB7XFxuICAgIGNvbnN0IHNhbGFyeSA9IDQwXzAwMCArIE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAzKSAqIDEyMF8wMDApO1xcbiAgICBjb25zdCBib251cyA9IE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiA3ICsgMSkgKiAyNV8wMDApO1xcbiAgICBjb25zdCBwcm9qZWN0cyA9IDEgKyBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogMTEgKyAyKSAqIDMwKTtcXG4gICAgY29uc3QgcGVyZlNjb3JlID0gTWF0aC5yb3VuZCgoMiArIHNlZWRlZFJhbmRvbShpICogMTMgKyAzKSAqIDMpICogMTApIC8gMTA7XFxuICAgIHJldHVybiB7XFxuICAgICAgICBpZDogaSArIDEsXFxuICAgICAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICAgICAgZGVwYXJ0bWVudDogREVQQVJUTUVOVFNbaSAlIERFUEFSVE1FTlRTLmxlbmd0aF0sXFxuICAgICAgICByb2xlOiBST0xFU1tpICUgUk9MRVMubGVuZ3RoXSxcXG4gICAgICAgIGxvY2F0aW9uOiBMT0NBVElPTlNbTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDUpICogTE9DQVRJT05TLmxlbmd0aCldLFxcbiAgICAgICAgc2FsYXJ5LFxcbiAgICAgICAgYm9udXMsXFxuICAgICAgICB0b3RhbENvbXA6IHNhbGFyeSArIGJvbnVzLFxcbiAgICAgICAgYWdlOiAyMiArIE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAxNyArIDQpICogNDApLFxcbiAgICAgICAgeWVhcnNFeHA6IE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAxOSArIDUpICogMjApLFxcbiAgICAgICAgcHJvamVjdHNDb21wbGV0ZWQ6IHByb2plY3RzLFxcbiAgICAgICAgcGVyZm9ybWFuY2VTY29yZTogcGVyZlNjb3JlLFxcbiAgICAgICAgYWN0aXZlOiBpICUgNSAhPT0gMCxcXG4gICAgfTtcXG59KTtcXG5cXG5jb25zdCBtb2NrU2VydmVyID0ge1xcbiAgICBhc3luYyBnZXRSb3dzKHBhcmFtczogR3JpZEdldFJvd3NQYXJhbXMpOiBQcm9taXNlPEdyaWRHZXRSb3dzUmVzcG9uc2U8RW1wbG95ZWU+PiB7XFxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCA1MDApKTtcXG5cXG4gICAgICAgIGNvbnN0IGRhdGEgPSBbLi4uQUxMX0VNUExPWUVFU107XFxuXFxuICAgICAgICBpZiAocGFyYW1zLnNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XFxuICAgICAgICAgICAgY29uc3QgeyBmaWVsZCwgc29ydCB9ID0gcGFyYW1zLnNvcnRNb2RlbFswXTtcXG4gICAgICAgICAgICBkYXRhLnNvcnQoKGEsIGIpID0+IHtcXG4gICAgICAgICAgICAgICAgY29uc3QgYXYgPSBhW2ZpZWxkIGFzIGtleW9mIEVtcGxveWVlXSBhcyBzdHJpbmcgfCBudW1iZXI7XFxuICAgICAgICAgICAgICAgIGNvbnN0IGJ2ID0gYltmaWVsZCBhcyBrZXlvZiBFbXBsb3llZV0gYXMgc3RyaW5nIHwgbnVtYmVyO1xcbiAgICAgICAgICAgICAgICBpZiAoYXYgPCBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gLTEgOiAxO1xcbiAgICAgICAgICAgICAgICBpZiAoYXYgPiBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gMSA6IC0xO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIGNvbnN0IHJvd0NvdW50ID0gZGF0YS5sZW5ndGg7XFxuXFxuICAgICAgICBjb25zdCBhZ2dyZWdhdGlvblJlc3VsdHM6IEdyaWRBZ2dyZWdhdGlvblJlc3VsdCA9IHt9O1xcbiAgICAgICAgaWYgKHBhcmFtcy5hZ2dyZWdhdGlvbk1vZGVsKSB7XFxuICAgICAgICAgICAgZm9yIChjb25zdCBbZmllbGQsIGZuXSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXMuYWdncmVnYXRpb25Nb2RlbCkpIHtcXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gZGF0YS5tYXAoKHIpID0+IHJbZmllbGQgYXMga2V5b2YgRW1wbG95ZWVdKS5maWx0ZXIoKHYpID0+IHYgIT0gbnVsbCk7XFxuICAgICAgICAgICAgICAgIGlmIChmbiA9PT0gJ3N1bScpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMucmVkdWNlPG51bWJlcj4oKGEsIGIpID0+IGEgKyBOdW1iZXIoYiksIDApO1xcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ2F2ZycpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzLnJlZHVjZTxudW1iZXI+KChhLCBiKSA9PiBhICsgTnVtYmVyKGIpLCAwKSAvIHZhbHVlcy5sZW5ndGggOiBudWxsO1xcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ2NvdW50JykgYWdncmVnYXRpb25SZXN1bHRzW2ZpZWxkXSA9IHZhbHVlcy5sZW5ndGg7XFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuID09PSAnbWluJykgYWdncmVnYXRpb25SZXN1bHRzW2ZpZWxkXSA9IE1hdGgubWluKC4uLnZhbHVlcy5tYXAoTnVtYmVyKSk7XFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuID09PSAnbWF4JykgYWdncmVnYXRpb25SZXN1bHRzW2ZpZWxkXSA9IE1hdGgubWF4KC4uLnZhbHVlcy5tYXAoTnVtYmVyKSk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgfVxcblxcbiAgICAgICAgY29uc3QgcGFnZSA9IGRhdGEuc2xpY2UocGFyYW1zLnN0YXJ0Um93LCBwYXJhbXMuZW5kUm93KTtcXG4gICAgICAgIHJldHVybiB7IHJvd3M6IHBhZ2UsIHJvd0NvdW50LCBhZ2dyZWdhdGlvblJlc3VsdHMgfTtcXG4gICAgfSxcXG59O1xcblxcbmNvbnN0IGZtdCQgPSAoeyB2YWx1ZSB9OiB7IHZhbHVlOiB1bmtub3duIH0pID0+XFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyBgJCR7TWF0aC5yb3VuZCh2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJyl9YCA6IFN0cmluZyh2YWx1ZSA/PyAnJyk7XFxuXFxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcXG4gICAgeyBmaWVsZDogJ2lkJywgaGVhZGVyTmFtZTogJ0lEJywgd2lkdGg6IDY1IH0sXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTUwIH0sXFxuICAgIHsgZmllbGQ6ICdkZXBhcnRtZW50JywgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLCB3aWR0aDogMTMwIH0sXFxuICAgIHsgZmllbGQ6ICdyb2xlJywgaGVhZGVyTmFtZTogJ1JvbGUnLCB3aWR0aDogMTAwIH0sXFxuICAgIHsgZmllbGQ6ICdsb2NhdGlvbicsIGhlYWRlck5hbWU6ICdMb2NhdGlvbicsIHdpZHRoOiAxMzAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1NhbGFyeScsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiBmbXQkLFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ2JvbnVzJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdCb251cycsXFxuICAgICAgICB3aWR0aDogMTEwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiBmbXQkLFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3RvdGFsQ29tcCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnVG90YWwgQ29tcCcsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiBmbXQkLFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ2FnZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnQWdlJyxcXG4gICAgICAgIHdpZHRoOiA4MCxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAneWVhcnNFeHAnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0V4cGVyaWVuY2UgKHlycyknLFxcbiAgICAgICAgd2lkdGg6IDE1MCxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAncHJvamVjdHNDb21wbGV0ZWQnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1Byb2plY3RzJyxcXG4gICAgICAgIHdpZHRoOiAxMDAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3BlcmZvcm1hbmNlU2NvcmUnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1BlcmYuIFNjb3JlJyxcXG4gICAgICAgIHdpZHRoOiAxMTUsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6ICh7IHZhbHVlIH0pID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZS50b0ZpeGVkKDIpIDogU3RyaW5nKHZhbHVlID8/ICcnKSxcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdhY3RpdmUnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0FjdGl2ZScsXFxuICAgICAgICB3aWR0aDogODAsXFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXFxuICAgICAgICByZW5kZXJDZWxsOiAoeyB2YWx1ZSB9KSA9PiAodmFsdWUgPyAn4pyFJyA6ICfinYwnKSxcXG4gICAgfSxcXG5dO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8oKSB7XFxuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZSh7IHBhZ2U6IDAsIHBhZ2VTaXplOiAyMCB9KTtcXG4gICAgY29uc3QgW2FnZ3JlZ2F0aW9uTW9kZWwsIHNldEFnZ3JlZ2F0aW9uTW9kZWxdID0gdXNlU3RhdGU8R3JpZEFnZ3JlZ2F0aW9uTW9kZWw+KHtcXG4gICAgICAgIHNhbGFyeTogJ3N1bScsXFxuICAgICAgICBib251czogJ3N1bScsXFxuICAgICAgICB0b3RhbENvbXA6ICdzdW0nLFxcbiAgICAgICAgYWdlOiAnYXZnJyxcXG4gICAgICAgIHllYXJzRXhwOiAnYXZnJyxcXG4gICAgICAgIHBlcmZvcm1hbmNlU2NvcmU6ICdhdmcnLFxcbiAgICB9KTtcXG5cXG4gICAgY29uc3QgZGF0YVNvdXJjZTogR3JpZERhdGFTb3VyY2U8RW1wbG95ZWU+ID0gdXNlTWVtbyhcXG4gICAgICAgICgpID0+ICh7IGdldFJvd3M6IChwKSA9PiBtb2NrU2VydmVyLmdldFJvd3MocCkgfSksXFxuICAgICAgICBbXVxcbiAgICApO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiU2VydmVyLVNpZGUgQWdncmVnYXRpb25cXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkFnZ3JlZ2F0aW9uIGNvbXB1dGVkIHNlcnZlci1zaWRlIG92ZXIgdGhlIGZ1bGwgZGF0YXNldCwgYnlwYXNzaW5nIGNsaWVudC1zaWRlIHBhZ2luYXRpb24uIFJlc3VsdHMgYXJyaXZlIHZpYSB0aGUgZGF0YVNvdXJjZSBhbmQgcmVuZGVyIGluIGEgc3RpY2t5IHRvdGFscyByb3cuXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPERhdGFHcmlkPEVtcGxveWVlPlxcbiAgICAgICAgICAgICAgICByb3dzPXtbXX1cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZT17ZGF0YVNvdXJjZX1cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZT1cXFwic2VydmVyXFxcIlxcbiAgICAgICAgICAgICAgICBzb3J0aW5nTW9kZT1cXFwic2VydmVyXFxcIlxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDIwLCA1MF19XFxuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uTW9kZWw9e2FnZ3JlZ2F0aW9uTW9kZWx9XFxuICAgICAgICAgICAgICAgIG9uQWdncmVnYXRpb25Nb2RlbENoYW5nZT17c2V0QWdncmVnYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgZ2V0QWdncmVnYXRpb25Qb3NpdGlvbj17KCkgPT4gJ2Zvb3Rlcid9XFxuICAgICAgICAgICAgICAgIHNsb3RzPXt7IHRvb2xiYXI6IEdyaWRUb29sYmFyIH19XFxuICAgICAgICAgICAgICAgIGhlaWdodD17NTIwfVxcbiAgICAgICAgICAgIC8+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInNzLWFnZy1pbmZvLWJveFxcXCI+XFxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPiBFYWNoIHBhZ2UgcmVxdWVzdCBzZW5kcyB0aGUgPGNvZGU+YWdncmVnYXRpb25Nb2RlbDwvY29kZT4gdG9cXG4gICAgICAgICAgICAgICAgdGhlIHNlcnZlci4gVGhlIHNlcnZlciBjb21wdXRlcyBhZ2dyZWdhdGlvbnMgb3ZlciBhbGwgNTAwIHJvd3MgYW5kIHJldHVybnN7JyAnfVxcbiAgICAgICAgICAgICAgICA8Y29kZT5hZ2dyZWdhdGlvblJlc3VsdHM8L2NvZGU+IOKAlCBzbyB0aGUgZm9vdGVyIHRvdGFsIGlzIGFsd2F5cyBhY2N1cmF0ZSByZWdhcmRsZXNzIG9mIHRoZVxcbiAgICAgICAgICAgICAgICBjdXJyZW50IHBhZ2UuXFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gICAgRGF0YUdyaWQsXG4gICAgR3JpZFRvb2xiYXIsXG4gICAgR3JpZENvbERlZixcbiAgICBHcmlkRGF0YVNvdXJjZSxcbiAgICBHcmlkR2V0Um93c1BhcmFtcyxcbiAgICBHcmlkR2V0Um93c1Jlc3BvbnNlLFxuICAgIEdyaWRBZ2dyZWdhdGlvbk1vZGVsLFxuICAgIEdyaWRBZ2dyZWdhdGlvblJlc3VsdCxcbn0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLmNzcyc7XG5pbXBvcnQgeyBEb2NzTGF5b3V0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9Eb2NzTGF5b3V0JztcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtby50c3g/cmF3JztcblxudHlwZSBFbXBsb3llZSA9IHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXBhcnRtZW50OiBzdHJpbmc7XG4gICAgcm9sZTogc3RyaW5nO1xuICAgIGxvY2F0aW9uOiBzdHJpbmc7XG4gICAgc2FsYXJ5OiBudW1iZXI7XG4gICAgYm9udXM6IG51bWJlcjtcbiAgICB0b3RhbENvbXA6IG51bWJlcjtcbiAgICBhZ2U6IG51bWJlcjtcbiAgICB5ZWFyc0V4cDogbnVtYmVyO1xuICAgIHByb2plY3RzQ29tcGxldGVkOiBudW1iZXI7XG4gICAgcGVyZm9ybWFuY2VTY29yZTogbnVtYmVyO1xuICAgIGFjdGl2ZTogYm9vbGVhbjtcbn07XG5cbmNvbnN0IERFUEFSVE1FTlRTID0gWydFbmdpbmVlcmluZycsICdTYWxlcycsICdNYXJrZXRpbmcnLCAnSFInLCAnRmluYW5jZScsICdPcGVyYXRpb25zJ107XG5jb25zdCBST0xFUyA9IFsnSnVuaW9yJywgJ01pZCcsICdTZW5pb3InLCAnTGVhZCcsICdNYW5hZ2VyJywgJ0RpcmVjdG9yJ107XG5jb25zdCBMT0NBVElPTlMgPSBbJ05ldyBZb3JrJywgJ1NhbiBGcmFuY2lzY28nLCAnQXVzdGluJywgJ0NoaWNhZ28nLCAnTG9uZG9uJywgJ0JlcmxpbiddO1xuXG5mdW5jdGlvbiBzZWVkZWRSYW5kb20oc2VlZDogbnVtYmVyKSB7XG4gICAgY29uc3QgeCA9IE1hdGguc2luKHNlZWQgKyAxKSAqIDEwMDAwO1xuICAgIHJldHVybiB4IC0gTWF0aC5mbG9vcih4KTtcbn1cblxuY29uc3QgQUxMX0VNUExPWUVFUzogRW1wbG95ZWVbXSA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDUwMCB9LCAoXywgaSkgPT4ge1xuICAgIGNvbnN0IHNhbGFyeSA9IDQwXzAwMCArIE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAzKSAqIDEyMF8wMDApO1xuICAgIGNvbnN0IGJvbnVzID0gTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDcgKyAxKSAqIDI1XzAwMCk7XG4gICAgY29uc3QgcHJvamVjdHMgPSAxICsgTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDExICsgMikgKiAzMCk7XG4gICAgY29uc3QgcGVyZlNjb3JlID0gTWF0aC5yb3VuZCgoMiArIHNlZWRlZFJhbmRvbShpICogMTMgKyAzKSAqIDMpICogMTApIC8gMTA7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGkgKyAxLFxuICAgICAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxuICAgICAgICBkZXBhcnRtZW50OiBERVBBUlRNRU5UU1tpICUgREVQQVJUTUVOVFMubGVuZ3RoXSxcbiAgICAgICAgcm9sZTogUk9MRVNbaSAlIFJPTEVTLmxlbmd0aF0sXG4gICAgICAgIGxvY2F0aW9uOiBMT0NBVElPTlNbTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDUpICogTE9DQVRJT05TLmxlbmd0aCldLFxuICAgICAgICBzYWxhcnksXG4gICAgICAgIGJvbnVzLFxuICAgICAgICB0b3RhbENvbXA6IHNhbGFyeSArIGJvbnVzLFxuICAgICAgICBhZ2U6IDIyICsgTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDE3ICsgNCkgKiA0MCksXG4gICAgICAgIHllYXJzRXhwOiBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogMTkgKyA1KSAqIDIwKSxcbiAgICAgICAgcHJvamVjdHNDb21wbGV0ZWQ6IHByb2plY3RzLFxuICAgICAgICBwZXJmb3JtYW5jZVNjb3JlOiBwZXJmU2NvcmUsXG4gICAgICAgIGFjdGl2ZTogaSAlIDUgIT09IDAsXG4gICAgfTtcbn0pO1xuXG5jb25zdCBtb2NrU2VydmVyID0ge1xuICAgIGFzeW5jIGdldFJvd3MocGFyYW1zOiBHcmlkR2V0Um93c1BhcmFtcyk6IFByb21pc2U8R3JpZEdldFJvd3NSZXNwb25zZTxFbXBsb3llZT4+IHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgNTAwKSk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IFsuLi5BTExfRU1QTE9ZRUVTXTtcblxuICAgICAgICBpZiAocGFyYW1zLnNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkLCBzb3J0IH0gPSBwYXJhbXMuc29ydE1vZGVsWzBdO1xuICAgICAgICAgICAgZGF0YS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXYgPSBhW2ZpZWxkIGFzIGtleW9mIEVtcGxveWVlXSBhcyBzdHJpbmcgfCBudW1iZXI7XG4gICAgICAgICAgICAgICAgY29uc3QgYnYgPSBiW2ZpZWxkIGFzIGtleW9mIEVtcGxveWVlXSBhcyBzdHJpbmcgfCBudW1iZXI7XG4gICAgICAgICAgICAgICAgaWYgKGF2IDwgYnYpIHJldHVybiBzb3J0ID09PSAnYXNjJyA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBpZiAoYXYgPiBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gMSA6IC0xO1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3dDb3VudCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGFnZ3JlZ2F0aW9uUmVzdWx0czogR3JpZEFnZ3JlZ2F0aW9uUmVzdWx0ID0ge307XG4gICAgICAgIGlmIChwYXJhbXMuYWdncmVnYXRpb25Nb2RlbCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbZmllbGQsIGZuXSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXMuYWdncmVnYXRpb25Nb2RlbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSBkYXRhLm1hcCgocikgPT4gcltmaWVsZCBhcyBrZXlvZiBFbXBsb3llZV0pLmZpbHRlcigodikgPT4gdiAhPSBudWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoZm4gPT09ICdzdW0nKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gdmFsdWVzLnJlZHVjZTxudW1iZXI+KChhLCBiKSA9PiBhICsgTnVtYmVyKGIpLCAwKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ2F2ZycpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzLnJlZHVjZTxudW1iZXI+KChhLCBiKSA9PiBhICsgTnVtYmVyKGIpLCAwKSAvIHZhbHVlcy5sZW5ndGggOiBudWxsO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuID09PSAnY291bnQnKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ21pbicpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSBNYXRoLm1pbiguLi52YWx1ZXMubWFwKE51bWJlcikpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuID09PSAnbWF4JykgYWdncmVnYXRpb25SZXN1bHRzW2ZpZWxkXSA9IE1hdGgubWF4KC4uLnZhbHVlcy5tYXAoTnVtYmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYWdlID0gZGF0YS5zbGljZShwYXJhbXMuc3RhcnRSb3csIHBhcmFtcy5lbmRSb3cpO1xuICAgICAgICByZXR1cm4geyByb3dzOiBwYWdlLCByb3dDb3VudCwgYWdncmVnYXRpb25SZXN1bHRzIH07XG4gICAgfSxcbn07XG5cbmNvbnN0IGZtdCQgPSAoeyB2YWx1ZSB9OiB7IHZhbHVlOiB1bmtub3duIH0pID0+XG4gICAgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IGAkJHtNYXRoLnJvdW5kKHZhbHVlKS50b0xvY2FsZVN0cmluZygnZW4tVVMnKX1gIDogU3RyaW5nKHZhbHVlID8/ICcnKTtcblxuY29uc3QgY29sdW1uczogR3JpZENvbERlZjxFbXBsb3llZT5bXSA9IFtcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogNjUgfSxcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDE1MCB9LFxuICAgIHsgZmllbGQ6ICdkZXBhcnRtZW50JywgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLCB3aWR0aDogMTMwIH0sXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxMDAgfSxcbiAgICB7IGZpZWxkOiAnbG9jYXRpb24nLCBoZWFkZXJOYW1lOiAnTG9jYXRpb24nLCB3aWR0aDogMTMwIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdTYWxhcnknLFxuICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogZm10JCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdib251cycsXG4gICAgICAgIGhlYWRlck5hbWU6ICdCb251cycsXG4gICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiBmbXQkLFxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3RvdGFsQ29tcCcsXG4gICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBDb21wJyxcbiAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IGZtdCQsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnYWdlJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0FnZScsXG4gICAgICAgIHdpZHRoOiA4MCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICd5ZWFyc0V4cCcsXG4gICAgICAgIGhlYWRlck5hbWU6ICdFeHBlcmllbmNlICh5cnMpJyxcbiAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdwcm9qZWN0c0NvbXBsZXRlZCcsXG4gICAgICAgIGhlYWRlck5hbWU6ICdQcm9qZWN0cycsXG4gICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAncGVyZm9ybWFuY2VTY29yZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdQZXJmLiBTY29yZScsXG4gICAgICAgIHdpZHRoOiAxMTUsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiAoeyB2YWx1ZSB9KSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUudG9GaXhlZCgyKSA6IFN0cmluZyh2YWx1ZSA/PyAnJyksXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnYWN0aXZlJyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0FjdGl2ZScsXG4gICAgICAgIHdpZHRoOiA4MCxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICByZW5kZXJDZWxsOiAoeyB2YWx1ZSB9KSA9PiAodmFsdWUgPyAn4pyFJyA6ICfinYwnKSxcbiAgICB9LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtbygpIHtcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGUoeyBwYWdlOiAwLCBwYWdlU2l6ZTogMjAgfSk7XG4gICAgY29uc3QgW2FnZ3JlZ2F0aW9uTW9kZWwsIHNldEFnZ3JlZ2F0aW9uTW9kZWxdID0gdXNlU3RhdGU8R3JpZEFnZ3JlZ2F0aW9uTW9kZWw+KHtcbiAgICAgICAgc2FsYXJ5OiAnc3VtJyxcbiAgICAgICAgYm9udXM6ICdzdW0nLFxuICAgICAgICB0b3RhbENvbXA6ICdzdW0nLFxuICAgICAgICBhZ2U6ICdhdmcnLFxuICAgICAgICB5ZWFyc0V4cDogJ2F2ZycsXG4gICAgICAgIHBlcmZvcm1hbmNlU2NvcmU6ICdhdmcnLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGF0YVNvdXJjZTogR3JpZERhdGFTb3VyY2U8RW1wbG95ZWU+ID0gdXNlTWVtbyhcbiAgICAgICAgKCkgPT4gKHsgZ2V0Um93czogKHApID0+IG1vY2tTZXJ2ZXIuZ2V0Um93cyhwKSB9KSxcbiAgICAgICAgW11cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiU2VydmVyLVNpZGUgQWdncmVnYXRpb25cIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJBZ2dyZWdhdGlvbiBjb21wdXRlZCBzZXJ2ZXItc2lkZSBvdmVyIHRoZSBmdWxsIGRhdGFzZXQsIGJ5cGFzc2luZyBjbGllbnQtc2lkZSBwYWdpbmF0aW9uLiBSZXN1bHRzIGFycml2ZSB2aWEgdGhlIGRhdGFTb3VyY2UgYW5kIHJlbmRlciBpbiBhIHN0aWNreSB0b3RhbHMgcm93LlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8RGF0YUdyaWQ8RW1wbG95ZWU+XG4gICAgICAgICAgICAgICAgcm93cz17W119XG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICBkYXRhU291cmNlPXtkYXRhU291cmNlfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZT1cInNlcnZlclwiXG4gICAgICAgICAgICAgICAgc29ydGluZ01vZGU9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDIwLCA1MF19XG4gICAgICAgICAgICAgICAgYWdncmVnYXRpb25Nb2RlbD17YWdncmVnYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBvbkFnZ3JlZ2F0aW9uTW9kZWxDaGFuZ2U9e3NldEFnZ3JlZ2F0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgZ2V0QWdncmVnYXRpb25Qb3NpdGlvbj17KCkgPT4gJ2Zvb3Rlcid9XG4gICAgICAgICAgICAgICAgc2xvdHM9e3sgdG9vbGJhcjogR3JpZFRvb2xiYXIgfX1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezUyMH1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3MtYWdnLWluZm8tYm94XCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+IEVhY2ggcGFnZSByZXF1ZXN0IHNlbmRzIHRoZSA8Y29kZT5hZ2dyZWdhdGlvbk1vZGVsPC9jb2RlPiB0b1xuICAgICAgICAgICAgICAgIHRoZSBzZXJ2ZXIuIFRoZSBzZXJ2ZXIgY29tcHV0ZXMgYWdncmVnYXRpb25zIG92ZXIgYWxsIDUwMCByb3dzIGFuZCByZXR1cm5zeycgJ31cbiAgICAgICAgICAgICAgICA8Y29kZT5hZ2dyZWdhdGlvblJlc3VsdHM8L2NvZGU+IOKAlCBzbyB0aGUgZm9vdGVyIHRvdGFsIGlzIGFsd2F5cyBhY2N1cmF0ZSByZWdhcmRsZXNzIG9mIHRoZVxuICAgICAgICAgICAgICAgIGN1cnJlbnQgcGFnZS5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiREVQQVJUTUVOVFMiLCJST0xFUyIsIkxPQ0FUSU9OUyIsInNlZWRlZFJhbmRvbSIsInNlZWQiLCJ4IiwiQUxMX0VNUExPWUVFUyIsIl8iLCJpIiwic2FsYXJ5IiwiYm9udXMiLCJwcm9qZWN0cyIsInBlcmZTY29yZSIsIm1vY2tTZXJ2ZXIiLCJwYXJhbXMiLCJyIiwiZGF0YSIsImZpZWxkIiwic29ydCIsImEiLCJiIiwiYXYiLCJidiIsInJvd0NvdW50IiwiYWdncmVnYXRpb25SZXN1bHRzIiwiZm4iLCJ2YWx1ZXMiLCJ2IiwiZm10JCIsInZhbHVlIiwiY29sdW1ucyIsIlNlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8iLCJwYWdpbmF0aW9uTW9kZWwiLCJzZXRQYWdpbmF0aW9uTW9kZWwiLCJ1c2VTdGF0ZSIsImFnZ3JlZ2F0aW9uTW9kZWwiLCJzZXRBZ2dyZWdhdGlvbk1vZGVsIiwiZGF0YVNvdXJjZSIsInVzZU1lbW8iLCJwIiwianN4cyIsIkRvY3NMYXlvdXQiLCJqc3giLCJEYXRhR3JpZCIsIkdyaWRUb29sYmFyIl0sIm1hcHBpbmdzIjoic0pBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtB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
