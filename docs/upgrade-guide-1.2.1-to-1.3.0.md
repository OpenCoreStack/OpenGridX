# OpenGridX — Upgrade Guide: v1.2.1 → v1.3.0

**Package**: `@opencorestack/opengridx`
**This guide covers**: `1.2.1 → 1.3.0` (historical reference — current version is `2.0.2`; see [`docs/migration/v1-to-v2.md`](./migration/v1-to-v2.md) for the v2 upgrade)

---

## Breaking changes

None. Every change in this guide is additive or a behavioral fix with an opt-out.

---

## Install

```bash
npm install @opencorestack/opengridx@1.3.0
# if using PDF export:
npm install jspdf jspdf-autotable
```

---

## v1.2.1 — PDF export

New `exportToPdf` function. Requires optional peer deps `jspdf` + `jspdf-autotable` — install only if you use PDF export. The main bundle is unaffected (lazy-loaded).

```ts
import { exportToPdf } from '@opencorestack/opengridx';

await exportToPdf(rows, columns, {
    fileName: 'report',
    title: 'My Report',
    orientation: 'landscape',          // 'portrait' | 'landscape'
    aggregationResult,                  // pass your aggregation totals
    aggregationModel,
    filterModel,
    selectedRows,                       // export only selected row ids
    headerBackgroundColor: '#4f46e5',
    headerTextColor: '#ffffff',
    alternateRowColor: true,
    fontSize: 9,
});
```

---

## v1.2.2 — `getAllFilteredRows()` + CellErrorBoundary fixes

### New `GridApi` method

`getAllFilteredRows()` returns all filtered+sorted rows regardless of the current pagination window. Use it for full-dataset exports without changing `pageSize`.

```ts
const allRows = apiRef.current.getAllFilteredRows();
exportToCsv(allRows, columns, { fileName: 'full.csv' });
```

### CellErrorBoundary fix

`renderCell` errors are now correctly caught per-cell — the grid keeps rendering the other cells. Previously the throw could escape the boundary in certain React render paths.

---

## v1.2.3 — `hideable: false` columns hidden from Columns panel

**Behavioral change — no code change required.**

Columns with `hideable: false` no longer appear as disabled rows in the GridToolbar Columns panel. They still render normally in the grid body and in all exports.

To restore the previous behavior (show them as permanently-disabled rows):

```tsx
<DataGrid
    slots={{ toolbar: GridToolbar }}
    slotProps={{ toolbar: { showNonHideableColumns: true } }}
    ...
/>
```

---

## v1.3.0 — Grouped export

When row grouping is active, you can export the grouped structure instead of a flat row list. All five export functions (`exportToCsv`, `exportToExcel`, `exportToJson`, `printGrid`, `exportToPdf`) support it via a new optional `groupedRows` parameter.

When `groupedRows` is absent the output is identical to the previous flat format — no migration needed for existing export calls.

### Usage

**Step 1** — retrieve the grouped row list from the API:

```ts
const groupedRows = apiRef.current.getGroupedExportRows();
// GridGroupedExportRow[] | null
// null when rowGroupingModel is not active
```

**Step 2** — pass it to any export function:

```ts
exportToCsv(rows, columns, {
    fileName: 'grouped.csv',
    groupedRows: groupedRows ?? undefined,
    aggregationModel: { salary: 'sum' },
});

exportToExcel(rows, columns, {
    fileName: 'grouped.xls',
    groupedRows: groupedRows ?? undefined,
});

exportToJson(rows, columns, {
    fileName: 'grouped.json',
    groupedRows: groupedRows ?? undefined,
});

printGrid(rows, columns, {
    groupedRows: groupedRows ?? undefined,
});

await exportToPdf(rows, columns, {
    fileName: 'grouped',
    groupedRows: groupedRows ?? undefined,
});
```

### Output structure per format

| Format | Grouped output |
|--------|---------------|
| CSV | Group header row → indented leaf rows → Subtotal row → Grand Total row |
| Excel | Shaded group-header rows → indented leaf rows → bold subtotal / grand-total rows |
| JSON | `{ groups: [{ group, rows, subtotals?, children? }], grandTotal? }` |
| Print | CSS-classed `.group-header` / `.group-subtotal` / `.grand-total` rows with `&nbsp;` indentation |
| PDF | Indented body rows + bold footer for grand total |

### New public type

```ts
interface GridGroupedExportRow {
    type: 'group-header' | 'leaf' | 'group-subtotal' | 'grand-total';
    depth: number;
    groupField?: string;
    groupValue?: unknown;
    aggregatedValues?: Record<string, unknown>;
    row?: GridRowModel;
}
```

### New `GridApi` method

```ts
getGroupedExportRows(): GridGroupedExportRow[] | null;
```

Returns a flat ordered list that preserves the grouping tree structure:
`group-header → leaf rows → group-subtotal` (repeated per group, nested for multi-level grouping) followed by a `grand-total` entry when aggregation is active. Returns `null` when `rowGroupingModel` is not set.
