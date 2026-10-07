import { useEffect, useRef, useState } from 'react';
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
        valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}`,
        renderEditCell: (params) => <AmountEditor {...params} startAdornment="$" />,
    },
    {
        field: 'weight',
        headerName: 'Weight',
        type: 'number',
        width: 130,
        editable: true,
        valueFormatter: ({ value }) => `${Number(value)} kg`,
        renderEditCell: (params) => <AmountEditor {...params} endAdornment="kg" />,
    },
];

export default function CustomEditorsDemo() {
    const [lastEdit, setLastEdit] = useState<string | null>(null);

    const processRowUpdate = (row: Product) => {
        setLastEdit(`${row.name}: $${row.price.toFixed(2)}, ${row.weight} kg`);
        return row;
    };

    return (
        <DocsLayout
            title="Custom Cell Editors"
            description={'renderEditCell can return the same Input component the grid\'s own editors use. variant="cell" makes it fill the cell with no border and the cell\'s font; startAdornment / endAdornment show a currency or unit, and error marks an invalid value with a red inner edge.'}
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
                <pre>{`import { Input } from '@opencorestack/opengridx';

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
];`}</pre>
            </div>
        </DocsLayout>
    );
}
