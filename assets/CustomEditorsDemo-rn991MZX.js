import{r as a,j as e}from"./vendor-react-f02LKZLu.js";import{D as C,I as E}from"./opengridx-fu6FH0_B.js";import{D as w}from"./DocsLayout-CwTr2FWN.js";const x=`import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { DataGrid, Input } from '@opencorestack/opengridx';
import type { GridColDef, GridRenderEditCellParams } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './CustomEditorsDemo.css';
import sourceCode from './CustomEditorsDemo.tsx?raw';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    weight: number;
}

const ROWS: Product[] = [
    { id: 1, name: 'Espresso grinder', sku: 'KG-1042', price: 249, weight: 4.2 },
    { id: 2, name: 'Pour-over kettle', sku: 'KT-2210', price: 79.5, weight: 1.1 },
    { id: 3, name: 'Cast-iron skillet', sku: 'CI-0310', price: 54.99, weight: 2.7 },
    { id: 4, name: 'Stand mixer', sku: 'SM-7700', price: 429, weight: 10.8 },
    { id: 5, name: 'Chef knife 21cm', sku: 'KN-0021', price: 119, weight: 0.24 },
    { id: 6, name: 'Dutch oven 5.5L', sku: 'DO-5500', price: 315, weight: 5.6 },
    { id: 7, name: 'Bamboo cutting board', sku: 'CB-4030', price: 32, weight: 1.9 },
    { id: 8, name: 'Digital scale', sku: 'SC-0005', price: 24.95, weight: 0.4 },
];

/** A non-negative number, or null when the text is not one. */
function parseAmount(text: string): number | null {
    const trimmed = text.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 ? n : null;
}

interface AmountEditorProps extends GridRenderEditCellParams<Product> {
    startAdornment?: string;
    endAdornment?: string;
}

/**
 * A number editor built on the exported <Input variant="cell">: it fills the cell, shows a unit as
 * an adornment and turns red while the text is not a valid amount. Enter commits only a valid
 * amount; Escape cancels; leaving the cell commits a valid amount and drops an invalid one.
 */
function AmountEditor({ value, colDef, onValueChange, onCommit, onCancel, startAdornment, endAdornment }: AmountEditorProps) {
    const [text, setText] = useState(() => String(value ?? ''));
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

    const valid = parseAmount(text) !== null;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            if (valid) onCommit();
        } else if (e.key === 'Escape') {
            e.stopPropagation();
            onCancel();
        }
    };

    return (
        <Input
            ref={inputRef}
            variant="cell"
            inputMode="decimal"
            aria-label={colDef.headerName ?? colDef.field}
            value={text}
            error={!valid}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            onChange={(e) => {
                setText(e.target.value);
                const amount = parseAmount(e.target.value);
                if (amount !== null) onValueChange(amount);
            }}
            onBlur={() => (valid ? onCommit() : onCancel())}
            onKeyDown={handleKeyDown}
        />
    );
}

const COLUMNS: GridColDef<Product>[] = [
    { field: 'name', headerName: 'Product', width: 200, editable: true },
    { field: 'sku', headerName: 'SKU', width: 110 },
    {
        field: 'price',
        headerName: 'Price',
        type: 'number',
        width: 130,
        editable: true,
        valueFormatter: ({ value }) => \`$\${Number(value).toFixed(2)}\`,
        renderEditCell: (params) => <AmountEditor {...params} startAdornment="$" />,
    },
    {
        field: 'weight',
        headerName: 'Weight',
        type: 'number',
        width: 130,
        editable: true,
        valueFormatter: ({ value }) => \`\${Number(value)} kg\`,
        renderEditCell: (params) => <AmountEditor {...params} endAdornment="kg" />,
    },
];

export default function CustomEditorsDemo() {
    const [lastEdit, setLastEdit] = useState<string | null>(null);

    const processRowUpdate = (row: Product) => {
        setLastEdit(\`\${row.name}: $\${row.price.toFixed(2)}, \${row.weight} kg\`);
        return row;
    };

    return (
        <DocsLayout
            title="Custom Cell Editors"
            description={'renderEditCell can return the same Input component the grid\\'s own editors use. variant="cell" makes it fill the cell with no border and the cell\\'s font; startAdornment / endAdornment show a currency or unit, and error marks an invalid value with a red inner edge.'}
            sourceCode={sourceCode}
        >
            <div className="custom-editors-hint">
                Double-click a <strong>Price</strong> or <strong>Weight</strong> cell and type. A value that is not a
                non-negative number turns the editor red: Enter does nothing until it is fixed, Escape or clicking away
                drops it.
            </div>
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                processRowUpdate={processRowUpdate}
                height={420}
            />
            <div className="custom-editors-log" aria-live="polite">
                {lastEdit ? <>Last saved: <code>{lastEdit}</code></> : 'No edits yet.'}
            </div>
            <div className="custom-editors-usage">
                <strong>Usage:</strong>
                <pre>{\`import { Input } from '@opencorestack/opengridx';

function PriceEditor({ value, onValueChange, onCommit, onCancel }: GridRenderEditCellParams) {
  const [text, setText] = useState(String(value ?? ''));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const isAmount = (t: string) => t.trim() !== '' && Number(t) >= 0;
  const valid = isAmount(text);

  return (
    <Input
      ref={ref}               // reaches the <input> (React 18 and 19)
      variant="cell"          // fills the cell, no border or focus ring
      startAdornment="$"
      error={!valid}          // red inner edge + aria-invalid
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        if (isAmount(e.target.value)) onValueChange(Number(e.target.value));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.stopPropagation(); if (valid) onCommit(); }
        if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
      }}
      onBlur={() => (valid ? onCommit() : onCancel())}
    />
  );
}

const columns: GridColDef[] = [
  { field: 'price', type: 'number', editable: true,
    renderEditCell: (params) => <PriceEditor {...params} /> },
];\`}</pre>
            </div>
        </DocsLayout>
    );
}
`,k=[{id:1,name:"Espresso grinder",sku:"KG-1042",price:249,weight:4.2},{id:2,name:"Pour-over kettle",sku:"KT-2210",price:79.5,weight:1.1},{id:3,name:"Cast-iron skillet",sku:"CI-0310",price:54.99,weight:2.7},{id:4,name:"Stand mixer",sku:"SM-7700",price:429,weight:10.8},{id:5,name:"Chef knife 21cm",sku:"KN-0021",price:119,weight:.24},{id:6,name:"Dutch oven 5.5L",sku:"DO-5500",price:315,weight:5.6},{id:7,name:"Bamboo cutting board",sku:"CB-4030",price:32,weight:1.9},{id:8,name:"Digital scale",sku:"SC-0005",price:24.95,weight:.4}];function m(t){const r=t.trim();if(r==="")return null;const n=Number(r);return Number.isFinite(n)&&n>=0?n:null}function p({value:t,colDef:r,onValueChange:n,onCommit:i,onCancel:l,startAdornment:g,endAdornment:f}){const[u,h]=a.useState(()=>String(t??"")),s=a.useRef(null);a.useEffect(()=>{s.current?.focus(),s.current?.select()},[]);const d=m(u)!==null,v=o=>{o.key==="Enter"?(o.stopPropagation(),d&&i()):o.key==="Escape"&&(o.stopPropagation(),l())};return e.jsx(E,{ref:s,variant:"cell",inputMode:"decimal","aria-label":r.headerName??r.field,value:u,error:!d,startAdornment:g,endAdornment:f,onChange:o=>{h(o.target.value);const c=m(o.target.value);c!==null&&n(c)},onBlur:()=>d?i():l(),onKeyDown:v})}const b=[{field:"name",headerName:"Product",width:200,editable:!0},{field:"sku",headerName:"SKU",width:110},{field:"price",headerName:"Price",type:"number",width:130,editable:!0,valueFormatter:({value:t})=>`$${Number(t).toFixed(2)}`,renderEditCell:t=>e.jsx(p,{...t,startAdornment:"$"})},{field:"weight",headerName:"Weight",type:"number",width:130,editable:!0,valueFormatter:({value:t})=>`${Number(t)} kg`,renderEditCell:t=>e.jsx(p,{...t,endAdornment:"kg"})}];function N(){const[t,r]=a.useState(null),n=i=>(r(`${i.name}: $${i.price.toFixed(2)}, ${i.weight} kg`),i);return e.jsxs(w,{title:"Custom Cell Editors",description:`renderEditCell can return the same Input component the grid's own editors use. variant="cell" makes it fill the cell with no border and the cell's font; startAdornment / endAdornment show a currency or unit, and error marks an invalid value with a red inner edge.`,sourceCode:x,children:[e.jsxs("div",{className:"custom-editors-hint",children:["Double-click a ",e.jsx("strong",{children:"Price"})," or ",e.jsx("strong",{children:"Weight"})," cell and type. A value that is not a non-negative number turns the editor red: Enter does nothing until it is fixed, Escape or clicking away drops it."]}),e.jsx(C,{rows:k,columns:b,processRowUpdate:n,height:420}),e.jsx("div",{className:"custom-editors-log","aria-live":"polite",children:t?e.jsxs(e.Fragment,{children:["Last saved: ",e.jsx("code",{children:t})]}):"No edits yet."}),e.jsxs("div",{className:"custom-editors-usage",children:[e.jsx("strong",{children:"Usage:"}),e.jsx("pre",{children:`import { Input } from '@opencorestack/opengridx';

function PriceEditor({ value, onValueChange, onCommit, onCancel }: GridRenderEditCellParams) {
  const [text, setText] = useState(String(value ?? ''));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const isAmount = (t: string) => t.trim() !== '' && Number(t) >= 0;
  const valid = isAmount(text);

  return (
    <Input
      ref={ref}               // reaches the <input> (React 18 and 19)
      variant="cell"          // fills the cell, no border or focus ring
      startAdornment="$"
      error={!valid}          // red inner edge + aria-invalid
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        if (isAmount(e.target.value)) onValueChange(Number(e.target.value));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.stopPropagation(); if (valid) onCommit(); }
        if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
      }}
      onBlur={() => (valid ? onCommit() : onCancel())}
    />
  );
}

const columns: GridColDef[] = [
  { field: 'price', type: 'number', editable: true,
    renderEditCell: (params) => <PriceEditor {...params} /> },
];`})]})]})}export{N as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tRWRpdG9yc0RlbW8tcm45OTFNWlguanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL0N1c3RvbUVkaXRvcnNEZW1vL0N1c3RvbUVkaXRvcnNEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9DdXN0b21FZGl0b3JzRGVtby9DdXN0b21FZGl0b3JzRGVtby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XFxuaW1wb3J0IHR5cGUgeyBLZXlib2FyZEV2ZW50IH0gZnJvbSAncmVhY3QnO1xcbmltcG9ydCB7IERhdGFHcmlkLCBJbnB1dCB9IGZyb20gJ0BvcGVuY29yZXN0YWNrL29wZW5ncmlkeCc7XFxuaW1wb3J0IHR5cGUgeyBHcmlkQ29sRGVmLCBHcmlkUmVuZGVyRWRpdENlbGxQYXJhbXMgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xcbmltcG9ydCB7IERvY3NMYXlvdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0RvY3NMYXlvdXQnO1xcbmltcG9ydCAnLi9DdXN0b21FZGl0b3JzRGVtby5jc3MnO1xcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vQ3VzdG9tRWRpdG9yc0RlbW8udHN4P3Jhdyc7XFxuXFxuaW50ZXJmYWNlIFByb2R1Y3Qge1xcbiAgICBpZDogbnVtYmVyO1xcbiAgICBuYW1lOiBzdHJpbmc7XFxuICAgIHNrdTogc3RyaW5nO1xcbiAgICBwcmljZTogbnVtYmVyO1xcbiAgICB3ZWlnaHQ6IG51bWJlcjtcXG59XFxuXFxuY29uc3QgUk9XUzogUHJvZHVjdFtdID0gW1xcbiAgICB7IGlkOiAxLCBuYW1lOiAnRXNwcmVzc28gZ3JpbmRlcicsIHNrdTogJ0tHLTEwNDInLCBwcmljZTogMjQ5LCB3ZWlnaHQ6IDQuMiB9LFxcbiAgICB7IGlkOiAyLCBuYW1lOiAnUG91ci1vdmVyIGtldHRsZScsIHNrdTogJ0tULTIyMTAnLCBwcmljZTogNzkuNSwgd2VpZ2h0OiAxLjEgfSxcXG4gICAgeyBpZDogMywgbmFtZTogJ0Nhc3QtaXJvbiBza2lsbGV0Jywgc2t1OiAnQ0ktMDMxMCcsIHByaWNlOiA1NC45OSwgd2VpZ2h0OiAyLjcgfSxcXG4gICAgeyBpZDogNCwgbmFtZTogJ1N0YW5kIG1peGVyJywgc2t1OiAnU00tNzcwMCcsIHByaWNlOiA0MjksIHdlaWdodDogMTAuOCB9LFxcbiAgICB7IGlkOiA1LCBuYW1lOiAnQ2hlZiBrbmlmZSAyMWNtJywgc2t1OiAnS04tMDAyMScsIHByaWNlOiAxMTksIHdlaWdodDogMC4yNCB9LFxcbiAgICB7IGlkOiA2LCBuYW1lOiAnRHV0Y2ggb3ZlbiA1LjVMJywgc2t1OiAnRE8tNTUwMCcsIHByaWNlOiAzMTUsIHdlaWdodDogNS42IH0sXFxuICAgIHsgaWQ6IDcsIG5hbWU6ICdCYW1ib28gY3V0dGluZyBib2FyZCcsIHNrdTogJ0NCLTQwMzAnLCBwcmljZTogMzIsIHdlaWdodDogMS45IH0sXFxuICAgIHsgaWQ6IDgsIG5hbWU6ICdEaWdpdGFsIHNjYWxlJywgc2t1OiAnU0MtMDAwNScsIHByaWNlOiAyNC45NSwgd2VpZ2h0OiAwLjQgfSxcXG5dO1xcblxcbi8qKiBBIG5vbi1uZWdhdGl2ZSBudW1iZXIsIG9yIG51bGwgd2hlbiB0aGUgdGV4dCBpcyBub3Qgb25lLiAqL1xcbmZ1bmN0aW9uIHBhcnNlQW1vdW50KHRleHQ6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xcbiAgICBjb25zdCB0cmltbWVkID0gdGV4dC50cmltKCk7XFxuICAgIGlmICh0cmltbWVkID09PSAnJykgcmV0dXJuIG51bGw7XFxuICAgIGNvbnN0IG4gPSBOdW1iZXIodHJpbW1lZCk7XFxuICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUobikgJiYgbiA+PSAwID8gbiA6IG51bGw7XFxufVxcblxcbmludGVyZmFjZSBBbW91bnRFZGl0b3JQcm9wcyBleHRlbmRzIEdyaWRSZW5kZXJFZGl0Q2VsbFBhcmFtczxQcm9kdWN0PiB7XFxuICAgIHN0YXJ0QWRvcm5tZW50Pzogc3RyaW5nO1xcbiAgICBlbmRBZG9ybm1lbnQ/OiBzdHJpbmc7XFxufVxcblxcbi8qKlxcbiAqIEEgbnVtYmVyIGVkaXRvciBidWlsdCBvbiB0aGUgZXhwb3J0ZWQgPElucHV0IHZhcmlhbnQ9XFxcImNlbGxcXFwiPjogaXQgZmlsbHMgdGhlIGNlbGwsIHNob3dzIGEgdW5pdCBhc1xcbiAqIGFuIGFkb3JubWVudCBhbmQgdHVybnMgcmVkIHdoaWxlIHRoZSB0ZXh0IGlzIG5vdCBhIHZhbGlkIGFtb3VudC4gRW50ZXIgY29tbWl0cyBvbmx5IGEgdmFsaWRcXG4gKiBhbW91bnQ7IEVzY2FwZSBjYW5jZWxzOyBsZWF2aW5nIHRoZSBjZWxsIGNvbW1pdHMgYSB2YWxpZCBhbW91bnQgYW5kIGRyb3BzIGFuIGludmFsaWQgb25lLlxcbiAqL1xcbmZ1bmN0aW9uIEFtb3VudEVkaXRvcih7IHZhbHVlLCBjb2xEZWYsIG9uVmFsdWVDaGFuZ2UsIG9uQ29tbWl0LCBvbkNhbmNlbCwgc3RhcnRBZG9ybm1lbnQsIGVuZEFkb3JubWVudCB9OiBBbW91bnRFZGl0b3JQcm9wcykge1xcbiAgICBjb25zdCBbdGV4dCwgc2V0VGV4dF0gPSB1c2VTdGF0ZSgoKSA9PiBTdHJpbmcodmFsdWUgPz8gJycpKTtcXG4gICAgY29uc3QgaW5wdXRSZWYgPSB1c2VSZWY8SFRNTElucHV0RWxlbWVudD4obnVsbCk7XFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7IGlucHV0UmVmLmN1cnJlbnQ/LmZvY3VzKCk7IGlucHV0UmVmLmN1cnJlbnQ/LnNlbGVjdCgpOyB9LCBbXSk7XFxuXFxuICAgIGNvbnN0IHZhbGlkID0gcGFyc2VBbW91bnQodGV4dCkgIT09IG51bGw7XFxuXFxuICAgIGNvbnN0IGhhbmRsZUtleURvd24gPSAoZTogS2V5Ym9hcmRFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XFxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcXG4gICAgICAgICAgICBpZiAodmFsaWQpIG9uQ29tbWl0KCk7XFxuICAgICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XFxuICAgICAgICAgICAgb25DYW5jZWwoKTtcXG4gICAgICAgIH1cXG4gICAgfTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxJbnB1dFxcbiAgICAgICAgICAgIHJlZj17aW5wdXRSZWZ9XFxuICAgICAgICAgICAgdmFyaWFudD1cXFwiY2VsbFxcXCJcXG4gICAgICAgICAgICBpbnB1dE1vZGU9XFxcImRlY2ltYWxcXFwiXFxuICAgICAgICAgICAgYXJpYS1sYWJlbD17Y29sRGVmLmhlYWRlck5hbWUgPz8gY29sRGVmLmZpZWxkfVxcbiAgICAgICAgICAgIHZhbHVlPXt0ZXh0fVxcbiAgICAgICAgICAgIGVycm9yPXshdmFsaWR9XFxuICAgICAgICAgICAgc3RhcnRBZG9ybm1lbnQ9e3N0YXJ0QWRvcm5tZW50fVxcbiAgICAgICAgICAgIGVuZEFkb3JubWVudD17ZW5kQWRvcm5tZW50fVxcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xcbiAgICAgICAgICAgICAgICBzZXRUZXh0KGUudGFyZ2V0LnZhbHVlKTtcXG4gICAgICAgICAgICAgICAgY29uc3QgYW1vdW50ID0gcGFyc2VBbW91bnQoZS50YXJnZXQudmFsdWUpO1xcbiAgICAgICAgICAgICAgICBpZiAoYW1vdW50ICE9PSBudWxsKSBvblZhbHVlQ2hhbmdlKGFtb3VudCk7XFxuICAgICAgICAgICAgfX1cXG4gICAgICAgICAgICBvbkJsdXI9eygpID0+ICh2YWxpZCA/IG9uQ29tbWl0KCkgOiBvbkNhbmNlbCgpKX1cXG4gICAgICAgICAgICBvbktleURvd249e2hhbmRsZUtleURvd259XFxuICAgICAgICAvPlxcbiAgICApO1xcbn1cXG5cXG5jb25zdCBDT0xVTU5TOiBHcmlkQ29sRGVmPFByb2R1Y3Q+W10gPSBbXFxuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ1Byb2R1Y3QnLCB3aWR0aDogMjAwLCBlZGl0YWJsZTogdHJ1ZSB9LFxcbiAgICB7IGZpZWxkOiAnc2t1JywgaGVhZGVyTmFtZTogJ1NLVScsIHdpZHRoOiAxMTAgfSxcXG4gICAge1xcbiAgICAgICAgZmllbGQ6ICdwcmljZScsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnUHJpY2UnLFxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXFxuICAgICAgICB3aWR0aDogMTMwLFxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXFxuICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHsgdmFsdWUgfSkgPT4gYCQke051bWJlcih2YWx1ZSkudG9GaXhlZCgyKX1gLFxcbiAgICAgICAgcmVuZGVyRWRpdENlbGw6IChwYXJhbXMpID0+IDxBbW91bnRFZGl0b3Igey4uLnBhcmFtc30gc3RhcnRBZG9ybm1lbnQ9XFxcIiRcXFwiIC8+LFxcbiAgICB9LFxcbiAgICB7XFxuICAgICAgICBmaWVsZDogJ3dlaWdodCcsXFxuICAgICAgICBoZWFkZXJOYW1lOiAnV2VpZ2h0JyxcXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxcbiAgICAgICAgd2lkdGg6IDEzMCxcXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6ICh7IHZhbHVlIH0pID0+IGAke051bWJlcih2YWx1ZSl9IGtnYCxcXG4gICAgICAgIHJlbmRlckVkaXRDZWxsOiAocGFyYW1zKSA9PiA8QW1vdW50RWRpdG9yIHsuLi5wYXJhbXN9IGVuZEFkb3JubWVudD1cXFwia2dcXFwiIC8+LFxcbiAgICB9LFxcbl07XFxuXFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3VzdG9tRWRpdG9yc0RlbW8oKSB7XFxuICAgIGNvbnN0IFtsYXN0RWRpdCwgc2V0TGFzdEVkaXRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XFxuXFxuICAgIGNvbnN0IHByb2Nlc3NSb3dVcGRhdGUgPSAocm93OiBQcm9kdWN0KSA9PiB7XFxuICAgICAgICBzZXRMYXN0RWRpdChgJHtyb3cubmFtZX06ICQke3Jvdy5wcmljZS50b0ZpeGVkKDIpfSwgJHtyb3cud2VpZ2h0fSBrZ2ApO1xcbiAgICAgICAgcmV0dXJuIHJvdztcXG4gICAgfTtcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIkN1c3RvbSBDZWxsIEVkaXRvcnNcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249eydyZW5kZXJFZGl0Q2VsbCBjYW4gcmV0dXJuIHRoZSBzYW1lIElucHV0IGNvbXBvbmVudCB0aGUgZ3JpZFxcXFwncyBvd24gZWRpdG9ycyB1c2UuIHZhcmlhbnQ9XFxcImNlbGxcXFwiIG1ha2VzIGl0IGZpbGwgdGhlIGNlbGwgd2l0aCBubyBib3JkZXIgYW5kIHRoZSBjZWxsXFxcXCdzIGZvbnQ7IHN0YXJ0QWRvcm5tZW50IC8gZW5kQWRvcm5tZW50IHNob3cgYSBjdXJyZW5jeSBvciB1bml0LCBhbmQgZXJyb3IgbWFya3MgYW4gaW52YWxpZCB2YWx1ZSB3aXRoIGEgcmVkIGlubmVyIGVkZ2UuJ31cXG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxcbiAgICAgICAgPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVxcXCJjdXN0b20tZWRpdG9ycy1oaW50XFxcIj5cXG4gICAgICAgICAgICAgICAgRG91YmxlLWNsaWNrIGEgPHN0cm9uZz5QcmljZTwvc3Ryb25nPiBvciA8c3Ryb25nPldlaWdodDwvc3Ryb25nPiBjZWxsIGFuZCB0eXBlLiBBIHZhbHVlIHRoYXQgaXMgbm90IGFcXG4gICAgICAgICAgICAgICAgbm9uLW5lZ2F0aXZlIG51bWJlciB0dXJucyB0aGUgZWRpdG9yIHJlZDogRW50ZXIgZG9lcyBub3RoaW5nIHVudGlsIGl0IGlzIGZpeGVkLCBFc2NhcGUgb3IgY2xpY2tpbmcgYXdheVxcbiAgICAgICAgICAgICAgICBkcm9wcyBpdC5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgcm93cz17Uk9XU31cXG4gICAgICAgICAgICAgICAgY29sdW1ucz17Q09MVU1OU31cXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jvd1VwZGF0ZT17cHJvY2Vzc1Jvd1VwZGF0ZX1cXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MjB9XFxuICAgICAgICAgICAgLz5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwiY3VzdG9tLWVkaXRvcnMtbG9nXFxcIiBhcmlhLWxpdmU9XFxcInBvbGl0ZVxcXCI+XFxuICAgICAgICAgICAgICAgIHtsYXN0RWRpdCA/IDw+TGFzdCBzYXZlZDogPGNvZGU+e2xhc3RFZGl0fTwvY29kZT48Lz4gOiAnTm8gZWRpdHMgeWV0Lid9XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XFxcImN1c3RvbS1lZGl0b3JzLXVzYWdlXFxcIj5cXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Vc2FnZTo8L3N0cm9uZz5cXG4gICAgICAgICAgICAgICAgPHByZT57YGltcG9ydCB7IElucHV0IH0gZnJvbSAnQG9wZW5jb3Jlc3RhY2svb3BlbmdyaWR4JztcXG5cXG5mdW5jdGlvbiBQcmljZUVkaXRvcih7IHZhbHVlLCBvblZhbHVlQ2hhbmdlLCBvbkNvbW1pdCwgb25DYW5jZWwgfTogR3JpZFJlbmRlckVkaXRDZWxsUGFyYW1zKSB7XFxuICBjb25zdCBbdGV4dCwgc2V0VGV4dF0gPSB1c2VTdGF0ZShTdHJpbmcodmFsdWUgPz8gJycpKTtcXG4gIGNvbnN0IHJlZiA9IHVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PihudWxsKTtcXG4gIHVzZUVmZmVjdCgoKSA9PiB7IHJlZi5jdXJyZW50Py5mb2N1cygpOyByZWYuY3VycmVudD8uc2VsZWN0KCk7IH0sIFtdKTtcXG4gIGNvbnN0IGlzQW1vdW50ID0gKHQ6IHN0cmluZykgPT4gdC50cmltKCkgIT09ICcnICYmIE51bWJlcih0KSA+PSAwO1xcbiAgY29uc3QgdmFsaWQgPSBpc0Ftb3VudCh0ZXh0KTtcXG5cXG4gIHJldHVybiAoXFxuICAgIDxJbnB1dFxcbiAgICAgIHJlZj17cmVmfSAgICAgICAgICAgICAgIC8vIHJlYWNoZXMgdGhlIDxpbnB1dD4gKFJlYWN0IDE4IGFuZCAxOSlcXG4gICAgICB2YXJpYW50PVxcXCJjZWxsXFxcIiAgICAgICAgICAvLyBmaWxscyB0aGUgY2VsbCwgbm8gYm9yZGVyIG9yIGZvY3VzIHJpbmdcXG4gICAgICBzdGFydEFkb3JubWVudD1cXFwiJFxcXCJcXG4gICAgICBlcnJvcj17IXZhbGlkfSAgICAgICAgICAvLyByZWQgaW5uZXIgZWRnZSArIGFyaWEtaW52YWxpZFxcbiAgICAgIHZhbHVlPXt0ZXh0fVxcbiAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xcbiAgICAgICAgc2V0VGV4dChlLnRhcmdldC52YWx1ZSk7XFxuICAgICAgICBpZiAoaXNBbW91bnQoZS50YXJnZXQudmFsdWUpKSBvblZhbHVlQ2hhbmdlKE51bWJlcihlLnRhcmdldC52YWx1ZSkpO1xcbiAgICAgIH19XFxuICAgICAgb25LZXlEb3duPXsoZSkgPT4ge1xcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IGlmICh2YWxpZCkgb25Db21taXQoKTsgfVxcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyBvbkNhbmNlbCgpOyB9XFxuICAgICAgfX1cXG4gICAgICBvbkJsdXI9eygpID0+ICh2YWxpZCA/IG9uQ29tbWl0KCkgOiBvbkNhbmNlbCgpKX1cXG4gICAgLz5cXG4gICk7XFxufVxcblxcbmNvbnN0IGNvbHVtbnM6IEdyaWRDb2xEZWZbXSA9IFtcXG4gIHsgZmllbGQ6ICdwcmljZScsIHR5cGU6ICdudW1iZXInLCBlZGl0YWJsZTogdHJ1ZSxcXG4gICAgcmVuZGVyRWRpdENlbGw6IChwYXJhbXMpID0+IDxQcmljZUVkaXRvciB7Li4ucGFyYW1zfSAvPiB9LFxcbl07YH08L3ByZT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvRG9jc0xheW91dD5cXG4gICAgKTtcXG59XFxuXCIiLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdHlwZSB7IEtleWJvYXJkRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhR3JpZCwgSW5wdXQgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0IHR5cGUgeyBHcmlkQ29sRGVmLCBHcmlkUmVuZGVyRWRpdENlbGxQYXJhbXMgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgJy4vQ3VzdG9tRWRpdG9yc0RlbW8uY3NzJztcbmltcG9ydCBzb3VyY2VDb2RlIGZyb20gJy4vQ3VzdG9tRWRpdG9yc0RlbW8udHN4P3Jhdyc7XG5cbmludGVyZmFjZSBQcm9kdWN0IHtcbiAgICBpZDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBza3U6IHN0cmluZztcbiAgICBwcmljZTogbnVtYmVyO1xuICAgIHdlaWdodDogbnVtYmVyO1xufVxuXG5jb25zdCBST1dTOiBQcm9kdWN0W10gPSBbXG4gICAgeyBpZDogMSwgbmFtZTogJ0VzcHJlc3NvIGdyaW5kZXInLCBza3U6ICdLRy0xMDQyJywgcHJpY2U6IDI0OSwgd2VpZ2h0OiA0LjIgfSxcbiAgICB7IGlkOiAyLCBuYW1lOiAnUG91ci1vdmVyIGtldHRsZScsIHNrdTogJ0tULTIyMTAnLCBwcmljZTogNzkuNSwgd2VpZ2h0OiAxLjEgfSxcbiAgICB7IGlkOiAzLCBuYW1lOiAnQ2FzdC1pcm9uIHNraWxsZXQnLCBza3U6ICdDSS0wMzEwJywgcHJpY2U6IDU0Ljk5LCB3ZWlnaHQ6IDIuNyB9LFxuICAgIHsgaWQ6IDQsIG5hbWU6ICdTdGFuZCBtaXhlcicsIHNrdTogJ1NNLTc3MDAnLCBwcmljZTogNDI5LCB3ZWlnaHQ6IDEwLjggfSxcbiAgICB7IGlkOiA1LCBuYW1lOiAnQ2hlZiBrbmlmZSAyMWNtJywgc2t1OiAnS04tMDAyMScsIHByaWNlOiAxMTksIHdlaWdodDogMC4yNCB9LFxuICAgIHsgaWQ6IDYsIG5hbWU6ICdEdXRjaCBvdmVuIDUuNUwnLCBza3U6ICdETy01NTAwJywgcHJpY2U6IDMxNSwgd2VpZ2h0OiA1LjYgfSxcbiAgICB7IGlkOiA3LCBuYW1lOiAnQmFtYm9vIGN1dHRpbmcgYm9hcmQnLCBza3U6ICdDQi00MDMwJywgcHJpY2U6IDMyLCB3ZWlnaHQ6IDEuOSB9LFxuICAgIHsgaWQ6IDgsIG5hbWU6ICdEaWdpdGFsIHNjYWxlJywgc2t1OiAnU0MtMDAwNScsIHByaWNlOiAyNC45NSwgd2VpZ2h0OiAwLjQgfSxcbl07XG5cbi8qKiBBIG5vbi1uZWdhdGl2ZSBudW1iZXIsIG9yIG51bGwgd2hlbiB0aGUgdGV4dCBpcyBub3Qgb25lLiAqL1xuZnVuY3Rpb24gcGFyc2VBbW91bnQodGV4dDogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgY29uc3QgdHJpbW1lZCA9IHRleHQudHJpbSgpO1xuICAgIGlmICh0cmltbWVkID09PSAnJykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgbiA9IE51bWJlcih0cmltbWVkKTtcbiAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKG4pICYmIG4gPj0gMCA/IG4gOiBudWxsO1xufVxuXG5pbnRlcmZhY2UgQW1vdW50RWRpdG9yUHJvcHMgZXh0ZW5kcyBHcmlkUmVuZGVyRWRpdENlbGxQYXJhbXM8UHJvZHVjdD4ge1xuICAgIHN0YXJ0QWRvcm5tZW50Pzogc3RyaW5nO1xuICAgIGVuZEFkb3JubWVudD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIG51bWJlciBlZGl0b3IgYnVpbHQgb24gdGhlIGV4cG9ydGVkIDxJbnB1dCB2YXJpYW50PVwiY2VsbFwiPjogaXQgZmlsbHMgdGhlIGNlbGwsIHNob3dzIGEgdW5pdCBhc1xuICogYW4gYWRvcm5tZW50IGFuZCB0dXJucyByZWQgd2hpbGUgdGhlIHRleHQgaXMgbm90IGEgdmFsaWQgYW1vdW50LiBFbnRlciBjb21taXRzIG9ubHkgYSB2YWxpZFxuICogYW1vdW50OyBFc2NhcGUgY2FuY2VsczsgbGVhdmluZyB0aGUgY2VsbCBjb21taXRzIGEgdmFsaWQgYW1vdW50IGFuZCBkcm9wcyBhbiBpbnZhbGlkIG9uZS5cbiAqL1xuZnVuY3Rpb24gQW1vdW50RWRpdG9yKHsgdmFsdWUsIGNvbERlZiwgb25WYWx1ZUNoYW5nZSwgb25Db21taXQsIG9uQ2FuY2VsLCBzdGFydEFkb3JubWVudCwgZW5kQWRvcm5tZW50IH06IEFtb3VudEVkaXRvclByb3BzKSB7XG4gICAgY29uc3QgW3RleHQsIHNldFRleHRdID0gdXNlU3RhdGUoKCkgPT4gU3RyaW5nKHZhbHVlID8/ICcnKSk7XG4gICAgY29uc3QgaW5wdXRSZWYgPSB1c2VSZWY8SFRNTElucHV0RWxlbWVudD4obnVsbCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHsgaW5wdXRSZWYuY3VycmVudD8uZm9jdXMoKTsgaW5wdXRSZWYuY3VycmVudD8uc2VsZWN0KCk7IH0sIFtdKTtcblxuICAgIGNvbnN0IHZhbGlkID0gcGFyc2VBbW91bnQodGV4dCkgIT09IG51bGw7XG5cbiAgICBjb25zdCBoYW5kbGVLZXlEb3duID0gKGU6IEtleWJvYXJkRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgaWYgKHZhbGlkKSBvbkNvbW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIG9uQ2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPElucHV0XG4gICAgICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgdmFyaWFudD1cImNlbGxcIlxuICAgICAgICAgICAgaW5wdXRNb2RlPVwiZGVjaW1hbFwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtjb2xEZWYuaGVhZGVyTmFtZSA/PyBjb2xEZWYuZmllbGR9XG4gICAgICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgICAgIGVycm9yPXshdmFsaWR9XG4gICAgICAgICAgICBzdGFydEFkb3JubWVudD17c3RhcnRBZG9ybm1lbnR9XG4gICAgICAgICAgICBlbmRBZG9ybm1lbnQ9e2VuZEFkb3JubWVudH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFRleHQoZS50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFtb3VudCA9IHBhcnNlQW1vdW50KGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoYW1vdW50ICE9PSBudWxsKSBvblZhbHVlQ2hhbmdlKGFtb3VudCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25CbHVyPXsoKSA9PiAodmFsaWQgPyBvbkNvbW1pdCgpIDogb25DYW5jZWwoKSl9XG4gICAgICAgICAgICBvbktleURvd249e2hhbmRsZUtleURvd259XG4gICAgICAgIC8+XG4gICAgKTtcbn1cblxuY29uc3QgQ09MVU1OUzogR3JpZENvbERlZjxQcm9kdWN0PltdID0gW1xuICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ1Byb2R1Y3QnLCB3aWR0aDogMjAwLCBlZGl0YWJsZTogdHJ1ZSB9LFxuICAgIHsgZmllbGQ6ICdza3UnLCBoZWFkZXJOYW1lOiAnU0tVJywgd2lkdGg6IDExMCB9LFxuICAgIHtcbiAgICAgICAgZmllbGQ6ICdwcmljZScsXG4gICAgICAgIGhlYWRlck5hbWU6ICdQcmljZScsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6ICh7IHZhbHVlIH0pID0+IGAkJHtOdW1iZXIodmFsdWUpLnRvRml4ZWQoMil9YCxcbiAgICAgICAgcmVuZGVyRWRpdENlbGw6IChwYXJhbXMpID0+IDxBbW91bnRFZGl0b3Igey4uLnBhcmFtc30gc3RhcnRBZG9ybm1lbnQ9XCIkXCIgLz4sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGZpZWxkOiAnd2VpZ2h0JyxcbiAgICAgICAgaGVhZGVyTmFtZTogJ1dlaWdodCcsXG4gICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVGb3JtYXR0ZXI6ICh7IHZhbHVlIH0pID0+IGAke051bWJlcih2YWx1ZSl9IGtnYCxcbiAgICAgICAgcmVuZGVyRWRpdENlbGw6IChwYXJhbXMpID0+IDxBbW91bnRFZGl0b3Igey4uLnBhcmFtc30gZW5kQWRvcm5tZW50PVwia2dcIiAvPixcbiAgICB9LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ3VzdG9tRWRpdG9yc0RlbW8oKSB7XG4gICAgY29uc3QgW2xhc3RFZGl0LCBzZXRMYXN0RWRpdF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcblxuICAgIGNvbnN0IHByb2Nlc3NSb3dVcGRhdGUgPSAocm93OiBQcm9kdWN0KSA9PiB7XG4gICAgICAgIHNldExhc3RFZGl0KGAke3Jvdy5uYW1lfTogJCR7cm93LnByaWNlLnRvRml4ZWQoMil9LCAke3Jvdy53ZWlnaHR9IGtnYCk7XG4gICAgICAgIHJldHVybiByb3c7XG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIkN1c3RvbSBDZWxsIEVkaXRvcnNcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249eydyZW5kZXJFZGl0Q2VsbCBjYW4gcmV0dXJuIHRoZSBzYW1lIElucHV0IGNvbXBvbmVudCB0aGUgZ3JpZFxcJ3Mgb3duIGVkaXRvcnMgdXNlLiB2YXJpYW50PVwiY2VsbFwiIG1ha2VzIGl0IGZpbGwgdGhlIGNlbGwgd2l0aCBubyBib3JkZXIgYW5kIHRoZSBjZWxsXFwncyBmb250OyBzdGFydEFkb3JubWVudCAvIGVuZEFkb3JubWVudCBzaG93IGEgY3VycmVuY3kgb3IgdW5pdCwgYW5kIGVycm9yIG1hcmtzIGFuIGludmFsaWQgdmFsdWUgd2l0aCBhIHJlZCBpbm5lciBlZGdlLid9XG4gICAgICAgICAgICBzb3VyY2VDb2RlPXtzb3VyY2VDb2RlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImN1c3RvbS1lZGl0b3JzLWhpbnRcIj5cbiAgICAgICAgICAgICAgICBEb3VibGUtY2xpY2sgYSA8c3Ryb25nPlByaWNlPC9zdHJvbmc+IG9yIDxzdHJvbmc+V2VpZ2h0PC9zdHJvbmc+IGNlbGwgYW5kIHR5cGUuIEEgdmFsdWUgdGhhdCBpcyBub3QgYVxuICAgICAgICAgICAgICAgIG5vbi1uZWdhdGl2ZSBudW1iZXIgdHVybnMgdGhlIGVkaXRvciByZWQ6IEVudGVyIGRvZXMgbm90aGluZyB1bnRpbCBpdCBpcyBmaXhlZCwgRXNjYXBlIG9yIGNsaWNraW5nIGF3YXlcbiAgICAgICAgICAgICAgICBkcm9wcyBpdC5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPERhdGFHcmlkXG4gICAgICAgICAgICAgICAgcm93cz17Uk9XU31cbiAgICAgICAgICAgICAgICBjb2x1bW5zPXtDT0xVTU5TfVxuICAgICAgICAgICAgICAgIHByb2Nlc3NSb3dVcGRhdGU9e3Byb2Nlc3NSb3dVcGRhdGV9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs0MjB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjdXN0b20tZWRpdG9ycy1sb2dcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIj5cbiAgICAgICAgICAgICAgICB7bGFzdEVkaXQgPyA8Pkxhc3Qgc2F2ZWQ6IDxjb2RlPntsYXN0RWRpdH08L2NvZGU+PC8+IDogJ05vIGVkaXRzIHlldC4nfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImN1c3RvbS1lZGl0b3JzLXVzYWdlXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Vc2FnZTo8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8cHJlPntgaW1wb3J0IHsgSW5wdXQgfSBmcm9tICdAb3BlbmNvcmVzdGFjay9vcGVuZ3JpZHgnO1xuXG5mdW5jdGlvbiBQcmljZUVkaXRvcih7IHZhbHVlLCBvblZhbHVlQ2hhbmdlLCBvbkNvbW1pdCwgb25DYW5jZWwgfTogR3JpZFJlbmRlckVkaXRDZWxsUGFyYW1zKSB7XG4gIGNvbnN0IFt0ZXh0LCBzZXRUZXh0XSA9IHVzZVN0YXRlKFN0cmluZyh2YWx1ZSA/PyAnJykpO1xuICBjb25zdCByZWYgPSB1c2VSZWY8SFRNTElucHV0RWxlbWVudD4obnVsbCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7IHJlZi5jdXJyZW50Py5mb2N1cygpOyByZWYuY3VycmVudD8uc2VsZWN0KCk7IH0sIFtdKTtcbiAgY29uc3QgaXNBbW91bnQgPSAodDogc3RyaW5nKSA9PiB0LnRyaW0oKSAhPT0gJycgJiYgTnVtYmVyKHQpID49IDA7XG4gIGNvbnN0IHZhbGlkID0gaXNBbW91bnQodGV4dCk7XG5cbiAgcmV0dXJuIChcbiAgICA8SW5wdXRcbiAgICAgIHJlZj17cmVmfSAgICAgICAgICAgICAgIC8vIHJlYWNoZXMgdGhlIDxpbnB1dD4gKFJlYWN0IDE4IGFuZCAxOSlcbiAgICAgIHZhcmlhbnQ9XCJjZWxsXCIgICAgICAgICAgLy8gZmlsbHMgdGhlIGNlbGwsIG5vIGJvcmRlciBvciBmb2N1cyByaW5nXG4gICAgICBzdGFydEFkb3JubWVudD1cIiRcIlxuICAgICAgZXJyb3I9eyF2YWxpZH0gICAgICAgICAgLy8gcmVkIGlubmVyIGVkZ2UgKyBhcmlhLWludmFsaWRcbiAgICAgIHZhbHVlPXt0ZXh0fVxuICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgIHNldFRleHQoZS50YXJnZXQudmFsdWUpO1xuICAgICAgICBpZiAoaXNBbW91bnQoZS50YXJnZXQudmFsdWUpKSBvblZhbHVlQ2hhbmdlKE51bWJlcihlLnRhcmdldC52YWx1ZSkpO1xuICAgICAgfX1cbiAgICAgIG9uS2V5RG93bj17KGUpID0+IHtcbiAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IGlmICh2YWxpZCkgb25Db21taXQoKTsgfVxuICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IG9uQ2FuY2VsKCk7IH1cbiAgICAgIH19XG4gICAgICBvbkJsdXI9eygpID0+ICh2YWxpZCA/IG9uQ29tbWl0KCkgOiBvbkNhbmNlbCgpKX1cbiAgICAvPlxuICApO1xufVxuXG5jb25zdCBjb2x1bW5zOiBHcmlkQ29sRGVmW10gPSBbXG4gIHsgZmllbGQ6ICdwcmljZScsIHR5cGU6ICdudW1iZXInLCBlZGl0YWJsZTogdHJ1ZSxcbiAgICByZW5kZXJFZGl0Q2VsbDogKHBhcmFtcykgPT4gPFByaWNlRWRpdG9yIHsuLi5wYXJhbXN9IC8+IH0sXG5dO2B9PC9wcmU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Eb2NzTGF5b3V0PlxuICAgICk7XG59XG4iXSwibmFtZXMiOlsic291cmNlQ29kZSIsIlJPV1MiLCJwYXJzZUFtb3VudCIsInRleHQiLCJ0cmltbWVkIiwiQW1vdW50RWRpdG9yIiwidmFsdWUiLCJjb2xEZWYiLCJvblZhbHVlQ2hhbmdlIiwib25Db21taXQiLCJvbkNhbmNlbCIsInN0YXJ0QWRvcm5tZW50IiwiZW5kQWRvcm5tZW50Iiwic2V0VGV4dCIsInVzZVN0YXRlIiwiaW5wdXRSZWYiLCJ1c2VSZWYiLCJ1c2VFZmZlY3QiLCJ2YWxpZCIsImhhbmRsZUtleURvd24iLCJlIiwianN4IiwiSW5wdXQiLCJhbW91bnQiLCJDT0xVTU5TIiwicGFyYW1zIiwiQ3VzdG9tRWRpdG9yc0RlbW8iLCJsYXN0RWRpdCIsInNldExhc3RFZGl0IiwicHJvY2Vzc1Jvd1VwZGF0ZSIsInJvdyIsImpzeHMiLCJEb2NzTGF5b3V0IiwiRGF0YUdyaWQiLCJGcmFnbWVudCJdLCJtYXBwaW5ncyI6InNKQUFBLE1BQUFBLEVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVDZ0JUQyxFQUFrQixDQUNwQixDQUFFLEdBQUksRUFBRyxLQUFNLG1CQUFvQixJQUFLLFVBQVcsTUFBTyxJQUFLLE9BQVEsR0FBQSxFQUN2RSxDQUFFLEdBQUksRUFBRyxLQUFNLG1CQUFvQixJQUFLLFVBQVcsTUFBTyxLQUFNLE9BQVEsR0FBQSxFQUN4RSxDQUFFLEdBQUksRUFBRyxLQUFNLG9CQUFxQixJQUFLLFVBQVcsTUFBTyxNQUFPLE9BQVEsR0FBQSxFQUMxRSxDQUFFLEdBQUksRUFBRyxLQUFNLGNBQWUsSUFBSyxVQUFXLE1BQU8sSUFBSyxPQUFRLElBQUEsRUFDbEUsQ0FBRSxHQUFJLEVBQUcsS0FBTSxrQkFBbUIsSUFBSyxVQUFXLE1BQU8sSUFBSyxPQUFRLEdBQUEsRUFDdEUsQ0FBRSxHQUFJLEVBQUcsS0FBTSxrQkFBbUIsSUFBSyxVQUFXLE1BQU8sSUFBSyxPQUFRLEdBQUEsRUFDdEUsQ0FBRSxHQUFJLEVBQUcsS0FBTSx1QkFBd0IsSUFBSyxVQUFXLE1BQU8sR0FBSSxPQUFRLEdBQUEsRUFDMUUsQ0FBRSxHQUFJLEVBQUcsS0FBTSxnQkFBaUIsSUFBSyxVQUFXLE1BQU8sTUFBTyxPQUFRLEVBQUEsQ0FDMUUsRUFHQSxTQUFTQyxFQUFZQyxFQUE2QixDQUM5QyxNQUFNQyxFQUFVRCxFQUFLLEtBQUEsRUFDckIsR0FBSUMsSUFBWSxHQUFJLE9BQU8sS0FDM0IsTUFBTSxFQUFJLE9BQU9BLENBQU8sRUFDeEIsT0FBTyxPQUFPLFNBQVMsQ0FBQyxHQUFLLEdBQUssRUFBSSxFQUFJLElBQzlDLENBWUEsU0FBU0MsRUFBYSxDQUFFLE1BQUFDLEVBQU8sT0FBQUMsRUFBUSxjQUFBQyxFQUFlLFNBQUFDLEVBQVUsU0FBQUMsRUFBVSxlQUFBQyxFQUFnQixhQUFBQyxHQUFtQyxDQUN6SCxLQUFNLENBQUNULEVBQU1VLENBQU8sRUFBSUMsRUFBQUEsU0FBUyxJQUFNLE9BQU9SLEdBQVMsRUFBRSxDQUFDLEVBQ3BEUyxFQUFXQyxFQUFBQSxPQUF5QixJQUFJLEVBQzlDQyxFQUFBQSxVQUFVLElBQU0sQ0FBRUYsRUFBUyxTQUFTLE1BQUEsRUFBU0EsRUFBUyxTQUFTLE9BQUEsQ0FBVSxFQUFHLENBQUEsQ0FBRSxFQUU5RSxNQUFNRyxFQUFRaEIsRUFBWUMsQ0FBSSxJQUFNLEtBRTlCZ0IsRUFBaUJDLEdBQXVDLENBQ3REQSxFQUFFLE1BQVEsU0FDVkEsRUFBRSxnQkFBQSxFQUNFRixHQUFPVCxFQUFBLEdBQ0pXLEVBQUUsTUFBUSxXQUNqQkEsRUFBRSxnQkFBQSxFQUNGVixFQUFBLEVBRVIsRUFFQSxPQUNJVyxFQUFBQSxJQUFDQyxFQUFBLENBQ0csSUFBS1AsRUFDTCxRQUFRLE9BQ1IsVUFBVSxVQUNWLGFBQVlSLEVBQU8sWUFBY0EsRUFBTyxNQUN4QyxNQUFPSixFQUNQLE1BQU8sQ0FBQ2UsRUFDUixlQUFBUCxFQUNBLGFBQUFDLEVBQ0EsU0FBV1EsR0FBTSxDQUNiUCxFQUFRTyxFQUFFLE9BQU8sS0FBSyxFQUN0QixNQUFNRyxFQUFTckIsRUFBWWtCLEVBQUUsT0FBTyxLQUFLLEVBQ3JDRyxJQUFXLE1BQU1mLEVBQWNlLENBQU0sQ0FDN0MsRUFDQSxPQUFRLElBQU9MLEVBQVFULEVBQUEsRUFBYUMsRUFBQSxFQUNwQyxVQUFXUyxDQUFBLENBQUEsQ0FHdkIsQ0FFQSxNQUFNSyxFQUFpQyxDQUNuQyxDQUFFLE1BQU8sT0FBUSxXQUFZLFVBQVcsTUFBTyxJQUFLLFNBQVUsRUFBQSxFQUM5RCxDQUFFLE1BQU8sTUFBTyxXQUFZLE1BQU8sTUFBTyxHQUFBLEVBQzFDLENBQ0ksTUFBTyxRQUNQLFdBQVksUUFDWixLQUFNLFNBQ04sTUFBTyxJQUNQLFNBQVUsR0FDVixlQUFnQixDQUFDLENBQUUsTUFBQWxCLENBQUEsSUFBWSxJQUFJLE9BQU9BLENBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUMzRCxlQUFpQm1CLEdBQVdKLE1BQUNoQixHQUFjLEdBQUdvQixFQUFRLGVBQWUsR0FBQSxDQUFJLENBQUEsRUFFN0UsQ0FDSSxNQUFPLFNBQ1AsV0FBWSxTQUNaLEtBQU0sU0FDTixNQUFPLElBQ1AsU0FBVSxHQUNWLGVBQWdCLENBQUMsQ0FBRSxNQUFBbkIsQ0FBQSxJQUFZLEdBQUcsT0FBT0EsQ0FBSyxDQUFDLE1BQy9DLGVBQWlCbUIsR0FBV0osTUFBQ2hCLEdBQWMsR0FBR29CLEVBQVEsYUFBYSxJQUFBLENBQUssQ0FBQSxDQUVoRixFQUVBLFNBQXdCQyxHQUFvQixDQUN4QyxLQUFNLENBQUNDLEVBQVVDLENBQVcsRUFBSWQsRUFBQUEsU0FBd0IsSUFBSSxFQUV0RGUsRUFBb0JDLElBQ3RCRixFQUFZLEdBQUdFLEVBQUksSUFBSSxNQUFNQSxFQUFJLE1BQU0sUUFBUSxDQUFDLENBQUMsS0FBS0EsRUFBSSxNQUFNLEtBQUssRUFDOURBLEdBR1gsT0FDSUMsRUFBQUEsS0FBQ0MsRUFBQSxDQUNHLE1BQU0sc0JBQ04sWUFBYSwwUUFDYixXQUFBaEMsRUFFQSxTQUFBLENBQUErQixFQUFBQSxLQUFDLE1BQUEsQ0FBSSxVQUFVLHNCQUFzQixTQUFBLENBQUEsa0JBQ2xCVixFQUFBQSxJQUFDLFVBQU8sU0FBQSxPQUFBLENBQUssRUFBUyxPQUFJQSxFQUFBQSxJQUFDLFVBQU8sU0FBQSxRQUFBLENBQU0sRUFBUyx5SkFBQSxFQUdwRSxFQUNBQSxFQUFBQSxJQUFDWSxFQUFBLENBQ0csS0FBTWhDLEVBQ04sUUFBU3VCLEVBQ1QsaUJBQUFLLEVBQ0EsT0FBUSxHQUFBLENBQUEsUUFFWCxNQUFBLENBQUksVUFBVSxxQkFBcUIsWUFBVSxTQUN6QyxXQUFXRSxFQUFBQSxLQUFBRyxFQUFBQSxTQUFBLENBQUUsU0FBQSxDQUFBLGVBQVliLEVBQUFBLElBQUMsUUFBTSxTQUFBTSxDQUFBLENBQVMsQ0FBQSxDQUFBLENBQU8sRUFBTSxnQkFDM0QsRUFDQUksRUFBQUEsS0FBQyxNQUFBLENBQUksVUFBVSx1QkFDWCxTQUFBLENBQUFWLEVBQUFBLElBQUMsVUFBTyxTQUFBLFFBQUEsQ0FBTSxRQUNiLE1BQUEsQ0FBSyxTQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFBLENBZ0NsQixDQUFBLENBQUEsQ0FDUSxDQUFBLENBQUEsQ0FBQSxDQUdaIn0=
