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

The grid sizes its scroll content to `rowCount × rowHeight` pixels and does not scale scroll positions. Browsers cap an element's height, and the [benchmark](#reach-the-browser-height-ceiling) measures what happens past the cap:

- **Chromium and WebKit** clamp the content at 33,554,428 px. Rows below that cannot be scrolled to: at the default 52 px row height that is every row past 645,277.
- **Firefox** does not clamp. Content taller than about 17.9M px collapses, and the grid does not scroll at all: only the first screen of rows is reachable (about 344,000 rows at 52 px, 559,000 at 32 px).

A dev-mode warning reports content past 17.8M px. For more rows, use pagination, `paginationMode="server"` or infinite scroll with a `dataSource`, or a smaller `rowHeight` (`density="compact"`, 32 px, keeps 1M rows under the Chromium and WebKit cap).

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

**In short** (Chromium, median):

| Rows | Mount | Sort (number / string) | Filter | Quick filter | Group + sum | Scroll frames over 16.7 ms | JS heap |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10,000 | 79 ms | 34 / 42 ms | 19 ms | 52 ms | 30 ms | 0 % | 2.9 MB |
| 100,000 | 89 ms | 102 / 160 ms | 28 ms | 205 ms | 87 ms | 0 % | 10.4 MB |
| 500,000 | 295 ms | 493 / 641 ms | 59 ms | 958 ms | 331 ms | 0 % | 39.4 MB |
| 1,000,000 | 688 ms | 1,105 / 1,316 ms | 95 ms | 1,845 ms | 681 ms | 0 % | 79.1 MB |

- **Scrolling keeps up with the display at every size.** Chromium missed no frames; Firefox missed 0–2.4 %. The DOM holds about 19 row elements at rest (28 at 32 px) and at most 86 while scrolling fast, whatever the row count. WebKit scrolls steadily without missed frames too, but misses one or two frames each time the scroll position jumps far (the *during the jumps* rows below). Firefox's scroll numbers at 500k and 1M rows are not comparable: the grid cannot scroll there (see Reach).
- **Sorting, the quick filter and grouping run on the main thread in one piece.** Up to 100k rows they finish in a few frames; at 1M a sort blocks the page for about 1.1–1.3 s in Chromium (up to 2.9 s for a string sort in WebKit), and the first quick-filter keystroke for about 2–3 s. For sorting or searching a million rows interactively, use server-side sorting and filtering.
- **Reach:** past the browser's height cap rows cannot be scrolled to, and in Firefox the grid stops scrolling altogether. See [Reach](#reach-the-browser-height-ceiling).

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
<!-- Generated by `node bench/report.mjs --write docs/performance.md` from bench/results/2026-10-09-apple-m1-darwin.json. Do not edit by hand. -->

- **Machine:** Apple M1, 8 cores, 8 GB RAM, macOS 26.5.1 (arm64)
- **Browsers:** Chromium 145.0.7632.6, Firefox 146.0.1, WebKit 26.0 (Playwright, headless, 1280×800 page)
- **Package:** @opencorestack/opengridx 3.5.0 (commit `f2ad5cb`), production build
- **Date:** 2026-10-09; load average at start 3.88 / 3.73 / 4.04, at end 3.46 / 3.71 / 3.77
- **Runs:** median of 5 runs after one discarded warm-up run, with the min–max range in brackets

¹ Chromium only: Firefox and WebKit have no long-task entries, and the heap is read through the Chrome DevTools Protocol.

#### 10,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 79 ms (59–88) | 84 ms (82–85) | 116 ms (110–128) |
| Sort, number column | 34 ms (28–38) | 44 ms (43–46) | 81 ms (72–85) |
| Sort, string column | 42 ms (22–45) | 56 ms (36–58) | 83 ms (76–108) |
| Filter, string `contains` | 19 ms (14–31) | 31 ms (26–40) | 51 ms (47–57) |
| Filter, number `>` | 18 ms (13–19) | 25 ms (24–28) | 37 ms (34–39) |
| Quick filter, one term | 52 ms (33–60) | 76 ms (68–83) | 96 ms (84–110) |
| Group by region + `sum` | 30 ms (22–37) | 41 ms (31–47) | 77 ms (72–126) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 17.6 ms (17.5–17.6) | 17.6 ms (17.6–18.6) | 45.0 ms (43.0–46.0) |
| Scroll frame time p99 | 17.6 ms (17.6–17.7) | 33.3 ms (33.3–34.1) | 49.0 ms (47.0–58.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.3) | 1.7 % (1.4–4.2) | 8.6 % (7.6–9.7) |
| Scroll frames over 33 ms | 0.0 % | 0.0 % (0.0–0.7) | 6.5 % (5.4–7.1) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 0.6 % (0.0–4.7) | 0.0 % |
| … over 16.7 ms during the jumps | 0.0 % (0.0–0.8) | 3.5 % (2.6–4.3) | 26.1 % (21.9–29.9) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | none | – | – |
| JS heap for the grid ¹ | 2.9 MB | – | – |
| Row elements in the DOM, end of scroll | 76 | 76 | 76 |
| Cells in the DOM, end of scroll | 912 | 912 | 912 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | all rows | all rows | all rows |

