import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type {
    GridAiAssistantOptions,
    GridAiAssistantPanelProps,
    GridAiAssistantStatus,
    GridAiHistoryEntry,
    GridAiPromptResult,
    GridAiState,
    GridAiValidationError,
    GridApi,
    GridColDef,
    GridLocaleText,
} from '../../types';
import { aiChipTextsOf, resolveGridLocale, type ResolvedGridLocale } from '../../utils/gridLocale';
import { attempt } from '../../utils/attempt';
import { isGridAiValidated } from '../../utils/aiBrand';
import {
    AI_PARTS,
    applyGridAiState,
    buildAiChips,
    dropEmptiedParts,
    effectiveState,
    pickAllowedParts,
    removeAiChip,
    snapshotParts,
} from '../../utils/aiAssistant';

export interface UseGridAiAssistantParams {
    apiRef: MutableRefObject<GridApi>;
    /** The `aiAssistant` prop. Without it the hook is inert. */
    options: GridAiAssistantOptions | undefined;
    /** Columns, for the chip labels (header names). */
    columns: readonly GridColDef[];
    onApply?: (result: GridAiPromptResult) => void;
    onError?: (error: unknown) => void;
    /** The grid's `localeText`, for the status line and the placeholder. */
    localeText?: GridLocaleText;
}

export interface UseGridAiAssistantResult {
    enabled: boolean;
    open: boolean;
    /** Opens the panel; focus returns to `trigger` (default: the focused element) when it closes. */
    openPanel: (trigger?: HTMLElement | null) => void;
    /** Opens the panel, or closes it when it is open. */
    togglePanel: (trigger?: HTMLElement | null) => void;
    closePanel: () => void;
    /** Props of the panel while it is open, else null. */
    panelProps: GridAiAssistantPanelProps | null;
    /** The status line for the grid's live region. */
    announcement: string;
}

const NO_SUGGESTIONS: string[] = [];
const NO_ERRORS: GridAiValidationError[] = [];
const NOT_VALIDATED = 'The reply was not validated';

interface Applied {
    /** The reply's parts the grid applied (chips are built from it). */
    state: GridAiState;
    /** The same parts as they were before: what Undo restores. */
    previous: GridAiState;
}

