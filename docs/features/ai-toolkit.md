# AI Toolkit: Grid Schema & Validator

*Since v3.4.0* · Demo: [AI: Grid Schema & Validator](https://opencorestack.github.io/OpenGridX/ai-schema)

Let users drive the grid in plain language ("paid orders over $10k in the North, biggest first") with the model your app already uses. The `@opencorestack/opengridx/ai` entry point gives you the two pieces the grid can own:

- **`getGridAiSchema(columns, options?)`** turns your column definitions into a JSON Schema (draft 2020-12) of the grid state a model may return: filters, sort, row grouping, aggregation, pivot and column visibility, each limited to what the columns allow.
- **`validateGridAiState(json, columns, options?)`** checks the model's reply against the columns and returns the state that is safe to apply, plus a list of what it dropped.

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

The entry point has no React import and no dependencies (about 4.5 kB gzipped). Importing `@opencorestack/opengridx` never loads it, and it works on a server too, so you can validate the reply in the same endpoint that calls the model.

## Privacy rules

- **No row data by default.** The schema is built from column definitions only: `field`, `headerName`, `description`, `type`, the operators of the type, `valueOptions` and the allowed aggregation functions. The grid never reads a row for it.
- **`aiExamples` is real data.** `GridColDef.aiExamples` puts example values into the schema to help the model ("Acme" → `customer`). Those values are sent to the model. List only what you are happy to share; leave it out for anything personal. `options.examples: false` drops all of them.
- **`valueOptions` are sent.** The options of a `singleSelect` column become an `enum` in the schema. If an option list is itself sensitive, mark the column `filterable: false` or pass a copy of the columns without it.
- **Always validate before applying.** Model output is untrusted input. Apply `state`, never the raw reply; show `errors` (or log them) so users can see what was ignored. Show the change to the user and keep it easy to undo.
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

## Related

- [Filtering](filtering.md), [Sorting & Pagination](sorting-pagination.md), [Aggregation & Pivot](aggregation-pivot.md), [Tree Data & Grouping](tree-data-grouping.md): the models the schema describes.
- [API Reference: AI Toolkit](../API_REFERENCE.md)
