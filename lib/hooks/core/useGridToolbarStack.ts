import type { MutableRefObject, RefObject } from 'react';
import type { GridApi, GridLocaleText, GridRowModel } from '../../types';
import { useGridColumnsPanel } from './useGridColumnsPanel';
import { useGridStylesheetWarning } from './useGridDevWarnings';
import { useGridAiAssistant, type UseGridAiAssistantParams } from '../features/useGridAiAssistant';
import { useGridToolbarProps, type UseGridToolbarPropsParams } from './useGridToolbarProps';

/** What `useGridToolbarProps` needs besides the columns panel and the AI assistant built here. */
export type GridToolbarStackToolbarParams<R extends GridRowModel> = Omit<UseGridToolbarPropsParams<R>,
    'forceColumnsOpen' | 'onColumnsPanelClose' | 'aiAssistantEnabled' | 'aiAssistantOpen' | 'onAiAssistantToggle' |
    'aiAssistantLabel' | 'forceFiltersOpen' | 'onFiltersPanelClose' | 'apiRef'>;

export interface UseGridToolbarStackParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    containerRef: RefObject<HTMLDivElement | null>;
    aiAssistant: Omit<UseGridAiAssistantParams, 'apiRef' | 'localeText'>;
    toolbar: GridToolbarStackToolbarParams<R>;
    localeText: GridLocaleText | undefined;
}

/**
 * Steps 44–46 of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: the columns
 * panel (toolbar or standalone), the missing-stylesheet warning, the `aiAssistant` panel, and the props for
 * `slots.toolbar` (which gets its Ask AI button from the assistant).
 */
export function useGridToolbarStack<R extends GridRowModel>(params: UseGridToolbarStackParams<R>) {
    const { apiRef, containerRef, aiAssistant, toolbar, localeText } = params;

    const columnsPanel = useGridColumnsPanel();
    useGridStylesheetWarning(containerRef);

    // The aiAssistant prompt panel (v3.5): applies validated replies through apiRef; apiRef.openAiAssistant.
    const aiAssistantPanel = useGridAiAssistant({ apiRef, localeText, ...aiAssistant });

    const toolbarProps = useGridToolbarProps<R>({
        ...toolbar,
        apiRef,
        forceColumnsOpen: columnsPanel.toolbarPanelRequested,
        onColumnsPanelClose: columnsPanel.closeToolbarPanel,
        aiAssistantEnabled: aiAssistantPanel.enabled,
        aiAssistantOpen: aiAssistantPanel.open,
        onAiAssistantToggle: aiAssistantPanel.togglePanel,
        aiAssistantLabel: localeText?.aiAssistantButton,
        forceFiltersOpen: columnsPanel.toolbarFiltersRequested,
        onFiltersPanelClose: columnsPanel.closeToolbarFiltersPanel,
    });

    return { columnsPanel, aiAssistantPanel, toolbarProps };
}
