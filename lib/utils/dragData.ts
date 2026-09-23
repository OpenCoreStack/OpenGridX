/**
 * HTML5 drag-and-drop helpers shared by row and column reorder.
 *
 * Each reorder drag puts a MIME type of its own into the DataTransfer. Firefox only starts a drag
 * when dragstart sets some data, and drop targets use the type to accept only the grid's own drag,
 * so a file, a text selection or another grid's drag is never taken for a reorder.
 */

export const ROW_DRAG_MIME = 'application/x-ogx-row';
export const COLUMN_DRAG_MIME = 'application/x-ogx-column';

interface DragEventLike {
    dataTransfer?: Partial<Pick<DataTransfer, 'setData' | 'types'>> | null;
}

/** Stores the drag token (and a plain-text copy) on dragstart. */
export function setDragToken(event: DragEventLike, mime: string, value: string): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || typeof dataTransfer.setData !== 'function') return;
    dataTransfer.setData(mime, value);
    dataTransfer.setData('text/plain', value);
}

/**
 * False when the drag carries data types and the grid's token is not among them. When the
 * browser (or a test double) exposes no type list, the drag is not rejected on that ground.
 */
export function hasDragToken(event: DragEventLike, mime: string): boolean {
    const types = event.dataTransfer?.types;
    if (!types) return true;
    return Array.from(types).includes(mime);
}

/**
 * Calls `onEnd` once when the drag that started on `source` ends. The listener sits on the
 * source node itself, so it also fires when that node has been unmounted mid-drag (a virtualized
 * row scrolled out of the render window), which React's delegated `onDragEnd` never sees.
 */
export function onNativeDragEnd(source: EventTarget | null | undefined, onEnd: () => void): () => void {
    if (!source || typeof source.addEventListener !== 'function') return () => {};
    const handler = () => onEnd();
    source.addEventListener('dragend', handler, { once: true });
    return () => source.removeEventListener('dragend', handler);
}
