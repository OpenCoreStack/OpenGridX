import type { GridColDef, GridValidRowModel } from '../types';
import { toDate } from './values';

/**
 * Text → typed values: the TSV reader clipboard paste uses, and the per-column-type parsers paste,
 * `GridColDef.valueParser` defaults and the `/ai` validator share. Pure and React-free.
 *
 * Every pattern here is linear (CodeQL scans every push): no adjacent quantifiers that can match the
 * same characters.
 */

/** A parsed value, or `{ ok: false }` when the text does not fit the column type. */
export type GridParsedValue = { ok: true; value: unknown } | { ok: false };

const INVALID: GridParsedValue = { ok: false };
const valid = (value: unknown): GridParsedValue => ({ ok: true, value });

/**
 * Splits tab-separated text the way Excel, Google Sheets and LibreOffice write it: tabs between
 * columns, `\r\n`, `\n` or `\r` between rows. A field that starts with a double quote is quoted: it
 * may hold tabs, line breaks and doubled quotes (`""` → `"`), the reverse of `escapeTsvField`. A
 * quote inside an unquoted field is kept as is. A trailing empty line is ignored, so `"a\tb\n"` is one
 * row. Empty text gives no rows.
 */
export function parseTsv(text: string): string[][] {
    const rows: string[][] = [];
    if (text === '') return rows;
    let row: string[] = [];
    let field = '';
    let i = 0;
    const n = text.length;
    let fieldStart = true;
    while (i < n) {
        const ch = text[i];
        if (fieldStart && ch === '"') {
            // A quoted field: read to the closing quote, `""` being one quote.
            let j = i + 1;
            let value = '';
            let closed = false;
            while (j < n) {
                const q = text[j];
                if (q === '"') {
                    if (text[j + 1] === '"') {
                        value += '"';
                        j += 2;
                        continue;
                    }
                    closed = true;
                    j += 1;
                    break;
                }
                value += q;
                j += 1;
            }
            if (!closed) {
                // No closing quote: not a quoted field after all, read the quote as text.
                field += ch;
                i += 1;
                fieldStart = false;
                continue;
            }
            field += value;
            i = j;
            fieldStart = false;
            continue;
        }
        fieldStart = false;
        if (ch === '\t') {
            row.push(field);
            field = '';
            fieldStart = true;
            i += 1;
        } else if (ch === '\n' || ch === '\r') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            fieldStart = true;
            i += ch === '\r' && text[i + 1] === '\n' ? 2 : 1;
        } else {
            field += ch;
            i += 1;
        }
    }
    // The last line, unless the text ended with a line break (Excel always adds one).
    if (!fieldStart || row.length > 0 || field !== '') {
        row.push(field);
        rows.push(row);
    }
    return rows;
}

const PLAIN_NUMBER = /^\d+(?:\.\d*)?(?:e[+-]?\d+)?$/i;
const LEADING_DOT_NUMBER = /^\.\d+(?:e[+-]?\d+)?$/i;
const GROUPED_NUMBER = /^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/;
// Currency symbols (Unicode Sc) and every kind of space, including the no-break spaces Excel uses
// as a thousands separator.
const STRIPPED_CHARS = /[\p{Sc}\s]/gu;

/**
 * A number as spreadsheets copy it: `1234.5`, `1,234.5` (comma thousands groups only), `-12`,
 * `(12)` (accounting negative), `12%` (→ 0.12), `1e3`, with currency symbols and spaces stripped.
 * Empty text is `null`. `1,5` is not accepted (it is ambiguous): use a `valueParser` for
 * decimal-comma locales.
 */
export function parseNumberText(text: string): GridParsedValue {
    let s = text.replace(STRIPPED_CHARS, '');
    if (s === '') return text.trim() === '' ? valid(null) : INVALID;
    let negative = false;
    if (s.startsWith('(') && s.endsWith(')')) {
        negative = true;
        s = s.slice(1, -1);
    }
    if (s.startsWith('-') || s.startsWith('+') || s.startsWith('−')) {
        if (s[0] !== '+') negative = !negative;
        s = s.slice(1);
    }
    let percent = false;
    if (s.endsWith('%')) {
        percent = true;
        s = s.slice(0, -1);
    }
    if (GROUPED_NUMBER.test(s)) s = s.split(',').join('');
    else if (!PLAIN_NUMBER.test(s) && !LEADING_DOT_NUMBER.test(s)) return INVALID;
    let value = Number(s);
    if (!Number.isFinite(value)) return INVALID;
    if (percent) value /= 100;
    if (negative) value = -value;
    return valid(value);
}

