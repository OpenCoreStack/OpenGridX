import type { GridColumnVisibilityModel } from './columns';
import type { GridSortItem } from './sorting';
import type { GridFilterModel } from './filtering';
import type { GridRowGroupingModel, GridAggregationModel, GridPivotModel } from './grouping';

/** A part of the grid state a model may change. @since v3.4 */
export type GridAiPart = 'filter' | 'sort' | 'grouping' | 'aggregation' | 'pivot' | 'columnVisibility';

/** Grid state as the AI toolkit reads and writes it. Only the parts present are applied. @since v3.4 */
export interface GridAiState {
  filterModel?: GridFilterModel;
  sortModel?: GridSortItem[];
  rowGroupingModel?: GridRowGroupingModel;
  aggregationModel?: GridAggregationModel;
  pivotModel?: GridPivotModel;
  columnVisibilityModel?: GridColumnVisibilityModel;
}

/** One thing the validator dropped or could not use. `path` points into the model output. @since v3.4 */
export interface GridAiValidationError {
  path: string;
  message: string;
}

/** One earlier prompt of this session and the state the assistant applied for it. @since v3.5 */
export interface GridAiHistoryEntry {
  prompt: string;
  applied: GridAiState;
}

/** What `aiAssistant.onPrompt` receives next to the prompt. @since v3.5 */
export interface GridAiPromptContext {
  /** The grid's current models (`apiRef.getGridAiState()`). */
  currentState: GridAiState;
  /** Earlier prompts of this session, oldest first. */
  history: GridAiHistoryEntry[];
  /** Aborted when the user presses Stop, sends another prompt or closes the panel. */
  signal: AbortSignal;
}

/**
 * What `aiAssistant.onPrompt` resolves with. The grid applies it only when its `state` comes from
 * `validateGridAiState` (or `createGridAiPromptHandler`), which brands the result and its `state`.
 * @since v3.5
 */
export interface GridAiPromptResult {
  state: GridAiState;
  /** What the validator dropped; shown as "Ignored: …". */
  errors: GridAiValidationError[];
  /** The assistant's reply text, shown in the panel. */
  message?: string;
}

/** The `aiAssistant` prop: the "Ask AI" prompt panel. @since v3.5 */
export interface GridAiAssistantOptions {
  /**
   * Answers a prompt. Call your own model and return the validated result: `createGridAiPromptHandler`
   * from `@opencorestack/opengridx/ai` builds this function, or call `validateGridAiState` yourself.
   */
  onPrompt: (prompt: string, context: GridAiPromptContext) => Promise<GridAiPromptResult>;
  /** Placeholder of the prompt input. Default: `"Ask about this table…"` */
  placeholder?: string;
  /** Example prompts shown as clickable chips. */
  suggestions?: string[];
  /** Shows a microphone button where the browser has speech recognition; the microphone is asked for only on click. Default: true. */
  voice?: boolean;
  /** The parts of the state the assistant may change. Default: every part. */
  parts?: GridAiPart[];
}

/** One change the assistant applied, shown as a removable chip. @since v3.5 */
export interface GridAiChip {
  id: string;
  part: GridAiPart;
  label: string;
}

/** The assistant panel's state. @since v3.5 */
export type GridAiAssistantStatus = 'idle' | 'running' | 'applied' | 'stopped' | 'error';

/** Props of `slots.aiAssistantPanel` and the built-in panel, rendered while the panel is open. @since v3.5 */
export interface GridAiAssistantPanelProps {
  status: GridAiAssistantStatus;
  /** The status line: "Thinking…", "Applied 3 changes", an error. */
  statusText: string;
  /** The assistant's reply text (`result.message`). */
  message: string | null;
  /** What the last reply asked for that was ignored. */
  errors: GridAiValidationError[];
  /** The changes the last reply applied. */
  chips: GridAiChip[];
  /** Earlier prompts of this session, oldest first. */
  history: GridAiHistoryEntry[];
  suggestions: string[];
  placeholder: string;
  /** `voice` is on and this browser has speech recognition. */
  voiceAvailable: boolean;
  /** Undo can restore the state from before the last reply. */
  canUndo: boolean;
  submit: (prompt: string) => void;
  /** Aborts the running request. */
  stop: () => void;
  /** Restores the state from before the last reply. */
  undo: () => void;
  /** Re-applies the last reply without this change. */
  removeChip: (id: string) => void;
  /** Closes the panel; focus returns to where it was before it opened. */
  close: () => void;
}
