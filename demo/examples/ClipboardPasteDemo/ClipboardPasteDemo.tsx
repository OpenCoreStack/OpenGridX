import { useState } from 'react';
import {
    Button,
    DataGrid,
    useGridApiRef,
    type GridClipboardPasteResult,
    type GridColDef,
} from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import '../PasteDemos.css';

import sourceCode from './ClipboardPasteDemo.tsx?raw';

interface InventoryRow {
    id: number;
    sku: string;
    name: string;
    category: string;
    stock: number | null;
    /** Entered with European number format (1.234,5) through a valueParser. */
    unitPriceEur: number | null;
    restockDate: Date | null;
    active: boolean | null;
}

const CATEGORIES = ['Hardware', 'Cables', 'Audio', 'Storage'];

const initialRows: InventoryRow[] = [
    { id: 1, sku: 'HW-100', name: 'USB-C hub', category: 'Hardware', stock: 120, unitPriceEur: 39.9, restockDate: new Date(2026, 9, 12), active: true },
    { id: 2, sku: 'CB-210', name: 'HDMI cable 2 m', category: 'Cables', stock: 640, unitPriceEur: 8.5, restockDate: new Date(2026, 9, 20), active: true },
    { id: 3, sku: 'AU-330', name: 'Studio headset', category: 'Audio', stock: 45, unitPriceEur: 129, restockDate: null, active: true },
    { id: 4, sku: 'ST-400', name: 'NVMe drive 1 TB', category: 'Storage', stock: 80, unitPriceEur: 74.99, restockDate: new Date(2026, 10, 2), active: false },
    { id: 5, sku: 'HW-150', name: 'Docking station', category: 'Hardware', stock: 32, unitPriceEur: 189, restockDate: new Date(2026, 9, 30), active: true },
    { id: 6, sku: 'CB-260', name: 'Ethernet cable 5 m', category: 'Cables', stock: 410, unitPriceEur: 6.2, restockDate: null, active: true },
    { id: 7, sku: 'AU-360', name: 'USB microphone', category: 'Audio', stock: 18, unitPriceEur: 99, restockDate: new Date(2026, 11, 1), active: false },
    { id: 8, sku: 'ST-450', name: 'Portable SSD 2 TB', category: 'Storage', stock: 54, unitPriceEur: 159, restockDate: null, active: true },
];

/** `1.234,5` → 1234.5. Throwing rejects the text: the cell is skipped with reason 'invalidValue'. */
const parseEuropeanNumber = (text: string): number | null => {
    const trimmed = text.replace(/[\s€]/g, '');
    if (trimmed === '') return null;
    if (!/^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(trimmed) && !/^-?\d+(?:,\d+)?$/.test(trimmed)) {
        throw new Error(`Not a European number: ${text}`);
    }
    return Number(trimmed.split('.').join('').replace(',', '.'));
};

const euro = ({ value }: { value: unknown }) =>
    typeof value === 'number' ? value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '';

const columns: GridColDef<InventoryRow>[] = [
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'name', headerName: 'Product', width: 170, editable: true },
    { field: 'category', headerName: 'Category', type: 'singleSelect', valueOptions: CATEGORIES, width: 120, editable: true },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 90, editable: true },
    {
        field: 'unitPriceEur',
        headerName: 'Unit price (€)',
        type: 'number',
        width: 130,
        editable: true,
        valueFormatter: euro,
        valueParser: (text) => parseEuropeanNumber(text),
    },
    { field: 'restockDate', headerName: 'Restock', type: 'date', width: 120, editable: true },
    { field: 'active', headerName: 'Active', type: 'boolean', width: 90, editable: true },
];

// Tab-separated, as Excel and Google Sheets put it on the clipboard. Row 3 has two invalid cells.
const SAMPLE_TSV = [
    'Wireless mouse\tHardware\t250\t24,90\t2026-10-15\tyes',
    'Optical cable\tCables\t1,200\t3,49\t2026-10-18\tno',
    'Speaker set\tKitchen\tmany\t1.299,00\t2026-11-03\tyes',
].join('\n');

const REASONS: Record<string, string> = {
    notEditable: 'not editable',
    invalidValue: 'invalid value',
    changed: 'changed since',
    missing: 'row gone',
};

