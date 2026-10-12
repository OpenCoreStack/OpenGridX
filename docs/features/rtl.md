# Right-to-Left (RTL)

Put the grid inside an element with `dir="rtl"`, or set `dir="rtl"` on `<html>` (`document.dir = 'rtl'`). There is no prop: the grid follows the CSS `direction` it inherits.

```tsx
<div dir="rtl" lang="ar">
    <DataGrid rows={rows} columns={columns} height={480} />
</div>
```

**Status (v3.6):** unpinned grids work in RTL: column order, text, horizontal scrolling with column virtualization, keyboard, cell ranges, the fill handle, resizing and the toolbar panels. **Pinned columns do not work in RTL yet** (see [Known limitations](#known-limitations)). Checked in Chromium, Firefox and WebKit; `lib/components/DataGrid/DataGrid.rtl.browser.test.tsx` covers what is listed as working or fixed.

Demo: *Right-to-Left* (`/rtl`), with Arabic and Hebrew sample data and an RTL toggle.

## What was checked

| Area | Result | Notes |
| :--- | :--- | :--- |
| Column order | Works | The first column is on the right. |
| Header and cell text alignment | **Fixed in v3.6** | Cells used `text-align: left`; `align: 'left'` / `'right'` now mean start / end (`text-align: start` / `end`), so default text starts on the right and number columns end on the left, matching the header. |
| Horizontal scrolling and column virtualization | **Fixed in v3.6** | Browsers report `scrollLeft` from 0 down to a negative number in RTL. The grid counted it as 0, so after a horizontal scroll it rendered the first columns (now scrolled out of view) and the body was blank. It now measures the scroll offset from the start edge. |
| Keyboard ArrowLeft / ArrowRight | **Fixed in v3.6** | ArrowLeft moves to the column on the left (the next column), ArrowRight to the right; Home / End go to the first / last column and scroll it into view. Shift+Arrow extends a cell range the same way. Alt+ArrowLeft / Alt+ArrowRight on a tree or group row expand / collapse in the screen direction (ArrowLeft expands), as do Alt+Arrow column resizing on a header (ArrowLeft widens) and Arrow keys on a focused resize handle. |
| Column resize handle | **Fixed in v3.6** | It was on the column's right edge (its start edge in RTL) and dragging it right narrowed the column. It now sits on the left (end) edge and dragging left widens the column. |
| Cell range selection | **Fixed in v3.6** | The range outline was drawn on the inner edges in RTL (the `--range-left` / `--range-right` modifiers mark the first and last column); it now outlines the range's outer edges. Dragging past the left edge of the grid auto-scrolls towards the later columns (it did not scroll at all before). |
| Fill handle | **Fixed in v3.6** | The square was on the bottom-right corner of the range; it is now on the bottom-left, where the range ends. Dragging it fills towards the pointer as in LTR. |
| Toolbar panels (columns, filters, summaries, pivot) | **Fixed in v3.6** | They opened leftwards from the button, off the screen when the toolbar is on the left. In RTL they now open rightwards, lined up with the button's left edge. |
| Column menu, header filter operator menu | Works | Placed under their button. |
| Header filter row | Works | Filter cells line up with their columns. Operator symbols are mirrored by the browser's bidi rules (`∋` shows as `∈`), as in any RTL text. |
| Ask AI panel | Works | Opens over the grid. |
| Left / right pinned columns | **Limitation** | See below. |
| Column reordering by drag | Not checked | Dropping on a header uses the target header, not pointer offsets, so it is expected to work. |

## Known limitations

- **Pinned columns.** Sticky offsets use the physical `left` / `right` properties. In RTL a left-pinned column (`pinnedColumns.left`) starts on the right but sticks to the left edge, so it scrolls away; a right-pinned column is laid out at the far end of the scroll area. The checkbox, expand and reorder system columns pinned with `pinCheckboxColumn` / `pinExpandColumn` have the same problem, as do the pinned-column shadows. **Workaround:** do not pin columns in RTL grids (`pinnedColumns={rtl ? undefined : pinned}`, and leave `pinCheckboxColumn` off).
- **Range, pinned and resize visuals that use physical sides** beyond those fixed above (for example the borders between pinned sections) are drawn for LTR.
- **Switching direction at runtime** (toggling `dir` on a mounted, horizontally scrolled grid) was not tested; scroll the grid back to the start, or remount it with a `key`, when you switch.
- **Icons are not mirrored**: arrows in the pagination and the tree expand chevrons keep their LTR shape.

These are on the roadmap for Q1 2027.

## Left-to-right grids

Every fix uses CSS logical properties (`text-align: start`, `inset-inline-end`, `margin-inline-start`) or applies only when the computed `direction` is `rtl`, so LTR grids are unchanged. A browser test measured 415 element positions (headers, cells, resize and fill handles, header filter controls, toolbar buttons and panels, before and after a horizontal scroll, with pinned columns) in all three engines before and after the change and found no difference; `DataGrid.rtl.browser.test.tsx` keeps an LTR layout check.

## See also

- [Keyboard & Accessibility](keyboard-navigation.md)
- [Pinning](pinning.md)
- [Cell Range Selection](cell-selection.md)
