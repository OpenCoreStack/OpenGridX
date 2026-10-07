import { useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import type { GridColDef, GridRowModel, GridRowId } from '../../types';
import { getCellValue } from '../../utils/values';
import { getExportColumns, formatExportValue } from '../../utils/export/exportShared';
import { CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD } from '../../utils/focus';

export interface UseGridClipboardProps {
  /**
   * The live selection. Read at copy time, so a copy made right after a selection change (from
   * `onRowSelectionModelChange`, or after `apiRef.selectRows`) sees the new selection.
   */
  getSelectedRowIds: () => Iterable<GridRowId>;
  /** The columns on screen, in screen order (hidden columns left out). */
  getColumns: () => GridColDef[];
  /**
   * Every data row the selection can refer to, in display order: pinned rows, rows on other
   * pages and rows inside collapsed groups included; rows removed by the filter and synthetic
   * group rows left out.
   */
  getRows: () => GridRowModel[];
  /** The grid's key for a row. Never the consumer's getRowId on a grid-made row. */
  getRowId: (row: GridRowModel) => GridRowId;
  /**
   * Returns the grid's root element. When given, Ctrl/Cmd+C only copies while focus is inside it,
   * so a page with several grids (or other content) is not affected by a grid that is not in use.
   */
  getRootElement?: () => HTMLElement | null;
  /** Turns the Ctrl/Cmd+C shortcut off. `copySelectedRows` still works. */
  disableKeyboardShortcut?: boolean;
  /**
   * When given, Ctrl/Cmd+C writes the text it returns instead of copying the selected rows, and
   * writes nothing when it returns `null` (cell range selection).
   */
  getShortcutText?: () => string | null;
}

/** Grid-made columns that never hold row data. */
const SYSTEM_FIELDS = new Set<string>([CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD]);

const TSV_SPECIAL = /[\t\n\r"]/;

/**
 * One TSV field as Excel, Google Sheets and LibreOffice read it: a field holding a tab, line break
 * or double quote is wrapped in double quotes, with inner quotes doubled.
 */
export function escapeTsvField(text: string): string {
  return TSV_SPECIAL.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The copied columns: the on-screen columns minus system columns and `exportable: false` ones. */
export function getClipboardColumns(columns: GridColDef[]): GridColDef[] {
  return getExportColumns(columns).filter(col => !SYSTEM_FIELDS.has(col.field));
}

/** Header line plus one line per row, with values read and formatted the way the cells show them. */
export function buildClipboardTsv(rows: GridRowModel[], columns: GridColDef[]): string {
  const header = columns.map(col => escapeTsvField(col.headerName || col.field)).join('\t');
  const lines = rows.map(row =>
    columns
      .map(col => escapeTsvField(formatExportValue(row, col, getCellValue(row, col.field, col))))
      .join('\t')
  );
  return [header, ...lines].join('\n');
}

/** A cell value formatted the way the cell shows it; a valueFormatter that throws gives the raw text. */
function formatCopyValue(row: GridRowModel, col: GridColDef): string {
  const value = getCellValue(row, col.field, col);
  try {
    return formatExportValue(row, col, value);
  } catch {
    return value == null ? '' : String(value);
  }
}

/**
 * A cell range as Excel and Google Sheets copy it: tabs between columns, line breaks between rows and
 * no header line. `rows` are the data rows of the range (synthetic rows already left out); a position
 * for which `isCovered` returns true (covered by a span whose origin sits elsewhere) is left empty.
 */
export function buildRangeTsv(
  rows: readonly GridRowModel[],
  columns: readonly GridColDef[],
  isCovered?: (row: GridRowModel, col: GridColDef) => boolean,
): string {
  const lines: string[] = new Array(rows.length);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const cells: string[] = new Array(columns.length);
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      cells[c] = isCovered?.(row, col) ? '' : escapeTsvField(formatCopyValue(row, col));
    }
    lines[r] = cells.join('\t');
  }
  return lines.join('\n');
}

/**
 * The textarea + execCommand fallback, for browsers without the async Clipboard API (plain http)
 * or when it rejects. It has to focus the textarea, so focus and the page selection are put back
 * afterwards: the focused grid cell (or button) keeps focus.
 */
function copyTextSynchronous(text: string): boolean {
  if (typeof document.execCommand !== 'function') return false;
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const previousRanges: Range[] = [];
  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) previousRanges.push(selection.getRangeAt(i));
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(textarea);
  let success = false;
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    success = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    if (selection) {
      selection.removeAllRanges();
      previousRanges.forEach(range => selection.addRange(range));
    }
  }
  return success;
}

