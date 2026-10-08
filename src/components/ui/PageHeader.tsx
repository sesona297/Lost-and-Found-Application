import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
