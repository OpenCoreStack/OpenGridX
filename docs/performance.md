# Performance Best Practices

Tips for getting the most out of OpenGridX with large datasets.

## Stabilize column definitions

The most common cause of unnecessary re-renders is a new column array being created on every render.

```tsx
// ✅ Good: stable reference
const columns = useMemo<GridColDef[]>(() => [
    { field: 'id',   headerName: 'ID',   width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
], []);

// ❌ Bad: new array on every render → column layout is recomputed every render
const columns = [
    { field: 'id',   headerName: 'ID',   width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
];
```

The same applies to the `rows` prop — if you derive rows from server data, wrap the derivation in `useMemo`.

## Keep cell renderers lightweight

`renderCell` is called for every visible cell on every render. Expensive work inside it multiplies with overscan.

```tsx
// ✅ Good: memoized sub-component
const StatusBadge = React.memo(({ value }: { value: string }) => (
    <span className={`badge badge--${value}`}>{value}</span>
));

{ field: 'status', renderCell: (p) => <StatusBadge value={String(p.value)} /> }

// ❌ Bad: inline object / new function reference every render
{ field: 'status', renderCell: (p) => <span style={{ color: 'red' }}>{String(p.value)}</span> }
```

## Use fixed row heights when possible

Every row has the same height (`rowHeight` or the `density` preset); there is no per-row height callback. Expanded detail panels add their own height, which the grid folds into a cumulative-height table, so many expanded panels (and `'auto'` panels, which are measured after they render) cost more than plain rows.

```tsx
// Fixed height — fastest
<DataGrid rows={rows} columns={columns} rowHeight={48} />

// Variable height — necessary for detail panels, but adds cost
<DataGrid rows={rows} columns={columns} getDetailPanelHeight={() => 200} />
```

## Choose the right density

