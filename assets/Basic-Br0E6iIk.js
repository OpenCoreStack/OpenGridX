import{j as o}from"./vendor-react-LmGMyLnN.js";import{D as i}from"./opengridx-DRbmQSJO.js";import{c as t,m as e}from"./mockData-BHq5qKrv.js";import{D as a}from"./DocsLayout-BoGj89NG.js";const n=`
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Basic.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Basic.tsx?raw';

export default function BasicExample() {
    return (
        <DocsLayout
            title="Basic Usage"
            description="The starting point for OpenGridX. Demonstrates pagination, checkbox selection, sorting, and column configuration with a real-world employee dataset."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                pagination={true}
                height={500}
                checkboxSelection
                initialState={{
                    pagination: { paginationModel: { pageSize: 25, page: 0 } }
                }}
            />
        </DocsLayout>
    );
}
`;function m(){return o.jsx(a,{title:"Basic Usage",description:"The starting point for OpenGridX. Demonstrates pagination, checkbox selection, sorting, and column configuration with a real-world employee dataset.",sourceCode:n,children:o.jsx(i,{rows:e,columns:t,pageSizeOptions:[5,10,25,50,100],pagination:!0,height:500,checkboxSelection:!0,initialState:{pagination:{paginationModel:{pageSize:25,page:0}}}})})}export{m as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzaWMtQnIwRTZpSWsuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL0Jhc2ljL0Jhc2ljLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9CYXNpYy9CYXNpYy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgY29sdW1uRGVmaW5pdGlvbnMsIG1vY2tSb3dzIH0gZnJvbSAnLi4vLi4vbW9ja0RhdGEnO1xcbmltcG9ydCAnLi9CYXNpYy5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vQmFzaWMudHN4P3Jhdyc7XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQmFzaWNFeGFtcGxlKCkge1xcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiQmFzaWMgVXNhZ2VcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIlRoZSBzdGFydGluZyBwb2ludCBmb3IgT3BlbkdyaWRYLiBEZW1vbnN0cmF0ZXMgcGFnaW5hdGlvbiwgY2hlY2tib3ggc2VsZWN0aW9uLCBzb3J0aW5nLCBhbmQgY29sdW1uIGNvbmZpZ3VyYXRpb24gd2l0aCBhIHJlYWwtd29ybGQgZW1wbG95ZWUgZGF0YXNldC5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17bW9ja1Jvd3N9XFxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbkRlZmluaXRpb25zfVxcbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1s1LCAxMCwgMjUsIDUwLCAxMDBdfVxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uPXt0cnVlfVxcbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezUwMH1cXG4gICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cXG4gICAgICAgICAgICAgICAgaW5pdGlhbFN0YXRlPXt7XFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uOiB7IHBhZ2luYXRpb25Nb2RlbDogeyBwYWdlU2l6ZTogMjUsIHBhZ2U6IDAgfSB9XFxuICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJcbmltcG9ydCB7IERhdGFHcmlkIH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcbmltcG9ydCB7IGNvbHVtbkRlZmluaXRpb25zLCBtb2NrUm93cyB9IGZyb20gJy4uLy4uL21vY2tEYXRhJztcbmltcG9ydCAnLi9CYXNpYy5jc3MnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgc291cmNlQ29kZSBmcm9tICcuL0Jhc2ljLnRzeD9yYXcnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBCYXNpY0V4YW1wbGUoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPERvY3NMYXlvdXRcbiAgICAgICAgICAgIHRpdGxlPVwiQmFzaWMgVXNhZ2VcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJUaGUgc3RhcnRpbmcgcG9pbnQgZm9yIE9wZW5HcmlkWC4gRGVtb25zdHJhdGVzIHBhZ2luYXRpb24sIGNoZWNrYm94IHNlbGVjdGlvbiwgc29ydGluZywgYW5kIGNvbHVtbiBjb25maWd1cmF0aW9uIHdpdGggYSByZWFsLXdvcmxkIGVtcGxveWVlIGRhdGFzZXQuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e21vY2tSb3dzfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbkRlZmluaXRpb25zfVxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzUsIDEwLCAyNSwgNTAsIDEwMF19XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbj17dHJ1ZX1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezUwMH1cbiAgICAgICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvblxuICAgICAgICAgICAgICAgIGluaXRpYWxTdGF0ZT17e1xuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uOiB7IHBhZ2luYXRpb25Nb2RlbDogeyBwYWdlU2l6ZTogMjUsIHBhZ2U6IDAgfSB9XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJCYXNpY0V4YW1wbGUiLCJqc3giLCJEb2NzTGF5b3V0IiwiRGF0YUdyaWQiLCJtb2NrUm93cyIsImNvbHVtbkRlZmluaXRpb25zIl0sIm1hcHBpbmdzIjoiMExBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDT2YsU0FBd0JDLEdBQWUsQ0FDbkMsT0FDSUMsRUFBQUEsSUFBQ0MsRUFBQSxDQUNHLE1BQU0sY0FDTixZQUFZLHVKQUNaLFdBQUFILEVBRUEsU0FBQUUsRUFBQUEsSUFBQ0UsRUFBQSxDQUNHLEtBQU1DLEVBQ04sUUFBU0MsRUFDVCxnQkFBaUIsQ0FBQyxFQUFHLEdBQUksR0FBSSxHQUFJLEdBQUcsRUFDcEMsV0FBWSxHQUNaLE9BQVEsSUFDUixrQkFBaUIsR0FDakIsYUFBYyxDQUNWLFdBQVksQ0FBRSxnQkFBaUIsQ0FBRSxTQUFVLEdBQUksS0FBTSxFQUFFLENBQUUsQ0FDN0QsQ0FBQSxDQUNKLENBQUEsQ0FHWiJ9
