// createGridAiPromptHandler: the `aiAssistant.onPrompt` function for an app's own model. It builds the
// schema once, calls the app's `callModel`, reads the reply (an object, JSON text, or text with a fenced
// JSON block) and returns the validated, branded result. The grid never sees the raw reply.
import type { GridAiPromptContext, GridAiPromptResult } from '../types';
import { brandGridAiValidated } from '../utils/aiBrand';
import { hasOwn, isPlainObject } from './columns';
import { getGridAiSchema } from './schema';
import type { GridAiColumn, GridAiPartOptions, GridAiPromptHandlerOptions, GridAiValidationError } from './types';
import { validateGridAiState } from './validate';

const FENCE = '```';

/** A DOMException named `AbortError`, as `fetch` rejects with. */
export function abortError(): Error {
  return typeof DOMException === 'function'
    ? new DOMException('The operation was aborted.', 'AbortError')
    : Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' });
}

/**
 * Splits a text reply into the JSON it holds and the text around it: the whole text when it starts
 * with `{`, else the first fenced block (with no language or `json`). A plain loop, no regex.
 */
export function readModelText(text: string): { json: string | null; message: string } {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return { json: trimmed, message: '' };
  const open = text.indexOf(FENCE);
  const lineEnd = open < 0 ? -1 : text.indexOf('\n', open + FENCE.length);
  const close = lineEnd < 0 ? -1 : text.indexOf(FENCE, lineEnd + 1);
  const lang = close < 0 ? '' : text.slice(open + FENCE.length, lineEnd).trim().toLowerCase();
  if (close < 0 || (lang !== '' && lang !== 'json')) return { json: null, message: trimmed };
  return {
    json: text.slice(lineEnd + 1, close),
    message: `${text.slice(0, open)}${text.slice(close + FENCE.length)}`.trim(),
  };
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return typeof error === 'string' && error ? error : 'Unknown error';
}

/** A branded result with an empty state: nothing to apply, the errors explain why. */
function emptyResult(errors: GridAiValidationError[], message?: string): GridAiPromptResult {
  const result: GridAiPromptResult = { state: brandGridAiValidated({}), errors };
  if (message) result.message = message;
  return brandGridAiValidated(result);
}

/** Validates a model reply into a branded result. Never throws. */
export function readModelReply(reply: unknown, columns: readonly GridAiColumn[], parts: GridAiPartOptions): GridAiPromptResult {
  let json: unknown = reply;
  let message = '';
  if (typeof reply === 'string') {
    const text = readModelText(reply);
    if (text.json === null) return emptyResult([], text.message || undefined);
    json = text.json;
    message = text.message;
  } else if (isPlainObject(reply) && hasOwn(reply, 'message') && typeof reply.message === 'string') {
    // A reply such as { filterModel, message: 'Showing paid orders' }: the message is not state.
    const { message: text, ...rest } = reply;
    json = rest;
    message = text as string;
  }
  const result: GridAiPromptResult = validateGridAiState(json, columns, parts);
  if (message) result.message = message;
  return result;
}

/**
 * Builds `aiAssistant.onPrompt` for your own model. On each prompt it calls
 * `callModel({ prompt, schema, currentState, history }, { signal })`, reads the reply (a state object,
 * a JSON string, or a fenced JSON block inside text), validates it with `validateGridAiState` and
 * returns the branded result. A `callModel` throw or rejection becomes
 * `{ state: {}, errors: [{ path: '', message }] }`; an abort rejects with an `AbortError`.
 * @since v3.5
 */
export function createGridAiPromptHandler<C extends GridAiColumn>(
  options: GridAiPromptHandlerOptions<C>,
): (prompt: string, context: GridAiPromptContext) => Promise<GridAiPromptResult> {
  const { columns, callModel, parts, schemaOptions = {} } = options;
  const partOptions: GridAiPartOptions = { include: parts ?? schemaOptions.include, exclude: schemaOptions.exclude };
  const schema = getGridAiSchema(columns, { ...schemaOptions, ...partOptions });

  return async (prompt, context) => {
    const signal = context?.signal ?? new AbortController().signal;
    if (signal.aborted) throw abortError();
    // Stop resolves the prompt at once, even when callModel ignores the signal.
    const aborted = new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => reject(abortError()), { once: true });
    });
    aborted.catch(() => undefined);
    let reply: unknown;
    try {
      const request = {
        prompt: String(prompt),
        schema,
        currentState: context?.currentState ?? {},
        history: Array.isArray(context?.history) ? context.history : [],
      };
      reply = await Promise.race([callModel(request, { signal }), aborted]);
    } catch (error) {
      if (signal.aborted) throw abortError();
      return emptyResult([{ path: '', message: `The model call failed: ${errorText(error)}` }]);
    }
    if (signal.aborted) throw abortError();
    return readModelReply(reply, columns, partOptions);
  };
}
