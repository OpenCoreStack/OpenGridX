# AI Toolkit: Schema, Validator, Assistant & Agent Tools

*Since v3.4.0 (schema and validator); v3.5.0 (assistant panel, prompt handler, agent tools)* · Demos: [AI: Grid Schema & Validator](https://opencorestack.github.io/OpenGridX/ai-schema), [AI Assistant](https://opencorestack.github.io/OpenGridX/ai-assistant)

Let users drive the grid in plain language ("paid orders over $10k in the North, biggest first") with the model your app already uses. The `@opencorestack/opengridx/ai` entry point gives you the pieces the grid can own:

- **`getGridAiSchema(columns, options?)`** turns your column definitions into a JSON Schema (draft 2020-12) of the grid state a model may return: filters, sort, row grouping, aggregation, pivot and column visibility, each limited to what the columns allow.
- **`validateGridAiState(json, columns, options?)`** checks the model's reply against the columns and returns the state that is safe to apply, plus a list of what it dropped.
- **`createGridAiPromptHandler(...)`** (v3.5) connects those two to your model for the grid's [**Ask AI** panel](#ai-assistant-panel) (`aiAssistant` prop).
- **`createGridAgentTools(apiRef, columns)`** (v3.5) gives [AI agents](#agent-tools) plain tools to read and change the grid.

OpenGridX never calls an AI service and bundles no AI SDK. Your app sends the prompt, the schema and the current state to its own model (with structured output), and passes the reply to the validator.

```ts
import { getGridAiSchema, validateGridAiState } from '@opencorestack/opengridx/ai';

const schema = getGridAiSchema(columns, { include: ['filter', 'sort', 'grouping', 'aggregation'] });

async function ask(prompt: string) {
  // Your own endpoint calls your own model, with `schema` as the structured-output format.
  const res = await fetch('/api/grid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, schema, currentState: { filterModel, sortModel } }),
  });
  const { state, errors } = validateGridAiState(await res.text(), columns);
  if (errors.length) console.info('Dropped from the reply:', errors);
  if (state.filterModel) setFilterModel(state.filterModel);
  if (state.sortModel) setSortModel(state.sortModel);
  if (state.rowGroupingModel) setRowGroupingModel(state.rowGroupingModel);
  if (state.aggregationModel) setAggregationModel(state.aggregationModel);
}
```

The entry point has no React import and no dependencies (about 6.7 kB gzipped with the v3.5 additions; the budget is 8 kB). Importing `@opencorestack/opengridx` never loads it, and it works on a server too, so you can validate the reply in the same endpoint that calls the model.

## Privacy rules

- **No row data by default.** The schema is built from column definitions only: `field`, `headerName`, `description`, `type`, the operators of the type, `valueOptions` and the allowed aggregation functions. The grid never reads a row for it.
- **`aiExamples` is real data.** `GridColDef.aiExamples` puts example values into the schema to help the model ("Acme" → `customer`). Those values are sent to the model. List only what you are happy to share; leave it out for anything personal. `options.examples: false` drops all of them.
- **`valueOptions` are sent.** The options of a `singleSelect` column become an `enum` in the schema. If an option list is itself sensitive, mark the column `filterable: false` or pass a copy of the columns without it.
- **Always validate before applying.** Model output is untrusted input. Apply `state`, never the raw reply; show `errors` (or log them) so users can see what was ignored. Show the change to the user and keep it easy to undo. The `aiAssistant` panel enforces this: it applies only a validated (branded) state, shows every change as a chip and offers Undo.
- **Rows stay in the app unless you opt in.** The assistant sends the prompt, the schema, the current models and the session's earlier prompts, never rows. Of the agent tools, only `get_row_summary` reads rows, and it exists only with `allowRowAccess: true`.
- **Check `schemaVersion`.** The schema carries `schemaVersion: 1`. It changes only when the shape of the schema changes, so you can cache prompts or fine-tuning data per version. The validator accepts a `schemaVersion` key in the reply and reports any value other than 1.

## `getGridAiSchema(columns, options?)`

Returns a plain JSON object (no functions), deterministic for the same columns and options, so you can memoise it with the columns.

| Part (state key) | Option name | Shape | Taken from the columns |
| :--- | :--- | :--- | :--- |
| `filterModel` | `'filter'` | `GridFilterModel`: `items`, `logicOperator`, nested AND/OR groups up to 3 levels, `quickFilterValues` | Fields with `filterable !== false`; per field the operators of `getOperatorsForType(type)`; `value` typed per column type (number, `YYYY-MM-DD` string, boolean, `valueOptions` enum or a list of them for `isAnyOf`) |
| `sortModel` | `'sort'` | `GridSortItem[]` | Fields with `sortable !== false` |
| `rowGroupingModel` | `'grouping'` | `string[]` | Fields with `groupable !== false` |
| `aggregationModel` | `'aggregation'` | field → function | `type: 'number'` (or `aggregable: true`) columns get every built-in function, other columns `count`; never `aggregable: false`; limited by `availableAggregationFunctions` |
| `pivotModel` | `'pivot'` | `GridPivotModel` | Groupable fields as row and column labels; value fields as for aggregation (`sum`, `avg`, `count`, `min`, `max`) |
| `columnVisibilityModel` | `'columnVisibility'` | field → boolean | Fields with `hideable !== false` |

Each filter item is a `oneOf` per field (`field` is a `const`, `operator` an `enum`, `value` typed by the column), which the main structured-output APIs accept. A part that no column allows is left out of the schema.

| Option | Default | Description |
| :--- | :--- | :--- |
| `include` | every part | Parts to offer: `'filter' \| 'sort' \| 'grouping' \| 'aggregation' \| 'pivot' \| 'columnVisibility'` |
| `exclude` | none | Parts to leave out; wins over `include` |
| `descriptions` | `true` | Put each column's `headerName` and `description` into the schema, so the model can map the user's words ("revenue") to a field (`amt_usd`) |
| `examples` | `true` | Include the columns' `aiExamples`. Columns without `aiExamples` never send example values |

Columns whose field starts with `__` (the grid's own `__check__`, `__group__` …) are skipped, so `apiRef.current.getAllColumns()` can be passed as is. The `columns` parameter takes any object with the `GridColDef` properties above (`GridAiColumn`); renderers, getters and formatters are ignored.

Example for two columns:

```ts
getGridAiSchema(
  [
    { field: 'amt_usd', headerName: 'Revenue', type: 'number' },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Open', 'Paid'], groupable: false },
  ],
  { include: ['filter', 'sort'], descriptions: false },
);
// {
//   $schema: 'https://json-schema.org/draft/2020-12/schema', schemaVersion: 1, title: 'OpenGridX grid state',
//   type: 'object', additionalProperties: false,
//   properties: {
//     filterModel: { type: 'object', additionalProperties: false, properties: {
//       items: { type: 'array', items: { anyOf: [{ $ref: '#/$defs/filterItem' }, { $ref: '#/$defs/filterGroup1' }] } },
//       logicOperator: { enum: ['and', 'or'] },
//       quickFilterValues: { type: 'array', items: { type: 'string' } } } },
//     sortModel: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['field', 'sort'],
//       properties: { field: { enum: ['amt_usd', 'status'] }, sort: { enum: ['asc', 'desc'] } } } },
//   },
//   $defs: {
//     filterItem: { oneOf: [
//       { type: 'object', required: ['field', 'operator'], additionalProperties: false, properties: {
//         field: { const: 'amt_usd' }, operator: { enum: ['=', '!=', '>', '>=', '<', '<=', 'isEmpty', 'isNotEmpty'] },
//         value: { type: 'number' } } },
//       { type: 'object', required: ['field', 'operator'], additionalProperties: false, properties: {
//         field: { const: 'status' }, operator: { enum: ['isAnyOf', 'is', 'not'] },
//         value: { anyOf: [{ enum: ['Open', 'Paid'] }, { type: 'array', items: { enum: ['Open', 'Paid'] } }] } } },
//     ] },
//     filterGroup1: { … items: filterItem | filterGroup2 }, filterGroup2: { … }, filterGroup3: { … items: filterItem },
//   },
// }
```

## `validateGridAiState(json, columns, options?)`

Returns `{ state, errors }`, where `state` is a `GridAiState` (`filterModel`, `sortModel`, `rowGroupingModel`, `aggregationModel`, `pivotModel`, `columnVisibilityModel`, each present only when the reply contained it) and `errors` is a list of `{ path, message }`, such as `{ path: 'filterModel.items[2].field', message: 'Unknown field "revenue"' }`.

- `json` may be an object or a JSON string. Bad JSON gives one error and an empty state.
- Unknown parts, unknown fields, fields a column does not allow (`filterable: false` …), operators that do not fit the column type, and functions or enum values outside the allowed list are **dropped**, each with an error. Parts outside `options.include` / `options.exclude` are dropped too.
- Values are coerced to the column type with the same rules as clipboard paste: `"1,200"`, `"$1,200"` → `1200`, `"12%"` → `0.12`; `"yes"` / `"no"` / `"1"` / `"0"` → booleans; dates (ISO or anything `Date.parse` reads) → the local day as `"YYYY-MM-DD"`, as the filter panel writes it; `singleSelect` values match an option value or label, case-insensitively, and become the option's value. A filter without a usable value is dropped.
- `asc` / `desc`, `and` / `or`, operators and function names are matched case-insensitively and written in their canonical spelling.
- A filter group left empty is removed; groups nested deeper than 3 levels are dropped.
- Lists are read up to 200 entries and at most 100 errors are listed, so a runaway reply stays cheap.
- It never throws, never returns a field the columns do not allow, and reads only own keys of the reply (never `__proto__`), so a reply cannot reach `Object.prototype`.

Applying an empty part is meaningful: `{ sortModel: [] }` clears the sort. Only apply the parts present in `state`.

## AI assistant panel

*Since v3.5.0.* The `aiAssistant` prop adds an **Ask AI** panel: users type (or dictate) what they want to see, your model answers, and the grid applies the validated reply at once, as one step they can undo.

```tsx
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';
import { createGridAiPromptHandler } from '@opencorestack/opengridx/ai';

const onPrompt = createGridAiPromptHandler({
  columns,
  // Your endpoint calls your model with request.schema as the structured-output format.
  callModel: async (request, { signal }) => {
    const res = await fetch('/api/grid-ai', { method: 'POST', body: JSON.stringify(request), signal });
    return res.json();
  },
});

<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}
  aiAssistant={{ onPrompt, suggestions: ['Top 10 by revenue', 'Group by region'] }}
/>;
```

- **Opening it.** The built-in toolbar shows an **Ask AI** button (sparkle icon; label `localeText.aiAssistantButton`). Without the toolbar, call `apiRef.current.openAiAssistant()`. `slots.aiAssistantPanel` replaces the panel; it receives `GridAiAssistantPanelProps`.
- **The panel.** A prompt input (Enter sends), the `suggestions` as chips, a microphone button where the browser has `SpeechRecognition` (hidden elsewhere; the microphone is asked for only on click; `voice: false` turns it off), **Stop** while a request runs (aborts `context.signal`), the reply's `message`, and the session's earlier prompts.
- **Applying.** The reply is applied immediately as one undoable step. Each change shows as a removable chip: a filter item, the quick-filter words, a sort key, a grouping field, an aggregation, a column shown or hidden, the pivot. Removing a chip re-applies the reply without it (a part with no chip left returns to its value from before the reply). **Undo** restores the state from before the reply. This view-state undo is separate from the cell-edit undo history (`undoRedo`).
- **What is applied.** Each part in `result.state` replaces the grid's model, except column visibility, which is merged over the current model (`{ tax: false }` hides one column and leaves the others). Parts outside `aiAssistant.parts` are ignored. A part the validator emptied (every entry dropped, such as a sort on an unknown field) is not applied, so it cannot clear the grid's model by accident. Changes go through the same handlers as the UI, so `onSortModelChange`, `onRowGroupingModelChange` and the rest fire; with a controlled model, update your state from them.
- **What was dropped** is listed under the chips, such as `Ignored: Unknown field "revnue"`.
- **Accessibility.** The panel is a `role="dialog"` labelled "Ask AI". Focus moves to the input when it opens and back to the toolbar button (or wherever it was) when it closes. Escape closes it. The status ("Thinking…", "Applied 3 changes", errors) is announced through the grid's live region.
- **Events.** `onAiAssistantApply(result)` after a reply was applied; `onAiAssistantError(error)` when `onPrompt` rejects (Stop does not count) or its result was not validated.

### The brand rule

The grid applies a result only when its `state` carries the brand `Symbol.for('opengridx.ai.validated')`. `validateGridAiState` sets it (non-enumerable, on the result and on its `state`), and `createGridAiPromptHandler` returns such a result. An unbranded result is not applied: the panel shows "The reply was not validated" and a development warning says why. This makes "validate before applying" a rule the grid enforces rather than advice.

Writing `onPrompt` yourself:

```ts
import { validateGridAiState } from '@opencorestack/opengridx/ai';

const onPrompt = async (prompt, { currentState, history, signal }) => {
  const reply = await myModel({ prompt, currentState, history, signal });
  const result = validateGridAiState(reply.json, columns);
  return { ...result, message: reply.text }; // spreading keeps the branded state
};
```

A copied state (`{ ...result.state }`) or a hand-built one is not branded.

### `createGridAiPromptHandler({ columns, callModel, parts?, schemaOptions? })`

Returns the `onPrompt` function. It builds the schema once (from `columns`, limited to `parts` and `schemaOptions`), then for each prompt:

1. calls `callModel({ prompt, schema, currentState, history }, { signal })`;
2. reads the reply: a state object, a JSON string, or text with a fenced `json` block (the text around the block becomes `result.message`). An object's string `message` key is the message, not state. Plain text with no JSON becomes the message with nothing to apply;
3. validates it with `validateGridAiState` (same `parts`) and returns the branded `{ state, errors, message? }`.

A `callModel` throw or rejection becomes `{ state: {}, errors: [{ path: '', message: 'The model call failed: …' }] }`. An abort (Stop, a new prompt, closing the panel) rejects with an `AbortError`, even when `callModel` ignores the signal.

## Agent tools

*Since v3.5.0.* `createGridAgentTools(apiRef, columns, options?)` returns plain tool objects, `{ name, description, inputSchema, execute }`, for an AI agent to read and change the grid. They have no SDK dependency, so they work with the Vercel AI SDK, CopilotKit, OpenAI or Anthropic tool calling, and WebMCP (`navigator.modelContext.registerTool`).

```ts
import { createGridAgentTools } from '@opencorestack/opengridx/ai';

const tools = createGridAgentTools(apiRef, columns);
// Anthropic / OpenAI style: describe them to the model …
const toolSpecs = tools.map(({ name, description, inputSchema }) => ({ name, description, input_schema: inputSchema }));
// … and run the call the model asks for.
const result = await tools.find((t) => t.name === call.name)?.execute(call.input);
```

| Tool | Input | Does |
| :--- | :--- | :--- |
| `get_grid_state` | `{}` | Returns `{ ok, state, columns }`: the current models (`apiRef.getGridAiState()`) and `{ field, headerName, type }` per column |
| `set_filter` | `{ filterModel }` | Replaces the filter model |
| `set_sort` | `{ sortModel }` | Replaces the sort model |
| `set_grouping` | `{ rowGroupingModel }` | Replaces the row grouping |
| `set_aggregation` | `{ aggregationModel }` | Replaces the summaries |
| `set_column_visibility` | `{ columnVisibilityModel }` | Shows or hides the listed columns; the others keep their visibility |
| `clear_filters` | `{}` | Removes every filter and the quick-filter words |
| `get_row_summary` | `{ limit? }` | **Only with `allowRowAccess: true`.** Returns `{ ok, rowCount, rows }`: the number of rows that pass the filter and the first `maxRows` (default 20) of them, limited to `options.fields`, values read through `valueGetter` (JSON-safe: dates as ISO strings, objects as `null`) |

- Each `set_*` tool's `inputSchema` is the part's schema from `getGridAiSchema`; a tool whose part no column allows is left out.
- Inputs are checked with `validateGridAiState`. A call with any error applies **nothing** and returns `{ ok: false, errors }`, so the agent can correct it; a valid call returns `{ ok: true, applied }`.
- `execute` never throws or rejects: a grid that is not mounted, a throwing change callback or any input gives `{ ok: false, errors }`.
- The tools read `apiRef.current` only when they run, so they can be created before the grid mounts.

## Related

- [Filtering](filtering.md), [Sorting & Pagination](sorting-pagination.md), [Aggregation & Pivot](aggregation-pivot.md), [Tree Data & Grouping](tree-data-grouping.md): the models the schema describes.
- [API Reference: AI Toolkit](../API_REFERENCE.md)
