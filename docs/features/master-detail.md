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

## ⌨️ Keyboard & Accessibility

- **Space** or **Enter** on the expand cell toggles the panel (v3.0: Enter too).
- Keys typed into content you render in the panel (inputs, selects, buttons) are left to that content: the grid does not react to them, so typing a space no longer collapses the panel and arrow keys move the caret.
- **Tab** is not captured by the grid, so it reaches focusable content inside an open panel.
- Keyboard scrolling brings the row itself into view, not the row plus its panel, so moving onto a row with a panel taller than the viewport keeps the row visible.
- The panel is exposed as a `role="row"` containing one `role="gridcell"` that spans every column; the expand cell has `aria-expanded` and, while open, `aria-controls` pointing at the panel. The `+`/`−` button inside the cell is not a separate Tab stop.
