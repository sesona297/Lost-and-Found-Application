import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <header className="px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm">Uni Lost & Found</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-6 sm:p-8 animate-fade-in">
            <h1 className="text-2xl font-bold text-center mb-1">{title}</h1>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
            {children}
          </div>
          {footer && <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}
