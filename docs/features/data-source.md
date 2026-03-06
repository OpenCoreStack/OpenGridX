# 🌐 Server-Side Data Source

Handle millions of rows by connecting OpenGridX directly to your backend API.

---

## 📑 The `GridDataSource` Interface

The `dataSource` prop is the gateway to server-side operations. When provided, the grid becomes a "thin client" that requests only the data it needs to render the current viewport.

### Implementation
```tsx
const myDataSource: GridDataSource = {
  getRows: async (params) => {
    const { startRow, endRow, sortModel, filterModel } = params;
    
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify({ startRow, endRow, sortModel, filterModel })
    });
    
    const data = await response.json();
    
    return {
      rows: data.items,
      rowCount: data.totalCount // Required for stable pagination
    };
  }
};

<DataGrid dataSource={myDataSource} />
```

---

## ⚙️ Request Parameters (`GridGetRowsParams`)

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `startRow` | `number` | The starting index of the requested range. |
| `endRow` | `number` | The ending index (exclusive). |
| `sortModel` | `GridSortItem[]` | Current sorting configuration. |
| `filterModel` | `GridFilterModel` | Current filtering configuration. |
| `groupKeys` | `string[]` | Active expansion path (used for server-side tree data). |

---

## 🔄 Modes of Operation

### 1. Server-Side Pagination
Set `paginationMode="server"`. The grid will request fresh data every time the page changes.

### 2. Infinite Loading
Set `paginationMode="infinite"`. The grid will request the next "chunk" of data as the user scrolls near the bottom of the list.

### 3. Server-Side Tree Data
When `treeData` is enabled with a `dataSource`, OpenGridX will call `getRows` with `groupKeys`. You should return the children for that specific parent path.

---

## 🛠️ Error Handling
If your API call fails, you should throw an error or return a rejected promise. OpenGridX will automatically display the **Error Overlay** with a "Retry" button.

```typescript
getRows: async () => {
  try {
    return await apiCall();
  } catch (err) {
    throw new Error("Failed to connect to database");
  }
}
```