/**
 * Writes text to the clipboard: the async Clipboard API when there is one, the execCommand
 * fallback when it is missing or rejects. Rejects when neither worked.
 */
export async function writeToClipboard(text: string): Promise<void> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return;
    } catch (error) {
      if (copyTextSynchronous(text)) return;
      throw error;
    }
  }
  if (!copyTextSynchronous(text)) {
    throw new Error('Clipboard API not available and fallback failed.');
  }
}

/** Ctrl/Cmd+C, also with Caps Lock on ("C") and on non-Latin layouts (the key printed "c" is KeyC). */
function isCopyShortcut(event: KeyboardEvent): boolean {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return false;
  const key = event.key ?? '';
  if (key.toLowerCase() === 'c') return true;
  // A layout whose KeyC types a non-Latin letter (Cyrillic, Greek, ...): browsers copy on KeyC.
  // A Latin layout that puts another letter there (Dvorak) copies on its own "c" key instead.
  return event.code === 'KeyC' && !/^[a-z]$/i.test(key);
}

/**
 * Hook to handle clipboard operations.
 * Copies selected rows as Tab-Separated Values (TSV) on Ctrl+C / Cmd+C.
 * Also exposes `copySelectedRows` for programmatic use via apiRef.
 */
export function useGridClipboard(props: UseGridClipboardProps) {
  const latestRef = useRef(props);
  useLayoutEffect(() => {
    latestRef.current = props;
  });

  /** Copies the selected rows. Resolves without writing when no selected row is found; rejects when the write fails. */
  const copySelectedRows = useCallback(async (): Promise<void> => {
    const { getSelectedRowIds, getColumns, getRows, getRowId } = latestRef.current;
    const selected = new Set<GridRowId>(getSelectedRowIds());
    if (selected.size === 0) return;

    const rowsToCopy = getRows().filter(row => selected.has(getRowId(row)));
    if (rowsToCopy.length === 0) return;

    const text = buildClipboardTsv(rowsToCopy, getClipboardColumns(getColumns()));
    await writeToClipboard(text);
  }, []);

  const disableKeyboardShortcut = Boolean(props.disableKeyboardShortcut);

  // Keyboard shortcut: Ctrl+C / Cmd+C. Registered once; it reads the latest props through the ref.
  useEffect(() => {
    if (disableKeyboardShortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isCopyShortcut(event)) return;

      // Don't intercept when user is typing in an input / editor
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName.toLowerCase();
      const type = (activeEl as HTMLInputElement | null)?.type;

      // Skip capturing Ctrl+C if we are genuinely inside a text input
      if (
        (tag === 'input' && type !== 'checkbox' && type !== 'radio') ||
        tag === 'textarea' ||
        tag === 'select'
      ) return;

      if (activeEl?.isContentEditable) return;

      // Only the grid that has focus copies.
      const { getRootElement } = latestRef.current;
      if (getRootElement) {
        const root = getRootElement();
        if (!root || !activeEl || !root.contains(activeEl)) return;
      }
      // A text selection on the page is the user's copy target: leave it to the browser.
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString() !== '') return;

      const { getShortcutText } = latestRef.current;
      const copy = getShortcutText
        ? () => {
          const text = getShortcutText();
          return text === null ? Promise.resolve() : writeToClipboard(text);
        }
        : copySelectedRows;
      copy().catch((err: unknown) => {
        console.error('[OpenGridX] Failed to copy to clipboard:', err);
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedRows, disableKeyboardShortcut]);

  return { copySelectedRows };
}