/** Whether this browser has speech recognition. The microphone is never asked for here. */
export function hasSpeechRecognition(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

function isAbortError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

/** What the status line says, turned into text with the grid's locale at render time. */
type StatusLine =
    | { kind: 'none' }
    | { kind: 'thinking' }
    | { kind: 'stopped' }
    | { kind: 'undone' }
    | { kind: 'removed' }
    | { kind: 'applied'; count: number; ignored: number }
    | { kind: 'notValidated' }
    | { kind: 'failed'; error: unknown };

const NO_STATUS: StatusLine = { kind: 'none' };
const THINKING: StatusLine = { kind: 'thinking' };
const STOPPED: StatusLine = { kind: 'stopped' };
const UNDONE: StatusLine = { kind: 'undone' };
const REMOVED: StatusLine = { kind: 'removed' };
const NOT_VALIDATED_STATUS: StatusLine = { kind: 'notValidated' };

function statusLineText(line: StatusLine, locale: ResolvedGridLocale): string {
    switch (line.kind) {
        case 'none': return '';
        case 'thinking': return locale.aiAssistantThinking;
        case 'stopped': return locale.aiAssistantStopped;
        case 'undone': return locale.aiAssistantUndone;
        case 'removed': return locale.aiAssistantChangeRemoved;
        case 'applied': return locale.aiAssistantApplied(line.count, line.ignored);
        case 'notValidated': return locale.aiAssistantNotValidated;
        case 'failed': {
            const { error } = line;
            return locale.aiAssistantFailed(error instanceof Error && error.message ? error.message : locale.aiAssistantUnknownError);
        }
    }
}

/** Calls a consumer callback; a throw is warned about (development) and otherwise ignored. */
function notify<T>(callback: ((value: T) => void) | undefined, value: T, name: string): void {
    if (!callback) return;
    const result = attempt(() => callback(value));
    if (!result.ok && process.env.NODE_ENV !== 'production') console.warn(`[OpenGridX] ${name} threw.`, result.error);
}

/**
 * The `aiAssistant` prompt panel: open state, the request (with Stop), applying a validated reply as
 * one undoable step, chips, Undo, the session's prompts and the status line. Results are applied only
 * when their `state` carries the brand of `validateGridAiState`. Installs `apiRef.openAiAssistant` /
 * `closeAiAssistant`.
 */
export function useGridAiAssistant(params: UseGridAiAssistantParams): UseGridAiAssistantResult {
    const { apiRef, options, columns, localeText } = params;
    const locale = useMemo(() => resolveGridLocale(localeText), [localeText]);
    const enabled = Boolean(options);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<GridAiAssistantStatus>('idle');
    const [statusLine, setStatusLine] = useState<StatusLine>(NO_STATUS);
    const statusText = statusLineText(statusLine, locale);
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<GridAiValidationError[]>(NO_ERRORS);
    const [applied, setApplied] = useState<Applied | null>(null);
    const [history, setHistory] = useState<GridAiHistoryEntry[]>([]);

    const controllerRef = useRef<AbortController | null>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const latestRef = useRef({ params, applied, history, open });
    useLayoutEffect(() => {
        latestRef.current = { params, applied, history, open };
    });

    const labelOf = useMemo(() => {
        const byField = new Map(columns.map((col) => [col.field, col.headerName || col.field]));
        return (field: string) => byField.get(field) ?? field;
    }, [columns]);
    const chipTexts = useMemo(() => aiChipTextsOf(locale), [locale]);
    const chips = useMemo(() => (applied ? buildAiChips(applied.state, labelOf, chipTexts) : []), [applied, labelOf, chipTexts]);

    const abortRequest = useCallback(() => {
        const controller = controllerRef.current;
        controllerRef.current = null;
        if (controller) controller.abort();
    }, []);

    // Abort a running request when the grid unmounts.
    useEffect(() => abortRequest, [abortRequest]);

    const openPanel = useCallback((trigger?: HTMLElement | null) => {
        if (!latestRef.current.params.options) return;
        const active = typeof document === 'undefined' ? null : document.activeElement;
        returnFocusRef.current = trigger ?? (active instanceof HTMLElement ? active : null);
        setOpen(true);
    }, []);

    const closePanel = useCallback(() => {
        if (controllerRef.current) {
            abortRequest();
            setStatus('stopped');
            setStatusLine(STOPPED);
        }
        setOpen(false);
        const target = returnFocusRef.current;
        returnFocusRef.current = null;
        if (target && target.isConnected) target.focus();
    }, [abortRequest]);

    const togglePanel = useCallback((trigger?: HTMLElement | null) => {
        if (latestRef.current.open) closePanel();
        else openPanel(trigger);
    }, [openPanel, closePanel]);

    const fail = useCallback((line: StatusLine, error: unknown) => {
        setStatus('error');
        setStatusLine(line);
        setMessage(null);
        setErrors(NO_ERRORS);
        notify(latestRef.current.params.onError, error, 'onAiAssistantError');
    }, []);

    const applyResult = useCallback((prompt: string, result: GridAiPromptResult) => {
        const { params: current } = latestRef.current;
        const isObject = typeof result === 'object' && result !== null;
        if (!isObject || !isGridAiValidated(result.state)) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[OpenGridX] aiAssistant: the onPrompt result was not applied because its state was not validated. Return the result of createGridAiPromptHandler, or pass the model reply through validateGridAiState (from @opencorestack/opengridx/ai) and return its state.');
            }
            fail(NOT_VALIDATED_STATUS, new Error(NOT_VALIDATED));
            return;
        }
        const allowed = pickAllowedParts(result.state, current.options?.parts ?? AI_PARTS);
        const ignored = [...(Array.isArray(result.errors) ? result.errors : []), ...allowed.errors];
        const state = dropEmptiedParts(allowed.state, ignored);
        const api = apiRef.current;
        const previous = snapshotParts(state, api.getGridAiState());
        applyGridAiState(api, effectiveState(state, previous));
        setApplied({ state, previous });
        setErrors(ignored);
        setMessage(typeof result.message === 'string' && result.message ? result.message : null);
        setHistory((list) => [...list, { prompt, applied: state }]);
        setStatus('applied');
        setStatusLine({ kind: 'applied', count: buildAiChips(state, (f) => f).length, ignored: ignored.length });
        notify(current.onApply, result, 'onAiAssistantApply');
    }, [apiRef, fail]);

    const submit = useCallback((text: string) => {
        const prompt = text.trim();
        const { params: current, history: earlier } = latestRef.current;
        const onPrompt = current.options?.onPrompt;
        if (!prompt || !onPrompt) return;
        abortRequest();
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus('running');
        setStatusLine(THINKING);
        setMessage(null);
        setErrors(NO_ERRORS);
        const context = { currentState: apiRef.current.getGridAiState(), history: earlier, signal: controller.signal };
        const call = attempt(() => onPrompt(prompt, context));
        const pending = call.ok ? Promise.resolve(call.value) : Promise.reject(call.error);
        pending.then(
            (result) => {
                if (controllerRef.current !== controller) return;
                controllerRef.current = null;
                applyResult(prompt, result);
            },
            (error: unknown) => {
                if (controllerRef.current !== controller) return;
                controllerRef.current = null;
                if (controller.signal.aborted || isAbortError(error)) {
                    setStatus('stopped');
                    setStatusLine(STOPPED);
                    return;
                }
                fail({ kind: 'failed', error }, error);
            },
        );
    }, [apiRef, abortRequest, applyResult, fail]);

    const stop = useCallback(() => {
        if (!controllerRef.current) return;
        abortRequest();
        setStatus('stopped');
        setStatusLine(STOPPED);
    }, [abortRequest]);

    const undo = useCallback(() => {
        const last = latestRef.current.applied;
        if (!last) return;
        applyGridAiState(apiRef.current, last.previous);
        setApplied(null);
        setErrors(NO_ERRORS);
        setMessage(null);
        setStatus('idle');
        setStatusLine(UNDONE);
    }, [apiRef]);

    const removeChip = useCallback((id: string) => {
        const last = latestRef.current.applied;
        if (!last) return;
        const state = removeAiChip(last.state, id);
        applyGridAiState(apiRef.current, effectiveState(state, last.previous));
        setApplied({ state, previous: last.previous });
        setStatusLine(REMOVED);
    }, [apiRef]);

    useLayoutEffect(() => {
        const api = apiRef.current;
        api.openAiAssistant = () => openPanel();
        api.closeAiAssistant = () => {
            if (latestRef.current.open) closePanel();
        };
    }, [apiRef, openPanel, closePanel]);

    const isOpen = enabled && open;
    const panelProps = useMemo<GridAiAssistantPanelProps | null>(() => {
        if (!isOpen || !options) return null;
        return {
            status,
            statusText,
            message,
            errors,
            chips,
            history,
            suggestions: options.suggestions ?? NO_SUGGESTIONS,
            placeholder: options.placeholder ?? locale.aiAssistantPlaceholder,
            voiceAvailable: options.voice !== false && hasSpeechRecognition(),
            canUndo: applied !== null,
            submit,
            stop,
            undo,
            removeChip,
            close: closePanel,
        };
    }, [isOpen, options, status, statusText, message, errors, chips, history, applied, submit, stop, undo, removeChip, closePanel, locale]);

    return {
        enabled,
        open: isOpen,
        openPanel,
        togglePanel,
        closePanel,
        panelProps,
        announcement: enabled ? statusText : '',
    };
}
