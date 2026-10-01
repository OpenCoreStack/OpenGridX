# Cell range selection — design (3.3.0)

Status: **approved 2026-10-01** · Target: 3.3.0 (30 Oct 2026) · Roadmap: `docs/roadmap.md` → Q4 2026

## Goal

Let users select a rectangle of cells the way they do in Excel or Google Sheets (drag, Shift+click, Shift+arrows) and copy it with Ctrl/Cmd+C. This is the base that 3.4.0 paste and undo, and the later fill handle, build on, so the model is designed for them now even though they ship later.

## Non-goals for 3.3.0

- Paste, Delete-to-clear, undo/redo (3.4.0) and the fill handle (3.5.0 stretch / Q1 2027).
- Several separate ranges at once (Ctrl+drag). The model type allows it later; 3.3.0 keeps one range.
- Touch selection. On touch a drag scrolls; tapping still focuses a cell. Revisit with the fill handle.
- Ranges across pages. A range covers the rows of the current page.

## Public API

Everything is off unless `cellSelection` is set, so existing grids are unchanged.

```ts
// DataGridProps
cellSelection?: boolean;                                   // default false
cellSelectionModel?: GridCellSelectionModel;               // controlled
onCellSelectionModelChange?: (model: GridCellSelectionModel, details: { reason: GridCellSelectionReason }) => void;
showCellSelectionStats?: boolean;                          // status bar: count, sum, average

// types
interface GridCellCoordinates { id: GridRowId; field: string }
interface GridCellRange { anchor: GridCellCoordinates; head: GridCellCoordinates }
type GridCellSelectionModel = readonly GridCellRange[];    // 3.3.0: zero or one range
type GridCellSelectionReason = 'pointer' | 'keyboard' | 'selectAll' | 'api' | 'clear' | 'dataChange';

// GridApi
getCellSelectionModel(): GridCellSelectionModel;
setCellSelectionModel(model: GridCellSelectionModel): void;
selectCellRange(anchor: GridCellCoordinates, head: GridCellCoordinates): void;
clearCellSelection(): void;
/** Cells of the current range in display order, values read through getCellValue. */
getSelectedCells(): { id: GridRowId; field: string; value: unknown }[];
copySelectedCells(): Promise<void>;
```

**Why ids and fields, not indices:** a range has to survive re-renders, virtualization and row updates. The rectangle is worked out each render from the current display order. If sorting or filtering moves the two corner rows, the rectangle follows them. That is how Google Sheets behaves after a sort, and it keeps the model stable for undo in 3.4.0. If a corner's row or column is no longer displayed, the range is cleared (`reason: 'dataChange'`).

**`anchor` and `head`:** `anchor` is the active cell. It keeps DOM focus, starts editing when the user types, and is where a paste will land in 3.4.0. `head` is the corner that moves with Shift+arrows or the pointer, and it is the corner scrolled into view. This is Excel's model. A single focused cell is a range whose `anchor` equals its `head`. It is not drawn as a range, but it is what Ctrl+C copies.

## Interaction

