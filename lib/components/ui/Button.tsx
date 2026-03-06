
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'text' | 'outlined' | 'contained';
    size?: 'small' | 'medium' | 'large';
    color?: 'primary' | 'secondary' | 'default';
    disabled?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'text',
    size = 'medium',
    color = 'default',
    disabled = false,
    className = '',
    children,
    ...props
}) => {
    const classNames = [
        'ogx-button',
        `ogx-button--${variant}`,
        `ogx-button--${size}`,
        `ogx-button--${color}`,
        disabled && 'ogx-button--disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
