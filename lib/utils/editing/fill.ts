import type { GridFillDirection, GridRowId } from '../../types';
import type { CellRangeRect } from '../cellSelection';

/**
 * Pure helpers of the fill handle (v3.5): what a fill writes (series detection) and where (the target
 * rectangle the pointer asks for, the cells of each line).
 */

/** Digits after the decimal point of a finite number, or null for exponent notation. */
function decimalPlaces(value: number): number | null {
    const text = String(value);
    if (text.includes('e') || text.includes('E')) return null;
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : text.length - dot - 1;
}

/** Rounds to `places` decimals (no rounding for null), so 0.1 + 0.2 reads 0.3. */
function roundTo(value: number, places: number | null): number {
    if (places === null) return value;
    return Number(value.toFixed(Math.min(places, 20)));
}

function numberSeries(source: readonly number[], count: number): number[] | null {
    let places: number | null = 0;
    for (const value of source) {
        const p = decimalPlaces(value);
        places = p === null || places === null ? null : Math.max(places, p);
    }
    const step = roundTo(source[1] - source[0], places);
    for (let i = 2; i < source.length; i++) {
        if (roundTo(source[i] - source[i - 1], places) !== step) return null;
    }
    const last = source[source.length - 1];
    const out: number[] = [];
    for (let k = 1; k <= count; k++) out.push(roundTo(last + step * k, places));
    return out;
}

const MS_PER_DAY = 86_400_000;
const timeOfDay = (d: Date) => ((d.getHours() * 60 + d.getMinutes()) * 60 + d.getSeconds()) * 1000 + d.getMilliseconds();
const dayNumber = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
const monthNumber = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

/** The equal step between consecutive keys, or null. */
function equalStep(keys: readonly number[]): number | null {
    const step = keys[1] - keys[0];
    for (let i = 2; i < keys.length; i++) {
        if (keys[i] - keys[i - 1] !== step) return null;
    }
    return step;
}

function dateSeries(source: readonly Date[], count: number): Date[] | null {
    const last = source[source.length - 1];
    const sameTime = source.every(d => timeOfDay(d) === timeOfDay(last));
    // Same day of the month, months apart by an equal step: continue by months (31 Jan + 1 month is
    // the last day of February).
    if (sameTime && source.every(d => d.getDate() === last.getDate())) {
        const step = equalStep(source.map(monthNumber));
        if (step !== null && step !== 0) {
            const out: Date[] = [];
            for (let k = 1; k <= count; k++) {
                const month = last.getMonth() + step * k;
                const year = last.getFullYear() + Math.floor(month / 12);
                const m = ((month % 12) + 12) % 12;
                const date = new Date(last.getTime());
                date.setFullYear(year, m, Math.min(last.getDate(), daysInMonth(year, m)));
                out.push(date);
            }
            return out;
        }
    }
    // Whole days apart (calendar days, so a daylight-saving change does not break the step).
    if (sameTime) {
        const step = equalStep(source.map(dayNumber));
        if (step === null) return null;
        const out: Date[] = [];
        for (let k = 1; k <= count; k++) {
            const date = new Date(last.getTime());
            date.setDate(last.getDate() + step * k);
            out.push(date);
        }
        return out;
    }
    const step = equalStep(source.map(d => d.getTime()));
    if (step === null) return null;
    const out: Date[] = [];
    for (let k = 1; k <= count; k++) out.push(new Date(last.getTime() + step * k));
    return out;
}

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isValidDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

/**
 * The continued series of `source` (two or more numbers, or two or more dates, with an exactly equal
 * step), `count` values long, or null when `source` is not such a series.
 */
export function detectFillSeries(source: readonly unknown[], count: number): unknown[] | null {
    if (source.length < 2) return null;
    if (source.every(isFiniteNumber)) return numberSeries(source, count);
    if (source.every(isValidDate)) return dateSeries(source, count);
    return null;
}

/** A value repeated into another cell: dates are copied, so cells never share one Date object. */
const cloneValue = (value: unknown): unknown => (value instanceof Date ? new Date(value.getTime()) : value);

/**
 * The `count` values a fill writes after `source` (in fill order): the continued series when `series`
 * is allowed and `source` is one, otherwise `source` repeated (one value: a copy).
 */
export function computeFillValues(source: readonly unknown[], count: number, series: boolean): unknown[] {
    if (source.length === 0 || count <= 0) return [];
    const continued = series ? detectFillSeries(source, count) : null;
    if (continued) return continued;
    const out: unknown[] = [];
    for (let k = 0; k < count; k++) out.push(cloneValue(source[k % source.length]));
    return out;
}

