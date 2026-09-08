import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exportToCsv, exportToJson } from './index';
import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

// --- shared fixtures ---

type Row = GridRowModel & { id: number; dept: string; salary: number };

const columns: GridColDef<Row>[] = [
    { field: 'dept', headerName: 'Department' },
    { field: 'salary', headerName: 'Salary', type: 'number' },
];

const flatRows: Row[] = [
    { id: 1, dept: 'Engineering', salary: 90000 },
    { id: 2, dept: 'Engineering', salary: 85000 },
    { id: 3, dept: 'Marketing',   salary: 70000 },
];

const groupedRows: GridGroupedExportRow[] = [
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Engineering' },
    { type: 'leaf', depth: 1, row: { id: 1, dept: 'Engineering', salary: 90000 } },
    { type: 'leaf', depth: 1, row: { id: 2, dept: 'Engineering', salary: 85000 } },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Engineering', aggregatedValues: { salary: 175000 } },
    { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'Marketing' },
    { type: 'leaf', depth: 1, row: { id: 3, dept: 'Marketing', salary: 70000 } },
    { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'Marketing', aggregatedValues: { salary: 70000 } },
    { type: 'grand-total', depth: 0, aggregatedValues: { salary: 245000 } },
];

// --- intercept URL.createObjectURL so we can read Blob content ---

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

// --- CSV tests ---

describe('exportToCsv — flat (no groupedRows)', () => {
    it('produces a header row followed by one row per data record', async () => {
        exportToCsv(flatRows, columns, { fileName: 'test.csv' });
        const text = await capturedBlob!.text();
        const lines = text.split('\n').filter(Boolean);
        expect(lines[0]).toBe('Department,Salary');
        expect(lines.length).toBe(4); // header + 3 data rows
    });

    it('does not emit group-header markers or Subtotal labels', async () => {
        exportToCsv(flatRows, columns, { fileName: 'flat.csv' });
        const text = await capturedBlob!.text();
        expect(text).not.toContain('dept:');
        expect(text).not.toContain('Subtotal');
        expect(text).not.toContain('Grand Total');
    });
});

describe('exportToCsv — grouped', () => {
    it('emits group-header rows, leaf rows, subtotals, and grand total', async () => {
        exportToCsv(flatRows, columns, {
            fileName: 'grouped.csv',
            groupedRows,
            aggregationModel: { salary: 'sum' },
        });
        const text = await capturedBlob!.text();
        const lines = text.split('\n').filter(Boolean);

        // Header
        expect(lines[0]).toBe('Department,Salary');
        // Group header for Engineering (depth 0 → no leading spaces, just "dept: Engineering")
        expect(lines[1]).toContain('dept: Engineering');
        // Leaf rows: salary values present
        expect(lines[2]).toContain('90000');
        expect(lines[3]).toContain('85000');
        // Subtotal row for Engineering (formatAggregationValue adds commas: "175,000")
        expect(lines[4]).toContain('Subtotal');
        expect(lines[4]).toContain('175');
        // Grand total
        const last = lines[lines.length - 1];
        expect(last).toContain('Grand Total');
        expect(last).toContain('245');
    });

    it('total line count matches structure (1 header + 2 group-headers + 3 leaves + 2 subtotals + 1 grand-total)', async () => {
        exportToCsv(flatRows, columns, { groupedRows, aggregationModel: { salary: 'sum' } });
        const text = await capturedBlob!.text();
        const lines = text.split('\n').filter(Boolean);
        expect(lines.length).toBe(9);
    });
});

// --- JSON tests ---

describe('exportToJson — flat (no groupedRows)', () => {
    it('emits a plain array with one entry per row', async () => {
        exportToJson(flatRows, columns, {});
        const text = await capturedBlob!.text();
        const parsed = JSON.parse(text) as unknown[];
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(3);
    });
});

describe('exportToJson — grouped', () => {
    it('emits { groups, grandTotal } with two top-level groups', async () => {
        exportToJson(flatRows, columns, {
            groupedRows,
            aggregationModel: { salary: 'sum' },
        });
        const text = await capturedBlob!.text();
        const parsed = JSON.parse(text) as {
            groups: { group: string; rows: unknown[]; subtotals?: Record<string, unknown> }[];
            grandTotal?: Record<string, unknown>;
        };
        expect(parsed.groups).toHaveLength(2);
        expect(parsed.groups[0].group).toBe('dept: Engineering');
        expect(parsed.groups[0].rows).toHaveLength(2);
        expect(parsed.groups[0].subtotals?.salary).toBe(175000);
        expect(parsed.groups[1].group).toBe('dept: Marketing');
        expect(parsed.groups[1].rows).toHaveLength(1);
        expect(parsed.grandTotal?.salary).toBe(245000);
    });

    it('falls through to flat array when groupedRows is absent', async () => {
        exportToJson(flatRows, columns, {});
        const text = await capturedBlob!.text();
        const parsed = JSON.parse(text) as unknown[];
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(3);
    });
});
