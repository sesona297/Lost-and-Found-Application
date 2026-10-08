import { ReactNode } from 'react';

export type Color = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  color?: Color;
  children: ReactNode;
  className?: string;
}

const colorStyles: Record<Color, { bg: string; text: string }> = {
  success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  info: { bg: 'var(--color-info-light)', text: 'var(--color-info)' },
  neutral: { bg: 'var(--color-surface-alt)', text: 'var(--color-text-muted)' },
};

export default function Badge({ color = 'neutral', children, className = '' }: BadgeProps) {
  const styles = colorStyles[color];
  return (
    <span
      className={`badge ${className}`.trim()}
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {children}
    </span>
  );
}
