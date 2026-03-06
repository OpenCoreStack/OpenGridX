# 📱 List View

Switch from a multi-column grid to a single-column detailed list. Perfect for mobile responsiveness or card-based layouts.

---

## 🏗️ Usage

Enable List View by passing the `listView` prop. You must also provide a `listViewColumn` object which defines how each "Card" should be rendered.

```tsx
const listColDef: GridListViewColDef<Employee> = {
  field: 'card',
  renderCell: (params) => <MyEmployeeCard row={params.row} />
};

<DataGrid
  listView={true}
  listViewColumn={listColDef}
  rows={rows}
  columns={columns} // Fallback columns for standard grid view
/>
```

---

## 🎨 Styling

When `listView` is active:
- **Header is Hidden**: The standard column header row disappears.
- **Full Width**: The row container becomes a vertical stack where the `renderCell` output takes 100% of the available width.
- **Card Containers**: Each row maintains its standard selection and hover behaviors, but visually acts as a card.

### Custom Card Rendering
The `renderCell` function in `listViewColumn` receives all standard `GridRenderCellParams`, allowing you to build rich, complex UIs for each item.

```tsx
function MyEmployeeCard({ row }) {
  return (
    <div className="employee-card">
       <Avatar src={row.avatar} />
       <div className="info">
          <h3>{row.name}</h3>
          <p>{row.role}</p>
       </div>
       <div className="status">{row.status}</div>
    </div>
  );
}
```

---

## 📱 Responsive Toggle

A common pattern is to toggle List View based on screen width:

```tsx
const isMobile = window.innerWidth < 768;

<DataGrid
  listView={isMobile}
  // ...
/>
```
