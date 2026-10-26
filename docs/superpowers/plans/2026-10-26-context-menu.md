# Context Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An opt-in right-click / Shift+F10 menu on body cells with built-in Copy, Copy with headers, Undo, Redo and consumer items, shipped in 3.11.0.

**Architecture:** A feature hook `useGridContextMenu` (orchestration step 37a, right after `useGridColumnMenuHandlers`) owns `{ x, y, id, field } | null`, listens for `contextmenu` natively on the grid root and installs two `apiRef` methods. `GridContextMenu` renders the menu in a portal from `GridRoot`. Menu keyboard behaviour is shared with `ColumnMenu` through `useMenuKeyboard`. No new prop reaches `Row` or `Cell`.

**Tech Stack:** TypeScript 5.9 strict, React 19, Vitest 4 (jsdom + Playwright browser project).

**Spec:** `docs/superpowers/specs/2026-10-26-context-menu-design.md`

## Global Constraints

- Opt-in: nothing changes (DOM, behaviour, look) when `contextMenu` is not set.
- DataGrid gzip growth ≤ +2.1 KB (raised from 2 KB on 2026-10-26: the range-keeping fixes for right press and Apple Ctrl+click found in Task 6b); `DATAGRID_GZIP_BUDGET` (92 KB) is not raised.
- No `any`, no `eslint-disable`, no `@ts-ignore`, no new `as unknown as`. React Compiler rules from CLAUDE.md v3.3.0; `npm run check:compiler` output unchanged.
- No row re-renders on menu open/close (v3.9.0 rule); handlers reaching rows keep identity.
- Consumer callbacks (`getContextMenuItems`, item `onClick`) are contained: a throw falls back (to `defaultItems` / no-op) with one dev warning.
- Cell values go through `getCellValue`; RTL through `isRtl` / `lib/utils/direction.ts`.
- Built-in item ids: `'copy'`, `'copyWithHeaders'`, `'undo'`, `'redo'`.
- Locale keys: `contextMenuCopy`, `contextMenuCopyWithHeaders`, `contextMenuUndo`, `contextMenuRedo`, `contextMenuLabel`.
- Header line in copies uses `headerName ?? field`.
- Version 3.11.0: `package.json`, `llms.txt` + demo copy, CLAUDE.md "Current version", `opengridx-ai-context.md`, CHANGELOG (`check:versions`).
- Gates per task: `npm run lint && npm run typecheck && npm run build`, plus the task's tests.

## Commits

Each task ends in a commit, and each commit needs the user's approval first (standing rule). Task 4 (the ColumnMenu refactor) stays its own commit so it can be reverted alone.

## Review Focus

1. Right-click near the right/bottom viewport edge or in a scrolled page → menu stays fully on screen (Task 3 tests).
2. Right-click on a top-pinned row, a bottom-pinned row, a centre row on page 2, a group row, or a cell covered by a row span → correct row id / copies the span origin's text, never a wrong row (Task 6a tests).
3. Right-click on header, header filter, footer, detail panel, a nested grid, or an open editor → browser menu untouched (Task 6a/6b tests).
4. Grid scrolls or rows change while the menu is open → menu closes; a removed row never gets an action (Task 6a/6b tests).
5. `getContextMenuItems` throws or returns `[]` → defaults with a warning / no menu and native menu allowed (Task 6a/6b tests).

---

### Task 1: Copy text with headers and single-cell copy

**Files:**
- Modify: `lib/hooks/features/useGridClipboard.ts` (`buildRangeTsv`, new `buildCellCopyText`)
- Modify: `lib/hooks/core/useGridCellSelection.ts:121,338` (`getCopyText`)
- Test: `lib/hooks/features/useGridClipboard.test.ts`, `lib/hooks/core/useGridCellSelection.test.ts`

**Interfaces:**
- Produces: `buildRangeTsv(rows, columns, isCovered?, options?: { includeHeaders?: boolean }): string`; `buildCellCopyText(row: GridRowModel, col: GridColDef, includeHeaders: boolean): string`; `getCopyText(options?: { includeHeaders?: boolean }): string | null`.

- [ ] **Step 1: Failing tests**
  - `buildRangeTsv includes one header line when includeHeaders`: rows `[{a:1,b:'x'}]`, cols `a` (headerName `'A'`), `b` (no headerName) → `'A\tb\n1\tx'`.
  - `buildRangeTsv default output unchanged` → `'1\tx'`.
  - `buildCellCopyText` → `'1'`; with headers → `'A\n1'`; a value containing a tab is escaped exactly as `escapeTsvField` does.
  - `getCopyText({ includeHeaders: true })` on a 2×2 range starts with the header line; `getCopyText()` does not.
- [ ] **Step 2: Run** `npx vitest run --project unit lib/hooks/features/useGridClipboard.test.ts lib/hooks/core/useGridCellSelection.test.ts` → new tests FAIL.
- [ ] **Step 3: Implement.** Header cells go through `escapeTsvField`. `buildCellCopyText` reuses `formatCopyValue`. `getCopyText` forwards the option; Ctrl+C keeps calling it without arguments.
- [ ] **Step 4: Run** the same command → PASS; `npm test` → all pass.
- [ ] **Step 5: Commit** `feat(clipboard): optional header line for range and single-cell copy text`

### Task 2: Public types, props and locale

**Files:**
- Create: `lib/types/contextMenu.ts`
- Modify: `lib/types/index.ts`, `lib/types/props.ts`, `lib/types/api.ts`, `lib/types/locale.ts`, `lib/utils/gridLocale.ts`
- Test: existing `publicApi` test (update its snapshot / list) 

**Interfaces:**
- Produces (exact, from the spec): `GridContextMenuParams<R>` `{ id, field, row, colDef, value, rowMeta, cellRange: GridCellSelectionModel | null, api: GridApi<R> }`; `GridContextMenuItem` `{ id, label, onClick?, disabled?, shortcut?, icon?: React.ReactNode, danger? }`; `GridContextMenuEntry = GridContextMenuItem | 'divider'`; props `contextMenu?: boolean`, `getContextMenuItems?: (params, defaultItems: readonly GridContextMenuEntry[]) => readonly GridContextMenuEntry[]`; `GridApi.openContextMenu(id: GridRowId, field: string): void`, `GridApi.closeContextMenu(): void` (both `@since v3.11`).
- English defaults: `'Copy'`, `'Copy with headers'`, `'Undo'`, `'Redo'`, `contextMenuLabel: 'Cell actions'`.

- [ ] **Step 1:** Add the types; run `npm run typecheck` → FAIL where `GridApi` objects are built (missing methods).
- [ ] **Step 2:** Add no-op placeholders to the api builders so typecheck passes (Task 6a replaces them).
- [ ] **Step 3: Run** `npm run typecheck && npx vitest run --project unit lib/publicApi` → PASS after updating the public list.
- [ ] **Step 4: Commit** `feat(types): context menu types, props, api and locale strings`

### Task 3: Point menu position

**Files:**
- Modify: `lib/utils/direction.ts`
- Test: `lib/utils/direction.test.ts`

**Interfaces:**
- Produces: `getPointMenuPosition(x: number, y: number, menu: { width: number; height: number }, viewport: { width: number; height: number }, rtl: boolean): { top: number; left: number }` (viewport coordinates, 8 px margin, same as `ColumnMenu`).

- [ ] **Step 1: Failing tests** (viewport 1000×800, menu 200×300):
  - LTR at (100,100) → `{ left: 100, top: 100 }`.
  - LTR at (900,100) → `{ left: 700, top: 100 }` (flips to end at the pointer).
  - RTL at (500,100) → `{ left: 300, top: 100 }` (opens towards inline start).
  - RTL at (100,100) → `{ left: 100, top: 100 }` (cannot flip, kept on screen).
  - At (100,700) → `top: 400` (flips up). Menu taller than viewport → `top: 8`.
