# Context menu — design note

Status: draft for review (2026-10-26), builder check done. Target: 3.11.0 (additive, no breaking change).

## Intent

A right-click (and keyboard) menu on grid cells, so users can act on the cell, row or range they are looking at
without going to the toolbar, and so consumers can add their own row-level actions ("Open", "Delete", "Export
selection") in one place. It is the first feature after the 2026-10-13 freeze; the user left the scope to me.

## Goals

- Opt-in: `contextMenu` prop. Off by default, so the browser's own menu keeps working for existing consumers.
- Built-in items: **Copy**, **Copy with headers**, and **Undo** / **Redo** when `undoRedo` history exists (see
  "Copy semantics").
- Consumer items through one callback, `getContextMenuItems(params, defaultItems)`, which receives the row,
  column, value, row meta and the current cell range, and returns the full list (it may drop, reorder or wrap the
  defaults).
- Opens from: right-click on a body cell; **Shift+F10** and the **ContextMenu** key on the focused cell.
- Accessible like the existing `ColumnMenu`: `role="menu"`, `menuitem` items, arrow keys / Home / End, Escape and
  Tab close, focus returns to the cell.
- RTL-correct positioning and themable through `--ogx-*` variables.

## Non-goals

- **No built-in Export items.** Exporters are standalone functions; putting them in the menu would pull them into
  the core bundle (86.6 / 92 KB gzip). The docs show how to add them as consumer items.
- **No Paste item.** Reading the clipboard from a menu click needs the async Clipboard API and a permission
  prompt in Chromium (and is not allowed in Firefox for page content). Paste stays on the keyboard shortcut.
- No context menu on the header row, header filters, pinned/aggregation footer or the list view in v1. Header
  right-click keeps the browser menu; the column menu button stays the header's menu.
- No nested submenus in v1 (types leave room: see "Open for the builder").

## Anti-goals

- Re-rendering every row when the menu opens or closes. Menu state lives outside `Row` props (v3.9.0 rule).
- A second copy of the menu keyboard logic. `ColumnMenu`'s navigation, focus-in and focus-return move into a
  shared hook used by both menus.
- Any change to the default look or behaviour when `contextMenu` is not set.

## Public API (decided)

```ts
// lib/types/contextMenu.ts (new domain file, re-exported from types/index.ts)
export interface GridContextMenuParams<R extends GridValidRowModel = GridRowModel> {
  id: GridRowId;
  field: string;
  row: R;
  colDef: GridColDef<R>;
  value: unknown;              // through getCellValue
  rowMeta: GridRowMeta | undefined;
  cellRange: GridCellSelectionModel | null; // null without cellSelection or with no range
  api: GridApi<R>;
}

export interface GridContextMenuItem {
  id: string;                  // stable key; built-ins use 'copy', 'copyWithHeaders', 'undo', 'redo'
  label: string;
  onClick?: () => void;        // contained: a throw is caught and warned once in dev
  disabled?: boolean;
  shortcut?: string;           // display only, e.g. 'Ctrl+C'
  icon?: React.ReactNode;
  danger?: boolean;            // styling only
}
export type GridContextMenuEntry = GridContextMenuItem | 'divider';

// DataGridProps additions
contextMenu?: boolean;
getContextMenuItems?: (
  params: GridContextMenuParams<R>,
  defaultItems: readonly GridContextMenuEntry[],
) => readonly GridContextMenuEntry[];
```

No `onContextMenuOpen` in v1 (my call): `getContextMenuItems` already runs on every open, and a callback is easy
to add later but hard to remove.

- Passing `getContextMenuItems` without `contextMenu` does nothing (dev warning, `useGridDevWarnings`).
- An empty list returned from `getContextMenuItems` means: no menu, browser default not suppressed either.
- Synthetic rows (group, subtotal, auto-parent, pivot Grand Total) get the menu; `params.row` is the synthetic row
  and `rowMeta` tells them apart, as everywhere else.
- Right-click on a cell **inside** the current range keeps the range; outside it, focus moves to that cell and the
  range collapses to it (spreadsheet behaviour; fires `onCellSelectionModelChange` as a click would). Without
  `cellSelection`, focus moves to the cell. Row selection is never changed by right-click. Moving focus re-renders
  the old and new focused rows only (accepted, my call).

### Copy semantics (decided)

- With `cellSelection` and the clicked cell inside a range: Copy = the range, exactly what Ctrl/Cmd+C copies
  (`getCellRangeCopyText`), so synthetic rows are skipped as they are today.
- Otherwise (no `cellSelection`, or the cell was outside the range): Copy = **that one cell's formatted text**.
  It does not copy the selected rows, even though Ctrl+C does without `cellSelection` (user delegated, my call:
  the right-click points at one cell). On a synthetic row the single cell's shown text is copied.
- Copy with headers: the same rows/cells with one header line first, using `headerName ?? field` (my call). This
  needs a header option in `buildRangeTsv` (new code, default off, so Ctrl+C is unchanged).
- Strings: `contextMenuCopy`, `contextMenuCopyWithHeaders`, `contextMenuUndo`, `contextMenuRedo`,
  `contextMenuLabel` in `GridLocaleText`.
- New `GridApi` methods: `openContextMenu(id, field)`, `closeContextMenu()`.

## Architecture (decided)

- `useGridContextMenu` — new feature hook in `lib/hooks/features/`, called **after `useGridRangeEditing`** (it
  needs the cell selection API and undo/redo) and before `useGridRenderWindow`, as its own numbered step in
  `docs/architecture/datagrid-orchestration.md`. It owns `{ x, y, id, field } | null`.
- The `contextmenu` listener is a **native listener on the grid root** (like paste and undo). The DOM has no row
  id: it reads the field from `closest('[data-field]')` and `data-rowindex` from the row, then maps the index to
  an id through the visible row list `[...topPinned, ...centreRowsOfPage, ...bottomPinned]`. `rowIndex` is
  already an index into that list (top-pinned from 0, centre rows after them, bottom-pinned at
  `bottomRowIndexOffset`), so no `pinnedTopRows.length` offset is added. No attribute or handler is added to `Row` or `Cell`. Shift+F10 / ContextMenu key go through
  `handleGridKeyDown`'s context as one new branch, on body cells only; on header or header-filter focus they do
  nothing (the browser default is not prevented).
- `GridContextMenu` component in `lib/components/ContextMenu/`, rendered by `GridRoot` (one child position, after
  overlays). Portal target and theme scope as in `useToolbarPanel` (closest `.ogx-theme-provider`, else body).
- Positioning: a pure `getPointMenuPosition(x, y, menuSize, viewport, rtl)` in `lib/utils/direction.ts` (flip
  left/up at the edges; in RTL open towards inline start). Keyboard-opened menus anchor at the cell's corner.
- Shared `useMenuKeyboard(menuRef, onClose, restoreFocusTo)` extracted from `ColumnMenu` (arrow/Home/End/Tab,
  focus first item once positioned, Escape, outside press, close on scroll/resize). `ColumnMenu` switches to it
  with no behaviour change (its existing tests must pass unchanged).

## Constraints

- Bundle: target ≤ +2 KB gzip on DataGrid; the 92 KB budget is not raised for this.
- React Compiler rules (no `?.`/`??` in `try`, refs in dependency arrays), `check:compiler` unchanged.
- Rows stay memoised: `DataGrid.rowMemo.test.tsx` gets a case that opening/closing the menu renders no `Row`.
- Browser tests (all three engines) for: right-click opens at the pointer and stays on screen near edges, RTL,
  keyboard open/close and focus return, inside/outside-range behaviour. WebKit: right-click via
  `userEvent.pointer({ keys: '[MouseRight]' })`.
- Docs: `docs/features/context-menu.md` (+ wiki `SECTIONS`), API reference, CHANGELOG, a demo page with an Export
  consumer item, `llms.txt`.

## Open for the builder

- Exact visual style (reuse `.ogx-column-menu` tokens unless they clash).
- Whether `GridContextMenuItem` reserves `children` for submenus now (typed but unused) or later.
- Long-press on touch devices: Safari iOS fires no `contextmenu`; acceptable to leave for a later version.
