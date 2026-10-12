# Next.js (App Router)

OpenGridX is a client component: it uses state, effects, context and the DOM. In the App Router you render it from a file marked `'use client'`, and fetch the data in Server Components or Route Handlers.

Everything on this page was built with `next build`, served with `next start` and loaded in Chromium, Firefox and WebKit without console errors, on Next.js 16.4 (Turbopack and webpack) and 15.5 (webpack), React 19.3.

## 1. Install and import the stylesheet

```bash
npm install @opencorestack/opengridx
```

Import the stylesheet once, in the root layout:

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import '@opencorestack/opengridx/styles';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
```

### The optional export peers

The grid lazy-loads `exceljs` (`exportToExcelAdvanced`) and `jspdf` + `jspdf-autotable` (`exportToPdf`) with `import()`. Next.js resolves every `import()` at build time, so **if they are not installed, `next build` fails** with `Module not found: Can't resolve 'exceljs'`. Either install them:

```bash
npm install exceljs jspdf jspdf-autotable
```

or, if you do not use those two exports, point them at an empty module:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const OPTIONAL_PEERS = ['exceljs', 'jspdf', 'jspdf-autotable'];

const nextConfig: NextConfig = {
    // Turbopack (default `next build` from Next.js 16)
    turbopack: {
        resolveAlias: Object.fromEntries(OPTIONAL_PEERS.map(name => [name, './lib/optional-peer-stub.js'])),
    },
    // webpack (default on Next.js 15, `next build --webpack` on 16)
    webpack(config: { resolve: { alias: Record<string, string | false> } }) {
        for (const name of OPTIONAL_PEERS) config.resolve.alias[name] = false;
        return config;
    },
};

export default nextConfig;
```

```js
// lib/optional-peer-stub.js
export default undefined;
```

With the stub, `exportToExcelAdvanced` and `exportToPdf` fail when called; every other export works.

## 2. Render the grid from a client component

Column definitions usually hold functions (`valueFormatter`, `renderCell`, `valueGetter`). Functions cannot cross from a Server Component to a Client Component, so **define the columns in the client file**:

```tsx
// app/OrdersGrid.tsx
'use client';

import { DataGrid, GridToolbar, type GridColDef } from '@opencorestack/opengridx';
import type { Order } from '../lib/orders';

