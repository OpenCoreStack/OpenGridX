
import { useRef, useCallback, useMemo, useEffect, useLayoutEffect, useState } from 'react';
import type { GridState } from './types';

export interface UseGridStateStorageOptions {
    /**
     * Storage key. The grid reads `initialState` only when it mounts, so when the key can
     * change (per user, per view) remount the grid with it: `<DataGrid key={key} … />`.
     */
    key: string;
    debounceMs?: number;
    include?: (keyof GridState)[];
    storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
}

export interface UseGridStateStorageReturn {
    initialState: GridState | undefined;
    onStateChange: (state: GridState) => void;
    clearState: () => void;
}

type GridStateStorage = NonNullable<UseGridStateStorageOptions['storage']>;

/**
 * Reading `window.localStorage` itself throws a SecurityError when site data is blocked
 * (cookie blocking, sandboxed or partitioned iframes). Treat that as "no persistence".
 */
function resolveDefaultStorage(): GridStateStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function readFromStorage(
  key: string,
  storage: GridStateStorage
): GridState | undefined {
  try {
    const raw = storage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as GridState;
  } catch {

    return undefined;
  }
}

function writeToStorage(
  key: string,
  state: GridState,
  include: (keyof GridState)[] | undefined,
  storage: GridStateStorage
) {
  try {
    const toWrite = include
      ? Object.fromEntries(
          Object.entries(state).filter(([k]) => include.includes(k as keyof GridState))
        )
      : state;
    storage.setItem(key, JSON.stringify(toWrite));
  } catch {
    // swallow localStorage write errors (private browsing, quota exceeded)
  }
}

interface PendingWrite {
  key: string;
  state: GridState;
}

export function useGridStateStorage(
  options: UseGridStateStorageOptions | string
): UseGridStateStorageReturn {

  const opts: UseGridStateStorageOptions = typeof options === 'string'
    ? { key: options }
    : options;

  const {
    key,
    debounceMs = 300,
    include,
    storage: storageOption,
  } = opts;

  // Resolved once so its identity is stable across renders.
  const [defaultStorage] = useState(resolveDefaultStorage);
  const storage = storageOption ?? defaultStorage;

  // Latest-value refs: `include` and `storage` are often written inline, so they must not
  // drive callback identities (that used to flush storage on every re-render).
  const includeRef = useRef(include);
  const storageRef = useRef(storage);
  useLayoutEffect(() => {
    includeRef.current = include;
    storageRef.current = storage;
  });

  // Read once per key. A new inline `storage` object on each render must not re-parse storage.
  const [loaded, setLoaded] = useState<{ key: string; state: GridState | undefined }>(() => ({
    key,
    state: storage ? readFromStorage(key, storage) : undefined,
  }));
  let initialState = loaded.state;
  if (loaded.key !== key) {
    initialState = storage ? readFromStorage(key, storage) : undefined;
    setLoaded({ key, state: initialState });
  }

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The pending write remembers the key it was made for, so a debounced write never lands in
  // a different key after the key changes.
  const pendingRef = useRef<PendingWrite | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    const target = storageRef.current;
    if (pending && target) {
      writeToStorage(pending.key, pending.state, includeRef.current, target);
    }
  }, []);

  const onStateChange = useCallback(
    (state: GridState) => {
      if (pendingRef.current && pendingRef.current.key !== key) flush();
      pendingRef.current = { key, state };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(flush, debounceMs);
    },
    [key, flush, debounceMs]
  );

  // Flush a pending write on unmount only; nothing is written when no write is pending.
  useEffect(() => flush, [flush]);

  const clearState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
    const target = storageRef.current;
    if (target) {
      try {
        target.removeItem(key);
      } catch {
        // storage became unavailable — nothing to clear
      }
    }
  }, [key]);

  return useMemo(
    () => ({ initialState, onStateChange, clearState }),
    [initialState, onStateChange, clearState]
  );
}
