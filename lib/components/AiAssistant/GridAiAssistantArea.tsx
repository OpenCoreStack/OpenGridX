import type React from 'react';
import type { GridAiAssistantPanelProps, GridSlots } from '../../types';
import { GridAiAssistantPanel } from './GridAiAssistantPanel';

interface GridAiAssistantAreaProps {
    panelProps: GridAiAssistantPanelProps;
    slot: GridSlots['aiAssistantPanel'];
    slotProps: Record<string, unknown> | undefined;
}

/**
 * Anchors the `aiAssistant` panel (or `slots.aiAssistantPanel`) under the toolbar, over the grid.
 * Escape anywhere in it closes the panel.
 */
export function GridAiAssistantArea({ panelProps, slot: Slot, slotProps }: GridAiAssistantAreaProps) {
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        panelProps.close();
    };
    return (
        <div className="ogx-ai-anchor" onKeyDown={handleKeyDown}>
            {Slot ? <Slot {...panelProps} {...slotProps} /> : <GridAiAssistantPanel {...panelProps} />}
        </div>
    );
}
