import { describe, it, expect, vi } from 'vitest';
import type { GridColDef, GridAiPromptContext } from '../types';
import { isGridAiValidated } from '../utils/aiBrand';
import { createGridAiPromptHandler, readModelText } from './promptHandler';
import { validateGridAiState } from './validate';

const columns: GridColDef[] = [
  { field: 'region', headerName: 'Region' },
  { field: 'amount', headerName: 'Amount', type: 'number' },
];

function context(signal: AbortSignal = new AbortController().signal): GridAiPromptContext {
  return { currentState: { sortModel: [] }, history: [{ prompt: 'earlier', applied: {} }], signal };
}

describe('validateGridAiState brand', () => {
  it('brands the result and its state without changing their shape', () => {
    const result = validateGridAiState({ sortModel: [{ field: 'amount', sort: 'desc' }] }, columns);
    expect(isGridAiValidated(result)).toBe(true);
    expect(isGridAiValidated(result.state)).toBe(true);
    expect(Object.keys(result)).toEqual(['state', 'errors']);
    expect(result).toEqual({ state: { sortModel: [{ field: 'amount', sort: 'desc' }] }, errors: [] });
    expect(JSON.stringify(result)).toBe('{"state":{"sortModel":[{"field":"amount","sort":"desc"}]},"errors":[]}');
    // Spreading the result keeps the branded state; a copied state is not branded.
    expect(isGridAiValidated({ ...result, message: 'x' }.state)).toBe(true);
    expect(isGridAiValidated({ ...result.state })).toBe(false);
  });

  it('brands error results too', () => {
    const result = validateGridAiState('not json', columns);
    expect(result.errors).toHaveLength(1);
    expect(isGridAiValidated(result.state)).toBe(true);
  });
});

describe('readModelText', () => {
  it('reads JSON text, a fenced block and plain text', () => {
    expect(readModelText(' {"a":1} ')).toEqual({ json: '{"a":1}', message: '' });
    expect(readModelText('Here you go:\n```json\n{"a":1}\n```\nDone.')).toEqual({ json: '{"a":1}\n', message: 'Here you go:\n\nDone.' });
    expect(readModelText('```\n{"a":1}```')).toEqual({ json: '{"a":1}', message: '' });
    expect(readModelText('```ts\nconst a = 1\n```')).toEqual({ json: null, message: '```ts\nconst a = 1\n```' });
    expect(readModelText('Sorry, I cannot do that.')).toEqual({ json: null, message: 'Sorry, I cannot do that.' });
    expect(readModelText('```json\n{ never closed')).toEqual({ json: null, message: '```json\n{ never closed' });
  });

  it('stays linear on long fence-like input', () => {
    const text = '`'.repeat(50_000) + '\n'.repeat(50_000);
    const start = performance.now();
    readModelText(text);
    expect(performance.now() - start).toBeLessThan(200);
  });
});

