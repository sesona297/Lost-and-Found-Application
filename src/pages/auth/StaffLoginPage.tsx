import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { staffLogin } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Shield } from 'lucide-react';

export default function StaffLoginPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [staffNumber, setStaffNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await staffLogin(staffNumber.trim(), password);
      await refreshUser();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid staff number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Staff Login"
      subtitle="Sign in with your staff number and password"
      footer={<>Are you a student? <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>Student login</Link></>}
    >
      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Staff Number"
          type="text"
          name="staffNumber"
          placeholder="STAFF001"
          value={staffNumber}
          onChange={(e) => setStaffNumber(e.target.value)}
          required
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
          <Shield className="h-4 w-4" />
          Staff Sign In
        </Button>
      </form>

      <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Staff demo account:</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Staff #: STAFF001</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Password: admin1234</p>
      </div>
    </AuthLayout>
  );
}
