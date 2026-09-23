# `<Header />`

Manages the column headers, sorting triggers, column resizing, and column grouping rows.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Column definitions for the visible viewport. |
| `allColumns` | `GridColDef[]` | Every rendered data column in render order (left-pinned, unpinned, right-pinned) with its resolved `width`. Column group rows are laid out over these. Defaults to `columns`. |
| `columnGroupingModel` | `GridColumnGroupingModel` | Hierarchy for multi-level header spanning. |
| `sortModel` | `GridSortModel` | Current sorting state for highlight and icons. |
| `onSort` | `(field, direction) => void` | Callback triggered on a plain click — replaces the sort model with a single key. |
| `onSortAdd` | `(field, direction) => void` | Callback triggered on Shift+click or when `multiSort` is active — appends/cycles the key without replacing others (an existing key keeps its priority). Also used by the column menu for **Unsort** and for a direction change on an already-sorted column. |
| `multiSort` | `boolean` | When `true`, every click routes to `onSortAdd` instead of `onSort`. Wired from the `multiSort` prop on `<DataGrid>`. |
| `onColumnResize` | `Function` | Callback for manual column width changes. |
| `pinnedColumns` | `GridColumnPinning` | Coordinates sticky positioning for headers. |
| `checkboxSelection` | `boolean` | Renders the "Select All" checkbox. |
| `focusedCell` | `{ id: GridRowId \| null; field: string } \| null` | The grid's focus position. `id: null` means the header cell of `field` is focused (v3.0; it used to be the string `'HEADER'`, which a real row id could collide with). DOM focus is moved by the grid, not by `<Header />`. |
| `columnIndexMap` | `Map<string, number>` | Position of each visible data column in render order. Used for `aria-colindex` and the `colIndex` passed to `renderHeader`, so they match the body cells and do not change with horizontal scrolling. |

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
