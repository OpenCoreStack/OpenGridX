import type { GridRowId, GridRowModel, GridValidRowModel } from './rows';
import type { GridFilterModel } from './filtering';
import type { GridAggregationModel } from './grouping';

/**
 * Configuration options for exporting the DataGrid to PDF format.
 * Requires jspdf and jspdf-autotable peer dependencies.
 */
export interface PdfExportOptions<R extends GridValidRowModel = GridRowModel> {
  /**
   * Output filename without extension. Default: 'export'
   */
  fileName?: string;

  /**
   * Title text displayed in the document header.
   * When omitted, no header block is rendered.
   */
  title?: string;

  /**
   * URL or data URI of a logo image rendered left of the title.
   * Only used when `title` is also set. Default: none
   */
  logoUrl?: string;

  /**
   * Page orientation. Default: 'landscape'
   */
  orientation?: 'portrait' | 'landscape';

  /**
   * If provided, only rows whose id is in this array are exported. A non-empty selection takes
   * precedence over `groupedRows` (the selected rows are exported flat), and the footer totals
   * are recomputed over the selected rows.
   */
  selectedRows?: (string | number)[];

  /**
   * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
   * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
   */
  getRowId?: (row: R) => GridRowId;

  /**
   * Aggregation result from apiRef.current.getAggregationResult().
   * When provided alongside aggregationModel, appends a footer row.
   */
  aggregationResult?: Record<string, unknown> | null;

  /**
   * Aggregation model from apiRef.current.getAggregationModel().
   */
  aggregationModel?: GridAggregationModel | null;

  /**
   * Active filter model. When provided, a filter summary is shown in the header.
   */
  filterModel?: GridFilterModel | null;

  /**
   * Whether to apply alternating row shading. Default: true
   */
  alternateRowColor?: boolean;

  /**
   * Column header background color (hex). Default: '#4f46e5'
   */
  headerBackgroundColor?: string;

  /**
   * Column header text color (hex). Default: '#ffffff'
   */
  headerTextColor?: string;

  /**
   * Base font size in points for table body. Default: 9
   */
  fontSize?: number;

  /**
   * A TrueType font for the whole document. The built-in Helvetica font only covers Latin-1 and
   * WinAnsi punctuation (é, ü, €, “ ”, •). Without this option other characters (₹, Greek,
   * Cyrillic, CJK, Devanagari, U+202F used by some locales as a thousands separator) are
   * replaced with `?` (spaces and minus signs with their ASCII forms) and a warning is logged.
   * `data` is the `.ttf` file as a base64 string; `boldData` is an optional bold face for the
   * title, header and totals (the regular face is used when omitted). jsPDF does not shape
   * complex scripts, so Devanagari or Arabic ligatures may not join.
   * @since v3.0
   */
  font?: {
    /** Font family name, e.g. 'NotoSans'. */
    name: string;
    /** Base64-encoded .ttf file. */
    data: string;
    /** Base64-encoded bold .ttf file. Default: `data`. */
    boldData?: string;
  };

  /**
   * Pre-built grouped export rows from `apiRef.current.getGroupedExportRows()`.
   * When provided, the PDF table reflects the grouping structure (group headers,
   * leaf rows, per-group subtotals, grand total) instead of a flat row list.
   * Has no effect when the grid has no active `rowGroupingModel`, or when `selectedRows` is non-empty.
   */
  groupedRows?: GridGroupedExportRow[];

  /**
   * Called as the export advances: `prepare` (formatting rows; `total` = source rows or grouped
   * entries), `render` (drawing table rows; `total` = table body rows) and `save` (`0/1` before the
   * file is written, `1/1` after). `done` never decreases within a phase and ends at `total`.
   * @since v3.2
   */
  onProgress?: (progress: PdfExportProgress) => void;

  /**
   * Cancels the export. When aborted, the returned promise rejects with a `DOMException` named
   * `'AbortError'` and no file is saved. Checked between slices of work, so cancellation takes
   * effect within one slice; the final save step cannot be interrupted once started.
   * @since v3.2
   */
  signal?: AbortSignal;

  /**
   * Table-row count above which a development-mode warning recommends `exportToCsv` or
   * `exportToExcelAdvanced`. The export still runs (nothing is thrown). Pass `Infinity` to silence it.
   * Default: 20000
   * @since v3.2
   */
  maxRows?: number;
}

/** Progress reported by `PdfExportOptions.onProgress`. @since v3.2 */
export interface PdfExportProgress {
  phase: 'prepare' | 'render' | 'save';
  done: number;
  total: number;
}

/**
 * A single entry in the ordered list returned by `GridApi.getGroupedExportRows()`.
 * Traverse in array order to reproduce the on-screen grouping structure.
 */
export interface GridGroupedExportRow {
  /** Discriminator: the kind of row this entry represents. */
  type: 'group-header' | 'leaf' | 'group-subtotal' | 'grand-total';
  /** Nesting depth (0 = top-level group, 1 = nested group, etc.). */
  depth: number;
  /** The grouping field for this level (absent on 'leaf' and 'grand-total'). */
  groupField?: string;
  /** The raw grouping value for this level (absent on 'leaf' and 'grand-total'). */
  groupValue?: unknown;
  /**
   * The group label exactly as the grid shows it (from `groupingValueFormatter`, else `"field: value"`),
   * on 'group-header' and 'group-subtotal' entries from `getGroupedExportRows()`. Exporters use it for
   * group-header rows; when absent they apply the column's `groupingValueFormatter` themselves.
   * @since v3.0
   */
  groupLabel?: string;
  /** Per-group aggregation results (present on 'group-subtotal' and 'grand-total'). */
  aggregatedValues?: Record<string, unknown>;
  /** The original data row (only present when `type === 'leaf'`). */
  row?: GridRowModel;
}
