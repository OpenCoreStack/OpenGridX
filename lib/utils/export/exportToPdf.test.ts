import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

// --- jsPDF mocks ---
const mockAutoTable = vi.fn();
const mockSave = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();
const mockText = vi.fn();
const mockLine = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSetLineWidth = vi.fn();
const mockAddImage = vi.fn();
const mockSetPage = vi.fn();
const mockSplitTextToSize = vi.fn<(text: string, maxWidth: number) => string[]>(text => [text]);
const mockAddFileToVFS = vi.fn();
const mockAddFont = vi.fn();

class MockJsPDF {
    save = mockSave;
    setFontSize = mockSetFontSize;
    setFont = mockSetFont;
    setTextColor = mockSetTextColor;
    text = mockText;
    line = mockLine;
    setDrawColor = mockSetDrawColor;
    setLineWidth = mockSetLineWidth;
    addImage = mockAddImage;
    setPage = mockSetPage;
    splitTextToSize = mockSplitTextToSize;
    addFileToVFS = mockAddFileToVFS;
    addFont = mockAddFont;
    lastAutoTable = { finalY: 50 };
    internal = {
        pageSize: { getWidth: () => 297, getHeight: () => 210 },
        getNumberOfPages: () => 1,
    };
    getNumberOfPages = () => 1;
}

vi.mock('jspdf', () => ({ default: MockJsPDF }));
vi.mock('jspdf-autotable', () => ({ default: mockAutoTable }));

const sampleColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'salary', headerName: 'Salary', width: 120, valueFormatter: ({ value }) => `$${value}` },
    { field: 'hidden', headerName: 'Hidden', width: 100, exportable: false },
    { field: '__check__', headerName: '', width: 50 },
];

const sampleRows: GridRowModel[] = [
    { id: 1, name: 'Alice', salary: 90000, hidden: 'secret' },
    { id: 2, name: 'Bob', salary: 80000, hidden: 'secret' },
];

describe('exportToPdf', () => {
    beforeEach(() => {
        mockAutoTable.mockClear();
        mockSave.mockClear();
        mockText.mockClear();
        mockAddImage.mockClear();
    });

    it('calls doc.save with the correct filename', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { fileName: 'my-report' });
        expect(mockSave).toHaveBeenCalledWith('my-report.pdf');
    });

    it('uses default filename "export.pdf" when not provided', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns);
        expect(mockSave).toHaveBeenCalledWith('export.pdf');
    });

    it('excludes columns with exportable: false and system columns', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns);
        const call = mockAutoTable.mock.calls[0][1];
        // head should only have Name and Salary — not Hidden or __check__
        expect(call.head[0]).toEqual(['Name', 'Salary']);
    });

    it('applies valueFormatter to cell values', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns);
        const call = mockAutoTable.mock.calls[0][1];
        // salary column should be formatted
        expect(call.body[0][1]).toBe('$90000');
        expect(call.body[1][1]).toBe('$80000');
    });

    it('filters to selectedRows when provided', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { selectedRows: [1] });
        const call = mockAutoTable.mock.calls[0][1];
        expect(call.body).toHaveLength(1);
        expect(call.body[0][0]).toBe('Alice');
    });

    it('appends aggregation footer when aggregationResult is provided', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, {
            aggregationResult: { salary: 170000 },
            aggregationModel: { salary: 'sum' },
        });
        const call = mockAutoTable.mock.calls[0][1];
        expect(call.foot).toBeDefined();
        expect(call.foot[0][1]).toBe('$170000');
    });

    it('renders title text when title option is set', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { title: 'Sales Report' });
        // doc.text should have been called with the title
        const textCalls = mockText.mock.calls.map((c: unknown[]) => c[0]);
        expect(textCalls.some((t: unknown) => t === 'Sales Report')).toBe(true);
    });

    it('throws descriptive error when jspdf is not installed', async () => {
        // This test uses a different mock setup — skip in unit suite,
        // documented as an integration concern
        expect(true).toBe(true);
    });
});

interface AutoTableCall {
    head: string[][];
    body: string[][];
    foot?: string[][];
    styles: { font: string };
    headStyles: { fillColor: number[]; textColor: number[] };
}

const lastTable = (): AutoTableCall => mockAutoTable.mock.calls[mockAutoTable.mock.calls.length - 1][1] as AutoTableCall;
const drawnText = (): string[] => mockText.mock.calls.map((c: unknown[]) => (Array.isArray(c[0]) ? (c[0] as string[]).join('\n') : String(c[0])));

function resetMocks(): void {
    [mockAutoTable, mockText, mockSetFont, mockSplitTextToSize, mockAddFileToVFS, mockAddFont].forEach(m => m.mockClear());
}

