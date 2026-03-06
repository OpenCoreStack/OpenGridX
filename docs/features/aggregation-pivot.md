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

### Configuration
You can control where the aggregation results appear:
- **`footer`**: A sticky row at the bottom of the grid.
- **`inline`**: Values displayed within group headers (when Row Grouping is active).
- **`both`**: Display in both locations.

```tsx
<DataGrid
  aggregationModel={model}
  getAggregationPosition={(groupNode) => 'both'}
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
Aggregation results automatically inherit the `valueFormatter` from their respective column definitions. If you need a specific format for aggregates only, use the `formatAggregationValue` utility.