/**
 * Where a fill-handle drag reaches: the source rectangle extended in one direction to the cell under
 * the pointer, or null while the pointer is over the source. The larger pointer offset (px, `dx` /
 * `dy` from where the drag started) decides between vertical and horizontal.
 */
export function fillTargetFromPointer(
    source: CellRangeRect,
    head: { row: number; col: number },
    dx: number,
    dy: number,
): { rect: CellRangeRect; direction: GridFillDirection } | null {
    if (Math.abs(dy) >= Math.abs(dx)) {
        if (head.row > source.bottom) return { rect: { ...source, bottom: head.row }, direction: 'down' };
        if (head.row < source.top) return { rect: { ...source, top: head.row }, direction: 'up' };
        return null;
    }
    if (head.col > source.right) return { rect: { ...source, right: head.col }, direction: 'right' };
    if (head.col < source.left) return { rect: { ...source, left: head.col }, direction: 'left' };
    return null;
}

/** One line of a fill: the source positions in fill order and the positions it fills, in order. */
export interface FillLine {
    /** Row index for a vertical fill, column index for a horizontal one. */
    line: number;
    source: number[];
    targets: number[];
}

/** The lines (columns for a vertical fill, rows for a horizontal one) of a fill from `source` to `target`. */
export function fillLines(source: CellRangeRect, target: CellRangeRect, direction: GridFillDirection): FillLine[] {
    const range = (from: number, to: number) => {
        const out: number[] = [];
        if (from <= to) for (let i = from; i <= to; i++) out.push(i);
        else for (let i = from; i >= to; i--) out.push(i);
        return out;
    };
    const vertical = direction === 'down' || direction === 'up';
    const lines = vertical ? range(source.left, source.right) : range(source.top, source.bottom);
    let sourceOrder: number[];
    let targets: number[];
    switch (direction) {
        case 'down':
            sourceOrder = range(source.top, source.bottom);
            targets = target.bottom > source.bottom ? range(source.bottom + 1, target.bottom) : [];
            break;
        case 'up':
            sourceOrder = range(source.bottom, source.top);
            targets = target.top < source.top ? range(source.top - 1, target.top) : [];
            break;
        case 'right':
            sourceOrder = range(source.left, source.right);
            targets = target.right > source.right ? range(source.right + 1, target.right) : [];
            break;
        default:
            sourceOrder = range(source.right, source.left);
            targets = target.left < source.left ? range(source.left - 1, target.left) : [];
    }
    return lines.map(line => ({ line, source: sourceOrder, targets }));
}

/**
 * The corners the range takes after a fill (or during a fill drag): the original anchor when it is a
 * corner of `rect`, otherwise the corner on the source side of the fill, so focus stays near it.
 */
export function fillRangeCorners(
    rect: CellRangeRect,
    direction: GridFillDirection,
    anchor: { row: number; col: number },
): { anchor: { row: number; col: number }; head: { row: number; col: number } } {
    const isCornerRow = anchor.row === rect.top || anchor.row === rect.bottom;
    const isCornerCol = anchor.col === rect.left || anchor.col === rect.right;
    let row = anchor.row;
    let col = anchor.col;
    if (!isCornerRow || !isCornerCol) {
        const vertical = direction === 'down' || direction === 'up';
        if (vertical) {
            row = direction === 'down' ? rect.top : rect.bottom;
            col = anchor.col === rect.right ? rect.right : rect.left;
        } else {
            col = direction === 'right' ? rect.left : rect.right;
            row = anchor.row === rect.bottom ? rect.bottom : rect.top;
        }
    }
    return {
        anchor: { row, col },
        head: { row: row === rect.top ? rect.bottom : rect.top, col: col === rect.left ? rect.right : rect.left },
    };
}

/** The cell the fill handle sits on: the bottom-right cell of the range, or the origin of the span covering it. */
export function fillHandleCell(
    rect: CellRangeRect,
    rowIdAt: (row: number) => GridRowId | undefined,
    fields: readonly string[],
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null,
): { row: number; field: string } | null {
    const rowId = rowIdAt(rect.bottom);
    const field = fields[rect.right];
    if (rowId === undefined || field === undefined) return null;
    const origin = getSpanOrigin?.(rowId, field);
    if (!origin || (origin.rowId === rowId && origin.field === field)) return { row: rect.bottom, field };
    // A span covers the corner: the handle goes on the cell that renders it, a few rows up.
    for (let r = rect.bottom; r >= Math.max(0, rect.bottom - MAX_SPAN_LOOKBACK); r--) {
        if (rowIdAt(r) === origin.rowId) return { row: r, field: origin.field };
    }
    return null;
}

/** How far up a span origin is looked for. */
const MAX_SPAN_LOOKBACK = 1000;
