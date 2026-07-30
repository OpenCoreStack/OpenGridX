# `<GridEmptyState />`

Internal component rendered when the grid has no rows to display. Replaces the row viewport with a centered icon and message.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `noRowsLabel` | `string` | Text shown beneath the empty-state icon. Controlled by the `noRowsLabel` DataGrid prop. |
| `width` | `number` | Pixel width of the empty-state container, matched to the grid's total column width. |

## 🔄 When it renders

`GridEmptyState` renders when `allRenderableRows.length === 0` and the grid is not in a loading state. The loading skeleton takes precedence — if `loading={true}` the skeleton rows are shown instead.

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

Default value: `"No rows"`

## 🔗 Related
- [DataGrid](datagrid.md)
- [Loading States](../features/loading-states.md)
