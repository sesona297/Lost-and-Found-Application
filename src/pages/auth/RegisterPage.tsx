import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = 'Full name is required';
    else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';

    if (!studentNumber.trim()) e.studentNumber = 'Student number is required';
    else if (!/^[0-9]{6,10}$/.test(studentNumber.trim())) e.studentNumber = 'Enter a valid student number (6–10 digits)';

    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address';

    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await register(fullName.trim(), studentNumber.trim(), email.trim(), password);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Create an account with your student email"
      footer={<>Already have an account? <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>Log in</Link></>}
    >
      {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          required
          autoFocus
        />
        <Input
          label="Student Number"
          type="text"
          name="studentNumber"
          placeholder="12345678"
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
          error={errors.studentNumber}
          required
        />
        <Input
          label="Student Email"
          type="email"
          name="email"
          placeholder="student@cput.ac.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint="Use your university email address"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
