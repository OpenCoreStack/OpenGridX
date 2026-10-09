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
    /** Passed to the toolbar as `forceFiltersOpen`. */
    toolbarFiltersRequested: boolean;
    /** Passed to the toolbar as `onFiltersPanelClose`. */
    closeToolbarFiltersPanel: () => void;
    /**
     * Opens the toolbar's filter panel (a header filter cell's "Custom filter"); undefined while no
     * `GridToolbar` that can show it is rendered.
     */
    openFiltersPanel: (() => void) | undefined;
}

/**
 * Opens the Columns panel for the column menu: in the toolbar when a `GridToolbar` has registered
 * through `GridToolbarHostContext`, otherwise as the standalone panel, which closes on Escape or a
 * mousedown outside it. Also opens the toolbar's filter panel for the header filter row, when a
 * `GridToolbar` has registered that it can show it.
 */
export function useGridColumnsPanel(): UseGridColumnsPanelResult {
    const [toolbarPanelRequested, setToolbarPanelRequested] = useState(false);
    const [standalonePanelOpen, setStandalonePanelOpen] = useState(false);
    const standalonePanelRef = useRef<HTMLDivElement>(null);
    const toolbarHostCountRef = useRef(0);
    // State, not a ref: whether "Custom filter" can open the panel decides how it renders.
    const [filtersHostCount, setFiltersHostCount] = useState(0);
    const [toolbarFiltersRequested, setToolbarFiltersRequested] = useState(false);

    const toolbarHost = useMemo<GridToolbarHost>(() => ({
        registerColumnsPanel: () => {
            toolbarHostCountRef.current += 1;
            return () => { toolbarHostCountRef.current -= 1; };
        },
        registerFiltersPanel: () => {
            setFiltersHostCount(count => count + 1);
            return () => setFiltersHostCount(count => count - 1);
        },
    }), []);

    const requestFiltersPanel = useCallback(() => setToolbarFiltersRequested(true), []);
    const closeToolbarFiltersPanel = useCallback(() => setToolbarFiltersRequested(false), []);

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
        toolbarFiltersRequested,
        closeToolbarFiltersPanel,
        openFiltersPanel: filtersHostCount > 0 ? requestFiltersPanel : undefined,
    };
}