describe('createGridAiPromptHandler', () => {
  it('calls the model once per prompt with the schema, current state and history', async () => {
    const callModel = vi.fn(async () => ({ sortModel: [{ field: 'amount', sort: 'desc' }] }));
    const onPrompt = createGridAiPromptHandler({ columns, callModel, parts: ['sort', 'filter'] });
    const ctx = context();
    const result = await onPrompt('biggest first', ctx);
    expect(callModel).toHaveBeenCalledTimes(1);
    const [request, options] = callModel.mock.calls[0] as unknown as [Record<string, unknown>, { signal: AbortSignal }];
    expect(request.prompt).toBe('biggest first');
    expect(request.currentState).toEqual({ sortModel: [] });
    expect(request.history).toEqual([{ prompt: 'earlier', applied: {} }]);
    expect(Object.keys((request.schema as { properties: object }).properties)).toEqual(['filterModel', 'sortModel']);
    expect(options.signal).toBe(ctx.signal);
    expect(result).toEqual({ state: { sortModel: [{ field: 'amount', sort: 'desc' }] }, errors: [] });
    expect(isGridAiValidated(result.state)).toBe(true);
  });

  it('reads a JSON string reply', async () => {
    const onPrompt = createGridAiPromptHandler({ columns, callModel: async () => '{"rowGroupingModel":["region"]}' });
    expect((await onPrompt('group', context())).state).toEqual({ rowGroupingModel: ['region'] });
  });

  it('reads a fenced JSON block inside text and keeps the text as the message', async () => {
    const reply = 'Grouping by region.\n```json\n{"rowGroupingModel":["region"],"sortModel":[{"field":"revnue","sort":"asc"}]}\n```';
    const onPrompt = createGridAiPromptHandler({ columns, callModel: async () => reply });
    const result = await onPrompt('group', context());
    expect(result.state).toEqual({ rowGroupingModel: ['region'], sortModel: [] });
    expect(result.errors).toEqual([{ path: 'sortModel[0].field', message: 'Unknown field "revnue"' }]);
    expect(result.message).toBe('Grouping by region.');
    expect(isGridAiValidated(result.state)).toBe(true);
  });

  it('turns a plain text reply into a message with nothing to apply', async () => {
    const onPrompt = createGridAiPromptHandler({ columns, callModel: async () => 'I can only change the view.' });
    const result = await onPrompt('delete everything', context());
    expect(result).toEqual({ state: {}, errors: [], message: 'I can only change the view.' });
    expect(isGridAiValidated(result.state)).toBe(true);
  });

  it('takes a message key next to the state', async () => {
    const onPrompt = createGridAiPromptHandler({ columns, callModel: async () => ({ message: 'Sorted.', sortModel: [{ field: 'amount', sort: 'asc' }] }) });
    const result = await onPrompt('sort', context());
    expect(result).toEqual({ state: { sortModel: [{ field: 'amount', sort: 'asc' }] }, errors: [], message: 'Sorted.' });
  });

  it('drops parts outside `parts`', async () => {
    const onPrompt = createGridAiPromptHandler({ columns, parts: ['sort'], callModel: async () => ({ rowGroupingModel: ['region'] }) });
    const result = await onPrompt('group', context());
    expect(result.state).toEqual({});
    expect(result.errors).toEqual([{ path: 'rowGroupingModel', message: 'Part not allowed' }]);
  });

  it('turns a throw or rejection of callModel into an error result', async () => {
    const rejecting = createGridAiPromptHandler({ columns, callModel: async () => { throw new Error('HTTP 500'); } });
    const result = await rejecting('x', context());
    expect(result).toEqual({ state: {}, errors: [{ path: '', message: 'The model call failed: HTTP 500' }] });
    expect(isGridAiValidated(result.state)).toBe(true);

    const throwing = createGridAiPromptHandler({ columns, callModel: (() => { throw 'boom'; }) as () => Promise<unknown> });
    expect((await throwing('x', context())).errors).toEqual([{ path: '', message: 'The model call failed: boom' }]);
  });

  it('rejects with an AbortError when aborted, even if callModel ignores the signal', async () => {
    const controller = new AbortController();
    const onPrompt = createGridAiPromptHandler({ columns, callModel: () => new Promise(() => undefined) });
    const pending = onPrompt('slow', context(controller.signal));
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });

    const already = new AbortController();
    already.abort();
    const callModel = vi.fn(async () => ({}));
    await expect(createGridAiPromptHandler({ columns, callModel })('x', context(already.signal))).rejects.toMatchObject({ name: 'AbortError' });
    expect(callModel).not.toHaveBeenCalled();
  });

  it('rejects with an AbortError when callModel rejects because of the abort', async () => {
    const controller = new AbortController();
    const onPrompt = createGridAiPromptHandler({
      columns,
      callModel: (_request, { signal }) => new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('fetch aborted')));
      }),
    });
    const pending = onPrompt('x', context(controller.signal));
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('validates odd replies without throwing', async () => {
    for (const reply of [null, undefined, 42, [], [1], { __proto__: { sortModel: [] } }, '{', '']) {
      const onPrompt = createGridAiPromptHandler({ columns, callModel: async () => reply });
      const result = await onPrompt('x', context());
      expect(result.state).toEqual({});
      expect(isGridAiValidated(result.state)).toBe(true);
    }
  });
});
