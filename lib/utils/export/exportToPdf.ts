import type {
    GridColDef,
    GridRowModel,
    GridValidRowModel,
    GridFilterModel,
    GridFilterGroup,
    GridFilterItem,
    PdfExportOptions,
    GridGroupedExportRow,
} from '../../types';
import { groupHeaderLabel } from './groupLabel';
import {
    aggregationForExport,
    formatExportAggregate,
    formatExportValue,
    getExportColumns,
    getRawExportValue,
    hasSelection,
    rowsForExport,
    shouldExportGrouped,
    summaryLabelText,
} from './exportShared';
import { toWinAnsi } from './pdfText';

interface JsPDFDoc {
    save: (filename: string) => void;
    setFontSize: (size: number) => void;
    setFont: (name: string, style: string) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    text: (text: string | string[], x: number, y: number, opts?: { align?: string }) => void;
    splitTextToSize: (text: string, maxWidth: number) => string[];
    addFileToVFS: (fileName: string, data: string) => void;
    addFont: (fileName: string, fontName: string, fontStyle: string) => void;
    addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    setDrawColor: (r: number, g: number, b: number) => void;
    setLineWidth: (w: number) => void;
    setPage: (page: number) => void;
    lastAutoTable: { finalY: number };
    internal: {
        pageSize: { getWidth: () => number; getHeight: () => number };
        getNumberOfPages: () => number;
    };
    getNumberOfPages: () => number;
}

interface AutoTableOptions {
    head: string[][];
    body: string[][];
    foot?: string[][];
    startY?: number;
    styles?: Record<string, unknown>;
    headStyles?: Record<string, unknown>;
    alternateRowStyles?: Record<string, unknown>;
    footStyles?: Record<string, unknown>;
    columnStyles?: Record<number, { cellWidth: number }>;
    showFoot?: string;
    showHead?: string;
    margin?: { top: number; left: number; right: number; bottom: number };
}

type Rgb = [number, number, number];

const DEFAULT_HEADER_BACKGROUND: Rgb = [79, 70, 229];
const DEFAULT_HEADER_TEXT: Rgb = [255, 255, 255];

