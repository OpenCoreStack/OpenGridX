# 💾 State Persistence

Save and restore the grid's configuration (sorting, filtering, column order, etc.) to provide a consistent experience for returning users.

---

## 🏗️ The `initialState` Prop

You can pre-configure the grid status on mount using the `initialState` prop. Every part is optional, including each field of `columns`.

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  initialState={{
    sorting: {
      sortModel: [{ field: 'name', sort: 'asc' }]
    },
    filter: {
      filterModel: { items: [{ field: 'age', operator: '>', value: 30 }] }
    },
    columns: {
      columnVisibilityModel: { age: false }
    },
    density: { density: 'compact' }
  }}
/>
```

`initialState` is read once, when the grid mounts. It seeds the grid's own (uncontrolled) state, so it has no effect on a model you also pass as a prop (`sortModel`, `filterModel`, `paginationModel`, …), and the `density` prop wins over `initialState.density`.

---

## ⚓ The `useGridStateStorage` Hook

OpenGridX provides a built-in hook to simplify `localStorage` persistence.

```tsx
import { DataGrid, useGridStateStorage } from '@opencorestack/opengridx';

export default function MyGrid() {
  const { initialState, onStateChange, clearState } = useGridStateStorage('my-app-storage-key');

  return (
    <>
      <button type="button" onClick={clearState}>Forget saved layout</button>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={initialState}
        onStateChange={onStateChange}
      />
    </>
  );
}
```

Writes are debounced (`debounceMs`, default 300 ms), and a pending write is flushed when the component unmounts. When the browser blocks storage (cookie blocking, sandboxed iframes), the hook falls back to no persistence instead of throwing.

Options (pass an object instead of the key string):

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `key` | `string` | — | Storage key. |
| `debounceMs` | `number` | `300` | Delay before a state change is written. |
| `include` | `(keyof GridState)[]` | all | Only persist these parts, e.g. `['sorting', 'columns']`. |
| `storage` | `{ getItem, setItem, removeItem }` | `window.localStorage` | Any Storage-like object (e.g. `sessionStorage`). |

`clearState()` removes the saved state and cancels any pending write, so the old state is not written back afterwards. It does not reset the mounted grid, and the grid's next state change is saved again; remount the grid (for example with a new `key`) to start from defaults.

### Server-side rendering (Next.js, Remix)

`useGridStateStorage` is client-only. It reads storage in its initial render, so on the server `initialState` is empty while the browser's first render already has the saved state: when saved state exists, React reports a hydration mismatch (the sort arrows, column order or page differ). Render the persisted grid only after mount, for example:

```tsx
function PersistedGrid() {
  const { initialState, onStateChange } = useGridStateStorage('my-app-storage-key');
  return <DataGrid rows={rows} columns={columns} initialState={initialState} onStateChange={onStateChange} />;
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <PersistedGrid /> : <GridPlaceholder />;
}
```

In Next.js, `dynamic(() => import('./PersistedGrid'), { ssr: false })` does the same.

### Changing the key

The grid reads `initialState` only when it mounts. If the key can change while the grid stays on screen (a per-user or per-view key), remount the grid with the key so it starts from the new key's saved state:

```tsx
const storageKey = `grid-${userId}`;
const { initialState, onStateChange } = useGridStateStorage(storageKey);

<DataGrid key={storageKey} rows={rows} columns={columns} initialState={initialState} onStateChange={onStateChange} />
```

Without the remount the grid keeps its current state, and its next change is saved under the new key.

### Server-side rendering

The hook reads storage during the first render. On the server there is no storage, so the server HTML uses the default state while the client's first render uses the saved one, and React reports a hydration mismatch. If users can have saved state, render the persisted grid on the client only (for example after mount, or with Next.js `dynamic(..., { ssr: false })`). The [migration guide, §26](../migration/v2-to-v3.md#26-state-persistence) has a complete example.

---

## 📡 Tracking Changes

Use the `onStateChange` callback to listen for modifications to the grid state and save them to `localStorage` or a database. It fires once on mount and then whenever the state's *value* changes — re-rendering the grid with equal (even inline) props does not fire it, so storing the state in parent React state is safe.

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  onStateChange={(state) => {
    localStorage.setItem('grid-state', JSON.stringify(state));
  }}
/>
```

---

## 🧩 Supported State Objects

The following features support state persistence (they appear in the `onStateChange` payload and are restored from `initialState`):
- **Sorting**: `sortModel`
- **Filtering**: `filterModel`
- **Pagination**: `paginationModel`
- **Columns**: `columnVisibilityModel`, `columnOrder`, `pinnedColumns`, `columnWidths`
- **Density**: `density`

Only your own columns appear in the column state: the grid's synthetic grouping column (added by `groupingColDef`) is never included.
