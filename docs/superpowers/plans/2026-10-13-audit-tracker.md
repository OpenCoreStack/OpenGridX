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
| B7 | Low–Med | Duplicate row ids silently drop rows (no dev warning) | row store | later | ⬜ | |
| B8 | Low | Quick filter stale on in-place row mutation | quick-filter cache | later | ⬜ | fixed by P7 |
| B9 | Low | Quick filter stale when a formatter closure changes | quick-filter cache | later | ⬜ | fixed by P7 |
| B10 | Low | `bigint` loses precision in sort | `lib/utils/sorting/index.ts:45` | later | ⬜ | |
| B11 | Low | Number filters accept `0x10`, `Infinity` | `lib/utils/values.ts:96-101` | later | ⬜ | |

## Performance

| ID | Improvement | Expected gain | Effort | Target | Status | Notes |
| :- | :---------- | :------------ | :----- | :----- | :----- | :---- |
| P2 | Incremental row-store updates (`REPLACE_ROW(S)`, `effectiveRows`, `indexById` only when reorder on, dedupe `rowIndexById`, `useGridRowIdOf`) | 1M edit/paste/undo 0.5–0.8 s → ~0.05 s | M | 3.8.0 | ⬜ | |
| P3 | Scope `*` box-sizing reset to `.ogx`; drop `.ogx:hover` box-shadow | no host-page side effect | S | 3.7.1 | ✅ | reset scoped with `:where([class*="ogx"] …)`; `.ogx:hover` shadow removed |
| P4 | Split `useLayout` memo (column widths vs row heights) | ~40 ms per resize move at 1M | S | 3.7.1 | ✅ | row and column memos split, merged by a third memo |
| P5 | Cheaper select-all and incremental group expand | 1M select-all 316 → <50 ms | M | 3.8.0 | ⬜ | |
| P7 | Per-row quick-filter cache (WeakMap) | no rebuild per edit; less memory (~32 MB/100k now) | M | 3.8.0 | ⬜ | |
| P8 | Skip re-render of unchanged cells/header; remove double commit | ~half React work per interaction | M | later | ⬜ | |
| P9 | Lazy/modular opt-in features | up to ~35 KB gz for minimal apps | L | later | ⬜ | |

Baselines (Chromium, M1, 1M rows): edit 508 ms · paste/undo/redo ~790 ms · fill 783 ms · select-all 316 ms · expand 279 ms · sort 403 ms.

## Cleanup / refactors

| ID | Item | Effort | Status | Notes |
| :- | :--- | :----- | :----- | :---- |
| R1 | Remove dead code: `lib/theme/defaultStyles.ts`, 12 unused util exports, 9 never-emitted CSS classes, 27 unread CSS vars; decide on `QuickFilter` CSS | S | ⬜ | `ogx__` classes are public API — check before removing |
| R2 | Shared filter-value helper for FilterPanel + HeaderFilterCell (6 valueOptions readers) | S–M | ⬜ | |
| R3 | Stop writing `_isSkeleton` onto rows | M | ⬜ | v3 "never modify rows" rule |
| R4 | Reduce ~41 `as unknown as` casts (internal column type) | L | ⬜ | |
| R5 | Split files >600 lines (`GridToolbar.tsx` 855, …) | M each | ⬜ | |
| R6 | Narrow wide hook interfaces (keyboard nav: 31 params) | L | ⬜ | |
| R7 | Route ~70 hard-coded English strings through `localeText` | M | ⬜ | new public keys → minor release |
| R8 | Document 24 exports missing from `docs/API_REFERENCE.md` | S | ⬜ | |

## Log

- 2026-10-13 — Tracker created from the analysis report. Next: start 3.7.1 with B1.
- 2026-10-13 — Branch `release/3.7.1`. B1–B6, P3, P4 implemented; CHANGELOG entry added; lint, typecheck, build and 1936 unit tests pass. Browser suite running.
- 2026-10-13 — Browser suite: 576/579 passed; the 3 failures were the theme baseline test, whose wrapper relied on the old page-wide box-sizing reset (P3 working as intended). Wrapper given its own `box-sizing`; baseline passes in all 3 engines with no baseline regeneration.
