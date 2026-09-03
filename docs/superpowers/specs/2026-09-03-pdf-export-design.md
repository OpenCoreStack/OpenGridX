# OpenGridX Native PDF Export — Design Spec

**Date:** 2026-09-03  
**Version target:** v1.2.0  
**Status:** Approved — ready for implementation planning

---

## Overview

Add a `exportToPdf` utility function to the OpenGridX library that generates a styled, branded PDF report from grid data. The PDF output includes an optional branded header (logo, title, filter summary), a multi-page data table with repeating column headers, and an optional aggregation footer row.

The implementation follows the existing export utility pattern (`exportToCsv`, `exportToExcelAdvanced`): a pure async function in `lib/utils/export/`, no React dependency, optional peer dependencies lazy-imported at call time, zero bundle impact for non-PDF consumers.

**What is NOT in scope:**
- Any new DataGrid prop or slot (uses the existing `renderExportButton` slot on `GridToolbar`)
- Server-side PDF rendering
- Charts or sparklines in the PDF
- Per-cell custom rendering (cells export their formatted value, not their React output)

---

## 1. Public API

### `exportToPdf` function

**Location:** `lib/utils/export/exportToPdf.ts`

**Signature:**

```ts
export async function exportToPdf<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options?: PdfExportOptions
): Promise<void>
```

Triggers a browser file download of `<fileName>.pdf` on completion.

### `PdfExportOptions` interface

**Location:** `lib/types/index.ts` (alongside `CsvExportOptions`, `ExcelExportOptions`)

```ts
export interface PdfExportOptions {
    /**
     * Output filename without extension.
     * Default: 'export'
     */
    fileName?: string;

    /**
     * Title text displayed in the document header.
     * When omitted, no header block is rendered.
     */
    title?: string;

    /**
     * URL or data URI of a logo image rendered left of the title.
     * Only used when `title` is also set.
     * Default: none
     */
    logoUrl?: string;

    /**
     * Page orientation.
     * Default: 'landscape'
     */
    orientation?: 'portrait' | 'landscape';

    /**
     * If provided, only rows whose id is in this array are exported.
     * Default: all rows exported
     */
    selectedRows?: (string | number)[];

    /**
     * Aggregation result object from `apiRef.current.getAggregationResult()`.
     * When provided alongside `aggregationModel`, an aggregation footer row is appended.
     */
    aggregationResult?: Record<string, unknown> | null;

    /**
     * Aggregation model from `apiRef.current.getAggregationModel()`.
     * Used to determine which columns show aggregated values in the footer.
     */
    aggregationModel?: GridAggregationModel | null;

    /**
     * Active filter model from `apiRef.current.getFilterModel()`.
     * When provided, a human-readable filter summary is shown below the title.
     */
    filterModel?: GridFilterModel | null;

    /**
     * Whether to apply alternating row background shading.
     * Default: true
     */
    alternateRowColor?: boolean;

    /**
     * Background color of column header cells (hex string).
     * Default: '#4f46e5'
     */
    headerBackgroundColor?: string;

    /**
     * Text color of column header cells (hex string).
     * Default: '#ffffff'
     */
    headerTextColor?: string;

    /**
     * Base font size in points for table body cells.
     * Default: 9
     */
    fontSize?: number;
}
```

**Column filtering:** Columns with `exportable: false` are excluded. Columns are exported in the order returned by the `columns` argument (caller passes `apiRef.current.getVisibleColumns()` for visible order).

**Value resolution:** Each cell value is resolved using the column's `valueGetter` (if defined) and then formatted using `valueFormatter` (if defined), identical to the existing CSV export logic. The resolved string value is written to the PDF cell.

---

## 2. Architecture

### File changes

