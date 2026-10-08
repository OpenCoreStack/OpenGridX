# Undo & Redo

`undoRedo` (v3.4) lets users undo and redo their cell edits, pastes and range clears. It is off by default: your app may already own Ctrl+Z, and undo writes data. Demo: **Undo & Redo** (`/undo-redo`).

```tsx
import { DataGrid, useGridApiRef, type GridHistoryChangeParams } from '@opencorestack/opengridx';

function Budget({ rows, columns, saveRow }) {
  const apiRef = useGridApiRef();
  const [history, setHistory] = useState<GridHistoryChangeParams>({ canUndo: false, canRedo: false, size: 0 });

  return (
    <>
      <button disabled={!history.canUndo} onClick={() => apiRef.current.undo()}>Undo</button>
      <button disabled={!history.canRedo} onClick={() => apiRef.current.redo()}>Redo</button>
      <DataGrid
        rows={rows}
        columns={columns}
        apiRef={apiRef}
        cellSelection               // for paste and range clear; undo works without it
        undoRedo                    // or { limit: 50 }; default 100 actions
        onHistoryChange={setHistory}
        processRowUpdate={saveRow}  // undo and redo save through it too
      />
    </>
  );
}
```

## Keys

| Key | Action |
| :--- | :--- |
| **Ctrl+Z** (Cmd+Z) | Undo |
| **Ctrl+Shift+Z** (Cmd+Shift+Z) or **Ctrl+Y** | Redo |

Only while focus is in the grid (a cell) and no editor is open. Inside an editor, a text field you render in a cell, or anywhere else on the page, the keys keep their native meaning (the input's own undo). After an undo or redo the affected cells become the selection (their bounding rectangle, with `cellSelection`; otherwise focus moves to the first one) and the first one is scrolled into view.

## What is recorded

Each committed action is a list of cell changes `{ id, field, before, after }`:

| Action | Recorded |
| :--- | :--- |
| A single-cell edit | 1 change |
| A paste or a range clear | Every cell that was written (skipped cells are not) |
| Values `processRowUpdate` changed itself (a recomputed `total`) | Not recorded: only the fields the user changed. Your recomputation runs again on undo |

An action is recorded **only after `processRowUpdate` succeeded**, with `after` read from the stored row through `valueGetter`. A row that `processRowUpdate` rejected is not recorded, so history never claims a change your app refused. A change whose stored value equals the old one (for example normalised back by `processRowUpdate`) is not recorded either.

A new action after an undo clears the redo stack. Beyond `limit` actions the oldest is dropped.

**Not undoable:** sorting, filtering, column changes, row reordering, row selection and cell selection. These are view state, not data.

## How undo writes

Undo writes the `before` values as a new batch edit, so `valueSetter` and `processRowUpdate` run as for any edit and your app persists the undo the way it persists edits. Redo writes the `after` values. One `processRowUpdate` call per row; rows run in parallel; a row that fails is reported to `onProcessRowUpdateError`, keeps its part of the action on the stack to try again, and does not stop the others.

### Stale entries

If a cell no longer holds its recorded `after` value (it was edited again, or the `rows` prop brought new data), undo **skips that cell** with reason `'changed'` and applies the rest. A row that no longer exists is skipped with reason `'missing'`. Values are compared, not row objects, so an app that re-fetches its rows after saving keeps a working history. Redo checks the same way against the value undo wrote.

```ts
const result = await apiRef.current.undo();
// { updated: [3, 7], failed: [], skipped: [{ id: 5, field: 'price', reason: 'changed' }] }
```

## API

| Member | Description |
| :--- | :--- |
| `undoRedo?: boolean \| { limit?: number }` | Turns history on. Default `false`; `limit` default 100. Turning it off clears the history. |
| `onHistoryChange?({ canUndo, canRedo, size })` | Fired when what can be undone or redone changes. `size` is the number of actions that can be undone. |
| `apiRef.current.undo()` | Undoes the last action. Resolves with a `GridBatchEditResult` once every row has settled. |
| `apiRef.current.redo()` | Redoes the last undone action. |
| `apiRef.current.canUndo()` / `canRedo()` | Whether there is something to undo / redo. |
| `apiRef.current.clearHistory()` | Forgets every action. |

Undo and redo calls run one after another, each on the rows the previous one stored.
