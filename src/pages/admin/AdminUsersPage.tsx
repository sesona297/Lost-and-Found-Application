import { useEffect, useState } from 'react';
import { fetchAllProfiles } from '@/services/api';
import { Profile } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { Calendar, Shield, GraduationCap } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllProfiles();
        setUsers(data as Profile[]);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  const studentCount = users.filter((u) => u.role === 'student').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <AppLayout>
      <PageHeader title="Users" description="All registered students and staff in the system." />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <GraduationCap className="h-4 w-4" />
          {studentCount} Students
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Shield className="h-4 w-4" />
          {adminCount} Staff
        </div>
      </div>

      <Table
        columns={[
          {
            key: 'full_name',
            label: 'Name',
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                  {row.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-medium text-sm">{row.full_name || 'Unnamed'}</span>
              </div>
            ),
          },
          {
            key: 'email',
            label: 'Email',
            render: (row) => <span className="text-sm">{row.email}</span>,
          },
          {
            key: 'identifier',
            label: 'Identifier',
            render: (row) => (
              <span className="text-sm">
                {row.student_number ? `Student #${row.student_number}` : row.staff_number ? `Staff #${row.staff_number}` : '—'}
              </span>
            ),
          },
          {
            key: 'role',
            label: 'Role',
            render: (row) => (
              <Badge color={row.role === 'admin' ? 'info' : 'neutral'}>
                {row.role === 'admin' ? 'Staff' : 'Student'}
              </Badge>
            ),
          },
          {
            key: 'created_at',
            label: 'Joined',
            render: (row) => (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar className="h-3 w-3" />
                {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ),
          },
        ]}
        data={users}
        emptyMessage="No users registered yet."
      />
    </AppLayout>
  );
}
