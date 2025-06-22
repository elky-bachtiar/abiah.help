import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, labelClassName, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn("block text-sm font-medium text-text-primary mb-1.5", labelClassName)}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'input w-full px-3 py-2 border rounded-lg text-sm transition-colors',
            'border-neutral-300 bg-white text-text-primary',
            'placeholder:text-text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            error && 'border-error focus:ring-error',
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };