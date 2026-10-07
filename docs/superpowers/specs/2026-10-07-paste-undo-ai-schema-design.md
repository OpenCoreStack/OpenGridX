# Paste, undo/redo and AI toolkit part 1 — design (3.4.0)

Status: **draft for review** · Target: 3.4.0 (20 Nov 2026) · Roadmap: `docs/roadmap.md` → Q4 2026 · Builds on: `2026-10-01-cell-range-selection-design.md` (3.3.0)

Three features in one release. They share one foundation: a **batch edit**, meaning a set of cell changes committed together through the existing `valueSetter` → `processRowUpdate` → store pipeline. Paste and Delete produce batch edits, and undo/redo replays them. The AI toolkit is independent and ships as a separate entry point.

## Part A — the batch edit (internal foundation)

A single-cell edit today goes `buildEditedRow` (applies `valueSetter`) → `processRowUpdate(newRow, oldRow)` → `replaceRow` (`lib/hooks/features/useGridEditing.ts`). A batch edit runs the same steps once per **row**, not once per cell:

1. Group the changes by row id.
2. For each row: apply every changed field with `buildEditedRow`, in column order, then call `processRowUpdate(newRow, oldRow)` **once**.
3. Rows run in parallel. One rejected or throwing row does not stop the others; failures are reported per row.
4. Rows that succeed are stored in **one** state update (new internal `replaceRows(Map<id, row>)`), so a 500-row paste is a single re-render, not 500.
5. The result is a `GridBatchEditResult`: `{ updated: GridRowId[]; failed: { id, error }[]; skipped: { id, field, reason }[] }`.

Lives in a new `lib/hooks/features/useGridBatchEdit.ts`, which reuses the error containment and `report` path of `useGridEditing`, including `onProcessRowUpdateError` per failed row. It needs no public API of its own; paste, clear and undo call it.

## Part B — clipboard paste

**When it's on:** with `cellSelection` and at least one editable column. `disableClipboardPaste` turns it off (decision 1).

**Gesture:** Ctrl/Cmd+V while focus is in the grid and no editor is open (an open editor keeps native paste into its input). The grid reads the `paste` event's `clipboardData` (`text/plain`), so no clipboard permission prompt is needed.

**Where values land:**