| File | Change |
|:---|:---|
| `lib/utils/export/exportToPdf.ts` | New file — implementation |
| `lib/utils/export/index.ts` | Add `export { exportToPdf } from './exportToPdf'` and `export type { PdfExportOptions } from './exportToPdf'` |
| `lib/types/index.ts` | Add `PdfExportOptions` interface |
| `lib/index.ts` | Add `exportToPdf` and `PdfExportOptions` to public exports |
| `package.json` | Add `jspdf` and `jspdf-autotable` as optional peer dependencies |
| `demo/examples/PdfExportDemo/PdfExportDemo.tsx` | New demo page |
| `demo/App.tsx` | Register `/pdf-export` route under `'Main features'` |
| `docs/features/pdf-export.md` | New feature guide |
| `docs/API_REFERENCE.md` | Add `PdfExportOptions` section |
| `CHANGELOG.md` | Add `[1.2.0]` entry |
| `package.json` | Version bump `1.1.0` → `1.2.0` |
| `demo/App.tsx` header | Version label `v1.1.0` → `v1.2.0` |
| `demo/Home.tsx` badge | `OpenGridX v1.1.0` → `OpenGridX v1.2.0` |

### Peer dependency additions

```json
"peerDependencies": {
    "exceljs": ">=4.0.0",
    "jspdf": ">=2.5.0",
    "jspdf-autotable": ">=3.8.0"
},
"peerDependenciesMeta": {
    "exceljs": { "optional": true },
    "jspdf": { "optional": true },
    "jspdf-autotable": { "optional": true }
}
```

### Lazy import pattern

```ts
// Inside exportToPdf — no top-level import
const { default: jsPDF } = await import('jspdf');
await import('jspdf-autotable');  // registers autoTable on jsPDF.prototype as side effect
```

If either import fails (peer dep not installed), the function throws a descriptive error:
```
`exportToPdf` requires 'jspdf' and 'jspdf-autotable'. Run: npm install jspdf jspdf-autotable
```

### No DataGrid changes

The existing `renderExportButton` slot on `GridToolbar` is the integration point. No new props, slots, or hooks are added to `DataGrid`.

---

## 3. PDF Output Structure

### Page setup

- Paper size: A4
- Orientation: `options.orientation` (default: `'landscape'`)
- Margins: 14mm on all sides
- Font: Helvetica (built into jsPDF, no embedding required)

### Header block (conditional — only when `options.title` is set)

Rendered above the table using jsPDF draw calls (not autotable):

```
[LOGO 32px × 32px]   Title (18pt bold, color: #1e293b)
                     Exported: Sep 3, 2026  •  42 rows  (9pt, color: #64748b)
                     Filters: status is "active", year > 2024  (8pt, color: #64748b)
```

- Logo: rendered via `doc.addImage(logoUrl, 'PNG', x, y, 32, 32)` — only when `logoUrl` is set
- Row count: `${rows.length} row${rows.length !== 1 ? 's' : ''}`
- Filter summary: for each `filterModel.items`, renders `"${column.headerName} ${operator} ${value}"` joined by `" • "`. Omitted when `filterModel` is null/empty.
- Separator line: 0.3pt horizontal rule below header block, full page width

### Data table

Rendered via `jsPDF.autoTable()`:

```ts
doc.autoTable({
    head: [columnHeaders],
    body: rowData,
    foot: aggregationFooter,     // omitted when no aggregation
    startY: headerBlockHeight + 6,
    styles: { fontSize: options.fontSize ?? 9, cellPadding: 3 },
    headStyles: {
        fillColor: hexToRgb(options.headerBackgroundColor ?? '#4f46e5'),
        textColor: hexToRgb(options.headerTextColor ?? '#ffffff'),
        fontStyle: 'bold',
    },
    alternateRowStyles: options.alternateRowColor !== false
        ? { fillColor: [248, 250, 252] }   // #f8fafc
        : {},
    footStyles: {
        fillColor: [241, 245, 249],         // #f1f5f9
        fontStyle: 'bold',
    },
    columnStyles: computedColumnStyles,     // widths proportional to GridColDef.width/flex
    showFoot: aggregationFooter ? 'lastPage' : 'never',
    showHead: 'everyPage',
    didDrawPage: addPageNumber,             // page X of Y footer
})
```

**Column width calculation:**

Total usable page width (A4 landscape minus margins) = 267mm.

For each exported column:
- If `col.width` is set: proportional share = `col.width / totalDefinedWidth * 267`
- If `col.flex` is set: treated as `flex * 100` for proportion calculation
- Columns with neither: receive equal share of remaining width

