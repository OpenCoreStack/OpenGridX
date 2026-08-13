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

`GridToolbar` automatically hides buttons for features whose callbacks are not wired. For example, if you don't pass `onFilterModelChange` the search bar and filter button are not rendered.

---

## `GridToolbarProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `GridColDef[]` | `[]` | Column definitions (injected automatically when used via `slots`). |
| `baseColumns` | `GridColDef[]` | — | Pre-pivot column definitions, used by the Pivot panel to avoid showing synthetic columns. |
| `aggregationModel` | `GridAggregationModel` | `{}` | Current aggregation configuration. |
| `onAggregationModelChange` | `(model) => void` | — | Called when the user changes aggregation settings. |
| `pivotModel` | `GridPivotModel` | — | Current pivot configuration. |
| `onPivotModelChange` | `(model) => void` | — | Called when the user changes pivot settings. Presence of this prop shows the Pivot button. |
| `filterModel` | `GridFilterModel` | — | Current filter model. Presence of this prop shows the search bar and Filter button. |
| `onFilterModelChange` | `(model) => void` | — | Called when the user changes filters or the search query. |
| `columnVisibilityModel` | `Record<string, boolean>` | `{}` | Current column visibility state. |
| `onColumnVisibilityModelChange` | `(model) => void` | — | Called when the user shows/hides columns. Presence shows the Columns button. |
| `onColumnReorder` | `(from, to) => void` | — | Called when the user drags a column in the Columns panel. |
| `onColumnOrderReset` | `() => void` | — | Called when the user clicks "Reset order" in the Columns panel. |
| `forceColumnsOpen` | `boolean` | — | When `true`, opens the Columns panel immediately (used internally by the column header menu). |
| `onColumnsPanelClose` | `() => void` | — | Called when the Columns panel closes after a `forceColumnsOpen`. |
| `children` | `ReactNode` | — | Content rendered in the **left** side of the toolbar (before the spacer). |
| `rightContent` | `ReactNode` | — | Content rendered in the **right** side of the toolbar (after all built-in buttons). |
| `className` | `string` | — | Additional CSS class applied to the toolbar root `<div>`. Use for visual overrides without replacing the component. |
| `style` | `CSSProperties` | — | Inline style applied to the toolbar root `<div>`. |
| `renderColumnsButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Columns button. The Columns panel still opens and closes normally. |
| `renderFilterButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Filters button. The Filter panel still opens and closes normally. |
| `renderAggregationButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Summaries button. The Aggregation panel still opens and closes normally. |
| `renderExportButton` | `() => ReactNode` | — | Inject an Export button after the Aggregation button. No built-in export button exists — this is the slot for it. |
| `renderQuickFilter` | `(props: ToolbarQuickFilterRenderProps) => ReactNode` | — | Replace the built-in quick-filter search input with your own component. |

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
  value: string;                  // Current search string
  onChange: (value: string) => void; // Call with new string on input change
}
```

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

The custom component receives all `GridToolbarProps` via `slotProps.toolbar`.
