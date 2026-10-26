import type { GridContextMenuEntry } from '../../types';

/** Drops leading, trailing and consecutive dividers so a menu never shows an empty section. */
export function cleanContextMenuEntries(entries: readonly GridContextMenuEntry[]): GridContextMenuEntry[] {
    const result: GridContextMenuEntry[] = [];
    for (const entry of entries) {
        if (entry === 'divider' && (result.length === 0 || result[result.length - 1] === 'divider')) continue;
        result.push(entry);
    }
    if (result[result.length - 1] === 'divider') result.pop();
    return result;
}
