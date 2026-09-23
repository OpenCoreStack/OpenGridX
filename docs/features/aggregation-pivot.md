# 📊 Aggregation & Pivot Mode

Transform raw data into meaningful insights with advanced grouping and summary features.

---

## 📈 Row Aggregation

Aggregation allows you to calculate summary values (Sum, Avg, etc.) for groups or the entire dataset.

### Usage
```tsx
<DataGrid
  rows={rows}
  columns={columns}
  aggregationModel={{
    salary: 'sum',
    age: 'avg',
    department: 'count'
  }}
/>
```

### What the footer totals

The footer (and `apiRef.current.getAggregationResult()`, and the `aggregationResult` passed to `slots.footer`) always aggregates **every data row that passes the current filter**. That holds with or without row grouping or tree data, and however many groups are expanded. Group rows show their own subtotals inline; the grand total is computed from the underlying rows, never from those subtotals. (Before v3.0 the footer aggregated the *visible* rows under grouping, so expanding a group double-counted it, and `count` / `avg` were wrong even when collapsed.)

### Configuration
You can control where the aggregation results appear:
- **`footer`**: A sticky row at the bottom of the grid.
- **`inline`**: Values displayed within group headers (when Row Grouping is active).
- **`null`**: Skip aggregation for this group.

```tsx
<DataGrid
  aggregationModel={model}
  getAggregationPosition={(groupNode) => groupNode ? 'inline' : 'footer'}
/>
```

---

## 🔄 Pivot Mode

Pivot mode rotates your data, turning row values into dynamically generated columns.

### Defining a Pivot
```tsx
const pivotModel: GridPivotModel = {
  rowFields: ['office'],         // Dimensions on the Left
  columnFields: ['year'],       // Dimensions on the Top
  valueFields: [                 // Values to compute
    { field: 'revenue', aggFn: 'sum', headerName: 'Total Revenue' }
  ]
};

<DataGrid
  pivotMode={true}
  pivotModel={pivotModel}
/>
```

### Key Concepts
- **Row Fields**: These become the static vertical axis of your pivot table.
- **Column Fields**: Unique values in these fields become new columns.
- **Value Fields**: The data that gets summarized at the intersection of row and column fields.

---

## ⚙️ Aggregation Functions

Built-in functions available:
- `sum`: Total of numeric values.
- `avg`: Arithmetic mean.
- `min`: Smallest value.
- `max`: Largest value.
- `count`: Number of items.
- `unique`: Number of unique items.

---

## 🎨 Formatting Totals
The grid footer formats aggregation results with the `formatAggregationValue` utility. Exports (CSV, basic Excel, print, PDF) also run `sum` / `avg` / `min` / `max` results through the column's `valueFormatter`, but not `count` / `unique`, which stay plain counts; see [Aggregate values](export-guide.md#aggregate-values). Use `formatAggregationValue` when you need the footer's formatting elsewhere.
