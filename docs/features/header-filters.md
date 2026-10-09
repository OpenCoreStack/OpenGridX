# Header Filters

*Since v3.5.0*

A filter row under the column headers, as in Excel's AutoFilter row: each column gets a small control (a text box, a number or date box, or a select), an operator button and a clear button. It reads and writes the grid's one `filterModel`, so the [filter panel](../components/filter-panel.md), the quick filter, `apiRef.setFilterModel` and server-side filtering keep working alongside it.

```tsx
import { DataGrid } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  headerFilters
  height={500}
/>
```

The row is off unless `headerFilters` is set. Without it the grid renders and behaves exactly as before.

## Controls per column type

| Column `type` | Control | Starting operator |
| :--- | :--- | :--- |
| `string` (default) | text box (`Input`) | `contains` |
| `number` | text box (`Input`, decimal keyboard on touch devices) | `=` |
| `date` | date box (`Input type="date"`) | `is` |
| `boolean` | select: Any / Yes / No | `is` |
| `singleSelect` | select of `valueOptions` (Any + every option) | `is` |
| `image` | none (empty cell) | — |

- The **operator button** left of the box shows the current operator as a symbol (`∋` contains, `=`, `≥`, `≠` …) and opens a menu of the operators the column type allows (the same list as the filter panel). `isEmpty` / `isNotEmpty` need no value: the box is replaced by the operator's name.
- The **clear button** (×) appears while the column has a filter and removes it.
- Typing is **debounced by 300 ms**, as in the filter panel. Selects apply at once. Typing that is still waiting is committed if the column scrolls out of the render window or the row is turned off.
- A `singleSelect` column without `valueOptions` gets a text box.

### Column options

| `GridColDef` field | Description |
| :--- | :--- |
| `headerFilter?: boolean` | `false` leaves the column's cell empty. Columns with `filterable: false` and `type: 'image'` have no control either. |
| `headerFilterOperator?: GridFilterOperator` | The operator a new filter starts with, instead of the type's default (for example `'>='` for amounts, `'startsWith'` for codes). |

### Grid props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `headerFilters` | `boolean` | `false` | Renders the filter row. |
| `headerFilterHeight` | `number` | `40` | Height of the filter row in pixels (sets `--ogx-header-filter-height`). |

## One shared filter model

The row does not keep a model of its own. Each cell **owns one root-level item**, the one with `id: 'header:<field>'`:

```ts
// After typing "glo" under Customer and choosing "≥ 100" under Total:
{
  items: [
    { id: 'header:customer', field: 'customer', operator: 'contains', value: 'glo' },
    { id: 'header:total', field: 'total', operator: '>=', value: '100' },
  ],
}
```

- A cell adds its item at the end of `items`, updates it in place and removes it when cleared. Every other item and group, `logicOperator` and `quickFilterValues` pass through untouched.
- Values are stored as the filter panel stores them: typed text as a string (number operators parse it), dates as `YYYY-MM-DD`, booleans as `true` / `false`, `singleSelect` values as the option's `value` (a one-item list for `isAnyOf`).
- The filter panel shows and edits the same item: it edits the first root item of each column and keeps its `id`, so a header filter changed in the panel is still the header filter.
- An item with an empty value does not filter. An empty box with the starting operator removes the item; with another operator the item stays, so the chosen operator is kept while the value is retyped.

### Models the row cannot show

The row never rewrites a model it cannot represent. A cell shows a read-only **"Custom filter"** label instead of its control when:

- the root `logicOperator` is `'or'` (every cell: adding an item would widen the OR);
- the column's field appears inside a filter group;
- the column has a root item that is not `header:<field>` (one added by the filter panel, `apiRef`, an AI assistant or your own code), or more than one root item.

With a built-in `GridToolbar` in `slots.toolbar`, the label is a button that opens the toolbar's filter panel, where the condition can be edited. Without one it is plain text. Clearing the model (the panel's *Clear all*, `setFilterModel({ items: [] })`) brings the controls back.

