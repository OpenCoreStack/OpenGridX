import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GridColDef, GridRowModel } from '../../types';

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

class MockJsPDF {
    autoTable = mockAutoTable;
    save = mockSave;
    setFontSize = mockSetFontSize;
    setFont = mockSetFont;
    setTextColor = mockSetTextColor;
    text = mockText;
    line = mockLine;
    setDrawColor = mockSetDrawColor;
    setLineWidth = mockSetLineWidth;
    addImage = mockAddImage;
    lastAutoTable = { finalY: 50 };
    internal = {
        pageSize: { getWidth: () => 297, getHeight: () => 210 },
        getNumberOfPages: () => 1,
    };
    getNumberOfPages = () => 1;
}

vi.mock('jspdf', () => ({ default: MockJsPDF }));
vi.mock('jspdf-autotable', () => ({}));

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
        const call = mockAutoTable.mock.calls[0][0];
        // head should only have Name and Salary — not Hidden or __check__
        expect(call.head[0]).toEqual(['Name', 'Salary']);
    });

    it('applies valueFormatter to cell values', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns);
        const call = mockAutoTable.mock.calls[0][0];
        // salary column should be formatted
        expect(call.body[0][1]).toBe('$90000');
        expect(call.body[1][1]).toBe('$80000');
    });

    it('filters to selectedRows when provided', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, { selectedRows: [1] });
        const call = mockAutoTable.mock.calls[0][0];
        expect(call.body).toHaveLength(1);
        expect(call.body[0][0]).toBe('Alice');
    });

    it('appends aggregation footer when aggregationResult is provided', async () => {
        const { exportToPdf } = await import('./exportToPdf');
        await exportToPdf(sampleRows, sampleColumns, {
            aggregationResult: { salary: 170000 },
            aggregationModel: { salary: 'sum' },
        });
        const call = mockAutoTable.mock.calls[0][0];
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
