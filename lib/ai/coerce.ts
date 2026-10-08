// Value coercion for the AI validator: the parsing rules of clipboard paste (3.4.0 design, Part B),
// as small pure functions. Each takes the raw value (usually text) and the column and returns the
// typed value or a reason. Empty input is valid: null, or '' for text columns.
import { toDate } from '../utils/values';

export type CoerceResult<T = unknown> = { ok: true; value: T } | { ok: false; reason: 'invalidValue' };

/** The column properties coercion reads. */
export interface CoerceColumn {
  type?: string;
  valueOptions?: readonly (string | number | { value: unknown; label: string })[];
}

const ok = <T>(value: T): CoerceResult<T> => ({ ok: true, value });
const INVALID: CoerceResult<never> = { ok: false, reason: 'invalidValue' };

const SPACE = /\s/;
const CURRENCY = /\p{Sc}/u;
const NUMBER_CHARS = /^[0-9.eE+-]+$/;
const DIGIT = /[0-9]/;

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

/**
 * `number` columns: `1234.5`, `1,234.5`, `-12`, `12%` (0.12). Currency symbols and spaces are
 * stripped; a comma is a thousands separator and may only appear before the decimal point.
 */
export function coerceNumber(text: unknown): CoerceResult<number | null> {
  if (isBlank(text)) return ok(null);
  if (typeof text === 'number') return Number.isFinite(text) ? ok(text) : INVALID;
  if (typeof text !== 'string') return INVALID;
  let source = text.trim();
  const percent = source.endsWith('%');
  if (percent) source = source.slice(0, -1);
  let digits = '';
  let seenPoint = false;
  // A plain loop, not a regex with adjacent quantifiers: this runs on model output of any length.
  for (const ch of source) {
    if (ch === ',') {
      if (seenPoint) return INVALID;
      continue;
    }
    if (SPACE.test(ch) || CURRENCY.test(ch)) continue;
    if (ch === '.') seenPoint = true;
    digits += ch;
  }
  if (!NUMBER_CHARS.test(digits) || !DIGIT.test(digits)) return INVALID;
  const n = Number(digits);
  if (!Number.isFinite(n)) return INVALID;
  return ok(percent ? n / 100 : n);
}

/**
 * `date` columns: ISO `2026-10-07` (a local calendar day), and whatever `Date.parse` accepts.
 * Date objects and epoch milliseconds are taken as they are.
 */
export function coerceDate(text: unknown): CoerceResult<Date | null> {
  if (isBlank(text)) return ok(null);
  if (typeof text !== 'string' && typeof text !== 'number' && !(text instanceof Date)) return INVALID;
  const date = toDate(text);
  return date ? ok(date) : INVALID;
}

const TRUE_WORDS = new Set(['true', 'yes', '1']);
const FALSE_WORDS = new Set(['false', 'no', '0']);

/** `boolean` columns: `true`/`false`, `yes`/`no`, `1`/`0`, case-insensitive. */
export function coerceBoolean(text: unknown): CoerceResult<boolean | null> {
  if (isBlank(text)) return ok(null);
  if (typeof text === 'boolean') return ok(text);
  if (typeof text !== 'string' && typeof text !== 'number') return INVALID;
  const word = String(text).trim().toLowerCase();
  if (TRUE_WORDS.has(word)) return ok(true);
  if (FALSE_WORDS.has(word)) return ok(false);
  return INVALID;
}

/**
 * `singleSelect` columns: an option value, or an option label, case-insensitive. Returns the
 * option's value. Without `valueOptions`, any text is accepted.
 */
export function coerceSingleSelect(text: unknown, colDef: CoerceColumn): CoerceResult<unknown> {
  if (isBlank(text)) return ok(null);
  if (typeof text !== 'string' && typeof text !== 'number' && typeof text !== 'boolean') return INVALID;
  const options = colDef.valueOptions;
  if (!options || options.length === 0) return ok(text);
  const wanted = String(text).trim().toLowerCase();
  for (const option of options) {
    const value = option !== null && typeof option === 'object' ? option.value : option;
    if (Object.is(value, text) || (value != null && String(value).toLowerCase() === wanted)) return ok(value);
  }
  for (const option of options) {
    if (option !== null && typeof option === 'object' && String(option.label).toLowerCase() === wanted) return ok(option.value);
  }
  return INVALID;
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
