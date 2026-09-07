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
| `selectedRows` | `(string \| number)[]` | — | Export only rows with these IDs |
| `aggregationResult` | `Record<string, unknown>` | — | From `apiRef.current.getAggregationResult()` |
| `aggregationModel` | `GridAggregationModel` | — | From `apiRef.current.getAggregationModel()` |
| `filterModel` | `GridFilterModel` | — | From `apiRef.current.getFilterModel()` |
| `alternateRowColor` | `boolean` | `true` | Alternating row background shading |
| `headerBackgroundColor` | `string` | `'#4f46e5'` | Column header cell background (hex) |
| `headerTextColor` | `string` | `'#ffffff'` | Column header cell text color (hex) |
| `fontSize` | `number` | `9` | Body cell font size in points |

## Column Exclusion

Columns with `exportable: false` are excluded automatically:

```ts
{ field: 'internalNotes', headerName: 'Notes', exportable: false }
```

System columns (`__check__`, `__actions__`) are also always excluded.

## Troubleshooting

**Error: "exportToPdf requires 'jspdf' and 'jspdf-autotable'"**

Run: `npm install jspdf jspdf-autotable`

**Logo not appearing**

Ensure `logoUrl` is a data URI (base64-encoded) or an absolute URL that is CORS-accessible. Relative paths may fail in some environments.

## Exporting unfiltered data

`getVisibleRows()` returns only rows that pass the current filter. Use `getAllRows()` if you want to export all data regardless of active filters.
