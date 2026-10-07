
import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    indeterminate?: boolean;
    label?: string;
    /** A ref to the `<input>`; the forwarded `ref` reaches it as well. */
    inputRef?: React.Ref<HTMLInputElement>;
    /** Classes added to the `<input>` itself, next to `ogx-checkbox__input`. `className` goes to the wrapper `<label>`. */
    inputClassName?: string;
}

/** Points a callback or object ref at `element`. Outside the component, so it does not mutate a prop in render scope. */
function assignRef(ref: React.Ref<HTMLInputElement> | undefined, element: HTMLInputElement | null): void {
    if (typeof ref === 'function') {
        ref(element);
    } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
}

/**
 * A styled checkbox: a visually hidden `<input type="checkbox">` inside a `<label>`. Other props
 * (`onChange`, `onMouseDown`, `tabIndex`, `aria-*`, …) go to the `<input>`, and so does `ref`.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
    indeterminate = false,
    label,
    className = '',
    inputClassName = '',
    inputRef,
    ...props
}, forwardedRef) {
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    const setRef = React.useCallback((element: HTMLInputElement | null) => {
        internalRef.current = element;

        assignRef(inputRef, element);
        assignRef(forwardedRef, element);
    }, [inputRef, forwardedRef]);

    React.useEffect(() => {
        if (internalRef.current) {
            internalRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const wrapperClassNames = [
        'ogx-checkbox-wrapper',
        props.disabled && 'ogx-checkbox-wrapper--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <label className={wrapperClassNames}>
            {/* No fallback aria-label: it would override the name from `label`, a <label htmlFor>
                or aria-labelledby. Pass `label` or `aria-label` when nothing else names it. */}
            <input
                ref={setRef}
                type="checkbox"
                className={['ogx-checkbox__input', inputClassName].filter(Boolean).join(' ')}
                {...props}
            />
            <span className="ogx-checkbox__box">
                {props.checked && !indeterminate && (
                    <svg className="ogx-checkbox__icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                )}
                {indeterminate && (
                    <svg className="ogx-checkbox__icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 13H5v-2h14v2z" />
                    </svg>
                )}
            </span>
            {label && <span className="ogx-checkbox__label">{label}</span>}
        </label>
    );
});

Checkbox.displayName = 'Checkbox';