#### 100,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 89 ms (86–100) | 138 ms (133–155) | 157 ms (138–204) |
| Sort, number column | 102 ms (85–119) | 129 ms (120–136) | 159 ms (126–237) |
| Sort, string column | 160 ms (152–165) | 213 ms (180–224) | 241 ms (211–259) |
| Filter, string `contains` | 28 ms (20–34) | 42 ms (28–46) | 56 ms (47–109) |
| Filter, number `>` | 33 ms (27–39) | 39 ms (24–57) | 48 ms (31–60) |
| Quick filter, one term | 205 ms (193–232) | 348 ms (322–359) | 323 ms (269–340) |
| Group by region + `sum` | 87 ms (81–91) | 107 ms (99–109) | 118 ms (105–143) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 17.4 ms (17.3–17.5) | 17.5 ms (17.4–17.6) | 44.0 ms (43.0–45.0) |
| Scroll frame time p99 | 17.6 ms (17.6–17.7) | 33.3 ms | 48.0 ms (47.0–55.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.3) | 2.4 % (1.0–2.7) | 7.9 % (7.1–9.3) |
| Scroll frames over 33 ms | 0.0 % | 0.0 % (0.0–0.3) | 6.4 % (5.4–7.0) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 0.6 % (0.0–1.7) | 0.0 % (0.0–0.6) |
| … over 16.7 ms during the jumps | 0.0 % (0.0–0.8) | 4.3 % (1.7–6.2) | 22.7 % (20.2–26.1) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 155 ms (144–160) | – | – |
| JS heap for the grid ¹ | 10.4 MB | – | – |
| Row elements in the DOM, end of scroll | 76 | 76 | 76 |
| Cells in the DOM, end of scroll | 912 | 912 | 912 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | all rows | all rows | all rows |

#### 500,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 295 ms (287–307) | 482 ms (473–505) | 402 ms (338–463) |
| Sort, number column | 493 ms (485–567) | 660 ms (629–936) | 483 ms (413–564) |
| Sort, string column | 641 ms (600–807) | 1,105 ms (1,045–1,188) | 1,407 ms (1,203–1,568) |
| Filter, string `contains` | 59 ms (51–67) | 63 ms (56–68) | 75 ms (72–87) |
| Filter, number `>` | 80 ms (70–111) | 100 ms (92–111) | 89 ms (77–101) |
| Quick filter, one term | 958 ms (836–976) | 1,565 ms (1,503–1,828) | 1,442 ms (1,275–1,619) |
| Group by region + `sum` | 331 ms (307–338) | 641 ms (419–675) | 386 ms (351–1,244) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 17.6 ms (17.5–17.6) | 17.5 ms (17.5–17.6) | 45.0 ms (44.0–46.0) |
| Scroll frame time p99 | 17.7 ms (17.6–17.7) | 17.6 ms (17.6–17.7) | 49.0 ms (46.0–50.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.7) | 0.0 % | 7.7 % (7.6–10.1) |
| Scroll frames over 33 ms | 0.0 % (0.0–0.3) | 0.0 % | 7.3 % (5.8–7.8) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 0.0 % | 0.0 % (0.0–1.1) |
| … over 16.7 ms during the jumps | 0.0 % (0.0–1.8) | 0.0 % | 23.1 % (20.6–28.4) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 635 ms (595–799) | – | – |
| JS heap for the grid ¹ | 39.4 MB | – | – |
| Row elements in the DOM, end of scroll | 76 | 22 | 76 |
| Cells in the DOM, end of scroll | 912 | 264 | 912 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | all rows | 24 (<0.1 %) | all rows |

#### 1,000,000 rows, 52 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 688 ms (673–715) | 1,097 ms (1,011–1,503) | 589 ms (576–735) |
| Sort, number column | 1,105 ms (1,094–1,140) | 1,540 ms (1,477–1,795) | 1,023 ms (956–1,075) |
| Sort, string column | 1,316 ms (1,227–1,463) | 2,434 ms (2,371–2,716) | 2,913 ms (2,715–3,277) |
| Filter, string `contains` | 95 ms (87–152) | 100 ms (90–108) | 102 ms (102–112) |
| Filter, number `>` | 144 ms (129–149) | 192 ms (175–237) | 136 ms (123–242) |
| Quick filter, one term | 1,845 ms (1,761–1,977) | 3,161 ms (2,920–3,327) | 2,914 ms (2,762–3,272) |
| Group by region + `sum` | 681 ms (664–703) | 1,754 ms (1,695–2,059) | 764 ms (720–901) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 17.4 ms (17.4–17.6) | 17.6 ms (17.4–17.6) | 44.0 ms (44.0–46.0) |
| Scroll frame time p99 | 17.7 ms (17.6–17.7) | 17.6 ms (17.6–17.7) | 46.0 ms (45.0–48.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.7) | 0.0 % (0.0–0.3) | 7.2 % (7.1–9.3) |
| Scroll frames over 33 ms | 0.0 % | 0.0 % | 7.0 % (6.5–7.1) |
| … over 16.7 ms while scrolling steadily | 0.0 % | 0.0 % (0.0–0.6) | 0.0 % |
| … over 16.7 ms during the jumps | 0.0 % (0.0–1.7) | 0.0 % | 20.8 % (20.0–28.1) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 1,307 ms (1,220–1,455) | – | – |
| JS heap for the grid ¹ | 79.1 MB | – | – |
| Row elements in the DOM, end of scroll | 77 | 22 | 77 |
| Cells in the DOM, end of scroll | 924 | 264 | 924 |
| Row elements in the DOM, at rest | 19 | 19 | 19 |
| Reach: last row on screen at the bottom | 645,277 (64.5 %) | 24 (<0.1 %) | 645,277 (64.5 %) |

