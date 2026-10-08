import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: { pathname?: string }; registered?: boolean } | null;
  const from = locationState?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      await refreshUser();

      if (from && from !== '/login') {
        navigate(from);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Login"
      subtitle="Sign in with your student email and password"
      footer={<>Don't have an account? <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary)' }}>Register here</Link></>}
    >
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {locationState?.registered && (
        <Alert type="success" className="mb-4">
          Account created successfully! Please log in with your email and password.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Student Email"
          type="email"
          name="email"
          placeholder="student@cput.ac.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          <Mail className="h-4 w-4" />
          Sign In
        </Button>
      </form>

      <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Are you a staff member?</p>
        <Link to="/staff-login">
          <Button variant="outline" size="sm" className="w-full">
            <Lock className="h-4 w-4" />
            Staff Login
          </Button>
        </Link>
      </div>

      <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Staff demo account:</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Staff #: STAFF001</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Password: admin1234</p>
      </div>
    </AuthLayout>
  );
}
