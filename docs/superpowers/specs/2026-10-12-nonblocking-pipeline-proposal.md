# Proposal: a non-blocking row pipeline (phase 2)

Status: **closed, not shipping (2026-10-13).** Option A was implemented on a branch (kept as
`archive/timesliced-pipeline-2026-10-12`, based on 3.6.0) and measured 1.5–2× slower in total than the
synchronous pipeline, against a target of ≤ 20 %. Since then sorting became 3–5× faster (~0.4–0.5 s at
1M rows, most of it a single native `sort()` that cannot be split), and edits, paste, fill and select-all
no longer block, so the remaining pause is one sort or filter of 1M rows client-side, for which the docs
recommend a `dataSource`. A Web Worker cannot run consumer `valueGetter` / `sortComparator` functions,
and React transitions cannot interrupt a synchronous computation. Revisit only with a design that keeps
the native sort whole (for example sorting off-thread on extracted primitive keys) and meets the target.

Original status: proposal only, nothing implemented. Follows the phase 1 work (synchronous, algorithmic) from
2026-10-12, measured with `npm run bench` (see `docs/performance.md` → Benchmarks).

## Why

After phase 1, sort, grouping and the quick filter are several times faster at 1M rows, but each
still runs as one main-thread task. In Chromium at 1M rows the first quick-filter keystroke still
takes over 500 ms: it reads, formats and lower-cases about 12 million cells, and a third of that
is the consumer's own `valueFormatter` (`Intl.NumberFormat` in the benchmark). Sorting sits around
the 500 ms line. No synchronous algorithm removes that cost; it can only be split up or moved.

## Options

### A. Time-sliced passes on the main thread (recommended first)

The heavy passes (`getQuickFilterTexts` over all rows, `encodeSortColumn`, the grouping buckets and
aggregates) become resumable loops that do about 8 ms of work, then yield with `setTimeout(0)`
(not `scheduler.yield()`, which starves React's scheduler; see the v3.2.0 PDF export notes), and
continue. The pipeline hook keeps showing the previous result until the new one is complete, then
commits it in one render.

- Works with consumer callbacks (`valueGetter`, `valueFormatter`, `sortComparator`), which cannot
  move to a worker because they are functions over the consumer's row objects.
- Only used above a threshold (for example 50,000 rows); smaller grids stay synchronous and behave
  exactly as today, including in tests.
- A new model while a pass runs cancels it (an `AbortController` per pass); the quick filter's
  text cache keeps whatever was already computed, so typing ahead is not wasted work.

### B. A Web Worker for plain columns

Only possible for columns without callbacks, and rows must be copied (structured clone of 1M rows
costs about as much as the sort itself). Worth it only for sort keys that are already typed arrays:
the encoded (rank, number) keys of phase 1 can be transferred without copying and sorted in a
worker. Complex (bundling a worker in a library, CSP, fallbacks), so later, if A is not enough.

## Behaviour while a pass is running

- **Rendered rows:** the previous result stays on screen; the grid sets `aria-busy="true"` on the
  root and shows the loading overlay only after 300 ms, so short passes do not flash.
- **`apiRef` getters** (`getAllFilteredRows` and the other row getters) answer from
  the last *committed* result, as they already do between a state change and the next render. A new
  `apiRef.waitForPipeline(): Promise<void>` resolves when the pending pass has committed (additive,
  minor version).
- **Models:** `getSortModel()` / `getFilterModel()` return the requested model immediately; the
  models and the rows are briefly out of step, which is documented.
- **`onStateChange` / `onSortModelChange` / `onFilterModelChange`:** fire when the model changes, as
  today. The state snapshot gains nothing new; `onStateChange` fires again when the rows commit, so
  a consumer that persists rows-derived state sees the final result.
- **Exports and clipboard** wait for a pending pass (`await waitForPipeline()` inside the export
  helpers) so a file never mixes old and new order.
- **Controlled props** that change again before a pass finishes cancel it and start over; only the
  last model commits.

## Risks

- Consumers and tests that read the DOM synchronously after `setSortModel` on a large grid would see
  the old order. Mitigated by the threshold and `waitForPipeline`, and called out in the changelog.
- More states to test: cancel mid-pass, unmount mid-pass, rows prop changing mid-pass, React strict
  mode double effects. Browser tests are needed for the yielding (jsdom timers are fake-able, but
  the interaction with React's scheduler is not).

## Measuring success

`npm run bench` gains a "longest task" column for sort, quick filter and grouping (already recorded
for sort in Chromium). Target: no task over 50 ms at 1M rows in Chromium, total time to result no
more than 20 % above the synchronous phase 1 numbers.