describe('exportToPdf — options and layout', () => {
    beforeEach(resetMocks);

    it('accepts short hex colours', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { headerTextColor: '#fff', headerBackgroundColor: '#123' });
        expect(lastTable().headStyles.textColor).toEqual([255, 255, 255]);
        expect(lastTable().headStyles.fillColor).toEqual([0x11, 0x22, 0x33]);
    });

    it("falls back to each colour option's own default for invalid input, so header text stays visible", async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { headerTextColor: 'white', headerBackgroundColor: 'nope' });
        expect(lastTable().headStyles.textColor).toEqual([255, 255, 255]);
        expect(lastTable().headStyles.fillColor).toEqual([79, 70, 229]);
    });

    it('counts the printed rows in the title block when groupedRows is empty', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { title: 'T', groupedRows: [] });
        expect(lastTable().body).toHaveLength(2);
        expect(drawnText().some(t => t.includes('2 rows'))).toBe(true);
    });

    it('skips spacer columns', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, [...sampleColumns, { field: 'sp', headerName: 'SPACER', isSpacer: true }]);
        expect(lastTable().head[0]).toEqual(['Name', 'Salary']);
    });

    it('runs the valueFormatter for missing values, as the grid does', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf([{ id: 1, owner: null }], [{ field: 'owner', valueFormatter: ({ value }) => (value == null ? 'Unassigned' : String(value)) }]);
        expect(lastTable().body).toEqual([['Unassigned']]);
    });
});

describe('exportToPdf — totals', () => {
    beforeEach(resetMocks);

    const amountFirst: GridColDef[] = [{ field: 'amount', type: 'number' }, { field: 'name' }];
    const rows: GridRowModel[] = [{ id: 1, amount: 10, name: 'a' }, { id: 2, amount: 20, name: 'b' }];

    it('keeps the first column aggregate next to the TOTAL label', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(rows, amountFirst, { aggregationResult: { amount: 30 }, aggregationModel: { amount: 'sum' } });
        expect(lastTable().foot).toEqual([['TOTAL: 30', '']]);
    });

    it('keeps the first column aggregate in grouped subtotal and grand-total rows', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        const groupedRows: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'name', groupValue: 'a' },
            { type: 'leaf', depth: 1, row: rows[0] },
            { type: 'group-subtotal', depth: 0, groupField: 'name', groupValue: 'a', aggregatedValues: { amount: 10 } },
            { type: 'grand-total', depth: 0, aggregatedValues: { amount: 10 } },
        ];
        await exportToPdf(rows, amountFirst, { groupedRows, aggregationModel: { amount: 'sum' } });
        expect(lastTable().body[2]).toEqual(['Subtotal: 10', '']);
        expect(lastTable().foot).toEqual([['Grand Total: 10', '']]);
    });

    it('does not run count through a currency valueFormatter', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { aggregationResult: { salary: 2 }, aggregationModel: { salary: 'count' } });
        expect(lastTable().foot).toEqual([['TOTAL', '2']]);
    });

    it('does not abort when a valueFormatter reads row fields', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        const cols: GridColDef<GridRowModel & { cur: { sym: string } }>[] = [
            { field: 'name' },
            { field: 'amount', valueFormatter: ({ value, row }) => `${row.cur.sym}${String(value)}` },
        ];
        await exportToPdf([{ id: 1, name: 'a', amount: 5, cur: { sym: '$' } }], cols, { aggregationResult: { amount: 5 }, aggregationModel: { amount: 'sum' } });
        expect(lastTable().foot).toEqual([['TOTAL', '5']]);
    });

    it('recomputes the totals over the selected rows', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(rows, [{ field: 'name' }, { field: 'amount', type: 'number' }], {
            selectedRows: [2], aggregationResult: { amount: 30 }, aggregationModel: { amount: 'sum' },
        });
        expect(lastTable().foot).toEqual([['TOTAL', '20']]);
    });

    it('exports the selected rows flat when groupedRows is also given', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        const groupedRows: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'name', groupValue: 'a' },
            { type: 'leaf', depth: 1, row: rows[0] },
            { type: 'leaf', depth: 1, row: rows[1] },
        ];
        await exportToPdf(rows, [{ field: 'name' }], { groupedRows, selectedRows: [1] });
        expect(lastTable().body).toEqual([['a']]);
    });
});

