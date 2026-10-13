# Proposal: opt-in feature modules (4.0)

Status: proposal, not scheduled. Replaces audit item P9 ("lazy or modular opt-in features").

## Why

An app that imports only `DataGrid` ships 87–88 KB gzipped (271 KB minified, esbuild, React external; measured 2026-10-13 on 3.9.0). Much of it is features the app may never turn on.

Measured share of the minified bundle (esbuild metafile, `DataGrid`-only entry):

| Part | Minified | Wired how |
| :--- | :--- | :--- |
| Cell selection | 10.0 KB | hook in the core hook order |
| Header filter row (+ utils) | 11.3 KB | component, visible at mount |
| AI assistant panel + chip logic + hook | ~13 KB | hook + panel |
| Fill handle | 4.6 KB | hook |
| Paste | 4.3 KB | hook |
| Pivot logic | 4.5 KB | hook + utils |
| Spanning | 4.2 KB | hook |
| Undo / redo | 2.9 KB | hook |
| Clipboard | 2.7 KB | hook |
| Columns panel | 3.4 KB | component, on demand |

Roughly 60 KB minified (~20 KB gzipped, ~23 %) is opt-in functionality.

## Options considered

1. **Lazy-load the on-demand UI** (`React.lazy` for the AI panel, columns panel, pivot): ~6 KB gzipped once the header filter row is excluded (it renders at mount, so lazy loading would flicker). Costs: a loading moment on first open, extra chunk files, no gain for the UMD build, SSR edge cases. **Rejected for now**: too little gain for the risk.
2. **Feature modules (recommended for 4.0).** Features register through an explicit list, so a bundler drops what is not imported:

   ```tsx
   import { DataGrid } from '@opencorestack/opengridx';
   import { cellSelection, fillHandle, undoRedo } from '@opencorestack/opengridx/features';

   <DataGrid features={[cellSelection, fillHandle, undoRedo]} cellSelection undoRedo … />
   ```

   Each module brings its hook (called at its fixed slot in the hook order) and its components. A grid without the module ignores the related props, with a development warning naming the missing module.
3. **Separate entry points per feature without registration**: still needs the core to reach the hooks, so it reduces to option 2.

## Constraints for option 2

- **Hook order stays fixed.** `DataGrid` keeps one call site per feature slot and calls either the module's hook or a no-op of the same shape. A module may never add or remove hook calls between renders: the `features` list must be fixed for the grid's lifetime (development error if it changes).
- `apiRef` methods of a missing feature exist and warn (they are part of `GridApi`'s type).
- Breaking: apps using these features must add the module. A 3.x compatibility entry (`@opencorestack/opengridx/all`) registers every module, so migration is one import.
- The package smoke suite needs a "minimal" fixture that asserts the bundle size, so a later change cannot pull a module back into the core.

## Expected result

~20 KB gzipped less for an app that uses none of the modules (87 → ~67 KB), measured the same way.
