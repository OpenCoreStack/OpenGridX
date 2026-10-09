# Keyboard Navigation & Accessibility

The grid follows the [WAI-ARIA data grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): it is a single Tab stop, and the arrow keys move a focused cell inside it. This page lists the keys, explains how focus behaves, and documents the ARIA structure the grid exposes (v3.0).

## Focus model

- **One Tab stop.** The grid viewport (`role="grid"`) is in the page Tab order. Tabbing in puts focus on the last focused cell, or on the first cell (the select-all header checkbox with `checkboxSelection`, the first column header when there are no rows). While focus is inside the grid the viewport leaves the Tab order, so **Tab** and **Shift+Tab** leave the grid in one press.
- **Tab is not captured** outside edit mode. It moves to the next focusable element in the page, which may be a control you render in a cell (`renderCell`) or inside an expanded detail panel.
- **Focus is remembered.** Leaving the grid (Tab, clicking elsewhere, switching window) keeps the focused cell; coming back restores it. The focus ring is only drawn while the grid has focus and the keyboard is in use.
- **Focus survives virtualization.** When the focused row scrolls out of the render window, focus stays on the grid so keys keep working; the cell gets DOM focus back when it is rendered again. The grid never takes focus back from an element outside it.
- **Rows and columns that disappear.** If the focused row is removed or filtered out, focus moves to the row now at the same position; if the focused column is hidden, to the first visible data column; with no rows left, to the header.
- **Your own controls keep their keys.** Keys pressed in text inputs, textareas, selects and editable content rendered in cells, and anything inside a detail panel, are left to that element. On a button, link or checkbox rendered in a cell, **Enter** and **Space** activate it and the arrow keys still move grid focus.

## Keys

### Cells

| Key | Action |
| :--- | :--- |
| **Arrow keys** | Move one cell. Left/Right wrap to the previous/next row. Up from the first row moves to the header. Merged (spanned) cells count as one cell. |
| **Home** / **End** | First / last column of the row. |
| **Ctrl+Home** / **Ctrl+End** (Cmd on macOS) | First column of the header row / last column of the last row. |
| **PageUp** / **PageDown** | Up / down one page (`pageSize` with pagination, otherwise 10 rows). |
| **Enter** | Editable cell: open the editor. Other cells of a row with children (group row or tree-data parent): expand or collapse it. Other cells: same as clicking the row — fires `onRowClick` and toggles selection unless `disableRowSelectionOnClick`. |
| **Alt+ArrowRight** / **Alt+ArrowLeft** | Tree data / row grouping: expand / collapse the focused row. |
| **Shift+Space** | Select or deselect the focused row (when rows can be selected: `checkboxSelection`, or click selection not disabled). Synthetic group rows are not selectable. |
| **Space** | On the row checkbox: toggle the row. On the detail-panel toggle: expand or collapse the panel. Elsewhere it does nothing (it never scrolls the grid). |
| **Ctrl+A** (Cmd+A) | Select every row, when several rows can be selected. With `cellSelection`: select every data cell of the page instead. |
| **Ctrl+C** (Cmd+C) | Copy the selected rows (see [Clipboard](clipboard.md)). With `cellSelection`: copy the cell range, or the focused cell. |

With [`cellSelection`](cell-selection.md) on (v3.3), on a data cell:

| Key | Action |
| :--- | :--- |
| **Shift+Arrow keys** | Extend the cell range by one cell. Unlike plain arrows they do not wrap to the next row. Focus stays on the anchor. |
| **Shift+Home** / **Shift+End** | Extend to the first / last column of the row. |
| **Ctrl+Shift+Home** / **Ctrl+Shift+End** (Cmd on macOS) | Extend to the first / last cell of the page. |
| **Shift+PageUp** / **Shift+PageDown** | Extend one page up / down. |
| **Escape** | Collapse the range to the anchor (when not editing). |
| **Ctrl+V** (Cmd+V) | Paste tab-separated text into the editable cells from the range's top-left cell (v3.4, see [Clipboard](clipboard.md#-paste-from-excel-and-google-sheets-v34)). Off with `disableClipboardPaste`. |
| **Delete** / **Backspace** | On a range of more than one cell: empty its editable cells in one edit (v3.4). Off with `disableRangeClear`. |

With `undoRedo` on (v3.4, see [Undo & Redo](undo-redo.md)), while focus is on a cell and no editor is open:

| Key | Action |
| :--- | :--- |
| **Ctrl+Z** (Cmd+Z) | Undo the last edit, paste or range clear. |
| **Ctrl+Shift+Z** (Cmd+Shift+Z) or **Ctrl+Y** | Redo. |

Inside an open editor these keys belong to the input (its own paste and undo).

A plain arrow key after a range collapses it to the newly focused cell. Shift+Space still selects the row.

Arrow, Home/End, PageUp/PageDown and Space are always consumed, so the viewport does not scroll natively when focus cannot move further.

### While editing

