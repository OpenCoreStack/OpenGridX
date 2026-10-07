
import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    indeterminate?: boolean;
    label?: string;
    inputRef?: React.Ref<HTMLInputElement>;
}

/** Points a callback or object ref at `element`. Outside the component, so it does not mutate a prop in render scope. */
function assignRef(ref: React.Ref<HTMLInputElement> | undefined, element: HTMLInputElement | null): void {
    if (typeof ref === 'function') {
        ref(element);
    } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
}

export const Checkbox: React.FC<CheckboxProps> = ({
    indeterminate = false,
    label,
    className = '',
    inputRef,
    ...props
}) => {
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    const setRef = React.useCallback((element: HTMLInputElement | null) => {
        internalRef.current = element;

        assignRef(inputRef, element);
    }, [inputRef]);

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
                className="ogx-checkbox__input"
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
};