const columns: GridColDef<Order>[] = [
    { field: 'id', headerName: 'ID', type: 'number', width: 80 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    {
        field: 'amount',
        headerName: 'Amount',
        type: 'number',
        width: 140,
        valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}`,
    },
    { field: 'shipped', headerName: 'Shipped', type: 'boolean', width: 110 },
];

export function OrdersGrid({ rows }: { rows: Order[] }) {
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            height={480}
            checkboxSelection
            headerFilters
            slots={{ toolbar: GridToolbar }}
        />
    );
}
```

Give the grid a `height` (or a parent with a bounded height): without one it fills its container, and in an auto-height page that means every row renders. See [Virtualization](virtualization.md).

## 3. Fetch rows in a Server Component

The page stays a Server Component. It loads the rows and passes them as props. Props must be serialisable: plain objects, arrays, strings, numbers, booleans, `null`. `Date` objects survive; class instances, `Map`s with functions and functions do not.

```tsx
// app/page.tsx (Server Component, no 'use client')
import { getOrders } from '../lib/orders';
import { OrdersGrid } from './OrdersGrid';

export default async function Page() {
    const rows = await getOrders(); // a database query, fetch() to your API, ...
    return <OrdersGrid rows={rows} />;
}
```

The grid renders on the server (the first screen of rows is in the HTML) and hydrates in the browser.

**Rendering `<DataGrid>` straight from a Server Component** works from v3.6, whose bundle starts with `'use client'`, as long as every prop is serialisable (`columns={[{ field: 'name' }]}`, no functions). In 3.5.1 and earlier it fails with `TypeError: createContext is not a function`. Wrapping the grid in your own client file, as above, works in every version and is where your column functions belong anyway.

## 4. Server-side data with `dataSource` and a Route Handler

For large tables, let the server sort, filter and page. The `dataSource` lives in the client file and calls a Route Handler:

```tsx
// app/orders/ServerOrdersGrid.tsx
'use client';

import { DataGrid, GridToolbar, type GridColDef, type GridDataSource } from '@opencorestack/opengridx';
import type { Order } from '../../lib/orders';

const columns: GridColDef<Order>[] = [
    { field: 'id', headerName: 'ID', type: 'number', width: 80 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 140 },
];

// Module scope (or useMemo): a new dataSource object on every render refetches.
const dataSource: GridDataSource<Order> = {
    getRows: async (params) => {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error(`Orders request failed: ${res.status}`);
        return res.json();
    },
};

export function ServerOrdersGrid() {
    return (
        <DataGrid
            rows={[]}
            columns={columns}
            dataSource={dataSource}
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            pagination
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
            height={480}
            slots={{ toolbar: GridToolbar }}
        />
    );
}
```

```ts
// app/api/orders/route.ts
import type { GridGetRowsParams, GridGetRowsResponse } from '@opencorestack/opengridx';
import { queryOrders } from '../../../lib/orders';

export async function POST(request: Request) {
    const params = (await request.json()) as GridGetRowsParams;
    // params: startRow, endRow, sortModel, filterModel (items, quickFilterValues), groupKeys
    const { rows, total } = await queryOrders(params);
    const body: GridGetRowsResponse = { rows, rowCount: total };
    return Response.json(body);
}
```

Importing types from the package in a Route Handler is free: they are erased at build time. See [Data Source](data-source.md) for the request and response shapes.

## 5. The AI toolkit (`@opencorestack/opengridx/ai`)

`@opencorestack/opengridx/ai` has no React code and no imports, so it runs anywhere: Server Components, Route Handlers, middleware and the browser.

- **On the server**: build the schema (`getGridAiSchema`) for your model call, and keep your API key there. You may also run `validateGridAiState` on the reply to log or reject bad answers.
- **In the browser**: the grid applies a reply only if `validateGridAiState` branded it, and the brand is a `Symbol` that does not survive JSON. So the reply must be validated again on the client. `createGridAiPromptHandler` does that for you:

```tsx
// app/ai/AiOrdersGrid.tsx
'use client';

import { DataGrid, GridToolbar } from '@opencorestack/opengridx';
import { createGridAiPromptHandler } from '@opencorestack/opengridx/ai';
import { aiColumns } from '../../lib/aiColumns'; // plain column data, shared with the route
import type { Order } from '../../lib/orders';

const onPrompt = createGridAiPromptHandler({
    columns: aiColumns,
    callModel: async (request, { signal }) => {
        // request: { prompt, schema, currentState, history }
        const res = await fetch('/api/grid-ai', { method: 'POST', body: JSON.stringify(request), signal });
        return res.json(); // e.g. { filterModel, sortModel, message }
    },
});

export function AiOrdersGrid({ rows }: { rows: Order[] }) {
    return <DataGrid rows={rows} columns={aiColumns} height={480} slots={{ toolbar: GridToolbar }} aiAssistant={{ onPrompt }} />;
}
```

```ts
// app/api/grid-ai/route.ts
import { validateGridAiState } from '@opencorestack/opengridx/ai';
import { aiColumns } from '../../../lib/aiColumns';

export async function POST(request: Request) {
    const { prompt, schema, currentState } = await request.json();
    const reply = await callYourModel({ prompt, schema, currentState }); // your SDK, with `schema` as structured output
    // Optional server-side check. `message` is not grid state, so leave it out of the validation.
    const { message: _message, ...state } = reply;
    const { errors } = validateGridAiState(state, aiColumns);
    if (errors.length) console.info('Model reply had invalid parts:', errors);
    return Response.json(reply);
}
```

Columns shared between the route and the client must be plain data (no functions), or the server gets a client reference instead of the array. Keep a function-free list such as `aiColumns` in a module without `'use client'`, and spread extra function fields onto it in the client file if the grid needs them.

## Pages Router

The Pages Router has no Server Components: every page is a client component that also renders on the server. Import the grid directly in the page, and the stylesheet in `pages/_app.tsx`:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import '@opencorestack/opengridx/styles';

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
```

Column functions can stay in the page. Rows from `getServerSideProps` / `getStaticProps` must be JSON-serialisable (no `Date`; send ISO strings and use `valueGetter`).

## Common errors

| Error | Cause and fix |
| :--- | :--- |
| `You're importing a module that depends on useState into a React Server Component module` (webpack: `…needs useState. This React hook only works in a Client Component`) | A file of yours that calls hooks (or wraps the grid) has no `'use client'`. Add it at the top of the file that renders `<DataGrid>`. |
| `TypeError: createContext is not a function` (build: "Failed to collect page data") | 3.5.1 or earlier, imported from a Server Component. Render the grid from a `'use client'` file, or upgrade. |
| `Functions cannot be passed directly to Client Components` … `{field: "name", valueFormatter: function}` | Columns with functions built in a Server Component. Define them in the client file. |
| `Module not found: Can't resolve 'exceljs'` (or `jspdf`) | The optional export peers are not installed. Install them or alias them (section 1). |
| Unstyled grid, every row rendered, dev warning `[OpenGridX] The grid stylesheet is not loaded` | The stylesheet is not imported. Add `import '@opencorestack/opengridx/styles'` to `app/layout.tsx` (or `pages/_app.tsx`). |
| `Hydration failed because the server rendered HTML didn't match the client` | Usually rows or cell text that differ between server and client: `Math.random()`, `Date.now()`, `toLocaleString()` without a fixed locale and time zone in a `valueFormatter`. Fetch rows on the server and pass them as props, and format with an explicit locale (`toLocaleString('en-US', { timeZone: 'UTC' })`). Rows created in an effect or with `typeof window` branches render differently on the server; build them once on the server instead. |
| The grid refetches in a loop with `dataSource` | The `dataSource` object is recreated on every render. Define it at module scope or with `useMemo`. |

## See also

- [Data Source](data-source.md)
- [AI Toolkit](ai-toolkit.md)
- [Export Guide](export-guide.md)