- [ ] **Step 2: Run** `npx vitest run --project unit lib/utils/direction.test.ts` → FAIL.
- [ ] **Step 3: Implement.** Clamp to `[8, viewport - size - 8]` after flipping.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(direction): getPointMenuPosition for menus opened at a point`

### Task 4: Shared menu keyboard hook

**Files:**
- Create: `lib/components/ui/useMenuKeyboard.ts`
- Modify: `lib/components/Header/ColumnMenu.tsx:122-210`
- Test: `lib/components/ui/useMenuKeyboard.test.tsx`; existing `ColumnMenu` tests unchanged

**Interfaces:**
- Produces: `useMenuKeyboard({ menuRef, isPositioned, onClose, getRestoreTarget, ignoreTarget? }): { close: (restoreFocus: boolean) => void; handleMenuKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void }`. Covers: focus first item once positioned, ArrowUp/Down wrap, Home/End, Tab and Escape close with focus restore, outside `mousedown` closes (except on `ignoreTarget`), scroll/resize close. `onClose` read through a ref (like `useToolbarPanel`).

- [ ] **Step 1:** Write `useMenuKeyboard.test.tsx` with a 3-item menu: ArrowDown from last wraps to first; Escape calls `onClose` and focuses the restore target; outside mousedown calls `onClose`; scroll calls `onClose`.
- [ ] **Step 2: Run** → FAIL (module missing).
- [ ] **Step 3:** Move the logic out of `ColumnMenu` into the hook; `ColumnMenu` calls it with `ignoreTarget: anchorEl` and `getRestoreTarget` = the header cell.
- [ ] **Step 4: Run** the new test plus `npx vitest run --project unit lib/components/Header` and `npx vitest run --project browser lib/components/Header` → PASS with no ColumnMenu test edits.
- [ ] **Step 5: Commit** `refactor(menu): share menu keyboard handling between menus`

### Task 5: `GridContextMenu` component

**Files:**
- Create: `lib/components/ContextMenu/GridContextMenu.tsx`, `lib/components/ContextMenu/ContextMenu.css` (imported from `lib/styles/opengridx.css`)
- Test: `lib/components/ContextMenu/GridContextMenu.test.tsx`

**Interfaces:**
- Consumes: `useMenuKeyboard` (Task 4), `getPointMenuPosition` (Task 3), `GridContextMenuEntry` (Task 2).
- Produces: `GridContextMenu({ entries: readonly GridContextMenuEntry[]; x: number; y: number; anchorCell: HTMLElement | null; onClose: () => void; label: string })`. Items: `role="menuitem"`, `aria-disabled` for disabled (focusable, click ignored), `'divider'` → `role="separator"`. Clicking an enabled item closes first, then runs `onClick` inside a contained call (`attempt()`), focus restored to `anchorCell`. Classes `ogx-context-menu`, `ogx-context-menu__item`, `--danger`, `--disabled`, `ogx-context-menu__shortcut`, sharing `.ogx-column-menu` tokens.

- [ ] **Step 1: Failing tests:** renders labels, shortcut text and separator; disabled item click does nothing; enabled click calls `onClose` then `onClick` (order asserted); a throwing `onClick` does not throw out and warns once; `aria-label` is `label`; leading/trailing/double dividers are dropped.
- [ ] **Step 2: Run** `npx vitest run --project unit lib/components/ContextMenu` → FAIL.
- [ ] **Step 3: Implement.** Portal target = closest `.ogx-theme-provider` of `anchorCell`, else `document.body`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(context-menu): GridContextMenu component`

### Task 6a: `useGridContextMenu` — pointer menu and DataGrid wiring

**Files:**
- Create: `lib/hooks/features/useGridContextMenu.ts`
- Modify: `lib/components/DataGrid/DataGrid.tsx` (call after `useGridColumnMenuHandlers`, pass result to `GridRoot`), `lib/components/DataGrid/GridRoot.tsx` (render `GridContextMenu` as one new child position after overlays), `lib/hooks/core/useGridDevWarnings.ts` (`getContextMenuItems` without `contextMenu`), the api builders from Task 2, `docs/architecture/datagrid-orchestration.md` (row 37a)
- Test: `lib/components/DataGrid/DataGrid.contextMenu.test.tsx`

**Interfaces:**
- Consumes: Tasks 1–5; `containerRef`, `apiRef`, the visible row list (top-pinned + centre rows of the current page + bottom-pinned, the list `useGridVisibleRows` indexes into), `columns` lookup, `rowMetaMap`, `cellSelection` (its API incl. `getCopyText`, model setter), undo/redo `canUndo`/`canRedo`/`undo`/`redo`, `setFocusedCell`, `localeText`.
- Produces: `useGridContextMenu<R>(params): { menu: { x: number; y: number; entries: readonly GridContextMenuEntry[]; anchorCell: HTMLElement | null } | null; close: () => void; openAt: (cell: FocusedCell) => void }`. `openAt` is used by Task 6b.

