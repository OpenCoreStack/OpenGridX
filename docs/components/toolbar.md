# `GridToolbar`

The toolbar is an optional component rendered at the top of the grid. It provides global search, column visibility management, advanced filters, aggregation configuration, and pivot mode — all in one composable component.

## Basic usage

```tsx
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={setColumnVisibilityModel}
  aggregationModel={aggregationModel}
  onAggregationModelChange={setAggregationModel}
  slots={{ toolbar: GridToolbar }}
/>
```

`GridToolbar` hides the buttons whose callbacks it does not receive: no `onFilterModelChange`, no search bar and Filters button; no `onColumnVisibilityModelChange`, no Columns button; no `onAggregationModelChange`, no Summaries button; no `onPivotModelChange`, no Pivot button. Mounted through `slots.toolbar`, the grid always passes the filter, column-visibility and aggregation callbacks, and the pivot ones when `pivotMode`, `pivotModel` or `onPivotModelChange` is set, so those buttons show without further props. A standalone `<GridToolbar />` shows only what you wire.

One panel is open at a time. Every panel closes on Escape; the Columns, Summaries and Pivot panels also close on a click outside them. Each trigger button has `aria-haspopup="dialog"` and an `aria-expanded` state.

The Summaries panel lists each aggregable column with the functions it allows: its `availableAggregationFunctions` when set, otherwise every built-in function (`sum`, `avg`, `count`, `min`, `max`, `unique`). Names that are not built-in functions are not offered.

---

## `GridToolbarProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `GridColDef[]` | `[]` | Column definitions (injected automatically when used via `slots`). |
| `baseColumns` | `GridColDef[]` | — | Pre-pivot column definitions. The Pivot panel lists these instead of the generated pivot columns, and the Summaries panel only offers columns that are among them (a summary on a generated pivot column would do nothing). |
| `aggregationModel` | `GridAggregationModel` | `{}` | Current aggregation configuration. |
| `onAggregationModelChange` | `(model) => void` | — | Called when the user changes aggregation settings. Presence of this prop shows the Summaries button. |
| `pivotModel` | `GridPivotModel` | — | Current pivot configuration. |
| `onPivotModelChange` | `(model) => void` | — | Called when the user changes pivot settings. Presence of this prop shows the Pivot button. |
| `filterModel` | `GridFilterModel` | — | Current filter model. |
| `onFilterModelChange` | `(model) => void` | — | Called when the user changes filters or the search query. Presence of this prop shows the search bar and Filters button. |
| `columnVisibilityModel` | `Record<string, boolean>` | `{}` | Current column visibility state. |
| `onColumnVisibilityModelChange` | `(model) => void` | — | Called when the user shows/hides columns. Presence shows the Columns button. |
| `onColumnReorder` | `(from, to) => void` | — | Called when the user drags a column in the Columns panel. |
| `onColumnOrderReset` | `() => void` | — | Called when the user clicks "Reset order" in the Columns panel. |
| `forceColumnsOpen` | `boolean` | — | When it becomes `true`, opens the Columns panel. `DataGrid` sets it for the column menu's **Manage columns**. A `GridToolbar` that receives it from the grid (spread the slot props into it) shows the panel; when no such toolbar is rendered, the grid opens its standalone Columns panel instead. |
| `onColumnsPanelClose` | `() => void` | — | Called whenever the Columns panel closes: its button, a custom `renderColumnsButton`, another panel opening, click-outside or Escape. |
| `showNonHideableColumns` | `boolean` | `false` | Show `hideable: false` columns in the Columns panel as disabled rows. |
| `children` | `ReactNode` | — | Content rendered in the **left** side of the toolbar (before the spacer). |
| `rightContent` | `ReactNode` | — | Content rendered in the **right** side of the toolbar (after all built-in buttons). |
| `className` | `string` | — | Additional CSS class applied to the toolbar root `<div>`. Use for visual overrides without replacing the component. |
| `style` | `CSSProperties` | — | Inline style applied to the toolbar root `<div>`. |
| `renderColumnsButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Columns button. The Columns panel still opens and closes normally. |
| `renderFilterButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Filters button. The Filter panel still opens and closes normally. |
| `renderAggregationButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Summaries button. The Aggregation panel still opens and closes normally. |
| `renderExportButton` | `() => ReactNode` | — | Inject an Export button after the Aggregation button. No built-in export button exists — this is the slot for it. |
| `renderQuickFilter` | `(props: ToolbarQuickFilterRenderProps) => ReactNode` | — | Replace the built-in quick-filter search input with your own component. |
| `onAiAssistantToggle` | `(trigger: HTMLElement \| null) => void` | — | Opens or closes the `aiAssistant` panel. The grid injects it when the `aiAssistant` prop is set; its presence renders the **Ask AI** button (sparkle icon), first in the button row. Focus returns to `trigger` when the panel closes (v3.5). |
| `aiAssistantOpen` | `boolean` | `false` | Whether the AI panel is open: the button's `aria-expanded` (injected by the grid, v3.5). |
| `aiAssistantLabel` | `string` | `'Ask AI'` | The Ask AI button's label; the grid passes `localeText.aiAssistantButton` (v3.5). |

### Ask AI button (v3.5)

With the grid's `aiAssistant` prop set, `GridToolbar` shows an **Ask AI** button that opens the prompt panel under the toolbar (a `role="dialog"` labelled "Ask AI"; Escape closes it and focus returns to the button). Opening it closes any open toolbar panel. A custom toolbar can render its own button: call `onAiAssistantToggle(buttonElement)` from the props the grid passes, or `apiRef.current.openAiAssistant()`. See [AI Toolkit](../features/ai-toolkit.md#ai-assistant-panel).

---

## Render prop types

### `ToolbarButtonRenderProps`

Passed to `renderColumnsButton`, `renderFilterButton`, and `renderAggregationButton`.

```ts
interface ToolbarButtonRenderProps {
  onClick: () => void;     // Toggle the associated panel open/closed
  isOpen: boolean;         // Whether the panel is currently open
  activeCount: number;     // Active items (hidden columns, applied filters, etc.)
}
```

### `ToolbarQuickFilterRenderProps`

Passed to `renderQuickFilter`.

```ts
interface ToolbarQuickFilterRenderProps {
  value: string;                  // Current search string (quickFilterValues joined with spaces)
  onChange: (value: string) => void; // Call with new string on input change
}
```

The toolbar splits the string passed to `onChange` on whitespace, so each word becomes one `quickFilterValues` term and a row matches when every term is found in some visible column (`john london` matches first name John, city London). See [Quick Filter](../features/filtering.md#quick-filter).

---

## Customization patterns

### Add content to left or right sides

Use `children` (left) and `rightContent` (right) to inject elements without touching the built-in buttons:

```tsx
<DataGrid
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      children: <span style={{ fontWeight: 600 }}>My Grid</span>,
      rightContent: (
        <button onClick={handleExport}>Export CSV</button>
      ),
    },
  }}
