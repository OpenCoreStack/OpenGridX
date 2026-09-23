# PDF Export

Generate a styled PDF report from grid data using `exportToPdf()`.

## Installation

`exportToPdf` requires two optional peer dependencies:

```bash
npm install jspdf jspdf-autotable
```

## Basic Usage

```tsx
import { exportToPdf, useGridApiRef } from '@opencorestack/opengridx';

function MyGrid() {
    const apiRef = useGridApiRef();

    const handleExport = async () => {
        await exportToPdf(
            apiRef.current.getVisibleRows(),
            apiRef.current.getVisibleColumns(),
            { fileName: 'my-report', title: 'Sales Report' }
        );
    };

    return (
        <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            slots={{
                toolbar: () => (
                    <GridToolbar
                        renderExportButton={() => (
                            <button onClick={handleExport}>Export PDF</button>
                        )}
                    />
                ),
            }}
        />
    );
}
```

## Full Example with All Options

```tsx
await exportToPdf(
    apiRef.current.getVisibleRows(),
    apiRef.current.getVisibleColumns(),
    {
        fileName: 'employee-report',
        title: 'Employee Report',
        logoUrl: '/logo.png',               // data URI or URL
        orientation: 'landscape',           // 'portrait' | 'landscape'
        aggregationResult: apiRef.current.getAggregationResult(),
        aggregationModel: apiRef.current.getAggregationModel(),
        filterModel: apiRef.current.getFilterModel(),
        selectedRows: apiRef.current.getSelectedRows(),  // already GridRowId[]
        alternateRowColor: true,
        headerBackgroundColor: '#1e40af',
        headerTextColor: '#ffffff',
        fontSize: 9,
    }
);
```

## `PdfExportOptions` Reference

| Property | Type | Default | Description |
|:---|:---|:---|:---|
| `fileName` | `string` | `'export'` | Output filename without `.pdf` extension |
| `title` | `string` | — | Adds a branded header block above the table |
| `logoUrl` | `string` | — | Data URI or URL for a logo image (requires `title`) |
| `orientation` | `'portrait' \| 'landscape'` | `'landscape'` | Page orientation |
| `selectedRows` | `(string \| number)[]` | — | Export only rows with these IDs. Takes precedence over `groupedRows`; the footer totals are recomputed over the selected rows (v3.0+) |
| `aggregationResult` | `Record<string, unknown>` | — | From `apiRef.current.getAggregationResult()` |
| `aggregationModel` | `GridAggregationModel` | — | From `apiRef.current.getAggregationModel()` |
| `filterModel` | `GridFilterModel` | — | From `apiRef.current.getFilterModel()`. Summarised under the title (see below) |
| `groupedRows` | `GridGroupedExportRow[]` | — | From `apiRef.current.getGroupedExportRows()`: group headers, subtotals and a grand-total footer |
| `alternateRowColor` | `boolean` | `true` | Alternating row background shading |
| `headerBackgroundColor` | `string` | `'#4f46e5'` | Column header cell background (`#rrggbb` or `#rgb`). Invalid values fall back to the default |
| `headerTextColor` | `string` | `'#ffffff'` | Column header cell text color (`#rrggbb` or `#rgb`). Invalid values fall back to the default |
| `fontSize` | `number` | `9` | Body cell font size in points |
| `font` | `{ name: string; data: string; boldData?: string }` | — | A TrueType font (base64 `.ttf`) for text outside Latin-1 (v3.0+). See [Non-Latin text](#non-latin-text-and-unicode-fonts) |

## Totals and filter summary

- The footer shows `TOTAL` in the first column; when the first column has its own aggregate, the value is kept next to it (`TOTAL: 30`). Grouped `Subtotal` and `Grand Total` rows do the same.
- `count` and `unique` are plain counts, not run through the column's `valueFormatter`. `sum`, `avg`, `min` and `max` use the formatter; if it throws (e.g. it reads a data-row field), the value is formatted like the grid footer instead of aborting the export. See [Aggregate values](export-guide.md#aggregate-values).
- The filter line under the title lists the applied filter as the grid evaluates it: `A equals "1" OR (B contains "x" AND C isEmpty) • Search: "acme"` — nested groups in parentheses, the model's logic operator, and the quick-search terms. Rules without a value (an unfinished row in the filter panel) are left out. Long titles and filter lines wrap within the page margins.

## Non-latin text and Unicode fonts

jsPDF's built-in Helvetica font only covers Latin-1 and the WinAnsi punctuation (`é`, `ü`, `€`, `“ ”`, `•`). A string with any other character used to come out entirely garbled; since v3.0 only the undrawable characters are replaced with `?` (special spaces and the minus sign become their ASCII forms, so `fr-FR` totals such as `1 234 567` print correctly) and a console warning is logged.

To print `₹`, Greek, Cyrillic, CJK or Devanagari text, pass a Unicode TrueType font such as [Noto Sans](https://fonts.google.com/noto) as base64:

```tsx
const toBase64 = async (url: string) => {
    const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary);
};

await exportToPdf(rows, columns, {
    title: 'बिक्री रिपोर्ट',
    font: {
        name: 'NotoSans',
        data: await toBase64('/fonts/NotoSans-Regular.ttf'),
        boldData: await toBase64('/fonts/NotoSans-Bold.ttf'), // optional; the regular face is used for bold otherwise
    },
});
```

jsPDF does not shape complex scripts, so Devanagari or Arabic conjuncts may not join.

## Column Exclusion

Columns with `exportable: false` are excluded automatically:

```ts
{ field: 'internalNotes', headerName: 'Notes', exportable: false }
```

System columns (`__check__`, `__actions__`) and spacer columns (`isSpacer: true`) are also always excluded.

## Troubleshooting

**Error: "exportToPdf requires 'jspdf' and 'jspdf-autotable'"**

Run: `npm install jspdf jspdf-autotable`

**Logo not appearing**

Ensure `logoUrl` is a data URI (base64-encoded) or an absolute URL that is CORS-accessible. Relative paths may fail in some environments.

## Exporting unfiltered data

`getVisibleRows()` returns only rows that pass the current filter. Use `getAllRows()` if you want to export all data regardless of active filters.
