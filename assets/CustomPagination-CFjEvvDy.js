import{r as m,j as e}from"./vendor-react-f02LKZLu.js";import{D as u}from"./opengridx-mcNSJXb6.js";import{D as h}from"./DocsLayout-CwTr2FWN.js";const C=`
import { useState } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './CustomPagination.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CustomPagination.tsx?raw';

interface CustomPaginationComponentProps {
    page: number;
    pageSize: number;
    rowCount: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function CustomPaginationComponent(props: CustomPaginationComponentProps) {
    const {
        page,
        pageSize,
        rowCount,
        pageSizeOptions = [10, 25, 50],
        onPageChange,
        onPageSizeChange
    } = props;

    const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
    const currentPage = Math.min(page, pageCount - 1);
    const firstRowIndex = currentPage * pageSize;
    const lastRowIndex = Math.min(firstRowIndex + pageSize, rowCount);

    return (
        <div className="custom-pagination-root">
            <div className="pagination-page-size-select">
                <label className="pagination-label">
                    Rows per page:
                </label>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                    className="pagination-select"
                >
                    {pageSizeOptions.map((option: number) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className="pagination-info">
                {firstRowIndex + 1}–{lastRowIndex} of {rowCount}
            </div>

            <div className="pagination-actions">
                <button
                    onClick={() => onPageChange(0)}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                >
                    First
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                >
                    Prev
                </button>
                <span className="pagination-current-text">
                    Page {currentPage + 1} of {pageCount}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= pageCount - 1}
                    className="pagination-btn"
                >
                    Next
                </button>
                <button
                    onClick={() => onPageChange(pageCount - 1)}
                    disabled={currentPage >= pageCount - 1}
                    className="pagination-btn"
                >
                    Last
                </button>
            </div>
        </div>
    );
}

const rows = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: \`User \${i + 1}\`,
    email: \`user\${i + 1}@example.com\`,
    age: 20 + (i % 50),
    city: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][i % 5],
    department: ['HR', 'IT', 'Finance', 'Marketing', 'Sales'][i % 5],
    role: ['Manager', 'Developer', 'Designer', 'Tester', 'Analyst'][i % 5],
    salary: 5000 + (i % 10000)
}));

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 150 }
];

export default function CustomPaginationDemo() {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });

    return (
        <DocsLayout
            title="Custom Pagination"
            description="Provide your own pagination UI via the slots API while keeping all built-in server-side pagination logic. Full control over page size, navigation, and styling."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
                height={600}
                slots={{
                    pagination: CustomPaginationComponent
                }}
            />
        </DocsLayout>
    );
}
`;function P(o){const{page:a,pageSize:s,rowCount:l,pageSizeOptions:d=[10,25,50],onPageChange:r,onPageSizeChange:p}=o,t=Math.max(1,Math.ceil(l/s)),n=Math.min(a,t-1),g=n*s,c=Math.min(g+s,l);return e.jsxs("div",{className:"custom-pagination-root",children:[e.jsxs("div",{className:"pagination-page-size-select",children:[e.jsx("label",{className:"pagination-label",children:"Rows per page:"}),e.jsx("select",{value:s,onChange:i=>p(parseInt(i.target.value,10)),className:"pagination-select",children:d.map(i=>e.jsx("option",{value:i,children:i},i))})]}),e.jsxs("div",{className:"pagination-info",children:[g+1,"–",c," of ",l]}),e.jsxs("div",{className:"pagination-actions",children:[e.jsx("button",{onClick:()=>r(0),disabled:n===0,className:"pagination-btn",children:"First"}),e.jsx("button",{onClick:()=>r(n-1),disabled:n===0,className:"pagination-btn",children:"Prev"}),e.jsxs("span",{className:"pagination-current-text",children:["Page ",n+1," of ",t]}),e.jsx("button",{onClick:()=>r(n+1),disabled:n>=t-1,className:"pagination-btn",children:"Next"}),e.jsx("button",{onClick:()=>r(t-1),disabled:n>=t-1,className:"pagination-btn",children:"Last"})]})]})}const b=Array.from({length:1e3},(o,a)=>({id:a+1,name:`User ${a+1}`,email:`user${a+1}@example.com`,age:20+a%50,city:["New York","London","Tokyo","Paris","Berlin"][a%5],department:["HR","IT","Finance","Marketing","Sales"][a%5],role:["Manager","Developer","Designer","Tester","Analyst"][a%5],salary:5e3+a%1e4})),f=[{field:"id",headerName:"ID",width:70},{field:"name",headerName:"Name",width:150},{field:"email",headerName:"Email",width:200},{field:"age",headerName:"Age",width:100},{field:"city",headerName:"City",width:150},{field:"department",headerName:"Department",width:150},{field:"role",headerName:"Role",width:150},{field:"salary",headerName:"Salary",width:150}];function v(){const[o,a]=m.useState({page:0,pageSize:10});return e.jsx(h,{title:"Custom Pagination",description:"Provide your own pagination UI via the slots API while keeping all built-in server-side pagination logic. Full control over page size, navigation, and styling.",sourceCode:C,children:e.jsx(u,{rows:b,columns:f,pagination:!0,paginationModel:o,onPaginationModelChange:a,pageSizeOptions:[10,25,50,100],checkboxSelection:!0,height:600,slots:{pagination:P}})})}export{v as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tUGFnaW5hdGlvbi1DRmpFdnZEeS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvQ3VzdG9tUGFnaW5hdGlvbi9DdXN0b21QYWdpbmF0aW9uLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DdXN0b21QYWdpbmF0aW9uL0N1c3RvbVBhZ2luYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9DdXN0b21QYWdpbmF0aW9uLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9DdXN0b21QYWdpbmF0aW9uLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50UHJvcHMge1xcbiAgICBwYWdlOiBudW1iZXI7XFxuICAgIHBhZ2VTaXplOiBudW1iZXI7XFxuICAgIHJvd0NvdW50OiBudW1iZXI7XFxuICAgIHBhZ2VTaXplT3B0aW9ucz86IG51bWJlcltdO1xcbiAgICBvblBhZ2VDaGFuZ2U6IChwYWdlOiBudW1iZXIpID0+IHZvaWQ7XFxuICAgIG9uUGFnZVNpemVDaGFuZ2U6IChwYWdlU2l6ZTogbnVtYmVyKSA9PiB2b2lkO1xcbn1cXG5cXG5mdW5jdGlvbiBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50KHByb3BzOiBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50UHJvcHMpIHtcXG4gICAgY29uc3Qge1xcbiAgICAgICAgcGFnZSxcXG4gICAgICAgIHBhZ2VTaXplLFxcbiAgICAgICAgcm93Q291bnQsXFxuICAgICAgICBwYWdlU2l6ZU9wdGlvbnMgPSBbMTAsIDI1LCA1MF0sXFxuICAgICAgICBvblBhZ2VDaGFuZ2UsXFxuICAgICAgICBvblBhZ2VTaXplQ2hhbmdlXFxuICAgIH0gPSBwcm9wcztcXG5cXG4gICAgY29uc3QgcGFnZUNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKHJvd0NvdW50IC8gcGFnZVNpemUpKTtcXG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSBNYXRoLm1pbihwYWdlLCBwYWdlQ291bnQgLSAxKTtcXG4gICAgY29uc3QgZmlyc3RSb3dJbmRleCA9IGN1cnJlbnRQYWdlICogcGFnZVNpemU7XFxuICAgIGNvbnN0IGxhc3RSb3dJbmRleCA9IE1hdGgubWluKGZpcnN0Um93SW5kZXggKyBwYWdlU2l6ZSwgcm93Q291bnQpO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImN1c3RvbS1wYWdpbmF0aW9uLXJvb3RcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLXBhZ2Utc2l6ZS1zZWxlY3RcXFwiPlxcbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLWxhYmVsXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIFJvd3MgcGVyIHBhZ2U6XFxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XFxuICAgICAgICAgICAgICAgIDxzZWxlY3RcXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYWdlU2l6ZX1cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gb25QYWdlU2l6ZUNoYW5nZShwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApKX1cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwicGFnaW5hdGlvbi1zZWxlY3RcXFwiXFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIHtwYWdlU2l6ZU9wdGlvbnMubWFwKChvcHRpb246IG51bWJlcikgPT4gKFxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb259IHZhbHVlPXtvcHRpb259PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b3B0aW9ufVxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxcbiAgICAgICAgICAgICAgICAgICAgKSl9XFxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLWluZm9cXFwiPlxcbiAgICAgICAgICAgICAgICB7Zmlyc3RSb3dJbmRleCArIDF94oCTe2xhc3RSb3dJbmRleH0gb2Yge3Jvd0NvdW50fVxcbiAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLWFjdGlvbnNcXFwiPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UoMCl9XFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPT09IDB9XFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tYnRuXFxcIlxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICBGaXJzdFxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QYWdlQ2hhbmdlKGN1cnJlbnRQYWdlIC0gMSl9XFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPT09IDB9XFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tYnRuXFxcIlxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICBQcmV2XFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tY3VycmVudC10ZXh0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIFBhZ2Uge2N1cnJlbnRQYWdlICsgMX0gb2Yge3BhZ2VDb3VudH1cXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UoY3VycmVudFBhZ2UgKyAxKX1cXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA+PSBwYWdlQ291bnQgLSAxfVxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLWJ0blxcXCJcXG4gICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgTmV4dFxcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QYWdlQ2hhbmdlKHBhZ2VDb3VudCAtIDEpfVxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2N1cnJlbnRQYWdlID49IHBhZ2VDb3VudCAtIDF9XFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tYnRuXFxcIlxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICBMYXN0XFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICk7XFxufVxcblxcbmNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMDAwIH0sIChfLCBpKSA9PiAoe1xcbiAgICBpZDogaSArIDEsXFxuICAgIG5hbWU6IGBVc2VyICR7aSArIDF9YCxcXG4gICAgZW1haWw6IGB1c2VyJHtpICsgMX1AZXhhbXBsZS5jb21gLFxcbiAgICBhZ2U6IDIwICsgKGkgJSA1MCksXFxuICAgIGNpdHk6IFsnTmV3IFlvcmsnLCAnTG9uZG9uJywgJ1Rva3lvJywgJ1BhcmlzJywgJ0JlcmxpbiddW2kgJSA1XSxcXG4gICAgZGVwYXJ0bWVudDogWydIUicsICdJVCcsICdGaW5hbmNlJywgJ01hcmtldGluZycsICdTYWxlcyddW2kgJSA1XSxcXG4gICAgcm9sZTogWydNYW5hZ2VyJywgJ0RldmVsb3BlcicsICdEZXNpZ25lcicsICdUZXN0ZXInLCAnQW5hbHlzdCddW2kgJSA1XSxcXG4gICAgc2FsYXJ5OiA1MDAwICsgKGkgJSAxMDAwMClcXG59KSk7XFxuXFxuY29uc3QgY29sdW1uczogR3JpZENvbERlZltdID0gW1xcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogNzAgfSxcXG4gICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHdpZHRoOiAxNTAgfSxcXG4gICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDIwMCB9LFxcbiAgICB7IGZpZWxkOiAnYWdlJywgaGVhZGVyTmFtZTogJ0FnZScsIHdpZHRoOiAxMDAgfSxcXG4gICAgeyBmaWVsZDogJ2NpdHknLCBoZWFkZXJOYW1lOiAnQ2l0eScsIHdpZHRoOiAxNTAgfSxcXG4gICAgeyBmaWVsZDogJ2RlcGFydG1lbnQnLCBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsIHdpZHRoOiAxNTAgfSxcXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxNTAgfSxcXG4gICAgeyBmaWVsZDogJ3NhbGFyeScsIGhlYWRlck5hbWU6ICdTYWxhcnknLCB3aWR0aDogMTUwIH1cXG5dO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEN1c3RvbVBhZ2luYXRpb25EZW1vKCkge1xcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGUoe1xcbiAgICAgICAgcGFnZTogMCxcXG4gICAgICAgIHBhZ2VTaXplOiAxMFxcbiAgICB9KTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIkN1c3RvbSBQYWdpbmF0aW9uXFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJQcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gVUkgdmlhIHRoZSBzbG90cyBBUEkgd2hpbGUga2VlcGluZyBhbGwgYnVpbHQtaW4gc2VydmVyLXNpZGUgcGFnaW5hdGlvbiBsb2dpYy4gRnVsbCBjb250cm9sIG92ZXIgcGFnZSBzaXplLCBuYXZpZ2F0aW9uLCBhbmQgc3R5bGluZy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTW9kZWw9e3BhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDI1LCA1MCwgMTAwXX1cXG4gICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XFxuICAgICAgICAgICAgICAgIHNsb3RzPXt7XFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uOiBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50XFxuICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0ICcuL0N1c3RvbVBhZ2luYXRpb24uY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9DdXN0b21QYWdpbmF0aW9uLnRzeD9yYXcnO1xuXG5pbnRlcmZhY2UgQ3VzdG9tUGFnaW5hdGlvbkNvbXBvbmVudFByb3BzIHtcbiAgICBwYWdlOiBudW1iZXI7XG4gICAgcGFnZVNpemU6IG51bWJlcjtcbiAgICByb3dDb3VudDogbnVtYmVyO1xuICAgIHBhZ2VTaXplT3B0aW9ucz86IG51bWJlcltdO1xuICAgIG9uUGFnZUNoYW5nZTogKHBhZ2U6IG51bWJlcikgPT4gdm9pZDtcbiAgICBvblBhZ2VTaXplQ2hhbmdlOiAocGFnZVNpemU6IG51bWJlcikgPT4gdm9pZDtcbn1cblxuZnVuY3Rpb24gQ3VzdG9tUGFnaW5hdGlvbkNvbXBvbmVudChwcm9wczogQ3VzdG9tUGFnaW5hdGlvbkNvbXBvbmVudFByb3BzKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBwYWdlLFxuICAgICAgICBwYWdlU2l6ZSxcbiAgICAgICAgcm93Q291bnQsXG4gICAgICAgIHBhZ2VTaXplT3B0aW9ucyA9IFsxMCwgMjUsIDUwXSxcbiAgICAgICAgb25QYWdlQ2hhbmdlLFxuICAgICAgICBvblBhZ2VTaXplQ2hhbmdlXG4gICAgfSA9IHByb3BzO1xuXG4gICAgY29uc3QgcGFnZUNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5jZWlsKHJvd0NvdW50IC8gcGFnZVNpemUpKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IE1hdGgubWluKHBhZ2UsIHBhZ2VDb3VudCAtIDEpO1xuICAgIGNvbnN0IGZpcnN0Um93SW5kZXggPSBjdXJyZW50UGFnZSAqIHBhZ2VTaXplO1xuICAgIGNvbnN0IGxhc3RSb3dJbmRleCA9IE1hdGgubWluKGZpcnN0Um93SW5kZXggKyBwYWdlU2l6ZSwgcm93Q291bnQpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjdXN0b20tcGFnaW5hdGlvbi1yb290XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2luYXRpb24tcGFnZS1zaXplLXNlbGVjdFwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIFJvd3MgcGVyIHBhZ2U6XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYWdlU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBvblBhZ2VTaXplQ2hhbmdlKHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCkpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLXNlbGVjdFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7cGFnZVNpemVPcHRpb25zLm1hcCgob3B0aW9uOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtvcHRpb259IHZhbHVlPXtvcHRpb259PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvcHRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWluZm9cIj5cbiAgICAgICAgICAgICAgICB7Zmlyc3RSb3dJbmRleCArIDF94oCTe2xhc3RSb3dJbmRleH0gb2Yge3Jvd0NvdW50fVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UoMCl9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1idG5cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgRmlyc3RcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGFnZUNoYW5nZShjdXJyZW50UGFnZSAtIDEpfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInBhZ2luYXRpb24tYnRuXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIFByZXZcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWN1cnJlbnQtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICBQYWdlIHtjdXJyZW50UGFnZSArIDF9IG9mIHtwYWdlQ291bnR9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QYWdlQ2hhbmdlKGN1cnJlbnRQYWdlICsgMSl9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA+PSBwYWdlQ291bnQgLSAxfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWJ0blwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBOZXh0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UocGFnZUNvdW50IC0gMSl9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA+PSBwYWdlQ291bnQgLSAxfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWJ0blwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBMYXN0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cblxuY29uc3Qgcm93cyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDEwMDAgfSwgKF8sIGkpID0+ICh7XG4gICAgaWQ6IGkgKyAxLFxuICAgIG5hbWU6IGBVc2VyICR7aSArIDF9YCxcbiAgICBlbWFpbDogYHVzZXIke2kgKyAxfUBleGFtcGxlLmNvbWAsXG4gICAgYWdlOiAyMCArIChpICUgNTApLFxuICAgIGNpdHk6IFsnTmV3IFlvcmsnLCAnTG9uZG9uJywgJ1Rva3lvJywgJ1BhcmlzJywgJ0JlcmxpbiddW2kgJSA1XSxcbiAgICBkZXBhcnRtZW50OiBbJ0hSJywgJ0lUJywgJ0ZpbmFuY2UnLCAnTWFya2V0aW5nJywgJ1NhbGVzJ11baSAlIDVdLFxuICAgIHJvbGU6IFsnTWFuYWdlcicsICdEZXZlbG9wZXInLCAnRGVzaWduZXInLCAnVGVzdGVyJywgJ0FuYWx5c3QnXVtpICUgNV0sXG4gICAgc2FsYXJ5OiA1MDAwICsgKGkgJSAxMDAwMClcbn0pKTtcblxuY29uc3QgY29sdW1uczogR3JpZENvbERlZltdID0gW1xuICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA3MCB9LFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCB3aWR0aDogMTUwIH0sXG4gICAgeyBmaWVsZDogJ2VtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgd2lkdGg6IDIwMCB9LFxuICAgIHsgZmllbGQ6ICdhZ2UnLCBoZWFkZXJOYW1lOiAnQWdlJywgd2lkdGg6IDEwMCB9LFxuICAgIHsgZmllbGQ6ICdjaXR5JywgaGVhZGVyTmFtZTogJ0NpdHknLCB3aWR0aDogMTUwIH0sXG4gICAgeyBmaWVsZDogJ2RlcGFydG1lbnQnLCBoZWFkZXJOYW1lOiAnRGVwYXJ0bWVudCcsIHdpZHRoOiAxNTAgfSxcbiAgICB7IGZpZWxkOiAncm9sZScsIGhlYWRlck5hbWU6ICdSb2xlJywgd2lkdGg6IDE1MCB9LFxuICAgIHsgZmllbGQ6ICdzYWxhcnknLCBoZWFkZXJOYW1lOiAnU2FsYXJ5Jywgd2lkdGg6IDE1MCB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDdXN0b21QYWdpbmF0aW9uRGVtbygpIHtcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGUoe1xuICAgICAgICBwYWdlOiAwLFxuICAgICAgICBwYWdlU2l6ZTogMTBcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkN1c3RvbSBQYWdpbmF0aW9uXCJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiUHJvdmlkZSB5b3VyIG93biBwYWdpbmF0aW9uIFVJIHZpYSB0aGUgc2xvdHMgQVBJIHdoaWxlIGtlZXBpbmcgYWxsIGJ1aWx0LWluIHNlcnZlci1zaWRlIHBhZ2luYXRpb24gbG9naWMuIEZ1bGwgY29udHJvbCBvdmVyIHBhZ2Ugc2l6ZSwgbmF2aWdhdGlvbiwgYW5kIHN0eWxpbmcuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e3Jvd3N9XG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uc31cbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGVsPXtwYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwLCAxMDBdfVxuICAgICAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs2MDB9XG4gICAgICAgICAgICAgICAgc2xvdHM9e3tcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjogQ3VzdG9tUGFnaW5hdGlvbkNvbXBvbmVudFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiQ3VzdG9tUGFnaW5hdGlvbkNvbXBvbmVudCIsInByb3BzIiwicGFnZSIsInBhZ2VTaXplIiwicm93Q291bnQiLCJwYWdlU2l6ZU9wdGlvbnMiLCJvblBhZ2VDaGFuZ2UiLCJvblBhZ2VTaXplQ2hhbmdlIiwicGFnZUNvdW50IiwiY3VycmVudFBhZ2UiLCJmaXJzdFJvd0luZGV4IiwibGFzdFJvd0luZGV4IiwianN4cyIsImpzeCIsImUiLCJvcHRpb24iLCJyb3dzIiwiXyIsImkiLCJjb2x1bW5zIiwiQ3VzdG9tUGFnaW5hdGlvbkRlbW8iLCJwYWdpbmF0aW9uTW9kZWwiLCJzZXRQYWdpbmF0aW9uTW9kZWwiLCJ1c2VTdGF0ZSIsIkRvY3NMYXlvdXQiLCJEYXRhR3JpZCJdLCJtYXBwaW5ncyI6IitJQUFBLE1BQUFBLEVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUNnQmYsU0FBU0MsRUFBMEJDLEVBQXVDLENBQ3RFLEtBQU0sQ0FDRixLQUFBQyxFQUNB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
