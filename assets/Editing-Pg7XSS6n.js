import{j as e}from"./vendor-react-LmGMyLnN.js";import{D as i}from"./opengridx-DRhFeO2U.js";import{c as n,m as r}from"./mockData-BHq5qKrv.js";import{D as s}from"./DocsLayout-BoGj89NG.js";const a=`
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Editing.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Editing.tsx?raw';

type MockRow = (typeof mockRows)[number];

export default function EditingExample() {
    const handleProcessRowUpdate = (newRow: MockRow) => {
        console.log('Row updated:', newRow);
        return newRow;
    };

    return (
        <DocsLayout
            title="Cell Editing"
            description="Inline cell editing with text, number, and dropdown inputs. Double-click any cell to enter edit mode; press Enter or click outside to confirm."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                pageSizeOptions={[5, 10, 25, 50]}
                pagination={true}
                processRowUpdate={handleProcessRowUpdate}
                initialState={{
                    pagination: { paginationModel: { pageSize: 15, page: 0 } }
                }}
            />
        </DocsLayout>
    );
}
`;function m(){const t=o=>(console.log("Row updated:",o),o);return e.jsx(s,{title:"Cell Editing",description:"Inline cell editing with text, number, and dropdown inputs. Double-click any cell to enter edit mode; press Enter or click outside to confirm.",sourceCode:a,children:e.jsx(i,{rows:r,columns:n,pageSizeOptions:[5,10,25,50],pagination:!0,processRowUpdate:t,initialState:{pagination:{paginationModel:{pageSize:15,page:0}}}})})}export{m as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWRpdGluZy1QZzdYU1M2bi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vZXhhbXBsZXMvRWRpdGluZy9FZGl0aW5nLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9FZGl0aW5nL0VkaXRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiXFxuaW1wb3J0IHsgRGF0YUdyaWQgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCB7IGNvbHVtbkRlZmluaXRpb25zLCBtb2NrUm93cyB9IGZyb20gJy4uLy4uL21vY2tEYXRhJztcXG5pbXBvcnQgJy4vRWRpdGluZy5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vRWRpdGluZy50c3g/cmF3JztcXG5cXG50eXBlIE1vY2tSb3cgPSAodHlwZW9mIG1vY2tSb3dzKVtudW1iZXJdO1xcblxcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEVkaXRpbmdFeGFtcGxlKCkge1xcbiAgICBjb25zdCBoYW5kbGVQcm9jZXNzUm93VXBkYXRlID0gKG5ld1JvdzogTW9ja1JvdykgPT4ge1xcbiAgICAgICAgY29uc29sZS5sb2coJ1JvdyB1cGRhdGVkOicsIG5ld1Jvdyk7XFxuICAgICAgICByZXR1cm4gbmV3Um93O1xcbiAgICB9O1xcblxcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiQ2VsbCBFZGl0aW5nXFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJJbmxpbmUgY2VsbCBlZGl0aW5nIHdpdGggdGV4dCwgbnVtYmVyLCBhbmQgZHJvcGRvd24gaW5wdXRzLiBEb3VibGUtY2xpY2sgYW55IGNlbGwgdG8gZW50ZXIgZWRpdCBtb2RlOyBwcmVzcyBFbnRlciBvciBjbGljayBvdXRzaWRlIHRvIGNvbmZpcm0uXFxcIlxcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XFxuICAgICAgICA+XFxuICAgICAgICAgICAgPERhdGFHcmlkXFxuICAgICAgICAgICAgICAgIHJvd3M9e21vY2tSb3dzfVxcbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtjb2x1bW5EZWZpbml0aW9uc31cXG4gICAgICAgICAgICAgICAgcGFnZVNpemVPcHRpb25zPXtbNSwgMTAsIDI1LCA1MF19XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb249e3RydWV9XFxuICAgICAgICAgICAgICAgIHByb2Nlc3NSb3dVcGRhdGU9e2hhbmRsZVByb2Nlc3NSb3dVcGRhdGV9XFxuICAgICAgICAgICAgICAgIGluaXRpYWxTdGF0ZT17e1xcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjogeyBwYWdpbmF0aW9uTW9kZWw6IHsgcGFnZVNpemU6IDE1LCBwYWdlOiAwIH0gfVxcbiAgICAgICAgICAgICAgICB9fVxcbiAgICAgICAgICAgIC8+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgeyBjb2x1bW5EZWZpbml0aW9ucywgbW9ja1Jvd3MgfSBmcm9tICcuLi8uLi9tb2NrRGF0YSc7XG5pbXBvcnQgJy4vRWRpdGluZy5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0VkaXRpbmcudHN4P3Jhdyc7XG5cbnR5cGUgTW9ja1JvdyA9ICh0eXBlb2YgbW9ja1Jvd3MpW251bWJlcl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEVkaXRpbmdFeGFtcGxlKCkge1xuICAgIGNvbnN0IGhhbmRsZVByb2Nlc3NSb3dVcGRhdGUgPSAobmV3Um93OiBNb2NrUm93KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSb3cgdXBkYXRlZDonLCBuZXdSb3cpO1xuICAgICAgICByZXR1cm4gbmV3Um93O1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RG9jc0xheW91dFxuICAgICAgICAgICAgdGl0bGU9XCJDZWxsIEVkaXRpbmdcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJJbmxpbmUgY2VsbCBlZGl0aW5nIHdpdGggdGV4dCwgbnVtYmVyLCBhbmQgZHJvcGRvd24gaW5wdXRzLiBEb3VibGUtY2xpY2sgYW55IGNlbGwgdG8gZW50ZXIgZWRpdCBtb2RlOyBwcmVzcyBFbnRlciBvciBjbGljayBvdXRzaWRlIHRvIGNvbmZpcm0uXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e21vY2tSb3dzfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbkRlZmluaXRpb25zfVxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzUsIDEwLCAyNSwgNTBdfVxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb249e3RydWV9XG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jvd1VwZGF0ZT17aGFuZGxlUHJvY2Vzc1Jvd1VwZGF0ZX1cbiAgICAgICAgICAgICAgICBpbml0aWFsU3RhdGU9e3tcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjogeyBwYWdpbmF0aW9uTW9kZWw6IHsgcGFnZVNpemU6IDE1LCBwYWdlOiAwIH0gfVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0RvY3NMYXlvdXQ+XG4gICAgKTtcbn1cbiJdLCJuYW1lcyI6WyJzb3VyY2VDb2RlIiwiRWRpdGluZ0V4YW1wbGUiLCJoYW5kbGVQcm9jZXNzUm93VXBkYXRlIiwibmV3Um93IiwianN4IiwiRG9jc0xheW91dCIsIkRhdGFHcmlkIiwibW9ja1Jvd3MiLCJjb2x1bW5EZWZpbml0aW9ucyJdLCJtYXBwaW5ncyI6IjBMQUFBLE1BQUFBLEVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQ1NmLFNBQXdCQyxHQUFpQixDQUNyQyxNQUFNQyxFQUEwQkMsSUFDNUIsUUFBUSxJQUFJLGVBQWdCQSxDQUFNLEVBQzNCQSxHQUdYLE9BQ0lDLEVBQUFBLElBQUNDLEVBQUEsQ0FDRyxNQUFNLGVBQ04sWUFBWSxpSkFDWixXQUFBTCxFQUVBLFNBQUFJLEVBQUFBLElBQUNFLEVBQUEsQ0FDRyxLQUFNQyxFQUNOLFFBQVNDLEVBQ1QsZ0JBQWlCLENBQUMsRUFBRyxHQUFJLEdBQUksRUFBRSxFQUMvQixXQUFZLEdBQ1osaUJBQWtCTixFQUNsQixhQUFjLENBQ1YsV0FBWSxDQUFFLGdCQUFpQixDQUFFLFNBQVUsR0FBSSxLQUFNLEVBQUUsQ0FBRSxDQUM3RCxDQUFBLENBQ0osQ0FBQSxDQUdaIn0=
