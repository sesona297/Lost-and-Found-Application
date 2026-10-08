import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats, fetchClaimsByStatus } from '@/services/api';
import { ClaimWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ClaimStatusBadge } from '@/components/ui/StatusBadge';
import { Package, Eye, Hand, CheckCircle, ClipboardCheck, ArrowRight, Inbox } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: bg, color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0, lostItems: 0, foundItems: 0,
    pendingClaims: 0, claimedItems: 0, returnedItems: 0,
  });
  const [pendingClaims, setPendingClaims] = useState<ClaimWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, claims] = await Promise.all([
          fetchAdminStats(),
          fetchClaimsByStatus('pending'),
        ]);
        setStats(s);
        setPendingClaims(claims.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin data:', err);
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
      <PageHeader
        title="Admin Dashboard"
        description="Overview of all items, claims, and activity across campuses."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Items" value={stats.totalItems} icon={<Package className="h-6 w-6" />} color="var(--color-primary)" bg="var(--color-surface-alt)" />
        <StatCard label="Lost Items" value={stats.lostItems} icon={<Inbox className="h-6 w-6" />} color="var(--color-error)" bg="var(--color-error-light)" />
        <StatCard label="Found Items" value={stats.foundItems} icon={<Eye className="h-6 w-6" />} color="var(--color-info)" bg="var(--color-info-light)" />
        <StatCard label="Pending Claims" value={stats.pendingClaims} icon={<ClipboardCheck className="h-6 w-6" />} color="var(--color-warning)" bg="var(--color-warning-light)" />
        <StatCard label="Claimed Items" value={stats.claimedItems} icon={<Hand className="h-6 w-6" />} color="var(--color-accent)" bg="var(--color-warning-light)" />
        <StatCard label="Returned Items" value={stats.returnedItems} icon={<CheckCircle className="h-6 w-6" />} color="var(--color-success)" bg="var(--color-success-light)" />
      </div>

      {/* Pending claims */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Pending Claims</h2>
        <Link to="/admin/claims">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </div>

      {pendingClaims.length > 0 ? (
        <div className="space-y-3">
          {pendingClaims.map((claim) => (
            <Card key={claim.id} className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm">{claim.item?.title || 'Item removed'}</h3>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Claimed by {claim.claimant?.full_name || 'Unknown'} • {new Date(claim.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <Link to={`/admin/claims`}>
                  <Button variant="outline" size="sm">
                    Review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-8 text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
            <p className="font-medium text-sm">All caught up!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>No pending claims to review.</p>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
