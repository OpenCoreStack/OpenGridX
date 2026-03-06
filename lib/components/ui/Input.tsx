
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    error?: boolean;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    fullWidth = false,
    error = false,
    startAdornment,
    endAdornment,
    className = '',
    ...props
}) => {
    const wrapperClassNames = [
        'ogx-input-wrapper',
        fullWidth && 'ogx-input-wrapper--full-width',
        error && 'ogx-input-wrapper--error',
        props.disabled && 'ogx-input-wrapper--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClassNames}>
            {startAdornment && (
                <div className="ogx-input__adornment ogx-input__adornment--start">
                    {startAdornment}
                </div>
            )}
            <input
                className="ogx-input"
                {...props}
            />
            {endAdornment && (
                <div className="ogx-input__adornment ogx-input__adornment--end">
                    {endAdornment}
                </div>
            )}
        </div>
    );
};