#### 1,000,000 rows, 32 px rows

| Metric | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: |
| Mount | 674 ms (668–680) | 1,106 ms (1,032–1,329) | 604 ms (585–621) |
| Sort, number column | 1,143 ms (1,090–1,254) | 1,475 ms (1,462–1,837) | 1,077 ms (986–1,137) |
| Sort, string column | 1,295 ms (1,236–1,456) | 2,517 ms (2,268–2,675) | 2,758 ms (2,720–2,947) |
| Filter, string `contains` | 92 ms (91–109) | 99 ms (99–109) | 107 ms (106–121) |
| Filter, number `>` | 137 ms (133–140) | 206 ms (172–232) | 140 ms (126–161) |
| Quick filter, one term | 1,818 ms (1,651–1,855) | 2,960 ms (2,910–3,200) | 2,750 ms (2,677–2,776) |
| Group by region + `sum` | 694 ms (673–758) | 2,071 ms (1,224–2,745) | 749 ms (689–798) |
| Scroll frame time p50 | 16.7 ms | 16.7 ms | 17.0 ms |
| Scroll frame time p95 | 17.5 ms (17.5–18.5) | 17.5 ms (17.3–17.5) | 49.0 ms (48.0–49.0) |
| Scroll frame time p99 | 17.6 ms (17.6–18.7) | 17.6 ms (17.6–17.7) | 52.0 ms (51.0–52.0) |
| Scroll frames over 16.7 ms | 0.0 % (0.0–0.3) | 0.0 % (0.0–0.3) | 15.5 % (15.4–15.8) |
| Scroll frames over 33 ms | 0.0 % | 0.0 % | 7.7 % (7.7–7.8) |
| … over 16.7 ms while scrolling steadily | 0.0 % (0.0–0.6) | 0.0 % (0.0–0.6) | 0.0 % (0.0–0.6) |
| … over 16.7 ms during the jumps | 0.0 % | 0.0 % | 51.3 % (50.6–53.3) |
| Long tasks during scroll ¹ | 0 | – | – |
| Longest task during a sort ¹ | 1,286 ms (1,229–1,436) | – | – |
| JS heap for the grid ¹ | 79.5 MB | – | – |
| Row elements in the DOM, end of scroll | 86 | 32 | 86 |
| Cells in the DOM, end of scroll | 1,032 | 384 | 1,032 |
| Row elements in the DOM, at rest | 28 | 28 | 28 |
| Reach: last row on screen at the bottom | all rows | 33 (<0.1 %) | all rows |

#### Reach: rows that can be scrolled into view

| Rows × row height | Content height | Chromium | Firefox | WebKit |
| :--- | ---: | ---: | ---: | ---: |
| 10,000 × 52 px | 520,000 px | all | all | all |
| 100,000 × 52 px | 5,200,000 px | all | all | all |
| 500,000 × 52 px | 26,000,000 px | all | 24 (<0.1 %) | all |
| 1,000,000 × 52 px | 52,000,000 px | 645,277 (64.5 %) | 24 (<0.1 %) | 645,277 (64.5 %) |
| 1,000,000 × 32 px | 32,000,000 px | all | 33 (<0.1 %) | all |
<!-- bench:end -->

### Reach: the browser height ceiling

The grid makes its scroll area as tall as all the rows: `rowCount × rowHeight` pixels. It does not compress scroll positions, so every row keeps its real offset. Browsers limit how tall an element can be, and the *Reach* rows above report the last row that actually appears on screen after scrolling to the very bottom:

- **Chromium and WebKit** stop the element at 33,554,428 px. Everything above that is reachable, everything below is not. At 52 px that is 645,277 rows, so 1M rows at 52 px reach 64.5 %. At 32 px (`density="compact"`), 1M rows need 32,000,000 px and are all reachable.
- **Firefox** has a lower limit, about 17.9M px, and handles it differently: an element taller than that collapses instead of stopping at the limit, so the grid has nothing to scroll. 500k rows at 52 px (26M px) and 1M rows at either height show only their first screen of rows (24 or 33 rows here). Up to about 344,000 rows at 52 px, or 559,000 at 32 px, Firefox scrolls normally.

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