| Clipboard | Selection | Result |
| :--- | :--- | :--- |
| One value | One cell | That cell |
| One value | A range | Every cell of the range (Excel's "fill selection") |
| A block | One cell | The block, starting at the anchor and extending right and down |
| A block | A range | The block from the range's top-left; cells past the range or past the last row or column are dropped, and no rows are created |

After the paste, the selection becomes the pasted area, so the user sees what changed and one Ctrl+Z covers it.

**Parsing (TSV → typed values).** Text is split as Excel and Sheets write TSV: tabs between columns, `\r\n` or `\n` between rows, and quoted fields may contain tabs, newlines and doubled quotes. This is the reverse of `escapeTsvField`. A trailing empty line is ignored. Each cell is then parsed for its column:

| Column type | Accepted | Otherwise |
| :--- | :--- | :--- |
| `string` (default), `image` | Text as is (an `image` column takes the URL) | — |
| `number` | `1234.5`, `1,234.5`, `-12`, `12%` (→ 0.12), currency symbols and spaces stripped | skipped, reason `'invalidValue'` |
| `date` | ISO `2026-10-07`, plus what `Date.parse` accepts | skipped |
| `boolean` | `true`/`false`, `yes`/`no`, `1`/`0`, and the grid's own `localeText` labels (case-insensitive) | skipped |
| `singleSelect` | An option value, or an option label, case-insensitive | skipped |
| An empty cell | `null` for number/date/boolean/singleSelect, `''` for string | — |

A new `GridColDef.valueParser(text, { row, field, colDef })` replaces the default per column, for locales such as `1.234,5` or custom codes. Throws are contained and the cell is skipped.

**Skipped without error:** non-editable cells (`editable` false or `isCellEditable` false), synthetic rows (group headers, subtotals, auto-parents, Grand Total), and system columns.

**Events:**
- `onClipboardPaste?(result: GridBatchEditResult & { text: string })` fires after every paste, so the app can show "12 cells pasted, 2 skipped".
- `onBeforeClipboardPaste?(params: { text, anchor }) => boolean | string` can cancel a paste (`false`) or rewrite its text first.

**Limits:**
- A paste above 10,000 cells shows a development warning.
- Pasting into rows on another page or inside collapsed groups is not possible, because a range only covers displayed rows.

**API:** `apiRef.pasteText(text, anchor?)` runs the same logic without a keyboard event, for toolbar "Paste" buttons that read the clipboard themselves.

## Part C — clear with Delete

With `cellSelection` on and a range of more than one cell, **Delete / Backspace** empties every editable cell in the range: `null`, or `''` for strings. This is one batch edit, so one undo. On a single cell, Delete keeps today's behaviour; nothing is bound today, so it starts an edit if typing does. `disableClipboardPaste` does not affect it. Clearing has its own switch, `disableRangeClear`.

## Part D — undo / redo

**Opt-in:** `undoRedo?: boolean | { limit?: number }`, default off, limit 100 actions (decision 2).

**What is recorded:** each committed action is a list of `{ id, field, before, after }`:

| Action | Recorded |
| :--- | :--- |
| A single-cell edit | 1 change |
| A paste or a range clear | Every cell that was actually written (skipped cells are not recorded) |
| Values `processRowUpdate` changed itself (e.g. a recomputed `total`) | Not recorded. Only the fields the user changed are; the app's recomputation runs again on undo |

An action is recorded **only after** `processRowUpdate` succeeded, with `after` read from the stored row through `getCellValue`. A failed row is not recorded, so history never claims a change the app rejected.

**Undo** applies the `before` values as a new batch edit, so `valueSetter` and `processRowUpdate` run as for any edit, and the app persists the undo the same way it persists edits. **Redo** applies `after`. A new action after an undo clears the redo stack.

**Stale entries** (decision 4): if a cell's current value no longer equals its recorded `after` (the row was edited elsewhere, or the `rows` prop brought new data), that cell is **skipped** on undo, with reason `'changed'`, and the rest of the action still applies. Values are compared, not row object identity, so a consumer that re-fetches rows after saving keeps a working history. A row that no longer exists is skipped with reason `'missing'`.

**Keys:**
- Ctrl/Cmd+Z undo.
- Ctrl/Cmd+Shift+Z and Ctrl+Y redo.
- Only while focus is in the grid and no editor is open (inside an editor, the input's native undo wins).
- After undo/redo, the affected cells become the selection and the first one is scrolled into view.

**API:** `apiRef.undo()`, `redo()`, `canUndo()`, `canRedo()`, `clearHistory()`, all returning a promise of `GridBatchEditResult` where relevant. `onHistoryChange?({ canUndo, canRedo, size })` lets a toolbar enable or disable its buttons.

**Not undoable:** sorting, filtering, column changes, row reordering, row selection. These are view state, not data, as in Sheets.

## Part E — AI toolkit part 1 (`@opencorestack/opengridx/ai`)

A new entry point with **no dependencies and no AI SDK**. Importing the core package never loads it.

```ts
import { getGridAiSchema, validateGridAiState } from '@opencorestack/opengridx/ai';

const schema = getGridAiSchema(columns, { include: ['filter', 'sort', 'grouping', 'aggregation'] });
// → send { prompt, schema, currentState } to the app's own model with structured output
const { state, errors } = validateGridAiState(modelOutput, columns);
// → show `errors`, apply `state` (e.g. setFilterModel / setSortModel / rowGroupingModel)
```

**`getGridAiSchema(columns, options?)`** returns a JSON Schema (draft 2020-12) object with `schemaVersion: 1` and an optional property for each part:

| Part | Shape | Constraints taken from the columns |
| :--- | :--- | :--- |
| `filterModel` | `GridFilterModel`, including nested AND/OR groups (depth limited to 3) and `quickFilterValues` | `field` enum of `filterable` columns; per-column operator enum from `getOperatorsForType`; `value` typed by column type (number, ISO date string, boolean, `valueOptions` enum) |
| `sortModel` | `GridSortItem[]` | `sortable` fields |
| `rowGroupingModel` | `string[]` | `groupable` fields |
| `aggregationModel` | field → function | fields with `type: 'number'` (plus `count` for any), honouring `availableAggregationFunctions` |
| `pivotModel` | `GridPivotModel` | as above |
| `columnVisibilityModel` | field → boolean | `hideable` fields |

- `options.include` and `options.exclude` choose parts.
- `options.descriptions` (default true) puts each column's `headerName` and `description` into the schema, so the model can map "revenue" to `amt_usd`.
- **No row data is ever read.** `options.examples` is opt-in per column, as `GridColDef.aiExamples?: unknown[]`, and documented as real data being sent.
- Per-operator `value` typing uses a `oneOf` per field, which the main structured-output APIs accept.
- The schema is memoisable: same columns, same schema.

**`validateGridAiState(json, columns, options?)`** returns `{ state, errors }`:
- `json` may be an object or a JSON string; a string is parsed, and bad JSON gives one error and an empty state.
- Unknown parts, unknown fields, wrong operators for the column type, and invalid enum values are **dropped**, each with an error `{ path, message }`.
- Values are coerced to the column type, using the same parsers as paste (Part B), so `"1,200"` becomes `1200` and `"2026-10-07"` becomes a date.
- A filter group left empty after dropping is removed.
- It never throws, and never returns a field the columns don't allow. This is the safety layer the roadmap requires ("model output is always validated").

**Packaging:**
- `vite.config.lib.js` gets a second entry, so `dist/ai.es.js` and `dist/ai.cjs.js` are built with their `.d.ts`.
- `package.json` `exports` adds `"./ai"`.
- `check-bundle` asserts that `ai` imports nothing from React and that the core bundle does not include it.
- Budget: `ai` ≤ 5 KB gzipped.
- The smoke suite imports it in both fixtures, which also proves the `exports` map works for real consumers.

## Wiring and hook order

| Piece | Where |
| :--- | :--- |
| Batch edit | `useGridBatchEdit` (features), created next to `useGridEditing`, sharing its error path |
| Paste and clear | `useGridClipboardPaste` (core), after `useGridCellSelectionApi`. It listens for `paste` on the grid root, and for Delete via `useGridKeyboardNavigation`'s existing `cellSelection.keyboard` hook-up |
| Parsers | `lib/utils/parsing.ts` (TSV reader + per-type parsers), shared with `/ai` |
| History | `useGridUndoRedo` (core), after `useGridClipboardPaste`. It wraps the commit paths of `useGridEditing` and `useGridBatchEdit` through an `onCommitted(changes)` callback and installs the API |
| AI | `lib/ai/index.ts` (schema + validator), no React imports |

`docs/architecture/datagrid-orchestration.md` gets the new hooks.

## Tests

- **Unit:**
  - TSV reader: quotes, embedded tabs and newlines, CRLF, trailing line;
  - every parser, valid and invalid;
  - batch edit: partial failure, a single store update, async `processRowUpdate`;
  - paste placement: all 4 table rows, skips, `valueParser`, the events;
  - Delete clear;
  - history: record only on success, the stale `'changed'` and `'missing'` skips, redo cleared by a new action, the limit, the `onHistoryChange` sequence;
  - schema snapshot per column set; validator fuzz over 200 random malformed inputs, which must never throw or leak a disallowed field;
  - nothing changes with the new props off, guarded by the existing suites unmodified.
- **Browser (3 engines):**
  - a real paste event of an Excel-style block;
  - Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y;
  - native undo inside an open editor still works;
  - the selection after paste and undo.
- **Smoke:** a `paste` scenario (paste, undo, redo) and an `ai` import check in both fixtures.
- **Performance:** pasting 10,000 cells is one store update and finishes under 300 ms in Chromium, measured in a browser test.

## Docs and demos (one demo page per feature)

- **Demo page `/clipboard-paste`, "Paste from Excel":** an editable inventory grid with a sample TSV block to copy, the `onClipboardPaste` summary, `valueParser` for European numbers, and skipped-cell reasons shown.
- **Demo page `/undo-redo`, "Undo & Redo":** an editable grid with undo/redo toolbar buttons driven by `onHistoryChange`, plus a history list.
- **Demo page `/ai-schema`, "AI: Grid Schema & Validator":** the generated schema for the demo columns, and a textarea to paste model output (examples included) that shows the validated state and errors live and applies it to the grid. No AI service is called; the demo shows the developer's integration point.
- **Guides:** `docs/features/clipboard.md` (paste section), new `docs/features/undo-redo.md` and `docs/features/ai-toolkit.md`, with the wiki `SECTIONS` updated.
- **References:** API reference, keyboard table, CHANGELOG and `llms.txt`.

## Decisions needed

1. **Paste on by default with `cellSelection`?** Proposal: yes, for editable columns (they already go through `processRowUpdate`), with `disableClipboardPaste` to opt out. Alternative: a separate opt-in `clipboardPaste` prop. That is safer for 3.3.0 adopters, but it's one more prop to discover.
2. **Undo/redo opt-in?** Proposal: yes, `undoRedo` defaults to off. Apps may already bind Ctrl+Z, and undo writes data through `processRowUpdate`.
3. **One `processRowUpdate` per row?** Proposal: yes, rows in parallel. A future `processRowsUpdate(batch)` for one server round-trip is noted for later.
4. **Stale undo entries?** Proposal: skip the changed cells and apply the rest. Alternative: refuse the whole action if any cell changed.
5. **Delete clears a range?** Proposal: yes, in this release, since it is a batch edit and undoable. Alternative: wait for 3.5.0.
