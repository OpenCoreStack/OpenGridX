# `<ColumnResizeHandle />` & Resizing

OpenGridX supports dynamic column resizing, allowing users to adjust the width of any column on the fly for better visibility of data. This is facilitated by the `ColumnResizeHandle`, an internal component (not exported) that `<Header />` renders invisibly on the edge of each resizable column header.

## 📑 Overview
- **Where the handle is**: on the right edge of each resizable column header. Right-pinned columns are anchored to the right edge of the grid and grow leftwards, so their handle is on their **left** edge, and the edge you grab follows the pointer. The handle is an 8px strip just inside the column, against that edge, and all of it can be grabbed (v3.0.1+; before, the neighbouring header cell clipped half of it).
- **Mouse, touch and pen**: the handle uses pointer events with pointer capture, so a resize keeps following the pointer outside the header and works on tablets and phones.
- **Keyboard**: with a column header focused, **Alt+ArrowRight** / **Alt+ArrowLeft** widen / narrow the column by 10px (hold **Shift** for 50px). The handle is a `role="separator"` that reports the width in `aria-valuenow` (and `aria-valuemin` / `aria-valuemax`).
- **Constraints**: `minWidth` and `maxWidth` from your `GridColDef` apply. Without `minWidth` a column can be narrowed to 50px; a column that is already narrower (a 30px icon column) is never snapped up to 50px. Without `maxWidth` there is no upper limit.
- **Clicks are not resizes**: pressing and releasing the handle without moving it changes nothing (a flex column stays flex), and ending a resize with the pointer over the header never sorts the column.
- **Double-click** does nothing (it is swallowed, so it does not sort). There is no auto-size to content.

---

## 🛠️ Usage

### Basic Resizing
By default, all columns are resizable. You can disable it for a specific field.

```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', resizable: false },  // Fixed width
  { field: 'name', headerName: 'Name', minWidth: 100 }  // User can resize
];
```

### Disabling Resize Per Column
There is no single grid-wide prop to disable all column resizing. Set `resizable: false` on each column definition individually:

```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', resizable: false },
  { field: 'status', headerName: 'Status', resizable: false },
];
```

---

## ⚙️ How it Works

1. **Handle Deployment**: every resizable header cell renders a `ColumnResizeHandle`.
2. **Pointer processing**: on `pointerdown` the handle captures the pointer and remembers the column's current width. Each `pointermove` (throttled to one update per frame) sets the width to that start width plus the horizontal distance moved (minus it for a right-pinned column).
3. **Boundaries Enforcement**: the width is clamped to the column's `minWidth` / `maxWidth` (see above).
4. **Finalization**: on `pointerup` the final width is stored in the grid's `columnWidths` state (part of the `onStateChange` snapshot and of `initialState.columns.columnWidths`). A cancelled pointer (the browser took the gesture over) keeps the last width shown.

---

## 🎨 Styling the Resize Handle

The resize handle is not replaceable via the slots API. Style it through CSS:

```css
.ogx-column-resize-handle__line {
  width: 4px;
  background: #6366f1;
}
/* The handle of a right-pinned column, on its left edge */
.ogx-column-resize-handle--start { }
/* While a resize is in progress */
.ogx-column-resize-handle--dragging { }
```

## 📝 Best Practices
- **Define Min Widths**: set a `minWidth` that fits your column's content.
- **Persistence**: Use `onStateChange` to capture the current `columnWidths` from the state snapshot and save the user's preferred layout for their next visit.
- **Content Fit**: Remember that large data values might hide behind narrow columns; use tooltips for overflow coverage.
