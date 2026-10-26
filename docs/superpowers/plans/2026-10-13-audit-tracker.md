# Audit follow-up tracker (from the 3.7.0 deep analysis, 2026-10-13)

Status legend: ⬜ todo · 🔄 in progress · ✅ done · ⏸ deferred · ❌ dropped

Release plan:
- **3.7.1 (patch):** bugs B1–B6, perf P3 (CSS reset scope + hover repaint), P4 (useLayout split)
- **3.8.0:** P2 (incremental row store), P5 (select-all / group expand), P7 (per-row quick-filter cache)
- **Later:** R1–R6 cleanup/refactors, P8, P9, bugs B7–B11

## Bugs

| ID | Sev | Bug | Location | Target | Status | Notes |
| :- | :-- | :-- | :------- | :----- | :----- | :---- |
| B1 | High | Exports crash when `valueGetter` throws | `lib/utils/export/exportShared.ts:81-84` → use `getCellValue` | 3.7.1 | ✅ | `getRawExportValue` → `getCellValue`; test in `index.test.ts` |
| B2 | Med (security) | Formula injection via `valueFormatter` on non-text columns (CSV/Excel) | `lib/utils/export/index.ts:116,142` | 3.7.1 | ✅ | `isTrustedNonText`: formatter text escaped unless plain numeric (`-$3` kept) |
| B3 | Med | Quick filter misses displayed text (singleSelect labels, Yes/No, formatted dates) | `lib/utils/filtering/index.ts:224-235` | 3.7.1 | ✅ | `formatValueByType` text added for date/boolean/singleSelect; equivalence oracle updated |
| B4 | Med | Junk paste ("hello 5") into date column saved as a 2001 date | `lib/utils/values.ts:127` | 3.7.1 | ✅ | `hasOnlyDateWords` in `toDate` (loop, no regex) |
| B5 | Med | Date paste into ISO date-time string lands on previous day west of UTC | `lib/utils/parsing.ts:150-151` | 3.7.1 | ✅ | zoned current → local time of day on pasted day, written as UTC; tested in 3 TZs |
| B6 | Med | List view reads undeclared `--ogx-grid-cell-text`; selection colours bypass theme | `ListView.css:82` | 3.7.1 | ✅ | list view uses `--ogx-grid-row-*` vars; old `--ogx-selection-*` still win |
| B7 | Low–Med | Duplicate row ids silently drop rows (no dev warning) | row store | later | ✅ | Already handled since 3.0: dev warning naming the ids (`buildRowsState`, tested in `DataGrid.state.test.tsx`); the audit overstated it. Warns once per page |
| B8 | Low | Quick filter stale on in-place row mutation | quick-filter cache | — | 🚫 | Won't fix (2026-10-16): the cache is keyed by row object; detecting mutation means re-reading every cell per keystroke (the 1.6–2 s cold search each time). Documented in `docs/features/filtering.md` |
| B9 | Low | Quick filter stale when a formatter closure changes | quick-filter cache | — | 🚫 | Won't fix (2026-10-16), same reason as B8; documented (pass new column definitions) |
| B10 | Low | `bigint` loses precision in sort | `lib/utils/sorting/index.ts:45` | later | ✅ | Exact re-ranking (`rankNumbersExactly`, `compareExact`) when a column has an unsafe bigint; generic path tie-breaks by `big` |
| B11 | Low | Number filters accept `0x10`, `Infinity` | `lib/utils/values.ts:96-101` | later | ✅ | `toNumber` rejects radix prefixes and non-finite text; new `values.test.ts` |

## Performance

| ID | Improvement | Expected gain | Effort | Target | Status | Notes |
| :- | :---------- | :------------ | :----- | :----- | :----- | :---- |
| P2 | Incremental row-store updates (`REPLACE_ROW(S)`, `effectiveRows`, `indexById` only when reorder on, dedupe `rowIndexById`, `useGridRowIdOf`) | 1M edit/paste/undo 0.5–0.8 s → ~0.05 s | M | 3.8.0 | ✅ | Store maps updated in place, row array patched, reorder index from store, `getRowIndex` reuses id lists. 1M: edit 561 → ~35 ms, paste/undo/redo ~790 → ~45 ms, fill 809 → ~50 ms |
| P3 | Scope `*` box-sizing reset to `.ogx`; drop `.ogx:hover` box-shadow | no host-page side effect | S | 3.7.1 | ✅ | reset scoped with `:where([class*="ogx"] …)`; `.ogx:hover` shadow removed |
| P4 | Split `useLayout` memo (column widths vs row heights) | ~40 ms per resize move at 1M | S | 3.7.1 | ✅ | row and column memos split, merged by a third memo |
| P5 | Cheaper select-all and incremental group expand | 1M select-all 316 → <50 ms | M | 3.8.0 | ✅ | Group toggle: leaf metas built once + `LayeredMap` (expand 279 → ~135 ms, collapse ~120 → ~1 ms). Select-all ~270 ms unchanged: bounded by the public array `rowSelectionModel` (several 1M-id Set builds); only the live-selection copy was removed |
| P7 | Per-row quick-filter cache (WeakMap) | no rebuild per edit; less memory (~32 MB/100k now) | M | 3.8.0 | ❌ | Not needed: `filterRows` already reuses texts per row object at the same index, so an edit re-reads only the edited row |
| P8 | Skip re-render of unchanged cells/header; remove double commit | ~half React work per interaction | M | later | ✅ | Rows re-rendered on every click/edit/scroll: `onRowClick` + selection handlers stable (latest ref), `editingCell` only to the edited row, `virtualColumns` own memo. Click: 14 rows → 1. Double commit = two separate updates; left as is |
| P9 | Lazy/modular opt-in features | up to ~35 KB gz for minimal apps | L | later | ⏸ | Measured: DataGrid-only app 87 KB gz. Lazy UI would save ~6 KB gz (rejected: flicker, chunks, no UMD gain). Feature modules (~20 KB gz) need a breaking API → `docs/superpowers/specs/2026-10-13-feature-modules-proposal.md`, for 4.0 |

