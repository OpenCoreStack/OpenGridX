# Export Functionality Guide

The DataGrid provides built-in export utilities for multiple formats. The standard exports (CSV, JSON, Print, basic Excel) have **zero dependencies**. The advanced Excel export uses [ExcelJS](https://github.com/exceljs/exceljs) loaded lazily.

## Available Export Formats

| Format | Function | Deps | Description |
|---|---|---|---|
| CSV | `exportToCsv` | none | Comma-separated values |
| Excel (basic) | `exportToExcel` | none | HTML-table `.xls` trick |
| **Excel (advanced)** | `exportToExcelAdvanced` | ExcelJS (lazy) | Real `.xlsx` with styles, types, multi-sheet |
| JSON | `exportToJson` | none | Structured JSON |
| Print | `printGrid` | none | Browser print dialog |

---

## Quick Start

```tsx
import { exportToCsv, exportToExcel, exportToExcelAdvanced, exportToJson, printGrid } from '@opencorestack/opengridx';

// CSV
exportToCsv(rows, columns, { fileName: 'data.csv' });

// Basic Excel (no deps)
exportToExcel(rows, columns, { fileName: 'data.xlsx' });

// Advanced Excel (ExcelJS, lazy-loaded)
await exportToExcelAdvanced(rows, columns, { fileName: 'data.xlsx' });

// JSON
exportToJson(rows, columns, { fileName: 'data.json', pretty: true });

// Print
printGrid(rows, columns, 'My Report');
```

---

## 1. `exportToCsv`

```tsx
import { exportToCsv } from '@opencorestack/opengridx';

exportToCsv(rows, columns, {
  fileName: 'employees.csv',
  includeHeaders: true,
  delimiter: ',',
  selectedRows: [1, 2, 3],           // export only these IDs
  aggregationResult: aggResult,       // adds SUM/AVG totals row
  aggregationModel: { salary: 'sum' },
});
```

**`CsvExportOptions`:**

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.csv'` | Output filename |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `delimiter` | `string` | `','` | Field delimiter |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs |
| `aggregationResult` | `object \| null` | — | Aggregation values row |
| `aggregationModel` | `object \| null` | — | Labels for aggregation row |

---

## 2. `exportToExcel` (basic)

HTML-table approach, no external libraries. Opens reliably in Excel and Numbers but as a legacy `.xls` format.

```tsx
import { exportToExcel } from '@opencorestack/opengridx';

exportToExcel(rows, columns, {
  fileName: 'report.xls',
  sheetName: 'Data',
  includeHeaders: true,
  aggregationResult: aggResult,
  aggregationModel: { salary: 'sum' },
});
```

**`ExcelExportOptions`:**

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.xlsx'` | Output filename |
| `sheetName` | `string` | `'Sheet1'` | Sheet tab name |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs |
| `aggregationResult` | `object \| null` | — | Aggregation values row |
| `aggregationModel` | `object \| null` | — | Labels for aggregation row |

---

## 3. `exportToExcelAdvanced` ⭐ (recommended)

Generates a **real `.xlsx`** file using ExcelJS, loaded lazily (zero bundle-size impact unless called).

```tsx
import { exportToExcelAdvanced } from '@opencorestack/opengridx';

// Simple — single sheet, all defaults
await exportToExcelAdvanced(rows, columns, {
  fileName: 'employees.xlsx',
});

// Full options — multi-sheet, custom styles
await exportToExcelAdvanced(rows, columns, {
  fileName: 'full-report.xlsx',

  sheets: [
    {
      name: 'All Employees',
      rows: 'all',              // or 'selected'
      includeHeaders: true,
      includeSummary: true,     // aggregation totals at bottom
      autoFilter: true,         // dropdown filter buttons in header
      frozenHeader: true,       // freeze row 1
      alternateRowColor: '#f8fafc',
    },
    {
      name: 'Selected Rows',
      rows: 'selected',
      includeHeaders: true,
    },
    {
      type: 'summary',          // standalone aggregation sheet
      name: 'Aggregation',
    },
  ],

  columnStyles: {
    salary:  { numFmt: '$#,##0.00', alignment: 'right' },
    bonus:   { numFmt: '$#,##0.00', alignment: 'right' },
    percent: { numFmt: '0.00%' },
    joinDate:{ numFmt: 'yyyy-mm-dd' },
  },

  headerFillColor: '#1e3a5f',   // header row background
  headerTextColor: '#e2e8f0',   // header row text
  headerFontSize: 11,
  bodyFontSize: 10,

  aggregationResult: aggResult,
  aggregationModel: { salary: 'sum', bonus: 'sum', score: 'avg' },
  selectedRows: rowSelectionModel,
});
```

### `ExcelAdvancedExportOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.xlsx'` | Output filename (`.xlsx` appended if missing) |
| `sheets` | `ExcelSheetDefinition[]` | `[{ name: 'Data', rows: 'all' }]` | Sheet definitions |
| `columnStyles` | `Record<string, ExcelColumnStyle>` | `{}` | Per-column style overrides |
| `headerFillColor` | `string` | `'#f1f5f9'` | Header row background (`#rrggbb`) |
| `headerTextColor` | `string` | `'#334155'` | Header row text color |
| `headerFontSize` | `number` | `10` | Header font size (pt) |
| `bodyFontSize` | `number` | `10` | Body font size (pt) |
| `aggregationResult` | `object \| null` | — | Aggregation totals |
| `aggregationModel` | `object \| null` | — | Aggregation function labels |
| `selectedRows` | `(string\|number)[]` | — | IDs for `rows: 'selected'` sheets |

### `ExcelSheetDefinition`

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Sheet tab name (max 31 chars) |
| `rows` | `'all' \| 'selected'` | `'all'` | Which rows to include |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `includeSummary` | `boolean` | `false` | Aggregation totals rows at bottom |
| `autoFilter` | `boolean` | `true` | Excel filter dropdowns on header |
| `frozenHeader` | `boolean` | `true` | Freeze row 1 |
| `alternateRowColor` | `string \| false` | `'#f8fafc'` | Odd-row fill. `false` to disable |

### `ExcelColumnStyle`

| Option | Type | Description |
|---|---|---|
| `numFmt` | `string` | Excel number format, e.g. `'$#,##0.00'`, `'0.00%'`, `'yyyy-mm-dd'` |
| `width` | `number` | Column width in characters (overrides auto) |
| `alignment` | `'left' \| 'center' \| 'right'` | Horizontal alignment |
| `embedImage` | `boolean` | If true, URL in cell is fetched and embedded as image |
| `imageWidth` | `number` | Width of embedded image (px, default: 40) |
| `imageHeight`| `number` | Height of embedded image (px, default: 40) |

### Summary Sheet

Pass `{ type: 'summary', name: 'My Sheet' }` in `sheets` to add a standalone aggregation sheet:

```
| Column       | Function | Value     |
|--------------|----------|-----------|
| Salary       | SUM      | $8,320,000|
| Bonus        | SUM      | $1,040,000|
| Perf. Score  | AVG      | 3.7       |
```

### Feature Comparison: Basic vs Advanced

| Feature | `exportToExcel` | `exportToExcelAdvanced` |
|---|---|---|
| True `.xlsx` format | ❌ HTML trick | ✅ |
| Native number cells | ❌ text | ✅ |
| Native date cells | ❌ text | ✅ |
| Native boolean cells | ❌ text | ✅ |
| Number format strings | ❌ | ✅ |
| Bold / colored header | ❌ CSS ignored | ✅ |
| Column widths | ❌ | ✅ auto from `colDef.width` |
| Frozen header row | ❌ | ✅ |
| Auto-filter dropdowns | ❌ | ✅ |
| Alternating row colors | ❌ | ✅ |
| Multi-sheet workbooks | ❌ | ✅ |
| Aggregation totals row | Inline text | ✅ styled |
| Standalone summary sheet | ❌ | ✅ |
| Bundle impact | Zero | Zero (lazy-loaded) |

---

## 4. `exportToJson`

```tsx
import { exportToJson } from '@opencorestack/opengridx';

exportToJson(rows, columns, {
  fileName: 'data.json',
  pretty: true,
  aggregationResult: aggResult,
  aggregationModel,
  selectedRows: [1, 2, 3],
});
```

When `aggregationResult` is provided, output shape becomes:
```json
{
  "data": [...],
  "aggregation": {
    "labels": { "salary": "SUM" },
    "values": { "salary": 8320000 }
  }
}
```

**`JsonExportOptions`:**

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.json'` | Output filename |
| `pretty` | `boolean` | `true` | Pretty-print with indentation |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs |
| `aggregationResult` | `object \| null` | — | Append aggregation object |
| `aggregationModel` | `object \| null` | — | Function labels |

---

## 5. `printGrid`

Opens a browser print dialog with a formatted table.

```tsx
import { printGrid } from '@opencorestack/opengridx';

// Simple
printGrid(rows, columns, 'Employee Report');

// With options
printGrid(rows, columns, {
  title: 'Q1 Report',
  selectedRows: [1, 2, 3],
  aggregationResult: aggResult,
  aggregationModel,
});
```

**`PrintOptions`:**

| Option | Type | Description |
|---|---|---|
| `title` | `string` | Print page title |
| `selectedRows` | `(string\|number)[]` | Print only these row IDs |
| `aggregationResult` | `object \| null` | Append totals |
| `aggregationModel` | `object \| null` | Label totals |

---

## Common Patterns

### Export with toolbar integration

```tsx
import { DataGrid, GridToolbar, exportToExcelAdvanced } from '@opencorestack/opengridx';

function MyGrid() {
  const [rows, setRows] = useState([...]);
  const [columns] = useState([...]);
  const [selected, setSelected] = useState([]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      rowSelectionModel={selected}
      onRowSelectionModelChange={setSelected}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          onExcelAdvanced: () => exportToExcelAdvanced(rows, columns, {
            fileName: 'report.xlsx',
            selectedRows: selected,
          }),
        },
      }}
    />
  );
}
```

### Multi-sheet with selection

```tsx
await exportToExcelAdvanced(rows, columns, {
  fileName: 'report.xlsx',
  sheets: [
    { name: 'All Data',      rows: 'all',      includeSummary: true },
    { name: 'Selected',      rows: 'selected', includeSummary: false },
    { type: 'summary',       name: 'Totals' },
  ],
  selectedRows: rowSelectionModel,
  aggregationResult: aggResult,
  aggregationModel: { salary: 'sum', bonus: 'sum' },
});
```

### Respect `valueFormatter` for styled columns

The advanced export keeps **raw values** for typed columns (`number`, `date`, `boolean`) so Excel can format them natively with `numFmt`. For `string` columns, `valueFormatter` is applied before writing.

```tsx
const columns: GridColDef[] = [
  {
    field: 'salary',
    type: 'number',             // ← raw number written to Excel
    valueFormatter: ({ value }) => `$${value.toLocaleString()}`, // used in CSV/print
  },
];

await exportToExcelAdvanced(rows, columns, {
  columnStyles: {
    salary: { numFmt: '$#,##0.00' },  // ← Excel formats the native number
  },
});
```

---

## Value Formatters

All export functions respect `valueFormatter` and `valueGetter`:

```tsx
const columns: GridColDef[] = [
  {
    field: 'fullName',
    valueGetter: ({ row }) => `${row.firstName} ${row.lastName}`,
  },
  {
    field: 'salary',
    valueFormatter: ({ value }) => `$${value.toLocaleString()}`,
  },
];
```

> **Note:** In `exportToExcelAdvanced`, `valueFormatter` is only applied for `string`-typed columns. For `number`/`date`/`boolean` columns, raw values are passed to Excel and formatted via `columnStyles.numFmt`.

---

## Excluding Columns

You can exclude specific columns (e.g., action buttons or menus) from all export formats using the `exportable` property in the column definition. System columns are also automatically excluded.

| Method | Description |
|---|---|
| `exportable: false` | Set in `GridColDef` to manually exclude any column |
| `__check__` | Native checkbox column (auto-excluded) |
| `__actions__` | Common field for action buttons (auto-excluded) |
| `isSpacer: true` | Spacer columns (auto-excluded) |

### Example
```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { 
    field: 'actions', 
    headerName: 'Actions', 
    exportable: false // This column won't appear in CSV/Excel/JSON/Print
  },
];
```

---

## Performance Notes

| Format | 10k rows | 100k rows |
|---|---|---|
| CSV | ~50ms | ~500ms |
| JSON | ~80ms | ~800ms |
| Excel (basic) | ~200ms | ~2s |
| Excel (advanced) | ~300ms | ~3s |
| Print | Best with paginated data | — |

---

## Browser Compatibility

All export functions work in:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

---

## See Also

- [Demo: Export Data](../demo/examples/ExportDemo.tsx)
- [Demo: Advanced Excel Export](../demo/examples/AdvancedExcelExportDemo.tsx)
- [Slots API Reference](./SLOTS_API.md)
- [Theming Guide](./THEMING.md)
