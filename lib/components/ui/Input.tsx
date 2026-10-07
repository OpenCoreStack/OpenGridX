import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    error?: boolean;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    /** Classes added to the `<input>` itself, next to `ogx-input`. `className` goes to the wrapper. */
    inputClassName?: string;
    /**
     * `'field'` (default): a bordered form field. `'cell'`: fills a grid cell with no border,
     * background or focus ring, in the cell's font, for use in `renderEditCell`.
     */
    variant?: 'field' | 'cell';
}

/**
 * A text field: an `<input>` inside an `.ogx-input-wrapper` that holds the adornments.
 * `ref` reaches the `<input>` (React 18 and 19).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({
    fullWidth = false,
    error = false,
    startAdornment,
    endAdornment,
    className = '',
    inputClassName = '',
    variant = 'field',
    ...props
}, ref) {
    const wrapperClassNames = [
        'ogx-input-wrapper',
        variant === 'cell' && 'ogx-input-wrapper--cell',
        fullWidth && 'ogx-input-wrapper--full-width',
        error && 'ogx-input-wrapper--error',
        props.disabled && 'ogx-input-wrapper--disabled',
        className
    ].filter(Boolean).join(' ');

    const inputClassNames = ['ogx-input', inputClassName].filter(Boolean).join(' ');

    return (
        <div className={wrapperClassNames}>
            {startAdornment && (
                <div className="ogx-input__adornment ogx-input__adornment--start">
                    {startAdornment}
                </div>
            )}
            <input
                ref={ref}
                className={inputClassNames}
                aria-invalid={error ? true : undefined}
                {...props}
            />
            {endAdornment && (
                <div className="ogx-input__adornment ogx-input__adornment--end">
                    {endAdornment}
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';
