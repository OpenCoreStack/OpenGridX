# `<GridErrorOverlay />`

Internal component rendered when a `GridDataSource` fetch fails. Displays an error icon, a human-readable message, and a **Retry** button that runs the failed `getRows` request again (v3.0+; it used to reload the whole page).

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `error` | `unknown` | The value the fetch rejected with (`state.dataSource.error`). When falsy the component renders nothing. |
| `onRetry` | `() => void` | Re-runs the request. DataGrid passes it whenever a `dataSource` is set; without it the Retry button is not shown. |

## 🔄 When it renders

`GridErrorOverlay` only appears when using a server-side `dataSource` prop. When a fetch throws, DataGrid catches the error and stores it in internal state. The overlay replaces the row viewport until a request succeeds: **Retry**, or any change that refetches (page, sort, filter). A failed children request of a server-side tree node does not show it.

```tsx
<DataGrid
    dataSource={{
        getRows: async ({ startRow, endRow, sortModel, filterModel }) => {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startRow, endRow, sortModel, filterModel }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json(); // { rows, rowCount }
        }
    }}
/>
```

If `getRows` throws, the overlay renders the rejection's `message`: an `Error`, a string, or any object with a string `message` (such as an HTTP-client error). Otherwise it shows a generic message.

## ♿ Accessibility

The overlay container uses `role="alert"` and `aria-live="assertive"` so screen readers announce the error immediately when it appears.

## 🎨 Customizing

`GridErrorOverlay` is not currently exposed as a configurable slot. To implement custom error handling, catch errors in your `dataSource.getRows` and manage the error display in your own component wrapping the grid.

## 🔗 Related
- [DataGrid](datagrid.md)
- [Data Source](../features/data-source.md)
- [Loading States](../features/loading-states.md)
