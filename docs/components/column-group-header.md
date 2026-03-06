# `<ColumnGroupHeader />`

The `ColumnGroupHeader` component handles the rendering of nested header groups in multi-level column layouts. It allows for advanced data organization where multiple columns are grouped under a single, semantic parent.

## 📑 Overview
- **Hierarchical Layout**: Supports an unlimited depth of nested groupings (Year → Quarter → Metric).
- **Sticky Behavior**: Automatically stays within the grid's header section during horizontal scroll.
- **Dynamic Calculation**: Positions itself based on the combined width of its child columns.
- **Reflective Styles**: Inherits header-level styling while providing specialized group-level CSS hooks.

---

## 🛠️ Usage

### Define Multi-Level Grouping
In your columns definition, include nested `columnGroups`.

```tsx
const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'q1', headerName: 'Q1 Sales', width: 120 },
  { field: 'q2', headerName: 'Q2 Sales', width: 120 },
];

// Define your mapping logic in your component or use the columns API:
// ColumnGroupHeader is typically used by the DataGrid automatically when 
// nested structures are detected.
```

### Direct Customization
While the grid uses this component internally, you can customize its appearance via specific CSS classes or by replacing it in the `slots` API.

---

## ⚙️ How it Works

1. **Hierarchy Resolution**: The component takes a structure and determines which headers need to be "merged" into groups.
2. **Width Aggregation**: Each group header calculates its own total width by summing the widths of all its children (including other nested groups).
3. **Alignment**: Ensuring that the group labels are centered over their respective child columns for a clean visual hierarchy.

---

## 🎨 Slot Implementation
Replace the system's group header with a custom one for specialized styling or interactions.

```tsx
<DataGrid
  slots={{
    columnGroupHeader: MyCustomGroupHeader
  }}
/>
```

## 📝 Best Practices
- **Logical Labels**: Use clear, concise labels for groups like `2024 Performance` or `Contact Info`.
- **Type-Based Grouping**: Align related data types (e.g., all currency fields under a `Finance` group) for better user comprehension.
- **Limit Depth**: While technically unlimited, more than 3-4 levels of nesting can become difficult for users to follow on small screens.
