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

**When the callbacks run.** `getDetailPanelContent` and `getDetailPanelHeight` are called only for expanded rows, never for collapsed ones, so they can do real work (fetching, building large subtrees). Under row grouping, the synthetic group rows have no detail panel and no `+` toggle: the callbacks always receive one of your own rows (tree-data parents are your rows, so they keep their panel). If `getDetailPanelContent` throws, that panel shows an error marker and the rest of the grid keeps working.

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

## ⌨️ Keyboard & Accessibility

- **Space** or **Enter** on the expand cell toggles the panel (v3.0: Enter too).
- Keys typed into content you render in the panel (inputs, selects, buttons) are left to that content: the grid does not react to them, so typing a space no longer collapses the panel and arrow keys move the caret.
- **Tab** is not captured by the grid, so it reaches focusable content inside an open panel.
- Keyboard scrolling brings the row itself into view, not the row plus its panel, so moving onto a row with a panel taller than the viewport keeps the row visible.
- The panel is exposed as a `role="row"` containing one `role="gridcell"` that spans every column; the expand cell has `aria-expanded` and, while open, `aria-controls` pointing at the panel. The `+`/`−` button inside the cell is not a separate Tab stop.
