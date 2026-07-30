# `<GridErrorOverlay />`

Internal component rendered when a `GridDataSource` fetch fails. Displays an error icon, a human-readable message, and a **Retry** button that calls `window.location.reload()`.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `error` | `{ message?: string } \| null` | The error object from `state.dataSource.error`. When `null` the component renders nothing (`null` return). |

## 🔄 When it renders

`GridErrorOverlay` only appears when using a server-side `dataSource` prop. When a fetch throws, DataGrid catches the error and stores it in internal state. The overlay replaces the row viewport until the user retries.

```tsx
<DataGrid
    dataSource={{
        getRows: async ({ filterModel, sortModel, paginationModel }) => {
            const res = await fetch('/api/employees');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }
    }}
/>
```

If `getRows` throws, the overlay renders with the thrown error's `message`.

## ♿ Accessibility

The overlay container uses `role="alert"` and `aria-live="assertive"` so screen readers announce the error immediately when it appears.

## 🎨 Customizing

`GridErrorOverlay` is not currently exposed as a configurable slot. To implement custom error handling, catch errors in your `dataSource.getRows` and manage the error display in your own component wrapping the grid.

## 🔗 Related
- [DataGrid](datagrid.md)
- [Data Source](../features/data-source.md)
- [Loading States](../features/loading-states.md)
