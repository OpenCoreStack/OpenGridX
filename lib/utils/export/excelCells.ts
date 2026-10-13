// Cell values, number formats, widths, images and borders of the .xlsx export (exportToExcelAdvanced).

import type { GridColDef, GridRowModel } from '../../types';
import { formatExportValue, getRawExportValue } from './exportShared';
import type { ExcelColumnStyle } from './exportToExcelAdvanced';

/** The only values handed to ExcelJS. Objects are never passed through, because ExcelJS reads
 * `{ formula }`, `{ hyperlink }`, `{ richText }` and `{ error }` objects as live cell content. */
type ExcelCellValue = string | number | boolean | Date | null;

/** A subtotal / total cell value, with the number format it needs when it differs from the column's. */
export interface AggregateCell {
    value: ExcelCellValue;
    numFmt?: string;
}

type CellKind = 'number' | 'boolean' | 'date' | 'string';

function cellKind(colDef: GridColDef<GridRowModel>, value: unknown): CellKind {
    if (colDef.type === 'number') return 'number';
    if (colDef.type === 'boolean') return 'boolean';
    if (colDef.type === 'date') return 'date';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    return 'string';
}

/**
 * Excel date serials carry no timezone and are read as wall-clock time, while ExcelJS converts a
 * Date from its UTC instant. Re-anchor the local wall-clock fields at UTC so the cell shows the
 * date and time the grid shows. Invalid dates become null.
 */
export function toExcelDate(date: Date): Date | null {
    if (Number.isNaN(date.getTime())) return null;
    return new Date(Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(),
    ));
}

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/i;
const NUMERIC_STRING = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

/** A date-column value as a Date: null when missing or invalid, undefined when not a date at all. */
function dateCellValue(value: unknown): Date | null | undefined {
    if (value instanceof Date) return toExcelDate(value);
    if (typeof value === 'number') return Number.isFinite(value) ? toExcelDate(new Date(value)) : null;
    if (typeof value !== 'string') return undefined;
    const text = value.trim();
    const dateOnly = ISO_DATE_ONLY.exec(text);
    if (dateOnly) {
        // A calendar date: already wall-clock, so build it at UTC directly.
        const [year, month, day] = [Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3])];
        const date = new Date(Date.UTC(year, month - 1, day));
        return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined;
    }
    if (ISO_DATE_TIME.test(text)) {
        const date = new Date(text.replace(' ', 'T'));
        return Number.isNaN(date.getTime()) ? undefined : toExcelDate(date);
    }
    return undefined;
}

/**
 * A native value for a number / boolean / date cell: null for an empty cell (missing, NaN,
 * Infinity, Invalid Date), undefined when the value is not of that kind (e.g. 'n/a' in a
 * number column).
 */
function typedCellValue(kind: Exclude<CellKind, 'string'>, value: unknown): number | boolean | Date | null | undefined {
    if (value == null || value === '') return null;
    if (kind === 'number') {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'bigint') {
            const n = Number(value);
            return Number.isSafeInteger(n) ? n : undefined;
        }
        if (typeof value === 'string' && NUMERIC_STRING.test(value.trim())) {
            const n = Number(value.trim());
            return Number.isFinite(n) ? n : undefined;
        }
        return undefined;
    }
    if (kind === 'boolean') {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const text = value.trim().toLowerCase();
            if (text === 'true') return true;
            if (text === 'false') return false;
        }
        return undefined;
    }
    return dateCellValue(value);
}

