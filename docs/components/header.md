# `<Header />`

Manages the column headers, sorting triggers, column resizing, and column grouping rows.

## ⚙️ Props

`Header` and its props type `HeaderProps` are exported. The main props:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Column definitions for the visible viewport. |
| `allColumns` | `GridColDef[]` | Every rendered data column in render order (left-pinned, unpinned, right-pinned) with its resolved `width`. Column group rows are laid out over these. Defaults to `columns`. |
| `columnGroupingModel` | `GridColumnGroupingModel` | Hierarchy for multi-level header spanning. |
| `sortModel` | `GridSortItem[]` | Current sorting state for highlight, icons and priority badges. |
| `onSort` | `(field, direction) => void` | Callback triggered on a plain click — replaces the sort model with a single key. |
| `onSortAdd` | `(field, direction) => void` | Callback triggered on Shift+click or when `multiSort` is active — appends/cycles the key without replacing others (an existing key keeps its priority). Also used by the column menu for **Unsort** and for a direction change on an already-sorted column. |
| `multiSort` | `boolean` | When `true`, every click routes to `onSortAdd` instead of `onSort`. Wired from the `multiSort` prop on `<DataGrid>`. |
| `onColumnResize` | `(field: string, newWidth: number) => void` | Callback for manual column width changes. Without it, headers are not resizable. |
| `onHideColumn` / `onPinColumn` / `onManageColumns` | `(field) => void` / `(field, side \| null) => void` / `() => void` | Column menu actions. |
| `pinnedColumns` | `GridColumnPinning` | Coordinates sticky positioning for headers. |
| `checkboxSelection` | `boolean` | Reserves the checkbox column. The "Select All" checkbox is rendered only when `onSelectAll` is also passed (the grid omits it with `disableMultipleRowSelection`). |
| `onSelectAll` | `(isSelected: boolean) => void` | Called by the "Select All" checkbox. |
| `allSelected` / `someSelected` | `boolean` | Checked / indeterminate state of the "Select All" checkbox. |
| `focusedCell` | `{ id: GridRowId \| null; field: string } \| null` | The grid's focus position. `id: null` means the header cell of `field` is focused (v3.0; it used to be the string `'HEADER'`, which a real row id could collide with). DOM focus is moved by the grid, not by `<Header />`. |
| `columnIndexMap` | `Map<string, number>` | Position of each visible data column in render order. Used for `aria-colindex` and the `colIndex` passed to `renderHeader`, so they match the body cells and do not change with horizontal scrolling. |

## ↩️ Wrapped Header Text

By default a header title stays on one line and is cut with an ellipsis. Pass `wrapHeaderText` to `<DataGrid>` (or set `GridColDef.wrapHeaderText` on a column) and long titles wrap instead (v3.3.0+):

```tsx
const columns: GridColDef[] = [
  // Keeps one line with an ellipsis even though the grid wraps
  { field: 'fund', headerName: 'Fund name and share class', wrapHeaderText: false },
  { field: 'nav', headerName: 'Net asset value per share (USD)', width: 120 },
];

<DataGrid rows={rows} columns={columns} wrapHeaderText headerHeight={72} />
```

- **The header keeps `headerHeight`.** It does not grow to fit the title (sticky offsets and virtualization rely on a fixed header height). A wrapped title takes as many lines as fit — 2 at the default 56px, 3 at 72px, 4 at 88px (16px lines inside 8px vertical padding) — and ends in an ellipsis on the last line if it is still longer. Raise `headerHeight` to show more lines. When the column shows an aggregation label under its title, the title gets one line less.
- **Precedence:** a column's `wrapHeaderText` wins over the grid prop, in both directions.
- **Tooltip:** a wrapped header shows its full title as the `title` tooltip, unless the column has a `description`, which is shown instead. Only string titles are used; a `renderHeader` result gets no automatic tooltip.
- **Layout:** the sort icon, the menu button and the resize handle stay where they are and stay clickable; only the title wraps.
- **Auto-size:** double-clicking the resize handle (or `apiRef.current.autosizeColumn`) still measures the title on one line, so the column grows until the title no longer wraps.
- **Class:** wrapped header cells get `ogx__header-cell--wrap`; the line count is set inline as `-webkit-line-clamp` on `.ogx__header-cell-title`.
- **Themes:** the line count assumes the default header font (13px) and cell padding (8px). With a theme that changes `headerFontSize` or `cellPaddingY`, the title is still capped to the header height, but the last visible line may be cut without an ellipsis.
- Column group header rows are not affected.

`Header` takes the same `wrapHeaderText` prop and a `headerHeight` (default 56) when used on its own.

## 📐 Column Grouping

The `<Header />` dynamically calculates the nesting depth of your `columnGroupingModel` and renders one group row per level above the main column headers. Group cells are sized from `allColumns`, so they match their member columns' resolved widths; cells over pinned columns are sticky. See [Column Group Headers](../API_REFERENCE.md#️-column-group-headers) for the full behaviour.

```tsx
const columnGroupingModel = [
  {
    groupId: 'internal',
    headerName: 'Internal Details',
    children: ['id', 'path'],
  }
];
```

## 🖱️ Column Menu & Resizing

Unless `disableColumnMenu` is set to `true` in a column's `GridColDef`, each header cell renders a menu icon. In addition, the header facilitates manual [Column Resizing](column-resize.md).

Clicking the menu icon opens a popover with actions to:
- Sort Asc/Desc/Unsort (acts on that column only; other sort keys are kept)
- Pin Left/Right/None (left out for columns with `pinnable: false`)
- Hide Column (left out for columns with `hideable: false`)
- Manage Columns (opens the toolbar's Columns panel when `slots.toolbar` renders `GridToolbar`, otherwise the standalone [Visibility Panel](column-visibility.md))

**Keyboard** (v3.0): with a header cell focused, **Alt+ArrowDown** or **Ctrl+Enter** / **Cmd+Enter** opens its menu. Focus moves to the first item (also when the menu is opened with the mouse); **ArrowUp** / **ArrowDown** / **Home** / **End** move between items, and **Escape**, **Tab** or choosing an item closes the menu and returns focus to the header cell. See [Keyboard & Accessibility](../features/keyboard-navigation.md).

**Alt+ArrowRight** / **Alt+ArrowLeft** on a focused header widen / narrow its column by 10px (**Shift** for 50px), unless the column has `resizable: false`.

**Drag-reorder**: unpinned headers are draggable. Pinned headers (and the row-grouping column) are not, and are not drop targets.

## ♿ Accessibility

- Header rows carry `aria-rowindex` (column-group rows first). Header cells carry `aria-colindex`, matching the body cells of the same column; the system columns (reorder, detail-panel toggle, select-all) come first and are focusable from the keyboard.
- Only the primary sort column has `aria-sort="ascending"` / `"descending"`; other sortable headers have `aria-sort="none"`. With multi-sort each sorted header also has an `aria-description` such as "Sorted descending, sort priority 2 of 2".
