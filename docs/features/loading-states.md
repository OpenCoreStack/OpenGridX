# ⏳ Loading States & Performance

OpenGridX provides multiple ways to handle data loading, from initial shimmers to background fetching.

---

## 🦴 Skeleton Loading

While `loading` is true and there are no rows to show, the grid body shows ten animated skeleton rows laid out with the current columns.

### Usage
```tsx
<DataGrid rows={[]} columns={columns} loading />
```

### Features
- **Column-aware**: Skeleton cells use the current column widths, plus the checkbox, detail-panel and drag-handle columns when those are enabled. With no columns yet, placeholder columns fill the width.
- **Shimmer Animation**: Uses a CSS-optimized animation for a premium feel.
- **Custom overlay**: Pass `slots.loadingOverlay` to render your own component instead of the skeleton rows.

### Loading with rows already shown
When `loading` is true (or a data source request is running) and the grid already has rows, for example during a reload or a server-side sort, the rows stay visible and usable and a thin progress bar (`role="progressbar"`, class `ogx__loading-bar`) runs along the top of the grid. Pass `slots.loadingOverlay` to show your own indicator centred over the rows instead. Infinite scroll keeps its own indicator (skeleton rows at the bottom).

List view follows the same rules: while loading it shows a progress bar or `slots.loadingOverlay`, never the "No rows" state.

---

## ♾️ Infinite Loading

For large datasets, use the `paginationMode="infinite"` to load data as the user scrolls.

- **Trigger**: `onRowsScrollEnd` fires when the user scrolls near the bottom; advance `paginationModel.page` there and the `dataSource` loads the next rows.
- **Feedback**: Displays skeleton rows at the bottom while new data is being fetched.
- **Guide**: See [Infinite Scroll Guide](./infinite-scroll.md) for full implementation details.

---

## 🔍 Global Search (Quick Filter)

Quickly filter the rows across all visible, filterable columns. The search box is part of `GridToolbar`.

### Basic Setup

Add the toolbar. The search box filters the grid on its own; pass `filterModel` / `onFilterModelChange` only when you want to control or observe the filter:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}
/>
```

### Controlled Search
You can also control the search value externally via the `filterModel`. Each entry is one term, and a row matches when every term is found in some visible column (the toolbar box splits typed text on whitespace the same way).

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  filterModel={{
    items: [],
    quickFilterValues: ['john', 'london']
  }}
/>
```