Baselines (Chromium, M1, 1M rows): edit 508 ms · paste/undo/redo ~790 ms · fill 783 ms · select-all 316 ms · expand 279 ms · sort 403 ms.

## Cleanup / refactors

| ID | Item | Effort | Status | Notes |
| :- | :--- | :----- | :----- | :---- |
| R1 | Remove dead code: `lib/theme/defaultStyles.ts`, 12 unused util exports, 9 never-emitted CSS classes, 27 unread CSS vars; decide on `QuickFilter` CSS | S | ✅ | 11 dead functions + `defaultStyles.ts` removed; 9 never-set class rules removed; CSS vars kept (public tokens); theme baseline unchanged |
| R2 | Shared filter-value helper for FilterPanel + HeaderFilterCell (6 valueOptions readers) | S–M | ✅ | `lib/utils/filtering/filterInput.ts` (4 helpers) used by FilterPanel + HeaderFilterCell |
| R3 | Stop writing `_isSkeleton` onto rows | M | ✅ | `Row` `skeleton` prop; `_isSkeleton` removed from `GridRowModel` and editing/spanning |
| R4 | Reduce ~41 `as unknown as` casts (internal column type) | L | ✅ | 43 → 15 `as unknown as`: pipeline / data source / grouping called with `<R>`; store typed with `R`; column widenings through one `untypedColumns` helper. One cast had hidden ~25 type errors. Remaining 15 are synthetic rows, third-party typings, window/CSS |
| R5 | Split files >600 lines (`GridToolbar.tsx` 855, …) | M each | ✅ | GridToolbar 861→492 (panels + `useToolbarPanel`), exporters one file per format, xlsx helpers → `excelCells`, range drag → `useGridCellRangeDrag`, keydown → `gridKeyDown.ts`. `DataGrid.tsx` (618) left: it is the documented hook order |
| R6 | Narrow wide hook interfaces (keyboard nav: 31 params) | L | ✅ | Keyboard: the 225-line keydown body is `handleGridKeyDown(event, GridKeyDownContext)`, a typed, unit-tested function; regrouping the 31 params into objects was rejected (inline objects would break memoised callbacks) |
| R7 | Route ~70 hard-coded English strings through `localeText` | M | ✅ | 196 keys (more than the ~70 estimated: pivot/toolbar/AI status included), `GridLocaleContext`, `useShallowStableValue`. Not covered: AI chip texts, grouping column default header, file/row contents |
| R8 | Document 24 exports missing from `docs/API_REFERENCE.md` | S | ✅ | All 23 missing exports documented in `API_REFERENCE.md` |

## Log

