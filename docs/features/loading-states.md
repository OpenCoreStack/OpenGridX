# ⏳ Loading States & Performance

OpenGridX provides multiple ways to handle data loading, from initial shimmers to background fetching.

---

## 🦴 Skeleton Loading

The grid features a smart skeleton loader that automatically calculates the number of columns and rows needed to fill the viewport.

### Usage
```tsx
<DataGrid loading={true} />
```

### Features
- **Dynamic Calculation**: Skeletons match the current column widths and configuration.
- **Shimmer Animation**: Uses a CSS-optimized animation for a premium feel.
- **Auto-Fill**: Fills the entire visible height if `rows` are empty.

### Loading with rows already shown
When `loading` is true (or a data source request is running) and the grid already has rows, for example during a reload or a server-side sort, the rows stay visible and usable and a thin progress bar (`role="progressbar"`, class `ogx__loading-bar`) runs along the top of the grid. Pass `slots.loadingOverlay` to show your own indicator centred over the rows instead. Infinite scroll keeps its own indicator (skeleton rows at the bottom).

List view follows the same rules: while loading it shows a progress bar or `slots.loadingOverlay`, never the "No rows" state.

---

## ♾️ Infinite Loading

For large datasets, use the `paginationMode="infinite"` to load data as the user scrolls.

- **Trigger**: Fired when the user scrolls near the bottom of the grid.
- **Feedback**: Displays skeleton rows at the bottom while new data is being fetched.
- **Guide**: See [Infinite Scroll Guide](./infinite-scroll.md) for full implementation details.

---

## 💤 Lazy Loading (Viewport)

Unlike infinite scroll which appends data to the end, Lazy Loading fetches specific chunks based on the user's current scroll position (viewport).

- **Benefit**: Best for datasets with millions of records where users might "jump" to the middle of the scrollbar.
- **Implementation**: Managed via the `GridDataSource` and `rowCount` props.

---

## 🔍 Global Search (Quick Filter)

Quickly filter the entire dataset across all visible columns. This is managed via the `GridToolbar`.

### Basic Setup

Add the toolbar and wire a filter model — the toolbar's search bar activates automatically when `onFilterModelChange` is wired:

```tsx
<DataGrid
  slots={{ toolbar: GridToolbar }}
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
/>
```

### Controlled Search
You can also control the search value externally via the `filterModel`. Each entry is one term, and a row matches when every term is found in some visible column (the toolbar box splits typed text on whitespace the same way).

```tsx
<DataGrid
  filterModel={{
    items: [],
    quickFilterValues: ['john', 'london']
  }}
/>
```
