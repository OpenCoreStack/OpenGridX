# Right-to-Left (RTL)

Put the grid inside an element with `dir="rtl"`, or set `dir="rtl"` on `<html>` (`document.dir = 'rtl'`). There is no prop: the grid follows the CSS `direction` it inherits.

```tsx
<div dir="rtl" lang="ar">
    <DataGrid rows={rows} columns={columns} height={480} />
</div>
```

**Status (v3.6):** RTL grids work: column order, text, horizontal scrolling with column virtualization, keyboard, cell ranges, the fill handle, resizing, the toolbar panels, pinned columns (see [Pinned columns](#pinned-columns)), mirrored icons and switching `dir` at runtime. Remaining gaps are under [Known limitations](#known-limitations). Checked in Chromium, Firefox and WebKit; `lib/components/DataGrid/DataGrid.rtl.browser.test.tsx` covers what is listed as working or fixed.

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
| Left / right pinned columns, pinned system columns | **Fixed in v3.6** | Sticky offsets were physical `left` / `right`, so pinned columns scrolled away. They are now logical (`inset-inline-start` / `-end`) in the header, column group rows, header filter row, body, skeleton rows and aggregation footer. See [Pinned columns](#pinned-columns). |
| Pinned shadows and section borders | **Fixed in v3.6** | Mirrored: they face the scrolling columns. |
| Range drag with pinned columns | **Fixed in v3.6** | Auto-scroll starts at the inner edge of the pinned section on each side. |
| Pagination arrows, tree / group chevrons | **Fixed in v3.6** | Mirrored with `scaleX(-1)` under `:dir(rtl)`; tree indentation is on the start side. Sort arrows, search, close and other non-directional icons are not mirrored. |
| Switching `dir` on a mounted grid | **Fixed in v3.6** | Firefox resets `scrollLeft` without a scroll event, which left the body blank; the grid re-reads the position when any `dir` attribute changes. Changing `direction` through a class or stylesheet is not observed: scroll the grid or remount it. |
| Column reordering by drag | Works | Drops use the target header, not pointer offsets; the drop marker is on the target's start edge. |

## Pinned columns

`pinnedColumns.left` and `pinnedColumns.right` are **logical**: the inline start and end. In a right-to-left grid left-pinned columns, and the checkbox, expand and reorder columns pinned with `pinCheckboxColumn` / `pinExpandColumn`, stick to the **right** edge; right-pinned columns stick to the left edge. This is what MUI X and AG Grid do (AG Grid's `pinned: 'left'` and MUI's `pinnedColumns.left` move to the right in RTL), and it keeps one configuration for both directions: the identifier column a user reads first stays pinned where reading starts, and the system columns stay next to it.

The column menu is labelled by screen side: in RTL *Pin to Left* adds the column to `pinnedColumns.right`. `onPinnedColumnsChange` and `apiRef` report the logical lists. Shadow tokens are swapped in RTL (`--ogx-grid-pinned-right-shadow` is used for the start section, which casts its shadow leftwards).

## Known limitations

- ~~Menu and panel labels are hard-coded English~~: since v3.9 every built-in string, including the column menu (`columnMenuPinLeft`, `columnMenuSortAscending`, …), is a `localeText` key. See *Locale text for every UI string* in [`API_REFERENCE.md`](../API_REFERENCE.md).
- **Header filter operator symbols** are mirrored by the browser's bidi rules (`∋` shows as `∈`), as in any RTL text.
- **`direction` set through CSS** (a class or stylesheet, not the `dir` attribute) and changed at runtime is not detected; scroll the grid or remount it with a `key`.
- **Headless Chromium tests:** Playwright launches Chromium with `--hide-scrollbars`. With classic scrollbars (Linux) `scrollbar-gutter: stable` still reserves the gutter, and in RTL Chromium then cannot scroll the last gutter-width of the start into view (`scrollLeft` stops at minus the gutter). A plain scroller without the grid does the same and real browsers with visible scrollbars do not. Tests must compare with the browser's scroll origin, as `DataGrid.rtl.browser.test.tsx` does. To reproduce on macOS: `defaults write chrome-headless-shell AppleShowScrollBars Always` (undo with `defaults delete chrome-headless-shell`).

## Left-to-right grids

Every fix uses CSS logical properties (`text-align: start`, `inset-inline-end`, `margin-inline-start`) or applies only when the computed `direction` is `rtl`, so LTR grids are unchanged. A browser test measured 415 element positions (headers, cells, resize and fill handles, header filter controls, toolbar buttons and panels, before and after a horizontal scroll, with pinned columns) in all three engines before and after the change and found no difference; RTL part 2 repeated this with 2,211 boxes, shadows, borders and pseudo-element offsets (pinned and system columns, column groups, header filters, aggregation footer, before and after a scroll and with a range); `DataGrid.rtl.browser.test.tsx` keeps an LTR layout check.

## See also

- [Keyboard & Accessibility](keyboard-navigation.md)
- [Pinning](pinning.md)
- [Cell Range Selection](cell-selection.md)
