# Context Menu

`contextMenu` (v3.11) shows a menu of cell actions on right-click, or on Shift+F10 / the Menu key over a focused body cell. It is off by default: until you enable it, the browser's own menu shows as before. Demo: **Context Menu** (`/context-menu`).

```tsx
import { DataGrid, exportToCsv, type GridContextMenuEntry, type GridContextMenuParams } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  cellSelection        // optional: Copy then copies the selected range
  undoRedo             // optional: adds Undo and Redo to the menu
  contextMenu
  getContextMenuItems={(params: GridContextMenuParams<Employee>, defaultItems): GridContextMenuEntry[] => [
    ...defaultItems,
    'divider',
    { id: 'export', label: 'Export CSV', onClick: () => exportToCsv(params.api.getAllFilteredRows(), columns) },
    { id: 'delete', label: 'Delete row', danger: true, onClick: () => removeRow(params.id) },
  ]}
/>
```

## Built-in items

| Item (`id`) | Shown | What it does |
| :--- | :--- | :--- |
| Copy (`'copy'`) | always | Copies the range, or the clicked cell (see below) |
| Copy with headers (`'copyWithHeaders'`) | always | The same, with a header line of `headerName ?? field` |
| Undo (`'undo'`) | with `undoRedo` | `apiRef.undo()`; disabled when there is nothing to undo |
| Redo (`'redo'`) | with `undoRedo` | `apiRef.redo()`; disabled when there is nothing to redo |

There is no divider between the copy items and Undo / Redo.

## `getContextMenuItems(params, defaultItems)`

Called each time the menu opens, with the built-in items, and returns the entries to show: items (`GridContextMenuItem`) and `'divider'` lines.

- **`params`** (`GridContextMenuParams<R>`): `id`, `field`, `row`, `colDef`, `value` (read through `valueGetter`), `rowMeta`, `cellRange` (the current range, `null` without `cellSelection` or with no range) and `api` (the grid API).
- **Item** (`GridContextMenuItem`): `id` (stable key), `label`, `onClick`, `disabled`, `shortcut` (display only, e.g. `'Ctrl+C'`), `icon` and `danger` (styling only).
- **Leading, trailing and consecutive dividers are dropped.** A list with no items (empty, or only dividers) shows no menu, and the browser's own menu is then not suppressed either. Use it to switch the menu off for some cells (a synthetic row, a column).
- **A throwing callback** (or a throwing `onClick`) is contained: the grid falls back to the built-in items (or does nothing for the click) and warns once in development.
- Setting `getContextMenuItems` without `contextMenu` does nothing; in development it warns once.

## Copy semantics

| Where the right-click lands | Focus and range | Copy writes |
| :--- | :--- | :--- |
| Inside the current cell range | Both stay as they are | The range: the same text as Ctrl/Cmd+C. Synthetic rows (group, subtotal, auto-parent) are skipped |
| Elsewhere (or no range) | Focus moves to the cell and the range collapses | The clicked cell |

"Copy with headers" adds a first line of column headers (`headerName ?? field`). A range right-clicked with `cellSelection` keeps its outline, so the menu acts on what the user sees selected.

## Opening and closing

Opens on:

- right-click on a body cell;
- **Shift+F10** or the **Menu** key on a focused body cell (the menu appears at the cell);
- **Ctrl+click** on Apple platforms (macOS, iPadOS).

Keeps the browser menu: column headers, the header filter row, the footer, detail panels, open cell editors, the checkbox, expand and reorder cells, and nested grids.

Closes on: choosing an item, **Escape** or **Tab** (focus returns to the cell), a press outside, grid scroll, window resize, and the row leaving the rendered rows (a filter, a sort, new rows). Arrow keys, Home, End and Enter move through and activate the items.

The menu opens towards the inline end of the pointer and flips to stay inside the window; in a `dir="rtl"` grid it opens towards the inline start.

## API

```ts
apiRef.current.openContextMenu(id, field); // does nothing without `contextMenu`; v3.11
apiRef.current.closeContextMenu();
```

`openContextMenu` scrolls the cell into view and opens the menu on a later animation frame. If the cell is not rendered within a few frames, or its row moved in the meantime (a sort, a filter, new rows), no menu opens. Tests should wait for `role="menu"` rather than expect it at once.

## Locale text

| Key | Default |
| :--- | :--- |
| `contextMenuCopy` | `'Copy'` |
| `contextMenuCopyWithHeaders` | `'Copy with headers'` |
| `contextMenuUndo` | `'Undo'` |
| `contextMenuRedo` | `'Redo'` |
| `contextMenuLabel` | `'Cell actions'` (the menu's `aria-label`) |

Labels you add in `getContextMenuItems` are yours to translate.

## Styling

Public classes: `ogx-context-menu`, `ogx-context-menu__item`, `ogx-context-menu__item--danger`, `ogx-context-menu__item--disabled` and `ogx-context-menu__shortcut`. The menu also carries the column menu's `ogx-column-menu` / `ogx-menu-item` classes and shares its theme tokens (`overlays.*` theme keys), so a theme or CSS aimed at `.ogx-column-menu` styles both.

## Known issues

- On Windows the ContextMenu (Menu) key may also fire the browser's `contextmenu` event on key-up; the grid's menu may then re-open at the same cell.
- Calling `closeContextMenu()` before a pending `openContextMenu` has opened does not cancel it.

## Not covered in v1

- The column header menu (the column menu already has its own button).
- Long-press on touch devices (iOS Safari fires no `contextmenu` event). Call `apiRef.openContextMenu` from your own gesture if you need it.
- Paste and export items. Add them through `getContextMenuItems`, as the demo does for CSV export.

See also [Cell Range Selection](cell-selection.md), [Clipboard](clipboard.md) and [Undo & Redo](undo-redo.md).
