# `<Toolbar />`

The toolbar is an optional component rendered at the top of the grid. It typically contains global actions like exporting, filtering, and column management.

## 🛠️ Provided Component: `GridToolbar`

OpenGridX includes a pre-built `GridToolbar` that bundles common actions.

### Usage
```tsx
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';

<DataGrid
  slots={{
    toolbar: GridToolbar
  }}
/>
```

### Features
- **Quick Search**: Search across all visible columns.
- **Export Menu**: Download data as CSV, Print, or [Advanced Excel](../features/export-guide.md).
- **Column Visibility**: Toggle which columns are shown via a dropdown [Visibility Panel](column-visibility.md).
- **Density**: Switch between Compact, Standard, and Comfortable row heights.

## 🎨 Custom Toolbar

You can provide your own component to the `toolbar` slot. It will receive props to interact with the grid state.

```tsx
const MyToolbar = () => {
  return (
    <div className="custom-toolbar">
      <button onClick={...}>Custom Action</button>
    </div>
  );
};

<DataGrid slots={{ toolbar: MyToolbar }} />
```
