import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ExcelJS from 'exceljs';
import { exportToExcelAdvanced } from './exportToExcelAdvanced';
import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

type Row = GridRowModel & { id: number; dept: string; salary: number };

const columns: GridColDef<Row>[] = [
    { field: 'dept', headerName: 'Department' },
    { field: 'salary', headerName: 'Salary', type: 'number' },
];

const flatRows: Row[] = [
    { id: 1, dept: 'Engineering', salary: 90000 },
    { id: 2, dept: 'Engineering', salary: 85000 },
    { id: 3, dept: 'Marketing', salary: 70000 },
];

const groupedRows: GridGroupedExportRow[] = [
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Engineering' },
    { type: 'leaf', depth: 1, row: flatRows[0] },
    { type: 'leaf', depth: 1, row: flatRows[1] },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Engineering', aggregatedValues: { salary: 175000 } },
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Marketing' },
    { type: 'leaf', depth: 1, row: flatRows[2] },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Marketing', aggregatedValues: { salary: 70000 } },
    { type: 'grand-total', depth: 0, aggregatedValues: { salary: 245000 } },
];

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
});

async function readSheet(): Promise<ExcelJS.Worksheet> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await capturedBlob!.arrayBuffer());
    return wb.worksheets[0];
}

const rowValues = (ws: ExcelJS.Worksheet) =>
    ws.getSheetValues().slice(1).map(r => (Array.isArray(r) ? r.slice(1) : []));

describe('exportToExcelAdvanced — flat', () => {
    it('writes a header row and one row per record when groupedRows is absent', async () => {
        await exportToExcelAdvanced(flatRows, columns);
        const ws = await readSheet();
        expect(rowValues(ws)).toEqual([
            ['Department', 'Salary'],
            ['Engineering', 90000],
            ['Engineering', 85000],
            ['Marketing', 70000],
        ]);
    });
});

describe('exportToExcelAdvanced — grouped', () => {
    it('writes group headers, leaves, subtotals and a single grand total in order', async () => {
        await exportToExcelAdvanced(flatRows, columns, {
            groupedRows,
            aggregationModel: { salary: 'sum' },
            aggregationResult: { salary: 245000 },
            sheets: [{ name: 'Data', includeSummary: true }],
        });
        const ws = await readSheet();
        expect(rowValues(ws)).toEqual([
            ['Department', 'Salary'],
            ['Department: Engineering'],
            ['Engineering', 90000],
            ['Engineering', 85000],
            ['Subtotal', 175000],
            ['Department: Marketing'],
            ['Marketing', 70000],
            ['Subtotal', 70000],
            ['Grand Total', 245000],
        ]);
    });

    it('outlines leaf rows one level below their group header', async () => {
        await exportToExcelAdvanced(flatRows, columns, { groupedRows });
        const ws = await readSheet();
        expect(ws.getRow(2).outlineLevel ?? 0).toBe(0);
        expect(ws.getRow(3).outlineLevel).toBe(1);
        expect(ws.getRow(4).outlineLevel).toBe(1);
    });

    it('uses groupingValueFormatter for group-header labels', async () => {
        const cols: GridColDef<Row>[] = [
            { ...columns[0], groupingValueFormatter: ({ value }) => `Dept ${String(value)}` },
            columns[1],
        ];
        await exportToExcelAdvanced(flatRows, cols, { groupedRows });
        const ws = await readSheet();
        expect(ws.getRow(2).getCell(1).value).toBe('Dept Engineering');
    });
});