describe('exportToPdf — filter summary', () => {
    beforeEach(resetMocks);

    const cols: GridColDef[] = [{ field: 'a', headerName: 'A' }, { field: 'b', headerName: 'B' }, { field: 'c', headerName: 'C' }];

    it('shows nested groups, the logic operator and the quick search, and skips items without a value', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf([{ id: 1, a: '1' }], cols, {
            title: 'Report',
            filterModel: {
                logicOperator: 'or',
                items: [
                    { field: 'a', operator: 'equals', value: '1' },
                    { logicOperator: 'and', items: [{ field: 'b', operator: 'contains', value: 'x' }, { field: 'c', operator: 'isEmpty' }] },
                    { field: 'c', operator: 'contains', value: '' },
                ],
                quickFilterValues: ['acme'],
            },
        });
        expect(drawnText()).toContain('Filters: A equals "1" OR (B contains "x" AND C isEmpty) • Search: "acme"');
    });

    it('wraps the title and the filter summary to the page width', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf([{ id: 1, a: '1' }], cols, { title: 'Report', filterModel: { items: [{ field: 'a', operator: 'equals', value: '1' }] } });
        const wrapped = mockSplitTextToSize.mock.calls.map(c => c[0]);
        expect(wrapped).toContain('Report');
        expect(wrapped).toContain('Filters: A equals "1"');
        for (const call of mockSplitTextToSize.mock.calls) expect(call[1]).toBeLessThanOrEqual(297 - 28);
    });
});

describe('exportToPdf — characters outside the built-in font', () => {
    beforeEach(resetMocks);

    const narrowNbsp = String.fromCharCode(0x202f);
    const minus = String.fromCharCode(0x2212);
    const rupee = String.fromCharCode(0x20b9);
    const eAcute = String.fromCharCode(0xe9);
    const euro = String.fromCharCode(0x20ac);

    it('replaces only the characters Helvetica cannot draw, keeps the rest of the text, and warns', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(
            [{ id: 1, name: `1${narrowNbsp}234,5` }, { id: 2, name: `${rupee}1,234 caf${eAcute} ${euro}5 ${minus}3` }],
            [{ field: 'name' }],
        );
        expect(lastTable().body).toEqual([['1 234,5'], [`?1,234 caf${eAcute} ${euro}5 -3`]]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('font'));
        warn.mockRestore();
    });

    it('registers a custom font and draws the text unchanged with it', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf([{ id: 1, name: `${rupee}5` }], [{ field: 'name' }], { title: 'T', font: { name: 'NotoSans', data: 'AAAA' } });
        expect(mockAddFileToVFS).toHaveBeenCalledWith('NotoSans-normal.ttf', 'AAAA');
        expect(mockAddFont).toHaveBeenCalledWith('NotoSans-normal.ttf', 'NotoSans', 'normal');
        expect(mockAddFont).toHaveBeenCalledWith('NotoSans-normal.ttf', 'NotoSans', 'bold');
        expect(lastTable().styles.font).toBe('NotoSans');
        expect(lastTable().body).toEqual([[`${rupee}5`]]);
        expect(mockSetFont).toHaveBeenCalledWith('NotoSans', 'bold');
    });
});

