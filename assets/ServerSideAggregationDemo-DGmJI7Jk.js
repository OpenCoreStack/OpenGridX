import{r as u,j as d}from"./vendor-react-LmGMyLnN.js";import{D as v,G as S}from"./opengridx-DRbmQSJO.js";import{D as M}from"./DocsLayout-BoGj89NG.js";const y=`
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
                if (fn === 'sum') aggregationResults[field] = values.reduce((a, b) => a + Number(b), 0);
                else if (fn === 'avg') aggregationResults[field] = values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtby1ER21KSTdKay5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtby9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vL1NlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHtcXG4gICAgRGF0YUdyaWQsXFxuICAgIEdyaWRUb29sYmFyLFxcbiAgICBHcmlkQ29sRGVmLFxcbiAgICBHcmlkRGF0YVNvdXJjZSxcXG4gICAgR3JpZEdldFJvd3NQYXJhbXMsXFxuICAgIEdyaWRHZXRSb3dzUmVzcG9uc2UsXFxuICAgIEdyaWRBZ2dyZWdhdGlvbk1vZGVsLFxcbiAgICBHcmlkQWdncmVnYXRpb25SZXN1bHQsXFxufSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLnRzeD9yYXcnO1xcblxcbnR5cGUgRW1wbG95ZWUgPSB7XFxuICAgIGlkOiBudW1iZXI7XFxuICAgIG5hbWU6IHN0cmluZztcXG4gICAgZGVwYXJ0bWVudDogc3RyaW5nO1xcbiAgICByb2xlOiBzdHJpbmc7XFxuICAgIGxvY2F0aW9uOiBzdHJpbmc7XFxuICAgIHNhbGFyeTogbnVtYmVyO1xcbiAgICBib251czogbnVtYmVyO1xcbiAgICB0b3RhbENvbXA6IG51bWJlcjtcXG4gICAgYWdlOiBudW1iZXI7XFxuICAgIHllYXJzRXhwOiBudW1iZXI7XFxuICAgIHByb2plY3RzQ29tcGxldGVkOiBudW1iZXI7XFxuICAgIHBlcmZvcm1hbmNlU2NvcmU6IG51bWJlcjtcXG4gICAgYWN0aXZlOiBib29sZWFuO1xcbn07XFxuXFxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ1NhbGVzJywgJ01hcmtldGluZycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcXG5jb25zdCBST0xFUyA9IFsnSnVuaW9yJywgJ01pZCcsICdTZW5pb3InLCAnTGVhZCcsICdNYW5hZ2VyJywgJ0RpcmVjdG9yJ107XFxuY29uc3QgTE9DQVRJT05TID0gWydOZXcgWW9yaycsICdTYW4gRnJhbmNpc2NvJywgJ0F1c3RpbicsICdDaGljYWdvJywgJ0xvbmRvbicsICdCZXJsaW4nXTtcXG5cXG5mdW5jdGlvbiBzZWVkZWRSYW5kb20oc2VlZDogbnVtYmVyKSB7XFxuICAgIGNvbnN0IHggPSBNYXRoLnNpbihzZWVkICsgMSkgKiAxMDAwMDtcXG4gICAgcmV0dXJuIHggLSBNYXRoLmZsb29yKHgpO1xcbn1cXG5cXG5jb25zdCBBTExfRU1QTE9ZRUVTOiBFbXBsb3llZVtdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogNTAwIH0sIChfLCBpKSA9PiB7XFxuICAgIGNvbnN0IHNhbGFyeSA9IDQwXzAwMCArIE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAzKSAqIDEyMF8wMDApO1xcbiAgICBjb25zdCBib251cyA9IE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiA3ICsgMSkgKiAyNV8wMDApO1xcbiAgICBjb25zdCBwcm9qZWN0cyA9IDEgKyBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogMTEgKyAyKSAqIDMwKTtcXG4gICAgY29uc3QgcGVyZlNjb3JlID0gTWF0aC5yb3VuZCgoMiArIHNlZWRlZFJhbmRvbShpICogMTMgKyAzKSAqIDMpICogMTApIC8gMTA7XFxuICAgIHJldHVybiB7XFxuICAgICAgICBpZDogaSArIDEsXFxuICAgICAgICBuYW1lOiBgRW1wbG95ZWUgJHtpICsgMX1gLFxcbiAgICAgICAgZGVwYXJ0bWVudDogREVQQVJUTUVOVFNbaSAlIERFUEFSVE1FTlRTLmxlbmd0aF0sXFxuICAgICAgICByb2xlOiBST0xFU1tpICUgUk9MRVMubGVuZ3RoXSxcXG4gICAgICAgIGxvY2F0aW9uOiBMT0NBVElPTlNbTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDUpICogTE9DQVRJT05TLmxlbmd0aCldLFxcbiAgICAgICAgc2FsYXJ5LFxcbiAgICAgICAgYm9udXMsXFxuICAgICAgICB0b3RhbENvbXA6IHNhbGFyeSArIGJvbnVzLFxcbiAgICAgICAgYWdlOiAyMiArIE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAxNyArIDQpICogNDApLFxcbiAgICAgICAgeWVhcnNFeHA6IE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAxOSArIDUpICogMjApLFxcbiAgICAgICAgcHJvamVjdHNDb21wbGV0ZWQ6IHByb2plY3RzLFxcbiAgICAgICAgcGVyZm9ybWFuY2VTY29yZTogcGVyZlNjb3JlLFxcbiAgICAgICAgYWN0aXZlOiBpICUgNSAhPT0gMCxcXG4gICAgfTtcXG59KTtcXG5cXG5jb25zdCBtb2NrU2VydmVyID0ge1xcbiAgICBhc3luYyBnZXRSb3dzKHBhcmFtczogR3JpZEdldFJvd3NQYXJhbXMpOiBQcm9taXNlPEdyaWRHZXRSb3dzUmVzcG9uc2U8RW1wbG95ZWU+PiB7XFxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCA1MDApKTtcXG5cXG4gICAgICAgIGNvbnN0IGRhdGEgPSBbLi4uQUxMX0VNUExPWUVFU107XFxuXFxuICAgICAgICBpZiAocGFyYW1zLnNvcnRNb2RlbC5sZW5ndGggPiAwKSB7XFxuICAgICAgICAgICAgY29uc3QgeyBmaWVsZCwgc29ydCB9ID0gcGFyYW1zLnNvcnRNb2RlbFswXTtcXG4gICAgICAgICAgICBkYXRhLnNvcnQoKGEsIGIpID0+IHtcXG4gICAgICAgICAgICAgICAgY29uc3QgYXYgPSBhW2ZpZWxkIGFzIGtleW9mIEVtcGxveWVlXSBhcyBzdHJpbmcgfCBudW1iZXI7XFxuICAgICAgICAgICAgICAgIGNvbnN0IGJ2ID0gYltmaWVsZCBhcyBrZXlvZiBFbXBsb3llZV0gYXMgc3RyaW5nIHwgbnVtYmVyO1xcbiAgICAgICAgICAgICAgICBpZiAoYXYgPCBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gLTEgOiAxO1xcbiAgICAgICAgICAgICAgICBpZiAoYXYgPiBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gMSA6IC0xO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIGNvbnN0IHJvd0NvdW50ID0gZGF0YS5sZW5ndGg7XFxuXFxuICAgICAgICBjb25zdCBhZ2dyZWdhdGlvblJlc3VsdHM6IEdyaWRBZ2dyZWdhdGlvblJlc3VsdCA9IHt9O1xcbiAgICAgICAgaWYgKHBhcmFtcy5hZ2dyZWdhdGlvbk1vZGVsKSB7XFxuICAgICAgICAgICAgZm9yIChjb25zdCBbZmllbGQsIGZuXSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXMuYWdncmVnYXRpb25Nb2RlbCkpIHtcXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gZGF0YS5tYXAoKHIpID0+IHJbZmllbGQgYXMga2V5b2YgRW1wbG95ZWVdKS5maWx0ZXIoKHYpID0+IHYgIT0gbnVsbCk7XFxuICAgICAgICAgICAgICAgIGlmIChmbiA9PT0gJ3N1bScpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMucmVkdWNlKChhLCBiKSA9PiBhICsgTnVtYmVyKGIpLCAwKTtcXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZm4gPT09ICdhdmcnKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gdmFsdWVzLmxlbmd0aCA/IHZhbHVlcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBOdW1iZXIoYiksIDApIC8gdmFsdWVzLmxlbmd0aCA6IG51bGw7XFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuID09PSAnY291bnQnKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gdmFsdWVzLmxlbmd0aDtcXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZm4gPT09ICdtaW4nKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gTWF0aC5taW4oLi4udmFsdWVzLm1hcChOdW1iZXIpKTtcXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZm4gPT09ICdtYXgnKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gTWF0aC5tYXgoLi4udmFsdWVzLm1hcChOdW1iZXIpKTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9XFxuXFxuICAgICAgICBjb25zdCBwYWdlID0gZGF0YS5zbGljZShwYXJhbXMuc3RhcnRSb3csIHBhcmFtcy5lbmRSb3cpO1xcbiAgICAgICAgcmV0dXJuIHsgcm93czogcGFnZSwgcm93Q291bnQsIGFnZ3JlZ2F0aW9uUmVzdWx0cyB9O1xcbiAgICB9LFxcbn07XFxuXFxuY29uc3QgZm10JCA9ICh7IHZhbHVlIH06IHsgdmFsdWU6IHVua25vd24gfSkgPT5cXG4gICAgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IGAkJHtNYXRoLnJvdW5kKHZhbHVlKS50b0xvY2FsZVN0cmluZygnZW4tVVMnKX1gIDogU3RyaW5nKHZhbHVlID8/ICcnKTtcXG5cXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmPEVtcGxveWVlPltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogNjUgfSxcXG4gICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAxNTAgfSxcXG4gICAgeyBmaWVsZDogJ2RlcGFydG1lbnQnLCBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsIHdpZHRoOiAxMzAgfSxcXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxMDAgfSxcXG4gICAgeyBmaWVsZDogJ2xvY2F0aW9uJywgaGVhZGVyTmFtZTogJ0xvY2F0aW9uJywgd2lkdGg6IDEzMCB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3NhbGFyeScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcXG4gICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IGZtdCQsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnYm9udXMnLFxcbiAgICAgICAgaGVhZGVyTmFtZTogJ0JvbnVzJyxcXG4gICAgICAgIHdpZHRoOiAxMTAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IGZtdCQsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAndG90YWxDb21wJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBDb21wJyxcXG4gICAgICAgIHdpZHRoOiAxMzAsXFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IGZtdCQsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAnYWdlJyxcXG4gICAgICAgIGhlYWRlck5hbWU6ICdBZ2UnLFxcbiAgICAgICAgd2lkdGg6IDgwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICd5ZWFyc0V4cCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnRXhwZXJpZW5jZSAoeXJzKScsXFxuICAgICAgICB3aWR0aDogMTUwLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcXG4gICAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdwcm9qZWN0c0NvbXBsZXRlZCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnUHJvamVjdHMnLFxcbiAgICAgICAgd2lkdGg6IDEwMCxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXFxuICAgIH0sXFxuICAgIHtcXG4gICAgICAgIGZpZWxkOiAncGVyZm9ybWFuY2VTY29yZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnUGVyZi4gU2NvcmUnLFxcbiAgICAgICAgd2lkdGg6IDExNSxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHsgdmFsdWUgfSkgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlLnRvRml4ZWQoMikgOiBTdHJpbmcodmFsdWUgPz8gJycpLFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ2FjdGl2ZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aXZlJyxcXG4gICAgICAgIHdpZHRoOiA4MCxcXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcXG4gICAgICAgIHJlbmRlckNlbGw6ICh7IHZhbHVlIH0pID0+ICh2YWx1ZSA/ICfinIUnIDogJ+KdjCcpLFxcbiAgICB9LFxcbl07XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2VydmVyU2lkZUFnZ3JlZ2F0aW9uRGVtbygpIHtcXG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlKHsgcGFnZTogMCwgcGFnZVNpemU6IDIwIH0pO1xcbiAgICBjb25zdCBbYWdncmVnYXRpb25Nb2RlbCwgc2V0QWdncmVnYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkQWdncmVnYXRpb25Nb2RlbD4oe1xcbiAgICAgICAgc2FsYXJ5OiAnc3VtJyxcXG4gICAgICAgIGJvbnVzOiAnc3VtJyxcXG4gICAgICAgIHRvdGFsQ29tcDogJ3N1bScsXFxuICAgICAgICBhZ2U6ICdhdmcnLFxcbiAgICAgICAgeWVhcnNFeHA6ICdhdmcnLFxcbiAgICAgICAgcGVyZm9ybWFuY2VTY29yZTogJ2F2ZycsXFxuICAgIH0pO1xcblxcbiAgICBjb25zdCBkYXRhU291cmNlOiBHcmlkRGF0YVNvdXJjZTxFbXBsb3llZT4gPSB1c2VNZW1vKFxcbiAgICAgICAgKCkgPT4gKHsgZ2V0Um93czogKHApID0+IG1vY2tTZXJ2ZXIuZ2V0Um93cyhwKSB9KSxcXG4gICAgICAgIFtdXFxuICAgICk7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8RG9jc0xheW91dFxcbiAgICAgICAgICAgIHRpdGxlPVxcXCJTZXJ2ZXItU2lkZSBBZ2dyZWdhdGlvblxcXCJcXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cXFwiQWdncmVnYXRpb24gY29tcHV0ZWQgc2VydmVyLXNpZGUgb3ZlciB0aGUgZnVsbCBkYXRhc2V0LCBieXBhc3NpbmcgY2xpZW50LXNpZGUgcGFnaW5hdGlvbi4gUmVzdWx0cyBhcnJpdmUgdmlhIHRoZSBkYXRhU291cmNlIGFuZCByZW5kZXIgaW4gYSBzdGlja3kgdG90YWxzIHJvdy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8RGF0YUdyaWQ8RW1wbG95ZWU+XFxuICAgICAgICAgICAgICAgIHJvd3M9e1tdfVxcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlPXtkYXRhU291cmNlfVxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlPVxcXCJzZXJ2ZXJcXFwiXFxuICAgICAgICAgICAgICAgIHNvcnRpbmdNb2RlPVxcXCJzZXJ2ZXJcXFwiXFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjAsIDUwXX1cXG4gICAgICAgICAgICAgICAgYWdncmVnYXRpb25Nb2RlbD17YWdncmVnYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgb25BZ2dyZWdhdGlvbk1vZGVsQ2hhbmdlPXtzZXRBZ2dyZWdhdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBnZXRBZ2dyZWdhdGlvblBvc2l0aW9uPXsoKSA9PiAnZm9vdGVyJ31cXG4gICAgICAgICAgICAgICAgc2xvdHM9e3sgdG9vbGJhcjogR3JpZFRvb2xiYXIgfX1cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs1MjB9XFxuICAgICAgICAgICAgLz5cXG5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwic3MtYWdnLWluZm8tYm94XFxcIj5cXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+IEVhY2ggcGFnZSByZXF1ZXN0IHNlbmRzIHRoZSA8Y29kZT5hZ2dyZWdhdGlvbk1vZGVsPC9jb2RlPiB0b1xcbiAgICAgICAgICAgICAgICB0aGUgc2VydmVyLiBUaGUgc2VydmVyIGNvbXB1dGVzIGFnZ3JlZ2F0aW9ucyBvdmVyIGFsbCA1MDAgcm93cyBhbmQgcmV0dXJuc3snICd9XFxuICAgICAgICAgICAgICAgIDxjb2RlPmFnZ3JlZ2F0aW9uUmVzdWx0czwvY29kZT4g4oCUIHNvIHRoZSBmb290ZXIgdG90YWwgaXMgYWx3YXlzIGFjY3VyYXRlIHJlZ2FyZGxlc3Mgb2YgdGhlXFxuICAgICAgICAgICAgICAgIGN1cnJlbnQgcGFnZS5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgICBEYXRhR3JpZCxcbiAgICBHcmlkVG9vbGJhcixcbiAgICBHcmlkQ29sRGVmLFxuICAgIEdyaWREYXRhU291cmNlLFxuICAgIEdyaWRHZXRSb3dzUGFyYW1zLFxuICAgIEdyaWRHZXRSb3dzUmVzcG9uc2UsXG4gICAgR3JpZEFnZ3JlZ2F0aW9uTW9kZWwsXG4gICAgR3JpZEFnZ3JlZ2F0aW9uUmVzdWx0LFxufSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0ICcuL1NlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8uY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9TZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vLnRzeD9yYXcnO1xuXG50eXBlIEVtcGxveWVlID0ge1xuICAgIGlkOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGRlcGFydG1lbnQ6IHN0cmluZztcbiAgICByb2xlOiBzdHJpbmc7XG4gICAgbG9jYXRpb246IHN0cmluZztcbiAgICBzYWxhcnk6IG51bWJlcjtcbiAgICBib251czogbnVtYmVyO1xuICAgIHRvdGFsQ29tcDogbnVtYmVyO1xuICAgIGFnZTogbnVtYmVyO1xuICAgIHllYXJzRXhwOiBudW1iZXI7XG4gICAgcHJvamVjdHNDb21wbGV0ZWQ6IG51bWJlcjtcbiAgICBwZXJmb3JtYW5jZVNjb3JlOiBudW1iZXI7XG4gICAgYWN0aXZlOiBib29sZWFuO1xufTtcblxuY29uc3QgREVQQVJUTUVOVFMgPSBbJ0VuZ2luZWVyaW5nJywgJ1NhbGVzJywgJ01hcmtldGluZycsICdIUicsICdGaW5hbmNlJywgJ09wZXJhdGlvbnMnXTtcbmNvbnN0IFJPTEVTID0gWydKdW5pb3InLCAnTWlkJywgJ1NlbmlvcicsICdMZWFkJywgJ01hbmFnZXInLCAnRGlyZWN0b3InXTtcbmNvbnN0IExPQ0FUSU9OUyA9IFsnTmV3IFlvcmsnLCAnU2FuIEZyYW5jaXNjbycsICdBdXN0aW4nLCAnQ2hpY2FnbycsICdMb25kb24nLCAnQmVybGluJ107XG5cbmZ1bmN0aW9uIHNlZWRlZFJhbmRvbShzZWVkOiBudW1iZXIpIHtcbiAgICBjb25zdCB4ID0gTWF0aC5zaW4oc2VlZCArIDEpICogMTAwMDA7XG4gICAgcmV0dXJuIHggLSBNYXRoLmZsb29yKHgpO1xufVxuXG5jb25zdCBBTExfRU1QTE9ZRUVTOiBFbXBsb3llZVtdID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogNTAwIH0sIChfLCBpKSA9PiB7XG4gICAgY29uc3Qgc2FsYXJ5ID0gNDBfMDAwICsgTWF0aC5mbG9vcihzZWVkZWRSYW5kb20oaSAqIDMpICogMTIwXzAwMCk7XG4gICAgY29uc3QgYm9udXMgPSBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogNyArIDEpICogMjVfMDAwKTtcbiAgICBjb25zdCBwcm9qZWN0cyA9IDEgKyBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogMTEgKyAyKSAqIDMwKTtcbiAgICBjb25zdCBwZXJmU2NvcmUgPSBNYXRoLnJvdW5kKCgyICsgc2VlZGVkUmFuZG9tKGkgKiAxMyArIDMpICogMykgKiAxMCkgLyAxMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogaSArIDEsXG4gICAgICAgIG5hbWU6IGBFbXBsb3llZSAke2kgKyAxfWAsXG4gICAgICAgIGRlcGFydG1lbnQ6IERFUEFSVE1FTlRTW2kgJSBERVBBUlRNRU5UUy5sZW5ndGhdLFxuICAgICAgICByb2xlOiBST0xFU1tpICUgUk9MRVMubGVuZ3RoXSxcbiAgICAgICAgbG9jYXRpb246IExPQ0FUSU9OU1tNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogNSkgKiBMT0NBVElPTlMubGVuZ3RoKV0sXG4gICAgICAgIHNhbGFyeSxcbiAgICAgICAgYm9udXMsXG4gICAgICAgIHRvdGFsQ29tcDogc2FsYXJ5ICsgYm9udXMsXG4gICAgICAgIGFnZTogMjIgKyBNYXRoLmZsb29yKHNlZWRlZFJhbmRvbShpICogMTcgKyA0KSAqIDQwKSxcbiAgICAgICAgeWVhcnNFeHA6IE1hdGguZmxvb3Ioc2VlZGVkUmFuZG9tKGkgKiAxOSArIDUpICogMjApLFxuICAgICAgICBwcm9qZWN0c0NvbXBsZXRlZDogcHJvamVjdHMsXG4gICAgICAgIHBlcmZvcm1hbmNlU2NvcmU6IHBlcmZTY29yZSxcbiAgICAgICAgYWN0aXZlOiBpICUgNSAhPT0gMCxcbiAgICB9O1xufSk7XG5cbmNvbnN0IG1vY2tTZXJ2ZXIgPSB7XG4gICAgYXN5bmMgZ2V0Um93cyhwYXJhbXM6IEdyaWRHZXRSb3dzUGFyYW1zKTogUHJvbWlzZTxHcmlkR2V0Um93c1Jlc3BvbnNlPEVtcGxveWVlPj4ge1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCA1MDApKTtcblxuICAgICAgICBjb25zdCBkYXRhID0gWy4uLkFMTF9FTVBMT1lFRVNdO1xuXG4gICAgICAgIGlmIChwYXJhbXMuc29ydE1vZGVsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGQsIHNvcnQgfSA9IHBhcmFtcy5zb3J0TW9kZWxbMF07XG4gICAgICAgICAgICBkYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdiA9IGFbZmllbGQgYXMga2V5b2YgRW1wbG95ZWVdIGFzIHN0cmluZyB8IG51bWJlcjtcbiAgICAgICAgICAgICAgICBjb25zdCBidiA9IGJbZmllbGQgYXMga2V5b2YgRW1wbG95ZWVdIGFzIHN0cmluZyB8IG51bWJlcjtcbiAgICAgICAgICAgICAgICBpZiAoYXYgPCBidikgcmV0dXJuIHNvcnQgPT09ICdhc2MnID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGlmIChhdiA+IGJ2KSByZXR1cm4gc29ydCA9PT0gJ2FzYycgPyAxIDogLTE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvd0NvdW50ID0gZGF0YS5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgYWdncmVnYXRpb25SZXN1bHRzOiBHcmlkQWdncmVnYXRpb25SZXN1bHQgPSB7fTtcbiAgICAgICAgaWYgKHBhcmFtcy5hZ2dyZWdhdGlvbk1vZGVsKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgZm5dIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtcy5hZ2dyZWdhdGlvbk1vZGVsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IGRhdGEubWFwKChyKSA9PiByW2ZpZWxkIGFzIGtleW9mIEVtcGxveWVlXSkuZmlsdGVyKCh2KSA9PiB2ICE9IG51bGwpO1xuICAgICAgICAgICAgICAgIGlmIChmbiA9PT0gJ3N1bScpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMucmVkdWNlKChhLCBiKSA9PiBhICsgTnVtYmVyKGIpLCAwKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ2F2ZycpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIE51bWJlcihiKSwgMCkgLyB2YWx1ZXMubGVuZ3RoIDogbnVsbDtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ2NvdW50JykgYWdncmVnYXRpb25SZXN1bHRzW2ZpZWxkXSA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZm4gPT09ICdtaW4nKSBhZ2dyZWdhdGlvblJlc3VsdHNbZmllbGRdID0gTWF0aC5taW4oLi4udmFsdWVzLm1hcChOdW1iZXIpKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmbiA9PT0gJ21heCcpIGFnZ3JlZ2F0aW9uUmVzdWx0c1tmaWVsZF0gPSBNYXRoLm1heCguLi52YWx1ZXMubWFwKE51bWJlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFnZSA9IGRhdGEuc2xpY2UocGFyYW1zLnN0YXJ0Um93LCBwYXJhbXMuZW5kUm93KTtcbiAgICAgICAgcmV0dXJuIHsgcm93czogcGFnZSwgcm93Q291bnQsIGFnZ3JlZ2F0aW9uUmVzdWx0cyB9O1xuICAgIH0sXG59O1xuXG5jb25zdCBmbXQkID0gKHsgdmFsdWUgfTogeyB2YWx1ZTogdW5rbm93biB9KSA9PlxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyBgJCR7TWF0aC5yb3VuZCh2YWx1ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJyl9YCA6IFN0cmluZyh2YWx1ZSA/PyAnJyk7XG5cbmNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWY8RW1wbG95ZWU+W10gPSBbXG4gICAgeyBmaWVsZDogJ2lkJywgaGVhZGVyTmFtZTogJ0lEJywgd2lkdGg6IDY1IH0sXG4gICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAxNTAgfSxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDEzMCB9LFxuICAgIHsgZmllbGQ6ICdyb2xlJywgaGVhZGVyTmFtZTogJ1JvbGUnLCB3aWR0aDogMTAwIH0sXG4gICAgeyBmaWVsZDogJ2xvY2F0aW9uJywgaGVhZGVyTmFtZTogJ0xvY2F0aW9uJywgd2lkdGg6IDEzMCB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdzYWxhcnknLFxuICAgICAgICBoZWFkZXJOYW1lOiAnU2FsYXJ5JyxcbiAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBoZWFkZXJBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgYWdncmVnYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IGZtdCQsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnYm9udXMnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnQm9udXMnLFxuICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogZm10JCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICd0b3RhbENvbXAnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnVG90YWwgQ29tcCcsXG4gICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgICAgIHZhbHVlRm9ybWF0dGVyOiBmbXQkLFxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ2FnZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdBZ2UnLFxuICAgICAgICB3aWR0aDogODAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAneWVhcnNFeHAnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnRXhwZXJpZW5jZSAoeXJzKScsXG4gICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgaGVhZGVyQWxpZ246ICdyaWdodCcsXG4gICAgICAgIGFnZ3JlZ2FibGU6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAncHJvamVjdHNDb21wbGV0ZWQnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnUHJvamVjdHMnLFxuICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ3BlcmZvcm1hbmNlU2NvcmUnLFxuICAgICAgICBoZWFkZXJOYW1lOiAnUGVyZi4gU2NvcmUnLFxuICAgICAgICB3aWR0aDogMTE1LFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGhlYWRlckFsaWduOiAncmlnaHQnLFxuICAgICAgICBhZ2dyZWdhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHsgdmFsdWUgfSkgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlLnRvRml4ZWQoMikgOiBTdHJpbmcodmFsdWUgPz8gJycpLFxuICAgIH0sXG4gICAge1xuICAgICAgICBmaWVsZDogJ2FjdGl2ZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdBY3RpdmUnLFxuICAgICAgICB3aWR0aDogODAsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgcmVuZGVyQ2VsbDogKHsgdmFsdWUgfSkgPT4gKHZhbHVlID8gJ+KchScgOiAn4p2MJyksXG4gICAgfSxcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNlcnZlclNpZGVBZ2dyZWdhdGlvbkRlbW8oKSB7XG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlKHsgcGFnZTogMCwgcGFnZVNpemU6IDIwIH0pO1xuICAgIGNvbnN0IFthZ2dyZWdhdGlvbk1vZGVsLCBzZXRBZ2dyZWdhdGlvbk1vZGVsXSA9IHVzZVN0YXRlPEdyaWRBZ2dyZWdhdGlvbk1vZGVsPih7XG4gICAgICAgIHNhbGFyeTogJ3N1bScsXG4gICAgICAgIGJvbnVzOiAnc3VtJyxcbiAgICAgICAgdG90YWxDb21wOiAnc3VtJyxcbiAgICAgICAgYWdlOiAnYXZnJyxcbiAgICAgICAgeWVhcnNFeHA6ICdhdmcnLFxuICAgICAgICBwZXJmb3JtYW5jZVNjb3JlOiAnYXZnJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRhdGFTb3VyY2U6IEdyaWREYXRhU291cmNlPEVtcGxveWVlPiA9IHVzZU1lbW8oXG4gICAgICAgICgpID0+ICh7IGdldFJvd3M6IChwKSA9PiBtb2NrU2VydmVyLmdldFJvd3MocCkgfSksXG4gICAgICAgIFtdXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIlNlcnZlci1TaWRlIEFnZ3JlZ2F0aW9uXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiQWdncmVnYXRpb24gY29tcHV0ZWQgc2VydmVyLXNpZGUgb3ZlciB0aGUgZnVsbCBkYXRhc2V0LCBieXBhc3NpbmcgY2xpZW50LXNpZGUgcGFnaW5hdGlvbi4gUmVzdWx0cyBhcnJpdmUgdmlhIHRoZSBkYXRhU291cmNlIGFuZCByZW5kZXIgaW4gYSBzdGlja3kgdG90YWxzIHJvdy5cIlxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPERhdGFHcmlkPEVtcGxveWVlPlxuICAgICAgICAgICAgICAgIHJvd3M9e1tdfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZT17ZGF0YVNvdXJjZX1cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGU9XCJzZXJ2ZXJcIlxuICAgICAgICAgICAgICAgIHNvcnRpbmdNb2RlPVwic2VydmVyXCJcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyMCwgNTBdfVxuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uTW9kZWw9e2FnZ3JlZ2F0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgb25BZ2dyZWdhdGlvbk1vZGVsQ2hhbmdlPXtzZXRBZ2dyZWdhdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIGdldEFnZ3JlZ2F0aW9uUG9zaXRpb249eygpID0+ICdmb290ZXInfVxuICAgICAgICAgICAgICAgIHNsb3RzPXt7IHRvb2xiYXI6IEdyaWRUb29sYmFyIH19XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs1MjB9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNzLWFnZy1pbmZvLWJveFwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPiBFYWNoIHBhZ2UgcmVxdWVzdCBzZW5kcyB0aGUgPGNvZGU+YWdncmVnYXRpb25Nb2RlbDwvY29kZT4gdG9cbiAgICAgICAgICAgICAgICB0aGUgc2VydmVyLiBUaGUgc2VydmVyIGNvbXB1dGVzIGFnZ3JlZ2F0aW9ucyBvdmVyIGFsbCA1MDAgcm93cyBhbmQgcmV0dXJuc3snICd9XG4gICAgICAgICAgICAgICAgPGNvZGU+YWdncmVnYXRpb25SZXN1bHRzPC9jb2RlPiDigJQgc28gdGhlIGZvb3RlciB0b3RhbCBpcyBhbHdheXMgYWNjdXJhdGUgcmVnYXJkbGVzcyBvZiB0aGVcbiAgICAgICAgICAgICAgICBjdXJyZW50IHBhZ2UuXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsIkRFUEFSVE1FTlRTIiwiUk9MRVMiLCJMT0NBVElPTlMiLCJzZWVkZWRSYW5kb20iLCJzZWVkIiwieCIsIkFMTF9FTVBMT1lFRVMiLCJfIiwiaSIsInNhbGFyeSIsImJvbnVzIiwicHJvamVjdHMiLCJwZXJmU2NvcmUiLCJtb2NrU2VydmVyIiwicGFyYW1zIiwiciIsImRhdGEiLCJmaWVsZCIsInNvcnQiLCJhIiwiYiIsImF2IiwiYnYiLCJyb3dDb3VudCIsImFnZ3JlZ2F0aW9uUmVzdWx0cyIsImZuIiwidmFsdWVzIiwidiIsImZtdCQiLCJ2YWx1ZSIsImNvbHVtbnMiLCJTZXJ2ZXJTaWRlQWdncmVnYXRpb25EZW1vIiwicGFnaW5hdGlvbk1vZGVsIiwic2V0UGFnaW5hdGlvbk1vZGVsIiwidXNlU3RhdGUiLCJhZ2dyZWdhdGlvbk1vZGVsIiwic2V0QWdncmVnYXRpb25Nb2RlbCIsImRhdGFTb3VyY2UiLCJ1c2VNZW1vIiwicCIsImpzeHMiLCJEb2NzTGF5b3V0IiwianN4IiwiRGF0YUdyaWQiLCJHcmlkVG9vbGJhciJdLCJtYXBwaW5ncyI6InNKQUFBLE1BQUFBLEVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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
