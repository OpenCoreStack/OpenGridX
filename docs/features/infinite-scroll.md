# Infinite Scroll

The OpenGridX DataGrid supports infinite scrolling (lazy loading), allowing you to load large datasets incrementally as the user scrolls.

## Concept

When infinite scroll is enabled, the grid:
1.  Shows no pager and never slices the loaded rows (`pagination` is ignored).
2.  Uses `paginationModel.page` and `pageSize` to decide how many rows should be loaded: `(page + 1) * pageSize`.
3.  Triggers `onRowsScrollEnd` when the user scrolls near the bottom of the grid, signaling that more data should be fetched.
4.  **Appends** each response to the rows already loaded. Your `getRows` only returns the requested range.

## Usage

To enable infinite scrolling:

1.  Pass a `dataSource` whose `getRows` returns the rows in `[startRow, endRow)`.
2.  Set `paginationMode="infinite"`.
3.  Control `paginationModel` and advance `page` in `onRowsScrollEnd`. The grid does not advance the page on its own.
4.  Set `sortingMode="server"` / `filterMode="server"` if `getRows` applies `sortModel` / `filterModel`.

```tsx
import { useCallback, useMemo, useState } from 'react';
import {
    DataGrid,
    type GridColDef,
    type GridDataSource,
    type GridPaginationModel,
} from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles';

type Person = {
    id: number;
    name: string;
};

const columns: GridColDef<Person>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
];

// With a dataSource the grid owns the loaded rows; `rows` only seeds the store.
const NO_ROWS: Person[] = [];

declare function fetchPeople(params: {
    startRow: number;
    endRow: number;
    sort?: { field: string; sort: 'asc' | 'desc' };
}): Promise<{ rows: Person[]; total: number }>;

export default function InfiniteScrollDemo() {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 50,
    });

    const dataSource = useMemo<GridDataSource<Person>>(() => ({
        getRows: async ({ startRow, endRow, sortModel }) => {
            // Return ONLY the requested range; the grid appends it to what is loaded.
            const { rows, total } = await fetchPeople({ startRow, endRow, sort: sortModel[0] });
            return { rows, rowCount: total };
        },
    }), []);

    const handleScrollEnd = useCallback(() => {
        setPaginationModel(prev => ({ ...prev, page: prev.page + 1 }));
    }, []);

    return (
        <DataGrid
            rows={NO_ROWS}
            columns={columns}
            dataSource={dataSource}
            paginationMode="infinite"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onRowsScrollEnd={handleScrollEnd}
            height={400}
        />
    );
}
```

The grid needs a bounded height (here `height={400}`) and the stylesheet import; without either the viewport never scrolls, every loaded row renders, and `onRowsScrollEnd` keeps firing until the whole dataset is loaded.

## Implementation Details

*   **`onRowsScrollEnd`**: Fired once when the end of the rows comes within 100px of the viewport bottom (`scrollHeight - scrollTop - clientHeight < 100`). It is re-armed when the user scrolls out of that zone or the row count changes, so one scroll gesture loads one page. It also fires after the rows change when the end is already in view, so a first page that does not fill the viewport keeps loading until it does. Horizontal scrolling never fires it.
*   **Loading placeholders**: the skeleton rows shown while the next page loads are drawn after the last loaded row, only when the user has scrolled to the end of the data.
*   **Ranges, not pages**: each request asks for `[rows loaded so far, (page + 1) * pageSize)`. Advancing the page twice within the 300 ms debounce, or while a request is in flight, still loads every row in between: one request runs at a time and, when it lands, the grid requests whatever the current page still needs. A response shorter than requested is treated as the end of the data until the page advances again.
*   **Appending**: rows are appended; a row whose id (`getRowId`) is already loaded is skipped, so overlapping pages never show a row twice.
*   **Restarting**: a sort, filter, page-size or `dataSource` (`getRows`) change replaces the rows with a new request from row 0 and reports page 0 through `onPaginationModelChange`. Setting a smaller page yourself reloads the list up to that page.
*   **No pager**: `paginationMode="infinite"` ignores `pagination`; no pagination bar is shown and loaded rows are never sliced.
*   **Stale responses**: a response for a list that has since restarted is discarded.