/** Any value as inert cell content: primitives and Dates as themselves, objects as JSON text. */
function inertCellValue(value: unknown): ExcelCellValue {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value instanceof Date) return toExcelDate(value);
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value) ?? String(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

/**
 * The value of a data cell. Number, boolean and date cells are native (their `valueFormatter` is
 * not used, so Excel's number format applies); a value that is missing or not of the column's
 * kind falls back to the text the grid shows. Other cells get the `valueFormatter` text.
 */
export function dataCellValue(row: GridRowModel, col: GridColDef<GridRowModel>): ExcelCellValue {
    const raw = getRawExportValue(row, col);
    const kind = cellKind(col, raw);
    if (kind !== 'string') {
        const typed = typedCellValue(kind, raw);
        if (typed != null) return typed;
        if (!col.valueFormatter) return typed === null ? null : inertCellValue(raw);
    }
    return col.valueFormatter ? formatExportValue(row, col, raw) : inertCellValue(raw);
}

// ─── Number formats ──────────────────────────────────────────────────────────

export const INTEGER_FORMAT = '#,##0';
const DECIMAL_FORMAT = '#,##0.##';

/**
 * Default format for a number-column value. '#,##0.##' alone shows whole numbers with a trailing
 * decimal point in Excel ("5."), so whole numbers get '#,##0'.
 */
function defaultNumberFormat(value: number): string {
    return Number.isInteger(value) ? INTEGER_FORMAT : DECIMAL_FORMAT;
}

export function columnNumFmt(colDef: GridColDef<GridRowModel>, style: ExcelColumnStyle | undefined): string | undefined {
    if (style?.numFmt) return style.numFmt;
    if (colDef.type === 'date') return 'yyyy-mm-dd';
    return undefined;
}

/** The number format for a native cell value, or undefined to keep the column's format. */
export function cellNumFmt(colDef: GridColDef<GridRowModel>, style: ExcelColumnStyle | undefined, value: ExcelCellValue): string | undefined {
    if (style?.numFmt || typeof value !== 'number' || colDef.type !== 'number') return undefined;
    return defaultNumberFormat(value);
}

// ─── Column display width (chars) ────────────────────────────────────────────

export function colWidth(colDef: GridColDef<GridRowModel>, override?: number): number {
    if (override != null) return override;
    const px = (colDef.width ?? 120) as number;
    return Math.min(60, Math.max(8, (px - 5) / 7));
}

// ─── Image helpers ────────────────────────────────────────────────────────────

type SupportedImageExt = 'png' | 'jpeg' | 'gif';

/**
 * The image format from the file's magic bytes. Excel can only show PNG, JPEG and GIF here; SVG,
 * WebP, AVIF and anything else return null so the URL text is written instead.
 */
function detectImageExtension(bytes: Uint8Array): SupportedImageExt | null {
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
    return null;
}

/** The image URL of an embedImage cell: the cell value after `valueGetter`. */
export function imageUrlOf(row: GridRowModel, col: GridColDef<GridRowModel>): string | null {
    const value = getRawExportValue(row, col);
    return typeof value === 'string' && value ? value : null;
}

/**
 * Fetch a list of image URLs in parallel.
 * CORS failures and unsupported formats are logged and skipped — raw URL text is written to the
 * cell instead so data is never silently lost.
 */
export async function fetchImages(
    urls: string[]
): Promise<Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>> {
    const settled = await Promise.allSettled(
        urls.map(async (url) => {
            let bytes: Uint8Array;
            if (url.startsWith('data:')) {
                // ── data: URI — decode base64 directly, no network needed ──────────
                const b64 = url.slice(url.indexOf(',') + 1);
                const binary = atob(b64);
                bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            } else {
                // ── Remote URL — fetch with CORS ──────────────────────────────────
                const res = await fetch(url, { mode: 'cors' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                bytes = new Uint8Array(await res.arrayBuffer());
            }
            const ext = detectImageExtension(bytes);
            if (!ext) throw new Error('unsupported image format (only PNG, JPEG and GIF can be embedded)');
            return { url, buffer: bytes.slice().buffer, ext };
        })
    );
    const map = new Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>();
    settled.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            map.set(result.value.url, { buffer: result.value.buffer, extension: result.value.ext });
        } else {
            console.warn(
                `[exportToExcelAdvanced] Cannot embed image "${urls[i]}" ` +
                `(CORS/network error or unsupported format — raw URL written as fallback):`,
                result.reason
            );
        }
    });
    return map;
}

/** Convert '#rrggbb' or '#rgb' to ExcelJS ARGB 'FFrrggbb' */
export function argb(hex: string): string {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
        return 'FF' + clean.split('').map(c => c + c).join('');
    }
    if (clean.length === 6) {
        return 'FF' + clean;
    }
    return 'FF' + clean.padEnd(6, '0');
}

export function bottomBorder(): Partial<import('exceljs').Borders> {
    return { bottom: { style: 'medium', color: { argb: 'FFcbd5e1' } } };
}

export function topBorder(): Partial<import('exceljs').Borders> {
    return { top: { style: 'medium', color: { argb: 'FFcbd5e1' } } };
}
