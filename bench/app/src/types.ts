// The contract between the page (harness.tsx) and the runner (bench/run.mjs, through page.evaluate).

export interface LongTaskStats {
  count: number;
  totalMs: number;
  maxMs: number;
}

export interface OpResult {
  /** Time from starting the operation to the first painted frame showing its result. */
  ms: number;
  /** Long tasks between start and that frame; null where the engine has no 'longtask' entries. */
  longTasks: LongTaskStats | null;
  /** Rows shown after the operation. */
  rowCount: number;
  /** Set when the result on screen is not the expected one. */
  warning: string | null;
}

export interface ScrollResult {
  frames: number;
  p50: number;
  p95: number;
  p99: number;
  /** Share of frames (0..1) longer than 1.5 / 2.5 refresh intervals (missed one / two refreshes). */
  over16: number;
  over33: number;
  /** `over16` for the constant-velocity part and for the random jumps. */
  over16Constant: number;
  over16Jumps: number;
  longTasks: LongTaskStats | null;
  /** Row elements and cells in the DOM at the end of the scroll. */
  domRows: number;
  domCells: number;
  /** Row elements after scrolling back to the top and letting the grid settle. */
  domRowsAtRest: number;
}

export interface ReachResult {
  rowCount: number;
  /** 1-based index of the last row on screen when scrolled to the very bottom. */
  lastVisibleRow: number;
  lastVisibleRowId: string;
  scrollHeight: number;
  contentHeight: number;
  /** rowCount × rowHeight: the height the rows need. */
  intendedHeight: number;
  maxScrollTop: number;
  scrollTop: number;
}

export interface BenchApi {
  generate(count: number, seed: number): number;
  refreshInterval(): Promise<{ intervalMs: number; idleOver16: number }>;
  mount(rowHeight: number): Promise<number>;
  settle(frames?: number): Promise<void>;
  scroll(seed: number, intervalMs: number): Promise<ScrollResult>;
  reach(): Promise<ReachResult>;
  sortNumber(): Promise<OpResult>;
  sortString(): Promise<OpResult>;
  filterString(): Promise<OpResult>;
  filterNumber(): Promise<OpResult>;
  quickFilter(): Promise<OpResult>;
  group(): Promise<OpResult>;
  unmount(): void;
}

declare global {
  interface Window {
    __bench?: BenchApi;
  }
}