export default function ClipboardPasteDemo() {
    const apiRef = useGridApiRef<InventoryRow>();
    const [rows, setRows] = useState(initialRows);
    const [summary, setSummary] = useState<GridClipboardPasteResult | null>(null);
    const [copyStatus, setCopyStatus] = useState('');

    const copySample = async () => {
        try {
            await navigator.clipboard.writeText(SAMPLE_TSV);
            setCopyStatus('Copied. Click a Product cell and press Ctrl / ⌘ + V.');
        } catch {
            setCopyStatus('The browser blocked the clipboard: select the text below and copy it.');
        }
    };

    const pasteSampleFromButton = async () => {
        // A toolbar "Paste" button: no keyboard event, so it calls the API with text it already has.
        apiRef.current.selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' });
        await apiRef.current.pasteText(SAMPLE_TSV);
    };

    const pastedCells = summary
        ? summary.text.split(/\r?\n/).filter(line => line !== '').reduce((n, line) => n + line.split('\t').length, 0) - summary.skipped.length
        : 0;

    return (
        <DocsLayout
            title="Paste from Excel"
            description={
                <>
                    With <code>cellSelection</code> on, <code>Ctrl / ⌘ + V</code> pastes a block copied from Excel or
                    Google Sheets into the editable cells, starting at the active cell. Each value is parsed for its
                    column and saved through <code>processRowUpdate</code>, one call per row.
                </>
            }
            sourceCode={sourceCode}
        >
            <div className="paste-demo">
                <section className="paste-demo__sample">
                    <div className="paste-demo__sample-head">
                        <strong>Sample from a spreadsheet</strong>
                        <Button variant="contained" color="primary" size="small" onClick={copySample}>Copy sample</Button>
                        <Button variant="outlined" size="small" onClick={pasteSampleFromButton}>Paste at Product, row 1 (apiRef.pasteText)</Button>
                        {copyStatus && <span className="paste-demo__status">{copyStatus}</span>}
                    </div>
                    <pre className="paste-demo__tsv" data-testid="sample-tsv">{SAMPLE_TSV.split('\t').join('  ⇥  ')}</pre>
                    <p className="paste-demo__hint">
                        Prices use the European format (<code>24,90</code>, <code>1.299,00</code>): the Unit price column
                        has a <code>valueParser</code> for it. <code>1,200</code> in Stock is a thousands separator.
                        Row 3 has an unknown category and a stock of <code>many</code>; those two cells are skipped.
                    </p>
                </section>

                <DataGrid<InventoryRow>
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    cellSelection
                    onClipboardPaste={setSummary}
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                    height={400}
                />

                <section className="paste-demo__summary" aria-live="polite">
                    <strong>onClipboardPaste</strong>
                    {!summary && <p>Paste into the grid to see the result.</p>}
                    {summary && (
                        <>
                            <p>
                                {pastedCells} cells pasted into {summary.updated.length} rows,{' '}
                                {summary.skipped.length} skipped{summary.failed.length > 0 && `, ${summary.failed.length} rows failed`}.
                            </p>
                            {summary.skipped.length > 0 && (
                                <ul>
                                    {summary.skipped.map(s => (
                                        <li key={`${s.id}:${s.field}`}>
                                            Row {String(s.id)} · <code>{s.field}</code>: {REASONS[s.reason]}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </section>

                <p className="paste-demo__note">
                    <strong>Delete / Backspace</strong> on a range of more than one cell empties its editable cells
                    (<code>''</code> in text columns, <code>null</code> elsewhere) in one edit. Turn it off with{' '}
                    <code>disableRangeClear</code>; turn paste off with <code>disableClipboardPaste</code>. The SKU column
                    is not editable, so paste and Delete skip it.
                </p>

                <pre className="paste-demo__code"><code>{`<DataGrid
    rows={rows}
    columns={[
        // …
        {
            field: 'unitPriceEur',
            type: 'number',
            editable: true,
            // "1.234,5" → 1234.5; throw to skip the cell
            valueParser: (text) => parseEuropeanNumber(text),
        },
    ]}
    cellSelection
    onClipboardPaste={({ updated, skipped, failed }) => toast(\`\${updated.length} rows updated, \${skipped.length} cells skipped\`)}
    onBeforeClipboardPaste={({ text }) => text.length < 1_000_000}   // false cancels, a string replaces the text
    processRowUpdate={saveRow}
/>`}</code></pre>
            </div>
        </DocsLayout>
    );
}
