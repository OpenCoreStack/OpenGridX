import{r as m,j as e}from"./vendor-react-LmGMyLnN.js";import{D as u}from"./opengridx-DRbmQSJO.js";import{D as h}from"./DocsLayout-BoGj89NG.js";const C=`
import { useState } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import './CustomPagination.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './CustomPagination.tsx?raw';

interface CustomPaginationComponentProps {
    page: number;
    pageSize: number;
    rowCount: number;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function CustomPaginationComponent(props: CustomPaginationComponentProps) {
    const {
        page,
        pageSize,
        rowCount,
        pageSizeOptions,
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
`;function P(o){const{page:a,pageSize:s,rowCount:l,pageSizeOptions:d,onPageChange:r,onPageSizeChange:p}=o,t=Math.max(1,Math.ceil(l/s)),n=Math.min(a,t-1),g=n*s,c=Math.min(g+s,l);return e.jsxs("div",{className:"custom-pagination-root",children:[e.jsxs("div",{className:"pagination-page-size-select",children:[e.jsx("label",{className:"pagination-label",children:"Rows per page:"}),e.jsx("select",{value:s,onChange:i=>p(parseInt(i.target.value,10)),className:"pagination-select",children:d.map(i=>e.jsx("option",{value:i,children:i},i))})]}),e.jsxs("div",{className:"pagination-info",children:[g+1,"–",c," of ",l]}),e.jsxs("div",{className:"pagination-actions",children:[e.jsx("button",{onClick:()=>r(0),disabled:n===0,className:"pagination-btn",children:"First"}),e.jsx("button",{onClick:()=>r(n-1),disabled:n===0,className:"pagination-btn",children:"Prev"}),e.jsxs("span",{className:"pagination-current-text",children:["Page ",n+1," of ",t]}),e.jsx("button",{onClick:()=>r(n+1),disabled:n>=t-1,className:"pagination-btn",children:"Next"}),e.jsx("button",{onClick:()=>r(t-1),disabled:n>=t-1,className:"pagination-btn",children:"Last"})]})]})}const b=Array.from({length:1e3},(o,a)=>({id:a+1,name:`User ${a+1}`,email:`user${a+1}@example.com`,age:20+a%50,city:["New York","London","Tokyo","Paris","Berlin"][a%5],department:["HR","IT","Finance","Marketing","Sales"][a%5],role:["Manager","Developer","Designer","Tester","Analyst"][a%5],salary:5e3+a%1e4})),f=[{field:"id",headerName:"ID",width:70},{field:"name",headerName:"Name",width:150},{field:"email",headerName:"Email",width:200},{field:"age",headerName:"Age",width:100},{field:"city",headerName:"City",width:150},{field:"department",headerName:"Department",width:150},{field:"role",headerName:"Role",width:150},{field:"salary",headerName:"Salary",width:150}];function v(){const[o,a]=m.useState({page:0,pageSize:10});return e.jsx(h,{title:"Custom Pagination",description:"Provide your own pagination UI via the slots API while keeping all built-in server-side pagination logic. Full control over page size, navigation, and styling.",sourceCode:C,children:e.jsx(u,{rows:b,columns:f,pagination:!0,paginationModel:o,onPaginationModelChange:a,pageSizeOptions:[10,25,50,100],checkboxSelection:!0,height:600,slots:{pagination:P}})})}export{v as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tUGFnaW5hdGlvbi1EcVQ3SGlaNC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvQ3VzdG9tUGFnaW5hdGlvbi9DdXN0b21QYWdpbmF0aW9uLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DdXN0b21QYWdpbmF0aW9uL0N1c3RvbVBhZ2luYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHsgRGF0YUdyaWQsIEdyaWRDb2xEZWYgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCAnLi9DdXN0b21QYWdpbmF0aW9uLmNzcyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9DdXN0b21QYWdpbmF0aW9uLnRzeD9yYXcnO1xcblxcbmludGVyZmFjZSBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50UHJvcHMge1xcbiAgICBwYWdlOiBudW1iZXI7XFxuICAgIHBhZ2VTaXplOiBudW1iZXI7XFxuICAgIHJvd0NvdW50OiBudW1iZXI7XFxuICAgIHBhZ2VTaXplT3B0aW9uczogbnVtYmVyW107XFxuICAgIG9uUGFnZUNoYW5nZTogKHBhZ2U6IG51bWJlcikgPT4gdm9pZDtcXG4gICAgb25QYWdlU2l6ZUNoYW5nZTogKHBhZ2VTaXplOiBudW1iZXIpID0+IHZvaWQ7XFxufVxcblxcbmZ1bmN0aW9uIEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnQocHJvcHM6IEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnRQcm9wcykge1xcbiAgICBjb25zdCB7XFxuICAgICAgICBwYWdlLFxcbiAgICAgICAgcGFnZVNpemUsXFxuICAgICAgICByb3dDb3VudCxcXG4gICAgICAgIHBhZ2VTaXplT3B0aW9ucyxcXG4gICAgICAgIG9uUGFnZUNoYW5nZSxcXG4gICAgICAgIG9uUGFnZVNpemVDaGFuZ2VcXG4gICAgfSA9IHByb3BzO1xcblxcbiAgICBjb25zdCBwYWdlQ291bnQgPSBNYXRoLm1heCgxLCBNYXRoLmNlaWwocm93Q291bnQgLyBwYWdlU2l6ZSkpO1xcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IE1hdGgubWluKHBhZ2UsIHBhZ2VDb3VudCAtIDEpO1xcbiAgICBjb25zdCBmaXJzdFJvd0luZGV4ID0gY3VycmVudFBhZ2UgKiBwYWdlU2l6ZTtcXG4gICAgY29uc3QgbGFzdFJvd0luZGV4ID0gTWF0aC5taW4oZmlyc3RSb3dJbmRleCArIHBhZ2VTaXplLCByb3dDb3VudCk7XFxuXFxuICAgIHJldHVybiAoXFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiY3VzdG9tLXBhZ2luYXRpb24tcm9vdFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tcGFnZS1zaXplLXNlbGVjdFxcXCI+XFxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tbGFiZWxcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgUm93cyBwZXIgcGFnZTpcXG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cXG4gICAgICAgICAgICAgICAgPHNlbGVjdFxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3BhZ2VTaXplfVxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBvblBhZ2VTaXplQ2hhbmdlKHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlLCAxMCkpfVxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJwYWdpbmF0aW9uLXNlbGVjdFxcXCJcXG4gICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAge3BhZ2VTaXplT3B0aW9ucy5tYXAoKG9wdGlvbjogbnVtYmVyKSA9PiAoXFxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wdGlvbn0gdmFsdWU9e29wdGlvbn0+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvcHRpb259XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XFxuICAgICAgICAgICAgICAgICAgICApKX1cXG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24taW5mb1xcXCI+XFxuICAgICAgICAgICAgICAgIHtmaXJzdFJvd0luZGV4ICsgMX3igJN7bGFzdFJvd0luZGV4fSBvZiB7cm93Q291bnR9XFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tYWN0aW9uc1xcXCI+XFxuICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGFnZUNoYW5nZSgwKX1cXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gMH1cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwicGFnaW5hdGlvbi1idG5cXFwiXFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIEZpcnN0XFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UoY3VycmVudFBhZ2UgLSAxKX1cXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjdXJyZW50UGFnZSA9PT0gMH1cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwicGFnaW5hdGlvbi1idG5cXFwiXFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIFByZXZcXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cXFwicGFnaW5hdGlvbi1jdXJyZW50LXRleHRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgUGFnZSB7Y3VycmVudFBhZ2UgKyAxfSBvZiB7cGFnZUNvdW50fVxcbiAgICAgICAgICAgICAgICA8L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxidXR0b25cXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGFnZUNoYW5nZShjdXJyZW50UGFnZSArIDEpfVxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2N1cnJlbnRQYWdlID49IHBhZ2VDb3VudCAtIDF9XFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XFxcInBhZ2luYXRpb24tYnRuXFxcIlxcbiAgICAgICAgICAgICAgICA+XFxuICAgICAgICAgICAgICAgICAgICBOZXh0XFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxcbiAgICAgICAgICAgICAgICA8YnV0dG9uXFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UocGFnZUNvdW50IC0gMSl9XFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPj0gcGFnZUNvdW50IC0gMX1cXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cXFwicGFnaW5hdGlvbi1idG5cXFwiXFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIExhc3RcXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgKTtcXG59XFxuXFxuY29uc3Qgcm93cyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDEwMDAgfSwgKF8sIGkpID0+ICh7XFxuICAgIGlkOiBpICsgMSxcXG4gICAgbmFtZTogYFVzZXIgJHtpICsgMX1gLFxcbiAgICBlbWFpbDogYHVzZXIke2kgKyAxfUBleGFtcGxlLmNvbWAsXFxuICAgIGFnZTogMjAgKyAoaSAlIDUwKSxcXG4gICAgY2l0eTogWydOZXcgWW9yaycsICdMb25kb24nLCAnVG9reW8nLCAnUGFyaXMnLCAnQmVybGluJ11baSAlIDVdLFxcbiAgICBkZXBhcnRtZW50OiBbJ0hSJywgJ0lUJywgJ0ZpbmFuY2UnLCAnTWFya2V0aW5nJywgJ1NhbGVzJ11baSAlIDVdLFxcbiAgICByb2xlOiBbJ01hbmFnZXInLCAnRGV2ZWxvcGVyJywgJ0Rlc2lnbmVyJywgJ1Rlc3RlcicsICdBbmFseXN0J11baSAlIDVdLFxcbiAgICBzYWxhcnk6IDUwMDAgKyAoaSAlIDEwMDAwKVxcbn0pKTtcXG5cXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmW10gPSBbXFxuICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiA3MCB9LFxcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDE1MCB9LFxcbiAgICB7IGZpZWxkOiAnZW1haWwnLCBoZWFkZXJOYW1lOiAnRW1haWwnLCB3aWR0aDogMjAwIH0sXFxuICAgIHsgZmllbGQ6ICdhZ2UnLCBoZWFkZXJOYW1lOiAnQWdlJywgd2lkdGg6IDEwMCB9LFxcbiAgICB7IGZpZWxkOiAnY2l0eScsIGhlYWRlck5hbWU6ICdDaXR5Jywgd2lkdGg6IDE1MCB9LFxcbiAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgd2lkdGg6IDE1MCB9LFxcbiAgICB7IGZpZWxkOiAncm9sZScsIGhlYWRlck5hbWU6ICdSb2xlJywgd2lkdGg6IDE1MCB9LFxcbiAgICB7IGZpZWxkOiAnc2FsYXJ5JywgaGVhZGVyTmFtZTogJ1NhbGFyeScsIHdpZHRoOiAxNTAgfVxcbl07XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3VzdG9tUGFnaW5hdGlvbkRlbW8oKSB7XFxuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZSh7XFxuICAgICAgICBwYWdlOiAwLFxcbiAgICAgICAgcGFnZVNpemU6IDEwXFxuICAgIH0pO1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiQ3VzdG9tIFBhZ2luYXRpb25cXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIlByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBVSSB2aWEgdGhlIHNsb3RzIEFQSSB3aGlsZSBrZWVwaW5nIGFsbCBidWlsdC1pbiBzZXJ2ZXItc2lkZSBwYWdpbmF0aW9uIGxvZ2ljLiBGdWxsIGNvbnRyb2wgb3ZlciBwYWdlIHNpemUsIG5hdmlnYXRpb24sIGFuZCBzdHlsaW5nLlxcXCJcXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxEYXRhR3JpZFxcbiAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwLCAxMDBdfVxcbiAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxcbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezYwMH1cXG4gICAgICAgICAgICAgICAgc2xvdHM9e3tcXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246IEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnRcXG4gICAgICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICAvPlxcbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxcbiAgICApO1xcbn1cXG5cIiIsIlxuaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhR3JpZCwgR3JpZENvbERlZiB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgJy4vQ3VzdG9tUGFnaW5hdGlvbi5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0N1c3RvbVBhZ2luYXRpb24udHN4P3Jhdyc7XG5cbmludGVyZmFjZSBDdXN0b21QYWdpbmF0aW9uQ29tcG9uZW50UHJvcHMge1xuICAgIHBhZ2U6IG51bWJlcjtcbiAgICBwYWdlU2l6ZTogbnVtYmVyO1xuICAgIHJvd0NvdW50OiBudW1iZXI7XG4gICAgcGFnZVNpemVPcHRpb25zOiBudW1iZXJbXTtcbiAgICBvblBhZ2VDaGFuZ2U6IChwYWdlOiBudW1iZXIpID0+IHZvaWQ7XG4gICAgb25QYWdlU2l6ZUNoYW5nZTogKHBhZ2VTaXplOiBudW1iZXIpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnQocHJvcHM6IEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnRQcm9wcykge1xuICAgIGNvbnN0IHtcbiAgICAgICAgcGFnZSxcbiAgICAgICAgcGFnZVNpemUsXG4gICAgICAgIHJvd0NvdW50LFxuICAgICAgICBwYWdlU2l6ZU9wdGlvbnMsXG4gICAgICAgIG9uUGFnZUNoYW5nZSxcbiAgICAgICAgb25QYWdlU2l6ZUNoYW5nZVxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IHBhZ2VDb3VudCA9IE1hdGgubWF4KDEsIE1hdGguY2VpbChyb3dDb3VudCAvIHBhZ2VTaXplKSk7XG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSBNYXRoLm1pbihwYWdlLCBwYWdlQ291bnQgLSAxKTtcbiAgICBjb25zdCBmaXJzdFJvd0luZGV4ID0gY3VycmVudFBhZ2UgKiBwYWdlU2l6ZTtcbiAgICBjb25zdCBsYXN0Um93SW5kZXggPSBNYXRoLm1pbihmaXJzdFJvd0luZGV4ICsgcGFnZVNpemUsIHJvd0NvdW50KTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY3VzdG9tLXBhZ2luYXRpb24tcm9vdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLXBhZ2Utc2l6ZS1zZWxlY3RcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICBSb3dzIHBlciBwYWdlOlxuICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFnZVNpemV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gb25QYWdlU2l6ZUNoYW5nZShwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1zZWxlY3RcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3BhZ2VTaXplT3B0aW9ucy5tYXAoKG9wdGlvbjogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17b3B0aW9ufSB2YWx1ZT17b3B0aW9ufT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b3B0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1pbmZvXCI+XG4gICAgICAgICAgICAgICAge2ZpcnN0Um93SW5kZXggKyAxfeKAk3tsYXN0Um93SW5kZXh9IG9mIHtyb3dDb3VudH1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2luYXRpb24tYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QYWdlQ2hhbmdlKDApfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInBhZ2luYXRpb24tYnRuXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIEZpcnN0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBhZ2VDaGFuZ2UoY3VycmVudFBhZ2UgLSAxKX1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2N1cnJlbnRQYWdlID09PSAwfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwYWdpbmF0aW9uLWJ0blwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBQcmV2XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1jdXJyZW50LXRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgUGFnZSB7Y3VycmVudFBhZ2UgKyAxfSBvZiB7cGFnZUNvdW50fVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGFnZUNoYW5nZShjdXJyZW50UGFnZSArIDEpfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPj0gcGFnZUNvdW50IC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1idG5cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgTmV4dFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QYWdlQ2hhbmdlKHBhZ2VDb3VudCAtIDEpfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Y3VycmVudFBhZ2UgPj0gcGFnZUNvdW50IC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGFnaW5hdGlvbi1idG5cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgTGFzdFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59XG5cbmNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMDAwIH0sIChfLCBpKSA9PiAoe1xuICAgIGlkOiBpICsgMSxcbiAgICBuYW1lOiBgVXNlciAke2kgKyAxfWAsXG4gICAgZW1haWw6IGB1c2VyJHtpICsgMX1AZXhhbXBsZS5jb21gLFxuICAgIGFnZTogMjAgKyAoaSAlIDUwKSxcbiAgICBjaXR5OiBbJ05ldyBZb3JrJywgJ0xvbmRvbicsICdUb2t5bycsICdQYXJpcycsICdCZXJsaW4nXVtpICUgNV0sXG4gICAgZGVwYXJ0bWVudDogWydIUicsICdJVCcsICdGaW5hbmNlJywgJ01hcmtldGluZycsICdTYWxlcyddW2kgJSA1XSxcbiAgICByb2xlOiBbJ01hbmFnZXInLCAnRGV2ZWxvcGVyJywgJ0Rlc2lnbmVyJywgJ1Rlc3RlcicsICdBbmFseXN0J11baSAlIDVdLFxuICAgIHNhbGFyeTogNTAwMCArIChpICUgMTAwMDApXG59KSk7XG5cbmNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWZbXSA9IFtcbiAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogNzAgfSxcbiAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgd2lkdGg6IDE1MCB9LFxuICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHdpZHRoOiAyMDAgfSxcbiAgICB7IGZpZWxkOiAnYWdlJywgaGVhZGVyTmFtZTogJ0FnZScsIHdpZHRoOiAxMDAgfSxcbiAgICB7IGZpZWxkOiAnY2l0eScsIGhlYWRlck5hbWU6ICdDaXR5Jywgd2lkdGg6IDE1MCB9LFxuICAgIHsgZmllbGQ6ICdkZXBhcnRtZW50JywgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLCB3aWR0aDogMTUwIH0sXG4gICAgeyBmaWVsZDogJ3JvbGUnLCBoZWFkZXJOYW1lOiAnUm9sZScsIHdpZHRoOiAxNTAgfSxcbiAgICB7IGZpZWxkOiAnc2FsYXJ5JywgaGVhZGVyTmFtZTogJ1NhbGFyeScsIHdpZHRoOiAxNTAgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3VzdG9tUGFnaW5hdGlvbkRlbW8oKSB7XG4gICAgY29uc3QgW3BhZ2luYXRpb25Nb2RlbCwgc2V0UGFnaW5hdGlvbk1vZGVsXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgcGFnZTogMCxcbiAgICAgICAgcGFnZVNpemU6IDEwXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RG9jc0xheW91dFxuICAgICAgICAgICAgdGl0bGU9XCJDdXN0b20gUGFnaW5hdGlvblwiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIlByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBVSSB2aWEgdGhlIHNsb3RzIEFQSSB3aGlsZSBrZWVwaW5nIGFsbCBidWlsdC1pbiBzZXJ2ZXItc2lkZSBwYWdpbmF0aW9uIGxvZ2ljLiBGdWxsIGNvbnRyb2wgb3ZlciBwYWdlIHNpemUsIG5hdmlnYXRpb24sIGFuZCBzdHlsaW5nLlwiXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxuICAgICAgICAgICAgICAgIG9uUGFnaW5hdGlvbk1vZGVsQ2hhbmdlPXtzZXRQYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbMTAsIDI1LCA1MCwgMTAwXX1cbiAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxuICAgICAgICAgICAgICAgIGhlaWdodD17NjAwfVxuICAgICAgICAgICAgICAgIHNsb3RzPXt7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246IEN1c3RvbVBhZ2luYXRpb25Db21wb25lbnRcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsIkN1c3RvbVBhZ2luYXRpb25Db21wb25lbnQiLCJwcm9wcyIsInBhZ2UiLCJwYWdlU2l6ZSIsInJvd0NvdW50IiwicGFnZVNpemVPcHRpb25zIiwib25QYWdlQ2hhbmdlIiwib25QYWdlU2l6ZUNoYW5nZSIsInBhZ2VDb3VudCIsImN1cnJlbnRQYWdlIiwiZmlyc3RSb3dJbmRleCIsImxhc3RSb3dJbmRleCIsImpzeHMiLCJqc3giLCJlIiwib3B0aW9uIiwicm93cyIsIl8iLCJpIiwiY29sdW1ucyIsIkN1c3RvbVBhZ2luYXRpb25EZW1vIiwicGFnaW5hdGlvbk1vZGVsIiwic2V0UGFnaW5hdGlvbk1vZGVsIiwidXNlU3RhdGUiLCJEb2NzTGF5b3V0IiwiRGF0YUdyaWQiXSwibWFwcGluZ3MiOiIrSUFBQSxNQUFBQSxFQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDZ0JmLFNBQVNDLEVBQTBCQyxFQUF1QyxDQUN0RSxLQUFNLENBQ0YsS0FBQUMsRUFDQSxTQUFBQyxFQUNBLFNBQUFDLEVBQ0EsZ0JBQUFDLEVB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
