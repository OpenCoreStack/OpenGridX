# React Compiler compatibility

Is OpenGridX safe in an app that runs [React Compiler](https://react.dev/learn/react-compiler) (`babel-plugin-react-compiler`)? This page records what was checked for 3.3.0, what was fixed, what is left, and how to run the checks again.

## Result

**Yes.** Apps that use React Compiler can use OpenGridX as it is published, and the library's own code also works when it is compiled.

- The package ships uncompiled code. Compiler setups usually leave `node_modules` alone, so in most apps the grid runs as it does without the compiler, next to the app's compiled components. Nothing in the grid depends on the consumer's components re-rendering more often than the compiler lets them.
- If an app compiles `node_modules` as well, or the package is compiled one day, the library still works: the unit and real-browser suites pass with `lib/` compiled (see [How it was checked](#how-it-was-checked)).
- 123 of the 126 components and hooks in `lib/` compile. Two are opted out on purpose with `'use no memo'`, and one hits a compiler limitation (see [Remaining issues](#remaining-issues)). A component or hook the compiler does not compile still works; it is just not memoized automatically.

What consumers should keep doing, compiler or not:

- Read `apiRef.current` in event handlers and effects, not while rendering. The compiler's `refs` rule reports reads during render in your code.
- Do not mutate `rows`, `columns` or models in place; pass new arrays and objects. Compiled components memoize on identity, so an in-place change may never reach the grid.
- A `renderCell` / `slots.toolbar` that calls hooks keeps working: the grid calls those functions inside wrapper components that the compiler does not memoize.

## How it was checked

| Check | Tool | Over |
| :--- | :--- | :--- |
| Lint rules | `eslint-plugin-react-hooks` 7.1.1, `recommended-latest` (the compiler-backed rules: `refs`, `immutability`, `purity`, `preserve-manual-memoization`, `set-state-in-render`, `set-state-in-effect`, `static-components`, …), plus the opt-in rules (`todo`, `memo-dependencies`, …) once | `lib/`, inline config ignored |
| Compilation | `babel-plugin-react-compiler` 1.0.0, target React 19, every file compiled with a logger (`npm run check:compiler`) | `lib/` without tests |
| Runtime, library compiled | unit suite (jsdom) and browser suite (Chromium, Firefox, WebKit) with `lib/` compiled (`REACT_COMPILER=1`) | 1459 unit, 372 browser tests |
| Runtime, demo compiled | demo site built with the compiler over `demo/` and `lib/`, then every route opened in Chromium: load, header sort clicks, cell click, arrow keys, double-click edit and Escape, row checkbox, scroll; page errors and `console.error` collected | 46 routes |

### Findings and fixes

Lint, before the fixes (react-hooks 7.0.1, which the project used then): 16 diagnostics in `lib/` — `set-state-in-effect` 10, `preserve-manual-memoization` 4, `immutability` 2. Compilation: 4 more functions failed on compiler limitations.

| Finding | Where | Fix |
| :--- | :--- | :--- |
| `immutability`: a prop (`inputRef`) mutated in a callback | `ui/Checkbox` | Ref assignment moved to a module-level `assignRef` helper |
| `immutability`: `commit` called itself before its declaration | `useGridEditing` | The in-flight retry goes through `commitRef` (set in a layout effect) |
| `preserve-manual-memoization`: dependency "may be mutated later", so the compiler skipped the component | `FilterPanel` (`FilterRow`), `GridToolbar` | `getOperatorsForType` result memoized; `columns` defaults to a module-level empty array instead of `[]` |
| Todo: `?.` / `??` / `\|\|` / `? :` inside `try` | `Cell`, `useAggregation`, `useGridEditing` | Expressions moved out of the `try`, or the throwing call wrapped in the new `utils/attempt` helper |
| `set-state-in-effect`: `forceColumnsOpen` copied into state in an effect | `GridToolbar` | Adjusted during render (previous-value state), same behaviour, one commit less |
| **Runtime:** with `lib/` compiled, 11 unit tests failed — toolbar panels opened by the column menu never reopened, and the Filters panel inside the grid did not appear | `GridToolbarSlot` (`InlineToolbar`) | `InlineToolbar` calls the toolbar function directly so its state survives inline redefinition. The compiler memoized that call and skipped it on re-render, so the toolbar's hooks did not run. `'use no memo'` on `InlineToolbar`; the same on `CellRenderTarget`, which calls `renderCell` the same way |
| `immutability` in a test helper (outer variable written during render) | `DataGrid.scrolling.browser.test.tsx` | Written in a layout effect |

The runtime failure only happens when the library itself is compiled; the published, uncompiled package never had it.

The ESLint config now uses `recommended-latest` with `immutability` and `preserve-manual-memoization` on (they were off), across `lib/`, `demo/` and tests, with no warnings and no disables. `eslint-plugin-react-hooks` was raised to 7.1.1; it tells ref-derived and layout-effect state updates apart better than 7.0.1.

## Remaining issues

None of these break anything; they are left because fixing them means a refactor.

| Issue | Where | Why it is left |
| :--- | :--- | :--- |
| Not compiled: `try` / `finally` (compiler Todo) | `useGridDataSource` | `fetchChildren` and the page requests rely on `finally` to settle the loading counters on every path (return, throw, `onError` throwing). Rewriting that is a refactor of the data-source request flow; the hook runs uncompiled, which is how it runs today |
| `set-state-in-effect` (4) | Summaries, Columns and Filters panels in `GridToolbar`, `PivotPanel` | Each popover measures its anchor (`getBoundingClientRect`) when it opens and on scroll/resize. That is DOM measurement, a legitimate effect. The rule stays off in `eslint.config.js` |
| `set-state-in-effect` (1, react-hooks 7.0.1 only) | `GlobalSearch` | Syncing an outside reset of the search text depends on refs that render cannot read; 7.1.1 accepts it |
| `memo-dependencies` (4, opt-in rule, not in `recommended-latest`) | `useRowGrouping`, `useTreeData`, `useGridEditing` | False positives: recursive local functions inside `useMemo` / `useCallback` reported as missing dependencies of themselves |
| `'use no memo'` (2) | `InlineToolbar`, `CellRenderTarget` | Intended: they call consumer functions that may use hooks |
| Not compiled: `try` / `finally`, `try` without `catch` | 6 demo pages (exports, filtering, theming, pivot) | Demo code only |

## How to run the checks again

```bash
npm run lint              # compiler-backed react-hooks rules (recommended-latest) over the whole repo
npm run check:compiler    # babel-plugin-react-compiler over lib/: every function it does not compile, and a summary
REACT_COMPILER=1 npx vitest run --project unit      # unit suite against lib/ compiled
REACT_COMPILER=1 npx vitest run --project browser   # browser suite against lib/ compiled (all 3 engines)
```

`REACT_COMPILER=1` is read by `vitest.config.ts`: it adds `babel-plugin-react-compiler` to `@vitejs/plugin-react` for `lib/` sources only, so the tests themselves stay as written.

To build the demo with the compiler, use a throwaway Vite config next to `vite.config.js` (not committed) and `npx vite build --config <file>`:

```js
import { defineConfig, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import base from './vite.config.js';

export default mergeConfig({ ...base, plugins: [] }, defineConfig({
  build: { outDir: 'dist-compiler' },
  plugins: [react({ babel: { plugins: [['babel-plugin-react-compiler', { target: '19' }]] } })],
}));
```

Serve it with `npx vite preview --config <file>` and open the routes. Delete `demo/dist-compiler` and the config afterwards: ESLint does not ignore them, and linting the bundle runs out of memory. Add a `logger: { logEvent(file, event) { … } }` option to the plugin to see which functions it compiled or skipped.

When adding code to `lib/`: `npm run check:compiler` should still list only the entries in [Remaining issues](#remaining-issues). If a component calls a function that may use hooks (a consumer callback rendered as part of the tree), give that wrapper `'use no memo'` as `InlineToolbar` does.