**Row resolution (exact rule).** `Row` writes `data-rowindex={rowIndex}`, and `rowIndex` is already an index into the visible row list `[...topPinned, ...centreRowsOfPage, ...bottomPinned]`: top-pinned rows use `0..n-1` (`GridPinnedRows`, offset 0), centre rows `topPinnedCount + centerStartIndex + i` (`useGridVisibleRows`), bottom-pinned rows `bottomRowIndexOffset = pinnedTopCount + pageRowCount` (`lib/utils/aria`). So: `id = getRowId(visibleRowList[Number(rowEl.dataset.rowindex)])`, with **no** `+ pinnedTopRows.length` adjustment. Ignore skeleton rows (`.ogx__skeleton-group` / skeleton `Row`s) and a missing or out-of-range index (no menu, not prevented). Read the list from a ref updated with the rendered list (latest-ref pattern) so the index and the list come from the same render; `Row` has no id attribute and none is added.

Behaviour to implement (spec "Copy semantics", "Public API"):
- Native `contextmenu` listener on `containerRef` only when `contextMenu` is true. Target must be a body cell of **this** grid (`closest('.ogx')` is the root; not inside an editor, header, footer, detail panel). Covered span cells resolve to the span origin.
- Inside the current range → keep it; otherwise set focus to the cell and collapse the range to it (when `cellSelection`). Then compute `defaultItems`, call `getContextMenuItems` (contained), and if the result is empty do **not** `preventDefault`.
- Copy: inside a range → `getCopyText({ includeHeaders })`; else `buildCellCopyText`. Written through `writeToClipboard`.
- Undo/Redo items only when `undoRedo` is on; `disabled` from `canUndo()` / `canRedo()`.
- Close on: item chosen, Escape, outside press, grid scroll, window resize, the open row leaving the visible row list.
- `apiRef.openContextMenu(id, field)` scrolls the cell into view and opens at its corner; `closeContextMenu()` closes.

- [ ] **Step 1: Failing unit tests** (`DataGrid.contextMenu.test.tsx`, jsdom): no `contextMenu` prop → `fireEvent.contextMenu(cell)` is not default-prevented and no `role="menu"`; with it → menu with Copy, Copy with headers; `undoRedo` adds Undo/Redo, Undo disabled with empty history; `getContextMenuItems` receives params (`id`, `field`, `value` via `valueGetter`, `rowMeta` on a group row) and its return replaces items; returns `[]` → no menu, not prevented; throws → defaults + one warning; right-click on header / header filter / editor input → not prevented; Copy writes the cell text, Copy inside a 2×2 range writes the range; `openContextMenu`/`closeContextMenu` via `apiRef`; dev warning for `getContextMenuItems` alone; rows change so the row is removed → menu closes.
- [ ] **Step 2: Failing row-resolution tests** (same file): with 2 top-pinned rows, right-click on top-pinned row 0, centre row 0, and a bottom-pinned row → each reports its own `id` (top-pinned row 0 and centre row 0 must differ); with `pagination` on page 2, right-click on the first centre row → that page's row, not page 1's; a covered row-span cell → the span origin's `id` and text.
- [ ] **Step 3: Run** `npx vitest run --project unit lib/components/DataGrid/DataGrid.contextMenu.test.tsx` → FAIL.
- [ ] **Step 4: Implement** the hook, wiring, doc row 37a.
- [ ] **Step 5: Run** step 3's command → PASS; `npm test` → all pass; `npm run lint && npm run typecheck && npm run build && npm run check:compiler` → pass.
- [ ] **Step 6: Commit** `feat(context-menu): right-click cell menu (contextMenu, getContextMenuItems)`

### Task 6b: Keyboard opening, row memo guard, browser tests, budget

