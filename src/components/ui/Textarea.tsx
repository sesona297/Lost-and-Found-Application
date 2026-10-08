import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          rows={4}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