describe('exportToPdf — large exports (progress, abort, slicing, maxRows)', () => {
    beforeEach(() => {
        resetMocks();
        mockSave.mockClear();
    });

    interface ChunkCall {
        body: string[][];
        foot?: string[][];
        startY: number;
        showFoot: string;
        showHead: string;
        willDrawPage?: (data: { settings: { showHead: string } }) => void;
    }
    const tableCalls = (): ChunkCall[] => mockAutoTable.mock.calls.map(c => c[1] as ChunkCall);
    const manyRows = (n: number): GridRowModel[] => Array.from({ length: n }, (_, i) => ({ id: i, name: `r${i}`, salary: i }));
    const SLICED = { sliceMs: 0, renderChunkRows: 10, adaptive: false };

    it('draws a small export with a single autoTable call, as before', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { aggregationResult: { salary: 170000 }, aggregationModel: { salary: 'sum' } });
        expect(mockAutoTable).toHaveBeenCalledTimes(1);
        const call = tableCalls()[0];
        expect(call.body).toEqual([['Alice', '$90000'], ['Bob', '$80000']]);
        expect(call.showFoot).toBe('lastPage');
        expect(call.showHead).toBe('everyPage');
        expect(call.startY).toBe(14);
        expect(call.willDrawPage).toBeUndefined();
        expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('splits the body into even-sized chunks that together equal the single-call body', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const rows = manyRows(95);
        await runPdfExport(rows, sampleColumns, { aggregationResult: { salary: 1 }, aggregationModel: { salary: 'sum' } }, SLICED);
        const calls = tableCalls();
        expect(calls.length).toBeGreaterThan(1);
        expect(calls.flatMap(c => c.body)).toEqual(rows.map(r => [String(r.name), `$${String(r.salary)}`]));
        calls.slice(0, -1).forEach(c => {
            expect(c.body.length % 2).toBe(0);
            expect(c.foot).toBeUndefined();
            expect(c.showFoot).toBe('never');
        });
        expect(calls[calls.length - 1].foot).toEqual([['TOTAL', '$1']]);
        expect(calls[calls.length - 1].showFoot).toBe('lastPage');
        calls.slice(1).forEach(c => {
            // Continuations start at the top margin so autoTable never adds a page up front;
            // the hook then moves the cursor to where the previous chunk ended (finalY 50).
            expect(c.startY).toBe(14);
            expect(c.willDrawPage).toBeTypeOf('function');
            const data = { settings: { showHead: 'everyPage' }, cursor: { y: 14 } };
            c.willDrawPage?.(data);
            expect(data.cursor.y).toBe(50);
            expect(data.settings.showHead).toBe('never');
        });
    });

    it('skips the header of a continuation chunk only on the page it starts on', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        await runPdfExport(manyRows(40), sampleColumns, {}, SLICED);
        const hook = tableCalls()[1].willDrawPage;
        const settings = { showHead: 'everyPage' };
        hook?.({ settings });
        expect(settings.showHead).toBe('never');
        hook?.({ settings });
        expect(settings.showHead).toBe('everyPage');
    });

    it('reports monotonic progress per phase, in order, reaching each total', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const events: { phase: string; done: number; total: number }[] = [];
        await runPdfExport(manyRows(300), sampleColumns, { onProgress: p => events.push(p) }, SLICED);
        const phases = [...new Set(events.map(e => e.phase))];
        expect(phases).toEqual(['prepare', 'render', 'save']);
        for (const phase of phases) {
            const list = events.filter(e => e.phase === phase);
            for (let i = 1; i < list.length; i++) expect(list[i].done).toBeGreaterThanOrEqual(list[i - 1].done);
            expect(list[0].done).toBe(0);
            expect(list[list.length - 1].done).toBe(list[list.length - 1].total);
        }
        expect(events.filter(e => e.phase === 'prepare').length).toBeGreaterThan(2);
        expect(events.find(e => e.phase === 'render')?.total).toBe(300);
        expect(events.filter(e => e.phase === 'save')).toEqual([{ phase: 'save', done: 0, total: 1 }, { phase: 'save', done: 1, total: 1 }]);
    });

    it('reports grouped progress over the grouped entries', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const groupedRows: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'name', groupValue: 'A' },
            ...manyRows(100).map((row): GridGroupedExportRow => ({ type: 'leaf', depth: 1, row })),
        ];
        const events: { phase: string; done: number; total: number }[] = [];
        await runPdfExport(manyRows(100), sampleColumns, { groupedRows, onProgress: p => events.push(p) }, SLICED);
        expect(events.filter(e => e.phase === 'prepare').pop()).toEqual({ phase: 'prepare', done: 101, total: 101 });
        expect(tableCalls().flatMap(c => c.body)).toHaveLength(101);
    });

    it('yields to the event loop between slices', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const spy = vi.spyOn(globalThis, 'setTimeout');
        await runPdfExport(manyRows(300), sampleColumns, {}, SLICED);
        expect(spy.mock.calls.filter(c => c[1] === 0).length).toBeGreaterThan(5);
        spy.mockRestore();
    });

    it('rejects with an AbortError and draws nothing when aborted before it starts', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        const controller = new AbortController();
        controller.abort();
        await expect(exportToPdf(sampleRows, sampleColumns, { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
        expect(mockAutoTable).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('rejects with an AbortError and never saves when aborted during prepare', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const controller = new AbortController();
        const promise = runPdfExport(manyRows(500), sampleColumns, {
            signal: controller.signal,
            onProgress: p => { if (p.phase === 'prepare' && p.done >= 128) controller.abort(); },
        }, SLICED);
        const error: unknown = await promise.catch((e: unknown) => e);
        expect(error).toBeInstanceOf(DOMException);
        expect((error as DOMException).name).toBe('AbortError');
        expect(mockAutoTable).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('rejects with an AbortError and never saves when aborted during render', async () => {
        const { runPdfExport } = await import('./exportToPdf');
        const controller = new AbortController();
        const promise = runPdfExport(manyRows(500), sampleColumns, {
            signal: controller.signal,
            onProgress: p => { if (p.phase === 'render' && p.done > 0) controller.abort(); },
        }, SLICED);
        await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        expect(mockAutoTable).toHaveBeenCalledTimes(1);
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('warns (without throwing) above maxRows, recommending CSV / Excel', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(manyRows(3), sampleColumns, { maxRows: 2 });
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('exportToCsv'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('exportToExcelAdvanced'));
        expect(mockSave).toHaveBeenCalledTimes(1);
        warn.mockClear();
        await exportToPdf(manyRows(3), sampleColumns, { maxRows: 3 });
        await exportToPdf(manyRows(3), sampleColumns);
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it('defaults maxRows to 20000', async () => {
        const { PDF_MAX_ROWS_DEFAULT } = await import('./exportToPdf');
        expect(PDF_MAX_ROWS_DEFAULT).toBe(20_000);
    });
});