const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;
const pad2 = (n: number) => String(n).padStart(2, '0');
const localDay = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/**
 * A date: ISO `2026-10-07` (read as that local calendar day) or anything `Date.parse` accepts. Empty
 * text is `null`. The result takes the kind of `current` (the value the cell holds now), as the date
 * editor does: a timestamp stays a timestamp, a date string stays a `YYYY-MM-DD` string (an ISO
 * date-time string keeps its time part); otherwise it is a `Date`.
 */
export function parseDateText(text: string, current?: unknown): GridParsedValue {
    const trimmed = text.trim();
    if (trimmed === '') return valid(null);
    const date = toDate(trimmed);
    if (!date) return INVALID;
    if (typeof current === 'number') return valid(date.getTime());
    if (typeof current === 'string') {
        const day = localDay(date);
        return valid(ISO_DATE_PREFIX.test(current) && current.length > 10 ? day + current.slice(10) : day);
    }
    return valid(date);
}

/** Text read as `true` / `false`, besides the grid's own `Yes` / `No` cell labels. Lower case. */
const TRUE_WORDS = new Set(['true', 'yes', '1']);
const FALSE_WORDS = new Set(['false', 'no', '0']);

export interface GridBooleanLabels {
    /** Text shown for `true` (the grid shows `Yes`). */
    trueLabel?: string;
    /** Text shown for `false` (the grid shows `No`). */
    falseLabel?: string;
}

/**
 * A boolean: `true`/`false`, `yes`/`no` (the grid's own `Yes` / `No` cell labels), `1`/`0` and any
 * `labels` given, case-insensitive. Empty text is `null`.
 */
export function parseBooleanText(text: string, labels?: GridBooleanLabels): GridParsedValue {
    const s = text.trim().toLowerCase();
    if (s === '') return valid(null);
    if (labels?.trueLabel !== undefined && s === labels.trueLabel.trim().toLowerCase()) return valid(true);
    if (labels?.falseLabel !== undefined && s === labels.falseLabel.trim().toLowerCase()) return valid(false);
    if (TRUE_WORDS.has(s)) return valid(true);
    if (FALSE_WORDS.has(s)) return valid(false);
    return INVALID;
}

type ValueOption = NonNullable<GridColDef['valueOptions']>[number];

/**
 * A `singleSelect` value: the option whose value or label matches the text, case-insensitive (values
 * first). Returns the option's own value, so a numeric option stays a number. Empty text is `null`.
 */
export function parseSingleSelectText(text: string, options: readonly ValueOption[] | undefined): GridParsedValue {
    const s = text.trim();
    if (s === '') return valid(null);
    if (!options || options.length === 0) return INVALID;
    const lower = s.toLowerCase();
    for (const option of options) {
        const value = typeof option === 'object' ? option.value : option;
        if (String(value).toLowerCase() === lower) return valid(value);
    }
    for (const option of options) {
        if (typeof option === 'object' && option.label.toLowerCase() === lower) return valid(option.value);
    }
    return INVALID;
}

type ParserColumn = Pick<GridColDef, 'type' | 'valueOptions'>;

export interface GridParseTextOptions {
    /** The value the cell holds now: a parsed date takes its kind (see `parseDateText`). */
    current?: unknown;
    /** Extra boolean labels, besides `Yes` / `No`. */
    booleanLabels?: GridBooleanLabels;
}

/**
 * Parses cell text by the column `type`, without `valueParser`:
 *
 * | type | accepted |
 * | :--- | :--- |
 * | `string` (default), `image` | the text as is (an empty cell is `''`) |
 * | `number` | `parseNumberText` |
 * | `date` | `parseDateText` |
 * | `boolean` | `parseBooleanText` |
 * | `singleSelect` | `parseSingleSelectText` |
 *
 * An empty cell is `null` for every type but `string` / `image`.
 */
export function parseValueByType(text: string, colDef: ParserColumn | undefined, options?: GridParseTextOptions): GridParsedValue {
    switch (colDef?.type) {
        case 'number': return parseNumberText(text);
        case 'date': return parseDateText(text, options?.current);
        case 'boolean': return parseBooleanText(text, options?.booleanLabels);
        case 'singleSelect': return parseSingleSelectText(text, colDef.valueOptions);
        default: return valid(text);
    }
}

/**
 * Parses the text pasted into one cell: the column's `valueParser` when it has one (a throw, or a
 * returned `undefined`, rejects the text), otherwise `parseValueByType`.
 */
export function parseCellText<R extends GridValidRowModel>(
    text: string,
    colDef: GridColDef<R>,
    row: R,
    options?: GridParseTextOptions,
): GridParsedValue {
    const { valueParser } = colDef;
    if (!valueParser) return parseValueByType(text, colDef as unknown as ParserColumn, options);
    let value: unknown;
    try {
        value = valueParser(text, { row, field: colDef.field, colDef });
    } catch {
        return INVALID;
    }
    return value === undefined ? INVALID : valid(value);
}
