import type { MutableRefObject, RefObject } from 'react';
import type { GridRowModel } from '../../types';
import { useGridViewport, type UseGridViewportParams } from './useGridViewport';
import { useGridMaxContentHeight } from './useGridMaxContentHeight';
import { useGridVirtualization, type UseGridVirtualizationParams } from './useGridVirtualization';
import type { LayoutResult } from './useLayout';

export interface UseGridScrollViewportParams<R extends GridRowModel> {
    viewport: Omit<UseGridViewportParams, 'viewportRef' | 'rowCount'>;
    viewportRef: MutableRefObject<HTMLDivElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
    layout: LayoutResult<R>;
    viewportWidth: number;
    viewportHeight: number;
    /** The virtualization inputs that do not come from the viewport. */
    virtualization: Pick<UseGridVirtualizationParams<R>,
        'autoHeight' | 'rowReordering' | 'hasDetailPanel' | 'checkboxSelection' | 'pinCheckboxColumn' | 'pinExpandColumn'>;
}

/**
 * Steps 32–33 of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: scroll sync
 * and viewport measurement, the tallest element this browser lays out (32a), and the render window.
 */
export function useGridScrollViewport<R extends GridRowModel>(params: UseGridScrollViewportParams<R>) {
    const { viewport, viewportRef, containerRef, layout, viewportWidth, viewportHeight, virtualization: options } = params;

    const { scrollTop, scrollLeft, overscanRows, handleScroll, setViewportElement } = useGridViewport({
        ...viewport, rowCount: layout.unpinnedRowsLength, viewportRef,
    });

    const maxContentHeight = useGridMaxContentHeight(containerRef);
    const virtualization = useGridVirtualization({
        layout, scrollTop, scrollLeft,
        viewportWidth,
        viewportHeight,
        ...options,
        overscanRows,
        maxContentHeight: maxContentHeight ?? Infinity,
    });

    return { handleScroll, setViewportElement, maxContentHeight, virtualization };
}