| Key | Action |
| :--- | :--- |
| **Enter** | Commit. |
| **Escape** | Cancel. |
| **Tab** / **Shift+Tab** | Commit and open the next / previous editable cell (checkbox, expand and reorder columns are skipped). With no editable cell left, focus leaves the grid and the edit commits. |

When an edit ends, focus returns to the edited cell unless you moved it elsewhere.

### Column headers

| Key | Action |
| :--- | :--- |
| **Enter** / **Space** | Sort the column (asc → desc → none), replacing the sort model; with `multiSort`, or with **Shift** held, the column is added to (or updated or removed from) the sort model instead, as a header click or shift-click does. On the select-all header: select or clear all rows. |
| **Alt+ArrowDown** or **Ctrl+Enter** (Cmd+Enter) | Open the column menu. |
| **Alt+ArrowRight** / **Alt+ArrowLeft** | Widen / narrow the column by 10px (with **Shift**: 50px). Not for `resizable: false` columns. |
| **ArrowDown** | Move to the first row; with `headerFilters`, to the column's filter cell. |

In the column menu, **ArrowUp** / **ArrowDown** / **Home** / **End** move between items, **Enter** / **Space** choose one, and **Escape** or **Tab** closes the menu. Focus returns to the column header.

### Header filter row

With `headerFilters` (v3.5, see [Header Filters](header-filters.md)) the filter row sits between the column headers and the first row. Its cells are navigation stops like any other cell:

| Key | Action |
| :--- | :--- |
| **ArrowDown** / **ArrowUp** | To the first row / back to the column header. Arrow keys from the first row go up to the filter row. |
| **ArrowLeft** / **ArrowRight**, **Home** / **End** | Along the filter row. |
| **Enter** / **Space** | Focus the cell's text box or select. On "Custom filter": open the toolbar's filter panel. |
| Typing a character | Start a new value in the text box (text and number columns). |
| **Alt+ArrowDown** or **Ctrl+Enter** (Cmd+Enter) | Open the operator menu; it works like the column menu. |
| **Delete** / **Backspace** | Clear the column's filter. |

Inside the text box or select, the arrow keys belong to the control, as in a cell editor. **Escape** returns focus to the filter cell; **Tab** leaves the grid (the controls are not Tab stops).

### List view

In `listView`, focus moves between whole rows instead of cells:

| Key | Action |
| :--- | :--- |
| **Tab** | The list is one Tab stop: it lands on the last focused row (the first row at first). Row checkboxes are not separate Tab stops. |
| **ArrowDown** / **ArrowUp** | Next / previous row. |
| **Home** / **End** | First / last row. |
| **PageDown** / **PageUp** | Ten rows down / up. |
| **Enter** / **Space** | A row with children (tree-data parent, group row): expand or collapse it. Any other row: same as clicking it (`onRowClick`, and click selection unless `disableRowSelectionOnClick`). |
| **Alt+ArrowRight** / **Alt+ArrowLeft** | Expand / collapse the focused parent row. |
| **Shift+Space** | Select or deselect the focused row, when rows can be selected. |

Keys pressed in content your `renderCell` puts in a row (inputs, buttons) are left to that content.

## ARIA structure

| Element | Attributes |
| :--- | :--- |
| Viewport | `role="grid"`, `aria-rowcount`, `aria-colcount`, `aria-multiselectable` (true when several rows can be selected), `aria-busy`. |
| Header rows | `role="row"` with `aria-rowindex`: column-group rows first, then the column header row, then the header filter row (`headerFilters`), whose cells are `role="columnheader"` labelled "Filter &lt;header&gt;". |
| Data rows | `role="row"`, `aria-rowindex` counted across the whole dataset (page 2 continues after page 1; bottom-pinned rows come after every page), `aria-selected`. Tree-data and row-grouping rows add `aria-level`; rows with children add `aria-expanded`. |
| Cells and headers | `aria-colindex`, identical for a header and the body cells below it. The system columns (reorder handle, detail-panel toggle, checkbox) come first. |
| Sorted headers | Only the primary sort column has `aria-sort="ascending"` / `"descending"`; with several sort keys every sorted header also gets an `aria-description` such as "Sorted descending, sort priority 2 of 2". |
| Detail panel | A `role="row"` with one `role="gridcell"` spanning every column (`aria-colspan`). The expand cell has `aria-expanded` and, while open, `aria-controls` pointing at the panel. |

`aria-rowcount` counts the header rows plus top-pinned, centre and bottom-pinned rows; under server-side pagination it uses `rowCount`. `aria-colcount` counts the rendered columns: visible data columns (including the `groupingColDef` column and generated pivot columns) plus the system columns.

`GridCellParams.colIndex` / `GridRenderCellParams.colIndex` (and `renderHeader`'s `colIndex`) are the zero-based position of the column among the **visible data columns in render order** (left-pinned, unpinned, right-pinned). They do not change with horizontal scrolling. `aria-colindex` is `colIndex + 1 +` the number of system columns.
