# Infinite Scroll

The OpenGridX DataGrid supports infinite scrolling (lazy loading), allowing you to load large datasets incrementally as the user scrolls.

## Concept

When infinite scroll is enabled, the grid:
1.  Disables client-side slicing (pagination in the UI).
2.  Uses `paginationModel` internally to track the current page and page size.
3.  Triggers `onRowsScrollEnd` when the user scrolls near the bottom of the grid, signaling that more data should be fetched.
4.  Data is typically **appended** to the existing rows, rather than replacing them.

## Usage

To enable infinite scrolling:

1.  Set `pagination={false}` to disable UI pagination controls.
2.  Set `paginationMode="infinite"`.
3.  Implement `onRowsScrollEnd` to update your data fetching logic/state (e.g., increment page number).
4.  Ensure your `dataSource` manages the loaded rows correctly (usually appending).

```tsx
import { DataGrid, GridDataSource } from '@opencorestack/opengridx';

// ... setup columns and mockApi ...

export default function InfiniteScrollDemo() {
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50
    });
    const [loading, setLoading] = useState(false);
    const [allRows, setAllRows] = useState([]);

    const dataSource: GridDataSource = useMemo(() => ({
        getRows: async (params) => {
            setLoading(true);
            try {
                // Fetch NEXT batch of rows from server
                const response = await mockApi.getRows(params);
                
                // CRITICAL: Append new rows to existing rows
                // (Or ensure response.rows contains ONLY new rows and parent handles appending)
                return response;
            } finally {
                setLoading(false);
            }
        }
    }), []);

    const handleScrollEnd = useCallback(() => {
        if (!loading) {
            // Increment page to fetch next batch
            setPaginationModel(prev => ({
                ...prev,
                page: prev.page + 1
            }));
        }
    }, [loading]);

    return (
        <DataGrid
            rows={[]} // Rows managed by dataSource
            columns={columns}
            dataSource={dataSource}
            
            // KEY PROPS FOR INFINITE SCROLL
            pagination={false} 
            paginationMode="infinite"
            sortingMode="server"
            
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            
            onRowsScrollEnd={handleScrollEnd}
        />
    );
}
```

## Implementation Details

*   **`onRowsScrollEnd`**: Triggered when `scrollHeight - scrollTop - clientHeight < threshold` (default 100px).
*   **Request Handling**: `useGridDataSource` includes logic to cancel stale requests if scrolling happens too quickly.
*   **Appending vs Replacing**: 
    *   In `infinite` mode, rows fetched for **new pages** are appended.
    *   Rows fetched due to **sorting/filtering changes** replace the entire dataset (resetting to page 0).
