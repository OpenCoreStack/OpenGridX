# Getting Started

## 1. Install

```bash
npm install @opencorestack/opengridx
```

Requires React 18 or 19. Excel and PDF export use optional peer dependencies; install them only if you call those functions:

```bash
npm install exceljs                  # exportToExcelAdvanced
npm install jspdf jspdf-autotable    # exportToPdf
```

## 2. Import the stylesheet once

```tsx
// main.tsx, App.tsx or Next.js app/layout.tsx
import '@opencorestack/opengridx/styles';
```

The JavaScript bundle does not load the CSS. Without it the grid is unstyled and, because scrolling comes from the stylesheet, it renders every row. Development builds warn: `[OpenGridX] The grid stylesheet is not loaded`.

## 3. Render a grid

```tsx
import { DataGrid, type GridColDef } from '@opencorestack/opengridx';

interface Employee {
  id: number;
  name: string;
  role: string;
  salary: number;
}

const columns: GridColDef<Employee>[] = [
  { field: 'name', headerName: 'Name', width: 180 },
  { field: 'role', headerName: 'Role', width: 150 },
  {
    field: 'salary', headerName: 'Salary', type: 'number', width: 120,
    valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
];

const rows: Employee[] = [
  { id: 1, name: 'Jon Snow', role: 'Engineer', salary: 95000 },
  { id: 2, name: 'Arya Stark', role: 'Analyst', salary: 65000 },
];

export function EmployeeGrid() {
  return <DataGrid rows={rows} columns={columns} checkboxSelection pagination height={400} />;
}
```

Your own row interfaces work as they are: no index signature, no base type to extend. Rows are passed through untouched; the grid never writes fields onto them.

## 4. Give the grid a bounded height

Pick one:

- **A `height` prop:** `height={400}`.
- **Fill a sized container:** leave out `height` and the grid fills its parent (`height: 100%`, or the free space as a flex item). The parent needs a definite height, and every flex or grid item between it and a sized ancestor needs `min-height: 0`.

```tsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <header>…</header>
  <div style={{ flex: 1, minHeight: 0 }}>
    <DataGrid rows={rows} columns={columns} />
  </div>
</div>
```

In an unbounded container the grid grows to fit and virtualization turns off; a development warning says so. Details: [Virtualization → The grid needs a bounded height](Virtualization#the-grid-needs-a-bounded-height).

## 5. Rows without an `id`

```tsx
<DataGrid rows={products} columns={columns} getRowId={(row) => row.sku} />
```

## 6. Control the grid from code

```tsx
import { DataGrid, useGridApiRef } from '@opencorestack/opengridx';

const apiRef = useGridApiRef<Employee>();

<DataGrid apiRef={apiRef} rows={rows} columns={columns} />;

apiRef.current.getSelectedRows();
apiRef.current.autosizeColumns();
```

## Next steps

- Every prop, type and `apiRef` method: [API Reference](API-Reference)
- Common problems: [FAQ & Troubleshooting](FAQ)
- Live examples for every feature: [demo site](https://opencorestack.github.io/OpenGridX/)
