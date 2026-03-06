# 📋 Master-Detail (Detail Panel)

Display supplementary information for a row in an expandable panel without leaving the main grid view.

---

## 🛠️ Basic Implementation

To enable detail panels, provided two main props: `getDetailPanelContent` and `getDetailPanelHeight`.

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  getDetailPanelContent={(params) => (
    <div style={{ padding: '20px' }}>
      <h3>Details for {params.row.name}</h3>
      <p>{params.row.description}</p>
    </div>
  )}
  getDetailPanelHeight={() => 'auto'} // or a fixed number
/>
```

---

## 🕹️ Controlled Expansion

You can manage which rows are expanded by using the `detailPanelExpandedRowIds` and `onDetailPanelExpandedRowIdsChange` props.

```tsx
const [expandedIds, setExpandedIds] = useState(new Set());

<DataGrid
  detailPanelExpandedRowIds={expandedIds}
  onDetailPanelExpandedRowIdsChange={setExpandedIds}
/>
```

---

## 🎨 Layout Impact

- **Expansion Column**: A `+` icon is automatically added to the start of the row.
- **Pinning**: The expansion column can be pinned using `pinExpandColumn={true}`. This ensures the expansion trigger is always visible even when scrolling horizontally.
- **Virtualization**: The grid engine correctly accounts for variable row heights when detail panels are open.