/>
```

### Custom search bar

Replace only the search input while keeping the rest of the toolbar intact:

```tsx
function MySearchBar({ value, onChange }: ToolbarQuickFilterRenderProps) {
  return (
    <input
      className="my-search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search…"
    />
  );
}

<DataGrid
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      renderQuickFilter: (props) => <MySearchBar {...props} />,
    },
  }}
/>
```

### Custom action buttons (panels still work)

Replace individual trigger buttons while keeping their panels fully functional:

```tsx
function MyFilterButton({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
  return (
    <button
      className={`my-btn ${isOpen ? 'my-btn--active' : ''}`}
      onClick={onClick}
    >
      Filters {activeCount > 0 && <span className="badge">{activeCount}</span>}
    </button>
  );
}

<DataGrid
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      renderFilterButton: (props) => <MyFilterButton {...props} />,
      renderColumnsButton: (props) => <MyColumnsButton {...props} />,
      renderAggregationButton: (props) => <MyAggButton {...props} />,
    },
  }}
/>
```

### Add an Export button

There is no built-in export button in the toolbar. Use `renderExportButton` to add one:

```tsx
import { exportToCsv, useGridApiRef } from '@opencorestack/opengridx';

const apiRef = useGridApiRef();

<DataGrid
  apiRef={apiRef}
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      renderExportButton: () => (
        <button onClick={() => exportToCsv(apiRef.current.getAllRows(), columns)}>
          Export CSV
        </button>
      ),
    },
  }}
/>
```

### Theme override via `className`

Style the toolbar to match your brand without replacing the component:

```css
/* your-styles.css */
.my-toolbar {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 16px;
}
```

```tsx
<DataGrid
  slots={{ toolbar: GridToolbar }}
  slotProps={{ toolbar: { className: 'my-toolbar' } }}
/>
```

---

## Fully custom toolbar

If the render props don't give you enough control, replace the entire toolbar via `slots.toolbar`:

```tsx
function MyToolbar() {
  return (
    <div className="my-toolbar-root">
      <span>Custom toolbar</span>
    </div>
  );
}

<DataGrid slots={{ toolbar: MyToolbar }} />
```

The custom component receives the toolbar props the grid owns (`columns`, `baseColumns`, the filter / visibility / aggregation / pivot models and their change handlers, `onColumnReorder`, `onColumnOrderReset`, `forceColumnsOpen`, `onColumnsPanelClose`) plus `apiRef`, with `slotProps.toolbar` spread over them. Spread them into a `GridToolbar` to keep the built-in buttons:

```tsx
import { GridToolbar } from '@opencorestack/opengridx';
import type { GridToolbarProps } from '@opencorestack/opengridx';

function MyToolbar(props: GridToolbarProps) {
  return <GridToolbar {...props} rightContent={<span>Custom</span>} />;
}
```

`slotProps.toolbar` is typed as `GridToolbarProps` plus any extra keys (v3.0+), so the render props above get their parameter types inferred and a misspelt built-in key with a wrong value type is a type error.
