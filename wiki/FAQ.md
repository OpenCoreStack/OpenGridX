# FAQ & Troubleshooting

### The grid is unstyled, or scrolls the whole page instead of itself

The stylesheet isn't imported. Add this once, in your app's root file:

```tsx
import '@opencorestack/opengridx/styles';
```

### Scrolling is slow / every row is in the DOM

The grid's container has no bounded height, so the grid grows to fit all rows and virtualization has nothing to do. Give it a `height` prop, or put it in a container with a definite height and `min-height: 0` on every flex or grid item in between. Development builds log a warning about this. See [Virtualization](Virtualization#the-grid-needs-a-bounded-height).

Pagination hides the problem (each page is short), and row grouping turns pagination off, which is often when it first shows up.

### The grid has zero height or collapses

Without a `height` prop the grid fills its parent. A parent with no height of its own (for example a plain `div` in an auto-height page) gives it nothing to fill. Set a height on the parent or pass `height`.

### Does it work with React 18?

Yes. React 18 and 19 are supported, and every release is tested in apps on both versions before it is published.

### Does it work with Next.js?

Yes, as a client component. Render `DataGrid` from a file that starts with `'use client'`, and import the stylesheet in `app/layout.tsx`.

### Do I need `exceljs` or `jspdf`?

Only for `exportToExcelAdvanced` (`exceljs`) and `exportToPdf` (`jspdf` and `jspdf-autotable`). They are optional peer dependencies, loaded on demand, and never bundled. CSV, JSON, basic Excel and print exports need nothing extra.

### My rows have no `id` field

Pass `getRowId`: `getRowId={(row) => row.code}`. The id only keys the grid's internal store; it is never written onto your row.

### A big PDF export freezes the page

Since 3.2.0 `exportToPdf` works in short slices and keeps the page responsive, with `onProgress` and an `AbortSignal` for a progress bar and a cancel button. Above `maxRows` (20,000 by default) a development warning suggests CSV or Excel, which are much faster for large data. See [PDF Export](PDF-Export).

### `params.row._hasChildren` (or another underscore field) is undefined after upgrading

3.0 stopped writing fields onto your rows. Hierarchy information is in `params.rowMeta`. See [Migrating v2 → v3](Migrating-v2-to-v3).

### I want a custom sort order

Use `sortComparator` on the column (3.1.0+). It receives the two values plus their row params and sorts ascending; the grid reverses it for descending. See [Sorting & Pagination](Sorting-and-Pagination).

### How do I auto-size a column?

Double-click the column's resize handle (or focus it and press Enter), or call `apiRef.current.autosizeColumn(field)` / `autosizeColumns()` (3.1.0+). Only rendered rows are measured.

### I found a bug

[Open an issue](https://github.com/OpenCoreStack/OpenGridX/issues/new/choose) with a minimal reproduction. For security problems, report privately instead: see the [security policy](https://github.com/OpenCoreStack/OpenGridX/blob/main/SECURITY.md).
