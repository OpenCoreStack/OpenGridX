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
- **Height**: `getDetailPanelHeight` returns a pixel height (default `200`, a fixed-height scroll box) or `'auto'`. An `'auto'` panel is measured when it renders and whenever its content resizes, and the rows below are laid out at the measured height. Until a panel has rendered once, 200px is reserved for it.
- **Virtualization**: The grid engine accounts for variable row heights when detail panels are open, including panels on pinned rows (keyboard navigation and `scrollToIndexes` keep rows clear of an expanded bottom-pinned panel).
