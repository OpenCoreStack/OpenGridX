# 📋 Clipboard & Copy/Paste

OpenGridX supports copying grid data directly to the clipboard. This feature allows users to effortlessly move data from the grid to external applications like Microsoft Excel, Google Sheets, or text editors.

## 📑 Overview
- **Zero Configuration**: Enabled by default with the standard `DataGrid`.
- **Selected Rows**: Only selected rows are copied when selection is active.
- **TSV Format**: Data is copied in Tab-Separated Values (TSV) format for maximum compatibility.
- **Value Formatters**: Respects `valueFormatter` for accurate data representation.

---

## ⌨️ Keyboard Shortcuts
Selection and copying follow standard spreadsheet metaphors:
| Shortcut | Action |
| :--- | :--- |
| `Ctrl + C` / `Cmd + C` | Copy currently selected rows to the clipboard. |

> **Note**: The copy action is ignored if an input, textarea, or another editable element currently has focus.

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
You can trigger a copy action programmatically using the exported hook if building a custom toolbar.

```tsx
import { useGridClipboard } from '@opencorestack/opengridx';

function MyCustomToolbar({ state, columns, getVisibleRows }) {
  const { copySelectedRows } = useGridClipboard({ state, columns, getVisibleRows });

  return (
    <button onClick={copySelectedRows}>
      Copy to Clipboard
    </button>
  );
}
```

---

## ⚙️ How it Works

1. **Header Row**: The first line of the copied content includes the column header names.
2. **Data Transformation**: The grid iterates through the selected rows and columns:
   - **Exclusions**: Special internal columns (checkboxes, expanders, etc.) are excluded.
   - **Formatting**: If a column has a `valueFormatter`, it is applied to the raw value before copying.
3. **TSV Generation**: Fields are joined by tabs (`\t`), and rows are joined by newlines (`\n`).
4. **Clipboard API**: Uses the modern `navigator.clipboard.writeText` API.

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
