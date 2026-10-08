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

---

## 📥 Paste from Excel and Google Sheets (v3.4)

With `cellSelection` on, **Ctrl/Cmd+V** pastes tab-separated text into the grid's **editable** cells. Each value is parsed for its column and saved like an edit: `valueSetter`, then `processRowUpdate` **once per row**, then the grid stores every row that succeeded in one update. Demo: **Paste from Excel** (`/clipboard-paste`).

```tsx
<DataGrid
  rows={rows}
  columns={columns}          // columns with editable: true
  cellSelection
  processRowUpdate={saveRow}
  onClipboardPaste={({ updated, skipped, failed, text }) =>
    toast(`${updated.length} rows updated, ${skipped.length} cells skipped`)}
/>
```

- Paste works while focus is in the grid and no editor is open. In an open editor, Ctrl/Cmd+V is the input's own paste.
- The grid reads the `paste` event (`text/plain`), so the browser asks for no clipboard permission.
- `disableClipboardPaste` turns the shortcut off. `apiRef.current.pasteText(text, anchor?)` still works, for a toolbar "Paste" button that reads the clipboard itself.

### Where values land

| Clipboard | Selection | Result |
| :--- | :--- | :--- |
| One value | One cell | That cell |
| One value | A range | Every cell of the range (Excel's "fill selection") |
| A block | One cell | The block, from that cell to the right and down |
| A block | A range | The block from the range's top-left cell; cells past the range, the last row or the last column are dropped |

No rows are created. Only displayed rows are reached: rows on other pages and inside collapsed groups are not. After the paste the pasted area becomes the selection, and one Ctrl/Cmd+Z undoes all of it (with `undoRedo`).

### How text is parsed

The clipboard is read as Excel and Sheets write it: tabs between columns, `\r\n` or `\n` between rows, quoted fields that may hold tabs, line breaks and doubled quotes. A trailing empty line is ignored. Each cell is then parsed for its column:

| Column type | Accepted | Otherwise |
| :--- | :--- | :--- |
| `string` (default), `image` | The text as is (an `image` column takes the URL) | — |
| `number` | `1234.5`, `1,234.5`, `-12`, `(12)`, `12%` (→ 0.12), `1e3`; currency symbols and spaces stripped | skipped, `'invalidValue'` |
| `date` | ISO `2026-10-07` (that local day), and what `Date.parse` accepts. The value keeps the kind the cell holds: a `Date`, a timestamp, or a `YYYY-MM-DD` string | skipped |
| `boolean` | `true`/`false`, `yes`/`no` (the grid's `Yes`/`No` labels), `1`/`0`, any case | skipped |
| `singleSelect` | An option value or an option label, any case; the option's value is stored | skipped |
| An empty cell | `null` for number, date, boolean and singleSelect; `''` for string | — |

`1,5` is not read as a number: in a decimal-comma locale use a `valueParser`.

### `valueParser`

`GridColDef.valueParser(text, { row, field, colDef })` replaces the parser for one column. Throw (or return `undefined`) to reject the text: the cell is skipped with reason `'invalidValue'`.

```tsx
{
  field: 'price',
  type: 'number',
  editable: true,
  // "1.234,5" → 1234.5
  valueParser: (text) => {
    const n = Number(text.replace(/[\s€]/g, '').split('.').join('').replace(',', '.'));
    if (Number.isNaN(n)) throw new Error('not a number');
    return n;
  },
}
```

### What is skipped

`result.skipped` lists every cell that was not written, with a reason:

| Reason | When |
| :--- | :--- |
| `'notEditable'` | The column is not `editable`, `isCellEditable` returned false, the row is a synthetic row (group header, subtotal, tree auto-parent, pivot Grand Total), or the cell is covered by a span |
| `'invalidValue'` | The text does not parse for the column type, or `valueParser` rejected it |

A row whose `valueSetter` or `processRowUpdate` throws or rejects is listed in `result.failed` and reported to `onProcessRowUpdateError`, as for a single edit; the other rows are still saved. Cells that already hold the pasted value are left alone.

### Events

- `onClipboardPaste(result)` fires after every paste, once every row has settled: `{ updated, failed, skipped, text }`.
- `onBeforeClipboardPaste({ text, anchor })` runs first. Return `false` to cancel the paste, or a string to paste instead (for example to strip a header line). A throw cancels the paste.
- Above 10,000 cells a paste logs a development warning.

---

## 🧹 Clear a range with Delete (v3.4)

With `cellSelection` on and a range of **more than one cell**, **Delete** or **Backspace** empties every editable cell of the range: `''` in string and image columns, `null` elsewhere. It is one batch edit through `valueSetter` and `processRowUpdate`, so one undo. Non-editable cells and synthetic rows are left alone. On a single cell nothing changes (Delete is not bound). `disableRangeClear` turns it off; `disableClipboardPaste` does not affect it.
