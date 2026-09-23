import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import ExcelJS from 'exceljs';
import { exportToExcelAdvanced } from './exportToExcelAdvanced';
import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

let capturedBlob: Blob | null = null;
const origCreateObjectURL = URL.createObjectURL;
const origRevokeObjectURL = URL.revokeObjectURL;
const origClick = HTMLAnchorElement.prototype.click;

beforeEach(() => {
    capturedBlob = null;
    URL.createObjectURL = (blob: Blob) => { capturedBlob = blob; return 'blob:mock'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};
});

afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
    HTMLAnchorElement.prototype.click = origClick;
    vi.restoreAllMocks();
});

async function workbook(): Promise<ExcelJS.Workbook> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await capturedBlob!.arrayBuffer());
    return wb;
}

async function sheet(index = 0): Promise<ExcelJS.Worksheet> {
    return (await workbook()).worksheets[index];
}

// 1x1 transparent PNG
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const pngBytes = (): ArrayBuffer => Uint8Array.from(atob(PNG_BASE64), c => c.charCodeAt(0)).buffer;

// tsconfig.test.json has no Node types; process.env is still there at runtime.
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;

describe('exportToExcelAdvanced — dates east of UTC', () => {
    // Node re-reads TZ when it changes; UTC+5:30 is where the old code wrote the previous day.
    const originalTz = env.TZ;
    beforeAll(() => { env.TZ = 'Asia/Kolkata'; });
    afterAll(() => {
        if (originalTz === undefined) delete env.TZ;
        else env.TZ = originalTz;
    });

    it('writes a local-midnight Date as that calendar day, not the previous one', async () => {
        const d = new Date(2024, 0, 15);
        expect(d.getTimezoneOffset()).toBe(-330);
        await exportToExcelAdvanced([{ id: 1, d }], [{ field: 'd', type: 'date' }]);
        const value = (await sheet()).getCell('A2').value as Date;
        // ExcelJS reads serials back as UTC; the wall-clock day and time must be preserved.
        expect(value.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('keeps the wall-clock time of a Date with a time component', async () => {
        await exportToExcelAdvanced([{ id: 1, d: new Date(2024, 0, 15, 9, 30) }], [{ field: 'd', type: 'date' }]);
        expect(((await sheet()).getCell('A2').value as Date).toISOString()).toBe('2024-01-15T09:30:00.000Z');
    });

    it('writes an ISO date string in a date column as a native date of that day', async () => {
        await exportToExcelAdvanced([{ id: 1, d: '2024-01-15' }], [{ field: 'd', type: 'date', valueFormatter: () => 'FORMATTED' }]);
        const cell = (await sheet()).getCell('A2');
        expect(cell.type).toBe(ExcelJS.ValueType.Date);
        expect((cell.value as Date).toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('writes min / max of a date column as a date, not an epoch-millisecond number', async () => {
        const d = new Date(2024, 0, 15);
        const groupedRows: GridGroupedExportRow[] = [
            { type: 'leaf', depth: 0, row: { id: 1, d } },
            { type: 'grand-total', depth: 0, aggregatedValues: { d: d.getTime() } },
        ];
        await exportToExcelAdvanced([{ id: 1, d }], [{ field: 'd', type: 'date' }], { groupedRows, aggregationModel: { d: 'min' } });
        const cell = (await sheet()).getCell('A3');
        expect(cell.type).toBe(ExcelJS.ValueType.Date);
        expect((cell.value as Date).toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });
});

describe('exportToExcelAdvanced — values Excel cannot represent', () => {
    it('writes NaN, Infinity and Invalid Date as empty cells', async () => {
        await exportToExcelAdvanced(
            [{ id: 1, a: NaN, d: new Date('garbage') }, { id: 2, a: Infinity, d: null }],
            [{ field: 'a', type: 'number' }, { field: 'd', type: 'date' }],
        );
        const ws = await sheet();
        expect(ws.getCell('A2').value).toBeNull();
        expect(ws.getCell('A3').value).toBeNull();
        expect(ws.getCell('B2').value).toBeNull();
    });

    it('writes an object with a formula key as text, not a live formula', async () => {
        await exportToExcelAdvanced([{ id: 1, note: { formula: 'HYPERLINK("http://evil.example","click")' } }], [{ field: 'note' }]);
        const cell = (await sheet()).getCell('A2');
        expect(cell.type).toBe(ExcelJS.ValueType.String);
        expect(cell.value).toBe('{"formula":"HYPERLINK(\\"http://evil.example\\",\\"click\\")"}');
    });

    it('writes hyperlink, rich-text and error objects as text', async () => {
        await exportToExcelAdvanced(
            [{ id: 1, a: { text: 'Invoice', hyperlink: 'file://attacker/share/payload.exe' }, b: { richText: [{ text: 'x' }] }, c: { error: '#N/A' } }],
            [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        );
        const ws = await sheet();
        for (const ref of ['A2', 'B2', 'C2']) expect(ws.getCell(ref).type).toBe(ExcelJS.ValueType.String);
        expect(ws.getCell('A2').value).toBe('{"text":"Invoice","hyperlink":"file://attacker/share/payload.exe"}');
    });

    it('uses the valueFormatter for object values in text columns', async () => {
        await exportToExcelAdvanced([{ id: 1, user: { name: 'Ann' } }], [{ field: 'user', valueFormatter: ({ value }) => (value as { name: string }).name }]);
        expect((await sheet()).getCell('A2').value).toBe('Ann');
    });
});

describe('exportToExcelAdvanced — typed columns', () => {
    it('writes numeric strings in a number column as numbers', async () => {
        await exportToExcelAdvanced([{ id: 1, amount: '42.50' }, { id: 2, amount: 'n/a' }], [{ field: 'amount', type: 'number' }]);
        const ws = await sheet();
        expect(ws.getCell('A2').value).toBe(42.5);
        expect(ws.getCell('A3').value).toBe('n/a');
    });

    it('falls back to the valueFormatter for values that are not of the column type', async () => {
        await exportToExcelAdvanced([{ id: 1, amount: 'n/a' }], [{ field: 'amount', type: 'number', valueFormatter: ({ value }) => `[${String(value)}]` }]);
        expect((await sheet()).getCell('A2').value).toBe('[n/a]');
    });

    it("writes 'true' / 'false' strings in a boolean column as booleans", async () => {
        await exportToExcelAdvanced([{ id: 1, ok: 'true' }, { id: 2, ok: 'FALSE' }], [{ field: 'ok', type: 'boolean' }]);
        const ws = await sheet();
        expect(ws.getCell('A2').value).toBe(true);
        expect(ws.getCell('A3').value).toBe(false);
    });

    it('formats whole numbers without a trailing decimal point', async () => {
        await exportToExcelAdvanced([{ id: 1, a: 5 }, { id: 2, a: 2.5 }], [{ field: 'a', type: 'number' }]);
        const ws = await sheet();
        expect(ws.getCell('A2').numFmt).toBe('#,##0');
        expect(ws.getCell('A3').numFmt).toBe('#,##0.##');
    });

    it('keeps a columnStyles numFmt for every number cell', async () => {
        await exportToExcelAdvanced([{ id: 1, a: 5 }], [{ field: 'a', type: 'number' }], { columnStyles: { a: { numFmt: '$#,##0.00' } } });
        expect((await sheet()).getCell('A2').numFmt).toBe('$#,##0.00');
    });

    it('runs the valueFormatter for missing values in text columns, as the grid does', async () => {
        await exportToExcelAdvanced([{ id: 1, owner: null }], [{ field: 'owner', valueFormatter: ({ value }) => (value == null ? 'Unassigned' : String(value)) }]);
        expect((await sheet()).getCell('A2').value).toBe('Unassigned');
    });
});

describe('exportToExcelAdvanced — aggregates', () => {
    const cols: GridColDef[] = [
        { field: 'dept' },
        { field: 'hired', type: 'date' },
        { field: 'price', type: 'number', valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` },
    ];
    const r1: GridRowModel = { id: 1, dept: 'A', hired: new Date(2020, 0, 1), price: 3 };

    it('writes count aggregates as plain integers, not in the column date or currency format', async () => {
        const g: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'A' },
            { type: 'leaf', depth: 1, row: r1 },
            { type: 'group-subtotal', depth: 0, aggregatedValues: { hired: 5, price: 7 } },
        ];
        await exportToExcelAdvanced([r1], cols, { groupedRows: g, columnStyles: { price: { numFmt: '$#,##0.00' } }, aggregationModel: { hired: 'count', price: 'count' } });
        const subtotal = (await sheet()).getRow(4);
        expect(subtotal.getCell(2).value).toBe(5);
        expect(subtotal.getCell(2).numFmt).toBe('#,##0');
        expect(subtotal.getCell(3).value).toBe(7);
        expect(subtotal.getCell(3).numFmt).toBe('#,##0');
    });

    it('writes the flat includeSummary totals as numbers', async () => {
        await exportToExcelAdvanced([{ id: 1, a: 'x', n: 1234.5 }], [{ field: 'a' }, { field: 'n', type: 'number' }], {
            sheets: [{ name: 'D', includeSummary: true }], aggregationModel: { n: 'sum' }, aggregationResult: { n: 1234.5 },
        });
        const cell = (await sheet()).getRow(4).getCell(2);
        expect(cell.value).toBe(1234.5);
        expect(cell.numFmt).toBe('#,##0.##');
    });

    it('writes the summary sheet values as numbers', async () => {
        await exportToExcelAdvanced([{ id: 1, n: 1234.5 }], [{ field: 'n', headerName: 'N', type: 'number' }], {
            sheets: [{ type: 'summary' }], aggregationModel: { n: 'sum' }, aggregationResult: { n: 1234.5 },
        });
        const row = (await sheet()).getRow(4);
        expect(row.getCell(1).value).toBe('N');
        expect(row.getCell(3).value).toBe(1234.5);
    });

    it('does not abort the export when a valueFormatter reads row fields for a text aggregate', async () => {
        const c: GridColDef<GridRowModel & { cur?: { sym: string } }>[] = [
            { field: 'tag', valueFormatter: ({ value, row }) => `${row.cur!.sym}${String(value)}` },
        ];
        await exportToExcelAdvanced([{ id: 1, tag: 'x', cur: { sym: '€' } }], c, {
            sheets: [{ name: 'D', includeSummary: true }], aggregationModel: { tag: 'max' }, aggregationResult: { tag: 'z' },
        });
        expect((await sheet()).getRow(4).getCell(1).value).toBe('z');
    });

    it("recomputes the includeSummary totals of a rows:'selected' sheet over the selected rows", async () => {
        await exportToExcelAdvanced(
            [{ id: 1, n: 100 }, { id: 2, n: 200 }, { id: 3, n: 700 }],
            [{ field: 'n', type: 'number' }],
            { sheets: [{ name: 'Sel', rows: 'selected', includeSummary: true }], selectedRows: [1, 2], aggregationModel: { n: 'sum' }, aggregationResult: { n: 1000 } },
        );
        const ws = await sheet();
        expect(ws.getRow(5).getCell(1).value).toBe(300);
    });
});

describe('exportToExcelAdvanced — sheets', () => {
    it("writes only the header on a rows:'selected' sheet when nothing is selected", async () => {
        await exportToExcelAdvanced([{ id: 1, a: 'x' }, { id: 2, a: 'y' }], [{ field: 'a' }], {
            sheets: [{ name: 'Selected', rows: 'selected' }], selectedRows: [],
        });
        expect((await sheet()).rowCount).toBe(1);
    });

    it('replaces characters Excel rejects, cuts to 31 characters and de-duplicates sheet names', async () => {
        await exportToExcelAdvanced([{ id: 1, a: 'x' }], [{ field: 'a' }], {
            sheets: [
                { name: 'Sales 2024/25' },
                { name: 'Data' },
                { name: 'data', rows: 'selected' },
                { name: 'A very long sheet name that exceeds the limit' },
                { type: 'summary' },
                { type: 'summary' },
            ],
            selectedRows: [1],
            aggregationModel: { a: 'count' },
            aggregationResult: { a: 1 },
        });
        expect((await workbook()).worksheets.map(ws => ws.name)).toEqual([
            'Sales 2024-25', 'Data', 'data (2)', 'A very long sheet name that exc', 'Summary', 'Summary (2)',
        ]);
    });
});

describe('exportToExcelAdvanced — styling', () => {
    it('stripes and borders empty cells of an alternate row too', async () => {
        await exportToExcelAdvanced(
            [{ id: 1, a: 'x', b: 'y' }, { id: 2, a: 'x', b: null }],
            [{ field: 'a' }, { field: 'b' }],
        );
        const cell = (await sheet()).getRow(3).getCell(2);
        expect(cell.fill).toMatchObject({ type: 'pattern', pattern: 'solid' });
        expect(cell.border?.bottom).toBeDefined();
    });
});

describe('exportToExcelAdvanced — embedded images', () => {
    it('fetches the image URL a valueGetter returns', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(pngBytes(), { headers: { 'content-type': 'image/png' } }));
        const cols: GridColDef<GridRowModel & { user: { avatar: string } }>[] = [
            { field: 'avatar', valueGetter: ({ row }) => row.user.avatar },
        ];
        await exportToExcelAdvanced([{ id: 1, user: { avatar: 'https://example.com/a.png' } }], cols, {
            columnStyles: { avatar: { embedImage: true } },
        });
        expect(fetchSpy).toHaveBeenCalledWith('https://example.com/a.png', { mode: 'cors' });
        expect((await sheet()).getImages()).toHaveLength(1);
    });

    it('writes the URL text instead of embedding an image format Excel cannot show', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'content-type': 'image/svg+xml' } }));
        await exportToExcelAdvanced([{ id: 1, img: 'https://example.com/logo.svg' }], [{ field: 'img' }], {
            columnStyles: { img: { embedImage: true } },
        });
        const ws = await sheet();
        expect(ws.getImages()).toHaveLength(0);
        expect(ws.getCell('A2').value).toBe('https://example.com/logo.svg');
    });

    it('detects a JPEG by its bytes even when the server says PNG', async () => {
        const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(jpeg, { headers: { 'content-type': 'image/png' } }));
        await exportToExcelAdvanced([{ id: 1, img: 'https://example.com/a' }], [{ field: 'img' }], {
            columnStyles: { img: { embedImage: true } },
        });
        const wb = await workbook();
        const media = (wb.model as unknown as { media: { extension: string }[] }).media;
        expect(media.map(m => m.extension)).toEqual(['jpeg']);
    });
});
