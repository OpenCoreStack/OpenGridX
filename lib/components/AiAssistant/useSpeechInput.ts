import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { attempt } from '../../utils/attempt';

/** The part of the Web Speech API's SpeechRecognition the panel uses. */
interface SpeechRecognitionLike {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Dictation for the prompt input. The browser asks for the microphone only when `toggle` starts it
 * (a click), never on load; without speech recognition `toggle` does nothing.
 */
export function useSpeechInput(onText: (text: string) => void): { listening: boolean; toggle: () => void } {
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const onTextRef = useRef(onText);
    useLayoutEffect(() => {
        onTextRef.current = onText;
    });

    useEffect(() => () => {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        if (recognition) attempt(() => recognition.abort());
    }, []);

    const toggle = useCallback(() => {
        const running = recognitionRef.current;
        if (running) {
            attempt(() => running.stop());
            return;
        }
        const Recognition = getSpeechRecognition();
        if (!Recognition) return;
        const created = attempt(() => new Recognition());
        if (!created.ok) return;
        const recognition = created.value;
        recognition.lang = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
            const first = event.results[0];
            const transcript = first && first[0] ? first[0].transcript : '';
            if (transcript) onTextRef.current(transcript);
        };
        const done = () => {
            if (recognitionRef.current === recognition) recognitionRef.current = null;
            setListening(false);
        };
        recognition.onend = done;
        recognition.onerror = done;
        recognitionRef.current = recognition;
        setListening(true);
        if (!attempt(() => recognition.start()).ok) done();
    }, []);

    return { listening, toggle };
}
