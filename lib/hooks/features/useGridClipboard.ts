import { useEffect, useCallback } from 'react';
import type { GridColDef, GridRowModel, GridRowId } from '../../types';

interface UseGridClipboardProps {
  /** The currently selected row IDs — must come from the live selection source (not state.selection which is stale). */
  selectedRowIds: Set<GridRowId>;
  columns: GridColDef[];
  getVisibleRows: () => GridRowModel[];
  getRowId: (row: GridRowModel) => GridRowId;
}

function copyTextSynchronous(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
  return success;
}

/**
 * Writes text to clipboard.
 * Uses both execCommand (synchronous, needed for non-HTTPS or non-async-gesture environments)
 * and navigator.clipboard for modern browser support.
 */
async function writeToClipboard(text: string): Promise<void> {
  let fallbackSuccess = false;
  try {
    fallbackSuccess = copyTextSynchronous(text);
  } catch (e) {
    // Ignore fallback errors
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      if (fallbackSuccess) return;
      throw e;
    }
  } else if (!fallbackSuccess) {
    throw new Error('Clipboard API not available and fallback failed.');
  }
}

/**
 * Hook to handle clipboard operations.
 * Copies selected rows as Tab-Separated Values (TSV) on Ctrl+C / Cmd+C.
 * Also exposes `copySelectedRows` for programmatic use via apiRef.
 */
export function useGridClipboard(props: UseGridClipboardProps) {
  const { selectedRowIds, columns, getVisibleRows, getRowId } = props;

  const copySelectedRows = useCallback(async () => {

    if (selectedRowIds.size === 0) return;

    const visibleRows = getVisibleRows();
    const rowsToCopy = visibleRows.filter((row) => selectedRowIds.has(getRowId(row)));



    if (rowsToCopy.length === 0) return;

    // Exclude internal grid columns (checkbox, expand, reorder)
    const visibleColumns = columns.filter((col) => !col.field.startsWith('__'));

    // Header row
    const headerRow = visibleColumns
      .map((col) => col.headerName || col.field)
      .join('\t');

    // Data rows
    const dataRows = rowsToCopy
      .map((row) =>
        visibleColumns
          .map((col) => {
            const value = row[col.field];
            if (col.valueFormatter) {
              return col.valueFormatter({ value, row, field: col.field });
            }
            return value ?? '';
          })
          .join('\t')
      )
      .join('\n');

    const fullContent = `${headerRow}\n${dataRows}`;

    try {
      await writeToClipboard(fullContent);

    } catch (err) {
      console.error('[OpenGridX] Failed to copy to clipboard:', err);
    }
  }, [selectedRowIds, columns, getVisibleRows, getRowId]);

  // Keyboard shortcut: Ctrl+C / Cmd+C
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key !== 'c') return;

      // Don't intercept when user is typing in an input / editor
      const activeEl = document.activeElement as HTMLElement;
      const tag = activeEl?.tagName.toLowerCase();
      const type = (activeEl as HTMLInputElement)?.type;

      // Skip capturing Ctrl+C if we are genuinely inside a text input
      if (
        (tag === 'input' && type !== 'checkbox' && type !== 'radio') ||
        tag === 'textarea' ||
        tag === 'select'
      ) return;

      if (activeEl?.isContentEditable) return;

      copySelectedRows();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedRows]);

  return { copySelectedRows };
}