/** '#rrggbb' or '#rgb' as RGB; invalid input gives `fallback` (the option's own default). */
function hexToRgb(hex: string, fallback: Rgb): Rgb {
    const clean = hex.trim().replace(/^#/, '');
    const full = /^[a-f\d]{3}$/i.test(clean) ? clean.split('').map(c => c + c).join('') : clean;
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
    if (!result) return fallback;
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function resolveValue<R extends GridRowModel>(row: R, col: GridColDef<R>): string {
    return formatExportValue(row, col, getRawExportValue(row, col));
}

function colWeight<R extends GridRowModel>(col: GridColDef<R>): number {
    const w = typeof col.width === 'number' ? col.width : undefined;
    return w ?? (col.flex ?? 1) * 100;
}

function computeColumnStyles<R extends GridRowModel>(
    columns: GridColDef<R>[],
    usableWidth: number
): Record<number, { cellWidth: number }> {
    const totalWeight = columns.reduce((sum, col) => sum + colWeight(col), 0);
    const styles: Record<number, { cellWidth: number }> = {};
    columns.forEach((col, i) => {
        styles[i] = { cellWidth: (colWeight(col) / totalWeight) * usableWidth };
    });
    return styles;
}

const NO_VALUE_OPERATORS = new Set(['isEmpty', 'isNotEmpty']);

function describeFilterItem<R extends GridRowModel>(item: GridFilterItem, columns: GridColDef<R>[]): string | null {
    const col = columns.find(c => c.field === item.field);
    const label = col?.headerName ?? item.field;
    if (NO_VALUE_OPERATORS.has(item.operator)) return `${label} ${item.operator}`;
    const { value } = item;
    // An item without a value is an unfinished rule in the filter panel, not a real condition.
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
    const text = Array.isArray(value) ? value.map(String).join(', ') : String(value);
    return `${label} ${item.operator} "${text}"`;
}

function describeFilterItems<R extends GridRowModel>(
    items: (GridFilterItem | GridFilterGroup)[],
    logicOperator: 'and' | 'or',
    columns: GridColDef<R>[],
    nested: boolean,
): string {
    const parts = items
        .map(item => ('items' in item
            ? describeFilterItems(item.items, item.logicOperator, columns, true)
            : describeFilterItem(item, columns)))
        .filter((part): part is string => !!part);
    if (parts.length === 0) return '';
    const joined = parts.join(logicOperator === 'or' ? ' OR ' : ' AND ');
    return nested && parts.length > 1 ? `(${joined})` : joined;
}

/**
 * The applied filter as text: nested groups in parentheses, joined with their logic operator,
 * plus the quick-search terms.
 */
function formatFilterSummary<R extends GridRowModel>(
    filterModel: GridFilterModel,
    columns: GridColDef<R>[]
): string {
    const parts: string[] = [];
    const items = describeFilterItems(filterModel.items ?? [], filterModel.logicOperator ?? 'and', columns, false);
    if (items) parts.push(items);
    const search = (filterModel.quickFilterValues ?? []).filter(v => v.trim() !== '');
    if (search.length > 0) parts.push(`Search: ${search.map(v => `"${v}"`).join(' ')}`);
    return parts.join(' • ');
}

/** jsPDF's default line height factor, in mm per point of font size. */
const LINE_HEIGHT_MM_PER_PT = 1.15 * 0.3528;

export function exportToPdf<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], options?: PdfExportOptions<R>): Promise<void>;
export function exportToPdf<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], options?: PdfExportOptions<R>): Promise<void>;
export async function exportToPdf<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: PdfExportOptions<R> = {}
): Promise<void> {
    // Lazy-load peer deps — provides a clear error if not installed
    let JsPDF: new (opts: Record<string, unknown>) => JsPDFDoc;
    let autoTable: (doc: JsPDFDoc, opts: AutoTableOptions) => void;
    try {
        const [jspdfMod, autoTableMod] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
        ]);
        JsPDF = jspdfMod.default as unknown as new (opts: Record<string, unknown>) => JsPDFDoc;
        autoTable = autoTableMod.default as unknown as (doc: JsPDFDoc, opts: AutoTableOptions) => void;
    } catch {
        throw new Error(
            "exportToPdf requires 'jspdf' and 'jspdf-autotable'. Run: npm install jspdf jspdf-autotable"
        );
    }

    const {
        fileName = 'export',
        title,
        logoUrl,
        orientation = 'landscape',
        selectedRows,
        getRowId,
        aggregationResult,
        aggregationModel,
        filterModel,
        alternateRowColor = true,
        headerBackgroundColor = '#4f46e5',
        headerTextColor = '#ffffff',
        fontSize = 9,
        groupedRows,
        font,
    } = options;

    const doc = new JsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 14;
    const usableWidth = pageWidth - MARGIN * 2;

    // --- Font ---
    let fontName = 'helvetica';
    if (font) {
        doc.addFileToVFS(`${font.name}-normal.ttf`, font.data);
        doc.addFont(`${font.name}-normal.ttf`, font.name, 'normal');
        if (font.boldData) doc.addFileToVFS(`${font.name}-bold.ttf`, font.boldData);
        doc.addFont(font.boldData ? `${font.name}-bold.ttf` : `${font.name}-normal.ttf`, font.name, 'bold');
        fontName = font.name;
    }

    // Helvetica cannot draw text outside WinAnsi; keep what it can and replace the rest.
    let replacedCharacters = false;
    const pdfText = (text: string): string => {
        if (font) return text;
        const converted = toWinAnsi(text);
        if (converted.lossy) replacedCharacters = true;
        return converted.text;
    };
    const drawWrapped = (text: string, x: number, y: number, maxWidth: number, sizePt: number): number => {
        const lines = doc.splitTextToSize(pdfText(text), maxWidth);
        doc.text(lines.length === 1 ? lines[0] : lines, x, y);
        return Math.max(0, lines.length - 1) * sizePt * LINE_HEIGHT_MM_PER_PT;
    };

    const exportColumns = getExportColumns(columns);
    const useGrouped = shouldExportGrouped(groupedRows, selectedRows);
    const rowsToExport = rowsForExport(rows, selectedRows, getRowId);

    // --- Header block ---
    let startY = MARGIN;

    if (title) {
        let cursorX = MARGIN;
        let cursorY = MARGIN + 8;

        if (logoUrl) {
            try {
                doc.addImage(logoUrl, 'PNG', cursorX, MARGIN, 10, 10);
                cursorX += 14;
            } catch {
                // logo failed to load — skip silently
            }
        }
        const textWidth = pageWidth - MARGIN - cursorX;

        doc.setFontSize(16);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(30, 41, 59);
        cursorY += drawWrapped(title, cursorX, cursorY, textWidth, 16);
        cursorY += 6;

        doc.setFontSize(8);
        doc.setFont(fontName, 'normal');
        doc.setTextColor(100, 116, 139);
        const exportedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const rowCount = useGrouped
            ? groupedRows.filter(e => e.type === 'leaf').length
            : rowsToExport.length;
        doc.text(
            pdfText(`Exported: ${exportedAt}  •  ${rowCount} row${rowCount !== 1 ? 's' : ''}`),
            cursorX,
            cursorY
        );
        cursorY += 5;

        if (filterModel) {
            const summary = formatFilterSummary(filterModel, columns);
            if (summary) {
                cursorY += drawWrapped(`Filters: ${summary}`, cursorX, cursorY, textWidth, 8);
                cursorY += 5;
            }
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, cursorY + 2, pageWidth - MARGIN, cursorY + 2);
        startY = cursorY + 6;
    }

    // --- Build table data ---
    const head = [exportColumns.map(col => pdfText(col.headerName ?? col.field))];
    const aggMod = aggregationModel || {};
    const aggregateTexts = (values: Record<string, unknown>): string[] =>
        exportColumns.map(col => formatExportAggregate(col, aggMod[col.field], values[col.field], values));

    let body: string[][];
    let foot: string[][] | undefined;

    if (useGrouped) {
        // Grouped export: flatten the ordered list into body rows with indentation
        body = [];
        groupedRows.forEach((entry: GridGroupedExportRow) => {
            const indent = '  '.repeat(entry.depth * 2);
            if (entry.type === 'group-header') {
                const label = `${indent}${groupHeaderLabel(entry, columns)}`;
                body.push(exportColumns.map((_, i) => i === 0 ? label : ''));
            } else if (entry.type === 'leaf' && entry.row) {
                const row = entry.row as R;
                body.push(exportColumns.map((col, i) => (i === 0 ? indent : '') + resolveValue(row, col)));
            } else if (entry.type === 'group-subtotal' && entry.aggregatedValues) {
                const texts = aggregateTexts(entry.aggregatedValues);
                body.push(texts.map((text, i) => (i === 0 ? `${indent}${summaryLabelText('Subtotal', text)}` : text)));
            } else if (entry.type === 'grand-total' && entry.aggregatedValues) {
                const texts = aggregateTexts(entry.aggregatedValues);
                foot = [texts.map((text, i) => (i === 0 ? summaryLabelText('Grand Total', text) : text))];
            }
        });
    } else {
        body = rowsToExport.map(row => exportColumns.map(col => resolveValue(row, col)));

        const totals = aggregationModel
            ? aggregationForExport(rowsToExport, hasSelection(selectedRows), columns, aggregationResult, aggregationModel)
            : null;
        if (totals && aggregationModel) {
            const hasAgg = exportColumns.some(c => aggregationModel[c.field]);
            const texts = aggregateTexts(totals);
            foot = [texts.map((text, i) => (i === 0 && hasAgg ? summaryLabelText('TOTAL', text) : text))];
        }
    }

    body = body.map(cells => cells.map(pdfText));
    if (foot) foot = foot.map(cells => cells.map(pdfText));

    if (replacedCharacters) {
        console.warn(
            '[exportToPdf] Some characters cannot be drawn with the built-in Helvetica font and were replaced with "?". ' +
            'Pass the `font` option (a Unicode .ttf, e.g. Noto Sans) to draw them.'
        );
    }

    // --- Column widths ---
    const columnStyles = computeColumnStyles(exportColumns, usableWidth);

    const [hr, hg, hb] = hexToRgb(headerBackgroundColor, DEFAULT_HEADER_BACKGROUND);
    const [tr, tg, tb] = hexToRgb(headerTextColor, DEFAULT_HEADER_TEXT);

    autoTable(doc, {
        head,
        body,
        ...(foot ? { foot } : {}),
        startY,
        styles: { fontSize, cellPadding: 3, font: fontName, overflow: 'linebreak' },
        headStyles: {
            fillColor: [hr, hg, hb],
            textColor: [tr, tg, tb],
            fontStyle: 'bold',
        },
        ...(alternateRowColor
            ? { alternateRowStyles: { fillColor: [248, 250, 252] } }
            : {}),
        ...(foot
            ? { footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [0, 0, 0] } }
            : {}),
        columnStyles,
        showFoot: foot ? 'lastPage' : 'never',
        showHead: 'everyPage',
        margin: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: MARGIN + 6 },
    });

    // Two-pass page numbering — stamp all pages after the table is fully rendered
    // so each stamp reads the correct final total (not the running count during draw)
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth - MARGIN,
            pageHeight - 8,
            { align: 'right' }
        );
    }

    doc.save(`${fileName}.pdf`);
}
