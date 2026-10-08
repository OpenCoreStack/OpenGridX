// Value coercion for the AI validator. Text goes through the same parsers as clipboard paste
// (`lib/utils/parsing.ts`), so a value the grid accepts from Excel is accepted from a model and the
// other way round. Model output is JSON, so typed values (a number, a boolean, a Date) are taken as
// they are. Empty input is valid: null, or '' for text columns.
import {
  parseBooleanText,
  parseDateText,
  parseNumberText,
  parseSingleSelectText,
  type GridParsedValue,
} from '../utils/parsing';

export type CoerceResult<T = unknown> = { ok: true; value: T } | { ok: false; reason: 'invalidValue' };

/** The column properties coercion reads. */
export interface CoerceColumn {
  type?: string;
  valueOptions?: readonly (string | number | { value: unknown; label: string })[];
}

const ok = <T>(value: T): CoerceResult<T> => ({ ok: true, value });
const INVALID: CoerceResult<never> = { ok: false, reason: 'invalidValue' };

const fromParsed = <T>(parsed: GridParsedValue): CoerceResult<T> =>
  parsed.ok ? ok(parsed.value as T) : INVALID;

function isBlank(text: unknown): boolean {
  return text == null || (typeof text === 'string' && text.trim() === '');
}

/** `string` and `image` columns: text as is. Numbers and booleans become their text. */
export function coerceString(text: unknown): CoerceResult<string> {
  if (text == null) return ok('');
  if (typeof text === 'string') return ok(text);
  if (typeof text === 'number' || typeof text === 'boolean') return ok(String(text));
  return INVALID;
}

/** `number` columns: a finite number, or text in the paste format (`1,234.5`, `12%`, `$40`). */
export function coerceNumber(text: unknown): CoerceResult<number | null> {
  if (isBlank(text)) return ok(null);
  if (typeof text === 'number') return Number.isFinite(text) ? ok(text) : INVALID;
  if (typeof text !== 'string') return INVALID;
  return fromParsed(parseNumberText(text));
}

/** `date` columns: a Date, epoch milliseconds, or text in the paste format (ISO `2026-10-07` …). */
export function coerceDate(text: unknown): CoerceResult<Date | null> {
  if (isBlank(text)) return ok(null);
  if (text instanceof Date) return Number.isNaN(text.getTime()) ? INVALID : ok(text);
  if (typeof text === 'number') return Number.isFinite(text) ? ok(new Date(text)) : INVALID;
  if (typeof text !== 'string') return INVALID;
  return fromParsed(parseDateText(text));
}

/** `boolean` columns: a boolean, or `true`/`false`, `yes`/`no`, `1`/`0` (case-insensitive). */
export function coerceBoolean(text: unknown): CoerceResult<boolean | null> {
  if (isBlank(text)) return ok(null);
  if (typeof text === 'boolean') return ok(text);
  if (typeof text !== 'string' && typeof text !== 'number') return INVALID;
  return fromParsed(parseBooleanText(String(text)));
}

/**
 * `singleSelect` columns: an option value or label, case-insensitive; returns the option's value.
 * Without `valueOptions` the model has nothing to choose from, so any scalar is kept as it is.
 */
export function coerceSingleSelect(text: unknown, colDef: CoerceColumn): CoerceResult<unknown> {
  if (isBlank(text)) return ok(null);
  if (typeof text !== 'string' && typeof text !== 'number' && typeof text !== 'boolean') return INVALID;
  const options = colDef.valueOptions;
  if (!options || options.length === 0) return ok(text);
  return fromParsed(parseSingleSelectText(String(text), options));
}

/** Coerces `text` for the column's `type`. */
export function coerceValue(text: unknown, colDef: CoerceColumn): CoerceResult<unknown> {
  switch (colDef.type) {
    case 'number':
      return coerceNumber(text);
    case 'date':
      return coerceDate(text);
    case 'boolean':
      return coerceBoolean(text);
    case 'singleSelect':
      return coerceSingleSelect(text, colDef);
    default:
      return coerceString(text);
  }
}
