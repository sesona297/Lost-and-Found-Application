import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyClaims } from '@/services/api';
import { ClaimWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import { ClaimStatusBadge } from '@/components/ui/StatusBadge';
import { ClipboardCheck, Package, Calendar, ArrowRight } from 'lucide-react';

export default function MyClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await fetchMyClaims(user.id);
        setClaims(data);
      } catch (err) {
        console.error('Failed to load claims:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Claims"
        description="Track the status of claims you've submitted for items."
      />

      {claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{claim.item?.title || 'Item removed'}</h3>
                      <ClaimStatusBadge status={claim.status} />
                    </div>
                    {claim.status === 'approved' && (
                      <Alert type="success" className="mt-3">Your claim was approved. Collect the item from designated university staff, not directly from the finder.</Alert>
                    )}
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      {claim.item?.category} • {claim.item?.location}
                    </p>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="font-medium">Reason:</span> {claim.reason}
                    </p>
                    {claim.verification_notes && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="font-medium">Staff notes:</span> {claim.verification_notes}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--color-text-light)' }}>
                      <Calendar className="h-3 w-3" />
                      Submitted {new Date(claim.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                {claim.item && (
                  <Link to={`/items/${claim.item.id}`}>
                    <Button variant="outline" size="sm">
                      View Item
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8" />}
            title="No claims submitted yet"
            description="When you find an item that belongs to you, submit a claim from the item's detail page."
            action={
              <Link to="/find-items">
                <Button variant="primary" size="sm">Browse Items</Button>
              </Link>
            }
          />
        </Card>
      )}
    </AppLayout>
  );
}
