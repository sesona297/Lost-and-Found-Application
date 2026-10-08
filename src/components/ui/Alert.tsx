import { ReactNode } from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
}

const alertStyles = {
  success: { bg: 'var(--color-success-light)', text: 'var(--color-success)', border: 'var(--color-success)' },
  error: { bg: 'var(--color-error-light)', text: 'var(--color-error)', border: 'var(--color-error)' },
  warning: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', border: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-light)', text: 'var(--color-info)', border: 'var(--color-info)' },
};

export default function Alert({ type = 'info', title, children, className = '' }: AlertProps) {
  const styles = alertStyles[type];
  return (
    <div
      className={`rounded-lg border-l-4 px-4 py-3 ${className}`.trim()}
      style={{ backgroundColor: styles.bg, borderLeftColor: styles.border }}
      role="alert"
    >
      {title && <p className="font-medium text-sm mb-0.5" style={{ color: styles.text }}>{title}</p>}
      <div className="text-sm" style={{ color: styles.text }}>{children}</div>
    </div>
  );
}