| Input | Result |
| :--- | :--- |
| Click | Focus the cell; range = that cell (no change to today's behaviour) |
| Press and drag | Range from the pressed cell to the cell under the pointer; auto-scrolls when the pointer is near a viewport edge |
| Shift+click | Extend from the anchor to the clicked cell |
| Shift+Arrow | Move the head by one cell, **without wrapping** to the next row (plain arrows keep their wrap) |
| Shift+Home / Shift+End | Head to the first / last column of its row |
| Ctrl+Shift+Home / End | Head to the first / last cell of the page |
| Shift+PageUp / PageDown | Head one page up / down |
| Ctrl/Cmd+A | Select every data cell on the page (see open question 1) |
| Escape | Collapse the range to the anchor (if not editing) |
| Ctrl/Cmd+C | Copy the range as TSV |
| Typing / Enter / F2 | Edit the anchor cell, as today |

**Columns:** only data columns take part. The checkbox, expand, reorder and grouping (`__group__`) columns are never in a range, and clicking them keeps today's behaviour. Column order is the on-screen order: left-pinned, then centre, then right-pinned.

**Rows:** pinned top and bottom rows take part in screen order. Group headers, subtotals, tree auto-parents and the pivot Grand Total are inside the rectangle when they fall between the corners. They are highlighted, but are skipped by copy and will be skipped by paste (see open question 3).

**Spans:** a range touching part of a `colSpan` or `rowSpan` grows to cover the whole span, as Excel does with merged cells. It grows repeatedly until it is stable. In a copy, the span's value sits at its origin cell and the covered positions are empty.

**Row selection is separate.** Drag and Shift ranges never change the row selection. A plain click still selects the row unless `disableRowSelectionOnClick` is set, as today. A consumer combining `cellSelection` with `checkboxSelection` gets both, and the checkbox column keeps selecting rows.

## Copy

- Ctrl/Cmd+C with `cellSelection` on copies the range: values formatted the way the cells show them (`formatExportValue`), tabs between columns, line breaks between rows, and no header line, which is what Excel and Sheets do for a range.
- Row copy (`copySelectedRows`, header line included) stays available through `apiRef`. With `cellSelection` on, the shortcut copies the range instead (see open question 2).
- `exportable: false` columns are copied when they are in the range, because the user chose them on screen. They are only excluded from exports.
- Large ranges: building the text is linear. Above 100,000 cells a development warning suggests `exportToCsv`. Nothing is truncated.

## Rendering

- `useGridCellSelection` returns the rectangle as display indices `{ top, bottom, left, right }`, plus the anchor.
- `GridVirtualRows` passes each row `cellRange: { left, right, isTop, isBottom } | null`, and `null` for rows outside it. Rows outside the range keep the same props, so a drag only re-renders the rows it enters or leaves.
- Cells in the range get `ogx__cell--range`, and edge cells also get `ogx__cell--range-top`, `-bottom`, `-left` or `-right`. The edge classes draw the outline with an inset box-shadow, so the layout never shifts.
- New CSS variables `--ogx-range-background` and `--ogx-range-border`, defined in all 5 themes. These class names are public API from 3.3.0.
- Pointer moves during a drag are batched to one update per animation frame. While dragging, the grid root gets `ogx--range-dragging` (`user-select: none`), so the browser does not also select text.

## Accessibility

- Cells in the range have `aria-selected="true"`. The grid already sets `aria-multiselectable`.
- DOM focus stays on the anchor, so screen readers keep their place. After each change the live region (`GridLiveRegion`) announces the size, for example "12 cells selected, 3 rows by 4 columns", debounced to 300 ms. The text is in `localeText` (`cellSelectionAnnouncement`).
- The grid stays a single Tab stop, and Shift+Tab leaves the grid as today.
- Keyboard mode (`ogx--kb`) and the focus ring are unchanged. The anchor keeps its ring inside the range.

## Status bar (`showCellSelectionStats`)

- Shows Count of non-empty cells, Sum and Average of numeric cells in the range, using the shared `lib/utils/aggregation` functions.
- Hidden when the range is one cell.
- Rendered above the pagination area, and replaceable through a new `slots.cellSelectionStats`.

## Implementation plan

| Piece | Where |
| :--- | :--- |
| Types, props, `GridApi` methods, `localeText` key | `lib/types/index.ts` |
| Controlled/uncontrolled model | `useGridControlledState` (new pair) |
| Range state, rectangle resolution, span growth, pointer drag + auto-scroll | new `lib/hooks/core/useGridCellSelection.ts`, pure helpers in `lib/utils/cellSelection.ts` |
| Shift+navigation, Escape, Ctrl+A | `useGridKeyboardNavigation`: new optional `onExtendSelection(head)` and `cellSelection` params; Shift+Arrow does not wrap |
| Range copy | `useGridClipboard` (`buildRangeTsv`), `useGridClipboardApi` chooses range or rows |
| Per-row `cellRange` prop, cell classes, `aria-selected` | `GridVirtualRows`, `GridPinnedRows`, `Row`, `Cell` |
| Status bar | new `lib/components/CellSelectionStats/` |
| apiRef install | `useGridCellSelection` installs its methods (documented in `datagrid-orchestration.md`, after `useGridKeyboardNavigation`) |
| CSS | `lib/styles/` cell rules + theme variables |

The hook order matters: the hook needs `allRenderableRows`, the navigation columns, `getSpanOrigin` and `scrollRowIntoView`. It runs after `useGridSpanning` and before `useGridKeyboardNavigation`, which receives its `onExtendSelection` callback.

## Tests

- **Unit (`lib/utils/cellSelection.test.ts`):**
  - rectangle from ids;
  - corners moved by sorting;
  - a corner removed, which clears the range;
  - span growth until stable;
  - synthetic rows skipped in copy;
  - system columns excluded;
  - pinned order;
  - TSV escaping.
- **Unit (`DataGrid.cellSelection.test.tsx`):**
  - controlled and uncontrolled model;
  - each `reason`;
  - the `apiRef` methods;
  - Shift+Arrow without wrapping;
  - Escape;
  - Ctrl+A;
  - the status bar sums;
  - no change at all when `cellSelection` is off, by snapshotting the existing keyboard tests.
- **Browser (`DataGrid.cellSelection.browser.test.tsx`, Chromium, Firefox and WebKit):**
  - drag with auto-scroll across virtualized rows and columns;
  - Shift+click;
  - the copied text read back from the clipboard;
  - the live region announcement;
  - the range outline does not move cells (layout measurement).
- **Smoke suite:** a `range` scenario that drags, copies and checks the clipboard text in both fixtures.
- **Performance:** dragging over 100,000 rows × 30 columns re-renders only the rows entering or leaving the range (render counter).

## Docs and demo

- New `docs/features/cell-selection.md`, which also needs adding to the wiki `SECTIONS`.
- The API reference (props, types, `GridApi`).
- A keyboard-navigation table update.
- A theming variables entry.
- A demo page with a sum and average status bar over a sales table.
- CHANGELOG and `llms.txt`.

## Decisions (approved 2026-10-01)

1. **Ctrl/Cmd+A** with `cellSelection` on selects every data cell on the page; the header checkbox still selects all rows.
2. **Ctrl/Cmd+C** with `cellSelection` on always copies the cell range (the focused cell at minimum); row copy stays available as `apiRef.copySelectedRows()`.
3. **Synthetic rows** (group headers, subtotals, tree auto-parents, pivot Grand Total) are highlighted inside a range but skipped by copy, and will be skipped by paste.
4. **Prop name:** `cellSelection` (matches MUI X).
