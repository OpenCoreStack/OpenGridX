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
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={setColumnVisibilityModel}
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
  value: string;
  onChange: (value: string) => void;
}
```

Both types are exported from the package:

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
    renderQuickFilter: (props) => <MySearchBar {...props} />,
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
    renderFilterButton: (props) => <MyFilterBtn {...props} />,
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
        <button onClick={() => exportToCsv(apiRef.current.getAllRows(), columns, { filename: 'export' })}>
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
    renderQuickFilter:       (props) => <MySearch {...props} />,
    renderColumnsButton:     (props) => <MyColumnsBtn {...props} />,
    renderFilterButton:      (props) => <MyFilterBtn {...props} />,
    renderAggregationButton: (props) => <MyAggBtn {...props} />,
    renderExportButton:      ()      => <MyExportBtn />,
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

Panel close behaviour is unchanged: Escape key closes, click-outside closes (except the Filter panel, which requires an explicit Close button to let users type without it dismissing).

---

## What is NOT replaced

These built-in features are unaffected regardless of which render props you provide:

- Column panel content (drag-to-reorder, show/hide toggles)
- Filter panel content (operators, values, logic operator)
- Aggregation panel content (per-column function pills)
- Pivot panel (if `onPivotModelChange` is wired)
- `children` / `rightContent` slot behaviour