- 2026-10-13 — Tracker created from the analysis report. Next: start 3.7.1 with B1.
- 2026-10-13 — Branch `release/3.7.1`. B1–B6, P3, P4 implemented; CHANGELOG entry added; lint, typecheck, build and 1936 unit tests pass. Browser suite running.
- 2026-10-13 — Browser suite: 576/579 passed; the 3 failures were the theme baseline test, whose wrapper relied on the old page-wide box-sizing reset (P3 working as intended). Wrapper given its own `box-sizing`; baseline passes in all 3 engines with no baseline regeneration.
- 2026-10-13 — Linux CI green on `release/3.7.1` (run 38360671317). Awaiting approval to bump, merge and tag.
- 2026-10-13 — 3.7.1 published (npm publish run 38362187150, demo deployed). Branch `release/3.8.0` started.
- 2026-10-13 — P2 step 1: profiled 1M edit (reducer map copies 194 ms, `getRowIdOf` passes 127 ms, reorder index 109 ms, row array 60 ms). After: edit ~100 ms, fill ~370 ms. Unit tests pass; browser suite running.
- 2026-10-13 — P2 done (`getRowIndex` cache): 1M edit ~35 ms, paste ~45 ms, fill ~50 ms. P5: group toggle done; select-all left at ~270 ms (array model API). P7 dropped (already per-row). B8/B9 documented. CHANGELOG 3.8.0 entry drafted. Browser suite running.
- 2026-10-13 — Guardrails for the in-place store: doc comment on `GridInternalState.rows`, StrictMode paste/undo/redo test (`DataGrid.storeInPlace.test.tsx`), CLAUDE.md v3.8.0 rules. Browser suite 579/579.
- 2026-10-13 — CI green on `release/3.8.0` (run 38366056106). Released 3.8.0.
- 2026-10-13 — 3.8.0 published. Branch `release/3.8.1`. UI fix first (user report, AI panel in dark mode): reset `.ogx button:not(.ogx-menu-item)` out-ranked component button classes; background/border moved under `:where()`, chips' 50% radius fixed, theme baseline regenerated (3 open/active backgrounds). Next: cleanup B10, B11, R1, R2, R3, R8.
- 2026-10-13 — 3.8.1 batch done locally: B10, B11, R1, R2, R3, R8 (+ the button-reset UI fix). Unit 1953 pass.
- 2026-10-13 — CI on `release/3.8.1` (run 38372542437): first attempt failed on the Firefox row drag-reorder browser test (drop never fired; passes 4/4 locally and in 3.8.0 CI); re-run of the failed job passed. Treated as a flaky Firefox drag on Linux.
- 2026-10-13 — Released 3.8.1 (with `llms.txt` brought up to date).
- 2026-10-13 — Branch `release/3.9.0`: 9 theme keys + Theme Builder controls (user request), sidebar reorganised by developer priority (user request), demo version label from package.json.
- 2026-10-13 — Flaky tests fixed (reorder, header-filter scroll, PDF heartbeat, tree-data ratio). R7 (localeText for ~120 strings) delegated to an agent in a worktree; P8 waits for it (same files).
- 2026-10-13 — P8 done (row memoisation), regression test proven to fail without the fixes.
- 2026-10-13 — R7 done (agent, reviewed): 196 localeText keys via GridLocaleContext; added useShallowStableValue so an inline localeText of strings keeps rows memoised. Unit 1972, browser 585/585 in 3 engines.
- 2026-10-13 — Released 3.9.0 (CI run 38381619839).
- 2026-10-13 — 3.9.1 patch (PR flow): baseline exclusion, check:package, version badges, docs. Cherry-picked from release/3.10.0.
- 2026-10-13 — AI change chips translatable (11 keys, branch `release/3.10.0`). P9 measured and deferred to a 4.0 feature-modules proposal (user agreed).
- 2026-10-13 — Docs sweep (roadmap, performance, README, wiki home, rtl, pagination, architecture). Found and fixed: npm package shipped `lib/theme/__baseline__` (1.6 MB). Feature hold recorded (user).
- 2026-10-13 — Backlog 1/6: demo syntax highlighting done. Insight follow-ups: `check:package` (no test artifacts in the tarball + DataGrid-only 92 KB gz budget) in CI and publish.
- 2026-10-13 — R5 and R6 done (all engines green, compiler baseline). Next: R4 casts.
- 2026-10-13 — R4 done (43 → 15 casts). All R items done.
- 2026-10-13 — Insight follow-ups as CI guards: check:versions, check:compiler allowlist (verified it fails on a reintroduced PreserveManualMemo), ESLint no-explicit-any on (demo's 9 `any` typed), no `as unknown as` outside boundary files (verified with a probe).
- 2026-10-13 — Select-all at 1M: profiled (live check 75, all-selected count 73, Set from model 62, next model 55, GC 48 ms); no API change needed after all: set built once and reused (WeakMap by model array), select-all marks the set as containing the selectable ids. ~260 → ~130 ms. Live check (54 ms) left.
- 2026-10-13 — Time-sliced pipeline closed (user agreed): proposal status updated, branch archived as `archive/timesliced-pipeline-2026-10-12`, both agent worktrees removed. Backlog under the feature hold is now empty except R-items done; ready to lift the hold (ask user).
- 2026-10-13 — Release 3.10.0 via PR.
- 2026-10-13 — 3.10.1 work: Next.js smoke fixture; perf #5 select-all ~60–90 ms / deselect <50 ms (live-check markers), #2 grouping 540 → 190 ms (lazy leaf maps, index partition), #3 quick filter first search 2.7 → ~1.6–2 s (per-day date memo, shown-text lower-case cache). check:compiler caught a getter-in-hook regression during #2 (fixed before push).
- 2026-10-16 — B8/B9 closed as won't fix (by design). Inline-function `localeText`: freezing the functions would bring back B9-style stale row labels, so added a dev-only warning instead (`useGridLocaleTextWarning`, in `GridRoot`). Branch `fix/localetext-functions`.
