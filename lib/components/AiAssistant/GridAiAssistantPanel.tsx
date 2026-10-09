import React, { useEffect, useRef, useState } from 'react';
import type { GridAiAssistantPanelProps } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSpeechInput } from './useSpeechInput';

/** The sparkle of the Ask AI button and the panel title. */
export function AiSparkleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
        </svg>
    );
}

function MicIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
    );
}

/**
 * The built-in `aiAssistant` panel: prompt input (Enter sends), suggestions, microphone where the
 * browser has speech recognition, Stop while a request runs, the reply, the applied changes as
 * removable chips with Undo, what was ignored, and the session's earlier prompts.
 */
export function GridAiAssistantPanel(props: GridAiAssistantPanelProps) {
    const {
        status, statusText, message, errors, chips, history, suggestions, placeholder, voiceAvailable, canUndo,
        submit, stop, undo, removeChip, close,
    } = props;
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const speech = useSpeechInput(setText);
    const running = status === 'running';

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const send = (prompt: string) => {
        setText(prompt);
        submit(prompt);
    };

    // The control a click acts on goes away (Stop, a chip, Undo): focus stays in the panel.
    const thenFocusInput = (action: () => void) => () => {
        action();
        if (inputRef.current) inputRef.current.focus();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!running) submit(text);
    };

    return (
        <div className="ogx-ai-panel" role="dialog" aria-label="Ask AI">
            <div className="ogx-ai-panel__header">
                <span className="ogx-ai-panel__title"><AiSparkleIcon />Ask AI</span>
                <Button size="small" className="ogx-ai-panel__close" aria-label="Close" onClick={close}>×</Button>
            </div>

            <form className="ogx-ai-panel__form" onSubmit={handleSubmit}>
                <Input
                    ref={inputRef}
                    className="ogx-ai-panel__input"
                    fullWidth
                    value={text}
                    placeholder={placeholder}
                    aria-label="Prompt"
                    autoComplete="off"
                    onChange={(event) => setText(event.target.value)}
                />
                {voiceAvailable && (
                    <Button
                        size="small"
                        variant="outlined"
                        className={`ogx-ai-panel__mic${speech.listening ? ' ogx-ai-panel__mic--on' : ''}`}
                        aria-label={speech.listening ? 'Stop dictation' : 'Dictate a prompt'}
                        aria-pressed={speech.listening}
                        onClick={speech.toggle}
                    >
                        <MicIcon />
                    </Button>
                )}
                {/* Separate keys: one reused <button> would turn into the submit button during the Stop click and submit again. */}
                {running
                    ? <Button key="stop" size="small" variant="outlined" onClick={thenFocusInput(stop)}>Stop</Button>
                    : <Button key="ask" size="small" variant="contained" color="primary" type="submit" disabled={text.trim() === ''}>Ask</Button>}
            </form>

            {suggestions.length > 0 && (
                <div className="ogx-ai-panel__suggestions" aria-label="Suggestions" role="group">
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" className="ogx-ai-panel__suggestion" disabled={running} onClick={() => send(suggestion)}>
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {statusText && <div className={`ogx-ai-panel__status ogx-ai-panel__status--${status}`}>{statusText}</div>}
            {message && <p className="ogx-ai-panel__message">{message}</p>}

            {(chips.length > 0 || canUndo) && (
                <div className="ogx-ai-panel__changes">
                    <ul className="ogx-ai-panel__chips" aria-label="Applied changes">
                        {chips.map((chip) => (
                            <li key={chip.id} className="ogx-ai-chip" data-part={chip.part}>
                                <span className="ogx-ai-chip__label">{chip.label}</span>
                                <button type="button" className="ogx-ai-chip__remove" aria-label={`Remove ${chip.label}`} onClick={thenFocusInput(() => removeChip(chip.id))}>×</button>
                            </li>
                        ))}
                    </ul>
                    {canUndo && <Button size="small" variant="outlined" className="ogx-ai-panel__undo" onClick={thenFocusInput(undo)}>Undo</Button>}
                </div>
            )}

            {errors.length > 0 && (
                <ul className="ogx-ai-panel__errors" aria-label="Ignored">
                    {errors.map((error, i) => (
                        <li key={`${error.path}:${i}`}>{error.path ? `Ignored: ${error.message}` : error.message}</li>
                    ))}
                </ul>
            )}

            {history.length > 0 && (
                <div className="ogx-ai-panel__history">
                    <div className="ogx-ai-panel__history-title">Earlier</div>
                    <ul>
                        {history.map((entry, i) => (
                            <li key={`${i}:${entry.prompt}`}>
                                <button type="button" className="ogx-ai-panel__history-item" onClick={() => setText(entry.prompt)}>{entry.prompt}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
