import type {
    GridColDef,
    GridRowModel,
    GridFilterModel,
    PdfExportOptions,
} from '../../types';
import { formatAggregationValue } from '../../hooks/features/useAggregation';

interface JsPDFDoc {
    save: (filename: string) => void;
    setFontSize: (size: number) => void;
    setFont: (name: string, style: string) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    text: (text: string, x: number, y: number, opts?: { align?: string }) => void;
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

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [79, 70, 229];
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ];
}

function getExportColumns<R extends GridRowModel>(columns: GridColDef<R>[]): GridColDef<R>[] {
    return columns.filter(col => {
        if (col.exportable === false) return false;
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });
}

function resolveValue<R extends GridRowModel>(row: R, col: GridColDef<R>): string {
    let value: unknown = (row as GridRowModel)[col.field];
    if (col.valueGetter) {
        value = col.valueGetter({ row, field: col.field, value });
    }
    if (col.valueFormatter && value !== undefined && value !== null) {
        value = col.valueFormatter({ value, row, field: col.field });
    }
    return String(value ?? '');
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

function formatFilterSummary<R extends GridRowModel>(
    filterModel: GridFilterModel,
    columns: GridColDef<R>[]
): string {
    if (!filterModel.items || filterModel.items.length === 0) return '';
    return filterModel.items
        .flatMap(item => {
            // Only handle leaf GridFilterItem — skip GridFilterGroup (which has 'items')
            if ('items' in item) return [];
            const col = columns.find(c => c.field === item.field);
            const label = col?.headerName ?? item.field;
            const val = item.value !== undefined && item.value !== null ? String(item.value) : '';
            return [`${label} ${item.operator} "${val}"`];
        })
        .join(' • ');
}

export async function exportToPdf<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: PdfExportOptions = {}
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
        aggregationResult,
        aggregationModel,
        filterModel,
        alternateRowColor = true,
        headerBackgroundColor = '#4f46e5',
        headerTextColor = '#ffffff',
        fontSize = 9,
    } = options;

    const doc = new JsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 14;
    const usableWidth = pageWidth - MARGIN * 2;

    const exportColumns = getExportColumns(columns);
    const rowsToExport = selectedRows && selectedRows.length > 0
        ? rows.filter(r => selectedRows.includes(r.id as string | number))
        : rows;

    // --- Header block ---
    let startY = MARGIN;

    if (title) {
        let cursorX = MARGIN;
        let cursorY = MARGIN + 8;

        // Logo
        if (logoUrl) {
            try {
                doc.addImage(logoUrl, 'PNG', cursorX, MARGIN, 10, 10);
                cursorX += 14;
            } catch {
                // logo failed to load — skip silently
            }
        }

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59); // #1e293b
        doc.text(title, cursorX, cursorY);
        cursorY += 6;

        // Subtitle: date + row count
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139); // #64748b
        const exportedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        doc.text(
            `Exported: ${exportedAt}  •  ${rowsToExport.length} row${rowsToExport.length !== 1 ? 's' : ''}`,
            cursorX,
            cursorY
        );
        cursorY += 5;

        // Filter summary
        if (filterModel) {
            const summary = formatFilterSummary(filterModel, columns);
            if (summary) {
                doc.text(`Filters: ${summary}`, cursorX, cursorY);
                cursorY += 5;
            }
        }

        // Separator line
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.3);
        doc.line(MARGIN, cursorY + 2, pageWidth - MARGIN, cursorY + 2);
        startY = cursorY + 6;
    }

    // --- Build table data ---
    const head = [exportColumns.map(col => col.headerName ?? col.field)];

    const body = rowsToExport.map(row =>
        exportColumns.map(col => resolveValue(row, col))
    );

    // --- Aggregation footer ---
    let foot: string[][] | undefined;
    if (aggregationResult && aggregationModel) {
        const footRow = exportColumns.map((col, i) => {
            if (i === 0) {
                // First column shows TOTAL label if any aggregation exists
                const hasAgg = exportColumns.some(c => aggregationModel[c.field]);
                return hasAgg ? 'TOTAL' : '';
            }
            const aggVal = aggregationResult[col.field];
            if (aggVal === undefined || aggVal === null) return '';
            let formatted: unknown = aggVal;
            if (col.valueFormatter) {
                formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
            } else if (aggregationModel[col.field]) {
                formatted = formatAggregationValue(aggVal, aggregationModel[col.field] as string);
            }
            return String(formatted);
        });
        foot = [footRow];
    }

    // --- Column widths ---
    const columnStyles = computeColumnStyles(exportColumns, usableWidth);

    const [hr, hg, hb] = hexToRgb(headerBackgroundColor);
    const [tr, tg, tb] = hexToRgb(headerTextColor);

    autoTable(doc, {
        head,
        body,
        ...(foot ? { foot } : {}),
        startY,
        styles: { fontSize, cellPadding: 3, font: 'helvetica', overflow: 'linebreak' },
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
