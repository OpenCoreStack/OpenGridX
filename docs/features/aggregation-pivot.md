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

Cells are read the way the grid shows them: a column with a `valueGetter` (for example `total = price × qty`) totals the computed values, not `row[field]`.

### Footer layout

The footer is laid out exactly like the rows: a hidden column has no footer cell, pinned columns keep their totals under the pinned column (left-pinned first, right-pinned last), and the totals stay aligned while scrolling horizontally, including when column virtualization renders only part of the columns and when the checkbox, detail-panel or row-reorder column is (or is not) pinned.

### Server-side totals

When a `dataSource` drives the rows (server or infinite pagination, server sorting, or server filtering), the grid only holds the rows the server returned, so it never totals them itself. The footer shows the `aggregationResults` returned by `getRows`, or the result of `dataSource.getAggregations`.

- A result is only shown for the request it answered: after changing the aggregation model, filter or sort, the footer shows `—` until the new totals arrive, and keeps showing `—` if that request fails (the error is logged). It never shows the previous model's or filter's totals under the new label.
- While a `getAggregations` request is pending the footer has `aria-busy="true"` and the class `ogx__aggregation-footer--loading`.
- An inline `aggregationModel={{ salary: 'sum' }}` is a new object on every render of your component. The grid compares the model by content, so re-rendering with an equal model neither refetches nor clears the totals.

If the server provides neither `aggregationResults` nor `getAggregations`, the footer shows `—`.

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

The generated value columns are named `<field>␟<aggFn>` (for example `'salary\u001fsum'`) without column fields, and `<column key>␟<field>␟<aggFn>` with them.

### Rows, filtering and sorting

- **Filtering.** Filters on source fields (including the row fields) and the quick filter are applied to the **source rows before pivoting**, so every pivot value and the Grand Total reflect them. In pivot mode the quick filter searches every filterable source column. A condition on a generated value column (for example `'salary\u001fsum' > 1000`) is applied to the pivot rows. If a filter model mixes both kinds with `logicOperator: 'or'`, each kind is applied in its own stage, so the result is as if they were joined with `and`.
- **Sorting** orders the pivot data rows. The Grand Total row always stays last.
- **Grand Total** is the last row (id `'__pivot_grand_total__'`). It totals the pivot rows shown, recomputed from the raw values (an average is the average of all underlying values, not of the row averages). It is not selected by the header select-all checkbox. When no source row is left, there is no Grand Total row and the no-rows overlay is shown; the value columns stay.
- **Row ids.** Pivot rows carry their own ids (`0, 1, 2, …` and the Grand Total id). Your `getRowId` is not applied to them.
- **Groups** are formed by each value's displayed string, as in row grouping, so `1` and `'1'` are one group. `null`, `undefined` and `''` form one blank group, labelled `null`.

### Generated columns

- **Row-label columns** keep the source column's `valueFormatter`, `renderCell`, `type`, alignment and `valueOptions` (the formatter and renderer receive a source row of that group). They always show, even if `columnVisibilityModel` hides the source column of the same field, and are `hideable: false`.
- **Value columns** are formatted like every other aggregate (see [Formatting Totals](#-formatting-totals)).
- **Column keys** are ordered by value: numbers and dates numerically, strings naturally (`'9'` before `'10'`), blanks last. Column-field header labels use the source column's `valueFormatter` (a boolean column formatted as Yes / No reads `Active: Yes — Salary (sum)`).
- **Column rules.** A row or column field on a `groupable: false` column is skipped (as in row grouping), and a value field whose function the column's `availableAggregationFunctions` does not allow is skipped. Listing the same field and function twice produces one column. The toolbar's pivot panel offers only what these rules allow and never offers an `aggregable: false` column as a value.
- **Column order.** The generated columns keep an order of their own: dragging them does not change your column order, and a controlled `columnOrder` (which names source columns) does not apply to them. When pivot mode is turned off, the previous column order is back.

### Not combined with pivot mode

- **Tree data and row grouping** are turned off while pivoting (the pivot rows are already grouped by the row fields). A development warning says so.
- **`dataSource`**: pivoting is client-side, and a server-driven grid only holds one page of rows, so `pivotMode` is ignored when a `dataSource` is set (development warning). Pivot on the server, or pass the full dataset as `rows`.
- **`aggregationModel`**: the footer is not shown, `apiRef.current.getAggregationResult()` returns `null` and `slots.footer` receives `aggregationResult: null`; the Grand Total row is the pivot's aggregate. The toolbar's Summaries panel does not list generated pivot columns.

---

## ⚙️ Aggregation Functions

Built-in functions available (the same functions drive the footer, group rows, pivot and exports):
- `sum`: Total of numeric values.
- `avg`: Arithmetic mean.
- `min`: Smallest value.
- `max`: Largest value.
- `count`: Number of non-empty values.
- `unique`: Number of distinct non-empty values.

`sum`, `avg`, `min` and `max` use numbers, numeric strings and dates. Empty values (`null`, `undefined`, and strings that are empty or only whitespace), booleans and other values are ignored, so a blank cell never counts as `0`. `count` and `unique` ignore empty values too. `min` and `max` of dates return the date itself.

---

## 🎨 Formatting Totals

The footer, group rows, pivot value cells and every export format aggregates the same way:

- `sum`, `avg`, `min` and `max` go through the column's `valueFormatter`, so totals keep the column's currency, unit or percent format. The formatter's `row` is the record of aggregated values: the footer totals, the group row, or the pivot row. A formatter that throws (typically because it reads row data an aggregate does not have) falls back to the default format instead of breaking the grid.
- `count` and `unique` are plain counts: the column's `valueFormatter` is not applied (a count of a currency column is not an amount).
- Without a formatter, numbers are locale-formatted (`avg` to at most two decimals) and dates show as locale dates.

Exports follow the same rules; see [Aggregate values](export-guide.md#aggregate-values). Use `formatAggregationValue(value, fnName)` for the default number formatting elsewhere.
