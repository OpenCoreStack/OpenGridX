# `<GridEmptyState />`

Internal component rendered when the grid has no rows to display. Replaces the row viewport with a centered icon and message.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `noRowsLabel` | `string` | Text shown beneath the empty-state icon. Controlled by the `noRowsLabel` DataGrid prop. |
| `width` | `number` | Pixel width of the empty-state container, matched to the grid's total column width. |
| `overlay` | `ReactNode` | The rendered `noRowsOverlay` slot, shown instead of the icon and label. |

## 🔄 When it renders

`GridEmptyState` renders when no row passes the filter, the grid is not loading and no data-source error is shown. The loading state takes precedence — while `loading` (or a `dataSource` request) is pending the skeleton rows (or the `loadingOverlay` slot) are shown instead, and a `dataSource` error shows the error overlay.

## 🎨 Customizing via slot

Replace the default empty state with any React component using the `noRowsOverlay` slot:

```tsx
function MyEmptyState() {
    return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No results match your filter.</p>
            <button onClick={clearFilters}>Clear filters</button>
        </div>
    );
}

<DataGrid
    slots={{ noRowsOverlay: MyEmptyState }}
    slotProps={{ noRowsOverlay: { /* custom props if needed */ } }}
/>
```

## 💬 Custom label (without a full slot replacement)

To only change the message text without replacing the whole component, use `noRowsLabel`:

```tsx
<DataGrid
    noRowsLabel="No employees found for this department."
/>
```

Default value: `"No Data"`

## 🔗 Related
- [DataGrid](datagrid.md)
- [Loading States](../features/loading-states.md)
