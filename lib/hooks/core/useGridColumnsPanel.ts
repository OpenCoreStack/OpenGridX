import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { GridToolbarHost } from './gridToolbarHostContext';

export interface UseGridColumnsPanelResult {
    /** Provide through `GridToolbarHostContext` around the toolbar slot. */
    toolbarHost: GridToolbarHost;
    /** Passed to the toolbar as `forceColumnsOpen`. */
    toolbarPanelRequested: boolean;
    /** Passed to the toolbar as `onColumnsPanelClose`. */
    closeToolbarPanel: () => void;
    /** Whether the standalone Columns panel (used when no toolbar can show one) is open. */
    standalonePanelOpen: boolean;
    closeStandalonePanel: () => void;
    /** Attach to the standalone panel; a mousedown outside it closes it. */
    standalonePanelRef: RefObject<HTMLDivElement | null>;
    /** The column menu's **Manage columns** action. */
    openColumnsPanel: () => void;
}

/**
 * Opens the Columns panel for the column menu: in the toolbar when a `GridToolbar` has registered
 * through `GridToolbarHostContext`, otherwise as the standalone panel, which closes on Escape or a
 * mousedown outside it.
 */
export function useGridColumnsPanel(): UseGridColumnsPanelResult {
    const [toolbarPanelRequested, setToolbarPanelRequested] = useState(false);
    const [standalonePanelOpen, setStandalonePanelOpen] = useState(false);
    const standalonePanelRef = useRef<HTMLDivElement>(null);
    const toolbarHostCountRef = useRef(0);

    const toolbarHost = useMemo<GridToolbarHost>(() => ({
        registerColumnsPanel: () => {
            toolbarHostCountRef.current += 1;
            return () => { toolbarHostCountRef.current -= 1; };
        },
    }), []);

    const openColumnsPanel = useCallback(() => {
        if (toolbarHostCountRef.current > 0) {
            setToolbarPanelRequested(true);
        } else {
            setStandalonePanelOpen(true);
        }
    }, []);

    const closeToolbarPanel = useCallback(() => setToolbarPanelRequested(false), []);
    const closeStandalonePanel = useCallback(() => setStandalonePanelOpen(false), []);

    useEffect(() => {
        if (!standalonePanelOpen) return;
        function handleMouseDown(e: MouseEvent) {
            if (standalonePanelRef.current && !standalonePanelRef.current.contains(e.target as Node)) {
                setStandalonePanelOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setStandalonePanelOpen(false);
        }
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [standalonePanelOpen]);

    return {
        toolbarHost,
        toolbarPanelRequested,
        closeToolbarPanel,
        standalonePanelOpen,
        closeStandalonePanel,
        standalonePanelRef,
        openColumnsPanel,
    };
}
