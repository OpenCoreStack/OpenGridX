
import { useRef, useCallback, useMemo, useEffect } from 'react';
import type { GridState } from './types';

export interface UseGridStateStorageOptions {
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

function readFromStorage(
  key: string,
  storage: UseGridStateStorageOptions['storage']
): GridState | undefined {
  try {
    const raw = storage!.getItem(key);
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
  storage: UseGridStateStorageOptions['storage']
) {
  try {
    const toWrite = include
      ? Object.fromEntries(
          Object.entries(state).filter(([k]) => include.includes(k as keyof GridState))
        )
      : state;
    storage!.setItem(key, JSON.stringify(toWrite));
  } catch {

  }
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
    storage = typeof window !== 'undefined' ? window.localStorage : undefined,
  } = opts;

  const initialState = useMemo(() => {
    if (!storage) return undefined;
    return readFromStorage(key, storage);

  }, [key]); 

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<GridState | null>(null);

  const flush = useCallback(() => {
    if (latestStateRef.current && storage) {
      writeToStorage(key, latestStateRef.current, include, storage);
    }
  }, [key, include, storage]);

  const onStateChange = useCallback(
    (state: GridState) => {
      latestStateRef.current = state;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(flush, debounceMs);
    },
    [flush, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        flush();
      }
    };
  }, [flush]);

  const clearState = useCallback(() => {
    if (storage) {
      storage.removeItem(key);
    }
  }, [key, storage]);

  return { initialState, onStateChange, clearState };
}