## Server-side filtering

With `filterMode="server"` the grid does not filter rows itself; header filter changes reach `onFilterModelChange` (or the `dataSource`'s `getRows`) like any other filter change. Items are tagged `header:<field>`, which the server can ignore.

```tsx
<DataGrid
  rows={pageRows}
  columns={columns}
  headerFilters
  filterMode="server"
  filterModel={filterModel}
  onFilterModelChange={(model) => { setFilterModel(model); refetch(model); }}
/>
```

## Keyboard and screen readers

The filter row is a header row (`role="row"`) between the column headers and the first data row. Its cells are `role="columnheader"`, labelled **"Filter &lt;header name&gt;"**, with the same `aria-colindex` as their column; `aria-rowcount` and the rows' `aria-rowindex` count it.

| Key | On a filter cell |
| :--- | :--- |
| ArrowDown on a column header | Moves to that column's filter cell |
| ArrowDown / ArrowUp | First data row / the column header |
| ArrowLeft / ArrowRight, Home / End | Along the filter row |
| Enter or Space | Focuses the cell's control ("Custom filter": opens the filter panel) |
| Typing a character | Starts a new value in the text box (text and number columns) |
| Alt+ArrowDown or Ctrl/Cmd+Enter | Opens the operator menu (arrows move, Enter picks, Escape closes) |
| Delete / Backspace | Clears the column's filter |

Inside a control, arrow keys edit the text (or move through a select) and do not move the grid's focus, as in a cell editor. **Escape** returns focus to the filter cell. **Tab** leaves the grid: the grid stays a single Tab stop and every control in the row has `tabIndex={-1}`.

## Layout

- The row sits inside the sticky header block (`.ogx__header-wrap`), under any column group rows and the column header row, so it stays at the top while rows scroll.
- Each cell takes its column's width, flex and sticky offset from the same calculation as the column header, so filter cells line up with their columns with pinned columns, column virtualization and horizontal scrolling.
- Scrolling a row into view (keyboard navigation, `apiRef.scrollToIndexes`, cell range auto-scroll) measures the sticky header, so rows are never left under the taller header.
- With `pivotMode` active the row is not rendered: pivot columns are generated and are not the fields the filter model names.

## Styling

| Class | Element |
| :--- | :--- |
| `ogx__header-filter-row` | The row |
| `ogx__header-filter-cell` | Every cell, plus `--focused`, `--active` (has a filter), `--custom` ("Custom filter"), `--empty` (no control), `--system` (under the checkbox, expand and reorder columns), `--pinned`, `--pinned-left`, `--pinned-right`, `--pinned-left-last`, `--pinned-right-first` |
| `ogx__header-filter-operator` | The operator button (`--open` while its menu is open) |
| `ogx__header-filter-menu` | The operator menu (also `ogx-column-menu`, so it looks like the column menu) |
| `ogx__header-filter-input-wrapper` / `ogx__header-filter-input` | The `Input` wrapper and its `<input>` |
| `ogx__header-filter-select` | The boolean and `singleSelect` select |
| `ogx__header-filter-operator-label` | The operator name shown for `isEmpty` / `isNotEmpty` |
| `ogx__header-filter-clear` | The clear button |
| `ogx__header-filter-custom` | The "Custom filter" label or button |

The row uses the header's theme variables (`--ogx-grid-header-background`, `--ogx-grid-border-color`, `--ogx-grid-header-text`, `--ogx-grid-header-hover-background`) and the shared input variables, so every built-in theme and dark mode style it without new variables. `--ogx-header-filter-height` holds its height.

## See also

- [Filtering & Search](filtering.md) — operators, AND/OR groups and the quick filter
- [Filter Panel](../components/filter-panel.md)
- [Keyboard & Accessibility](keyboard-navigation.md)
- Demo: *Header Filters* (`/header-filters`)