`density="compact"` and `density="comfortable"` replace `rowHeight` with a preset (32 px / 72 px, or the theme's `grid.rowHeightCompact` / `grid.rowHeightComfortable`); `density="standard"` uses `rowHeight`. Compact rows fit more rows in the viewport.

```tsx
<DataGrid density="compact" />      // 32 px rows — more rows in viewport
<DataGrid density="standard" />     // rowHeight (default 52 px)
<DataGrid density="comfortable" />  // 72 px rows
```

## Tune the overscan buffer

`overscanRowCount` (default `3`) is the minimum rows rendered outside the viewport. The grid raises it automatically based on scroll velocity. Raise the floor only if you still see blank flashes at the default.

```tsx
// Raise the floor for very fast scrolling environments
<DataGrid overscanRowCount={8} rows={rows} columns={columns} />
```

See [Virtualization](./features/virtualization.md) for the full adaptive-overscan details.

## Avoid `autoHeight` on large datasets

`autoHeight` sizes the grid to all of its rows, so every row is rendered. Only use it when the dataset is small (< 100 rows), or together with `pagination`.

## Give the grid a bounded height, and import the stylesheet

Virtualization only works when the viewport has a fixed height: pass `height`, or put the grid in a container with a definite height (a flex child needs `min-height: 0`). In an unbounded container the viewport grows to fit every row and every row is rendered; a dev-mode warning reports this.

The same happens when the stylesheet is missing, because the viewport's `overflow: auto` comes from it (a dev-mode warning reports a missing stylesheet too). Import it once in your app:

```tsx
import '@opencorestack/opengridx/styles';
```

## Know the browser's height limit

In short: up to about 300,000 rows at 52 px fit in every browser, up to about 600,000 in Chromium and WebKit; beyond that load rows with a [`dataSource`](features/data-source.md) or use pagination. The decision guide is in [Virtualization → The browser height limit](features/virtualization.md#the-browser-height-limit).

The grid sizes its scroll content to `rowCount × rowHeight` pixels and does not scale scroll positions. Browsers cap an element's height, and the [benchmark](#reach-the-browser-height-ceiling) measures what happens past the cap:

- **Chromium and WebKit** clamp the content at 33,554,428 px. Rows below that cannot be scrolled to: at the default 52 px row height that is every row past 645,277.
- **Firefox** has a lower limit, about 17.9M px, and collapses a taller element instead of clamping it. Up to 3.5.0 that made a grid with more content unscrollable in Firefox (only the first screen of rows was reachable). **Since 3.5.1 the grid measures the browser's limit once and caps its scroll content to it**, so Firefox scrolls normally and reaches the rows above the cap: about 344,000 rows at 52 px, 559,000 at 32 px.

In development the grid warns when rows are cut off, naming how many can be scrolled to in that browser and pointing to `dataSource`. For more rows, use a [`dataSource`](features/data-source.md) (`paginationMode="server"` or infinite scroll), `pagination`, or a smaller `rowHeight` (`density="compact"`, 32 px, keeps 1M rows under the Chromium and WebKit cap).

## Use server-side operations for very large datasets

Client-side filtering, sorting, and pagination load the full dataset into JS. For very large datasets, prefer server-side modes. The simplest way is a `dataSource`: the grid calls `getRows` with the page range, sort model and filter model, and shows the response (see [Server-Side Data](./features/data-source.md)).

Without a `dataSource`, fetch the rows yourself from the change callbacks and control the models:

```tsx
<DataGrid
    rows={pageRows}            // the current page, already filtered and sorted by the server
    columns={columns}
    filterMode="server"
    sortingMode="server"
    pagination
    paginationMode="server"
    rowCount={totalRows}       // server total
    paginationModel={paginationModel}
    onPaginationModelChange={setPaginationModel}   // refetch in an effect on these models
    sortModel={sortModel}
    onSortModelChange={setSortModel}
    filterModel={filterModel}
    onFilterModelChange={setFilterModel}
/>
```

In server modes the grid shows `rows` as given: it does not re-filter, re-sort or slice them (v3.0+; earlier versions did unless a `dataSource` was set).


## Benchmarks

Measured with `npm run bench` (`bench/`), which installs the packed npm package into a production Vite + React 19 app and drives it with Playwright in Chromium, Firefox and WebKit. The numbers below are from one machine (Apple M1, 8 GB RAM): compare them with each other and with your own runs, not with other machines.

**In short** (Chromium, median; 100k and 1M rows from the run below, 10k and 500k from the 3.5.0 run of 2026-10-09, before the faster sort, quick filter and grouping):

| Rows | Mount | Sort (number / string) | Filter | Quick filter | Group + sum | Scroll frames over 16.7 ms | JS heap |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10,000 (3.5.0) | 79 ms | 34 / 42 ms | 19 ms | 52 ms | 30 ms | 0 % | 2.9 MB |
| 100,000 | 75 ms | 49 / 66 ms | 20 ms | 165 ms | 74 ms | 0 % | 10.4 MB |
| 500,000 (3.5.0) | 295 ms | 493 / 641 ms | 59 ms | 958 ms | 331 ms | 0 % | 39.4 MB |
| 1,000,000 | 621 ms | 467 / 467 ms | 109 ms | 1,813 ms | 693 ms | 0 % | 76.9 MB |

### Before and after the faster sort, quick filter and grouping (3.6.0)

Medians of 5 runs, the same machine, the 3.5.1 code (`122d431`) and the changed code (`e1df2f1`) measured back to back on 2026-10-12 (`bench/results/2026-10-12-apple-m1-darwin-before.json` and `bench/results/2026-10-12-apple-m1-darwin.json`). Load average at the start of each run: 2.9 (before) and 4.6 (after); an IDE, a browser and other tools were open. Row counts after every filter and grouping were identical in both runs.

| 1M rows, 52 px | Chromium before → after | Firefox before → after | WebKit before → after |
| :--- | ---: | ---: | ---: |
| Sort, number column | 1,716 → 467 ms | 1,935 → 468 ms | 1,126 → 340 ms |
| Sort, string column | 1,510 → 467 ms | 2,338 → 560 ms | 2,939 → 562 ms |
| Quick filter, one term (first keystroke) | 2,127 → 1,813 ms | 3,283 → 2,789 ms | 3,646 → 3,166 ms |
| Group by region + `sum` | 924 → 693 ms | 1,879 → 1,776 ms | 818 → 675 ms |
| Filter, number `>` | 144 → 97 ms | 203 → 125 ms | 142 → 89 ms |
| Mount | 804 → 621 ms | 1,216 → 925 ms | 620 → 547 ms |

| 100k rows, 52 px | Chromium before → after | Firefox before → after | WebKit before → after |
| :--- | ---: | ---: | ---: |
| Sort, number column | 99 → 49 ms | 153 → 74 ms | 120 → 87 ms |
| Sort, string column | 154 → 66 ms | 193 → 75 ms | 202 → 91 ms |
| Quick filter, one term | 207 → 165 ms | 372 → 287 ms | 294 → 282 ms |
| Group by region + `sum` | 79 → 74 ms | 108 → 78 ms | 103 → 107 ms |

What changed: sort keys are read once per row into typed arrays and strings are ranked by sorting only their distinct values with the collator (the collator no longer runs in every comparison, which was most of WebKit's string sort); the row heights after a sort or filter are computed in one pass without id lookups when no detail panel is open; cells of plain columns are read without allocating; the quick filter keeps its texts by row position for the rows array it searched and matches with plain loops; aggregation reads cells row by row. The quick filter's first keystroke is still dominated by reading, formatting (`valueFormatter`) and lower-casing every cell, and Firefox's grouping by allocation of per-row tree nodes and metadata; the Firefox runs at 1M rows varied widely (up to several seconds) in both runs.

- **Scrolling keeps up with the display at every size.** Chromium missed no frames; Firefox missed 0–2.4 %. The DOM holds about 19 row elements at rest (28 at 32 px) and at most 86 while scrolling fast, whatever the row count. WebKit scrolls steadily without missed frames too, but misses one or two frames each time the scroll position jumps far (the *during the jumps* rows below). Firefox's scroll numbers at 500k and 1M rows are not comparable: the grid cannot scroll there (see Reach).
- **Sorting, the quick filter and grouping run on the main thread in one piece.** Up to 100k rows they finish in a few frames; at 1M a sort blocks the page for about 0.35–0.6 s in every engine, grouping for 0.7 s (1.8 s in Firefox), and the first quick-filter keystroke for about 1.8–3 s. For sorting or searching a million rows interactively, use server-side sorting and filtering.
- **Reach:** past the browser's height cap rows cannot be scrolled to, and in Firefox the grid stops scrolling altogether. See [Reach](#reach-the-browser-height-ceiling).

### Editing, selection and grouping at 1M rows (3.8 – 3.9)

Measured in Chromium on an Apple M1, 1,000,000 rows, from the event to the end of its long task (best of three; not part of `npm run bench`, which covers mount, scroll, sort and filter).

| Interaction | 3.7.0 | 3.8.0 | |
| :--- | ---: | ---: | :--- |
| Edit one cell | 561 ms | ~35 ms | the row store is updated in place; id lists over the visible rows are reused |
| Paste 1,000 × 10 cells | ~790 ms | ~45 ms | |
| Undo / redo of that paste | ~790 ms | ~45 ms | |
| Fill 1,000 cells | 809 ms | ~50 ms | |
| Expand a group | 279 ms | ~135 ms | leaf row metadata built once per tree |
| Collapse a group | ~120 ms | ~1 ms | |
| Quick filter, first search at 1M rows | ~2.7 s (3.10.0) | ~1.6–2 s (3.10.1) | dates formatted once per day; shown texts lower-cased once per distinct text; later keystrokes ~210 ms |
| Group 1M rows (apply a grouping) | ~540 ms (3.10.0) | ~190 ms (3.10.1) | leaf nodes and row metadata made on first read; ids from the store, not looked up |
| Select all | ~270 ms | ~270 ms (~130 ms in 3.10.0, ~60–90 ms in 3.10.1) | 3.10 builds the 1M-id set once and reuses it for the model it returns; the rest is the live-selection check |

3.9.0 keeps rows memoised: selecting a row, starting or committing an edit, and vertical scrolling re-render only the rows they change (a click re-rendered every visible row, now one). React's own work per interaction is about 3–5 ms at 100k rows.

To keep this, change rows by passing new row objects (never mutate them), keep `columns` and `localeText` shallowly stable (inline objects of plain values are fine; define function entries outside the render). Handlers such as `onRowClick` may be inline: the grid passes rows its own stable handlers.

### Method

- **The app is the built package.** `bench/app` installs the tarball from `npm pack`, like a consumer, and is a production build (no React development checks).
- **Data:** 12 columns (`id`, two strings, two `singleSelect`, four numbers of which two have a `valueFormatter`, a date, a boolean, a short code), `id` and `name` pinned left. Rows come from a seeded random generator in the page and are generated before any timer starts.
- **Page:** 1280×800, the grid fills it, headless browsers launched by Playwright, one new browser context per run.
- **Timing:** each operation is timed from the call (`root.render`, `apiRef.setSortModel`, `setFilterModel`, `setRowGroupingModel` + `setAggregationModel`) to the first painted frame that shows its result: the page waits on `requestAnimationFrame` until the grid's DOM shows the result, then one more frame so that frame has been painted. The time therefore includes React's render and commit, style, layout and paint, and up to one frame of waiting for the next refresh. The method is described in detail at the top of `bench/app/src/harness.tsx`.
- **Operations:** sort ascending on `amount` (number) and on `name` (string); filter `name contains "nova"` (6 % of rows) and `amount > 5000` (50 %); one quick-filter term over all columns (the first search reads and formats every cell, so this is the first keystroke's cost); group by `region` (8 groups) with `sum` of `amount`. Each is undone before the next.
- **Scroll:** 5 s driven from `requestAnimationFrame`: 3 s at a constant 2,400 px/s, then a jump to a random position anywhere in the scrollable range every 100 ms. Frame times are the gaps between consecutive animation frames. Headless browsers do not pace frames by a display, so idle frames already vary between about 16.6 and 18 ms (17–21 ms in WebKit); a frame therefore counts as *over 16.7 ms* when it took more than 1.5 refresh intervals (25 ms at 60 Hz, a missed refresh) and as *over 33 ms* above 2.5 intervals (41.7 ms, two or more missed).
- **Chromium only:** long tasks (`PerformanceObserver('longtask')`; Firefox and WebKit have no such entries) and the JS heap (Chrome DevTools Protocol `Runtime.getHeapUsage` after a forced garbage collection, after mount minus the same page with the rows generated and no grid, so it is what the grid adds on top of your data).
- **DOM size:** row elements and cells at the end of the scroll test, and row elements after scrolling back to the top and letting the grid settle.
- **Repeats:** 6 runs per row count and engine; the first is discarded as warm-up, the tables show the median of the other 5 and the min–max range.
- **Machine load:** the runner records the load average before and after. This machine had a steady load of about 3.5–4 from desktop apps (an IDE, a browser) during the run; nothing else heavy ran.

### Results

<!-- bench:start -->
<!-- Generated by `node bench/report.mjs --write docs/performance.md` from bench/results/2026-10-12-apple-m1-darwin.json. Do not edit by hand. -->

- **Machine:** Apple M1, 8 cores, 8 GB RAM, macOS 26.5.1 (arm64)
- **Browsers:** Chromium 145.0.7632.6, Firefox 146.0.1, WebKit 26.0 (Playwright, headless, 1280×800 page)
- **Package:** @opencorestack/opengridx 3.5.1 (commit `e1df2f1`), production build
- **Date:** 2026-10-12; load average at start 4.61 / 5.66 / 5.46, at end 2.31 / 6.16 / 7.41
- **Runs:** median of 5 runs after one discarded warm-up run, with the min–max range in brackets

¹ Chromium only: Firefox and WebKit have no long-task entries, and the heap is read through the Chrome DevTools Protocol.

#### 100,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 75 ms (68–131) | 142 ms (113–144) | 138 ms (126–194) |
| Sort, number column | 49 ms (42–64) | 74 ms (64–85) | 87 ms (70–92) |
| Sort, string column | 66 ms (61–87) | 75 ms (59–89) | 91 ms (81–126) |
| Filter, string `contains` | 20 ms (18–37) | 34 ms (21–56) | 47 ms (43–47) |
| Filter, number `>` | 16 ms (14–28) | 32 ms (24–37) | 30 ms (28–37) |
| Quick filter, one term | 165 ms (156–190) | 287 ms (266–346) | 282 ms (257–339) |
| Group by region + `sum` | 74 ms (70–77) | 78 ms (71–97) | 107 ms (94–148) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 18.4 ms (18.2–18.6) | 17.6 ms (17.3–33.3) | 49.0 ms (44.0–62.0) |
| Scroll frame time p99 | 18.6 ms (18.6–18.7) | 33.3 ms (17.7–50.0) | 60.0 ms (53.0–92.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.3) | 2.7 % (0.7–7.6) | 11.8 % (8.1–20.8) |
| Scroll frames over 33 ms | 0.0 % | 0.0 % (0.0–1.5) | 7.4 % (6.6–10.1) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 1.1 % (0.0–5.4) | 0.6 % (0.0–8.5) |
| … over 16.7 ms during the jumps | 0.0 % (0.0–0.8) | 5.3 % (1.7–15.1) | 38.3 % (24.4–65.3) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 59 ms (55–81) | – | – |
| JS heap for the grid ¹ | 10.4 MB | – | – |
| Row elements in the DOM, end of scroll | 76 | 76 | 76 |
| Cells in the DOM, end of scroll | 912 | 912 | 912 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | all rows | all rows | all rows |

#### 1,000,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 621 ms (522–1,024) | 925 ms (861–2,775) | 547 ms (490–616) |
| Sort, number column | 467 ms (376–546) | 468 ms (430–1,287) | 340 ms (304–690) |
| Sort, string column | 467 ms (415–530) | 560 ms (433–1,257) | 562 ms (461–639) |
| Filter, string `contains` | 109 ms (92–113) | 89 ms (80–185) | 95 ms (89–194) |
| Filter, number `>` | 97 ms (90–123) | 125 ms (102–434) | 89 ms (81–121) |
| Quick filter, one term | 1,813 ms (1,430–2,183) | 2,789 ms (2,644–7,252) | 3,166 ms (2,877–3,463) |
| Group by region + `sum` | 693 ms (599–818) | 1,776 ms (1,176–3,715) | 675 ms (614–854) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms (16.7–50.0) | 17.0 ms |
| Scroll frame time p95 | 18.4 ms (18.4–18.5) | 33.3 ms (17.4–166.6) | 44.0 ms (44.0–46.0) |
| Scroll frame time p99 | 18.6 ms (18.6–33.3) | 34.1 ms (33.3–283.4) | 47.0 ms (46.0–52.0) |
| Scroll frames over 16.7 ms | 0.3 % (0.0–1.0) | 9.5 % (1.7–79.5) | 7.7 % (7.2–9.0) |
| Scroll frames over 33 ms | 0.0 % (0.0–0.3) | 0.4 % (0.0–54.2) | 7.2 % (6.8–7.9) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 6.5 % (0.0–75.0) | 0.0 % (0.0–0.6) |
| … over 16.7 ms during the jumps | 0.8 % (0.0–2.8) | 14.3 % (4.3–94.7) | 22.6 % (20.4–26.4) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 462 ms (410–523) | – | – |
| JS heap for the grid ¹ | 76.9 MB | – | – |
| Row elements in the DOM, end of scroll | 77 | 76 | 77 |
| Cells in the DOM, end of scroll | 924 | 912 | 924 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | 645,277 (64.5 %) | 344,139 (34.4 %) | 645,277 (64.5 %) |

#### 1,000,000 rows, 32 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 741 ms (581–1,283) | 1,356 ms (968–5,966) | 475 ms (472–553) |
| Sort, number column | 453 ms (403–523) | 627 ms (441–917) | 327 ms (321–338) |
| Sort, string column | 497 ms (437–673) | 693 ms (489–6,628) | 504 ms (379–566) |
| Filter, string `contains` | 106 ms (96–162) | 192 ms (147–268) | 100 ms (97–108) |
| Filter, number `>` | 103 ms (86–136) | 179 ms (154–635) | 91 ms (87–190) |
| Quick filter, one term | 1,621 ms (1,617–2,569) | 4,265 ms (3,490–10,444) | 3,082 ms (2,684–3,608) |
| Group by region + `sum` | 880 ms (641–1,137) | 2,096 ms (957–3,309) | 640 ms (579–723) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms (16.7–49.4) | 17.0 ms |
| Scroll frame time p95 | 17.6 ms (17.4–17.6) | 66.7 ms (33.2–199.3) | 49.0 ms (48.0–51.0) |
| Scroll frame time p99 | 17.7 ms (17.6–33.3) | 100.0 ms (33.7–333.3) | 52.0 ms (50.0–55.0) |
| Scroll frames over 16.7 ms | 0.7 % (0.0–1.0) | 38.4 % (6.7–82.7) | 15.5 % (15.4–15.8) |
| Scroll frames over 33 ms | 0.0 % (0.0–0.7) | 18.6 % (0.0–50.6) | 7.8 % (7.7–8.8) |
| … over 16.7 ms while scrolling steadily | 0.0 % (0.0–0.6) | 28.0 % (1.1–80.3) | 0.0 % (0.0–0.6) |
| … over 16.7 ms during the jumps | 0.8 % (0.0–2.6) | 63.5 % (16.5–96.4) | 52.0 % (50.6–57.4) |
| Long tasks during scroll ¹ | 0 (0–1) | – | – |
| Longest task during a sort ¹ | 490 ms (429–655) | – | – |
| JS heap for the grid ¹ | 77.3 MB | – | – |
| Row elements in the DOM, end of scroll | 86 | 86 | 86 |
| Cells in the DOM, end of scroll | 1,032 | 1,032 | 1,032 |
| Row elements in the DOM, at rest | 28 | 28 | 28 |
| Reach: last row on screen at the bottom | all rows | 559,224 (55.9 %) | all rows |

#### Reach: rows that can be scrolled into view

| Rows × row height | Content height | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: | ---: |
| 100,000 × 52 px | 5,200,000 px | all | all | all |
| 1,000,000 × 52 px | 52,000,000 px | 645,277 (64.5 %) | 344,139 (34.4 %) | 645,277 (64.5 %) |
| 1,000,000 × 32 px | 32,000,000 px | all | 559,224 (55.9 %) | all |
<!-- bench:end -->

### Reach: the browser height ceiling

The grid makes its scroll area as tall as all the rows: `rowCount × rowHeight` pixels. It does not compress scroll positions, so every row keeps its real offset. Browsers limit how tall an element can be, and the *Reach* rows above report the last row that actually appears on screen after scrolling to the very bottom:

- **Chromium and WebKit** stop the element at 33,554,428 px. Everything above that is reachable, everything below is not. At 52 px that is 645,277 rows, so 1M rows at 52 px reach 64.5 %. At 32 px (`density="compact"`), 1M rows need 32,000,000 px and are all reachable.
- **Firefox** has a lower limit, about 17.9M px, and handles it differently: an element taller than that collapses instead of stopping at the limit. On 3.5.0, which these tables were measured on, the grid then had nothing to scroll: 500k rows at 52 px (26M px) and 1M rows at either height showed only their first screen of rows (24 or 33 rows). **3.5.1 fixes this**: the grid caps its scroll content to the limit it measures, so Firefox reaches about 344,000 rows at 52 px and 559,000 at 32 px, like Chromium and WebKit reach theirs.

If you need more rows than this in one scrolling grid, page them (`pagination`), load them from the server (`paginationMode="server"`, or infinite scroll with a `dataSource`), or reduce the row height.

### Rerun

```bash
npx playwright install chromium firefox webkit   # once
npm run bench                                    # all engines, 10k/100k/500k/1M, about 30 min
npm run bench -- --quick                         # 1 run per size, no 500k, a few minutes
npm run bench -- --rows 100000 --engine firefox  # one size, one engine
node bench/report.mjs                            # Markdown tables of the newest results file
```

Results are written to `bench/results/<date>-<machine>.json` with the machine, browser versions and package version. Close other heavy programs first and keep a laptop on power. More options: [Testing → The benchmark](contributing/testing.md#the-benchmark). A weekly CI job runs a quick Chromium pass and keeps the JSON as a build artifact; CI machines are shared and noisy, so it is for spotting trends, not for comparing with these numbers.

## Related

- [Virtualization](./features/virtualization.md)
- [Server-Side Data](./features/data-source.md)
- [Sorting & Pagination](./features/sorting-pagination.md)
- [Infinite Scroll](./features/infinite-scroll.md)
- [Testing → The benchmark](./contributing/testing.md#the-benchmark)
