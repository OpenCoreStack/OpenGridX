# 📋 Clipboard & Copy/Paste

OpenGridX supports copying grid data directly to the clipboard. This feature allows users to effortlessly move data from the grid to external applications like Microsoft Excel, Google Sheets, or text editors.

## 📑 Overview
- **Zero Configuration**: Enabled by default with the standard `DataGrid`.
- **Selected Rows**: Every selected row that passes the filter is copied — rows on other pages, rows inside collapsed groups or tree nodes, and pinned rows included — in the order the grid shows them. Rows the filter removes are not copied.
- **What you see**: Only the visible columns are copied, in screen order (column order, drag reorder and pinning are followed). Columns marked `exportable: false` (action/button columns) are left out, as in every export.
- **TSV Format**: Data is copied in Tab-Separated Values (TSV) format, quoted the way Excel and Google Sheets read it.
- **Cell values**: `valueGetter` and then `valueFormatter` are applied, as in the cells.

---

## ⌨️ Keyboard Shortcuts
Selection and copying follow standard spreadsheet metaphors:
| Shortcut | Action |
| :--- | :--- |
| `Ctrl + C` / `Cmd + C` | Copy currently selected rows to the clipboard. |

> **Cell ranges (v3.3)**: with `cellSelection` on, Ctrl/Cmd+C copies the selected cell range instead (the focused cell at minimum), with no header line. `apiRef.current.copySelectedRows()` still copies rows. See [Cell Range Selection](cell-selection.md).

> **Note**: The shortcut only copies while focus is inside the grid (a cell, a header, the toolbar), so with several grids on a page only the one in use copies, and Ctrl+C elsewhere on the page is never taken over (v3.0). It is also ignored while an input, textarea, or another editable element has focus, and while the page has a text selection, which the browser copies as usual. `apiRef.current.copySelectedRows()` is not affected by focus.
>
> The shortcut works with Caps Lock on and on non-Latin keyboard layouts (the key in the "C" position). Ctrl+Shift+C and Ctrl+Alt+C are not copy shortcuts and are left alone. Focus stays where it was after the copy.

### Taking over the shortcut
- Call `event.preventDefault()` in your own `keydown` handler (on the element, `document`, or in the capture phase) and the grid leaves that Ctrl+C alone.
- Or pass `disableClipboardCopy` to turn the grid's shortcut off entirely. `apiRef.current.copySelectedRows()` still works.

```tsx
<DataGrid rows={rows} columns={columns} disableClipboardCopy />
```

---

## 🛠️ Usage

### Auto-Integration
If `checkboxSelection` is enabled and rows are selected, pressing `Ctrl + C` will copy those rows.

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  checkboxSelection
/>
```

### Programmatic Copy
Call `apiRef.current.copySelectedRows()`, for example from a custom toolbar button. The promise resolves once the text is written (or straight away, writing nothing, when no selected row is found) and **rejects when the browser refuses the write**, so you can tell the user.

```tsx
import { DataGrid, useGridApiRef } from '@opencorestack/opengridx';

function MyGrid({ rows, columns }) {
  const apiRef = useGridApiRef();

  const copy = async () => {
    try {
      await apiRef.current.copySelectedRows();
      showToast('Copied');
    } catch {
      showToast('The browser blocked the clipboard');
    }
  };

  return (
    <>
      <button onClick={copy}>Copy to Clipboard</button>
      <DataGrid rows={rows} columns={columns} apiRef={apiRef} checkboxSelection />
    </>
  );
}
```

`copySelectedRows()` reads the latest selection, so it can be called right after `apiRef.current.selectRows(ids)` or from `onRowSelectionModelChange`.

---

## ⚙️ How it Works

1. **Header Row**: The first line of the copied content includes the column header names (`headerName`, else `field`).
2. **Data Transformation**: The grid iterates through the selected rows and columns:
   - **Exclusions**: Hidden columns, grid system columns (checkbox, expand, reorder, the `groupingColDef` column) and `exportable: false` columns are excluded. Synthetic group rows are never copied.
   - **Values**: `valueGetter` runs first, then `valueFormatter` (also for empty values, as in the cells). Empty values are written as empty cells.
3. **TSV Generation**: Fields are joined by tabs (`\t`), and rows are joined by newlines (`\n`). A field that holds a tab, a line break or a double quote is wrapped in double quotes, with inner quotes doubled (`say "hi"` → `"say ""hi"""`), so the pasted table keeps its rows and columns.
4. **Clipboard API**: Uses `navigator.clipboard.writeText`. When it is missing (plain `http:` pages) or rejects, a hidden-textarea `document.execCommand('copy')` fallback runs; focus and the page selection are restored afterwards.

> **Formulas**: copy reproduces what the grid shows and does **not** neutralise formulas. A copied value that starts with `=`, `+`, `-` or `@` may be evaluated as a formula when pasted into Excel, Google Sheets or LibreOffice. The file exports (CSV, Excel, and the others) do neutralise such text by prefixing `'`; use an export when the data comes from untrusted input.

---

## 📊 Example Output
If you copy a grid with three rows, the clipboard content will look like this:

```text
ID	Name	Email	Status
1	Jon Snow	jon@winterfell.com	Active
2	Cersei Lannister	cersei@kingslanding.com	Inactive
3	Jaime Lannister	jaime@kingslanding.com	Active
```

When pasted into Excel or Google Sheets, this content will automatically be distributed into the correct cells.
