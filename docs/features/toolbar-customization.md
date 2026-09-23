# Toolbar Customization

**Available from:** `@opencorestack/opengridx` v1.0.6

Replace individual toolbar controls — search bar, column button, filter button, aggregation button — without replacing the entire toolbar. All panels (columns, filters, aggregation) continue to work; only the trigger elements change.

---

## Quick start

```tsx
import {
  DataGrid,
  GridToolbar,
  type ToolbarButtonRenderProps,
  type ToolbarQuickFilterRenderProps,
} from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      renderQuickFilter: ({ value, onChange }: ToolbarQuickFilterRenderProps) => (
        <input
          className="my-search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search…"
        />
      ),
    },
  }}
/>
```

When the toolbar is mounted through `slots.toolbar`, the grid passes it the filter, column-visibility, aggregation and column-order state and handlers itself, so search, Filters, Columns and Summaries work without any controlled props (v3.0+: the search box and Filters button no longer need `filterModel` / `onFilterModelChange`). Pass `filterModel` + `onFilterModelChange` (and the other controlled pairs) only when you want to own that state.

### Which buttons appear

`GridToolbar` renders a control only when it has the handler it needs. Under `slots.toolbar` the grid supplies these, except for pivot:

| Control | Shown when |
| :--- | :--- |
| Search + Filters | `onFilterModelChange` is present (always under `slots.toolbar`) |
| Columns | `onColumnVisibilityModelChange` is present (always under `slots.toolbar`) |
| Pivot | `onPivotModelChange` is present (under `slots.toolbar`: when `pivotMode`, `pivotModel` or `onPivotModelChange` is set on the grid) |
| Summaries | `onAggregationModelChange` is present (always under `slots.toolbar`; a standalone `<GridToolbar>` without it shows no Summaries button, v3.0+) |

---

## New props on `GridToolbarProps`

| Prop | Type | Description |
|------|------|-------------|
| `renderColumnsButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | Replace the Columns toggle button. The Columns panel still opens and closes normally. |
| `renderFilterButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | Replace the Filters toggle button. The Filter panel still opens and closes normally. |
| `renderAggregationButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | Replace the Summaries toggle button. The Aggregation panel still opens and closes normally. |
| `renderExportButton` | `() => ReactNode` | Insert an Export button after the Aggregation button. No built-in export button exists — this is the slot for it. |
| `renderQuickFilter` | `(props: ToolbarQuickFilterRenderProps) => ReactNode` | Replace the built-in search input with your own component. |
| `className` | `string` | Additional CSS class on the toolbar root `<div>` for theme overrides. |

---

## Render prop types

### `ToolbarButtonRenderProps`

```ts
interface ToolbarButtonRenderProps {
  onClick: () => void;   // toggle the panel
  isOpen: boolean;       // whether the panel is open
  activeCount: number;   // hidden columns / applied filters / active aggregations
}
```

### `ToolbarQuickFilterRenderProps`

```ts
interface ToolbarQuickFilterRenderProps {
  value: string;                     // quickFilterValues joined with spaces
  onChange: (value: string) => void; // split on whitespace into quickFilterValues terms
}
```

Both types are exported from the package. `slotProps.toolbar` is typed as `Record<string, unknown>`, so annotate render-prop parameters with these types (an unannotated `(props) => …` is an implicit `any` under `strict`):

```ts
import type { ToolbarButtonRenderProps, ToolbarQuickFilterRenderProps } from '@opencorestack/opengridx';
```

---

## Examples

### Custom search bar

```tsx
function MySearchBar({ value, onChange }: ToolbarQuickFilterRenderProps) {
  return (
    <div className="search-wrap">
      <SearchIcon />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search…"
      />
      {value && <button onClick={() => onChange('')}>✕</button>}
    </div>
  );
}

slotProps={{
  toolbar: {
    renderQuickFilter: (props: ToolbarQuickFilterRenderProps) => <MySearchBar {...props} />,
  },
}}
```

### Custom filter button with active-count badge

```tsx
function MyFilterBtn({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) {
  return (
    <button
      className={`btn ${isOpen ? 'btn--active' : ''}`}
      onClick={onClick}
    >
      Filters
      {activeCount > 0 && <span className="badge">{activeCount}</span>}
    </button>
  );
}

slotProps={{
  toolbar: {
    renderFilterButton: (props: ToolbarButtonRenderProps) => <MyFilterBtn {...props} />,
  },
}}
```

### Export button wired to `apiRef`

```tsx
import { exportToCsv, useGridApiRef } from '@opencorestack/opengridx';

const apiRef = useGridApiRef();

<DataGrid
  apiRef={apiRef}
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      renderExportButton: () => (
        <button onClick={() => exportToCsv(apiRef.current.getAllFilteredRows(), apiRef.current.getVisibleColumns(), { fileName: 'export.csv' })}>
          Export CSV
        </button>
      ),
    },
  }}
/>
```

### Replacing all buttons at once

```tsx
slotProps={{
  toolbar: {
    renderQuickFilter:       (props: ToolbarQuickFilterRenderProps) => <MySearch {...props} />,
    renderColumnsButton:     (props: ToolbarButtonRenderProps)      => <MyColumnsBtn {...props} />,
    renderFilterButton:      (props: ToolbarButtonRenderProps)      => <MyFilterBtn {...props} />,
    renderAggregationButton: (props: ToolbarButtonRenderProps)      => <MyAggBtn {...props} />,
    renderExportButton:      ()                                     => <MyExportBtn />,
  },
}}
```

### Theme override via `className`

```css
/* your-styles.css */
.toolbar-dark {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border-bottom: none;
  padding: 10px 16px;
}
```

```tsx
slotProps={{
  toolbar: { className: 'toolbar-dark' },
}}
```

---

## How panels stay functional

When you provide a custom button, the toolbar renders your element as the trigger but keeps its own open/close state. The panel (Columns, Filters, or Aggregation) is positioned relative to the wrapper `<div>` surrounding your custom button, so placement is automatic — you don't need to pass any refs.

Panel close behaviour is unchanged: Escape closes every panel, and click-outside closes every panel except the Filter panel, which has an explicit Close button so users can type without it dismissing. However the Columns panel closes, `onColumnsPanelClose` is called.

---

## What is NOT replaced

These built-in features are unaffected regardless of which render props you provide:

- Column panel content (drag-to-reorder, show/hide toggles)
- Filter panel content (operators, values, logic operator)
- Aggregation panel content (per-column function pills)
- Pivot panel (when the Pivot button is shown, see above)
- `children` / `rightContent` slot behaviour
