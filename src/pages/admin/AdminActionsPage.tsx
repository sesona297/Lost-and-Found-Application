import { useEffect, useState } from 'react';
import { fetchAdminActions } from '@/services/api';
import { AdminActionWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import Badge, { type Color } from '@/components/ui/Badge';
import { History, Shield, Package, Edit, CheckCircle, XCircle } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  'Approved claim': <CheckCircle className="h-4 w-4" />,
  'Rejected claim': <XCircle className="h-4 w-4" />,
  'Updated item status': <Edit className="h-4 w-4" />,
};

const actionColors: Record<string, Color> = {
  'Approved claim': 'success',
  'Rejected claim': 'error',
  'Updated item status': 'info',
};

export default function AdminActionsPage() {
  const [actions, setActions] = useState<AdminActionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminActions();
        setActions(data);
      } catch (err) {
        console.error('Failed to load admin actions:', err);
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

  return (
    <AppLayout>
      <PageHeader title="Admin Actions" description="Audit log of all administrative actions performed by staff." />

      {actions.length > 0 ? (
        <div className="space-y-3">
          {actions.map((action) => (
            <Card key={action.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg flex-shrink-0" style={{
                  backgroundColor: actionColors[action.action] === 'success' ? 'var(--color-success-light)' :
                    actionColors[action.action] === 'error' ? 'var(--color-error-light)' : 'var(--color-info-light)',
                  color: actionColors[action.action] === 'success' ? 'var(--color-success)' :
                    actionColors[action.action] === 'error' ? 'var(--color-error)' : 'var(--color-info)',
                }}>
                  {actionIcons[action.action] || <Shield className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{action.action}</span>
                    <Badge color={actionColors[action.action] || 'neutral'}>
                      {action.action}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{action.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--color-text-light)' }}>
                    <span>By {action.admin?.full_name || 'Unknown account'}</span>
                    {action.item && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {action.item.title}
                      </span>
                    )}
                    <span>{new Date(action.created_at).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="No admin actions yet"
            description="When staff approve/reject claims or update item statuses, those actions will appear here."
          />
        </Card>
      )}
    </AppLayout>
  );
}