**Aggregation footer row:**

For each exported column, if `aggregationModel[col.field]` is set, the aggregated value from `aggregationResult[col.field]` is placed in the footer cell. Non-aggregated columns show an empty string. The first row-label column (leftmost) shows `"TOTAL"` when at least one aggregation value is present.

**Page numbers:**

Added in `didDrawPage` callback:
```ts
doc.setFontSize(8);
doc.setTextColor(150);
doc.text(`Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
```

---

## 4. Demo Page

**Route:** `/pdf-export`  
**Category:** `'Main features'`  
**File:** `demo/examples/PdfExportDemo/PdfExportDemo.tsx`

### Dataset

50 employee rows: `id`, `name`, `department`, `salary` (number), `startDate` (date string), `status` (`'active' | 'inactive'`).

Columns:
- `name` — string, `width: 180`
- `department` — string, `width: 140`
- `salary` — number, `width: 120`, `valueFormatter: (v) => \`$${v.toLocaleString()}\``
- `startDate` — string, `width: 120`
- `status` — string, `width: 100`

Aggregation: `salary` → `sum`.

### Controls (above the grid)

| Control | What it does |
|:---|:---|
| **Export PDF** button | Calls `exportToPdf` with current state of all toggles |
| Title toggle | Includes/excludes `title: 'Employee Report'` |
| Logo toggle | Includes/excludes a base64-encoded placeholder logo data URL |
| Filter summary toggle | Includes/excludes `filterModel` from the grid's active state |
| Selected rows only toggle | Passes `selectedRows` when enabled (requires selecting rows in the grid first) |
| Aggregation footer toggle | Includes/excludes `aggregationResult` + `aggregationModel` |

### Grid setup

```tsx
<DataGrid
    apiRef={apiRef}
    rows={rows}
    columns={columns}
    pagination
    paginationModel={{ page: 0, pageSize: 10 }}
    checkboxSelection
    aggregation={{ salary: 'sum' }}
    filtering
    slots={{ toolbar: PdfExportToolbar }}
    slotProps={{ toolbar: { onExportPdf: handleExportPdf } }}
/>
```

The `PdfExportToolbar` renders a `<GridToolbar>` with `renderExportButton` wired to a styled "Export PDF" button.

---

## 5. Documentation

### `docs/features/pdf-export.md` (new)

Covers:
1. Installation — `npm install jspdf jspdf-autotable`
2. Basic usage — minimal code example (no options)
3. Full usage — example with title, logo, filters, aggregation
4. `PdfExportOptions` reference table
5. Integration with `GridToolbar` via `renderExportButton`
6. Accessing live grid state via `apiRef` (rows, columns, aggregation, filters)
7. Column exclusion via `exportable: false`
8. Troubleshooting — missing peer dep error message

### `docs/API_REFERENCE.md` additions

- `exportToPdf` function signature under the Utilities section
- `PdfExportOptions` interface table

### `CHANGELOG.md`

```markdown
## [1.2.0] — 2026-09-03

### Added
- `exportToPdf(rows, columns, options?)` — generate a styled PDF report from grid data.
  Requires peer dependencies `jspdf` and `jspdf-autotable`.
  Features: branded header (logo, title, filter summary), multi-page table with repeating
  headers, alternating row shading, aggregation footer row.
  See `docs/features/pdf-export.md`.
- New exported type: `PdfExportOptions`
```

---

## 6. Implementation Order

1. `PdfExportOptions` type + `lib/types/index.ts`
2. `exportToPdf` implementation + `lib/utils/export/exportToPdf.ts`
3. Wire into `lib/utils/export/index.ts` and `lib/index.ts`
4. Update `package.json` peer deps
5. Demo page `PdfExportDemo.tsx` + `demo/App.tsx` route
6. `docs/features/pdf-export.md`
7. `docs/API_REFERENCE.md` + `CHANGELOG.md` + version bump to 1.2.0

`npm run lint && npm run build` after every step.

---

## Breaking Changes

None. Pure additive change — new utility function, new optional peer deps, new demo.