**Files:**
- Modify: `lib/hooks/core/gridKeyDown.ts` (`GridKeyDownContext.openContextMenuAt?: (cell: FocusedCell) => void`; Shift+F10 / `ContextMenu` key on a body cell calls it and `preventDefault`s; header / header-filter focus: return without `preventDefault`), `lib/hooks/core/useGridKeyboardNavigation.ts` (pass `openAt` from 6a through the context; keep the `useCallback` dependency list complete)
- Test: `lib/hooks/core/gridKeyDown.test.ts` (new cases), `lib/components/DataGrid/DataGrid.rowMemo.test.tsx` (new cases), `lib/components/DataGrid/DataGrid.contextMenu.browser.test.tsx`

**Ordering note:** `useGridKeyboardNavigation` runs before step 37a, so it cannot take `openAt` directly. Pass it through a ref filled by `useGridContextMenu` (latest-ref pattern, as `useGridRowInteractions` does); the keydown handler reads `ref.current` at event time. Do not move hooks.

- [ ] **Step 1: Failing `gridKeyDown` tests:** Shift+F10 and `ContextMenu` on a body cell call `openContextMenuAt` and prevent default; on header / header-filter focus neither; without `openContextMenuAt` (prop off) neither.
- [ ] **Step 2: Failing rowMemo cases:** (a) opening and closing the menu on the already-focused cell renders no `Row`; (b) right-clicking a cell in another row renders at most 2 `Row`s (the old and new focused rows) and closing renders none; (c) with `contextMenu` on but the menu closed, a grid re-render renders no `Row` (no prop identity changes).
- [ ] **Step 3: Run** `npx vitest run --project unit lib/hooks/core/gridKeyDown.test.ts lib/components/DataGrid/DataGrid.rowMemo.test.tsx` → FAIL; implement; → PASS.
- [ ] **Step 4: Failing browser tests** (`DataGrid.contextMenu.browser.test.tsx`, import `lib/styles/opengridx.css`; right-click with `userEvent.click(el, { button: 'right' })`): menu opens at the pointer; near right/bottom edge stays inside `window.innerWidth/innerHeight`; `dir="rtl"` opens towards inline start; Shift+F10 opens on the focused cell, Escape closes and focus returns to the cell; right-click inside a range keeps it, outside collapses it; right-click on a top-pinned row, a centre row after scrolling and a grouped child row reports the right `id`; grid scroll closes the menu; release the mouse over the page in `afterEach` (`commands.pointerUp()`).
- [ ] **Step 5: Run** `npx vitest run --project browser lib/components/DataGrid/DataGrid.contextMenu.browser.test.tsx` in all three engines → PASS.
- [ ] **Step 6:** `npm run lint && npm run typecheck && npm run build && npm run build:lib && npm run check:package && npm run check:compiler` → all pass; note the gzip delta (≤ 2.1 KB).
- [ ] **Step 7: Commit** `feat(context-menu): Shift+F10 opening and browser coverage`

### Task 7: Docs, demo, release prep

**Files:**
- Create: `docs/features/context-menu.md`, `demo/examples/ContextMenuDemo.tsx`
- Modify: `scripts/build-wiki.mjs` (`SECTIONS`), `docs/API_REFERENCE.md`, `docs/components/datagrid.md`, `docs/roadmap.md`, `demo/App.tsx` (`examplesConfig` route), `CHANGELOG.md`, `package.json` (3.11.0), `llms.txt` + demo copy, `opengridx-ai-context.md`, `CLAUDE.md` (Current version + a short "v3.11.0 — significant changes" section: step 37a, native listener, `useMenuKeyboard`, Copy semantics), `docs/superpowers/plans/2026-10-13-audit-tracker.md` (log line)

- [ ] **Step 1:** Feature guide: opt-in, defaults, `getContextMenuItems` example that adds "Export CSV" with `exportToCsv` and a "Delete row", Copy semantics table, keyboard, locale keys, what is not covered (header, touch long-press, paste).
- [ ] **Step 2:** Demo page with `cellSelection`, `undoRedo`, a custom Export item and a danger Delete item; explicit `height`; code sample through `CodeBlock`.
- [ ] **Step 3: Run** `npm run wiki:build` (no unlisted-doc warning), `npm run check:versions`, `npm run test:demo` → PASS.
- [ ] **Step 4: Run** `npm run test:all` and `npm run test:smoke` → PASS.
- [ ] **Step 5: Commit** `docs(context-menu): guide, demo page and 3.11.0 release notes`
