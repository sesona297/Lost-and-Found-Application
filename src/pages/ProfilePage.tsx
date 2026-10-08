import { FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/auth';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(user!.id, { full_name: fullName.trim(), phone: phone.trim() || null });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Profile" description="Manage your account information." />

      <div className="max-w-2xl">
        <Card className="p-6">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.full_name}</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>
                {user?.role === 'admin' ? 'Staff/Admin' : 'Student'}
              </p>
            </div>
          </div>

          {success && <Alert type="success" className="mb-4">Profile updated successfully.</Alert>}
          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              hint="Email cannot be changed"
            />
            {user?.student_number && (
              <Input
                label="Student Number"
                type="text"
                value={user.student_number}
                disabled
                hint="Student number cannot be changed"
              />
            )}
            {user?.staff_number && (
              <Input
                label="Staff Number"
                type="text"
                value={user.staff_number}
                disabled
              />
            )}
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="e.g. 0821234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              hint="Used by staff to contact you about claims"
            />

            <div className="pt-2">
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
