# `<ColumnResizeHandle />` & Resizing

OpenGridX supports dynamic column resizing, allowing users to adjust the width of any column on the fly for better visibility of data. This is facilitated by the `ColumnResizeHandle`, which sits invisibly between adjacent column headers.

## 📑 Overview
- **Inter-Header Interaction**: A handle is placed on the right edge of each resizable column header.
- **Visual Feedback**: On hover and during drag, the grid provides immediate visual cues.
- **Constraints**: Supports `minWidth` and `maxWidth` values defined in your `GridColDef`.
- **Double-Click Action**: Support for auto-sizing columns to fit their longest content is built-in.

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

### Grid-Wide Control
Disable resizing globally via the `DataGrid` props.

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  disableColumnResize
/>
```

---

## ⚙️ How it Works

1. **Handle Deployment**: At the end of each `Header` component, a `ColumnResizeHandle` is mounted.
2. **Drag Event Processing**: When the handle is dragged:
   - It calculates the change in horizontal position (`deltaX`).
   - It applies this change to the column's current width in the grid's state.
3. **Boundaries Enforcement**: If the new width is less than `minWidth` (default 50px) or more than `maxWidth`, the change is rejected.
4. **Finalization**: On mouse up, the new column width is persisted to the grid's `columnVisibilityModel` equivalents.

---

## 🎨 Slot Implementation
In the DataGrid, you can replace the default handle component for custom styling (e.g., a thicker line or different colors).

```tsx
<DataGrid
  slots={{
    columnResizeHandle: MyCustomHandle
  }}
/>
```

## 📝 Best Practices
- **Define Min Widths**: Always set a reasonable `minWidth` so columns don't accidentally become 0px wide.
- **Persistence**: Listen to `onColumnWidthChange` to save the user's preferred layout for their next visit.
- **Content Fit**: Remember that large data values might hide behind narrow columns; use tooltips for overflow coverage.
