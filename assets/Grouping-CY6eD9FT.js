import{j as o}from"./vendor-react-LmGMyLnN.js";import{D as r}from"./opengridx-BlrvTAzD.js";import{c as t,m as i}from"./mockData-BHq5qKrv.js";import{D as n}from"./DocsLayout-BoGj89NG.js";const s=`
import { DataGrid } from '@opencorestack/opengridx';
import { columnDefinitions, mockRows } from '../../mockData';
import './Grouping.css';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './Grouping.tsx?raw';

export default function GroupingExample() {
    return (
        <DocsLayout
            title="Row Grouping"
            description="Group rows by any column value. OpenGridX aggregates child rows automatically and shows group counts in collapsible parent rows."
            sourceCode={sourceCode}
        >
            <DataGrid
                rows={mockRows}
                columns={columnDefinitions}
                rowGroupingModel={['department', 'country']}
                pagination={true}
                pageSizeOptions={[10, 25, 50]}
            />
        </DocsLayout>
    );
}
`;function c(){return o.jsx(n,{title:"Row Grouping",description:"Group rows by any column value. OpenGridX aggregates child rows automatically and shows group counts in collapsible parent rows.",sourceCode:s,children:o.jsx(r,{rows:i,columns:t,rowGroupingModel:["department","country"],pagination:!0,pageSizeOptions:[10,25,50]})})}export{c as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBpbmctQ1k2ZUQ5RlQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL0dyb3VwaW5nL0dyb3VwaW5nLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9Hcm91cGluZy9Hcm91cGluZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHsgY29sdW1uRGVmaW5pdGlvbnMsIG1vY2tSb3dzIH0gZnJvbSAnLi4vLi4vbW9ja0RhdGEnO1xcbmltcG9ydCAnLi9Hcm91cGluZy5jc3MnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vR3JvdXBpbmcudHN4P3Jhdyc7XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR3JvdXBpbmdFeGFtcGxlKCkge1xcbiAgICByZXR1cm4gKFxcbiAgICAgICAgPERvY3NMYXlvdXRcXG4gICAgICAgICAgICB0aXRsZT1cXFwiUm93IEdyb3VwaW5nXFxcIlxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPVxcXCJHcm91cCByb3dzIGJ5IGFueSBjb2x1bW4gdmFsdWUuIE9wZW5HcmlkWCBhZ2dyZWdhdGVzIGNoaWxkIHJvd3MgYXV0b21hdGljYWxseSBhbmQgc2hvd3MgZ3JvdXAgY291bnRzIGluIGNvbGxhcHNpYmxlIHBhcmVudCByb3dzLlxcXCJcXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxEYXRhR3JpZFxcbiAgICAgICAgICAgICAgICByb3dzPXttb2NrUm93c31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Y29sdW1uRGVmaW5pdGlvbnN9XFxuICAgICAgICAgICAgICAgIHJvd0dyb3VwaW5nTW9kZWw9e1snZGVwYXJ0bWVudCcsICdjb3VudHJ5J119XFxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb249e3RydWV9XFxuICAgICAgICAgICAgICAgIHBhZ2VTaXplT3B0aW9ucz17WzEwLCAyNSwgNTBdfVxcbiAgICAgICAgICAgIC8+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyBEYXRhR3JpZCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XG5pbXBvcnQgeyBjb2x1bW5EZWZpbml0aW9ucywgbW9ja1Jvd3MgfSBmcm9tICcuLi8uLi9tb2NrRGF0YSc7XG5pbXBvcnQgJy4vR3JvdXBpbmcuY3NzJztcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9Hcm91cGluZy50c3g/cmF3JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gR3JvdXBpbmdFeGFtcGxlKCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIlJvdyBHcm91cGluZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbj1cIkdyb3VwIHJvd3MgYnkgYW55IGNvbHVtbiB2YWx1ZS4gT3BlbkdyaWRYIGFnZ3JlZ2F0ZXMgY2hpbGQgcm93cyBhdXRvbWF0aWNhbGx5IGFuZCBzaG93cyBncm91cCBjb3VudHMgaW4gY29sbGFwc2libGUgcGFyZW50IHJvd3MuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxEYXRhR3JpZFxuICAgICAgICAgICAgICAgIHJvd3M9e21vY2tSb3dzfVxuICAgICAgICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbkRlZmluaXRpb25zfVxuICAgICAgICAgICAgICAgIHJvd0dyb3VwaW5nTW9kZWw9e1snZGVwYXJ0bWVudCcsICdjb3VudHJ5J119XG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbj17dHJ1ZX1cbiAgICAgICAgICAgICAgICBwYWdlU2l6ZU9wdGlvbnM9e1sxMCwgMjUsIDUwXX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJHcm91cGluZ0V4YW1wbGUiLCJqc3giLCJEb2NzTGF5b3V0IiwiRGF0YUdyaWQiLCJtb2NrUm93cyIsImNvbHVtbkRlZmluaXRpb25zIl0sIm1hcHBpbmdzIjoiMExBQUEsTUFBQUEsRUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQ09mLFNBQXdCQyxHQUFrQixDQUN0QyxPQUNJQyxFQUFBQSxJQUFDQyxFQUFBLENBQ0csTUFBTSxlQUNOLFlBQVksbUlBQ1osV0FBQUgsRUFFQSxTQUFBRSxFQUFBQSxJQUFDRSxFQUFBLENBQ0csS0FBTUMsRUFDTixRQUFTQyxFQUNULGlCQUFrQixDQUFDLGFBQWMsU0FBUyxFQUMxQyxXQUFZLEdBQ1osZ0JBQWlCLENBQUMsR0FBSSxHQUFJLEVBQUUsQ0FBQSxDQUFBLENBQ2hDLENBQUEsQ0FHWiJ9
