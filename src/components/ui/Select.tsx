import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = '', id, placeholder, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
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

Select.displayName = 'Select';
export default Select;
