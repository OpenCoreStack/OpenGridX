# AI assistant, agent tools, header filters and fill handle — design (3.5.0)

Status: **approved 2026-10-09** (decisions taken by the maintainer's delegate; see "Decisions") · Target: 3.5.0, shipped as soon as built · Builds on: 3.3.0 range selection, 3.4.0 batch edits / undo and AI toolkit part 1

Three independent features, built in parallel:

- **A — AI toolkit part 2:** an "ask your table" prompt panel and tools for AI agents
- **B — Header filter row**
- **C — Fill handle**

They share only `lib/types/index.ts`, `DataGrid.tsx` wiring, docs and the CHANGELOG.

## Part A — AI toolkit part 2

### Packaging rule (why the API looks like this)

- The core bundle must contain **no AI code**. `check-bundle` already fails if the `/ai` marker appears in it.
- `/ai` must contain **no React**.

So the work is split:

- **Core:** the prompt panel UI and applying a result. It knows nothing about schemas or models.
- **`/ai`:** everything about models. It builds the schema, calls the app's model, and validates the reply.

### API

```tsx
import { createGridAiPromptHandler, createGridAgentTools } from '@opencorestack/opengridx/ai';

const onPrompt = createGridAiPromptHandler({
  columns,
  // The app's own model call. Receives { prompt, schema, currentState, history }; returns the model's JSON (or text).
  callModel: async (request, { signal }) => (await fetch('/api/grid-ai', { method: 'POST', body: JSON.stringify(request), signal })).json(),
});

<DataGrid columns={columns} rows={rows} aiAssistant={{ onPrompt, suggestions: ['Top 10 by revenue', 'Group by region'] }} />
```

**Core (`DataGridProps.aiAssistant`)**, typed in core with no `/ai` import:

```ts
aiAssistant?: {
  onPrompt: (prompt: string, context: GridAiPromptContext) => Promise<GridAiPromptResult>;
  placeholder?: string;
  suggestions?: string[];          // clickable example prompts
  voice?: boolean;                 // default true: shows a mic button only where SpeechRecognition exists
  parts?: GridAiPart[];            // what the assistant may change; default all the columns allow
};
interface GridAiPromptContext { currentState: GridAiState; history: { prompt: string; applied: GridAiState }[]; signal: AbortSignal }
interface GridAiPromptResult  { state: GridAiState; errors: { path: string; message: string }[]; message?: string }
```

`GridAiState` and `GridAiPart` move from `lib/ai/types.ts` to `lib/types/index.ts`; they're type-only, so they add nothing to the bundle. `/ai` re-exports them, so existing imports keep working.

**Safety brand:** a result is only applied if it carries the brand `Symbol.for('opengridx.ai.validated')`, which `validateGridAiState` sets and `createGridAiPromptHandler` returns. An unbranded result is not applied; the panel shows "The reply was not validated" and a development warning explains why. This turns "always validate before applying" from advice into a rule the grid enforces. Apps writing their own `onPrompt` call `validateGridAiState` themselves, which brands the result.

**`/ai` additions:**
- **`createGridAiPromptHandler({ columns, callModel, parts?, schemaOptions? })`:** builds the schema once, and on each prompt calls `callModel({ prompt, schema, currentState, history }, { signal })`. It parses a JSON string reply, or a code-fenced JSON block inside text, validates with `validateGridAiState`, and returns the branded result. A `callModel` throw or rejection becomes `{ state: {}, errors: [{ path: '', message }] }`. An abort rejects with `AbortError`.
- **`createGridAgentTools(apiRef, columns, options?)`:** returns plain tool objects `{ name, description, inputSchema, execute(input) }`. They have no SDK dependency and work with the Vercel AI SDK, CopilotKit, OpenAI or Anthropic tool calling, and WebMCP (`navigator.modelContext.registerTool`).
  - `get_grid_state` returns the current models and column list.
  - `set_filter`, `set_sort`, `set_grouping`, `set_aggregation` and `set_column_visibility` validate their input with `validateGridAiState` and apply it through `apiRef`.
  - `clear_filters` clears all filters.
  - `get_row_summary` returns the row count plus the first `maxRows` rows (default 20, fields limited to `options.fields`). It exists **only when `options.allowRowAccess: true`**, because it is the one tool that sends row data.
  - Every `execute` returns `{ ok, applied?, errors? }` and never throws.
- **Bundle budget:** raised from 5 KB to **8 KB gzipped**. Part 1 is 4.6 KB; the handler and tools are about 2 KB.

**`GridApi` additions** (needed by both the panel and the tools):
- `setSortModel`, `setRowGroupingModel`, `setAggregationModel`, `setColumnVisibilityModel` and `setPivotModel`;
- `getGridAiState(): GridAiState`, the current models in AI-state shape.

**`rowGroupingModel` becomes a controlled/uncontrolled pair** with a new `onRowGroupingModelChange`. Today it is prop-only, so neither the assistant nor `apiRef` can change grouping. The pair is added to `useGridControlledState` the same way as `aggregationModel`, and a grid that passes `rowGroupingModel` keeps controlling it. v2.0 removed `onRowGroupingModelChange` because nothing called it; now the assistant and `apiRef` do. A CHANGELOG note says so.

### Panel UI and behaviour

- **Opening it:**
  - With `aiAssistant` set, the built-in toolbar shows an **Ask AI** button (sparkle icon, `localeText.aiAssistantButton`). It opens a panel anchored under the toolbar.
  - Without the built-in toolbar, `apiRef.openAiAssistant()` opens it.
  - `slots.aiAssistantPanel` replaces it.
- **Panel contents:**
  - a text input built on the shared `Input`, with Enter to submit;
  - suggestion chips;
  - a mic button when `voice` is on and `SpeechRecognition` exists (never requested on load);
  - a Stop button while a request runs, which aborts the `signal`;
  - a list of previous prompts this session.
- **Applying a result:**
  - The result is applied immediately as **one undoable step**: the previous `GridAiState` is kept, and **Undo** restores it.
  - What changed is shown as removable **chips**: one per filter item, sort key, grouping field, aggregation and visibility change. Removing a chip re-applies the state without that piece.
  - `result.message` is shown as the assistant's reply text.
  - Errors are listed as "Ignored: Unknown field 'revnue'".
  - The panel does not use the 3.4.0 data undo history: view state is not data, as decided in 3.4.0.
- **Accessibility:**
  - The panel is a `role="dialog"` labelled "Ask AI". Focus moves to the input on open and returns to the toolbar button on close.
  - Escape closes the panel.
  - Status ("Thinking…", "Applied 3 changes", errors) goes to the grid's live region.
- **Events:** `onAiAssistantApply?(result)` and `onAiAssistantError?(error)` let apps log or report.

### Demo page

**"AI Assistant"** (`/ai-assistant`) uses a **mock model**: a small rule-based function in the demo that turns about 12 example phrasings into JSON. The page runs with no API key and no network, and is clearly labelled "simulated model". It also shows the real integration code (a `fetch` to the app's endpoint) and a second tab with `createGridAgentTools` driving the grid from a scripted "agent" transcript.

## Part B — Header filter row

- **Turning it on:**
  - `headerFilters?: boolean`, default off, adds a filter row under the column headers.
  - `GridColDef.headerFilter?: false` hides one column's filter cell.
  - `GridColDef.headerFilterOperator?` sets the starting operator.
- **One cell per data column, inside the sticky header,** following pinning and column virtualization:

  | Column type | Control | Default operator |
  | :--- | :--- | :--- |
  | `string` | `Input` | `contains` |
  | `number` | `Input` | `=` |
  | `date` | `Input type="date"` | `is` |
  | `boolean` | select: Any / Yes / No | `is` |
  | `singleSelect` | select of `valueOptions` | `is` |
  | `image` | none | — |

  - A small operator button opens a menu of `getOperatorsForType(type)`.
  - A clear button appears while a value is set.
  - Typing is debounced by 300 ms, as in `FilterPanel`.
- **One shared filter model.** The row reads and writes `filterModel`, and the filter panel, quick filter and AI assistant keep working with it.
  - Each header cell owns the **root-level item for its field, tagged `id: 'header:<field>'`**.
  - If the model's root `logicOperator` is `'or'`, or the field only appears inside nested groups, the cell shows a read-only "Custom filter" label that opens the filter panel. The row never rewrites a model it can't represent.
- **Header height:**
  - `headerFilterHeight` defaults to 40 px.
  - Sticky offsets, `scrollRowIntoView` and the virtualization header height include it.
  - Range auto-scroll (3.3.0) reads the sticky-top height, so it needs no change.
- **Keyboard and ARIA:**
  - The filter row is a header row (`role="row"`), and its cells are `role="columnheader"` with `aria-label="Filter <header name>"`.
  - ArrowDown from a column header moves to its filter cell; ArrowDown again moves into the first data row.
  - Enter or typing focuses the control; Escape returns focus to the cell.
  - Inside the control, arrows edit the text and Tab leaves the grid, as with an editor.
  - The grid stays a single Tab stop.
- **Server mode:** with `filterMode="server"` the model is reported through `onFilterModelChange` as today.
- **Demo page:** **"Header Filters"** (`/header-filters`) is an orders grid covering all five types, with a pinned column, a toggle, and a readout of the shared filter model next to the filter panel.

## Part C — Fill handle

- **Where it appears:** with `cellSelection`, a small square at the bottom-right corner of the range. Dragging it extends the range down, up, right or left (one direction, the larger pointer offset wins), and auto-scrolls like range drag.
- **What it fills.** It fills the new cells from the source range (the original selection):

  | Source | Fill |
  | :--- | :--- |
  | One cell | Copies the value |
  | Two or more numbers (or dates) along the fill direction, equal step | Continues the series (2, 4, 6 → 8, 10; Mon 5 Oct, Tue 6 Oct → Wed 7 Oct) |
  | Anything else | Repeats the source pattern |

  - **Alt** while releasing forces copy instead of series, matching Excel's Ctrl-drag toggle without clashing with the range shortcuts.
  - A built-in `GridColDef.fillValue?(params) => unknown` hook lets a column decide.
- **How it writes:** through the 3.4.0 batch edit (`valueParser` is not involved: values are typed already; `valueSetter` and `processRowUpdate` run per row). Non-editable and synthetic cells are skipped with reasons. It's one undo step, and the range becomes source plus filled cells. `onFill?(result: GridBatchEditResult & { direction })` reports what happened.
- **Keyboard:**
  - **Ctrl/Cmd+D** fills down from the range's top row.
  - **Ctrl/Cmd+R** fills right from its left column, as in Excel.
  - Both only while focus is in the grid and no editor is open; `preventDefault` stops the browser's bookmark and reload.
- **Opting out:** `disableFillHandle` hides the handle and turns off the shortcuts.
- **Styling:** public class `ogx__cell-fill-handle` and variable `--ogx-fill-handle-color`, defaulting to the range border colour.
- **Touch:** the handle has a 24 px hit area. Touch-dragging the handle works, because it doesn't conflict with scrolling.
- **Demo page:** **"Fill Handle"** (`/fill-handle`) is a budget-planning grid with months as columns. It shows series fill for months and amounts, Ctrl+D, undo, and the `onFill` summary.

## Decisions (approved 2026-10-09)

1. **Core holds the panel and `/ai` holds the model logic, connected by `onPrompt`.** This keeps the core bundle AI-free and `/ai` React-free, as the existing bundle checks require. The alternative of bundling the validator into core was rejected because it grows every consumer's bundle.
2. **Only validated results are applied (the brand check).** Advice alone ("validate first") is not enough for a feature that changes what users see.
3. **Assistant results apply immediately, with chips and one-click Undo.** That's one click instead of two, and the chips make every change visible and reversible. The alternative, a preview with a Confirm button, was rejected as friction for the common case. Undo covers mistakes.
4. **Row access in agent tools is off by default.** It's the only path that sends row data to a model.
5. **`rowGroupingModel` becomes a controlled/uncontrolled pair** with `onRowGroupingModelChange`, which the assistant needs. It's additive, so it isn't breaking.
6. **Header filters own only their own tagged root items** and never rewrite a model they can't represent.
7. **Fill handle:** series detection only for numbers and dates with an exactly equal step; Alt forces copy; Ctrl+D and Ctrl+R are included.
8. **`/ai` budget raised to 8 KB gzipped.**

## Definition of done (each part)

- Unit and browser tests in three engines.
- A smoke scenario in both fixtures: `ai-assistant` (with a mock `callModel`), `header-filters`, `fill`.
- A demo page.
- A `docs/features/` guide plus a wiki `SECTIONS` entry.
- API reference, CHANGELOG `[Unreleased]` and `llms.txt` updated.
- Keyboard and screen-reader check.
- No change for grids that don't use the new props, with existing tests unmodified.
- All gates pass, including `check-bundle` (core has no AI code, `/ai` ≤ 8 KB) and the React Compiler rules.
